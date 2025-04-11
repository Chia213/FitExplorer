// fetchWithTokenRefresh.js
// Utility for making API requests with automatic token refresh capability

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Makes a fetch request with the current auth token, and handles token refresh if needed
 * @param {string} endpoint - The API endpoint to call (without the base URL)
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<Response>} - The fetch response
 */
export const fetchWithTokenRefresh = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");
  if (!token && endpoint !== "/auth/refresh-token") {
    throw new Error("No authentication token found");
  }

  // Prepare headers with auth token
  const headers = {
    ...options.headers,
    "Content-Type": options.headers?.["Content-Type"] || "application/json",
  };

  if (token && endpoint !== "/auth/refresh-token") {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Make the request
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // If unauthorized and not already trying to refresh token
    if (response.status === 401 && endpoint !== "/auth/refresh-token") {
      console.log("Token expired, attempting to refresh...");
      
      try {
        // Try to refresh the token
        const refreshResponse = await fetch(`${API_URL}/auth/refresh-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: localStorage.getItem("refreshToken") }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          localStorage.setItem("token", data.access_token);
          
          if (data.refresh_token) {
            localStorage.setItem("refreshToken", data.refresh_token);
          }

          // Retry the original request with the new token
          headers["Authorization"] = `Bearer ${data.access_token}`;
          return fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
          });
        } else {
          // If refresh fails, logout
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("isAdmin");
          
          // Dispatch events to notify all components
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new Event("auth-change"));
          
          window.location.href = "/login";
          throw new Error("Session expired. Please log in again.");
        }
      } catch (error) {
        console.error("Error refreshing token:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("isAdmin");
        
        // Dispatch events to notify all components
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("auth-change"));
        
        window.location.href = "/login";
        throw new Error("Session expired. Please log in again.");
      }
    }

    return response;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}; 