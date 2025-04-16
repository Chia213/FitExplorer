import axios from 'axios';
import { Platform } from 'react-native';
import { retrieveData } from '../utils/storage';
import Constants from 'expo-constants';

// Configure the base URL based on the environment
const getBaseUrl = () => {
  // Use the API URL from environment variables if available
  const envApiUrl = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;
  if (envApiUrl) {
    console.log(`Using API URL from env: ${envApiUrl}`);
    return envApiUrl;
  }
  
  // For iOS simulator talking to localhost on the Mac
  if (__DEV__ && Platform.OS === 'ios') {
    return 'http://localhost:8000';
  }
  
  // For Android emulator, localhost means the emulator itself, not the host machine
  if (__DEV__ && Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }
  
  // For web, use relative URL in development and production URLs in production
  if (Platform.OS === 'web') {
    return '/api';
  }
  
  // For production mobile apps - fallback
  return 'https://fitexplorer.se/api';
};

// Create axios instance
const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Log the current API URL in dev mode
if (__DEV__) {
  console.log(`API URL: ${apiClient.defaults.baseURL}`);
}

// Add a request interceptor to include auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await retrieveData('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Log detailed error info in dev mode
    if (__DEV__) {
      console.error(`API Error: ${error.message}`);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.error('URL:', originalRequest?.url);
    }
    
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // In a real app, you might refresh the token here
      // For now, just reject and let the auth context handle logout
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 