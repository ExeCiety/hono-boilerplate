import { db } from '@/db/index.js';
import { users } from '@/db/schema.js';
import { eq, like, sql, desc, asc } from 'drizzle-orm';

/**
 * User Repository
 * Data access layer for user entity
 */
class UserRepository {
    /**
     * Find all users with pagination and filtering
     * @param {object} options - Query options
     */
    async findAll({ limit, offset, sortField, sortOrder, search }) {
        // Build where condition
        const whereCondition = search
            ? like(users.name, `%${search}%`)
            : undefined;

        // Get total count
        const countResult = await db
            .select({ count: sql`count(*)::int` })
            .from(users)
            .where(whereCondition);

        const total = countResult[0]?.count || 0;

        // Build order by
        const orderColumn = users[sortField] || users.createdAt;
        const orderDirection = sortOrder === 'asc' ? asc(orderColumn) : desc(orderColumn);

        // Get paginated results
        const results = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                isActive: users.isActive,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .where(whereCondition)
            .orderBy(orderDirection)
            .limit(limit)
            .offset(offset);

        return { data: results, total };
    }

    /**
     * Find user by ID
     * @param {number} id - User ID
     */
    async findById(id) {
        const result = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                isActive: users.isActive,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        return result[0] || null;
    }

    /**
     * Find user by email
     * @param {string} email - User email
     */
    async findByEmail(email) {
        const result = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        return result[0] || null;
    }

    /**
     * Create a new user
     * @param {object} data - User data
     */
    async create(data) {
        const result = await db
            .insert(users)
            .values({
                name: data.name,
                email: data.email,
                password: data.password,
            })
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                isActive: users.isActive,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            });

        return result[0];
    }

    /**
     * Update a user
     * @param {number} id - User ID
     * @param {object} data - Update data
     */
    async update(id, data) {
        const result = await db
            .update(users)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(users.id, id))
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                isActive: users.isActive,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            });

        return result[0] || null;
    }

    /**
     * Delete a user
     * @param {number} id - User ID
     */
    async delete(id) {
        const result = await db
            .delete(users)
            .where(eq(users.id, id))
            .returning({ id: users.id });

        return result.length > 0;
    }
}

export const userRepository = new UserRepository();
