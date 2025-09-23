import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

class SharingService {
  async shareWorkout(workoutData) {
    try {
      // Create a formatted text representation of the workout
      const workoutText = this.formatWorkoutForSharing(workoutData);
      
      // Create a temporary file
      const fileName = `workout_${workoutData.id}_${Date.now()}.txt`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      // Write workout data to file
      await FileSystem.writeAsStringAsync(fileUri, workoutText);
      
      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Sharing is not available on this device');
      }
      
      // Share the file
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/plain',
        dialogTitle: 'Share Workout',
        UTI: 'public.text',
      });
      
      // Clean up the temporary file
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
      
      return true;
    } catch (error) {
      console.error('Error sharing workout:', error);
      return false;
    }
  }

  async shareProgress(progressData) {
    try {
      const progressText = this.formatProgressForSharing(progressData);
      
      const fileName = `progress_${Date.now()}.txt`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, progressText);
      
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Sharing is not available on this device');
      }
      
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/plain',
        dialogTitle: 'Share Progress',
        UTI: 'public.text',
      });
      
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
      
      return true;
    } catch (error) {
      console.error('Error sharing progress:', error);
      return false;
    }
  }

  async shareAchievement(achievementData) {
    try {
      const achievementText = this.formatAchievementForSharing(achievementData);
      
      const fileName = `achievement_${Date.now()}.txt`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, achievementText);
      
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Sharing is not available on this device');
      }
      
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/plain',
        dialogTitle: 'Share Achievement',
        UTI: 'public.text',
      });
      
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
      
      return true;
    } catch (error) {
      console.error('Error sharing achievement:', error);
      return false;
    }
  }

  formatWorkoutForSharing(workout) {
    let text = `💪 FitExplorer Workout\n\n`;
    text += `Workout: ${workout.name}\n`;
    text += `Date: ${new Date(workout.startTime).toLocaleDateString()}\n`;
    text += `Duration: ${this.formatDuration(workout.duration)}\n`;
    text += `Calories Burned: ${workout.caloriesBurned || 0}\n\n`;
    
    text += `Exercises:\n`;
    workout.exercises.forEach((exercise, index) => {
      text += `${index + 1}. ${exercise.name}\n`;
      if (exercise.sets && exercise.sets.length > 0) {
        exercise.sets.forEach((set, setIndex) => {
          text += `   Set ${setIndex + 1}: ${set.reps} reps`;
          if (set.weight) {
            text += ` @ ${set.weight}kg`;
          }
          text += `\n`;
        });
      }
      text += `\n`;
    });
    
    if (workout.notes) {
      text += `Notes: ${workout.notes}\n`;
    }
    
    text += `\n---\n`;
    text += `Shared from FitExplorer App`;
    
    return text;
  }

  formatProgressForSharing(progress) {
    let text = `📊 FitExplorer Progress Report\n\n`;
    text += `Period: ${progress.startDate} to ${progress.endDate}\n\n`;
    
    text += `Workouts Completed: ${progress.workoutsCompleted}\n`;
    text += `Total Duration: ${this.formatDuration(progress.totalDuration)}\n`;
    text += `Calories Burned: ${progress.totalCalories}\n\n`;
    
    if (progress.exercises) {
      text += `Top Exercises:\n`;
      progress.exercises.forEach((exercise, index) => {
        text += `${index + 1}. ${exercise.name} - ${exercise.count} times\n`;
      });
    }
    
    text += `\n---\n`;
    text += `Shared from FitExplorer App`;
    
    return text;
  }

  formatAchievementForSharing(achievement) {
    let text = `🏆 FitExplorer Achievement Unlocked!\n\n`;
    text += `Achievement: ${achievement.title}\n`;
    text += `Description: ${achievement.description}\n`;
    text += `Unlocked: ${new Date(achievement.unlockedAt).toLocaleDateString()}\n\n`;
    
    if (achievement.milestone) {
      text += `Milestone: ${achievement.milestone}\n`;
    }
    
    text += `\n---\n`;
    text += `Shared from FitExplorer App`;
    
    return text;
  }

  formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    } else {
      return `${mins}m`;
    }
  }

  async shareToSocialMedia(content, platform = 'general') {
    try {
      // This would integrate with social media APIs
      // For now, we'll use the general sharing mechanism
      const fileName = `social_share_${Date.now()}.txt`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, content);
      
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Sharing is not available on this device');
      }
      
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/plain',
        dialogTitle: `Share to ${platform}`,
        UTI: 'public.text',
      });
      
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
      
      return true;
    } catch (error) {
      console.error('Error sharing to social media:', error);
      return false;
    }
  }
}

export default new SharingService();
