import { Redis } from '@upstash/redis';
import logger from '../utils/logger.js';
import { isPlaceholder } from '../utils/isPlaceholder.js';

let redis = null;

export const getRedis = () => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (isPlaceholder(url) || isPlaceholder(token)) {
    return null;
  }

  if (!redis) {
    if (process.env.REDIS_TLS_INSECURE === 'true') {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }
    redis = new Redis({ url, token });
  }
  return redis;
};

export const invalidateCatalogCache = async () => {
  const client = getRedis();
  if (!client) return;
  try {
    await client.del('catalog:all');
    logger.info('Cache invalidated: catalog:all');
  } catch (err) {
    logger.warn(`Cache invalidation failed: ${err.message}`);
  }
};
