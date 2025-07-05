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
    console.log('🔧 Mock Redis set called:', { key, value: value?.length || value, options });
    try {
      memoryStore.set(key, value);
      if (options.EX) {
        console.log('⏰ Setting expiration for', options.EX, 'seconds');
        // Simulate expiration (simplified)
        setTimeout(() => {
          memoryStore.delete(key);
        }, options.EX * 1000);
      }
      console.log('✅ Mock Redis set completed successfully');
      return 'OK';
    } catch (error) {
      console.error('❌ Mock Redis set error:', error);
      throw error;
    }
  },

  async setEx(key, seconds, value) {
    console.log('🔧 Mock Redis setEx called:', { key, seconds, value });
    try {
      memoryStore.set(key, value);
      // Simulate expiration
      setTimeout(() => {
        memoryStore.delete(key);
      }, seconds * 1000);
      console.log('✅ Mock Redis setEx completed successfully');
      return 'OK';
    } catch (error) {
      console.error('❌ Mock Redis setEx error:', error);
      throw error;
    }
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

// Initialize with mock client immediately
let redisClient = mockRedisClient;

// Try to connect to Redis, fallback to memory store (non-blocking)
setTimeout(async () => {
  try {
    const realRedisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 2000,
        lazyConnect: true
      }
    });

    realRedisClient.on('error', (err) => {
      console.warn('Redis Client Error (using memory fallback):', err.message);
    });

    await realRedisClient.connect();
    console.log('✅ Connected to Redis');

    // Only replace the mock client if real Redis connection succeeds
    redisClient = realRedisClient;

  } catch (error) {
    console.warn('⚠️  Redis not available, using in-memory storage for development');
    // redisClient is already set to mockRedisClient
  }
}, 100); // Start Redis connection attempt after 100ms

module.exports = redisClient;