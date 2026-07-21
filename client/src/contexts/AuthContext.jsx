/**
 * contexts/AuthContext.jsx
 *
 * Global authentication state — the single source of truth for user session.
 *
 * FLOW ON APP MOUNT:
 * 1. isLoading = true (prevents flashing /login page before check complete)
 * 2. Call POST /auth/refresh — server reads httpOnly cookie and returns new accessToken
 * 3. If success → call GET /auth/me → set user → isAuthenticated = true
 * 4. If fail (no cookie / expired) → just set isLoading = false → show login
 *
 * IMPORTANT: The refresh call in restoreSession() uses a plain axios call,
 * NOT the api instance. This avoids the response interceptor picking up the
 * 401 and trying to refresh again → infinite loop.
 *
 * LOGOUT EVENT PATTERN:
 * api.js dispatches a 'auth:logout' CustomEvent when refresh fails mid-session.
 * AuthContext listens for this and clears state via React — no page reload needed.
 * Page reloads (window.location.href) would remount AuthContext → try refresh →
 * fail → redirect → remount → infinite blink.
 */

import { createContext, useReducer, useEffect, useCallback, useRef } from 'react';
import api, { setToken, clearToken } from '../services/api';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ─── INITIAL STATE ────────────────────────────────────────────────────────────
const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
};

// ─── REDUCER ──────────────────────────────────────────────────────────────────
const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            return { ...state, user: action.payload.user, isAuthenticated: true, isLoading: false };
        case 'LOGOUT':
            return { ...state, user: null, isAuthenticated: false, isLoading: false };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'UPDATE_USER':
            return { ...state, user: { ...state.user, ...action.payload } };
        default:
            return state;
    }
};

// ─── CONTEXT ─────────────────────────────────────────────────────────────────
export const AuthContext = createContext(null);

// ─── PROVIDER ────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);
    const initialized = useRef(false);

    // ── SESSION RESTORE ON MOUNT ─────────────────────────────────────────────
    useEffect(() => {
        // Guard: only run once even in React StrictMode (which double-invokes effects)
        if (initialized.current) return;
        initialized.current = true;

        const restoreSession = async () => {
            try {
                // Use plain axios (not our api instance!) to avoid the response interceptor
                // catching this 401 and trying to refresh — which would be an infinite loop.
                const { data } = await axios.post(
                    `${BASE_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                setToken(data.accessToken);

                // Now use the api instance (token is set) to get the current user
                const { data: meData } = await api.get('/auth/me');
                dispatch({ type: 'LOGIN_SUCCESS', payload: { user: meData.data } });
            } catch {
                // No valid session — that's fine, user just needs to log in
                clearToken();
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };

        restoreSession();
    }, []);

    // ── LISTEN FOR SESSION EXPIRY EVENT FROM api.js ──────────────────────────
    // api.js dispatches 'auth:logout' when it can't refresh mid-session.
    // We handle it here with a clean React state update (no page reload).
    useEffect(() => {
        const handleForcedLogout = () => {
            clearToken();
            dispatch({ type: 'LOGOUT' });
        };

        window.addEventListener('auth:logout', handleForcedLogout);
        return () => window.removeEventListener('auth:logout', handleForcedLogout);
    }, []);

    // ── AUTH ACTIONS ─────────────────────────────────────────────────────────
    const login = useCallback(async (email, password) => {
        // Direct axios call — no need for token on this request
        const { data } = await api.post('/auth/login', { email, password });
        setToken(data.accessToken);
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user: data.user } });
        return data;
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout');
        } catch {
            // Even if server call fails, clear client state
        } finally {
            clearToken();
            dispatch({ type: 'LOGOUT' });
        }
    }, []);

    const updateUser = useCallback((updates) => {
        dispatch({ type: 'UPDATE_USER', payload: updates });
    }, []);

    const value = { ...state, login, logout, updateUser };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
