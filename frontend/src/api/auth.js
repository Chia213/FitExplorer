const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const registerUser = async (email, password, username) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, username }),
    });
    
    return await response.json();
  } catch (error) {
    // This will catch network errors when the backend is down
    throw new Error("Cannot connect to the server. Please check if the backend is running.");
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Login failed');
    }

    return await response.json();
  } catch (error) {
    // Check if it's a network error (backend not running)
    if (error.message === "Failed to fetch" || error.name === "TypeError") {
      throw new Error("Cannot connect to the server. Please check if the backend is running.");
    }
    throw error;
  }
};