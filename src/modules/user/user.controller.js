import { userService } from '@/modules/user/user.service.js';
import { success, paginated, notFound } from '@/utils/response.js';

/**
 * User Controller
 * HTTP request handlers for user endpoints
 */
class UserController {
    constructor(service) {
        this.service = service;
    }

    /**
     * GET /users
     * List all users with pagination
     */
    async getAll(c) {
        const query = c.req.query();
        const { data, pagination } = await this.service.getAll(query);
        return paginated(c, data, pagination);
    }

    /**
     * GET /users/:id
     * Get single user by ID
     */
    async getById(c) {
        const id = parseInt(c.req.param('id'), 10);
        const user = await this.service.getById(id);
        return success(c, user);
    }

    /**
     * POST /users
     * Create new user
     */
    async create(c) {
        const data = c.get('validatedBody');
        const user = await this.service.create(data);
        return success(c, user, null, 201);
    }

    /**
     * PATCH /users/:id
     * Update user
     */
    async update(c) {
        const id = parseInt(c.req.param('id'), 10);
        const data = c.get('validatedBody');
        const user = await this.service.update(id, data);
        return success(c, user);
    }

    /**
     * DELETE /users/:id
     * Delete user
     */
    async delete(c) {
        const id = parseInt(c.req.param('id'), 10);
        await this.service.delete(id);
        return success(c, { deleted: true });
    }
}

export const userController = new UserController(userService);
