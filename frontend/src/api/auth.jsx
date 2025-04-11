const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const registerUser = async (email, password, username) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password, username }),
  });
  return response.json();
};

export const checkAdminStatus = async () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    localStorage.removeItem("isAdmin");
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/admin/stats/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      localStorage.setItem("isAdmin", "true");
      return true;
    } else {
      localStorage.removeItem("isAdmin");
      return false;
    }
  } catch (error) {
    console.error("Error checking admin status:", error);
    localStorage.removeItem("isAdmin");
    return false;
  }
};

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    // Clone the response before reading it
    const responseClone = response.clone();
    
    // Try to parse error as JSON for the detailed message
    try {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Login failed (${response.status})`);
    } catch (jsonError) {
      // If the response is not JSON, use the text from the cloned response
      try {
        const errorText = await responseClone.text();
        throw new Error(errorText || `Login failed (${response.status})`);
      } catch (textError) {
        // If all else fails, throw a generic error with the status code
        throw new Error(`Login failed (${response.status})`);
      }
    }
  }

  const data = await response.json();

  // Explicitly check admin status
  try {
    const adminCheckResponse = await fetch(`${API_URL}/admin/stats/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${data.access_token}`,
        "Content-Type": "application/json",
      },
    });

    // Set isAdmin based on the response
    localStorage.setItem("isAdmin", adminCheckResponse.ok ? "true" : "false");
  } catch (error) {
    console.error("Error checking admin status:", error);
    localStorage.setItem("isAdmin", "false");
  }

  return data;
};
