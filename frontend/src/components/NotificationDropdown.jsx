import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaCheck, FaTrash, FaDumbbell, FaUser, FaCalendarAlt, FaLock, FaEllipsisH, FaSync } from 'react-icons/fa';
import { useNotifications } from '../contexts/NotificationContext';
import { useTheme } from '../hooks/useTheme';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead, deleteNotification, refreshNotifications } = useNotifications();
  const dropdownRef = useRef(null);
  const { theme } = useTheme();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Refresh notifications when dropdown is opened
  useEffect(() => {
    if (isOpen) {
      handleRefresh();
    }
  }, [isOpen]);

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshNotifications();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Handle mark as read
  const handleMarkAsRead = (e, id) => {
    e.stopPropagation();
    markAsRead(id);
  };

  // Handle delete
  const handleDelete = (e, id) => {
    e.stopPropagation();
    deleteNotification(id);
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString('en-GB');
  };

  // Get icon based on type
  const getIcon = (iconName, colorClass) => {
    switch (iconName) {
      case 'dumbbell':
        return <FaDumbbell className={colorClass} />;
      case 'user':
        return <FaUser className={colorClass} />;
      case 'calendar':
        return <FaCalendarAlt className={colorClass} />;
      case 'lock':
        return <FaLock className={colorClass} />;
      case 'check':
        return <FaCheck className={colorClass} />;
      default:
        return <FaBell className={colorClass} />;
    }
  };

  // Show limited number of notifications in dropdown
  const displayNotifications = notifications.slice(0, 5);
  const hasMoreNotifications = notifications.length > 5;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell icon with badge */}
      <button
        onClick={toggleDropdown}
        className="nav-item flex flex-col items-center p-3 hover:bg-sky-700/20 dark:hover:bg-sky-700/40 rounded-md transition-all"
        aria-label={`Notifications - ${unreadCount} unread`}
      >
        <div className="relative">
          <FaBell className="nav-icon" size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        <span className="nav-text text-sm mt-1">Alerts</span>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className={`absolute right-0 mt-1 w-80 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-lg rounded-md overflow-hidden z-50`}>
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex space-x-2">
              <button
                onClick={handleRefresh}
                className={`text-blue-500 hover:text-blue-700 ${isRefreshing ? 'opacity-50' : ''}`}
                disabled={isRefreshing}
                title="Refresh"
              >
                <FaSync className={isRefreshing ? 'animate-spin' : ''} size={14} />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-500 hover:text-blue-700"
                  title="Mark all as read"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : displayNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <FaBell className="mx-auto text-gray-300 dark:text-gray-600 text-2xl mb-2" />
                <p>No notifications</p>
              </div>
            ) : (
              <>
                {displayNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  >
                    <div className="flex">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notification.icon, notification.iconColor)}
                      </div>
                      <div className="ml-3 flex-grow">
                        <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatRelativeTime(notification.date)}
                        </p>
                      </div>
                      <div className="flex flex-shrink-0 space-x-1 ml-2">
                        {!notification.read && (
                          <button
                            onClick={(e) => handleMarkAsRead(e, notification.id)}
                            className="text-blue-500 hover:text-blue-700 p-1"
                            title="Mark as read"
                          >
                            <FaCheck size={12} />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(e, notification.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Delete notification"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {hasMoreNotifications && (
                  <div className="p-2 text-center border-t border-gray-100 dark:border-gray-700">
                    <Link
                      to="/notifications"
                      className="text-sm text-blue-500 hover:text-blue-700 flex items-center justify-center"
                      onClick={() => setIsOpen(false)}
                    >
                      <FaEllipsisH className="mr-1" size={12} />
                      View all notifications
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-2">
            <Link
              to="/notifications"
              className="block w-full text-center text-sm text-blue-500 hover:text-blue-700 py-1"
              onClick={() => setIsOpen(false)}
            >
              Manage Notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;