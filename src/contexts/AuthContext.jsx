// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Function to check if a token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      // If decoding fails, the token is invalid
      console.error("Invalid token:", error);
      return true;
    }
  };

  useEffect(() => {
    const initializeAuth = () => {
      setLoading(true);
      if (token && !isTokenExpired(token)) {
        try {
          const decodedToken = jwtDecode(token);
          setUser({
            isAuthenticated: true,
            email: decodedToken.email,
            role: decodedToken.role,
            userId: decodedToken.userId,
          });
        } catch (error) {
          console.error("Error decoding token:", error);
          logout();
        }
      } else {
        // Log out if there is a token but it's invalid or expired
        logout();
      }
      setLoading(false);
    };

    initializeAuth();
    
    // Set up an interval to periodically check for token expiration
    const checkInterval = setInterval(() => {
        if (isTokenExpired(token)) {
            console.warn("Token has expired. Logging out automatically.");
            logout();
        }
    }, 60000); // Check every minute

    return () => clearInterval(checkInterval); // Clean up the interval on unmount
  }, [token]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await apiLogin(email, password);
      if (response.accessToken) {
        localStorage.setItem('token', response.accessToken);
        setToken(response.accessToken);
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
    isAuthenticated: !!user && !!token && !isTokenExpired(token),
    isAdmin: user?.role === 'admin',
  };
  console.log("AuthContext value:", value); // Debugging line to check context value
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the Auth Context
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};
