/**
 * middleware/errorHandler.js
 *
 * Global error handling middleware.
 *
 * WHY: Without this, every controller needs its own try/catch + res.status().json().
 * With this, controllers just call next(error) and this handles the rest.
 *
 * Express identifies error-handling middleware by the 4-argument signature: (err, req, res, next).
 * It MUST be registered AFTER all routes in server.js.
 *
 * INTERVIEW QUESTION: "How do you handle errors globally in Express?"
 * Answer: 4-argument middleware registered last, called via next(err) from any route or middleware.
 */

const errorHandler = (err, req, res, next) => {
    // Default to 500 if no statusCode has been set
    let statusCode = err.statusCode || res.statusCode === 200 ? err.statusCode || 500 : res.statusCode;
    let message = err.message || 'Internal Server Error';

    // Mongoose: Cast errors (e.g., invalid ObjectId format like "abc" instead of a valid ID)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // Mongoose: Duplicate unique field (e.g., registering same email twice)
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    }

    // Mongoose: Validation errors (e.g., required field missing)
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((val) => val.message)
            .join(', ');
    }

    // JWT: Malformed token
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token. Please log in again.';
    }

    // JWT: Expired token
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired. Please log in again.';
    }

    res.status(statusCode).json({
        success: false,
        message,
        // Only show stack trace in development — never expose internals in production
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = errorHandler;
