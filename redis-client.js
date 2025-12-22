// Redis client configuration for Upstash
const Redis = require('ioredis');

// Create Redis client with Upstash Cloud Redis
// Use REDIS_URL for Upstash connection string
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  family: 0, // Use IPv4 and IPv6
  tls: process.env.REDIS_URL ? {
    rejectUnauthorized: false
  } : undefined,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableOfflineQueue: false,
  connectTimeout: 10000,
});

redis.on('connect', () => {
  console.log('✓ Upstash Redis connected');
});

redis.on('error', (err) => {
  console.log('Upstash Redis connection error:', err.message);
});

// Session management helper functions
const cache = {
  // Store active session (token -> user data)
  // TTL matches JWT expiration (1 hour)
  async setSession(token, userData, ttl = 3600) {
    try {
      await redis.setex(`session:${token}`, ttl, JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Redis set session error:', error);
      return false;
    }
  },

  // Get session data by token
  async getSession(token) {
    try {
      const cached = await redis.get(`session:${token}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Redis get session error:', error);
      return null;
    }
  },

  // Delete session (logout)
  async deleteSession(token) {
    try {
      await redis.del(`session:${token}`);
      return true;
    } catch (error) {
      console.error('Redis delete session error:', error);
      return false;
    }
  },

  // Store refresh token (optional - for refresh token pattern)
  async setRefreshToken(userId, refreshToken, ttl = 604800) { // 7 days
    try {
      await redis.setex(`refresh:${userId}`, ttl, refreshToken);
      return true;
    } catch (error) {
      console.error('Redis set refresh token error:', error);
      return false;
    }
  },

  // Get refresh token
  async getRefreshToken(userId) {
    try {
      return await redis.get(`refresh:${userId}`);
    } catch (error) {
      console.error('Redis get refresh token error:', error);
      return null;
    }
  },

  // Invalidate all sessions for a user (logout from all devices)
  async invalidateUserSessions(userId) {
    try {
      const keys = await redis.keys(`session:*`);
      const pipeline = redis.pipeline();
      
      for (const key of keys) {
        const session = await redis.get(key);
        if (session) {
          const data = JSON.parse(session);
          if (data.id === userId) {
            pipeline.del(key);
          }
        }
      }
      
      await pipeline.exec();
      await redis.del(`refresh:${userId}`);
      return true;
    } catch (error) {
      console.error('Redis invalidate user sessions error:', error);
      return false;
    }
  },

  // Check if token is blacklisted (for additional security)
  async isTokenBlacklisted(token) {
    try {
      const exists = await redis.exists(`blacklist:${token}`);
      return exists === 1;
    } catch (error) {
      console.error('Redis check blacklist error:', error);
      return false;
    }
  },

  // Add token to blacklist (when changing password, etc.)
  async blacklistToken(token, ttl = 3600) {
    try {
      await redis.setex(`blacklist:${token}`, ttl, '1');
      return true;
    } catch (error) {
      console.error('Redis blacklist token error:', error);
      return false;
    }
  },

  // Get all keys matching pattern (for debugging)
  async getKeys(pattern = '*') {
    try {
      return await redis.keys(pattern);
    } catch (error) {
      console.error('Redis keys error:', error);
      return [];
    }
  },

  // Clear all cache
  async flushAll() {
    try {
      await redis.flushall();
      return true;
    } catch (error) {
      console.error('Redis flush error:', error);
      return false;
    }
  }
};

module.exports = { redis, cache };
