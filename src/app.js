import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { swaggerUI } from '@hono/swagger-ui';
import env from '@/config/env.js';
import { requestId } from '@/middlewares/requestId.js';
import { logger } from '@/middlewares/logger.js';
import { errorHandler } from '@/middlewares/errorHandler.js';
import { rateLimit } from '@/middlewares/rateLimit.js';
import routes from '@/routes/index.js';

// Create Hono app
const app = new Hono();

// OpenAPI specification
const openApiSpec = {
    openapi: '3.0.0',
    info: {
        title: 'Hono REST API',
        version: '1.0.0',
        description: 'Production-ready REST API boilerplate using Hono with Bun',
    },
    servers: [
        { url: `http://localhost:${env.PORT}`, description: 'Local server' },
    ],
    paths: {
        '/health': {
            get: {
                tags: ['Health'],
                summary: 'Health check',
                responses: {
                    200: { description: 'Service is healthy' },
                    503: { description: 'Service is degraded' },
                },
            },
        },
        '/api/v1/users': {
            get: {
                tags: ['Users'],
                summary: 'List all users',
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
                    { name: 'sort', in: 'query', schema: { type: 'string' }, description: 'Sort field, prefix with - for DESC' },
                    { name: 'search', in: 'query', schema: { type: 'string' } },
                ],
                responses: {
                    200: { description: 'List of users with pagination' },
                },
            },
            post: {
                tags: ['Users'],
                summary: 'Create a new user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'email', 'password'],
                                properties: {
                                    name: { type: 'string', minLength: 2 },
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string', minLength: 6 },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: { description: 'User created' },
                    400: { description: 'Validation error' },
                    409: { description: 'Email already exists' },
                },
            },
        },
        '/api/v1/users/{id}': {
            get: {
                tags: ['Users'],
                summary: 'Get user by ID',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
                ],
                responses: {
                    200: { description: 'User details' },
                    404: { description: 'User not found' },
                },
            },
            patch: {
                tags: ['Users'],
                summary: 'Update user',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
                ],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string', minLength: 6 },
                                    isActive: { type: 'boolean' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: 'User updated' },
                    404: { description: 'User not found' },
                },
            },
            delete: {
                tags: ['Users'],
                summary: 'Delete user',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
                ],
                responses: {
                    200: { description: 'User deleted' },
                    404: { description: 'User not found' },
                },
            },
        },
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
};

// Serve OpenAPI spec
app.get('/openapi.json', (c) => c.json(openApiSpec));

// Swagger UI
app.get('/docs', swaggerUI({ url: '/openapi.json' }));

// Global middlewares (order matters!)
app.use('*', secureHeaders());
app.use('*', cors({
    origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(','),
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposeHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    maxAge: 86400,
}));
app.use('*', errorHandler());
app.use('*', requestId());
app.use('*', logger());
app.use('*', rateLimit());

// Mount routes
app.route('/', routes);

// 404 handler
app.notFound((c) => {
    return c.json({
        success: false,
        error: {
            message: 'Not found',
            code: 'NOT_FOUND',
        },
        requestId: c.get('requestId'),
    }, 404);
});

export default app;
