import { verifyToken } from '@/utils/jwt.js';
import { unauthorized } from '@/utils/response.js';

/**
 * JWT Authentication middleware
 * Verifies Bearer token from Authorization header
 * 
 * @param {object} options - Middleware options
 * @param {Array<string>} options.exclude - Paths to exclude from auth
 */
export function authJwt(options = {}) {
    const { exclude = [] } = options;

    return async (c, next) => {
        const path = c.req.path;

        // Skip auth for excluded paths
        if (exclude.some((p) => path.startsWith(p))) {
            return await next();
        }

        // Get Authorization header
        const authHeader = c.req.header('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return unauthorized(c, 'Missing or invalid authorization header');
        }

        const token = authHeader.slice(7); // Remove 'Bearer ' prefix

        try {
            const payload = await verifyToken(token);

            // Store user info in context
            c.set('user', payload);
            c.set('userId', payload.sub || payload.id);

            await next();
        } catch (err) {
            console.error('JWT verification failed:', err.message);
            return unauthorized(c, 'Invalid or expired token');
        }
    };
}
