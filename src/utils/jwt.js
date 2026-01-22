import { sign, verify } from 'hono/jwt';
import env from '@/config/env.js';

/**
 * Sign a JWT token
 * @param {object} payload - Token payload
 * @returns {Promise<string>} Signed JWT token
 */
export async function signToken(payload) {
    const now = Math.floor(Date.now() / 1000);

    // Parse expiration
    let expiresIn = 7 * 24 * 60 * 60; // Default 7 days
    const match = env.JWT_EXPIRES_IN.match(/^(\d+)([hdwm])$/);
    if (match) {
        const value = parseInt(match[1], 10);
        const unit = match[2];
        switch (unit) {
            case 'h': expiresIn = value * 60 * 60; break;
            case 'd': expiresIn = value * 24 * 60 * 60; break;
            case 'w': expiresIn = value * 7 * 24 * 60 * 60; break;
            case 'm': expiresIn = value * 30 * 24 * 60 * 60; break;
        }
    }

    const tokenPayload = {
        ...payload,
        iat: now,
        exp: now + expiresIn,
    };

    return await sign(tokenPayload, env.JWT_SECRET);
}

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Promise<object>} Decoded token payload
 */
export async function verifyToken(token) {
    return await verify(token, env.JWT_SECRET);
}
