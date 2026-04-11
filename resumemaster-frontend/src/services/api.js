import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Holds the logout function registered by AuthContext on mount.
// Allows the interceptor below to call the real logout() which clears
// all auth state and localStorage entries, not just the token.
let logoutHandler = null;

export const setLogoutHandler = (fn) => {
    logoutHandler = fn;
};

// This runs before every request
// It grabs the token from localStorage and attaches it automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// This runs after every response
// If backend returns 401 (unauthorized), call logout() and redirect to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
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