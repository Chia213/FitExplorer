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
  
  useEffect(() => {
    // Only run once when the component mounts
    if (!hasExecutedInitialFetchRef.current) {
      hasExecutedInitialFetchRef.current = true;
      
      const initialLoad = async () => {
        await fetchAchievements();
        
        // Set initialLoadRef.current to false after the first fetch
        // so that we can fetch new achievements on subsequent renders
        initialLoadRef.current = false;
      };
      
      initialLoad();
    }
  }, []); // Empty dependency means it runs only on mount

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
        return;
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
      setAchievements(data);
      setError(null);
    } catch (err) {
      if (retryCount < 2) {
        // Wait a second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchAchievementsWithProgress(retryCount + 1);
      } else {
        // Fallback to regular fetch
        await fetchAchievements();
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
      isCheckingRef.current = true;
      
      if (hookCheckAchievements) {
        const result = await hookCheckAchievements();
        
        if (result && result.newly_achieved > 0) {
          // New achievements earned, refresh the list
          await fetchAchievementsWithProgress();
        }
      } else {
        // Fallback to original implementation
        const token = localStorage.getItem("token");
        if (!token) return;
        
        const response = await fetch(`${backendURL}/achievements/check`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.newly_achieved > 0) {
            fetchAchievements();
          }
        }
      }
    } catch (err) {
      console.error("Error checking achievements:", err);
    } finally {
      // Reset checking flag after delay
      setTimeout(() => {
        isCheckingRef.current = false;
      }, 2000);
    }
  }, [hookCheckAchievements]);
  
  // Create a debounced version to prevent rapid calls
  const debouncedCheckAchievements = useCallback(
    debounce(() => {
      checkAchievementsProgress();
    }, 1000),
    [checkAchievementsProgress]
  );

  const categories = ['all', ...new Set(achievements.map(a => a.category))];

  // Sort and filter achievements
  const getSortedAchievements = (achievements, category) => {
    // First filter by category if needed
    const filtered = category === 'all' 
      ? achievements 
      : achievements.filter(a => a.category === category);
    
    // Then sort them: achieved ones first, ordered by most recent
    return [...filtered].sort((a, b) => {
      // First check if one is achieved and the other isn't
      const aAchieved = a.is_achieved && a.progress >= a.requirement;
      const bAchieved = b.is_achieved && b.progress >= b.requirement;
      
      if (aAchieved && !bAchieved) return -1;
      if (!aAchieved && bAchieved) return 1;
      
      // If both are achieved, sort by achieved_at date (most recent first)
      if (aAchieved && bAchieved) {
        // Parse dates (handle null values)
        const aDate = a.achieved_at ? new Date(a.achieved_at).getTime() : 0;
        const bDate = b.achieved_at ? new Date(b.achieved_at).getTime() : 0;
        return bDate - aDate; // Descending order (newest first)
      }
      
      // If neither are achieved, sort by progress percentage (highest first)
      const aPercentage = (a.progress / a.requirement) * 100;
      const bPercentage = (b.progress / b.requirement) * 100;
      return bPercentage - aPercentage;
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

  if (loading) {
    return <div className="text-center py-4">Loading achievements...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FaTrophy className="text-yellow-500" />
          Achievements
        </h2>
        <button
          onClick={debouncedCheckAchievements}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Check Progress
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full capitalize whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map(achievement => {
          const Icon = iconMap[achievement.icon] || FaTrophy;
          return (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border ${
                achievement.is_achieved && achievement.progress >= achievement.requirement
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${
                  achievement.is_achieved && achievement.progress >= achievement.requirement
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{achievement.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {achievement.description}
                  </p>
                  {renderProgress(achievement)}
                  {achievement.achieved_at && achievement.progress >= achievement.requirement && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                      Achieved on {new Date(achievement.achieved_at).toLocaleDateString('en-GB')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsSection; 