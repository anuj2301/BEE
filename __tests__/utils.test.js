describe('URL Shortening Logic Tests', () => {
  
  describe('Short Code Generation', () => {
    
    // Function to test (simulates the one in your server.js)
    function generateShortCode() {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let shortCode = '';
      for (let i = 0; i < 6; i++) {
        shortCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return shortCode;
    }

    test('should generate a 6-character code', () => {
      const code = generateShortCode();
      expect(code).toBeDefined();
      expect(code.length).toBe(6);
    });

    test('should generate alphanumeric characters only', () => {
      const code = generateShortCode();
      const alphanumericRegex = /^[A-Za-z0-9]+$/;
      expect(alphanumericRegex.test(code)).toBe(true);
    });

    test('should generate different codes on multiple calls', () => {
      const code1 = generateShortCode();
      const code2 = generateShortCode();
      const code3 = generateShortCode();
      
      // While not guaranteed, it's extremely unlikely all three are the same
      const allSame = code1 === code2 && code2 === code3;
      expect(allSame).toBe(false);
    });

    test('should generate codes from correct character set', () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const code = generateShortCode();
      
      for (let char of code) {
        expect(chars.includes(char)).toBe(true);
      }
    });
  });

  describe('Custom Alias Validation', () => {
    
    function validateCustomAlias(alias) {
      if (!alias) return false;
      
      // Check length
      if (alias.length < 2 || alias.length > 20) {
        return false;
      }
      
      // Check valid characters (alphanumeric, hyphens, underscores)
      const validPattern = /^[a-zA-Z0-9-_]+$/;
      if (!validPattern.test(alias)) {
        return false;
      }
      
      // Check reserved words
      const reserved = ['api', 'admin', 'www', 'login', 'register', 'dashboard'];
      if (reserved.includes(alias.toLowerCase())) {
        return false;
      }
      
      return true;
    }

    test('should accept valid custom alias', () => {
      expect(validateCustomAlias('mylink')).toBe(true);
      expect(validateCustomAlias('my-link')).toBe(true);
      expect(validateCustomAlias('my_link')).toBe(true);
      expect(validateCustomAlias('link123')).toBe(true);
    });

    test('should reject too short alias', () => {
      expect(validateCustomAlias('a')).toBe(false);
    });

    test('should reject too long alias', () => {
      expect(validateCustomAlias('a'.repeat(21))).toBe(false);
    });

    test('should reject special characters', () => {
      expect(validateCustomAlias('my link')).toBe(false);
      expect(validateCustomAlias('my@link')).toBe(false);
      expect(validateCustomAlias('my.link')).toBe(false);
    });

    test('should reject reserved words', () => {
      expect(validateCustomAlias('api')).toBe(false);
      expect(validateCustomAlias('admin')).toBe(false);
      expect(validateCustomAlias('login')).toBe(false);
      expect(validateCustomAlias('register')).toBe(false);
    });

    test('should reject empty or null alias', () => {
      expect(validateCustomAlias('')).toBe(false);
      expect(validateCustomAlias(null)).toBe(false);
    });
  });

  describe('URL Validation', () => {
    
    function isValidURL(url) {
      try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
      } catch {
        return false;
      }
    }

    test('should accept valid HTTP URLs', () => {
      expect(isValidURL('http://example.com')).toBe(true);
      expect(isValidURL('https://example.com')).toBe(true);
      expect(isValidURL('https://www.example.com/path')).toBe(true);
    });

    test('should reject invalid URLs', () => {
      expect(isValidURL('not-a-url')).toBe(false);
      expect(isValidURL('ftp://example.com')).toBe(false);
      expect(isValidURL('')).toBe(false);
      expect(isValidURL('javascript:alert(1)')).toBe(false);
    });

    test('should accept URLs with query parameters', () => {
      expect(isValidURL('https://example.com?param=value')).toBe(true);
      expect(isValidURL('https://example.com/path?foo=bar&baz=qux')).toBe(true);
    });
  });

  describe('Statistics Calculation', () => {
    
    function calculateStats(urls) {
      const totalLinks = urls.length;
      const totalClicks = urls.reduce((sum, url) => sum + (url.clicks || 0), 0);
      const avgClicksPerLink = totalLinks > 0 ? (totalClicks / totalLinks).toFixed(1) : 0;
      
      return {
        totalLinks,
        totalClicks,
        avgClicksPerLink: parseFloat(avgClicksPerLink)
      };
    }

    test('should calculate stats correctly with multiple URLs', () => {
      const urls = [
        { clicks: 10 },
        { clicks: 20 },
        { clicks: 30 }
      ];
      
      const stats = calculateStats(urls);
      
      expect(stats.totalLinks).toBe(3);
      expect(stats.totalClicks).toBe(60);
      expect(stats.avgClicksPerLink).toBe(20.0);
    });

    test('should handle zero clicks', () => {
      const urls = [
        { clicks: 0 },
        { clicks: 0 }
      ];
      
      const stats = calculateStats(urls);
      
      expect(stats.totalLinks).toBe(2);
      expect(stats.totalClicks).toBe(0);
      expect(stats.avgClicksPerLink).toBe(0);
    });

    test('should handle empty URL array', () => {
      const urls = [];
      const stats = calculateStats(urls);
      
      expect(stats.totalLinks).toBe(0);
      expect(stats.totalClicks).toBe(0);
      expect(stats.avgClicksPerLink).toBe(0);
    });

    test('should handle missing clicks property', () => {
      const urls = [
        { clicks: 5 },
        { }, // missing clicks
        { clicks: 10 }
      ];
      
      const stats = calculateStats(urls);
      
      expect(stats.totalLinks).toBe(3);
      expect(stats.totalClicks).toBe(15);
      expect(stats.avgClicksPerLink).toBe(5.0);
    });
  });
});
