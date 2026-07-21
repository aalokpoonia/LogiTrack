/**
 * middleware/authorize.js
 *
 * Authorization middleware — checks if the authenticated user has the required role(s).
 *
 * USAGE in routes (always comes AFTER protect):
 *   router.post('/register', protect, authorize('admin'), registerValidation, register);
 *   router.get('/admin-data', protect, authorize('admin', 'operations'), getAdminData);
 *
 * WHY A FACTORY FUNCTION?
 * authorize('admin') returns a middleware function.
 * This lets us pass roles as arguments — making it flexible and reusable.
 *
 * This is called the "Higher-Order Function" pattern — a function that returns a function.
 * It's fundamental to middleware composition in Express.
 *
 * INTERVIEW QUESTION: "How do you implement Role-Based Access Control in Node.js?"
 * Answer: JWT carries the role in the payload. protect middleware verifies identity and
 * attaches user to req.user. authorize middleware then checks req.user.role against
 * allowed roles. Separation of concerns: auth vs. authz handled by different middleware.
 */

const authorize = (...roles) => {
    return (req, res, next) => {
        // req.user is set by the protect middleware — must run after protect
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated. Run protect middleware first.',
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Role '${req.user.role}' is not authorized to access this resource.`,
            });
        }

        next();
    };
};

module.exports = authorize;
