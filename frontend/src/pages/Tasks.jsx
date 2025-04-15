import { useAchievements } from '../hooks/useAchievements';

const Tasks = () => {
  const { checkAchievementsAfterTask } = useAchievements();
  
  const handleTaskComplete = async (taskId) => {
    try {
      // ... existing task completion code ...
      
      // Check for new achievements after task completion
      await checkAchievementsAfterTask();
      
      // ... rest of the existing code ...
    } catch (error) {
      // ... existing error handling ...
    }
  };
  
  // ... rest of the existing code ...
}; 