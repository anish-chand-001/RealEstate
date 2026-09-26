import { createHash } from 'node:crypto';
import RateLimitBucket from '../models/rateLimitBucket.model.js';

const incrementBucket = async (id, expiresAt) => {
  try {
    return await RateLimitBucket.findOneAndUpdate(
      { _id: id },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
      { upsert: true, new: true },
    ).select('count').lean();
  } catch (error) {
    // Concurrent first requests can race to insert the same unique _id.
    if (error.code !== 11000) throw error;
    return RateLimitBucket.findOneAndUpdate(
      { _id: id },
      { $inc: { count: 1 } },
      { new: true },
    ).select('count').lean();
  }
};

export const rateLimit = ({
  windowMs,
  max,
  name = 'default',
  message = 'Too many requests. Please try again later.',
}) => async (req, res, next) => {
  const now = Date.now();
  const windowNumber = Math.floor(now / windowMs);
  const resetAt = (windowNumber + 1) * windowMs;
  const clientIp = req.ip || req.socket?.remoteAddress || 'unknown';
  const clientKey = createHash('sha256').update(clientIp).digest('hex');
  const bucketId = `${name}:${windowNumber}:${clientKey}`;

  try {
    const bucket = await incrementBucket(bucketId, new Date(resetAt + windowMs));
    const remaining = Math.max(0, max - bucket.count);
    res.setHeader('RateLimit-Limit', max);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', Math.ceil(resetAt / 1000));

    if (bucket.count > max) {
      res.setHeader('Retry-After', Math.max(1, Math.ceil((resetAt - now) / 1000)));
      return res.status(429).json({ success: false, message });
    }
    return next();
  } catch (error) {
    console.error(`Rate limiter store unavailable (${name}):`, error.message);
    return res.status(503).json({ success: false, message: 'Request protection is temporarily unavailable. Please try again.' });
  }
};
