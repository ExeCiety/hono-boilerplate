import app from '@/app.js';
import env from '@/config/env.js';
import { closeDb } from '@/db/index.js';

// Server instance
let server;

/**
 * Start the server
 */
function startServer() {
    server = Bun.serve({
        port: env.PORT,
        fetch: app.fetch,
    });

    console.log(`
🚀 Hono REST API Server started
   Environment: ${env.NODE_ENV}
   Port: ${env.PORT}
   Docs: http://localhost:${env.PORT}/docs
   Health: http://localhost:${env.PORT}/health
  `);
}

/**
 * Graceful shutdown handler
 */
async function shutdown(signal) {
    console.log(`\n${signal} received. Starting graceful shutdown...`);

    try {
        // Stop accepting new requests
        if (server) {
            server.stop();
            console.log('Server stopped accepting new connections');
        }

        // Close database connections
        await closeDb();

        console.log('Graceful shutdown completed');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
}

// Register shutdown handlers
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    shutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
});

// Start the server
startServer();
