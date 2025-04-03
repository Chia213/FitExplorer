import { createContext, useContext, useState, useEffect } from 'react';

// Create context
const NotificationContext = createContext(null);

// Mock notification data generator
const generateMockNotifications = () => {
  const now = new Date();
  
  return [
    {
      id: 1,
      type: "workout_completed",
      message: "You completed your leg day workout! Great job!",
      date: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      read: false,
      icon: "dumbbell",
      iconColor: "text-green-500"
    },
    {
      id: 2,
      type: "profile_updated",
      message: "Your profile picture was updated successfully.",
      date: new Date(now.getTime() - 1000 * 60 * 60 * 26).toISOString(), // 26 hours ago
      read: true,
      icon: "user",
      iconColor: "text-blue-500"
    },
    {
      id: 3,
      type: "password_changed",
      message: "Your password was successfully changed. If this wasn't you, please contact support.",
      date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
      read: true,
      icon: "lock",
      iconColor: "text-red-500"
    },
    {
      id: 4,
      type: "workout_reminder",
      message: "Don't forget your scheduled upper body workout today!",
      date: new Date(now.getTime() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      read: false,
      icon: "calendar",
      iconColor: "text-purple-500"
    },
    {
      id: 5,
      type: "goal_achieved",
      message: "Congratulations! You've reached your monthly workout goal.",
      date: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
      read: false,
      icon: "check",
      iconColor: "text-yellow-500"
    }
  ];
};

// Provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load notifications when component mounts
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        // Example: const response = await fetch('/api/notifications');
        
        // For now, use mock data with a slight delay to simulate API call
        setTimeout(() => {
          const mockData = generateMockNotifications();
          setNotifications(mockData);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Mark a notification as read
  const markAsRead = (id) => {
    setNotifications(
      notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(
      notifications.map(notification => ({ ...notification, read: true }))
    );
  };

  // Delete a notification
  const deleteNotification = (id) => {
    setNotifications(
      notifications.filter(notification => notification.id !== id)
    );
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
  };

  // Add a new notification
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  // Get unread count
  const unreadCount = notifications.filter(notification => !notification.read).length;

  const value = {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    addNotification
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
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Remove the default export to avoid circular reference