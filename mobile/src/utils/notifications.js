import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request permission to show notifications
 * @returns {Promise<boolean>} Whether permission was granted
 */
export async function requestNotificationsPermission() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  // Only ask if permissions haven't already been determined
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  // Return true if permission was granted
  return finalStatus === 'granted';
}

/**
 * Schedule a local notification
 * @param {string} title - Notification title
 * @param {string} body - Notification body text
 * @param {Object} data - Data to attach to the notification
 * @param {number} seconds - Seconds to wait before showing the notification
 * @returns {Promise<string>} Notification identifier
 */
export async function scheduleLocalNotification(title, body, data = {}, seconds = 2) {
  // Request permission first
  const hasPermission = await requestNotificationsPermission();
  
  if (!hasPermission) {
    console.warn('Notification permission not granted');
    return null;
  }
  
  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        // Only iOS can have sound and badge on local notifications in Expo Go
        ...(Platform.OS === 'ios' ? { sound: 'default', badge: 1 } : {}),
      },
      trigger: { seconds },
    });
    
    return identifier;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Cancel a specific notification by ID
 * @param {string} notificationId - The notification identifier to cancel
 */
export async function cancelNotification(notificationId) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/**
 * Setup a notification listener
 * @param {Function} callback - Function to call when notification is received
 * @returns {Function} Function to remove the listener
 */
export function addNotificationListener(callback) {
  const subscription = Notifications.addNotificationReceivedListener(callback);
  
  // Return a cleanup function
  return () => subscription.remove();
} 