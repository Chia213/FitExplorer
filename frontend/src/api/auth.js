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
  const token = localStorage.getItem("token");
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
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  // Explicitly check admin status after login
  try {
    const isAdmin = await checkAdminStatus();
    if (!isAdmin) {
      localStorage.removeItem("isAdmin");
    }
  } catch (adminErr) {
    console.error("Error checking admin status:", adminErr);
    localStorage.removeItem("isAdmin");
  }

  return data;
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
