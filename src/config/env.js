/**
 * Environment configuration loader
 * Loads and validates environment variables with sensible defaults
 */

const env = {
    // Server
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT, 10) || 3000,

    // Database
    DATABASE_URL: process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/hono_boilerplate',

    // JWT
    JWT_SECRET: process.env.JWT_SECRET || 'default-dev-secret-change-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

    // CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

    // Rate Limiting
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,

    // Helpers
    isDev: () => env.NODE_ENV === 'development',
    isProd: () => env.NODE_ENV === 'production',
};

// Validate required env vars in production
if (env.isProd()) {
    const required = ['DATABASE_URL', 'JWT_SECRET'];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}

export default env;
