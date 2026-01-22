import { Hono } from 'hono';
import { userController } from '@/modules/user/user.controller.js';
import { validate } from '@/middlewares/validate.js';
import { createUserSchema, updateUserSchema, idParamSchema } from '@/modules/user/user.schema.js';

const userRoutes = new Hono();

// GET /users - List all users
userRoutes.get('/', (c) => userController.getAll(c));

// GET /users/:id - Get single user
userRoutes.get('/:id', validate({ params: idParamSchema }), (c) => userController.getById(c));

// POST /users - Create user
userRoutes.post('/', validate({ body: createUserSchema }), (c) => userController.create(c));

// PATCH /users/:id - Update user
userRoutes.patch(
    '/:id',
    validate({ params: idParamSchema, body: updateUserSchema }),
    (c) => userController.update(c)
);

// DELETE /users/:id - Delete user
userRoutes.delete('/:id', validate({ params: idParamSchema }), (c) => userController.delete(c));

export default userRoutes;
