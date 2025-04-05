import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import {
  FaTrophy,
  FaDumbbell,
  FaFire,
  FaCrown,
  FaArrowLeft,
  FaPlus,
  FaUser,
  FaIdCard,
  FaUserEdit,
  FaPalette,
  FaMoon,
  FaAppleAlt,
  FaShare,
  FaCompass,
  FaCalendarCheck,
  FaCalendar,
  FaChartLine,
  FaGift,
  FaExternalLinkAlt
} from "react-icons/fa";

const backendURL = "http://localhost:8000";

// Default achievements for testing
const defaultAchievements = [
  // Workout achievements
  {
    name: "Workout Beginner",
    description: "Complete your first workout",
    icon: "FaDumbbell",
    category: "workout",
    requirement: 1
  },
  {
    name: "Workout Enthusiast",
    description: "Complete 10 workouts",
    icon: "FaDumbbell",
    category: "workout",
    requirement: 10
  },
  {
    name: "Workout Master",
    description: "Complete 50 workouts",
    icon: "FaDumbbell",
    category: "workout",
    requirement: 50
  },
  
  // Streak achievements
  {
    name: "Workout Streak: Week",
    description: "Maintain a workout streak of 7 days",
    icon: "FaFire",
    category: "streak",
    requirement: 7
  },
  {
    name: "Workout Streak: Month",
    description: "Maintain a workout streak of 30 days",
    icon: "FaFire",
    category: "streak",
    requirement: 30
  },
  
  // Profile achievements
  {
    name: "Profile Picture",
    description: "Upload your first profile picture",
    icon: "FaUser",
    category: "profile",
    requirement: 1
  },
  {
    name: "Personal Info",
    description: "Complete all personal information fields",
    icon: "FaIdCard",
    category: "profile",
    requirement: 6
  },
  {
    name: "Username Change",
    description: "Change your username for the first time",
    icon: "FaUserEdit",
    category: "profile",
    requirement: 1
  },
  
  // Customization achievements
  {
    name: "Color Customizer",
    description: "Change your card color",
    icon: "FaPalette",
    category: "customization",
    requirement: 1
  },
  {
    name: "Theme Switcher",
    description: "Try both light and dark themes",
    icon: "FaMoon",
    category: "customization", 
    requirement: 1
  },
  
  // Nutrition achievements
  {
    name: "Nutrition Tracker",
    description: "Record your first meal",
    icon: "FaAppleAlt",
    category: "nutrition",
    requirement: 1
  },
  {
    name: "Nutrition Expert",
    description: "Record 50 meals",
    icon: "FaAppleAlt",
    category: "nutrition",
    requirement: 50
  },
  
  // Social achievements
  {
    name: "Social Butterfly",
    description: "Share your first workout",
    icon: "FaShare",
    category: "social",
    requirement: 1
  },
  
  // App usage achievements
  {
    name: "Fitness Explorer",
    description: "Visit all main sections of the app",
    icon: "FaCompass",
    category: "app",
    requirement: 5
  },
  {
    name: "Dedicated User",
    description: "Login to the app for 30 consecutive days",
    icon: "FaCalendarCheck",
    category: "app",
    requirement: 30
  }
];

// Add helper function for capping progress at requirement
const getDisplayProgress = (progress, requirement) => {
  // Cap progress at requirement for display purposes
  return Math.min(progress, requirement);
};

// Add helper function for formatting dates in European style
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
};

// Add achievement statistics calculation
const calculateAchievementStats = (achievements) => {
  if (!achievements || achievements.length === 0) return null;
  
  const totalAchievements = achievements.length;
  const achievedCount = achievements.filter(a => a.is_achieved).length;
  const completionRate = Math.round((achievedCount / totalAchievements) * 100);
  
  // Find the next closest achievements to unlock
  const unachievedSorted = achievements
    .filter(a => !a.is_achieved)
    .sort((a, b) => (a.progress / a.requirement) - (b.progress / b.requirement))
    .reverse()
    .slice(0, 3);
  
  return {
    totalAchievements,
    achievedCount,
    completionRate,
    nextToUnlock: unachievedSorted
  };
};

// Add a function to organize achievements by date
const getAchievementTimeline = (achievements) => {
  // Filter for achieved achievements with dates
  const achievedWithDates = achievements
    .filter(a => a.is_achieved && a.achieved_at)
    .map(a => ({
      ...a,
      date: new Date(a.achieved_at)
    }))
    .sort((a, b) => b.date - a.date); // Sort descending
  
  // Group by month and year
  const groupedByMonth = {};
  
  achievedWithDates.forEach(achievement => {
    const date = achievement.date;
    const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (!groupedByMonth[monthYear]) {
      groupedByMonth[monthYear] = {
        label: date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
        achievements: []
      };
    }
    
    groupedByMonth[monthYear].achievements.push(achievement);
  });
  
  return Object.values(groupedByMonth);
};

