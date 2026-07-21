/**
 * routes/authRoutes.js
 *
 * Auth route definitions.
 *
 * ROUTE LAYER RESPONSIBILITY:
 * Routes map HTTP method + path to:
 * 1. Middleware chain (validation, protection, authorization)
 * 2. Controller function
 *
 * Routes should be thin — no business logic here, just wiring.
 *
 * MIDDLEWARE CHAIN EXPLAINED (left to right):
 *   protect → authorize('admin') → registerValidation → register
 *   1. protect: Is the user logged in? (JWT verification)
 *   2. authorize('admin'): Is the user an admin?
 *   3. registerValidation: Is the input valid?
 *   4. register: Do the actual work.
 *
 * This composition pattern is Express's superpower.
 */

const express = require('express');
const router = express.Router();

const { register, login, refreshToken, logout, getMe } = require('../controllers/authController');
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const { registerValidation, loginValidation } = require('../validation/authValidation');

// @route   POST /api/auth/login
// @access  Public
router.post('/login', loginValidation, login);

// @route   POST /api/auth/register
// @access  Admin only — only admins can create new users
router.post('/register', protect, authorize('admin'), registerValidation, register);

// @route   POST /api/auth/refresh
// @access  Public (reads from httpOnly cookie)
router.post('/refresh', refreshToken);

// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, logout);

// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, getMe);

module.exports = router;
