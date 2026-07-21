/**
 * validation/authValidation.js
 *
 * Input validation rules using express-validator.
 *
 * WHY CLIENT-SIDE VALIDATION IS NOT ENOUGH:
 * Anyone can bypass browser validation using Postman, curl, or browser dev tools.
 * Server-side validation is your last line of defense.
 *
 * WHY express-validator OVER manual checks?
 * It's declarative, composable, and integrates cleanly with Express middleware chain.
 * These rules are reusable across multiple routes.
 *
 * PATTERN: Rules array → middleware that checks results → controller runs only if valid.
 */

const { body, validationResult } = require('express-validator');

/**
 * Middleware to check validation results and short-circuit with 400 if invalid.
 * Call this after your validation rules in the route.
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map((err) => ({
                field: err.path,
                message: err.msg,
            })),
        });
    }
    next();
};

// ─── REGISTER VALIDATION ─────────────────────────────────────────────────────
const registerValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain uppercase, lowercase, and a number'),

    body('role')
        .optional()
        .isIn(['admin', 'operations', 'accounts', 'driver'])
        .withMessage('Invalid role specified'),

    body('phone')
        .optional()
        .matches(/^[6-9]\d{9}$/)
        .withMessage('Please provide a valid 10-digit Indian phone number'),

    validate,
];

// ─── LOGIN VALIDATION ─────────────────────────────────────────────────────────
const loginValidation = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),

    validate,
];

module.exports = {
    registerValidation,
    loginValidation,
};
