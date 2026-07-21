/**
 * services/tokenService.js
 *
 * Token generation and verification service.
 *
 * WHY A SERVICE LAYER?
 * If we ever switch from JWT to PASETO, session-based auth, or any other
 * token system, we only change this one file. Controllers stay untouched.
 *
 * This is the Dependency Inversion principle: high-level modules (controllers)
 * should not depend on low-level details (JWT library specifics).
 *
 * INTERVIEW QUESTION: "Why use separate access and refresh tokens?"
 * - Access token: Short-lived (15 min). Sent in Authorization header. Used for every API call.
 * - Refresh token: Long-lived (7 days). Stored in httpOnly cookie. Only used to get new access tokens.
 * - Impact: If access token is stolen, damage window is max 15 minutes.
 */

const jwt = require('jsonwebtoken');
const { TOKEN_CONFIG } = require('../config/constants');

/**
 * Generate a short-lived access token.
 * Payload contains only the user id and role — minimum necessary information.
 */
const generateAccessToken = (userId, role) => {
    return jwt.sign(
        { id: userId, role },
        TOKEN_CONFIG.ACCESS_TOKEN_SECRET,
        { expiresIn: TOKEN_CONFIG.ACCESS_TOKEN_EXPIRY }
    );
};

/**
 * Generate a long-lived refresh token.
 * Only contains the user id — role might change between refresh cycles.
 */
const generateRefreshToken = (userId) => {
    return jwt.sign(
        { id: userId },
        TOKEN_CONFIG.REFRESH_TOKEN_SECRET,
        { expiresIn: TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY }
    );
};

/**
 * Verify an access token. Returns decoded payload or throws.
 */
const verifyAccessToken = (token) => {
    return jwt.verify(token, TOKEN_CONFIG.ACCESS_TOKEN_SECRET);
};

/**
 * Verify a refresh token. Returns decoded payload or throws.
 */
const verifyRefreshToken = (token) => {
    return jwt.verify(token, TOKEN_CONFIG.REFRESH_TOKEN_SECRET);
};

/**
 * Set the refresh token as a secure httpOnly cookie on the response.
 * httpOnly: true  → JavaScript cannot read this cookie (XSS protection)
 * secure: true    → Only sent over HTTPS in production
 * sameSite: strict → Prevents CSRF attacks
 */
const setRefreshTokenCookie = (res, refreshToken) => {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: TOKEN_CONFIG.COOKIE_MAX_AGE,
    });
};

/**
 * Clear the refresh token cookie on logout.
 */
const clearRefreshTokenCookie = (res) => {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('refreshToken', '', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        expires: new Date(0),
    });
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    setRefreshTokenCookie,
    clearRefreshTokenCookie,
};
