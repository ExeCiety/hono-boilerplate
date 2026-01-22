import { describe, test, expect, beforeAll } from 'bun:test';
import { Hono } from 'hono';
import { requestId } from '@/middlewares/requestId.js';
import { errorHandler } from '@/middlewares/errorHandler.js';
import { validate } from '@/middlewares/validate.js';
import { createUserSchema, updateUserSchema, idParamSchema } from '@/modules/user/user.schema.js';
import { success, paginated } from '@/utils/response.js';

// Create a test app with mocked controller
function createTestApp() {
    const app = new Hono();

    // Apply middlewares
    app.use('*', errorHandler());
    app.use('*', requestId());

    // Mock user data store
    const users = [
        { id: 1, name: 'Test User', email: 'test@example.com', isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { id: 2, name: 'Jane Doe', email: 'jane@example.com', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    ];
    let nextId = 3;

    // Routes
    app.get('/api/v1/users', (c) => {
        return paginated(c, users, {
            page: 1,
            limit: 10,
            total: users.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
        });
    });

    app.get('/api/v1/users/:id', validate({ params: idParamSchema }), (c) => {
        const id = parseInt(c.req.param('id'), 10);
        const user = users.find((u) => u.id === id);
        if (!user) {
            return c.json({ success: false, error: { message: 'User not found', code: 'NOT_FOUND' } }, 404);
        }
        return success(c, user);
    });

    app.post('/api/v1/users', validate({ body: createUserSchema }), (c) => {
        const body = c.get('validatedBody');
        const newUser = {
            id: nextId++,
            name: body.name,
            email: body.email,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        users.push(newUser);
        return success(c, newUser, null, 201);
    });

    app.patch('/api/v1/users/:id', validate({ params: idParamSchema, body: updateUserSchema }), (c) => {
        const id = parseInt(c.req.param('id'), 10);
        const body = c.get('validatedBody');
        const userIndex = users.findIndex((u) => u.id === id);
        if (userIndex === -1) {
            return c.json({ success: false, error: { message: 'User not found', code: 'NOT_FOUND' } }, 404);
        }
        users[userIndex] = { ...users[userIndex], ...body, updatedAt: new Date() };
        return success(c, users[userIndex]);
    });

    app.delete('/api/v1/users/:id', validate({ params: idParamSchema }), (c) => {
        const id = parseInt(c.req.param('id'), 10);
        const userIndex = users.findIndex((u) => u.id === id);
        if (userIndex === -1) {
            return c.json({ success: false, error: { message: 'User not found', code: 'NOT_FOUND' } }, 404);
        }
        users.splice(userIndex, 1);
        return success(c, { deleted: true });
    });

    return app;
}

describe('User Controller (Integration)', () => {
    let app;

    beforeAll(() => {
        app = createTestApp();
    });

    describe('GET /api/v1/users', () => {
        test('should return list of users with pagination', async () => {
            const res = await app.request('/api/v1/users');
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(body.success).toBe(true);
            expect(Array.isArray(body.data)).toBe(true);
            expect(body.meta.pagination).toBeDefined();
            expect(body.meta.pagination.total).toBeGreaterThan(0);
        });
    });

    describe('GET /api/v1/users/:id', () => {
        test('should return user when found', async () => {
            const res = await app.request('/api/v1/users/1');
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(body.success).toBe(true);
            expect(body.data.id).toBe(1);
            expect(body.data.name).toBe('Test User');
        });

        test('should return 404 when user not found', async () => {
            const res = await app.request('/api/v1/users/999');
            const body = await res.json();

            expect(res.status).toBe(404);
            expect(body.success).toBe(false);
            expect(body.error.code).toBe('NOT_FOUND');
        });

        test('should return 400 for invalid ID', async () => {
            const res = await app.request('/api/v1/users/abc');
            const body = await res.json();

            expect(res.status).toBe(400);
            expect(body.success).toBe(false);
        });
    });

    describe('POST /api/v1/users', () => {
        test('should create user with valid data', async () => {
            const res = await app.request('/api/v1/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'New User',
                    email: 'new@example.com',
                    password: 'secret123',
                }),
            });
            const body = await res.json();

            expect(res.status).toBe(201);
            expect(body.success).toBe(true);
            expect(body.data.name).toBe('New User');
            expect(body.data.email).toBe('new@example.com');
        });

        test('should return validation error for missing fields', async () => {
            const res = await app.request('/api/v1/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'New User',
                    // missing email and password
                }),
            });
            const body = await res.json();

            expect(res.status).toBe(400);
            expect(body.success).toBe(false);
            expect(body.error.details).toBeDefined();
        });

        test('should return validation error for invalid email', async () => {
            const res = await app.request('/api/v1/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'New User',
                    email: 'invalid-email',
                    password: 'secret123',
                }),
            });
            const body = await res.json();

            expect(res.status).toBe(400);
            expect(body.success).toBe(false);
        });
    });

    describe('PATCH /api/v1/users/:id', () => {
        test('should update user with valid data', async () => {
            const res = await app.request('/api/v1/users/1', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Updated Name',
                }),
            });
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(body.success).toBe(true);
            expect(body.data.name).toBe('Updated Name');
        });

        test('should return 404 for non-existent user', async () => {
            const res = await app.request('/api/v1/users/999', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'New Name' }),
            });
            const body = await res.json();

            expect(res.status).toBe(404);
            expect(body.success).toBe(false);
        });
    });

    describe('DELETE /api/v1/users/:id', () => {
        test('should delete user successfully', async () => {
            const res = await app.request('/api/v1/users/2', {
                method: 'DELETE',
            });
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(body.success).toBe(true);
            expect(body.data.deleted).toBe(true);
        });

        test('should return 404 for non-existent user', async () => {
            const res = await app.request('/api/v1/users/999', {
                method: 'DELETE',
            });
            const body = await res.json();

            expect(res.status).toBe(404);
            expect(body.success).toBe(false);
        });
    });
});
