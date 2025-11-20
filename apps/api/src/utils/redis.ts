import Redis from 'ioredis';
import { config } from './config.js';
import { logger } from './logger.js';

export const redis = new Redis(config.redis.url, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    logger.warn(`Redis connection retry attempt ${times}, delay: ${delay}ms`);
    return delay;
  },
});

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

redis.on('error', (err) => {
  logger.error({ err }, 'Redis connection error');
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

// Utility functions for caching
export const cacheGet = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    logger.error({ err, key }, 'Cache get error');
    return null;
  }
};

export const cacheSet = async (
  key: string,
  value: unknown,
  expiresIn?: number
): Promise<void> => {
  try {
    const stringified = JSON.stringify(value);
    if (expiresIn) {
      await redis.setex(key, expiresIn, stringified);
    } else {
      await redis.set(key, stringified);
    }
  } catch (err) {
    logger.error({ err, key }, 'Cache set error');
  }
};

export const cacheDel = async (key: string): Promise<void> => {
  try {
    await redis.del(key);
  } catch (err) {
    logger.error({ err, key }, 'Cache delete error');
  }
};

export const cacheDelPattern = async (pattern: string): Promise<void> => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    logger.error({ err, pattern }, 'Cache delete pattern error');
  }
};
