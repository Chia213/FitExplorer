// src/utils/notificationHelpers.js
import { apiUrl } from './config';

/**
 * Helper function to create a notification
 * @param {string} message - The notification message
 * @param {string} type - The notification type
 * @param {string} icon - The icon to display
 * @param {string} iconColor - The icon color (Tailwind CSS class)
 * @returns {Promise} - The fetch promise
 */
export const createNotification = async (message, type, icon = 'bell', iconColor = 'text-blue-500') => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
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
      throw new Error('Failed to create notification');
    }

    return await response.json();
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