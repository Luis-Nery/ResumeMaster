import { createContext, useContext, useState, useEffect } from 'react';
import { setLogoutHandler } from '../services/api';

/**
 * React context that exposes authentication state and actions to the
 * entire component tree. Consumers should use the {@link useAuth} hook
 * rather than reading this context directly.
 */
const AuthContext = createContext(null);

/**
 * Decodes the JWT payload and checks whether the token has expired.
 * Returns `true` (treat as expired) when the token is malformed or
 * when its `exp` claim is in the past.
 *
 * @param {string} token - A JWT string in the standard three-part format.
 * @returns {boolean} `true` if the token is expired or invalid.
 */
const isTokenExpired = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch {
        return true;
    }
};

/**
 * Context provider that manages JWT-based authentication state.
 * Persists the token, userId, and email in localStorage so the session
 * survives page reloads. On mount it evicts any expired token and
 * registers the logout callback with the Axios interceptor.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element} The AuthContext.Provider wrapping its children.
 */
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
    const [email, setEmail] = useState(localStorage.getItem('email') || null);
    const [user, setUser] = useState(null);

    /**
     * Persists auth credentials to localStorage and updates context state.
     * Called after a successful login or registration response.
     *
     * @param {string} newToken  - JWT returned by the backend.
     * @param {string} newUserId - Numeric user ID as a string.
     * @param {string} newEmail  - The authenticated user's email address.
     */
    const login = (newToken, newUserId, newEmail) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('userId', newUserId);
        localStorage.setItem('email', newEmail);
        setToken(newToken);
        setUserId(newUserId);
        setEmail(newEmail);
    };

    /**
     * Clears all auth credentials from localStorage and resets context state.
     * After this call `isAuthenticated()` returns `false` and ProtectedRoute
     * will redirect to `/login`.
     */
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('email');
        setToken(null);
        setUserId(null);
        setEmail(null);
        setUser(null);
    };

    // On mount: clear any expired token so ProtectedRoute redirects immediately.
    useEffect(() => {
        if (token && isTokenExpired(token)) {
            logout();
        }
    }, []);

    // Register logout with the axios interceptor so 401 responses trigger a full
    // auth reset rather than only removing the token from localStorage.
    useEffect(() => {
        setLogoutHandler(logout);
    }, []);

    /**
     * Returns whether the user currently holds a valid (non-null) token.
     * Note: this does not re-validate the token signature or expiry at
     * call time — expiry is only checked once on mount.
     *
     * @returns {boolean} `true` when a token is present in state.
     */
    const isAuthenticated = () => {
        return token !== null;
    };

    return (
        <AuthContext.Provider value={{ token, userId, email, user, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Custom hook that provides access to the authentication context.
 * Must be used inside an {@link AuthProvider}.
 *
 * @returns {{ token: string|null, userId: string|null, email: string|null, user: object|null, login: Function, logout: Function, isAuthenticated: Function }}
 */
export const useAuth = () => useContext(AuthContext);