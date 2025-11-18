const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Authentication Utilities Tests', () => {
  
  describe('Password Hashing', () => {
    test('should hash a password successfully', async () => {
      const password = 'testpassword123';
      const hashed = await bcrypt.hash(password, 10);
      
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(0);
    });

    test('should compare password correctly', async () => {
      const password = 'testpassword123';
      const hashed = await bcrypt.hash(password, 10);
      
      const isMatch = await bcrypt.compare(password, hashed);
      expect(isMatch).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const password = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const hashed = await bcrypt.hash(password, 10);
      
      const isMatch = await bcrypt.compare(wrongPassword, hashed);
      expect(isMatch).toBe(false);
    });
  });

  describe('JWT Token Operations', () => {
    const SECRET = 'test-secret-key';
    
    test('should create a valid JWT token', () => {
      const payload = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com'
      };
      
      const token = jwt.sign(payload, SECRET, { expiresIn: '1h' });
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    test('should verify a valid token', () => {
      const payload = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com'
      };
      
      const token = jwt.sign(payload, SECRET, { expiresIn: '1h' });
      const decoded = jwt.verify(token, SECRET);
      
      expect(decoded.id).toBe(payload.id);
      expect(decoded.name).toBe(payload.name);
      expect(decoded.email).toBe(payload.email);
    });

    test('should reject invalid token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => {
        jwt.verify(invalidToken, SECRET);
      }).toThrow();
    });

    test('should reject token with wrong secret', () => {
      const payload = { id: '123' };
      const token = jwt.sign(payload, SECRET, { expiresIn: '1h' });
      
      expect(() => {
        jwt.verify(token, 'wrong-secret');
      }).toThrow();
    });
  });
});
