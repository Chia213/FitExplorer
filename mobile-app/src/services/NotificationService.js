import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  async registerForPushNotifications() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Push notification token:', token);
    } else {
      alert('Must use physical device for Push Notifications');
    }

    return token;
  }

  async scheduleWorkoutReminder(title, body, triggerTime) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        sound: 'default',
      },
      trigger: triggerTime,
    });
  }

  async scheduleDailyWorkoutReminder() {
    // Schedule daily workout reminder at 7 AM
    const trigger = {
      hour: 7,
      minute: 0,
      repeats: true,
    };

    await this.scheduleWorkoutReminder(
      '💪 Time for your workout!',
      'Your fitness journey continues today. Ready to crush your goals?',
      trigger
    );
  }

  async scheduleProgressReminder() {
    // Schedule weekly progress reminder
    const trigger = {
      weekday: 1, // Monday
      hour: 9,
      minute: 0,
      repeats: true,
    };

    await this.scheduleWorkoutReminder(
      '📊 Weekly Progress Check',
      'Check your fitness progress and celebrate your achievements!',
      trigger
    );
  }

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

export default new NotificationService();
