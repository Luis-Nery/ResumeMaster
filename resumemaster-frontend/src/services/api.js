import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Axios instance pre-configured with the backend base URL from
 * the VITE_API_BASE_URL environment variable. All API calls in the
 * app should go through this instance so that the JWT interceptor
 * and the 401 redirect logic are always applied.
 */
const api = axios.create({
    baseURL: API_BASE_URL,
});

/**
 * Holds the logout function registered by AuthContext on mount.
 * Allows the response interceptor below to call the real logout()
 * which clears all auth state and localStorage entries, not just
 * the token.
 * @type {Function|null}
 */
let logoutHandler = null;

/**
 * Registers the logout callback provided by AuthContext so the
 * Axios response interceptor can trigger a full auth reset on 401.
 *
 * @param {Function} fn - The logout function from AuthContext.
 */
export const setLogoutHandler = (fn) => {
    logoutHandler = fn;
};

/**
 * Request interceptor — runs before every outgoing request.
 * Reads the JWT from localStorage and attaches it as a Bearer
 * Authorization header so the backend can authenticate the caller.
 */
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * Response interceptor — runs after every response.
 * On a 401 Unauthorized response the interceptor calls the
 * registered logout handler (or falls back to clearing localStorage
 * directly) and then redirects the browser to /login.
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url ?? '';
        const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
        if (isAuthEndpoint) {
            return Promise.reject(error);
        }
        if (error.response?.status === 401) {
            if (logoutHandler) {
                logoutHandler();
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                localStorage.removeItem('email');
            }
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;