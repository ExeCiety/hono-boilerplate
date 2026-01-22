import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
import env from '@/config/env.js';

/**
 * Global error handler middleware
 * Catches all errors and returns consistent error response
 */
export function errorHandler() {
    return async (c, next) => {
        try {
            await next();
        } catch (err) {
            const requestId = c.get('requestId');

            // Log the error (but not sensitive data)
            console.error(JSON.stringify({
                level: 'error',
                type: 'error',
                requestId,
                message: err.message,
                stack: env.isDev() ? err.stack : undefined,
                timestamp: new Date().toISOString(),
            }));

            // Handle Zod validation errors
            if (err instanceof ZodError) {
                return c.json({
                    success: false,
                    error: {
                        message: 'Validation failed',
                        code: 'VALIDATION_ERROR',
                        details: err.errors.map((e) => ({
                            field: e.path.join('.'),
                            message: e.message,
                        })),
                    },
                    requestId,
                }, 400);
            }

            // Handle HTTP exceptions from Hono
            if (err instanceof HTTPException) {
                return c.json({
                    success: false,
                    error: {
                        message: err.message,
                        code: 'HTTP_ERROR',
                    },
                    requestId,
                }, err.status);
            }

            // Handle all other errors
            const status = err.status || err.statusCode || 500;
            const message = env.isProd() && status === 500
                ? 'Internal server error'
                : err.message;

            return c.json({
                success: false,
                error: {
                    message,
                    code: err.code || 'INTERNAL_ERROR',
                },
                requestId,
            }, status);
        }
    };
}
