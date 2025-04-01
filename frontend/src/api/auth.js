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

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const fetchUserData = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_URL}/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user data: ${response.status}`);
  }

  return response.json();
};

export const checkAdminStatus = async () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    // Try to access an admin-only endpoint
    const response = await fetch(`${API_URL}/admin/stats/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // If the request is successful, the user is an admin
    if (response.ok) {
      localStorage.setItem("isAdmin", "true");
      return true;
    } else {
      // This is expected for non-admin users - don't treat it as an error
      localStorage.setItem("isAdmin", "false");
      return false;
    }
  } catch (error) {
    console.error("Error checking admin status:", error);
    localStorage.setItem("isAdmin", "false");
    return false;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("isAdmin");
};
