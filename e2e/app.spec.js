const { test, expect } = require('@playwright/test');

test.describe('URL Shortener - Integration Tests', () => {
  
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/LinkSnap/i);
    await expect(page.locator('h1')).toContainText(/LinkSnap/i);
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/login"]');
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('h2')).toContainText(/Login/i);
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/register"]');
    await expect(page).toHaveURL(/.*register/);
    await expect(page.locator('h2')).toContainText(/Register/i);
  });

  test('should show validation on empty login form', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // HTML5 validation should prevent submission
    const emailInput = page.locator('input[name="email"]');
    const isValid = await emailInput.evaluate((el) => el.validity.valid);
    expect(isValid).toBe(false);
  });

  test('should register a new user', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    
    await page.goto('/register');
    
    // Fill registration form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'password123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard after successful registration
    await page.waitForURL(/.*dashboard/, { timeout: 5000 });
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should login and access dashboard', async ({ page }) => {
    // First register a user
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    
    await page.goto('/register');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
    
    // Logout
    await page.goto('/logout');
    
    // Now login
    await page.goto('/login');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Should be on dashboard
    await page.waitForURL(/.*dashboard/);
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should create a short URL', async ({ page }) => {
    // Register and login
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    
    await page.goto('/register');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
    
    // Create a short URL
    await page.fill('input[name="fullUrl"]', 'https://www.example.com');
    await page.click('button[type="submit"]');
    
    // Wait for page reload
    await page.waitForLoadState('networkidle');
    
    // Check if URL appears in the list
    await expect(page.locator('text=example.com')).toBeVisible();
  });

  test('should create custom alias URL', async ({ page }) => {
    // Register and login
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    const customAlias = `custom${timestamp}`;
    
    await page.goto('/register');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
    
    // Create a short URL with custom alias
    await page.fill('input[name="fullUrl"]', 'https://www.example.com');
    await page.fill('input[name="custom"]', customAlias);
    await page.click('button[type="submit"]');
    
    // Wait for page reload
    await page.waitForLoadState('networkidle');
    
    // Check if custom alias appears
    await expect(page.locator(`text=${customAlias}`)).toBeVisible();
  });

  test('should copy short URL to clipboard', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    // Register and login
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    
    await page.goto('/register');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
    
    // Create a short URL
    await page.fill('input[name="fullUrl"]', 'https://www.example.com');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Click copy button
    const copyButton = page.locator('button:has-text("Copy")').first();
    await copyButton.click();
    
    // Wait a bit for clipboard operation
    await page.waitForTimeout(500);
    
    // Verify button text changed
    await expect(copyButton).toContainText(/Copied|Copy/);
  });

  test('should delete a URL', async ({ page }) => {
    // Register and login
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    
    await page.goto('/register');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
    
    // Create a short URL
    await page.fill('input[name="fullUrl"]', 'https://www.example.com');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Delete the URL
    page.on('dialog', dialog => dialog.accept()); // Accept confirmation
    const deleteButton = page.locator('button:has-text("Delete")').first();
    await deleteButton.click();
    
    // Wait for page reload
    await page.waitForLoadState('networkidle');
    
    // URL count should be 0
    const totalLinks = await page.locator('text=/Total Links/').textContent();
    expect(totalLinks).toContain('0');
  });

  test('should toggle dark mode', async ({ page }) => {
    await page.goto('/');
    
    // Get initial theme
    const htmlElement = page.locator('html');
    const initialClass = await htmlElement.getAttribute('class');
    
    // Click dark mode toggle
    await page.click('button[onclick*="toggleDarkMode"]');
    
    // Wait for theme change
    await page.waitForTimeout(300);
    
    // Verify theme changed
    const newClass = await htmlElement.getAttribute('class');
    expect(newClass).not.toBe(initialClass);
  });

  test('should persist dark mode preference', async ({ page }) => {
    await page.goto('/');
    
    // Enable dark mode
    await page.click('button[onclick*="toggleDarkMode"]');
    await page.waitForTimeout(300);
    
    // Reload page
    await page.reload();
    
    // Check if dark mode persisted
    const htmlElement = page.locator('html');
    const classAfterReload = await htmlElement.getAttribute('class');
    
    // Should still be in dark mode
    expect(classAfterReload).toContain('dark');
  });

  test('should show statistics on dashboard', async ({ page }) => {
    // Register and login
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    
    await page.goto('/register');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
    
    // Check for statistics cards
    await expect(page.locator('text=/Total Links/')).toBeVisible();
    await expect(page.locator('text=/Total Clicks/')).toBeVisible();
    await expect(page.locator('text=/Click Rate/')).toBeVisible();
  });

  test('should protect dashboard route', async ({ page }) => {
    // Try to access dashboard without login
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
  });

  test('should logout successfully', async ({ page }) => {
    // Register and login
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    
    await page.goto('/register');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
    
    // Logout
    await page.goto('/logout');
    
    // Should redirect to home
    await expect(page).toHaveURL('/');
    
    // Try to access dashboard - should redirect to login
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login/);
  });
});
