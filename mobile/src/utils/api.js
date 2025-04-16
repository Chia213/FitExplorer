import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Constants
export const API_URL = 'http://localhost:8000'; // Update with your actual API URL

// Create axios instance
export const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add request interceptor for authentication
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      
      if (token) {
        // Make sure the token is properly formatted
        config.headers.Authorization = token.startsWith('Bearer ')
          ? token
          : `Bearer ${token}`;
          
        console.log(`Request to ${config.url} with auth`);
      } else {
        console.log(`Request to ${config.url} without auth token`);
      }
      
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return config;
    }
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Handle unauthorized errors and token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error(`API Error: ${error.config?.url || 'unknown endpoint'}`,
      error.response?.status,
      error.response?.data
    );
    
    const originalRequest = error.config;
    
    // If unauthorized and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refresh_token: refreshToken
        });
        
        if (response.status === 200) {
          // Save new tokens
          const { access_token, refresh_token } = response.data;
          
          await AsyncStorage.setItem('token', access_token);
          
          if (refresh_token) {
            await AsyncStorage.setItem('refreshToken', refresh_token);
          }
          
          // Update auth header and retry original request
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        
        // Clear auth data
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('refreshToken');
        await AsyncStorage.removeItem('user');
        
        // Notify auth change (would be handled by the app's auth context)
        if (Platform.OS === 'web') {
          window.dispatchEvent(new Event('auth-change'));
        }
        
        // For React Native, you would dispatch an event or use context here
        // to handle logout and navigation
        
        return Promise.reject(new Error('Session expired. Please log in again.'));
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Helper function to handle API errors consistently
 */
export const handleApiError = (error) => {
  let errorMessage = 'An unexpected error occurred';
  
  if (error.response) {
    // Server responded with an error status
    const { status, data } = error.response;
    
    if (status === 400) {
      errorMessage = data.message || 'Invalid request';
    } else if (status === 401) {
      errorMessage = 'Please log in to continue';
    } else if (status === 403) {
      errorMessage = 'You do not have permission to perform this action';
    } else if (status === 404) {
      errorMessage = 'The requested resource was not found';
    } else if (status === 422) {
      errorMessage = data.message || 'Validation error';
    } else if (status >= 500) {
      errorMessage = 'Server error. Please try again later';
    }
  } else if (error.request) {
    // Request was made but no response received
    errorMessage = 'No response from server. Please check your internet connection';
  }
  
  return {
    message: errorMessage,
    originalError: error
  };
};

/**
 * Wrapper function to consistently format API responses
 */
export const apiRequest = async (method, endpoint, data = null, options = {}) => {
  try {
    const config = {
      method,
      url: endpoint,
      ...options
    };
    
    if (data) {
      if (method.toLowerCase() === 'get') {
        config.params = data;
      } else {
        config.data = data;
      }
    }
    
    const response = await axiosInstance(config);
    
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    const errorInfo = handleApiError(error);
    
    return {
      success: false,
      error: errorInfo.message,
      originalError: errorInfo.originalError,
      status: error.response?.status
    };
  }
};

// API helper methods
export const api = {
  get: (endpoint, params, options) => apiRequest('get', endpoint, params, options),
  post: (endpoint, data, options) => apiRequest('post', endpoint, data, options),
  put: (endpoint, data, options) => apiRequest('put', endpoint, data, options),
  patch: (endpoint, data, options) => apiRequest('patch', endpoint, data, options),
  delete: (endpoint, options) => apiRequest('delete', endpoint, null, options)
};

export default api; 