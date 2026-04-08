import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

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