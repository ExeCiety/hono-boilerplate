import { userRepository } from '@/modules/user/user.repository.js';
import { parsePagination, buildPaginationMeta } from '@/utils/pagination.js';

/**
 * User Service
 * Business logic layer for user operations
 */
class UserService {
    constructor(repository) {
        this.repository = repository;
    }

    /**
     * Get all users with pagination
     * @param {object} query - Query parameters
     */
    async getAll(query) {
        const pagination = parsePagination(query);
        const { data, total } = await this.repository.findAll(pagination);
        const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

        return { data, pagination: meta };
    }

    /**
     * Get user by ID
     * @param {number} id - User ID
     */
    async getById(id) {
        const user = await this.repository.findById(id);

        if (!user) {
            const error = new Error('User not found');
            error.code = 'NOT_FOUND';
            error.status = 404;
            throw error;
        }

        return user;
    }

    /**
     * Create a new user
     * @param {object} data - User data
     */
    async create(data) {
        // Check if email already exists
        const existing = await this.repository.findByEmail(data.email);
        if (existing) {
            const error = new Error('Email already registered');
            error.code = 'DUPLICATE_EMAIL';
            error.status = 409;
            throw error;
        }

        // Hash password (using Bun's built-in hasher)
        const hashedPassword = await Bun.password.hash(data.password, {
            algorithm: 'bcrypt',
            cost: 10,
        });

        const user = await this.repository.create({
            ...data,
            password: hashedPassword,
        });

        return user;
    }

    /**
     * Update a user
     * @param {number} id - User ID
     * @param {object} data - Update data
     */
    async update(id, data) {
        // Check if user exists
        await this.getById(id);

        // If updating email, check for duplicates
        if (data.email) {
            const existing = await this.repository.findByEmail(data.email);
            if (existing && existing.id !== id) {
                const error = new Error('Email already registered');
                error.code = 'DUPLICATE_EMAIL';
                error.status = 409;
                throw error;
            }
        }

        // If updating password, hash it
        if (data.password) {
            data.password = await Bun.password.hash(data.password, {
                algorithm: 'bcrypt',
                cost: 10,
            });
        }

        const user = await this.repository.update(id, data);
        return user;
    }

    /**
     * Delete a user
     * @param {number} id - User ID
     */
    async delete(id) {
        // Check if user exists
        await this.getById(id);

        await this.repository.delete(id);
        return true;
    }
}

export const userService = new UserService(userRepository);
