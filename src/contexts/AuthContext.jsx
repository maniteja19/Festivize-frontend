// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode

// Create the Auth Context
const AuthContext = createContext(null);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true); // To manage initial loading state

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          // Check if token is expired (optional, but good practice)
          if (decodedToken.exp * 1000 < Date.now()) {
            console.warn("Token expired. Logging out.");
            logout(); // Log out if token is expired
          } else {
            setUser({
              isAuthenticated: true,
              email: decodedToken.email,
              role: decodedToken.role, // Extract role from decoded token
              userId: decodedToken.userId,
            });
          }
        } catch (error) {
          console.error("Error decoding token:", error);
          logout(); // Clear invalid token
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]); // Depend on token to re-run if token changes

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await apiLogin(email, password);
      if (response.accessToken) {
        localStorage.setItem('token', response.accessToken);
        setToken(response.accessToken); // This will trigger the useEffect above to decode and set user
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message || 'An error occurred during login.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    try {
      setLoading(true);
      const response = await apiRegister(name, email, password, role);
      return { success: true, message: response.message };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: error.message || 'An error occurred during registration.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token, // Convenience flag
    isAdmin: user?.role === 'admin', // NEW: Expose isAdmin flag
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the Auth Context
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};
