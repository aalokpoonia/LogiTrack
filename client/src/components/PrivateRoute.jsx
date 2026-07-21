/**
 * components/PrivateRoute.jsx
 *
 * Route guard for protected pages.
 *
 * ROUTING FLOW:
 * User accesses /dashboard
 * → PrivateRoute checks isAuthenticated
 * → Not authenticated → redirect to /login (with current path saved)
 * → Authenticated, wrong role → redirect to /dashboard (403-like)
 * → Authenticated, correct role → render the page component
 *
 * The `state: { from: location }` on the redirect stores where the user
 * was trying to go. After login, we can redirect them back there.
 *
 * WHY SHOW SPINNER?
 * On first load, `isLoading` is true while we silently check the session.
 * Without spinner, the login page flickers before redirect — bad UX.
 */

import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';

const PrivateRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    // Still checking session — show loading spinner
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0F1E' }}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm font-medium">Loading LogiTrack AI...</p>
                </div>
            </div>
        );
    }

    // Not logged in — redirect to login
    if (!isAuthenticated) {
        return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
    }

    // Role check — if allowedRoles specified, verify user has permission
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to={ROUTES.DASHBOARD} replace />;
    }

    return children;
};

export default PrivateRoute;
