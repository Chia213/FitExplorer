import React, { createContext, useState, useContext, useEffect } from 'react';
import { isWeb } from '../utils/platform';
import { storeData, retrieveData, removeData, storeObject, retrieveObject } from '../utils/storage';
import apiClient from '../api/client';

// Create a context for authentication
export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  loginWithGoogle: () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component to wrap the app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const token = await retrieveData('auth_token');
      
      if (token) {
        // Try to get user profile with the token
        const response = await apiClient.get('/users/me');
        
        if (response.data) {
          setUser(response.data);
          await storeObject('user_data', response.data);
        } else {
          // Token might be invalid
          setUser(null);
          await removeData('auth_token');
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid token
      await removeData('auth_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      // Call the real login API
      const response = await apiClient.post('/auth/token', {
        email,
        password
      });
      
      // Store token and user data - match frontend data structure
      const { access_token, user: userData } = response.data;
      await storeData('auth_token', access_token);
      await storeObject('user_data', userData);
      
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (googleData) => {
    setIsLoading(true);
    try {
      // Call the real API to authenticate with Google
      const response = await apiClient.post('/auth/google', {
        id_token: googleData.idToken,
        access_token: googleData.accessToken
      });
      
      // If server response successful, set the user
      if (response.data) {
        const { access_token, user: userData } = response.data;
        
        // Store auth data
        await storeData('auth_token', access_token);
        await storeObject('user_data', userData);
        
        setUser(userData);
        return true;
      } else {
        console.error('Google login: Invalid server response');
        return false;
      }
    } catch (error) {
      console.error('Google login failed:', error.response?.data || error.message || error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Call the real logout API if token exists
      const token = await retrieveData('auth_token');
      if (token) {
        try {
          await apiClient.post('/auth/logout');
        } catch (logoutError) {
          console.error('Error logging out from API:', logoutError);
          // Continue with local logout even if API call fails
        }
      }
      
      // Clear token and user data
      await removeData('auth_token');
      await removeData('user_data');
      
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 