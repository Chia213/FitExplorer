import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth.jsx';

const backendURL = 'http://localhost:8000';

export const useAchievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all achievements
  const fetchAchievements = useCallback(async () => {
    if (!user) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendURL}/achievements`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch achievements: ${response.status}`);
      }
      
      const data = await response.json();
      setAchievements(data);
      return data;
    } catch (err) {
      console.error("Error fetching achievements:", err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Check for new achievement progress
  const checkAchievements = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendURL}/achievements/check`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to check achievements: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Refresh the achievements list after check
      await fetchAchievements();
      
      return data;
    } catch (err) {
      console.error("Error checking achievements:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, fetchAchievements]);

  // Create a new achievement
  const createAchievement = useCallback(async (achievementData) => {
    if (!user) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendURL}/achievements/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(achievementData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create achievement: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Refresh achievements
      await fetchAchievements();
      
      return data;
    } catch (err) {
      console.error("Error creating achievement:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, fetchAchievements]);

  // Update achievement progress manually
  const updateAchievementProgress = useCallback(async (achievementId, newProgress) => {
    if (!user) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendURL}/achievements/${achievementId}/progress`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ progress: newProgress })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update achievement progress: ${response.status}`);
      }
      
      // Refresh achievements
      await fetchAchievements();
      
      return true;
    } catch (err) {
      console.error("Error updating achievement progress:", err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, fetchAchievements]);

  // Load achievements when user changes
  useEffect(() => {
    if (user) {
      fetchAchievements();
    }
  }, [user, fetchAchievements]);

  return {
    achievements,
    loading,
    error,
    fetchAchievements,
    checkAchievements,
    createAchievement,
    updateAchievementProgress
  };
}; 