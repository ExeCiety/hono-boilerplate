import { z } from 'zod';

/**
 * User validation schemas using Zod
 */

// Base user fields
const userBase = {
    name: z.string().min(2, 'Name must be at least 2 characters').max(255),
    email: z.string().email('Invalid email address'),
};

// Create user schema
export const createUserSchema = z.object({
    ...userBase,
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Update user schema (all fields optional)
export const updateUserSchema = z.object({
    name: z.string().min(2).max(255).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    isActive: z.boolean().optional(),
});

// ID param schema
export const idParamSchema = z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

// Query params for listing
export const listQuerySchema = z.object({
    page: z.string().regex(/^\d+$/).optional().default('1'),
    limit: z.string().regex(/^\d+$/).optional().default('10'),
    sort: z.string().optional(),
    search: z.string().optional(),
});
