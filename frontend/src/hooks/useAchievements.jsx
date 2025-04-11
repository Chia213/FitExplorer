import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './useAuth.jsx';
import { debounce } from 'lodash';

const backendURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const useAchievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [newAchievements, setNewAchievements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create a ref to track if we've already loaded achievements
  const hasLoadedAchievementsRef = useRef(false);

  // Create a ref to track if we're currently checking achievements
  const isChecking = useRef(false);

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

  // Add a function to fetch achievements with synchronized progress
  const fetchAchievementsWithProgress = useCallback(async (retryCount = 0) => {
    if (!user) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      // Use the new endpoint that gives achievements with user progress
      const response = await fetch(`${backendURL}/user/achievements/progress`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch achievement progress: ${response.status}`);
      }
      
      const data = await response.json();
      setAchievements(data);
      return data;
    } catch (err) {
      setError(err.message);
      
      // Add retry logic with maximum of 2 retries
      if (retryCount < 2) {
        // Wait a second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await fetchAchievementsWithProgress(retryCount + 1);
      }
      
      console.error("Error fetching achievements with progress:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Check for newly earned achievements
  const getNewAchievements = useCallback(async () => {
    if (!user) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`${backendURL}/api/achievements/new`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch new achievements: ${response.status}`);
      }
      
      const data = await response.json();
      setNewAchievements(data);
      return data;
    } catch (err) {
      console.error("Error fetching new achievements:", err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Function to check achievement progress
  const checkAchievements = useCallback(async () => {
    if (isChecking.current) {
      console.log("Achievement check already in progress...");
      return null;
    }
    
    try {
      // Set checking flag to prevent multiple simultaneous calls
      isChecking.current = true;
      
      // Log the check for debugging
      console.log("Checking achievement progress...");
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const response = await fetch(`${backendURL}/achievements/check`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to check achievements: ${response.status}`);
      }
      
      const data = await response.json();
      
      // If new achievements were earned, refresh the achievements list
      if (data.newly_achieved > 0) {
        // Instead of calling fetchAchievementsWithProgress, do the fetch here
        const progressResponse = await fetch(`${backendURL}/user/achievements/progress`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          setAchievements(progressData);
        }
      }
      
      return data;
    } catch (err) {
      console.error("Error checking achievements:", err);
      return null;
    } finally {
      // Release the checking flag after a short delay to prevent rapid subsequent calls
      setTimeout(() => {
        isChecking.current = false;
      }, 2000);
    }
  }, []);
  
  // Create a debounced version of the check function to prevent too many calls
  const debouncedCheckAchievements = useCallback(
    debounce(async () => {
      return await checkAchievements();
    }, 1000),
    [checkAchievements]
  );

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

  // Only fetch achievements on mount, not checking progress
  useEffect(() => {
    // Only run this effect if user exists and we haven't already loaded achievements
    if (user && !hasLoadedAchievementsRef.current) {
      hasLoadedAchievementsRef.current = true;
      
      // Just fetch achievements without checking or getting new ones
      const loadAchievements = async () => {
        try {
          // Only get achievements, don't check progress
          await fetchAchievements();
        } catch (err) {
          console.error("Error in achievement loading:", err);
        }
      };

      loadAchievements();
    }
  }, [user, fetchAchievements]);

  return {
    achievements,
    newAchievements,
    loading,
    error,
    fetchAchievements,
    fetchAchievementsWithProgress,
    getNewAchievements,
    checkAchievements,
    createAchievement,
    updateAchievementProgress
  };
}; 