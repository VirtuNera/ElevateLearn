import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export const rateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    
    if (!store[key] || now > store[key].resetTime) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
    } else {
      store[key].count++;
    }
    
    if (store[key].count > maxRequests) {
      return res.status(429).json({
        message: 'Too many requests, please try again later.',
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
      });
    }
    
    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, maxRequests - store[key].count).toString(),
      'X-RateLimit-Reset': new Date(store[key].resetTime).toISOString(),
    });
    
    next();
  };
};

// Clean up expired entries every hour
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (now > store[key].resetTime) {
      delete store[key];
    }
  });
}, 60 * 60 * 1000);
