/**
 * middleware/protect.js
 *
 * Authentication middleware — verifies the JWT access token.
 *
 * HOW IT WORKS:
 * 1. Extract the Bearer token from the Authorization header
 * 2. Verify it using our secret key
 * 3. Fetch the user from DB to ensure they still exist and are active
 * 4. Attach the user to req.user so downstream controllers can use it
 *
 * USAGE in routes:
 *   router.get('/me', protect, getMe);
 *
 * INTERVIEW QUESTION: "What is the difference between authentication and authorization?"
 * Authentication: "Who are you?" — verifying identity (this middleware)
 * Authorization: "What are you allowed to do?" — verifying permissions (authorize.js)
 */

const { verifyAccessToken } = require('../services/tokenService');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // Standard pattern: "Authorization: Bearer <token>"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized. No token provided.',
        });
    }

    try {
        // verifyAccessToken throws if token is invalid or expired
        const decoded = verifyAccessToken(token);

        // Fetch user from DB. Confirms user still exists and is active.
        // We don't rely solely on the token payload for security —
        // a deleted user's token would otherwise still work until expiry.
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User belonging to this token no longer exists.',
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Your account has been deactivated. Contact the administrator.',
            });
        }

        // Attach full user object to request — available in all downstream handlers
        req.user = user;
        next();
    } catch (error) {
        // JWT errors (expired, invalid) are caught here and forwarded to errorHandler
        return res.status(401).json({
            success: false,
            message: 'Not authorized. Invalid or expired token.',
        });
    }
};

module.exports = protect;
