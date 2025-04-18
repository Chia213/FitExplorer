/**
 * Authentication service for managing tokens and auth-related functions
 */
import { API_URL } from "../config";

/**
 * Gets the authentication token from localStorage
 * @returns {string|null} The authentication token or null if not found
 */
export const getToken = () => {
  // Try to get token from both possible storage locations
  const accessToken = localStorage.getItem('access_token');
  const legacyToken = localStorage.getItem('token');
  
  // Debug logs in development only
  if (process.env.NODE_ENV === 'development') {
    console.log('Token check - access_token:', accessToken ? 'exists' : 'missing');
    console.log('Token check - legacy token:', legacyToken ? 'exists' : 'missing');
  }
  
  // Return the access_token if it exists, otherwise try the legacy token
  return accessToken || legacyToken || null;
};

/**
 * Checks if the user is authenticated
 * @returns {boolean} True if the user has a valid token, false otherwise
 */
export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

/**
 * Validate token with the backend to ensure it's still valid
 * @returns {Promise<boolean>} True if the token is valid, false otherwise
 */
export const validateToken = async () => {
  try {
    const token = getToken();
    if (!token) return false;
    
    const response = await fetch(`${API_URL}/auth/validate-token`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error("Error validating token:", error);
    return false;
  }
};

/**
 * Try to refresh the authentication token
 * @returns {Promise<boolean>} True if token was refreshed successfully
 */
export const refreshToken = async () => {
  try {
    const token = getToken();
    if (!token) return false;
    
    const response = await fetch(`${API_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('token', data.access_token); // For backward compatibility
        localStorage.setItem('last_login', Date.now().toString()); // Update last login time
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return false;
  }
};

/**
 * Checks if token has likely expired (based on session timeout)
 * @returns {boolean} True if the token is likely expired
 */
export const isTokenExpired = () => {
  try {
    const token = getToken();
    if (!token) return true;
    
    // For JWT tokens, we can decode and check exp
    if (token.split('.').length === 3) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp) {
        return Date.now() >= payload.exp * 1000;
      }
    }
    
    // Fallback: check last login time
    const lastLogin = localStorage.getItem('last_login');
    if (lastLogin) {
      // Consider expired after 24 hours
      const expireTime = 24 * 60 * 60 * 1000; // 24 hours
      return Date.now() - parseInt(lastLogin, 10) > expireTime;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Auth service object with authentication-related methods
 */
const authService = {
  getToken,
  isAuthenticated,
  isTokenExpired,
  validateToken,
  refreshToken
};

export default authService; 