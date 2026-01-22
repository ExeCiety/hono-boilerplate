import { ZodError } from 'zod';
import { validationError } from '@/utils/response.js';

/**
 * Validation middleware factory
 * Creates middleware that validates request body/query/params against a Zod schema
 * 
 * @param {object} schemas - Object containing schemas for different parts
 * @param {import('zod').ZodSchema} schemas.body - Body validation schema
 * @param {import('zod').ZodSchema} schemas.query - Query validation schema
 * @param {import('zod').ZodSchema} schemas.params - Params validation schema
 */
export function validate(schemas) {
    return async (c, next) => {
        const errors = [];

        try {
            // Validate body
            if (schemas.body) {
                const body = await c.req.json().catch(() => ({}));
                const result = schemas.body.safeParse(body);
                if (!result.success) {
                    errors.push(...result.error.errors.map((e) => ({
                        field: `body.${e.path.join('.')}`,
                        message: e.message,
                    })));
                } else {
                    c.set('validatedBody', result.data);
                }
            }

            // Validate query
            if (schemas.query) {
                const query = c.req.query();
                const result = schemas.query.safeParse(query);
                if (!result.success) {
                    errors.push(...result.error.errors.map((e) => ({
                        field: `query.${e.path.join('.')}`,
                        message: e.message,
                    })));
                } else {
                    c.set('validatedQuery', result.data);
                }
            }

            // Validate params
            if (schemas.params) {
                const params = c.req.param();
                const result = schemas.params.safeParse(params);
                if (!result.success) {
                    errors.push(...result.error.errors.map((e) => ({
                        field: `params.${e.path.join('.')}`,
                        message: e.message,
                    })));
                } else {
                    c.set('validatedParams', result.data);
                }
            }

            if (errors.length > 0) {
                return validationError(c, errors);
            }

            await next();
        } catch (err) {
            if (err instanceof SyntaxError) {
                return validationError(c, [{ field: 'body', message: 'Invalid JSON' }]);
            }
            throw err;
        }
    };
}

/**
 * Helper to get validated data from context
 */
export function getValidated(c, type = 'body') {
    const key = `validated${type.charAt(0).toUpperCase() + type.slice(1)}`;
    return c.get(key);
}
