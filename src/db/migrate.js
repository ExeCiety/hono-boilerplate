import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import env from '@/config/env.js';

/**
 * Run database migrations
 */
async function runMigrations() {
    console.log('Running migrations...');

    const client = postgres(env.DATABASE_URL, { max: 1 });
    const db = drizzle(client);

    try {
        await migrate(db, { migrationsFolder: './drizzle' });
        console.log('Migrations completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigrations();
