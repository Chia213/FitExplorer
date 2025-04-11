import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FaTrophy,
  FaDumbbell,
  FaFire,
  FaStar,
  FaMedal,
  FaCrown,
  FaBolt,
  FaStopwatch,
  FaCalendarCheck,
  FaChartLine,
  FaChevronRight,
} from 'react-icons/fa';
import { notifyAchievementEarned } from '../utils/notificationsHelpers';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useAchievements } from '../hooks/useAchievements.jsx';
import { debounce } from 'lodash';

const defaultBackendURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const iconMap = {
  FaTrophy,
  FaDumbbell,
  FaFire,
  FaStar,
  FaMedal,
  FaCrown,
  FaBolt,
  FaStopwatch,
  FaCalendarCheck,
  FaChartLine
};

const AchievementsSection = ({ backendURL = defaultBackendURL }) => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const previousAchievementsRef = useRef([]);
  const initialLoadRef = useRef(true);
  const { achievementAlertsEnabled, allNotificationsEnabled } = useNotifications();
  const { 
    achievements: hookAchievements, 
    loading: hookLoading, 
    checkAchievements: hookCheckAchievements
  } = useAchievements();

  // Create a ref to track if we've already executed the initial fetch
  const hasExecutedInitialFetchRef = useRef(false);
  
  // Load cached achievements from localStorage on initial render
  useEffect(() => {
    try {
      // First try to load cached data to prevent empty UI flashing
      const cached = localStorage.getItem('cachedAchievements');
      if (cached) {
        const parsedData = JSON.parse(cached);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          setAchievements(parsedData);
          setLoading(false);
        }
      }

      // Check if we need to refresh the data (cache more than 5 minutes old)
      const lastUpdated = localStorage.getItem('achievementsLastUpdated');
      const needsRefresh = !lastUpdated || 
        (new Date() - new Date(lastUpdated)) > 5 * 60 * 1000; // 5 minutes
      
      // If we need fresh data, load it in the background without blocking UI
      if (needsRefresh) {
        // Don't block the UI by setting loading to true again
        fetchAchievementsWithProgress().catch(err => {
          console.error("Background fetch failed:", err);
        });
      }
    } catch (err) {
      console.error("Error handling cached achievements:", err);
    }
  }, []);
  
  // Fetch fresh data once on component mount
  useEffect(() => {
    if (!hasExecutedInitialFetchRef.current) {
      hasExecutedInitialFetchRef.current = true;
      
      const initialLoad = async () => {
        try {
          const data = await fetchAchievementsWithProgress();
          
          // Store the last update timestamp
          if (data && data.length > 0) {
            localStorage.setItem('achievementsLastUpdated', new Date().toISOString());
          }
          
          initialLoadRef.current = false;
        } catch (err) {
          console.error("Error during initial load:", err);
        }
      };
      
      // Small delay to not block initial render
      setTimeout(() => {
        initialLoad();
      }, 100);
    }
  }, []);

  // Save achievements to localStorage whenever they change
  useEffect(() => {
    if (achievements && achievements.length > 0) {
      try {
        localStorage.setItem('cachedAchievements', JSON.stringify(achievements));
      } catch (err) {
        console.error("Error saving achievements to cache:", err);
      }
    }
  }, [achievements]);

  // Check for newly achieved achievements and send notifications
  useEffect(() => {
    if (!allNotificationsEnabled || !achievementAlertsEnabled) return;
    
    if (achievements.length > 0 && previousAchievementsRef.current.length > 0) {
      const prevAchieved = new Set(
        previousAchievementsRef.current
          .filter(a => a.is_achieved)
          .map(a => a.id)
      );
      
      // Find newly achieved achievements (only count those that have actually been achieved)
      const newlyAchieved = achievements.filter(
        a => a.is_achieved && !prevAchieved.has(a.id) && a.progress >= a.requirement
      );
      
      // Send notifications for newly achieved achievements
      newlyAchieved.forEach(achievement => {
        notifyAchievementEarned(
          achievement.name,
          achievement.description,
          achievement.icon
        );
      });
    }
    
    // Update the ref with current achievements
    previousAchievementsRef.current = achievements;
  }, [achievements, achievementAlertsEnabled, allNotificationsEnabled]);

  const fetchAchievements = async (retryCount = 0) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const response = await fetch(`${backendURL}/achievements`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch achievements: ${response.status}`);
      }

      const data = await response.json();
      setAchievements(data);
      setError(null);
    } catch (err) {
      if (retryCount < 2) {
        // Wait a second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchAchievements(retryCount + 1);
      } else {
        setError(err.message || 'Failed to load achievements');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch achievements with progress
  const fetchAchievementsWithProgress = async (retryCount = 0) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      if (!token) {
        setError('Authentication token not found');
        return [];
      }

      const response = await fetch(`${backendURL}/user/achievements/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch achievements with progress: ${response.status}`);
      }

      const data = await response.json();
      
      // Only update state if we have valid data
      if (Array.isArray(data) && data.length > 0) {
        setAchievements(data);
        setError(null);
        
        // Cache the data to localStorage for persistence
        try {
          localStorage.setItem('cachedAchievements', JSON.stringify(data));
        } catch (cacheError) {
          console.error("Error caching achievements:", cacheError);
        }
      }
      
      return data;
    } catch (err) {
      console.error("Error fetching achievements with progress:", err);
      
      if (retryCount < 2) {
        // Wait a second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchAchievementsWithProgress(retryCount + 1);
      } else {
        // If failed after retries, try regular fetch as fallback
        try {
          return await fetchAchievements();
        } catch (fallbackErr) {
          // If both methods fail, return empty array but don't clear existing state
          console.error("Fallback fetch also failed:", fallbackErr);
          return [];
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchNewAchievements = async (retryCount = 0) => {
    if (!allNotificationsEnabled || !achievementAlertsEnabled) return;
    
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      if (!token) return;
      
      const response = await fetch(`${backendURL}/api/achievements/new`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (retryCount < 2) {
          // Wait a second before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchNewAchievements(retryCount + 1);
        }
        return; // Silently fail after retries, this is just for notifications
      }

      const newAchievements = await response.json();
      
      // Only notify for achievements that have actually been achieved (progress >= requirement)
      const validAchievements = newAchievements.filter(
        achievement => achievement.is_achieved && achievement.progress >= achievement.requirement
      );
      
      // Notify the user about each new valid achievement
      validAchievements.forEach(achievement => {
        notifyAchievementEarned(
          achievement.name,
          achievement.description,
          achievement.icon
        );
      });
      
      // After we've fetched new achievements, update the main achievement list
      if (validAchievements.length > 0) {
        fetchAchievements();
      }
    } catch (err) {
      // Silently fail, this is just for notifications
    }
  };

  // Create a ref to prevent duplicate checking
  const isCheckingRef = useRef(false);
  
  // Update useEffect to use the achievements hook data when available
  useEffect(() => {
    if (hookAchievements && hookAchievements.length > 0) {
      setAchievements(hookAchievements);
      setLoading(hookLoading);
    }
  }, [hookAchievements, hookLoading]);
  
  // Create a synchronized checkAchievements function
  const checkAchievementsProgress = useCallback(async () => {
    if (isCheckingRef.current) {
      console.log("Achievement check already in progress...");
      return;
    }
    
    try {
      // Set checking flag immediately to prevent duplicate calls
      isCheckingRef.current = true;
      
      // Show loading but only for the button, don't block the entire UI
      const originalAchievements = [...achievements];
      
      // Keep UI responsive by not setting global loading state
      // setLoading(true);
      
      // Track loading state just for the check button
      const buttonLoadingState = true;
      
      // 1. Start the achievement check call
      const checkPromise = hookCheckAchievements ? 
        hookCheckAchievements() : 
        fetch(`${backendURL}/achievements/check`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
          }
        }).then(res => res.ok ? res.json() : Promise.reject("Failed to check achievements"));
      
      // 2. Immediately try to update UI optimistically
      // Show "checking" state for 300ms minimum to avoid flickering
      setTimeout(() => {
        // Update the progress of achievements that are close to completion
        // This provides immediate visual feedback
        const updatedAchievements = originalAchievements.map(achievement => {
          // Only update non-completed achievements that are close to completion
          if (!achievement.is_achieved && achievement.progress > 0) {
            // Simulate a small progress increase for better user feedback
            return {
              ...achievement,
              progress: Math.min(achievement.progress + 1, achievement.requirement)
            };
          }
          return achievement;
        });
        
        // Update UI with optimistic values
        setAchievements(updatedAchievements);
        
        // Save optimistic updates to localStorage for immediate persistence
        localStorage.setItem('cachedAchievements', JSON.stringify(updatedAchievements));
      }, 300);
      
      // 3. Wait for the actual check to complete
      const checkResult = await checkPromise;
      
      // 4. After check completes, fetch the real data
      const progressResponse = await fetch(`${backendURL}/user/achievements/progress`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      // 5. Process the fresh data if successful
      if (progressResponse.ok) {
        const freshData = await progressResponse.json();
        
        if (Array.isArray(freshData) && freshData.length > 0) {
          // Update the UI with real data
          setAchievements(freshData);
          
          // Cache the real data for persistence
          localStorage.setItem('cachedAchievements', JSON.stringify(freshData));
          localStorage.setItem('achievementsLastUpdated', new Date().toISOString());
        } else {
          // Fallback to original data if response is empty
          setAchievements(originalAchievements);
        }
      } else {
        // If fetch fails, restore original state
        setAchievements(originalAchievements);
      }
    } catch (err) {
      console.error("Error checking achievements:", err);
    } finally {
      // Reset checking flag after a shorter delay - 500ms is enough
      setTimeout(() => {
        isCheckingRef.current = false;
        // setLoading(false);
      }, 500);
    }
  }, [achievements, hookCheckAchievements]);
  
  // Create a debounced version to prevent rapid calls
  const debouncedCheckAchievements = useCallback(
    debounce(() => {
      checkAchievementsProgress();
    }, 500),
    [checkAchievementsProgress]
  );

  const categories = ['all', ...new Set(achievements.map(a => a.category))];

  // Sort achievements with achieved ones first
  const getSortedAchievements = (achievements, category) => {
    // First filter by category
    const filteredAchievements = achievements.filter(
      (achievement) => category === "all" || achievement.category === category
    );
    
    // Then sort by achieved status (achieved first), then by progress percentage
    return filteredAchievements.sort((a, b) => {
      // First sort by achieved status
      if (a.is_achieved !== b.is_achieved) {
        return a.is_achieved ? -1 : 1;
      }
      
      // For non-achieved achievements, sort by progress percentage
      if (!a.is_achieved) {
        const aProgress = a.progress / a.requirement;
        const bProgress = b.progress / b.requirement;
        return bProgress - aProgress;
      }
      
      // For achieved achievements, sort by most recently achieved
      if (a.achieved_at && b.achieved_at) {
        return new Date(b.achieved_at) - new Date(a.achieved_at);
      }
      
      // Default sort by ID 
      return a.id - b.id;
    });
  };
  
  const filteredAchievements = getSortedAchievements(achievements, selectedCategory);

  const renderProgress = (achievement) => {
    const percentage = Math.min((achievement.progress / achievement.requirement) * 100, 100);
    
    return (
      <div className="mt-2">
        <div className="flex justify-between text-sm mb-1">
          <span>{achievement.progress} / {achievement.requirement}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className={`h-2.5 rounded-full ${
              achievement.is_achieved ? 'bg-green-600' : 'bg-blue-600'
            }`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // Helper function to get icon component based on icon name
  const getIcon = (iconName) => {
    if (!iconName) return <FaTrophy />;
    
    const Icon = iconMap[iconName] || FaTrophy;
    return <Icon />;
  };

  const navigate = useNavigate();

  // Function to check achievements after profile updates - exported for use in Profile
  const checkAndUpdateAchievements = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      // First, make the check request
      const checkResponse = await fetch(`${backendURL}/achievements/check`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!checkResponse.ok) {
        throw new Error("Failed to check achievements");
      }
      
      const checkResult = await checkResponse.json();
      
      // Then immediately fetch the updated data
      const updatedResponse = await fetch(`${backendURL}/user/achievements/progress`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!updatedResponse.ok) {
        throw new Error("Failed to fetch updated achievements");
      }
      
      const updatedData = await updatedResponse.json();
      if (updatedData && Array.isArray(updatedData) && updatedData.length > 0) {
        // Update state with the new data
        setAchievements(updatedData);
        
        // Update cache
        localStorage.setItem('cachedAchievements', JSON.stringify(updatedData));
        localStorage.setItem('achievementsLastUpdated', new Date().toISOString());
      }
      
      return checkResult;
    } catch (error) {
      console.error("Error checking achievements:", error);
    }
  }, []);
  
  // Expose the check function for other components to use
  useEffect(() => {
    if (window) {
      window.checkAndUpdateAchievements = checkAndUpdateAchievements;
    }
    return () => {
      if (window) {
        delete window.checkAndUpdateAchievements;
      }
    };
  }, [checkAndUpdateAchievements]);

  if (loading) {
    return <div className="text-center py-4">Loading achievements...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <FaTrophy className="text-yellow-500 mr-2" />
          Achievements
        </h2>
        
        <div className="flex space-x-2">
          <button
            onClick={debouncedCheckAchievements}
            disabled={loading || isCheckingRef.current}
            className={`px-3 py-1 rounded text-sm flex items-center ${
              loading || isCheckingRef.current
                ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {loading || isCheckingRef.current ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Checking...
              </>
            ) : (
              <>
                <FaChartLine className="mr-1" />
                Check Progress
              </>
            )}
          </button>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1 rounded text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error: </strong>
          <span>{error}</span>
        </div>
      )}

      {/* Achievement Stats */}
      {!loading && achievements.length > 0 && (
        <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">
                {achievements.filter(a => a.is_achieved).length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">{achievements.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">
                {Math.round((achievements.filter(a => a.is_achieved).length / achievements.length) * 100)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Completion</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : achievements.length === 0 ? (
        <div className="text-center py-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <FaTrophy className="text-gray-300 dark:text-gray-600 text-4xl mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400">No achievements found.</p>
          <button
            onClick={debouncedCheckAchievements}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Check Progress
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {getSortedAchievements(achievements, selectedCategory).map(achievement => {
            const Icon = getIcon(achievement.icon);
            return (
              <div
                key={achievement.id}
                className={`p-3 rounded-lg ${
                  achievement.is_achieved
                    ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex items-start">
                  <div className={`flex-shrink-0 p-2 rounded-full mr-3 ${
                    achievement.is_achieved 
                      ? "text-green-500 bg-green-100 dark:bg-green-800 dark:text-green-300" 
                      : "text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700"
                  }`}>
                    {Icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-sm">
                        {achievement.name}
                        {achievement.is_achieved && (
                          <span className="ml-1 text-green-500">✓</span>
                        )}
                      </h3>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {achievement.progress}/{achievement.requirement}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {achievement.description}
                    </p>
                    <div className="mt-2 relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                        <div
                          style={{
                            width: `${Math.min(100, (achievement.progress / achievement.requirement) * 100)}%`
                          }}
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                            achievement.is_achieved
                              ? "bg-green-500"
                              : "bg-blue-500"
                          }`}
                        ></div>
                      </div>
                    </div>
                    {achievement.is_achieved && achievement.achieved_at && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Achieved: {new Date(achievement.achieved_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Show more button */}
      {achievements.length > 6 && getSortedAchievements(achievements, selectedCategory).length > 6 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/achievements')}
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            View All Achievements
            <FaChevronRight className="ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AchievementsSection; 