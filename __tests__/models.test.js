const mongoose = require('mongoose');
const User = require('../models/user');
const Url = require('../models/url');

describe('User Model Tests', () => {
  // Test user schema validation
  test('should create a valid user', () => {
    const validUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword123'
    };

    const user = new User(validUser);
    expect(user.name).toBe(validUser.name);
    expect(user.email).toBe(validUser.email);
    expect(user.password).toBe(validUser.password);
  });

  test('should allow optional name field', () => {
    const userWithoutName = new User({
      email: 'test@example.com',
      password: 'hashedpassword123'
    });

    expect(userWithoutName.email).toBe('test@example.com');
    expect(userWithoutName.password).toBe('hashedpassword123');
  });

  test('should set email as unique', () => {
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword123'
    });

    expect(user.email).toBe('test@example.com');
    expect(user.schema.path('email').options.unique).toBe(true);
  });
});

describe('URL Model Tests', () => {
  // Test URL schema
  test('should create a valid URL', () => {
    const validUrl = {
      fullUrl: 'https://www.example.com',
      shortUrl: 'abc123',
      user: new mongoose.Types.ObjectId(),
      clicks: 0
    };

    const url = new Url(validUrl);
    expect(url.fullUrl).toBe(validUrl.fullUrl);
    expect(url.shortUrl).toBe(validUrl.shortUrl);
    expect(url.clicks).toBe(0);
  });

  test('should default clicks to 0', () => {
    const url = new Url({
      fullUrl: 'https://www.example.com',
      shortUrl: 'abc123',
      user: new mongoose.Types.ObjectId()
    });

    expect(url.clicks).toBe(0);
  });

  test('should allow optional fullUrl field', () => {
    const urlWithoutFullUrl = new Url({
      shortUrl: 'abc123',
      user: new mongoose.Types.ObjectId()
    });

    expect(urlWithoutFullUrl.shortUrl).toBe('abc123');
    expect(urlWithoutFullUrl.clicks).toBe(0);
  });

  test('should set shortUrl as unique', () => {
    const url = new Url({
      fullUrl: 'https://www.example.com',
      shortUrl: 'abc123',
      user: new mongoose.Types.ObjectId()
    });

    expect(url.shortUrl).toBe('abc123');
    expect(url.schema.path('shortUrl').options.unique).toBe(true);
  });
});
