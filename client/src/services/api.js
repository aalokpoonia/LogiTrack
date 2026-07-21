/**
 * services/api.js
 *
 * Global Axios instance with request/response interceptors.
 *
 * KEY DESIGN DECISIONS:
 *
 * 1. In-memory access token (not localStorage) — immune to XSS attacks
 * 2. httpOnly cookie refresh token — immune to XSS, JS can't touch it
 * 3. Request interceptor — auto-injects Bearer token on every call
 * 4. Response interceptor — on 401, silently refreshes and retries ONCE
 *
 * CRITICAL GUARD: The interceptor MUST skip /auth/refresh and /auth/login.
 * Without this guard, a 401 from /auth/refresh triggers another refresh →
 * another 401 → another refresh → infinite loop → screen blinks forever.
 *
 * REDIRECT PATTERN: On unrecoverable 401, we do NOT use window.location.href.
 * window.location causes a full page reload → React remounts → AuthContext
 * calls refresh again → 401 → redirect → remount → infinite blink loop.
 * Instead, we dispatch a custom DOM event that AuthContext listens to,
 * which triggers a React state update that React Router handles cleanly.
 */

import axios from 'axios';

// In development: Vite proxy intercepts /api → :5000 (no CORS issues)
// In production: set VITE_API_URL to https://your-backend.render.com/api
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // Required to send httpOnly cookie on every request
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

// ─── IN-MEMORY TOKEN STORE ───────────────────────────────────────────────────
let accessToken = null;

export const setToken = (token) => { accessToken = token; };
export const getToken = () => accessToken;
export const clearToken = () => { accessToken = null; };

// ─── REQUEST INTERCEPTOR ─────────────────────────────────────────────────────
api.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR ────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    failedQueue = [];
};

// URLs that should NEVER trigger a silent refresh retry.
// If these endpoints return 401, the user is simply not authenticated — period.
const NO_RETRY_URLS = ['/auth/refresh', '/auth/login'];

api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        // Check if this URL should be exempt from refresh retry
        const isNoRetryUrl = NO_RETRY_URLS.some(url =>
            originalRequest?.url?.includes(url)
        );

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !isNoRetryUrl
        ) {
            // Another refresh is in progress — queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { data } = await axios.post(
                    `${BASE_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                const newToken = data.accessToken;
                setToken(newToken);
                processQueue(null, newToken);

                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh truly failed — clear token and signal logout via custom event.
                // DO NOT use window.location.href — that causes page reload → remount →
                // AuthContext tries refresh again → infinite blink loop.
                processQueue(refreshError, null);
                clearToken();
                window.dispatchEvent(new CustomEvent('auth:logout'));
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
