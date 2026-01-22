/**
 * Pagination utilities
 */

/**
 * Parse pagination params from query string
 * @param {object} query - Query params object
 * @returns {object} Parsed pagination options
 */
export function parsePagination(query) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    // Parse sort - format: "-createdAt" for DESC, "createdAt" for ASC
    let sortField = 'createdAt';
    let sortOrder = 'desc';

    if (query.sort) {
        if (query.sort.startsWith('-')) {
            sortField = query.sort.slice(1);
            sortOrder = 'desc';
        } else {
            sortField = query.sort;
            sortOrder = 'asc';
        }
    }

    const search = query.search || null;

    return {
        page,
        limit,
        offset,
        sortField,
        sortOrder,
        search,
    };
}

/**
 * Build pagination metadata
 * @param {number} total - Total items count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object} Pagination metadata
 */
export function buildPaginationMeta(total, page, limit) {
    const totalPages = Math.ceil(total / limit);

    return {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
}
