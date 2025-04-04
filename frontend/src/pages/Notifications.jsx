import { useState, useEffect } from "react";
import { FaBell, FaTrash, FaCheck, FaDumbbell, FaUser, FaCalendarAlt, FaLock, FaSync } from "react-icons/fa";
import { useTheme } from "../hooks/useTheme";
import { useNotifications } from "../contexts/NotificationContext";

const Notifications = () => {
  const { theme } = useTheme();
  const { 
    notifications, 
    loading, 
    error,
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll,
    refreshNotifications
  } = useNotifications();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshNotifications();
    setTimeout(() => setIsRefreshing(false), 500); // Show spinner for at least 500ms
  };

  // Handle clear all with confirmation
  const handleClearAll = async () => {
    try {
      await clearAll();
      setShowClearAllConfirm(false);
    } catch (error) {
      // Convert any error to string before displaying
      alert(typeof error === 'string' ? error : 'Failed to clear notifications. Please try again.');
    }
  };

  // Format date to relative time (e.g., "2 hours ago")
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
  };

  // Get icon based on notification type
  const getIcon = (notification) => {
    switch (notification.icon) {
      case 'dumbbell':
        return <FaDumbbell className={notification.iconColor} />;
      case 'user':
        return <FaUser className={notification.iconColor} />;
      case 'calendar':
        return <FaCalendarAlt className={notification.iconColor} />;
      case 'lock':
        return <FaLock className={notification.iconColor} />;
      case 'check':
        return <FaCheck className={notification.iconColor} />;
      default:
        return <FaBell className={notification.iconColor || "text-blue-500"} />;
    }
  };

  return (
    <div className={`min-h-screen p-6 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center">
            <FaBell className="mr-2 text-yellow-500" /> Notifications
            {unreadCount > 0 && (
              <span className="ml-2 text-sm bg-red-500 text-white rounded-full px-2 py-1">
                {unreadCount} new
              </span>
            )}
          </h1>
          
          <div className="flex space-x-2">
            <button 
              onClick={handleRefresh}
              className={`px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isRefreshing}
            >
              <FaSync className={`mr-1 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh
            </button>
            
            {notifications.length > 0 && (
              <>
                <button 
                  onClick={markAllAsRead}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  disabled={unreadCount === 0}
                >
                  Mark all as read
                </button>
                <button 
                  onClick={() => setShowClearAllConfirm(true)}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Clear all
                </button>
              </>
            )}
          </div>
        </div>

        {/* Clear All Confirmation Modal */}
        {showClearAllConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Clear All Notifications</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete all notifications? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowClearAllConfirm(false)}
                  className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-red-500 dark:text-red-400">{error}</p>
            <button 
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                <FaBell className="text-gray-400 text-5xl mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">No notifications</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  You're all caught up! New notifications will appear here.
                </p>
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`p-4 rounded-lg shadow-sm flex justify-between items-start ${
                    notification.read
                      ? "bg-white dark:bg-gray-800"
                      : "bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500"
                  }`}
                >
                  <div className="flex">
                    <div className="mt-1 mr-3">
                      {getIcon(notification)}
                    </div>
                    <div>
                      <p className={`${notification.read ? "" : "font-semibold"}`}>
                        {notification.message}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {formatRelativeTime(notification.date)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    {!notification.read && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Mark as read"
                      >
                        <FaCheck />
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(notification.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete notification"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;