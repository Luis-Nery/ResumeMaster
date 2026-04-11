import { createContext, useContext, useState, useEffect } from 'react';
import { setLogoutHandler } from '../services/api';

const AuthContext = createContext(null);

// Decodes the JWT payload and returns true if the token's exp has passed.
// Returns true (treat as expired) if the token is malformed.
const isTokenExpired = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch {
        return true;
    }
};

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
    const [email, setEmail] = useState(localStorage.getItem('email') || null);
    const [user, setUser] = useState(null);

    const login = (newToken, newUserId, newEmail) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('userId', newUserId);
        localStorage.setItem('email', newEmail);
        setToken(newToken);
        setUserId(newUserId);
        setEmail(newEmail);
    };

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

    const isAuthenticated = () => {
        return token !== null;
    };

    return (
        <AuthContext.Provider value={{ token, userId, email, user, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);