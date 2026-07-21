/**
 * controllers/authController.js
 *
 * Auth controller — handles all authentication business logic.
 *
 * CONTROLLER RESPONSIBILITY:
 * Controllers receive validated, authenticated requests and orchestrate:
 * 1. Calling models (DB operations)
 * 2. Calling services (business logic)
 * 3. Sending responses
 *
 * Controllers do NOT:
 * - Validate input (that's middleware/validation)
 * - Hash passwords (that's the User model's pre-save hook)
 * - Sign tokens (that's tokenService)
 *
 * This thin controller / fat service pattern keeps controllers clean and testable.
 *
 * INTERVIEW QUESTION: "What is the difference between a controller and a service?"
 * Controller: Handles HTTP-specific concerns (req, res). Glue between HTTP layer and business logic.
 * Service: Pure business logic, no req/res. Can be used from controllers, cron jobs, CLI scripts, etc.
 */

const User = require('../models/User');
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    setRefreshTokenCookie,
    clearRefreshTokenCookie,
} = require('../services/tokenService');

// ─── REGISTER ─────────────────────────────────────────────────────────────────
// @route   POST /api/auth/register
// @access  Admin only (protected by protect + authorize('admin') in route)
const register = async (req, res, next) => {
    try {
        const { name, email, password, role, phone } = req.body;

        // Check for existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'A user with this email already exists',
            });
        }

        // Create user — password hashing happens automatically in the pre-save hook
        const user = await User.create({ name, email, password, role, phone });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: user, // toJSON transform ensures password is excluded
        });
    } catch (error) {
        next(error); // Forwards to global errorHandler
    }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Must use .select('+password') to override the select: false on the schema
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            // Use vague error message — don't reveal whether email exists
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account deactivated. Contact administrator.',
            });
        }

        // Compare entered password with stored bcrypt hash
        const isPasswordMatch = await user.matchPassword(password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // Update last login timestamp
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false }); // skip re-running validators

        // Generate tokens
        const accessToken = generateAccessToken(user._id, user.role);
        const refreshToken = generateRefreshToken(user._id);

        // Set refresh token in httpOnly cookie
        setRefreshTokenCookie(res, refreshToken);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            accessToken,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                avatar: user.avatar,
                lastLogin: user.lastLogin,
            },
        });
    } catch (error) {
        next(error);
    }
};

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────
// @route   POST /api/auth/refresh
// @access  Public (uses httpOnly cookie)
const refreshToken = async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No refresh token found. Please log in.',
            });
        }

        // Verify the refresh token
        const decoded = verifyRefreshToken(token);

        // Confirm user still exists
        const user = await User.findById(decoded.id);
        if (!user || !user.isActive) {
            clearRefreshTokenCookie(res);
            return res.status(401).json({
                success: false,
                message: 'Invalid session. Please log in again.',
            });
        }

        // Issue a fresh access token
        const accessToken = generateAccessToken(user._id, user.role);

        res.status(200).json({
            success: true,
            accessToken,
        });
    } catch (error) {
        clearRefreshTokenCookie(res);
        next(error);
    }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
// @route   POST /api/auth/logout
// @access  Private
const logout = (req, res) => {
    clearRefreshTokenCookie(res);
    res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
};

// ─── GET CURRENT USER ─────────────────────────────────────────────────────────
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        // req.user is already attached by the protect middleware
        // Re-fetch from DB to always return fresh data
        const user = await User.findById(req.user._id);

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    refreshToken,
    logout,
    getMe,
};
