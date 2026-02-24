/**
 * Utility Cache sử dụng Redis
 * Hỗ trợ các thao tác cơ bản: get, set, del
 * Tự động fallback nếu không có Redis
 */

const { createClient } = require('redis');
const config = require('../config/env');
const logger = require('./logger');

let client;
let isRedisConnected = false;

if (config.redis?.url || config.redis?.host) {
  try {
    const redisUrl = config.redis.url || `redis://${config.redis.host}:${config.redis.port}`;
    client = createClient({
      url: redisUrl,
      password: config.redis.password
    });

    client.on('error', (err) => {
      logger.error('Redis Client Error', err);
      isRedisConnected = false;
    });

    client.on('connect', () => {
      logger.info('✅ Đã kết nối đến Redis');
      isRedisConnected = true;
    });

    client.connect().catch(err => {
      logger.error('Failed to connect to Redis', err);
      isRedisConnected = false;
    });
  } catch (error) {
    logger.error('Lỗi khởi tạo Redis client', error);
  }
} else {
  logger.warn('Redis chưa được cấu hình. Hệ thống sẽ chạy mà không có cache.');
}

module.exports = {
  get: async (key) => {
    if (!isRedisConnected || !client) return null;
    try {
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error(`Redis Get Error [${key}]`, error);
      return null;
    }
  },

  set: async (key, value, expirationInSeconds = 3600) => {
    if (!isRedisConnected || !client) return;
    try {
      await client.set(key, JSON.stringify(value), {
        EX: expirationInSeconds
      });
    } catch (error) {
      logger.error(`Redis Set Error [${key}]`, error);
    }
  },

  del: async (key) => {
    if (!isRedisConnected || !client) return;
    try {
      await client.del(key);
    } catch (error) {
      logger.error(`Redis Del Error [${key}]`, error);
    }
  },

  flush: async () => {
    if (!isRedisConnected || !client) return;
    try {
      await client.flushDb();
    } catch (error) {
      logger.error('Redis Flush Error', error);
    }
  }
};
