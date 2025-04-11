import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Create context
const AuthContext = createContext({
  user: null,
  isLoading: false,
  error: null,
  login: async () => false,
  logout: () => {},
  register: async () => false,
  isAuthenticated: () => false,
  verifyEmail: async () => false,
  requestPasswordReset: async () => false,
  resetPassword: async () => false,
  changePassword: async () => false,
  updateProfile: async () => false,
  checkAdminStatus: async () => false,
});

// Define the backend URL - should be in an environment variable
const BACKEND_URL = 'http://localhost:8000';

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Parse JWT token and extract user data
  const parseToken = useCallback((token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        username: payload.sub,
        isAdmin: payload.is_admin === true,
        expiry: new Date(payload.exp * 1000),
      };
    } catch (err) {
      console.error('Error parsing token:', err);
      return null;
    }
  }, []);

  // Check if token is expired
  const isTokenExpired = useCallback((expiry) => {
    if (!expiry) return true;
    return new Date() > expiry;
  }, []);

  // Fetch user profile data
  const fetchUserProfile = useCallback(async (token) => {
    try {
      const response = await fetch(`${BACKEND_URL}/user-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      return await response.json();
    } catch (err) {
      console.error('Error fetching profile:', err);
      throw err;
    }
  }, []);

  // Initialize auth state from local storage
  const initializeAuth = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    // Check for token in both places
    const accessToken = localStorage.getItem('access_token');
    const legacyToken = localStorage.getItem('token');
    
    // Get the token, prioritizing access_token
    const token = accessToken || legacyToken;
    
    // Synchronize tokens to ensure both are consistent
    if (token) {
      if (!accessToken) localStorage.setItem('access_token', token);
      if (!legacyToken) localStorage.setItem('token', token);
    }
    
    if (!token) {
      // No token found
      setUser(null);
      setIsLoading(false);
      return;
    }
    
    try {
      // Parse and validate token
      const userData = parseToken(token);
      
      if (!userData || isTokenExpired(userData.expiry)) {
        // Token is invalid or expired
        localStorage.removeItem('access_token');
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      // Verify token with backend
      try {
        const verifyResponse = await fetch(`${BACKEND_URL}/auth/verify-session`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!verifyResponse.ok) {
          // Token verification failed
          localStorage.removeItem('access_token');
          localStorage.removeItem('token');
          localStorage.removeItem('isAdmin');
          setUser(null);
          setIsLoading(false);
          return;
        }
      } catch (verifyError) {
        console.error('Error verifying token with backend:', verifyError);
        // In case of network error, we'll continue with client-side validation
      }
      
      // Fetch additional user data from the backend
      const profileData = await fetchUserProfile(token);
      
      setUser({
        ...userData,
        ...profileData,
        token,
      });
      
      // Update admin status in local storage
      localStorage.setItem('isAdmin', userData.isAdmin ? 'true' : 'false');
    } catch (err) {
      console.error('Authentication error:', err);
      setError('Failed to load user data');
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserProfile, isTokenExpired, parseToken, BACKEND_URL]);

  // Login function
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }
      
      // Save token to local storage
      localStorage.setItem('access_token', data.access_token);
      
      // Parse token and set user data
      const userData = parseToken(data.access_token);
      
      if (!userData) {
        throw new Error('Invalid token received');
      }
      
      // Fetch additional user details
      const profileData = await fetchUserProfile(data.access_token);
      
      setUser({
        ...userData,
        ...profileData,
        token: data.access_token,
      });
      
      // Set admin status in local storage
      localStorage.setItem('isAdmin', userData.isAdmin ? 'true' : 'false');
      
      return true;
    } catch (err) {
      setError(err.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserProfile, parseToken]);

  // Registration function
  const register = useCallback(async (username, email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
      }
      
      return true;
    } catch (err) {
      setError(err.message || 'Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    // First update UI state immediately to show logged out
    setUser(null);
    
    // Clear auth tokens from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    
    // Clear achievements notification history
    localStorage.removeItem('notifiedAchievements');
    
    // Reset theme settings directly in localStorage to avoid circular dependency with useTheme
    localStorage.setItem("theme", "light");
    localStorage.setItem("premiumTheme", "default");
    localStorage.setItem("unlockedThemes", JSON.stringify(["default"]));
    
    // Dispatch events to notify all components about the logout
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("auth-change"));
    
    // Then call backend (after UI is already updated)
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (token) {
        // Call backend logout endpoint
        await fetch(`${BACKEND_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Error logging out from backend:', error);
    }
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();

    // Listen for storage events to sync auth state
    const handleStorageChange = (e) => {
      // Silent refresh without logging
      initializeAuth();
    };

    // Listen for custom auth-change events
    const handleAuthChange = () => {
      // Silent refresh without logging
      initializeAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [initializeAuth]);

  // Check if the user is authenticated - using a function that returns a value
  const checkIsAuthenticated = useCallback(() => {
    // Check if user exists and token is not expired
    return !!user && !isTokenExpired(user.expiry);
  }, [user, isTokenExpired]);

  // Verify email
  const verifyEmail = useCallback(async (token) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Email verification failed');
      }
      
      return true;
    } catch (err) {
      setError(err.message || 'Email verification failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Request password reset
  const requestPasswordReset = useCallback(async (email) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Password reset request failed');
      }
      
      return true;
    } catch (err) {
      setError(err.message || 'Password reset request failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (token, newPassword) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, new_password: newPassword }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Password reset failed');
      }
      
      return true;
    } catch (err) {
      setError(err.message || 'Password reset failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Change password function
  const changePassword = useCallback(async (oldPassword, newPassword) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch(`${BACKEND_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          old_password: oldPassword, 
          new_password: newPassword 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Password change failed');
      }
      
      return true;
    } catch (err) {
      setError(err.message || 'Password change failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update profile function
  const updateProfile = useCallback(async (profileData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch(`${BACKEND_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Profile update failed');
      }
      
      // Update local user state
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        
        // Update user data with new information
        const userData = parseToken(data.access_token);
        setUser(prevUser => ({
          ...prevUser,
          ...userData,
          token: data.access_token,
          username: data.username
        }));
      }
      
      return true;
    } catch (err) {
      setError(err.message || 'Profile update failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [parseToken]);

  // Provide the auth context to children
  const value = {
    user,
    isLoading,
    error,
    setError,
    login,
    register,
    logout,
    isAuthenticated: checkIsAuthenticated(),
    isAdmin: user?.isAdmin || false,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    changePassword,
    updateProfile,
    refreshUser: initializeAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth; 