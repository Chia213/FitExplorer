// src/utils/axiosConfig.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add an interceptor to include the token in requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // Make sure the token is properly formatted
      config.headers["Authorization"] = token.startsWith("Bearer ") 
        ? token 
        : `Bearer ${token}`;
      
      // Debug log
      console.log(`Request to ${config.url} with auth header: ${config.headers["Authorization"].substring(0, 15)}...`);
    } else {
      console.log(`Request to ${config.url} without auth token`);
    }
    return config;
  },
  (error) => {
    console.error("Axios request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Handle unauthorized errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(`API Error: ${error.config?.url || 'unknown endpoint'}`, error.response?.status, error.response?.data);
    
    if (error.response && error.response.status === 401) {
      // Redirect to login or refresh token
      console.log("401 Unauthorized error detected, redirecting to login");
      localStorage.removeItem("token");
      
      // Dispatch events to notify all components
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("auth-change"));
      
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
