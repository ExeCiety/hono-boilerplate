import env from '@/config/env.js';

/**
 * In-memory rate limiting store
 * Key: IP address
 * Value: { count: number, resetAt: number }
 */
const store = new Map();

// Cleanup expired entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of store.entries()) {
        if (value.resetAt < now) {
            store.delete(key);
        }
    }
}, 60000); // Every minute

/**
 * Rate limiting middleware
 * Uses in-memory storage (suitable for single instance)
 * 
 * @param {object} options - Rate limit options
 * @param {number} options.max - Max requests per window
 * @param {number} options.windowMs - Time window in ms
 */
export function rateLimit(options = {}) {
    const max = options.max ?? env.RATE_LIMIT_MAX;
    const windowMs = options.windowMs || env.RATE_LIMIT_WINDOW_MS;

    return async (c, next) => {
        // If max is 0, disable rate limiting
        if (max === 0) {
            return next();
        }

        // Get client IP
        const ip = c.req.header('X-Forwarded-For')?.split(',')[0]?.trim()
            || c.req.header('X-Real-IP')
            || 'unknown';

        const now = Date.now();
        const entry = store.get(ip);

        if (!entry || entry.resetAt < now) {
            // First request or window expired
            store.set(ip, {
                count: 1,
                resetAt: now + windowMs,
            });
        } else {
            // Increment counter
            entry.count++;

            if (entry.count > max) {
                // Rate limit exceeded
                const retryAfter = Math.ceil((entry.resetAt - now) / 1000);

                c.res.headers.set('Retry-After', String(retryAfter));
                c.res.headers.set('X-RateLimit-Limit', String(max));
                c.res.headers.set('X-RateLimit-Remaining', '0');
                c.res.headers.set('X-RateLimit-Reset', String(entry.resetAt));

                return c.json({
                    success: false,
                    error: {
                        message: 'Too many requests, please try again later',
                        code: 'RATE_LIMIT_EXCEEDED',
                    },
                    requestId: c.get('requestId'),
                }, 429);
            }
        }

        // Set rate limit headers
        const currentEntry = store.get(ip);
        c.res.headers.set('X-RateLimit-Limit', String(max));
        c.res.headers.set('X-RateLimit-Remaining', String(Math.max(0, max - currentEntry.count)));
        c.res.headers.set('X-RateLimit-Reset', String(currentEntry.resetAt));

        await next();
    };
}
