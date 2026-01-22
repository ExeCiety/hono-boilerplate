import env from '@/config/env.js';

/**
 * Structured logging middleware
 * Logs request/response info in JSON format
 */
export function logger() {
    return async (c, next) => {
        const start = Date.now();
        const requestId = c.get('requestId');
        const method = c.req.method;
        const path = c.req.path;

        // Log incoming request
        console.log(JSON.stringify({
            level: 'info',
            type: 'request',
            requestId,
            method,
            path,
            query: c.req.query(),
            userAgent: c.req.header('User-Agent'),
            timestamp: new Date().toISOString(),
        }));

        await next();

        const duration = Date.now() - start;
        const status = c.res.status;

        // Log response
        const logLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
        console.log(JSON.stringify({
            level: logLevel,
            type: 'response',
            requestId,
            method,
            path,
            status,
            duration,
            timestamp: new Date().toISOString(),
        }));
    };
}
