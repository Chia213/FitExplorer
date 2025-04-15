import { createContext, useContext, useState, useEffect } from 'react';
import { apiUrl } from '../utils/config';

// Create context
const NotificationContext = createContext(null);

// Provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [achievementAlertsEnabled, setAchievementAlertsEnabled] = useState(true);
  const [allNotificationsEnabled, setAllNotificationsEnabled] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);

  // Load notifications when component mounts
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Get token from local storage
      const token = localStorage.getItem('token');
      if (!token) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${apiUrl}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Load achievement alerts setting
  const fetchAchievementAlertsSetting = async () => {
    setSettingsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSettingsLoading(false);
        return;
      }

      const response = await fetch(`${apiUrl}/notifications/settings/achievement-alerts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch achievement alerts setting');
      }

      const data = await response.json();
      setAchievementAlertsEnabled(data.enabled);
      
      // Also update localStorage to keep it in sync with backend
      // This helps any components that are still checking localStorage
      localStorage.setItem('achievementAlerts', data.enabled.toString());
    } catch (error) {
      console.error('Error fetching achievement alerts setting:', error);
      // Fallback to localStorage value if API fails
      const localValue = localStorage.getItem('achievementAlerts');
      if (localValue !== null) {
        setAchievementAlertsEnabled(localValue !== 'false');
      }
    } finally {
      setSettingsLoading(false);
    }
  };
  
  // Load all notifications setting
  const fetchAllNotificationsSetting = async () => {
    setSettingsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSettingsLoading(false);
        return;
      }

      const response = await fetch(`${apiUrl}/notifications/settings/all-notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch all notifications setting');
      }

      const data = await response.json();
      setAllNotificationsEnabled(data.enabled);
      
      // Also update localStorage for backward compatibility
      localStorage.setItem('allNotifications', data.enabled.toString());
    } catch (error) {
      console.error('Error fetching all notifications setting:', error);
      // Fallback to localStorage value if API fails
      const localValue = localStorage.getItem('allNotifications');
      if (localValue !== null) {
        setAllNotificationsEnabled(localValue !== 'false');
      }
    } finally {
      setSettingsLoading(false);
    }
  };

  // Update achievement alerts setting
  const updateAchievementAlertsSetting = async (enabled) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const response = await fetch(`${apiUrl}/notifications/settings/achievement-alerts`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enabled })
      });

      if (!response.ok) {
        throw new Error('Failed to update achievement alerts setting');
      }

      const data = await response.json();
      setAchievementAlertsEnabled(data.enabled);
      
      // Update localStorage to keep it in sync
      localStorage.setItem('achievementAlerts', data.enabled.toString());
      return true;
    } catch (error) {
      console.error('Error updating achievement alerts setting:', error);
      return false;
    }
  };
  
  // Update all notifications setting
  const updateAllNotificationsSetting = async (enabled) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const response = await fetch(`${apiUrl}/notifications/settings/all-notifications`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enabled })
      });

      if (!response.ok) {
        throw new Error('Failed to update all notifications setting');
      }

      const data = await response.json();
      setAllNotificationsEnabled(data.enabled);
      
      // Update localStorage to keep it in sync
      localStorage.setItem('allNotifications', data.enabled.toString());
      return true;
    } catch (error) {
      console.error('Error updating all notifications setting:', error);
      return false;
    }
  };

  // Add token change listener
  useEffect(() => {
    const handleTokenChange = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        // Reset to defaults when logged out
        setNotifications([]);
        setAchievementAlertsEnabled(true);
        setAllNotificationsEnabled(true);
      } else {
        // Fetch new user's notifications when logged in
        fetchNotifications();
        fetchAchievementAlertsSetting();
        fetchAllNotificationsSetting();
      }
    };

    // Listen for storage events to detect token changes
    window.addEventListener('storage', handleTokenChange);
    
    // Also run once on mount
    handleTokenChange();
    
    return () => {
      window.removeEventListener('storage', handleTokenChange);
    };
  }, []);

  // Mark a notification as read
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${apiUrl}/notifications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ read: true })
      });

      if (!response.ok) {
        throw new Error('Failed to update notification');
      }

      setNotifications(
        notifications.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${apiUrl}/notifications/mark-all-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      setNotifications(
        notifications.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete a notification
  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${apiUrl}/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      setNotifications(
        notifications.filter(notification => notification.id !== id)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Clear all notifications
  const clearAll = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("You need to be logged in to clear notifications");
      }

      const response = await fetch(`${apiUrl}/notifications/clear-all`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          throw new Error(data.detail || "Failed to clear notifications");
        } catch (e) {
          throw new Error(text || "Failed to clear notifications");
        }
      }

      setNotifications([]); // Clear the notifications state
    } catch (error) {
      console.error("Error clearing notifications:", error);
      throw error; // Re-throw the error to be handled by the component
    }
  };

  // Add a new notification (for local testing)
  const addNotification = async (notification) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${apiUrl}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: notification.message,
          type: notification.type,
          icon: notification.icon || 'bell',
          icon_color: notification.iconColor || 'text-blue-500'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create notification');
      }

      const data = await response.json();
      setNotifications(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  // Get unread count
  const unreadCount = notifications.filter(notification => !notification.read).length;

  // Toggle achievement alerts
  const toggleAchievementAlerts = async () => {
    const newValue = !achievementAlertsEnabled;
    const success = await updateAchievementAlertsSetting(newValue);
    if (!success) {
      // Fallback to just updating localStorage if API fails
      setAchievementAlertsEnabled(newValue);
      localStorage.setItem('achievementAlerts', newValue.toString());
    }
    return newValue;
  };
  
  // Toggle all notifications
  const toggleAllNotifications = async () => {
    const newValue = !allNotificationsEnabled;
    const success = await updateAllNotificationsSetting(newValue);
    if (!success) {
      // Fallback to just updating localStorage if API fails
      setAllNotificationsEnabled(newValue);
      localStorage.setItem('allNotifications', newValue.toString());
    }
    return newValue;
  };

  const value = {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    addNotification,
    refreshNotifications: fetchNotifications,
    achievementAlertsEnabled,
    toggleAchievementAlerts,
    allNotificationsEnabled,
    toggleAllNotifications,
    settingsLoading
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    // Return default values when NotificationContext is not available
    return {
      notifications: [],
      loading: false,
      error: null,
      unreadCount: 0,
      markAsRead: () => {},
      markAllAsRead: () => {},
      deleteNotification: () => {},
      clearAll: () => {},
      addNotification: () => {},
      achievementAlertsEnabled: true,
      allNotificationsEnabled: true,
      toggleAchievementAlerts: () => {},
      toggleAllNotifications: () => {},
      settingsLoading: false
    };
  }
  
  // Calculate unread count from the notifications array
  const unreadCount = context.notifications.filter(notification => !notification.read).length;
  
  return {
    ...context,
    unreadCount
  };
};