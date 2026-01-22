/**
 * Standard JSON response helpers
 */

/**
 * Success response
 * @param {import('hono').Context} c - Hono context
 * @param {any} data - Response data
 * @param {object} meta - Optional metadata
 * @param {number} status - HTTP status code
 */
export function success(c, data, meta = null, status = 200) {
    const response = {
        success: true,
        data,
    };
    if (meta) {
        response.meta = meta;
    }
    return c.json(response, status);
}

/**
 * Paginated response
 * @param {import('hono').Context} c - Hono context
 * @param {Array} data - Array of items
 * @param {object} pagination - Pagination metadata
 */
export function paginated(c, data, pagination) {
    return c.json({
        success: true,
        data,
        meta: {
            pagination,
        },
    });
}

/**
 * Error response
 * @param {import('hono').Context} c - Hono context
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {number} status - HTTP status code
 * @param {any} details - Additional error details
 */
export function error(c, message, code = 'ERROR', status = 400, details = null) {
    const requestId = c.get('requestId') || null;
    const response = {
        success: false,
        error: {
            message,
            code,
        },
        requestId,
    };
    if (details) {
        response.error.details = details;
    }
    return c.json(response, status);
}

/**
 * Not found response
 * @param {import('hono').Context} c - Hono context
 * @param {string} resource - Resource name
 */
export function notFound(c, resource = 'Resource') {
    return error(c, `${resource} not found`, 'NOT_FOUND', 404);
}

/**
 * Validation error response
 * @param {import('hono').Context} c - Hono context
 * @param {Array} errors - Validation errors
 */
export function validationError(c, errors) {
    return error(c, 'Validation failed', 'VALIDATION_ERROR', 400, errors);
}

/**
 * Unauthorized response
 * @param {import('hono').Context} c - Hono context
 * @param {string} message - Error message
 */
export function unauthorized(c, message = 'Unauthorized') {
    return error(c, message, 'UNAUTHORIZED', 401);
}

/**
 * Forbidden response
 * @param {import('hono').Context} c - Hono context
 * @param {string} message - Error message
 */
export function forbidden(c, message = 'Forbidden') {
    return error(c, message, 'FORBIDDEN', 403);
}
