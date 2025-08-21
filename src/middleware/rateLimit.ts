import { NextRequest, NextResponse } from 'next/server';
import { LRUCache } from 'lru-cache';

// Rate limit storage using LRU cache
const rateLimiters = new Map<string, LRUCache<string, number[]>>();

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
}

export function createRateLimiter(config: RateLimitConfig) {
  const cache = new LRUCache<string, number[]>({
    max: 10000, // Maximum number of items in cache
    ttl: config.windowMs, // Time to live in ms
  });

  return async function rateLimitMiddleware(request: NextRequest) {
    // Get identifier (IP address or API key)
    const apiKeyId = request.headers.get('X-API-Key-Id');
    const identifier = apiKeyId || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
    
    // Get current timestamp
    const now = Date.now();
    
    // Get request timestamps for this identifier
    const timestamps = cache.get(identifier) || [];
    
    // Remove old timestamps outside the window
    const validTimestamps = timestamps.filter(
      timestamp => now - timestamp < config.windowMs
    );
    
    // Check if limit exceeded
    if (validTimestamps.length >= config.max) {
      const resetTime = Math.min(...validTimestamps) + config.windowMs;
      
      return NextResponse.json(
        { error: config.message || 'Too many requests, please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': config.max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(resetTime).toISOString(),
            'Retry-After': Math.ceil((resetTime - now) / 1000).toString(),
          },
        }
      );
    }
    
    // Add current timestamp
    validTimestamps.push(now);
    cache.set(identifier, validTimestamps);
    
    // Calculate remaining requests
    const remaining = config.max - validTimestamps.length;
    const resetTime = validTimestamps[0] + config.windowMs;
    
    // Add rate limit headers to response
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', config.max.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString());
    
    return response;
  };
}

// Predefined rate limiters
export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.REQUESTS_PER_MINUTE || '60'),
  message: 'Too many API requests, please try again later.',
});

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many authentication attempts, please try again later.',
});

export const emailRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: parseInt(process.env.REQUESTS_PER_HOUR || '1000'),
  message: 'Email sending limit exceeded, please try again later.',
});