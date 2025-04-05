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
  FaGift
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

// Define achievement rewards
const achievementRewards = [
  {
    id: "reward-1",
    title: "Custom Theme",
    description: "Unlock a special custom theme for the app",
    requiredAchievements: 5,
    icon: "FaPalette"
  },
  {
    id: "reward-2",
    title: "Expert Workout Templates",
    description: "Access to premium workout templates",
    requiredAchievements: 10,
    icon: "FaDumbbell"
  },
  {
    id: "reward-3",
    title: "Stats Analysis",
    description: "Unlock advanced statistics and progress analysis",
    requiredAchievements: 15,
    icon: "FaChartLine"
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
  const { theme } = useTheme();
  const [showInsights, setShowInsights] = useState(false);

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
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <p className="mb-4 text-gray-600 dark:text-gray-300">
                Unlock special rewards by earning achievements. The more achievements you complete, the more rewards you'll unlock!
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {achievementRewards.map(reward => {
                  // Calculate if the reward is unlocked based on achievement count
                  const achievedCount = achievements.filter(a => a.is_achieved).length;
                  const isUnlocked = achievedCount >= reward.requiredAchievements;
                  
                  return (
                    <div 
                      key={reward.id}
                      className={`p-4 rounded-lg border-2 ${
                        isUnlocked 
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
                          : "border-gray-200 dark:border-gray-700 opacity-60"
                      }`}
                    >
                      <div className="flex items-center mb-3">
                        <div className={`text-2xl mr-3 ${isUnlocked ? "text-purple-500" : "text-gray-400"}`}>
                          {getRewardIcon(reward.icon)}
                        </div>
                        <div>
                          <h4 className="font-semibold">{reward.title}</h4>
                          {isUnlocked ? (
                            <span className="text-xs px-2 py-1 bg-green-500 text-white rounded-full">Unlocked!</span>
                          ) : (
                            <span className="text-xs text-gray-500">
                              {achievedCount}/{reward.requiredAchievements} achievements needed
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {reward.description}
                      </p>
                      
                      {isUnlocked && (
                        <button className="mt-3 w-full py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
                          Claim Reward
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

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
      </div>
    </div>
  );
}

export default Achievements; 