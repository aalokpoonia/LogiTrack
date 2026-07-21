/**
 * middleware/notFound.js
 *
 * 404 catch-all middleware.
 *
 * WHY: If a request doesn't match any registered route, Express doesn't
 * automatically send a 404. This middleware catches those unmatched requests.
 * It creates an Error object and passes it to the global error handler via next().
 *
 * PLACEMENT: Must come AFTER all routes, but BEFORE errorHandler.
 */

const notFound = (req, res, next) => {
    const error = new Error(`🔍 Not Found — ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

module.exports = notFound;
