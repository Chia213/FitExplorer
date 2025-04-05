// adminUtils.js - For frontend admin utilities

/**
 * Helper function to check if the current user has admin privileges
 * @returns {Promise<boolean>} True if the user has admin privileges, false otherwise
 */
export const checkAdminStatus = async () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const response = await fetch(`${API_URL}/admin/stats/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Admin check error:", error);
    return false;
  }
};

/**
 * Format number with thousands separator
 * @param {number} num The number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Format date with day, month name, and year
 * @param {string} dateString ISO date string
 * @returns {string} Formatted date (e.g., "15 March 2023")
 */
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/**
 * Calculate time ago from date
 * @param {string} dateString ISO date string
 * @returns {string} Relative time (e.g., "2 days ago")
 */
export const timeAgo = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

/**
 * Format duration in minutes to hours and minutes
 * @param {number} minutes Duration in minutes
 * @returns {string} Formatted duration (e.g., "1h 30m")
 */
export const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

/**
 * Calculate percentage change between two values
 * @param {number} current Current value
 * @param {number} previous Previous value
 * @returns {string} Formatted percentage change
 */
export const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? "+∞%" : "0%";

  const change = ((current - previous) / previous) * 100;
  return (change > 0 ? "+" : "") + change.toFixed(1) + "%";
};