// Enhance achievement rewards with more details about what they unlock
const achievementRewards = [
  {
    id: "reward-1",
    title: "Premium Themes",
    description: "Unlock beautiful custom themes with matching profile card colors",
    requiredAchievements: 5,
    icon: "FaPalette",
    feature: "themes",
    features: ["themes"],
    claimed: false
  },
  {
    id: "reward-2",
    title: "Expert Workout Templates",
    description: "Access to premium workout templates",
    requiredAchievements: 10,
    icon: "FaDumbbell",
    feature: "workouts",
    features: ["workouts"],
    claimed: false
  },
  {
    id: "reward-3",
    title: "Stats Analysis",
    description: "Unlock advanced statistics and progress analysis",
    requiredAchievements: 15,
    icon: "FaChartLine",
    feature: "stats",
    features: ["stats"],
    claimed: false
  }
];

function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [creating, setCreating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [showForceCleanup, setShowForceCleanup] = useState(false);
  const [selectedBadges, setSelectedBadges] = useState([]);
  const [showBadgeSelector, setShowBadgeSelector] = useState(false);
  const maxBadges = 3; // Maximum number of badges that can be displayed on profile
  const navigate = useNavigate();
  const { theme, unlockTheme, unlockAllThemes, isAdmin } = useTheme();
  const [showInsights, setShowInsights] = useState(false);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [rewardStatus, setRewardStatus] = useState({});
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [currentReward, setCurrentReward] = useState(null);
  const [rewardModalInfo, setRewardModalInfo] = useState({
    show: false,
    title: "",
    message: "",
    reward: null
  });
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "info"
  });
  const [showAdminControls, setShowAdminControls] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");

  // Auto-dismiss notification after 5 seconds
  useEffect(() => {
    let timer;
    if (notification.show) {
      timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [notification.show]);

  useEffect(() => {
    fetchAchievements();
  }, []);

  // Add a new useEffect to auto-check achievements whenever the component mounts
  useEffect(() => {
    // Only check achievements if they exist and user is logged in
    if (achievements.length > 0 && localStorage.getItem("token")) {
      checkAchievements();
    }
  }, [achievements.length]);

  // Load claimed rewards from localStorage on component mount
  useEffect(() => {
    const savedRewards = localStorage.getItem('claimedRewards');
    if (savedRewards) {
      setClaimedRewards(JSON.parse(savedRewards));
    }
    
    // Load reward status from localStorage
    const savedStatus = localStorage.getItem('rewardStatus');
    if (savedStatus) {
      setRewardStatus(JSON.parse(savedStatus));
    }
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setStatusMessage("Loading achievements...");
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${backendURL}/achievements`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        throw new Error(`Failed to fetch achievements: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Achievements data:', data);
      setAchievements(data);
      
      // Auto-create default achievements if none exist
      if (data.length === 0) {
        await createDefaultAchievements();
        // Check progress immediately after creating default achievements
        await checkAchievements();
      }
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError(err.message);
    } finally {
      setStatusMessage("");
      setLoading(false);
    }
  };

  const checkAchievements = async () => {
    try {
      setLoading(true);
      setStatusMessage("Checking achievements progress...");
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendURL}/achievements/check`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Achievement check response:', data);
        setStatusMessage(`${data.message}`);
        fetchAchievements(); // Refresh achievements after checking
      } else {
        const errorData = await response.json();
        throw new Error(`Failed to check achievements: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Error checking achievements:", err);
      setError(err.message);
    } finally {
      setTimeout(() => setStatusMessage(""), 3000); // Clear message after 3 seconds
      setLoading(false);
    }
  };
  
  const createDefaultAchievements = async () => {
    try {
      setCreating(true);
      setStatusMessage("Creating default achievements...");
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      
      // Fetch existing achievements first to check for duplicates
      const existingResponse = await fetch(`${backendURL}/achievements`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!existingResponse.ok) {
        throw new Error(`Failed to fetch existing achievements: ${existingResponse.status}`);
      }
      
      const existingAchievements = await existingResponse.json();
      const existingNames = new Set(existingAchievements.map(a => a.name));
      
      // Only create achievements that don't already exist
      let createdCount = 0;
      for (const achievement of defaultAchievements) {
        // Skip if achievement with this name already exists
        if (existingNames.has(achievement.name)) {
          console.log(`Achievement "${achievement.name}" already exists, skipping`);
          continue;
        }
        
        const response = await fetch(`${backendURL}/achievements/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(achievement)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Failed to create achievement ${achievement.name}:`, errorData);
        } else {
          createdCount++;
        }
      }
      
      // Refresh achievements
      await fetchAchievements();
      setStatusMessage(`${createdCount} achievements created successfully`);
    } catch (err) {
      console.error("Error creating default achievements:", err);
      setError(err.message);
    } finally {
      setTimeout(() => setStatusMessage(""), 3000); // Clear message after 3 seconds
      setCreating(false);
    }
  };

  // Add cleanupDuplicates function
  const cleanupDuplicates = async () => {
    try {
      setStatusMessage("Cleaning up duplicate achievements...");
      setLoading(true);
      setShowForceCleanup(false);
      const token = localStorage.getItem("token");
      
      if (!token) {
        navigate("/login");
        return;
      }
      
      const response = await fetch(`${backendURL}/achievements/cleanup-duplicates`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setStatusMessage(data.message);
        // Check if the message indicates no achievements were deleted due to references
        if (data.message.includes("No achievements were deleted")) {
          // Show the force cleanup button
          setShowForceCleanup(true);
        } else {
          setShowForceCleanup(false);
        }
        // Refresh achievements after cleanup
        await fetchAchievements();
      } else {
        setShowForceCleanup(true); // Show force cleanup option if regular cleanup failed
        throw new Error(`Failed to clean up duplicates: ${data.detail || data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Error cleaning up duplicates:", err);
      setError(err.message);
      setStatusMessage(`Error: ${err.message}`);
      setShowForceCleanup(true);
    } finally {
      setTimeout(() => {
        if (statusMessage.startsWith("Cleaning") || statusMessage.startsWith("Error")) {
          setStatusMessage("");
        }
      }, 5000);
      setLoading(false);
    }
  };

  // Add force cleanup function
  const forceCleanupDuplicates = async () => {
    try {
      setStatusMessage("Force cleaning up duplicate achievements...");
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        navigate("/login");
        return;
      }
      
      const response = await fetch(`${backendURL}/achievements/force-cleanup-duplicates`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setStatusMessage(data.message);
        setShowForceCleanup(false);
        // Refresh achievements after cleanup
        await fetchAchievements();
      } else {
        throw new Error(`Failed to force clean up duplicates: ${data.detail || data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Error force cleaning up duplicates:", err);
      setError(err.message);
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setTimeout(() => {
        if (statusMessage.startsWith("Force") || statusMessage.startsWith("Error")) {
          setStatusMessage("");
        }
      }, 5000);
      setLoading(false);
    }
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case "FaDumbbell":
        return <FaDumbbell className="w-6 h-6" />;
      case "FaFire":
        return <FaFire className="w-6 h-6" />;
      case "FaCrown":
        return <FaCrown className="w-6 h-6" />;
      case "FaUser":
        return <FaUser className="w-6 h-6" />;
      case "FaIdCard":
        return <FaIdCard className="w-6 h-6" />;
      case "FaUserEdit":
        return <FaUserEdit className="w-6 h-6" />;
      case "FaPalette":
        return <FaPalette className="w-6 h-6" />;
      case "FaMoon":
        return <FaMoon className="w-6 h-6" />;
      case "FaAppleAlt":
        return <FaAppleAlt className="w-6 h-6" />;
      case "FaShare":
        return <FaShare className="w-6 h-6" />;
      case "FaCompass":
        return <FaCompass className="w-6 h-6" />;
      case "FaCalendarCheck":
        return <FaCalendarCheck className="w-6 h-6" />;
      default:
        return <FaTrophy className="w-6 h-6" />;
    }
  };

  const filteredAchievements = selectedCategory === "all"
    ? achievements
    : achievements.filter(achievement => achievement.category === selectedCategory);

  const categories = ["all", "workout", "streak", "profile", "customization", "nutrition", "social", "app"];

  // Add function to toggle badge selection
  const toggleBadgeSelection = (achievementId) => {
    if (selectedBadges.includes(achievementId)) {
      setSelectedBadges(selectedBadges.filter(id => id !== achievementId));
    } else {
      // Check if we've reached the maximum number of badges
      if (selectedBadges.length < maxBadges) {
        setSelectedBadges([...selectedBadges, achievementId]);
      } else {
        setStatusMessage(`You can select a maximum of ${maxBadges} badges`);
        setTimeout(() => setStatusMessage(""), 3000);
      }
    }
  };

  // Add function to save selected badges
  const saveBadgeSelections = async () => {
    try {
      setLoading(true);
      setStatusMessage("Saving badge selections...");
      const token = localStorage.getItem("token");
      
      // This would be where you'd send the selected badges to the backend
      // For now, we'll just simulate this with a timeout
      setTimeout(() => {
        setStatusMessage("Badge selections saved successfully!");
        setShowBadgeSelector(false);
        setTimeout(() => setStatusMessage(""), 3000);
        setLoading(false);
      }, 1000);
      
      // Actual implementation would look like this:
      /*
      const response = await fetch(`${backendURL}/user/badges`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ badges: selectedBadges }),
      });

      if (response.ok) {
        setStatusMessage("Badge selections saved successfully!");
        setShowBadgeSelector(false);
      } else {
        throw new Error("Failed to save badge selections");
      }
      */
    } catch (err) {
      console.error("Error saving badge selections:", err);
      setError(err.message);
    } finally {
      setTimeout(() => {
        if (statusMessage === "Saving badge selections...") {
          setStatusMessage("");
        }
      }, 3000);
    }
  };

  // Add getRewardIcon function to the component
  const getRewardIcon = (iconName) => {
    switch (iconName) {
      case "FaDumbbell":
        return <FaDumbbell className="w-6 h-6" />;
      case "FaPalette":
        return <FaPalette className="w-6 h-6" />;
      case "FaChartLine":
        return <FaChartLine className="w-6 h-6" />;
      default:
        return <FaGift className="w-6 h-6" />;
    }
  };

  // Function to generate achievement insights
  const generateAchievementInsights = () => {
    if (!achievements || achievements.length === 0) return null;
    
    const totalAchievements = achievements.length;
    const achievedCount = achievements.filter(a => a.is_achieved).length;
    const percentComplete = Math.round((achievedCount / totalAchievements) * 100);
    
    // Category-based analysis
    const categoryCounts = {};
    const categoryProgress = {};
    
    achievements.forEach(a => {
      // Count achievements by category
      if (!categoryCounts[a.category]) {
        categoryCounts[a.category] = { total: 0, achieved: 0 };
      }
      
      categoryCounts[a.category].total += 1;
      if (a.is_achieved) {
        categoryCounts[a.category].achieved += 1;
      }
      
      // Calculate progress for each category
      categoryProgress[a.category] = Math.round(
        (categoryCounts[a.category].achieved / categoryCounts[a.category].total) * 100
      );
    });
    
    // Identify strongest and weakest categories
    const categoryEntries = Object.entries(categoryProgress);
    const strongestCategory = categoryEntries.reduce((max, [cat, progress]) => 
      progress > max.progress ? { category: cat, progress } : max, 
      { category: '', progress: 0 }
    );
    
    const weakestCategory = categoryEntries.reduce((min, [cat, progress]) => 
      progress < min.progress || min.progress === 0 ? { category: cat, progress } : min, 
      { category: '', progress: 100 }
    );
    
    // Find almost completed achievements (75%+ progress)
    const closeToAchieving = achievements
      .filter(a => !a.is_achieved && (a.progress / a.requirement) >= 0.75)
      .slice(0, 3);
    
    // Calculate hypothetical position on a leaderboard (made up)
    const hypotheticalRank = 100 - percentComplete;
    
    return {
      percentComplete,
      achievedCount,
      totalAchievements,
      strongestCategory,
      weakestCategory,
      closeToAchieving,
      hypotheticalRank
    };
  };

  // Modify the claimReward function to use the useTheme hook
  const claimReward = (reward) => {
    // Check if user has enough achievements
    const achievedCount = achievements.filter(a => a.is_achieved).length;
    if (achievedCount < reward.requiredAchievements) {
      setNotification({
        show: true,
        message: `You need ${reward.requiredAchievements - achievedCount} more achievements to claim this reward.`,
        type: "error"
      });
      return;
    }
    
    // Special handling for theme rewards if user is admin
    if (reward.feature === 'themes' && isAdmin) {
      setNotification({
        show: true,
        message: "As an admin, you already have access to all premium themes. No need to claim this reward.",
        type: "info"
      });
      return;
    }

    // For non-admin users or non-theme rewards, proceed with claiming
    setLoading(true);
    
    setTimeout(() => {
      let description = '';
      
      // Handle based on feature type
      switch(reward.feature) {
        case 'themes':
          // Only for non-admin users
          if (!isAdmin) {
            const themeToUnlock = reward.data.theme;
            unlockTheme(themeToUnlock);
            description = `You've unlocked a premium theme: ${reward.title}. Go to Settings to apply it!`;
          }
          break;
          
        case 'boostStreak':
          // Logic for boosting streak
          setStreak(prev => ({
            ...prev,
            value: prev.value + 5
          }));
          description = `You've boosted your streak by 5 days!`;
          break;
          
        default:
          description = `You've claimed the ${reward.title} reward.`;
      }
      
      // Update claimed rewards
      const updatedClaimedRewards = [...claimedRewards, reward.id];
      setClaimedRewards(updatedClaimedRewards);
      localStorage.setItem('claimedRewards', JSON.stringify(updatedClaimedRewards));
      
      // Show success notification
      setNotification({
        show: true,
        message: description,
        type: "success"
      });
      
      setLoading(false);
      
      // Also update the modal information
      setRewardModalInfo({
        show: true,
        title: "Reward Claimed!",
        message: description,
        reward: reward
      });
    }, 1000);
  };

  // Add function to use a reward
  const useReward = (reward) => {
    let description = '';
    
    // Handle based on feature type
    switch(reward.feature) {
      case 'themes':
        if (isAdmin) {
          setNotification({
            show: true,
            message: "As an admin, you already have access to all premium themes. Visit Settings to change your theme.",
            type: "info"
          });
          
          // Navigate to settings page
          navigate('/settings?tab=appearance');
        } else {
          // Regular user flow for themes
          description = `You've unlocked a premium theme: ${reward.title}. Go to Settings to apply it!`;
          
          setNotification({
            show: true,
            message: description,
            type: "success"
          });
          
          // Navigate to settings page
          navigate('/settings?tab=appearance');
        }
        break;
        
      // Other feature types...
      case 'boostStreak':
        setStreak(prev => ({
          ...prev,
          value: prev.value + 5
        }));
        
        description = `You've boosted your streak by 5 days!`;
        
        setNotification({
          show: true,
          message: description,
          type: "success"
        });
        break;
        
      default:
        description = `You've used the reward: ${reward.title}`;
        
        setNotification({
          show: true,
          message: description,
          type: "success"
        });
    }
  };

  // Add a function to check if reward is claimed
  const isRewardClaimed = (rewardId) => {
    return claimedRewards.includes(rewardId);
  };

  // Modify the RewardModal function to show admin-specific information
  const RewardModal = () => {
    if (!currentReward) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full text-center p-6">
          <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <div className="text-5xl text-yellow-500">
              {getRewardIcon(currentReward.icon)}
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">{currentReward.title} Unlocked!</h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {currentReward.description}
          </p>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">What you've unlocked:</h3>
            {currentReward.feature === 'themes' && (
              <>
                <p>You can now access and apply premium themes to customize the app's appearance!</p>
                <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">Your profile card will automatically use your selected theme colors.</p>
                {isAdmin && (
                  <div className="mt-3 p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-sm text-purple-800 dark:text-purple-300">
                    <span className="font-medium">Admin Note:</span> As an administrator, you already have access to all premium themes.
                  </div>
                )}
              </>
            )}
            {currentReward.feature === 'workouts' && (
              <p>You've unlocked expert-designed workout templates to take your fitness to the next level!</p>
            )}
            {currentReward.feature === 'stats' && (
              <p>Advanced statistics and analytics are now available to track your progress in detail!</p>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowRewardModal(false)}
              className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Close
            </button>
            <button
              onClick={() => {
                setShowRewardModal(false);
                useReward(currentReward);
              }}
              className="flex-1 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Use Now
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Function for admins to claim all rewards at once
  const claimAllRewardsAsAdmin = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    
    try {
      // Call our backend API to claim all rewards for admin user
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendURL}/admin/claim-all-rewards`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Admin claim all rewards response:", data);
      
      // Get all available rewards that haven't been claimed yet
      const unclaimedRewards = achievementRewards.filter(reward => !claimedRewards.includes(reward.id));
      
      if (unclaimedRewards.length === 0) {
        setNotification({
          show: true,
          message: "All rewards have already been claimed!",
          type: "info"
        });
        setLoading(false);
        return;
      }
      
      // Update the frontend state to reflect claimed rewards
      const newClaimedRewards = [...claimedRewards, ...unclaimedRewards.map(r => r.id)];
      setClaimedRewards(newClaimedRewards);
      localStorage.setItem('claimedRewards', JSON.stringify(newClaimedRewards));
      
      // Also unlock all themes on the frontend
      unlockAllThemes();
      
      setNotification({
        show: true,
        message: `Successfully claimed ${data.claimed_rewards.length} rewards as admin!`,
        type: "success"
      });
    } catch (error) {
      console.error("Error claiming all rewards:", error);
      setNotification({
        show: true,
        message: "Error claiming rewards: " + error.message,
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add function to unlock workout templates for admin
  const unlockWorkoutTemplatesAsAdmin = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendURL}/admin/unlock-workout-templates`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Admin unlock workout templates response:", data);
      
      // Find the workout templates reward
      const workoutTemplateReward = achievementRewards.find(r => r.feature === 'workouts' && !claimedRewards.includes(r.id));
      
      if (workoutTemplateReward) {
        // Add to claimed rewards
        const updatedClaimedRewards = [...claimedRewards, workoutTemplateReward.id];
        setClaimedRewards(updatedClaimedRewards);
        localStorage.setItem('claimedRewards', JSON.stringify(updatedClaimedRewards));
      }
      
      setNotification({
        show: true,
        message: "Successfully unlocked all workout templates!",
        type: "success"
      });
    } catch (error) {
      console.error("Error unlocking workout templates:", error);
      setNotification({
        show: true,
        message: "Error unlocking workout templates: " + error.message,
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to show confirmation dialog
  const showConfirmationDialog = (title, message, action) => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirmDialog(true);
  };

  // Modified claimAllRewardsAsAdmin to use confirmation
  const initiateClaimAllRewards = () => {
    showConfirmationDialog(
      "Claim All Rewards",
      "This will unlock all premium features and mark all rewards as claimed. Are you sure you want to proceed?",
      claimAllRewardsAsAdmin
    );
  };

  // Modified unlockWorkoutTemplatesAsAdmin to use confirmation
  const initiateUnlockWorkoutTemplates = () => {
    showConfirmationDialog(
      "Unlock Workout Templates",
      "This will unlock all expert workout templates. Continue?",
      unlockWorkoutTemplatesAsAdmin
    );
  };

  // Confirmation Dialog Component
  const ConfirmationDialog = () => {
    if (!showConfirmDialog) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-xl font-bold mb-3">{confirmTitle}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{confirmMessage}</p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowConfirmDialog(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowConfirmDialog(false);
                if (confirmAction) confirmAction();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"} ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-500 hover:text-blue-600"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold flex items-center">
            <FaTrophy className="mr-2 text-yellow-500" />
            Achievements
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowInsights(true)}
              className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 flex items-center"
            >
              <FaChartLine className="mr-2" />
              Insights
            </button>
            <button
              onClick={checkAchievements}
              disabled={loading}
              className={`bg-blue-500 text-white px-4 py-2 rounded flex items-center ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-600'}`}
            >
              {loading ? 'Processing...' : 'Check Progress'}
            </button>
            <button
              onClick={createDefaultAchievements}
              disabled={creating || loading}
              className={`bg-green-500 text-white px-4 py-2 rounded flex items-center ${(creating || loading) ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-600'}`}
            >
              <FaPlus className="mr-2" />
              {creating ? 'Creating...' : 'Create Default Achievements'}
            </button>
            <button
              onClick={cleanupDuplicates}
              disabled={loading}
              className={`bg-yellow-500 text-white px-4 py-2 rounded flex items-center ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-yellow-600'}`}
            >
              {loading ? 'Processing...' : 'Remove Duplicates'}
            </button>
            {showForceCleanup && (
              <button
                onClick={forceCleanupDuplicates}
                disabled={loading}
                className={`bg-red-500 text-white px-4 py-2 rounded flex items-center ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-600'}`}
              >
                {loading ? 'Processing...' : 'Force Delete Duplicates'}
              </button>
            )}
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-200 rounded text-center">
            {statusMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 rounded">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Admin Controls Toggle Button (only for admins) */}
        {isAdmin && (
          <div className="mb-4">
            <button 
              onClick={() => setShowAdminControls(!showAdminControls)}
              className="flex items-center justify-between w-full md:w-auto px-4 py-2 bg-purple-100 dark:bg-purple-900/20 border border-purple-300 dark:border-purple-800 rounded-lg text-purple-800 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors"
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin Controls
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ml-2 transform transition-transform ${showAdminControls ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}

        {/* Achievement Statistics */}
        {!loading && achievements.length > 0 && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaTrophy className="mr-2 text-yellow-500" />
              Achievement Progress
            </h2>
            
            {(() => {
              const stats = calculateAchievementStats(achievements);
              if (!stats) return null;
              
              return (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-500">{stats.achievedCount}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-500">{stats.totalAchievements}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-500">{stats.completionRate}%</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Completion</p>
                    </div>
                  </div>
                  
                  {stats.nextToUnlock.length > 0 && (
                    <div>
                      <h3 className="text-md font-semibold mb-2">Next Achievements to Unlock:</h3>
                      <div className="space-y-2">
                        {stats.nextToUnlock.map(achievement => (
                          <div key={`next-${achievement.id}`} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="text-yellow-500 mr-2">
                                {getIcon(achievement.icon)}
                              </div>
                              <span>{achievement.name}</span>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {Math.round((achievement.progress / achievement.requirement) * 100)}% complete
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* Badge Selection */}
        {!loading && achievements.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <FaCrown className="mr-2 text-yellow-500" />
                Profile Badges
              </h2>
              <button
                onClick={() => setShowBadgeSelector(!showBadgeSelector)}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                {showBadgeSelector ? "Cancel" : "Select Badges"}
              </button>
            </div>
            
            {showBadgeSelector ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  Select up to {maxBadges} badges to display on your profile. Only achieved badges can be selected.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {achievements
                    .filter(a => a.is_achieved)
                    .map(achievement => (
                      <div 
                        key={`badge-${achievement.id}`}
                        onClick={() => toggleBadgeSelection(achievement.id)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedBadges.includes(achievement.id) 
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900" 
                            : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="text-yellow-500 mr-3 text-2xl">
                            {getIcon(achievement.icon)}
                          </div>
                          <div>
                            <h4 className="font-semibold">{achievement.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{achievement.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={saveBadgeSelections}
                    disabled={loading}
                    className={`px-6 py-2 bg-blue-500 text-white rounded ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-600"}`}
                  >
                    Save Selections
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
                {selectedBadges.length > 0 ? (
                  <div className="flex justify-center space-x-6">
                    {selectedBadges.map(badgeId => {
                      const achievement = achievements.find(a => a.id === badgeId);
                      if (!achievement) return null;
                      
                      return (
                        <div key={`profile-badge-${badgeId}`} className="flex flex-col items-center">
                          <div className="text-yellow-500 text-3xl mb-2">
                            {getIcon(achievement.icon)}
                          </div>
                          <h4 className="font-semibold">{achievement.name}</h4>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    No badges selected. Click "Select Badges" to choose achievements to display on your profile.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Achievement Timeline */}
        {!loading && achievements.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <FaCalendarCheck className="mr-2 text-green-500" />
                Achievement Timeline
              </h2>
              {/* Toggle view button could go here */}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              {(() => {
                const timeline = getAchievementTimeline(achievements);
                
                if (timeline.length === 0) {
                  return (
                    <p className="text-center text-gray-500 dark:text-gray-400">
                      You haven't unlocked any achievements yet. Complete more activities to earn achievements!
                    </p>
                  );
                }
                
                return (
                  <div className="relative">
                    {/* Left timeline line */}
                    <div className="absolute left-2.5 top-2 h-full w-1 bg-gray-200 dark:bg-gray-700"></div>
                    
                    <div className="space-y-8">
                      {timeline.map((month, idx) => (
                        <div key={`month-${idx}`} className="relative">
                          <div className="flex items-center mb-4">
                            <div className="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
                              <FaCalendar size={10} />
                            </div>
                            <h3 className="ml-3 text-lg font-semibold">{month.label}</h3>
                          </div>
                          
                          <div className="ml-8 space-y-4">
                            {month.achievements.map(achievement => (
                              <div 
                                key={`timeline-${achievement.id}`}
                                className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                              >
                                <div className="text-yellow-500 mr-3">
                                  {getIcon(achievement.icon)}
                                </div>
                                <div>
                                  <h4 className="font-semibold">{achievement.name}</h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Achieved on {formatDate(achievement.achieved_at)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Achievement Rewards */}
        {!loading && achievements.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <FaGift className="mr-2 text-purple-500" />
                Achievement Rewards
              </h2>
              
              {isAdmin && (
                <button
                  onClick={() => setShowAdminControls(!showAdminControls)}
                  className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-3 py-1 rounded-md text-sm flex items-center"
                >
                  <span className="mr-1">Admin Controls</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${showAdminControls ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <p className="mb-4 text-gray-600 dark:text-gray-300">
                Unlock special rewards by earning achievements. The more achievements you complete, the more rewards you'll unlock!
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {achievementRewards.map(reward => {
                  const isClaimed = isRewardClaimed(reward.id);
                  const isThemeReward = reward.feature === 'themes';
                  // Admin already has access to themes
                  const adminHasAccess = isAdmin && isThemeReward;
                  
                  return (
                    <div 
                      key={reward.id}
                      className={`rounded-lg overflow-hidden border ${
                        isClaimed || adminHasAccess
                          ? "border-green-500 dark:border-green-600"
                          : "border-gray-300 dark:border-gray-700"
                      } bg-white dark:bg-gray-800 shadow-md`}
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center">
                            <div className="text-2xl text-yellow-500 mr-3">
                              {getRewardIcon(reward.icon)}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {reward.title}
                            </h3>
                          </div>
                          {(isClaimed || adminHasAccess) && (
                            <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded-full flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {adminHasAccess && !isClaimed ? "Admin Access" : "Claimed"}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{reward.description}</p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                          <span className="font-semibold mr-1">Requires:</span>
                          {reward.requiredAchievements} achievements
                        </div>
                        
                        <div className="flex space-x-2">
                          {isClaimed || adminHasAccess ? (
                            <button
                              onClick={() => useReward(reward)}
                              className="flex-1 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              Use Now
                            </button>
                          ) : (
                            <button 
                              onClick={() => claimReward(reward)}
                              className="flex-1 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                              disabled={achievements.filter(a => a.is_achieved).length < reward.requiredAchievements}
                            >
                              {achievements.filter(a => a.is_achieved).length < reward.requiredAchievements 
                                ? `Need ${reward.requiredAchievements - achievements.filter(a => a.is_achieved).length} more` 
                                : "Claim Reward"}
                            </button>
                          )}
                        </div>
                        
                        {isAdmin && isThemeReward && !isClaimed && (
                          <div className="mt-2 text-xs text-purple-600 dark:text-purple-400 italic">
                            As an admin, you already have access to all themes.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Reward Claim Modal */}
        {showRewardModal && <RewardModal />}

        {/* Category Filter */}
        <div className="flex space-x-4 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded ${
                selectedCategory === category
                  ? "bg-blue-500 text-white"
                  : theme === "dark"
                  ? "bg-gray-800 text-gray-300"
                  : "bg-white text-gray-700"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        {filteredAchievements.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg text-center">
            <FaTrophy className="mx-auto text-gray-400 text-4xl mb-4" />
            <h3 className="text-xl font-medium mb-2">No achievements found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {selectedCategory === "all" 
                ? "There are no achievements available yet." 
                : `There are no achievements in the "${selectedCategory}" category.`}
            </p>
            {selectedCategory === "all" && (
              <button
                onClick={createDefaultAchievements}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Create Default Achievements
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                } rounded-lg shadow-lg p-6 ${
                  achievement.is_achieved ? "border-2 border-yellow-500" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="text-yellow-500 mr-3">
                      {getIcon(achievement.icon)}
                    </div>
                    <h3 className="text-xl font-semibold">{achievement.name}</h3>
                  </div>
                  {achievement.is_achieved && (
                    <span className="text-green-500">Achieved!</span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {achievement.description}
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full"
                    style={{
                      width: `${(getDisplayProgress(achievement.progress, achievement.requirement) / achievement.requirement) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Progress: {getDisplayProgress(achievement.progress, achievement.requirement)}/{achievement.requirement}</span>
                  {achievement.achieved_at && (
                    <span>
                      Achieved: {formatDate(achievement.achieved_at)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Insights Modal */}
        {showInsights && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold flex items-center">
                    <FaChartLine className="mr-2 text-indigo-500" />
                    Achievement Insights
                  </h2>
                  <button
                    onClick={() => setShowInsights(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {(() => {
                  const insights = generateAchievementInsights();
                  if (!insights) return <p>Not enough achievement data to generate insights.</p>;
                  
                  return (
                    <div className="space-y-8">
                      {/* Overview */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3">Achievement Overview</h3>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex justify-between mb-2">
                            <span>Overall Progress:</span>
                            <span className="font-semibold">{insights.percentComplete}% Complete</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                            <div
                              className="bg-blue-500 h-2.5 rounded-full"
                              style={{ width: `${insights.percentComplete}%` }}
                            ></div>
                          </div>
                          <p className="text-center text-sm text-gray-600 dark:text-gray-300">
                            You've achieved {insights.achievedCount} out of {insights.totalAchievements} achievements
                          </p>
                        </div>
                      </div>
                      
                      {/* Strength & Weakness Analysis */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <h4 className="font-semibold mb-2">Your Strongest Area</h4>
                          <div className="flex items-center mb-3">
                            <span className="capitalize">{insights.strongestCategory.category}</span>
                            <span className="ml-auto font-semibold text-green-600">{insights.strongestCategory.progress}%</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Keep up the great work in this category!
                          </p>
                        </div>
                        
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                          <h4 className="font-semibold mb-2">Area for Improvement</h4>
                          <div className="flex items-center mb-3">
                            <span className="capitalize">{insights.weakestCategory.category}</span>
                            <span className="ml-auto font-semibold text-amber-600">{insights.weakestCategory.progress}%</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Focus on {insights.weakestCategory.category} achievements to improve your overall progress.
                          </p>
                        </div>
                      </div>
                      
                      {/* Almost there */}
                      {insights.closeToAchieving.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold mb-3">Almost There!</h3>
                          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
                              You're close to unlocking these achievements:
                            </p>
                            <div className="space-y-4">
                              {insights.closeToAchieving.map(achievement => (
                                <div key={`close-${achievement.id}`} className="flex items-center">
                                  <div className="text-yellow-500 mr-3">
                                    {getIcon(achievement.icon)}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold">{achievement.name}</h4>
                                    <div className="flex items-center">
                                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                                        <div
                                          className="bg-purple-500 h-2 rounded-full"
                                          style={{ width: `${(achievement.progress / achievement.requirement) * 100}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-xs text-gray-500 whitespace-nowrap">
                                        {achievement.progress}/{achievement.requirement}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Community Comparison (Hypothetical) */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3">Community Comparison</h3>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/20 rounded-lg text-center">
                          <p className="mb-3">
                            Based on your achievements, you're in the top <span className="font-bold text-green-500">{insights.hypotheticalRank}%</span> of users!
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Continue completing achievements to climb the rankings.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Notification Toast */}
        {notification.show && (
          <div className="fixed bottom-5 right-5 z-50 max-w-md">
            <div 
              className={`rounded-lg shadow-lg p-4 flex items-start space-x-3 transition-all duration-300 ${
                notification.type === "success" ? "bg-green-100 text-green-800 border-l-4 border-green-500" :
                notification.type === "error" ? "bg-red-100 text-red-800 border-l-4 border-red-500" :
                "bg-blue-100 text-blue-800 border-l-4 border-blue-500"
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {notification.type === "success" && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === "error" && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === "info" && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 7a1 1 0 100 2h.01a1 1 0 100-2H10z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <button 
                onClick={() => setNotification({...notification, show: false})}
                className="flex-shrink-0 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Admin Controls Panel */}
        {isAdmin && showAdminControls && (
          <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-3">Admin Controls</h2>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={initiateClaimAllRewards}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm flex items-center disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Claim All Rewards
                  </>
                )}
              </button>
              
              <button
                onClick={() => unlockAllThemes()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                Unlock All Themes
              </button>
              
              <button
                onClick={initiateUnlockWorkoutTemplates}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Unlock Workout Templates
              </button>
              
              <button
                onClick={() => {
                  // Reset claimed rewards for testing
                  setClaimedRewards([]);
                  localStorage.removeItem('claimedRewards');
                  setNotification({
                    show: true,
                    message: "Reset all claimed rewards",
                    type: "info"
                  });
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Claimed Rewards
              </button>
            </div>
          </div>
        )}

        {/* Add the Confirmation Dialog Component */}
        <ConfirmationDialog />
      </div>
    </div>
  );
}

export default Achievements; 