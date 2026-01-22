import { Hono } from 'hono';
import userRoutes from '@/modules/user/user.routes.js';
import { checkDbHealth } from '@/db/index.js';
import { success } from '@/utils/response.js';

const routes = new Hono();

/**
 * Health check endpoint
 * GET /health
 */
routes.get('/health', async (c) => {
    const dbHealthy = await checkDbHealth();

    const health = {
        status: dbHealthy ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
            database: dbHealthy ? 'connected' : 'disconnected',
        },
    };

    const status = dbHealthy ? 200 : 503;
    return c.json({ success: true, data: health }, status);
});

/**
 * API v1 routes
 */
const v1 = new Hono();

// Mount user routes
v1.route('/users', userRoutes);

// Mount v1 under /api/v1
routes.route('/api/v1', v1);

export default routes;
