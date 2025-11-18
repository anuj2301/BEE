// Jest setup file
// This file runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.MONGO_URL = 'mongodb://localhost:27017/linkshort-test';

// Set longer timeout for async operations
jest.setTimeout(10000);
