import { getRedis } from '../config/redis.js';
import { CACHE_KEY_CATALOG, CACHE_TTL_SECONDS } from '../config/constants.js';
import logger from '../utils/logger.js';

export const cacheCatalog = async (req, res, next) => {
  const { category, ageGroup, available } = req.query;
  if (category || ageGroup || available) return next();

  const client = getRedis();
  if (!client) return next();

  try {
    const cached = await client.get(CACHE_KEY_CATALOG);
    if (cached) {
      logger.info('Cache hit: catalog:all');
      return res.json(cached);
    }
    logger.info('Cache miss: catalog:all');

    const originalJson = res.json.bind(res);
    res.json = async (body) => {
      try {
        await client.set(CACHE_KEY_CATALOG, body, { ex: CACHE_TTL_SECONDS });
      } catch (err) {
        logger.warn(`Failed to set cache: ${err.message}`);
      }
      return originalJson(body);
    };
    next();
  } catch (err) {
    logger.warn(`Cache middleware error: ${err.message}`);
    next();
  }
};
