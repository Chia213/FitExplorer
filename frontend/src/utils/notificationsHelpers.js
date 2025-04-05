// src/utils/notificationHelpers.js
import { apiUrl } from './config';

/**
 * Check if notifications are enabled globally
 * @returns {boolean} Whether all notifications are enabled
 */
const areNotificationsEnabled = () => {
  const notificationsValue = localStorage.getItem('allNotifications');
  return notificationsValue === null || notificationsValue === 'true';
};

/**
 * Check if achievement alerts are enabled
 * @returns {boolean} Whether achievement alerts are enabled
 */
const areAchievementAlertsEnabled = () => {
  const achievementAlertsValue = localStorage.getItem('achievementAlerts');
  return achievementAlertsValue === null || achievementAlertsValue === 'true';
};

/**
 * Helper function to create a notification
 * @param {string} message - The notification message
 * @param {string} type - The notification type
 * @param {string} icon - The icon to display
 * @param {string} iconColor - The icon color (Tailwind CSS class)
 * @returns {Promise} - The fetch promise
 */
export const createNotification = async (message, type, icon = 'bell', iconColor = 'text-blue-500') => {
  // Add detailed logging to debug notification creation
  console.log(`Creating notification: "${message}" of type: ${type}`);
  
  // Check if all notifications are disabled
  if (!areNotificationsEnabled()) {
    console.log('Notifications are disabled. Skipping notification:', message);
    return null;
  }
  
  // For achievement notifications, check the achievement-specific setting
  if (type === 'achievement_earned' && !areAchievementAlertsEnabled()) {
    console.log('Achievement alerts are disabled. Skipping achievement notification:', message);
    return null;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    console.log('No auth token found. Skipping notification:', message);
    return null;
  }

  try {
    console.log(`Sending notification to API: ${message}`);
    const response = await fetch(`${apiUrl}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message,
        type,
        icon,
        icon_color: iconColor
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Notification API error:', errorData);
      throw new Error('Failed to create notification');
    }

    const result = await response.json();
    console.log('Notification created successfully:', result);
    return result;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Predefined notification functions for common events
export const notifyWorkoutCompleted = (workoutName) => {
  return createNotification(
    `You completed your "${workoutName}" workout!`,
    'workout_completed',
    'dumbbell',
    'text-green-500'
  );
};

export const notifyProfileUpdated = () => {
  return createNotification(
    'Your profile was updated successfully.',
    'profile_updated',
    'user',
    'text-blue-500'
  );
};

export const notifyPersonalInfoUpdated = () => {
  return createNotification(
    'Your personal information was updated successfully.',
    'personal_info_updated',
    'user',
    'text-blue-500'
  );
};

export const notifyHeightUpdated = (height) => {
  return createNotification(
    `Your height was updated to ${height} cm.`,
    'height_updated',
    'ruler-vertical',
    'text-blue-500'
  );
};

export const notifyWeightUpdated = (weight) => {
  return createNotification(
    `Your weight was updated to ${weight} kg.`,
    'weight_updated',
    'weight',
    'text-green-500'
  );
};

export const notifyAgeUpdated = (age) => {
  return createNotification(
    `Your age was updated to ${age} years.`,
    'age_updated',
    'calendar',
    'text-orange-500'
  );
};

export const notifyGenderUpdated = () => {
  return createNotification(
    'Your gender information was updated.',
    'gender_updated',
    'user',
    'text-purple-500'
  );
};

export const notifyFitnessGoalsUpdated = () => {
  return createNotification(
    'Your fitness goals were updated.',
    'fitness_goals_updated',
    'bullseye',
    'text-red-500'
  );
};

export const notifyBioUpdated = () => {
  return createNotification(
    'Your bio was updated.',
    'bio_updated',
    'edit',
    'text-indigo-500'
  );
};

export const notifyProfilePictureUpdated = () => {
  return createNotification(
    'Your profile picture was updated successfully.',
    'profile_picture_updated',
    'camera',
    'text-blue-500'
  );
};

export const notifyCardColorUpdated = () => {
  return createNotification(
    'Your card color was updated successfully.',
    'card_color_updated',
    'paint-brush',
    'text-indigo-500'
  );
};

export const notifyWeightGoalUpdated = (goalWeight) => {
  return createNotification(
    `Your weight goal was updated to ${goalWeight} kg.`,
    'weight_goal_updated',
    'weight-hanging',
    'text-purple-500'
  );
};

export const notifyWorkoutFrequencyGoalUpdated = (frequencyGoal) => {
  console.log(`Creating workout frequency notification with value: ${frequencyGoal} (${typeof frequencyGoal})`);
  
  // Handle different data types more explicitly
  let frequencyText;
  if (frequencyGoal === null || frequencyGoal === undefined || frequencyGoal === '') {
    frequencyText = 'daily workouts';
    console.log("Detected null/empty frequency goal, using 'daily workouts'");
  } else {
    const goalNumber = parseInt(frequencyGoal);
    frequencyText = `${goalNumber} ${goalNumber === 1 ? 'workout' : 'workouts'} per week`;
    console.log(`Formatting frequency goal as: ${frequencyText}`);
  }
  
  const message = `Your workout frequency goal was updated to ${frequencyText}.`;
  console.log(`Notification message: ${message}`);
  
  return createNotification(
    message,
    'workout_frequency_updated',
    'calendar-check',
    'text-green-500'
  );
};

export const notifyPasswordChanged = () => {
  return createNotification(
    'Your password was changed successfully.',
    'password_changed',
    'lock',
    'text-red-500'
  );
};

export const notifyWorkoutReminder = (workoutName) => {
  return createNotification(
    `Don't forget your scheduled "${workoutName}" workout today!`,
    'workout_reminder',
    'calendar',
    'text-purple-500'
  );
};

export const notifyGoalAchieved = (goal) => {
  return createNotification(
    `Congratulations! You've reached your ${goal} goal.`,
    'goal_achieved',
    'check',
    'text-yellow-500'
  );
};

export const notifyRoutineCreated = (routineName) => {
  return createNotification(
    `New routine "${routineName}" created successfully.`,
    'routine_created',
    'dumbbell',
    'text-indigo-500'
  );
};

export const notifyProgramStarted = (programName) => {
  return createNotification(
    `You've started the "${programName}" workout program.`,
    'program_started',
    'calendar',
    'text-green-500'
  );
};

export const notifyUsernameChanged = (newUsername) => {
  return createNotification(
    `Your username has been changed to "${newUsername}".`,
    'username_changed',
    'user',
    'text-blue-500'
  );
};

export const notifyPersonalRecord = (exerciseName, weight, unit) => {
  return createNotification(
    `New Personal Record! ${exerciseName}: ${weight}${unit}`,
    'personal_record',
    'trophy',
    'text-yellow-500'
  );
};

export const notifyWorkoutStreak = (days) => {
  return createNotification(
    `🔥 ${days}-day workout streak! Keep it up!`,
    'workout_streak',
    'fire',
    'text-orange-500'
  );
};

export const notifyStreakBroken = () => {
  return createNotification(
    'Your workout streak has been broken. Time to start a new one!',
    'streak_broken',
    'exclamation',
    'text-red-500'
  );
};

export const notifyProgressMilestone = (metric, value) => {
  return createNotification(
    `Progress Milestone: ${metric} reached ${value}!`,
    'progress_milestone',
    'star',
    'text-purple-500'
  );
};

export const notifyAchievementEarned = (achievementName, description, icon) => {
  return createNotification(
    `🏆 Achievement Unlocked: "${achievementName}" - ${description}`,
    'achievement_earned',
    icon || 'trophy',
    'text-yellow-500'
  );
};