import { API_URL } from "../config";

// Login user
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Login failed");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Get user sessions
export const getUserSessions = async () => {
  const token = localStorage.getItem("access_token");
  
  try {
    const response = await fetch(`${API_URL}/auth/sessions`, {
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json" 
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch sessions");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Revoke a specific session
export const revokeSession = async (sessionId) => {
  const token = localStorage.getItem("access_token");
  
  try {
    const response = await fetch(`${API_URL}/auth/sessions/revoke/${sessionId}`, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json" 
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to revoke session");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Revoke all other sessions
export const revokeAllSessions = async () => {
  const token = localStorage.getItem("access_token");
  
  try {
    const response = await fetch(`${API_URL}/auth/sessions/revoke-all`, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json" 
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to revoke all sessions");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Update session settings
export const updateSessionSettings = async (allowMultipleSessions) => {
  const token = localStorage.getItem("access_token");
  
  try {
    const response = await fetch(`${API_URL}/auth/sessions/settings`, {
      method: "PUT",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ allow_multiple_sessions: allowMultipleSessions }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to update session settings");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Register user
export const registerUser = async (username, email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Registration failed");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Check if user is admin
export const checkAdminStatus = async () => {
  const token = localStorage.getItem("token") || localStorage.getItem("access_token");
  if (!token) return false;

  try {
    // Parse JWT payload without making a request
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const { is_admin } = JSON.parse(jsonPayload);
    localStorage.setItem("isAdmin", is_admin ? "true" : "false");
    return Boolean(is_admin);
  } catch (error) {
    console.error("Error checking admin status:", error);
    localStorage.setItem("isAdmin", "false");
    return false;
  }
};

// Logout user
export const logoutUser = async () => {
  const token = localStorage.getItem("token") || localStorage.getItem("access_token");
  if (!token) return;

  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json" 
      },
    });
  } catch (error) {
    console.error("Error during logout:", error);
  } finally {
    // Clear tokens from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("isAdmin");
  }
}; 