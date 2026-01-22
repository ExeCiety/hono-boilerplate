import { v4 as uuidv4 } from 'uuid';

/**
 * Request ID middleware
 * Generates a unique ID for each request for tracing
 */
export function requestId() {
    return async (c, next) => {
        // Use existing header if present, otherwise generate new
        const id = c.req.header('X-Request-ID') || uuidv4();

        // Store in context for later use
        c.set('requestId', id);

        // Continue to next middleware
        await next();

        // Set response header
        c.res.headers.set('X-Request-ID', id);
    };
}
