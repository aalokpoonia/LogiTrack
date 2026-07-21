/**
 * hooks/useAuth.js
 *
 * Custom hook to consume AuthContext.
 *
 * WHY A CUSTOM HOOK?
 * Without this, every component using auth does:
 *   import { useContext } from 'react';
 *   import AuthContext from '../contexts/AuthContext';
 *   const auth = useContext(AuthContext);
 *
 * With this hook, it's just:
 *   import useAuth from '../hooks/useAuth';
 *   const { user, login, logout } = useAuth();
 *
 * Also guards against using auth state outside the AuthProvider,
 * giving a clear developer error instead of a cryptic "null" crash.
 *
 * INTERVIEW QUESTION: "Why create custom hooks?"
 * 1. Encapsulate and reuse stateful logic
 * 2. Clean up component code by abstracting hook setup
 * 3. Easy to test in isolation
 */

import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            'useAuth must be used within an AuthProvider. ' +
            'Wrap your app (or the relevant subtree) in <AuthProvider>.'
        );
    }

    return context;
};

export default useAuth;
