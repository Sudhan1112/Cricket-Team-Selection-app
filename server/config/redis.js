const { createClient } = require('redis');

// In-memory fallback storage
const memoryStore = new Map();

// Mock Redis client for development
const mockRedisClient = {
  isConnected: false,

  async get(key) {
    return memoryStore.get(key) || null;
  },

  async set(key, value, options = {}) {
    memoryStore.set(key, value);
    if (options.EX) {
      // Simulate expiration (simplified)
      setTimeout(() => {
        memoryStore.delete(key);
      }, options.EX * 1000);
    }
    return 'OK';
  },

  async del(key) {
    return memoryStore.delete(key) ? 1 : 0;
  },

  async exists(key) {
    return memoryStore.has(key) ? 1 : 0;
  },

  async keys(pattern) {
    const keys = Array.from(memoryStore.keys());
    if (pattern === '*') return keys;
    // Simple pattern matching for development
    const regex = new RegExp(pattern.replace('*', '.*'));
    return keys.filter(key => regex.test(key));
  },

  async disconnect() {
    memoryStore.clear();
  }
};

let redisClient;

// Try to connect to Redis, fallback to memory store
(async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 5000,
        lazyConnect: true
      }
    });

    redisClient.on('error', (err) => {
      console.warn('Redis Client Error (using memory fallback):', err.message);
    });

    await redisClient.connect();
    console.log('✅ Connected to Redis');

  } catch (error) {
    console.warn('⚠️  Redis not available, using in-memory storage for development');
    redisClient = mockRedisClient;
  }
})();

module.exports = redisClient;