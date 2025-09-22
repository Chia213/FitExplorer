// Create a file at frontend/src/components/admin/RecentRegistrationsCard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaCalendarAlt, FaCheck, FaTimes } from "react-icons/fa";
import Card from "../Card";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function RecentRegistrationsCard() {
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        // Get the most recent users
        const response = await fetch(`${API_URL}/admin/users?limit=5`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch recent users");
        }

        const users = await response.json();
        // Sort by creation date, newest first
        const sortedUsers = users
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);

        setRecentUsers(sortedUsers);
      } catch (error) {
        console.error("Error fetching recent registrations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentUsers();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <Card
      title="Recent Registrations"
      icon={<FaUser className="text-green-500" />}
      elevated
      headerAction={
        <button
          onClick={() => navigate("/admin/users")}
          className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          View All
        </button>
      }
    >
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : recentUsers.length === 0 ? (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          No recent registrations
        </div>
      ) : (
        <div className="space-y-3">
          {recentUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center space-x-3 p-2 sm:p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <FaUser className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.username}
                </p>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <FaCalendarAlt className="mr-1" />
                  <span className="truncate">
                    {formatDate(user.created_at)}
                  </span>
                </div>
              </div>
              <div className="inline-flex flex-col items-end">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {getTimeAgo(user.created_at)}
                </span>
                <span
                  className={`mt-1 text-xs px-2 py-0.5 rounded-full ${
                    user.is_verified
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
                  }`}
                >
                  {user.is_verified ? (
                    <>
                      <FaCheck className="inline mr-1" size={8} />
                      <span className="hidden sm:inline">Verified</span>
                      <span className="sm:hidden">✓</span>
                    </>
                  ) : (
                    <>
                      <FaTimes className="inline mr-1" size={8} />
                      <span className="hidden sm:inline">Unverified</span>
                      <span className="sm:hidden">✗</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default RecentRegistrationsCard;
