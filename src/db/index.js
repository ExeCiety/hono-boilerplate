import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import env from '@/config/env.js';
import * as schema from '@/db/schema.js';

// Create postgres connection pool
const client = postgres(env.DATABASE_URL, {
    max: 10, // Max connections in pool
    idle_timeout: 20,
    connect_timeout: 10,
});

// Create drizzle instance with schema
export const db = drizzle(client, { schema });

// Export client for graceful shutdown
export const dbClient = client;

/**
 * Check database connection health
 * @returns {Promise<boolean>}
 */
export async function checkDbHealth() {
    try {
        await client`SELECT 1`;
        return true;
    } catch (error) {
        console.error('Database health check failed:', error.message);
        return false;
    }
}

/**
 * Close database connection pool
 */
export async function closeDb() {
    await client.end();
    console.log('Database connection closed');
}
