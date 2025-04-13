import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { 
  notifyProfileUpdated, 
  notifyUsernameChanged, 
  notifyPersonalInfoUpdated,
  notifyProfilePictureUpdated,
  notifyCardColorUpdated,
  notifyWeightGoalUpdated,
  notifyWorkoutFrequencyGoalUpdated,
  notifyHeightUpdated,
  notifyWeightUpdated,
  notifyAgeUpdated,
  notifyGenderUpdated,
  notifyFitnessGoalsUpdated,
  notifyBioUpdated,
  notifyWorkoutGoalUpdated
} from '../utils/notificationsHelpers';
import { useNotifications } from "../contexts/NotificationContext";
import AchievementsSection from '../components/AchievementsSection';
import {
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaCamera,
  FaCalendarAlt,
  FaDumbbell,
  FaEnvelope,
  FaWeightHanging,
  FaUser,
  FaSignOutAlt,
  FaLock,
  FaChartLine,
  FaCog,
  FaHeart,
  FaHistory,
  FaTrophy,
  FaUserFriends,
  FaFire,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

const backendURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ALLOWED_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "live.com",
  "live.se",
  "hotmail.se",
]);

function ErrorBoundary({ children, fallback }) {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const errorHandler = (error) => {
      console.error("Caught error:", error);
      setHasError(true);
    };
    
    window.addEventListener('error', errorHandler);
    
    return () => {
      window.removeEventListener('error', errorHandler);
    };
  }, []);
  
  if (hasError) {
    return fallback || <div className="text-red-500 p-4 rounded bg-red-50 my-4">Something went wrong loading this component.</div>;
  }
  
  return children;
}

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cardColor, setCardColor] = useState("#f0f4ff"); // Default color until we get backend data
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState("");
  const [workoutStats, setWorkoutStats] = useState(null);
  const [lastSavedRoutine, setLastSavedRoutine] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    height: "",
    weight: "",
    age: "",
    gender: "",
    fitnessGoals: "",
    bio: ""
  });
  const [personalInfoError, setPersonalInfoError] = useState("");
  const [preferences, setPreferences] = useState({
    cardColor: "#dbeafe",
    workoutFrequencyGoal: null,
    goalWeight: null,
    useCustomCardColor: false
  });
  const [preferencesChanged, setPreferencesChanged] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const fileInputRef = useRef(null);
  const [lastUpdated, setLastUpdated] = useState(Date.now()); // Track last update time for achievements

  const navigate = useNavigate();
  const { theme, premiumTheme, premiumThemes, isAdmin } = useTheme();
  const { allNotificationsEnabled } = useNotifications();

  // Function to fetch user data - extracted for reuse
  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const [profileRes, statsRes, routineRes, workoutPrefsRes] = await Promise.all([
        fetch(`${backendURL}/user-profile`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }),
        fetch(`${backendURL}/workout-stats`, {
          method: "GET",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          credentials: "include"
        }),
        fetch(`${backendURL}/api/last-saved-routine`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }),
        fetch(`${backendURL}/api/workout-preferences`, {
          method: "GET",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }),
      ]);

      // Handle profile response
      if (!profileRes.ok) {
        if (profileRes.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        const errorData = await profileRes.json();
        throw new Error(errorData.detail || "Failed to fetch profile data");
      }

      const userData = await profileRes.json();
      
      // Set user and username state directly from server data
      setUser(userData);
      setEditedUsername(userData.username);

      // Initialize personal information from user data
      setPersonalInfo({
        height: userData.height?.toString() || "",
        weight: userData.weight?.toString() || "",
        age: userData.age?.toString() || "",
        gender: userData.gender || "",
        fitnessGoals: userData.fitness_goals || "",  // This matches the backend's snake_case
        bio: userData.bio || ""
      });

      // Fetch workout preferences data
      let workoutFrequencyGoal = null;
      let goalWeight = null;
      
      if (workoutPrefsRes.ok) {
        const workoutPrefs = await workoutPrefsRes.json();
        workoutFrequencyGoal = workoutPrefs.workout_frequency_goal;
        goalWeight = workoutPrefs.goal_weight;
      }
      
      // Set user preferences
      if (userData.preferences) {
        // Check for goal weight in user.preferences (preferred) or from workout prefs
        if (userData.preferences.goal_weight !== undefined) {
          goalWeight = userData.preferences.goal_weight;
        }
        
        setPreferences((prev) => ({
          ...prev,
          cardColor: userData.preferences.card_color || prev.cardColor,
          workoutFrequencyGoal: workoutFrequencyGoal, 
          goalWeight: goalWeight,
          useCustomCardColor: userData.preferences.use_custom_card_color || false
        }));
        
        // Set card color from backend preferences
        if (userData.preferences.use_custom_card_color) {
          // If using custom color, set the color directly from backend
          setCardColor(userData.preferences.card_color || "#f0f4ff");
        } else if (premiumTheme && premiumThemes[premiumTheme]) {
          // If using theme, set from premium theme
          setCardColor(premiumThemes[premiumTheme].primary);
        } else {
          // Otherwise use backend card color
          setCardColor(userData.preferences.card_color || "#f0f4ff");
        }
      }

      // Set profile picture with cache busting
      if (userData.profile_picture) {
        setProfilePicture(
          `${backendURL}/${userData.profile_picture}?t=${new Date().getTime()}`
        );
      }

      // Handle workout stats
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        
        // Fetch the workout streak information
        const streakRes = await fetch(`${backendURL}/workout-streak`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });
        
        let currentStreak = 0;
        
        if (streakRes.ok) {
          const streakData = await streakRes.json();
          currentStreak = streakData.streak;
          // If streakData has a frequency_goal and we didn't get it from preferences
          if (streakData.frequency_goal !== null && !workoutFrequencyGoal) {
            workoutFrequencyGoal = streakData.frequency_goal;
          }
        }
        
        setWorkoutStats({
          totalWorkouts: statsData.total_workouts,
          favoriteExercise: statsData.favorite_exercise,
          lastWorkout: statsData.last_workout,
          totalCardioDuration: statsData.total_cardio_duration,
          weightProgression: statsData.weight_progression,
          currentWeight: statsData.current_weight,
          currentStreak: currentStreak,
          frequencyGoal: workoutFrequencyGoal
        });
      } else {
        const statsErrorText = await statsRes.text().catch(() => "Unknown error");
      }

      // Handle last saved routine with better error handling and proper debugging
      try {
        if (routineRes.ok) {
          const routineData = await routineRes.json();
          // Check for valid data - must have name and exercises that is an array
          if (routineData && typeof routineData === 'object' && 
              routineData.name && 
              Array.isArray(routineData.exercises)) {
            console.log("Successfully loaded routine:", routineData.name);
            setLastSavedRoutine(routineData);
          } else if (routineData && routineData.message) {
            console.log("No routine data found:", routineData.message);
          } else {
            console.warn("Got routine data but missing required fields:", routineData);
          }
        } else if (routineRes.status === 404) {
          console.log("No saved routines found (404)");
        } else {
          // Log the error details for debugging
          try {
            const errorData = await routineRes.json();
            console.error("Error fetching last saved routine:", errorData);
          } catch (parseError) {
            console.error("Error parsing error response:", parseError);
            console.error("Server error when fetching last saved routine:", routineRes.status);
          }
        }
      } catch (routineErr) {
        console.error("Exception while processing last saved routine:", routineErr);
      }
    } catch (err) {
      setError(err.message || "Failed to load user data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [navigate, premiumTheme, premiumThemes]);

  // Initial data loading
  useEffect(() => {
    fetchUserData();
    
    // Add listener for before page unload/refresh
    const handleBeforeUnload = () => {
      // Handle before unload
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [fetchUserData]);

  // Effect to handle initial load
  useEffect(() => {
    // This effect should only run once on component mount
    const initialRun = async () => {
      // Wait for user preferences to be loaded
      if (!user || !user.preferences) {
        return;
      }
      
      // Check if we should use custom card color based on saved preference
      if (user.preferences.use_custom_card_color) {
        const savedColor = user.preferences.card_color || "#f0f4ff";
        // Use the custom color
        setCardColor(savedColor);
        // Make sure preferences are in sync
        setPreferences(prev => ({
          ...prev,
          useCustomCardColor: true,
          cardColor: savedColor
        }));
      } else if (premiumTheme && premiumThemes[premiumTheme]) {
        // Custom color not enabled, but premium theme is active
        setCardColor(premiumThemes[premiumTheme].primary);
      } else {
        // No premium theme, use default color
        const savedColor = "#f0f4ff";
        setCardColor(savedColor);
      }
    };
    
    initialRun();
  }, [user, premiumTheme, premiumThemes]);
  
  // Effect to sync card color with premium theme only when useCustomCardColor is false
  useEffect(() => {
    if (!preferences.useCustomCardColor && premiumTheme && premiumThemes[premiumTheme]) {
      const themeColor = premiumThemes[premiumTheme].primary;
      updateCardColor(themeColor);
    }
  }, [premiumTheme, premiumThemes, preferences.useCustomCardColor]);

  // Function to update card color in both state and preferences
  const updateCardColor = (newColor) => {
    // Update the state directly
    setCardColor(newColor);
    // Update in preferences object
    setPreferences(prev => {
      const updated = {
        ...prev,
        cardColor: newColor
      };
      return updated;
    });
    setPreferencesChanged(true);
  };

  const handleColorChange = (newColor) => {
    updateCardColor(newColor);
  };

  const formatJoinDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getMembershipDuration = (dateString) => {
    if (!dateString) return "";
    const joinDate = new Date(dateString);
    const now = new Date();

    const diffTime = Math.abs(now - joinDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `(${diffDays} days)`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `(${months} ${months === 1 ? "month" : "months"})`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `(${years} ${years === 1 ? "year" : "years"})`;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const username = user?.username || '';
    
    if (hour >= 5 && hour < 12) {
      return `Good morning, ${username}! Ready for a great workout?`;
    } else if (hour >= 12 && hour < 17) {
      return `Good afternoon, ${username}! Keep pushing towards your goals!`;
    } else if (hour >= 17 && hour < 22) {
      return `Good evening, ${username}! Time to finish strong!`;
    } else {
      return `Hi ${username}! A true champion trains at all hours!`;
    }
  };

  const handleUpdateProfile = async (updatedData) => {
    try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const response = await fetch(`${backendURL}/user-profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Check if we received a new access token (happens when username changes)
        if (data.access_token) {
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("access_token", data.access_token);
        }

        // Update user state with new data
        setUser(prevUser => ({
            ...prevUser,
            ...data
        }));

        // Show success message
        toast.success("Profile updated successfully!");

        // If username was changed, create a notification
        if (updatedData.username && updatedData.username !== user.username) {
            try {
                await notifyUsernameChanged(updatedData.username);
            } catch (notificationError) {
                // Don't fail the whole update if notification fails
            }
        }

        // Refresh user data to ensure everything is in sync
        await fetchUserData();

    } catch (err) {
        setError(err.message);
        toast.error("Failed to update profile");
    } finally {
        setLoading(false);
    }
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxSize = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      setError("Invalid file type. Please upload JPEG, PNG, or GIF.");
      return;
    }

    if (file.size > maxSize) {
      setError("File is too large. Maximum size is 5MB.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsSaving(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendURL}/upload-profile-picture`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setProfilePicture(
          `${backendURL}/${result.file_path}?t=${new Date().getTime()}`
        );
        setError(null);
        
        // Only send notification if notifications are enabled
        if (allNotificationsEnabled) {
          await notifyProfilePictureUpdated();
        }
      } else {
        setError(result.detail || "Failed to upload profile picture");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendURL}/remove-profile-picture`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setProfilePicture(null);
        setError(null);
        
        // Only send notification if notifications are enabled
        if (allNotificationsEnabled) {
          await notifyProfilePictureUpdated();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to remove profile picture");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreferenceChange = (newPrefs) => {
    // If this change includes workoutFrequencyGoal, ensure it's stored as a number or null
    if ('workoutFrequencyGoal' in newPrefs) {
      const oldValue = preferences.workoutFrequencyGoal;
      const frequencyGoal = newPrefs.workoutFrequencyGoal === "" 
        ? null 
        : parseInt(newPrefs.workoutFrequencyGoal);
      
      newPrefs.workoutFrequencyGoal = frequencyGoal;
    }
    
    setPreferences(newPrefs);
    setPreferencesChanged(true);
  };

  const handlePreferenceUpdate = async () => {
    // Prevent duplicate calls
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      // Show loading toast
      const updateToastId = toast.loading("Updating preferences...");
      
      const token = localStorage.getItem("token");
      
      // Store old values for comparison
      const oldGoalWeight = user?.preferences?.goal_weight;
      const oldFrequencyGoal = preferences.workoutFrequencyGoal;
      
      let frequencyUpdateSuccessful = false;
      let weightUpdateSuccessful = false;
      let errorMessage = null;
      
      // Validate frequency goal before sending
      const frequencyGoal = preferences.workoutFrequencyGoal ? parseInt(preferences.workoutFrequencyGoal) : null;
      if (frequencyGoal !== null && (frequencyGoal < 1 || frequencyGoal > 7)) {
        errorMessage = "Workout frequency goal must be between 1 and 7";
        toast.error(errorMessage, { id: updateToastId });
        return;
      }
      
      // Try the dedicated workout frequency endpoint first
      try {
        const frequencyResponse = await fetch(`${backendURL}/user/workout-frequency`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            frequency_goal: frequencyGoal
          }),
        });
        
        if (frequencyResponse.ok) {
          frequencyUpdateSuccessful = true;
          const data = await frequencyResponse.json();
          // Update local state with the new frequency goal
          setPreferences(prev => ({
            ...prev,
            workoutFrequencyGoal: data.workout_frequency_goal
          }));
          
          // Show success message
          toast.success(
            data.workout_frequency_goal 
              ? `Updated workout goal to ${data.workout_frequency_goal} times per week`
              : "Cleared workout frequency goal", 
            { id: updateToastId }
          );
          
          // Send notification if enabled
          if (allNotificationsEnabled && oldFrequencyGoal !== data.workout_frequency_goal) {
            await notifyWorkoutFrequencyGoalUpdated(data.workout_frequency_goal);
          }
        } else {
          const errorData = await frequencyResponse.json();
          errorMessage = errorData.detail || "Failed to update workout frequency goal";
        }
      } catch (err) {
        console.error("Error updating workout frequency:", err);
        errorMessage = "Error connecting to server";
      }
      
      // If frequency update failed, try the notifications endpoint as fallback
      if (!frequencyUpdateSuccessful) {
        try {
          const fallbackResponse = await fetch(`${backendURL}/user/settings/notifications`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              workout_frequency_goal: frequencyGoal
            }),
          });
          
          if (fallbackResponse.ok) {
            frequencyUpdateSuccessful = true;
            // Show success message for fallback
            toast.success(
              frequencyGoal 
                ? `Updated workout goal to ${frequencyGoal} times per week (via fallback)`
                : "Cleared workout frequency goal (via fallback)", 
              { id: updateToastId }
            );
            
            // Send notification if enabled via fallback too
            if (allNotificationsEnabled && oldFrequencyGoal !== frequencyGoal) {
              await notifyWorkoutFrequencyGoalUpdated(frequencyGoal);
            }
          } else {
            const errorData = await fallbackResponse.json();
            errorMessage = errorData.detail || "Failed to update workout frequency goal via fallback";
          }
        } catch (fallbackErr) {
          console.error("Error during fallback frequency update:", fallbackErr);
          errorMessage = "Error connecting to server during fallback";
        }
      }
      
      // Show error message if both attempts failed
      if (!frequencyUpdateSuccessful && errorMessage) {
        toast.error(errorMessage, { id: updateToastId });
      }
      
      // Update other user settings including weight goal
      try {
        const userProfileResponse = await fetch(`${backendURL}/user/settings`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email_notifications: true,
            workout_reminders: true,
            progress_reports: true,
            language: "en",
            card_color: preferences.cardColor,
            goal_weight: preferences.goalWeight,
            use_custom_card_color: preferences.useCustomCardColor,
            summary_frequency: "weekly",
            summary_day: "monday"
          }),
        });
        
        if (userProfileResponse.ok) {
          const profileData = await userProfileResponse.json();
          
          // Update local state with returned values
          setPreferences(prev => ({
            ...prev,
            goalWeight: profileData.goal_weight,
            cardColor: profileData.card_color
          }));
          
          // Update user object with the new preferences
          if (user && user.preferences) {
            setUser(prev => ({
              ...prev,
              preferences: {
                ...prev.preferences,
                goal_weight: profileData.goal_weight,
                card_color: profileData.card_color,
                use_custom_card_color: preferences.useCustomCardColor
              }
            }));
          }
          
          weightUpdateSuccessful = true;
          
          // If weight changed, show a success message
          if (oldGoalWeight !== profileData.goal_weight) {
            if (profileData.goal_weight) {
              toast.success(`Weight goal updated to ${profileData.goal_weight} kg`, {
                id: updateToastId,
                duration: 4000
              });
              
              // Send notification for weight goal update if enabled
              if (allNotificationsEnabled) {
                await notifyWeightGoalUpdated(profileData.goal_weight);
              }
            } else {
              toast.success("Weight goal cleared", {
                id: updateToastId,
                duration: 4000
              });
            }
          } else {
            toast.success("Preferences updated successfully", {
              id: updateToastId,
              duration: 4000
            });
          }
        } else {
          console.error("Failed to update other user settings");
          try {
            const errorData = await userProfileResponse.json();
            toast.error(errorData.detail || "Failed to update settings", {
              id: updateToastId
            });
          } catch (e) {
            toast.error("Failed to update settings", {
              id: updateToastId
            });
          }
        }
      } catch (err) {
        console.error("Error updating other user settings:", err);
        toast.error("Error updating settings", {
          id: updateToastId
        });
      }
      
      // Update local state
      setPreferencesChanged(false);
      setSuccessMessage("Preferences updated successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast.error("Error updating preferences");
    } finally {
      setIsSaving(false);
    }
  };

  // Function to check achievements after profile updates
  const checkAchievementsProgress = async () => {
    try {
      // Show a toast to indicate achievements are being checked
      const toastId = toast.loading("Checking achievements...");
      
      // Use the exposed function if available, for better state synchronization
      if (window.checkAndUpdateAchievements) {
        const result = await window.checkAndUpdateAchievements();
        
        if (result && result.newly_achieved > 0) {
          toast.success(`You earned ${result.newly_achieved} new achievement${result.newly_achieved > 1 ? 's' : ''}!`, {
            id: toastId
          });
        } else {
          toast.success("Achievement progress updated!", {
            id: toastId
          });
        }
        
        // Force a refresh of the achievements component
        setLastUpdated(Date.now());
        return;
      }

      // Fallback to direct API call if exposed function not available
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendURL}/achievements/check`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // After successful check, fetch the fresh achievement data
        const achievementsResponse = await fetch(`${backendURL}/user/achievements/progress`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (achievementsResponse.ok) {
          const data = await achievementsResponse.json();
          if (data && Array.isArray(data) && data.length > 0) {
            // Update cache
            localStorage.setItem('cachedAchievements', JSON.stringify(data));
            localStorage.setItem('achievementsLastUpdated', new Date().toISOString());
            
            // Force a refresh of the achievements component
            setLastUpdated(Date.now());
          }
        }
        
        // Update toast with success message
        if (result.newly_achieved > 0) {
          toast.success(`You earned ${result.newly_achieved} new achievement${result.newly_achieved > 1 ? 's' : ''}!`, {
            id: toastId
          });
        } else {
          toast.success("Achievement progress updated!", {
            id: toastId
          });
        }
      } else {
        // Failed to check achievements, update toast
        toast.error("Failed to check achievements", {
          id: toastId
        });
      }
    } catch (error) {
      console.error("Error checking achievements:", error);
      // Just log the error but don't throw it further to prevent app crashes
      toast.error("Error checking achievements");
    }
  };

  const handleInitiateAccountDeletion = async () => {
    setShowDeleteConfirmation(false);
    try {
      setIsSaving(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendURL}/auth/request-account-deletion`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Show a confirmation message
        alert(
          "A confirmation email has been sent. Please check your inbox to complete account deletion."
        );
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to initiate account deletion");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        await fetch(`${backendURL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      
      // Clear all storage
      localStorage.removeItem("access_token");
      localStorage.removeItem("token");
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("profile");
      
      // Dispatch a global event to notify other components
      window.dispatchEvent(new Event("auth-change"));
      
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handlePersonalInfoUpdate = async (updatedData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Map frontend field names to backend field names
      const mappedData = {
        height: updatedData.height ? parseFloat(updatedData.height) : null,
        weight: updatedData.weight ? parseFloat(updatedData.weight) : null,
        age: updatedData.age ? parseInt(updatedData.age) : null,
        gender: updatedData.gender,
        fitness_goals: updatedData.fitnessGoals, // Correct field mapping
        bio: updatedData.bio
      };
      
      const response = await fetch(`${backendURL}/user-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(mappedData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setUser(data);
      
      // Store original values for comparison
      const originalHeight = user?.height;
      const originalWeight = user?.weight;
      const originalAge = user?.age;
      const originalGender = user?.gender;
      const originalFitnessGoals = user?.fitness_goals;
      const originalBio = user?.bio;
      
      let notificationSent = false;
      let profileChanged = false;

      // Check if any profile fields changed
      if (mappedData.height !== originalHeight || 
          mappedData.weight !== originalWeight ||
          mappedData.age !== originalAge ||
          mappedData.gender !== originalGender ||
          mappedData.fitness_goals !== originalFitnessGoals ||
          mappedData.bio !== originalBio) {
        profileChanged = true;
      }

      if (allNotificationsEnabled) {
        // Check which fields were updated and send specific notifications
        if (mappedData.height !== originalHeight && mappedData.height !== null) {
          await notifyHeightUpdated(mappedData.height);
          notificationSent = true;
        }
        
        if (mappedData.weight !== originalWeight && mappedData.weight !== null) {
          await notifyWeightUpdated(mappedData.weight);
          notificationSent = true;
        }
        
        if (mappedData.age !== originalAge && mappedData.age !== null) {
          await notifyAgeUpdated(mappedData.age);
          notificationSent = true;
        }
        
        if (mappedData.gender !== originalGender && mappedData.gender) {
          await notifyGenderUpdated();
          notificationSent = true;
        }
        
        if (mappedData.fitness_goals !== originalFitnessGoals && mappedData.fitness_goals) {
          // Use the new specific notification for workout goals
          await notifyWorkoutGoalUpdated(mappedData.fitness_goals);
          notificationSent = true;
        }
        
        if (mappedData.bio !== originalBio && mappedData.bio) {
          await notifyBioUpdated();
          notificationSent = true;
        }
        
        // If no specific field notifications were sent but something changed, send generic update
        if (!notificationSent && profileChanged) {
          await notifyPersonalInfoUpdated();
        }
      }

      // Only check achievements if profile fields actually changed
      if (profileChanged) {
        try {
          // Check achievements after profile update
          await checkAchievementsProgress();
        } catch (error) {
          // Don't let achievement check failures affect the profile update success
        }
      }

      setLoading(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      setLoading(false);
      toast.error('Failed to update profile');
    }
  };

  const quickAccessLinks = [
    { icon: <FaDumbbell className="w-6 h-6" />, label: "Start doing your workouts!", path: "/workout-log" },
    { icon: <FaChartLine className="w-6 h-6" />, label: "Progress", path: "/progress-tracker" },
    { icon: <FaHistory className="w-6 h-6" />, label: "History", path: "/workout-history" },
    { icon: <FaTrophy className="w-6 h-6" />, label: "Achievements", path: "/achievements" },
    { icon: <FaCog className="w-6 h-6" />, label: "Settings", path: "/settings" },
  ];

  // Function to toggle custom color mode
  const toggleCustomColorMode = (checked) => {
    if (checked) {
      // Enabling custom color
      setCardColor(preferences.cardColor);
    } else {
      // Disabling custom color, switch to theme color if available
      if (premiumTheme && premiumThemes[premiumTheme]) {
        const themeColor = premiumThemes[premiumTheme].primary;
        setCardColor(themeColor);
      }
    }
    
    // Update the preferences state
    setPreferences(prev => ({
      ...prev,
      useCustomCardColor: checked
    }));
    
    // Make sure to trigger a save
    setPreferencesChanged(true);
  };

  useEffect(() => {
    // Existing code
  }, [preferences]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto pt-8">
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <button
            onClick={() => {
              setError(null);  // Clear the error
              setEditedUsername(user?.username || "");  // Reset username field
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"} ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8" style={{ 
          backgroundColor: preferences.useCustomCardColor 
            ? preferences.cardColor 
            : (premiumTheme && premiumTheme !== "default" && premiumThemes && premiumThemes[premiumTheme])
              ? premiumThemes[premiumTheme].primary
              : preferences.cardColor,
          background: preferences.useCustomCardColor 
            ? preferences.cardColor 
            : (premiumTheme && premiumTheme !== "default" && premiumThemes && premiumThemes[premiumTheme])
              ? `linear-gradient(135deg, ${premiumThemes[premiumTheme].primary}dd, ${premiumThemes[premiumTheme].secondary}aa)`
              : preferences.cardColor,
          color: theme === "dark" ? "white" : "#334155"
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500">
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <FaUser className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
                >
                  <FaCamera className="w-4 h-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  {isEditing ? (
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editedUsername}
                          onChange={(e) => setEditedUsername(e.target.value)}
                          className="text-2xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none"
                        />
                        <button
                          onClick={() => handleUpdateProfile({ username: editedUsername })}
                          disabled={isSaving}
                          className="text-green-500 hover:text-green-600"
                        >
                          {isSaving ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-700"></div>
                          ) : (
                            <FaSave className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setEditedUsername(user.username);
                            // Clear any errors
                            setError(null);
                            // Clear inline errors
                            const errorElement = document.getElementById('username-error');
                            if (errorElement) {
                              errorElement.textContent = '';
                              errorElement.classList.add('hidden');
                            }
                          }}
                          className="text-red-500 hover:text-red-600"
                        >
                          <FaTimes className="w-5 h-5" />
                        </button>
                      </div>
                      <div id="username-error" className="text-red-500 text-sm mt-1 hidden"></div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl font-bold">{user?.username}</h1>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <FaEdit className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 italic">
                  {getGreeting()}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  Member since {formatJoinDate(user?.created_at)} {getMembershipDuration(user?.created_at)}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              {/* Theme info and color picker */}
              {premiumTheme && premiumTheme !== "default" ? (
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {premiumThemes && premiumThemes[premiumTheme] 
                        ? `Using ${premiumThemes[premiumTheme].name} Theme` 
                        : "Using Theme"}
                    </span>
                    <div className="w-6 h-6 rounded-full" style={{ 
                      backgroundColor: premiumThemes && premiumThemes[premiumTheme] 
                        ? premiumThemes[premiumTheme].primary 
                        : "#3b82f6" 
                    }}></div>
                    {isAdmin && premiumThemes && premiumThemes[premiumTheme] && premiumThemes[premiumTheme].isPremium && (
                      <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      {showColorPicker ? "Hide Card Options" : "Customize Card"}
                    </button>
                  </div>
                  
                  {showColorPicker && (
                    <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                      <label className="flex items-center text-sm mb-2">
                        <input
                          type="checkbox"
                          checked={preferences.useCustomCardColor}
                          onChange={(e) => toggleCustomColorMode(e.target.checked)}
                          className="mr-2 h-4 w-4"
                        />
                        Use custom color instead
                      </label>
                      
                      {preferences.useCustomCardColor && (
                        <div className="flex items-center mt-2">
                          <span className="text-sm mr-2">Select color:</span>
                          <input
                            type="color"
                            value={preferences.cardColor}
                            onChange={(e) => handleColorChange(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer"
                          />
                        </div>
                      )}
                      
                      {preferencesChanged && (
                        <div className="mt-2 flex justify-end">
                          <button
                            onClick={handlePreferenceUpdate}
                            disabled={isSaving}
                            className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
                          >
                            {isSaving ? "Saving..." : "Save Changes"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {showColorPicker ? "Hide Card Color" : "Change Card Color"}
                  </button>
                  
                  {showColorPicker && (
                    <input
                      type="color"
                      value={preferences.cardColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                  )}
                </div>
              )}
              
              {/* Save button appears outside the hidden section when preferences changed */}
              {preferencesChanged && !showColorPicker && (
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={handlePreferenceUpdate}
                    disabled={isSaving}
                    className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
              
              {successMessage && (
                <div className="text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                  {successMessage}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Access Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {quickAccessLinks.map((link, index) => (
            <button
              key={index}
              onClick={() => navigate(link.path)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 flex items-center space-x-4"
            >
              <div className="text-blue-500">{link.icon}</div>
              <span className="text-lg font-medium text-gray-900 dark:text-white">
                {link.label}
              </span>
            </button>
          ))}
        </div>

        {/* Stats and Preferences */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-lg shadow p-6 mb-6`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Personal Information</h2>
              {!isEditingPersonalInfo ? (
                <button
                  onClick={() => {
                    setPersonalInfo({
                      height: user?.height?.toString() || "",
                      weight: user?.weight?.toString() || "",
                      age: user?.age?.toString() || "",
                      gender: user?.gender || "",
                      fitnessGoals: user?.fitness_goals || "",
                      bio: user?.bio || ""
                    });
                    setIsEditingPersonalInfo(true);
                    setPersonalInfoError("");
                  }}
                  className="text-teal-500 hover:text-teal-400"
                >
                  <FaEdit />
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePersonalInfoUpdate(personalInfo)}
                    className="text-teal-500 hover:text-teal-400"
                    title="Save changes"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <FaSave />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingPersonalInfo(false);
                      setPersonalInfoError("");
                    }}
                    className="text-gray-500 hover:text-gray-400"
                    title="Cancel"
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
            </div>

            {personalInfoError && (
              <div className="bg-red-500 text-white p-3 rounded mb-4">{personalInfoError}</div>
            )}

            {isEditingPersonalInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={personalInfo.height}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, height: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg ${
                      theme === "dark"
                        ? "bg-gray-700 text-white border-gray-600"
                        : "bg-gray-100 text-gray-900 border-gray-300"
                    } border`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={personalInfo.weight}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, weight: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg ${
                      theme === "dark"
                        ? "bg-gray-700 text-white border-gray-600"
                        : "bg-gray-100 text-gray-900 border-gray-300"
                    } border`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={personalInfo.age}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, age: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg ${
                      theme === "dark"
                        ? "bg-gray-700 text-white border-gray-600"
                        : "bg-gray-100 text-gray-900 border-gray-300"
                    } border`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gender</label>
                  <select
                    name="gender"
                    value={personalInfo.gender}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, gender: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg ${
                      theme === "dark"
                        ? "bg-gray-700 text-white border-gray-600"
                        : "bg-gray-100 text-gray-900 border-gray-300"
                    } border`}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Fitness Goals</label>
                  <textarea
                    name="fitnessGoals"
                    value={personalInfo.fitnessGoals}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, fitnessGoals: e.target.value }))}
                    rows="3"
                    className={`w-full px-3 py-2 rounded-lg ${
                      theme === "dark"
                        ? "bg-gray-700 text-white border-gray-600"
                        : "bg-gray-100 text-gray-900 border-gray-300"
                    } border`}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <textarea
                    name="bio"
                    value={personalInfo.bio}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, bio: e.target.value }))}
                    rows="3"
                    className={`w-full px-3 py-2 rounded-lg ${
                      theme === "dark"
                        ? "bg-gray-700 text-white border-gray-600"
                        : "bg-gray-100 text-gray-900 border-gray-300"
                    } border`}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Height</p>
                  <p className="font-medium">{user?.height ? `${user.height} cm` : "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Weight</p>
                  <p className="font-medium">{user?.weight ? `${user.weight} kg` : "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium">{user?.age || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium">{user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : "Not set"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Fitness Goals</p>
                  <p className="font-medium">{user?.fitness_goals || "Not set"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Bio</p>
                  <p className="font-medium">{user?.bio || "Not set"}</p>
                </div>
              </div>
            )}
          </div>

          {/* Workout Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Workout Statistics
            </h2>
            {workoutStats && (
              <div className="space-y-3">
                {/* Weight Goal */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FaWeightHanging className="text-purple-500" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Weight Goal</p>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {preferences.goalWeight || "Not set"} kg
                          </span>
                          <button
                            onClick={() => {
                              // Prevent rapid clicking
                              if (isSaving) return;
                              
                              const newWeight = prompt("Enter your weight goal in kg:");
                              if (newWeight && !isNaN(newWeight)) {
                                setPreferences(prev => ({
                                  ...prev,
                                  goalWeight: parseFloat(newWeight)
                                }));
                                setPreferencesChanged(true);
                              }
                            }}
                            className="text-purple-500 hover:text-purple-600"
                          >
                            <FaEdit className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {preferences.goalWeight && workoutStats.currentWeight && (
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Current: {workoutStats.currentWeight} kg
                      </span>
                    )}
                  </div>
                  {preferencesChanged && (
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={handlePreferenceUpdate}
                        disabled={isSaving}
                        className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
                      >
                        {isSaving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Total Workouts */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FaDumbbell className="text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Total Workouts</p>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {workoutStats.totalWorkouts}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Workout Streak */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FaFire className="text-green-500" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Current Streak</p>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {workoutStats.currentStreak > 0 ? 
                            <>Day {workoutStats.currentStreak} <span role="img" aria-label="fire">🔥</span></> : 
                            <><span role="img" aria-label="broken">💔</span> Streak Broken</>
                          }
                        </span>
                        <div className="mt-2">
                          <label className="text-xs text-gray-500 dark:text-gray-400">Workout Frequency Goal:</label>
                          <div className="flex items-center space-x-2">
                            <select
                              value={preferences.workoutFrequencyGoal || ""}
                              onChange={(e) => handlePreferenceChange({ ...preferences, workoutFrequencyGoal: e.target.value })}
                              className="w-full mt-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                              <option value="">Daily Streak</option>
                              <option value="1">1 workout/week</option>
                              <option value="2">2 workouts/week</option>
                              <option value="3">3 workouts/week</option>
                              <option value="4">4 workouts/week</option>
                              <option value="5">5 workouts/week</option>
                              <option value="6">6 workouts/week</option>
                              <option value="7">7 workouts/week</option>
                            </select>
                            {preferencesChanged && (
                              <button
                                onClick={handlePreferenceUpdate}
                                disabled={isSaving}
                                className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
                              >
                                {isSaving ? "Saving..." : "Save"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Last Workout</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {workoutStats.lastWorkout ? new Date(workoutStats.lastWorkout).toLocaleDateString('en-GB') : "Never"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Total Duration</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {workoutStats.totalCardioDuration ? 
                        `${Math.floor(workoutStats.totalCardioDuration / 60)} hour${Math.floor(workoutStats.totalCardioDuration / 60) !== 1 ? 's' : ''} ${Math.round(workoutStats.totalCardioDuration % 60)} min` : 
                        "0 hours"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Favorite Exercise</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {workoutStats.favoriteExercise ? 
                        workoutStats.favoriteExercise.charAt(0).toUpperCase() + workoutStats.favoriteExercise.slice(1) : 
                        "None"}
                    </span>
                  </div>
                </div>

                {/* Last Saved Routine */}
                {lastSavedRoutine && lastSavedRoutine.name && lastSavedRoutine.exercises && lastSavedRoutine.exercises.length > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FaSave className="text-yellow-500" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Last Saved Routine</p>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {lastSavedRoutine.name || "Untitled Routine"}
                            </span>
                            <button
                              onClick={() => navigate(`/routines`)}
                              className="text-yellow-500 hover:text-yellow-600"
                            >
                              <FaExternalLinkAlt className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {lastSavedRoutine.created_at ? 
                              new Date(lastSavedRoutine.created_at).toLocaleDateString('en-GB') : 
                              "No date available"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {lastSavedRoutine.exercises.length} exercise{lastSavedRoutine.exercises.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Weight Progression */}
                {workoutStats.weightProgression && workoutStats.weightProgression.length > 0 && (
                  <div className="h-24 bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                    <div className="flex items-end h-full space-x-1">
                      {workoutStats.weightProgression.map((entry, index) => {
                        const heightPercentage = (entry.weight / Math.max(...workoutStats.weightProgression.map(e => e.weight))) * 100;
                        const tooltipText = `${entry.weight}kg on ${new Date(entry.date).toLocaleDateString('en-GB')}`;
                        
                        return (
                          <div
                            key={index}
                            className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                            style={{ height: `${heightPercentage}%` }}
                            title={tooltipText}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Achievements Section */}
        <div className="mt-8" id="achievements">
          <ErrorBoundary>
            <AchievementsSection 
              backendURL={backendURL} 
              key={`achievements-${user?.id}-${lastUpdated}`} 
            />
          </ErrorBoundary>
        </div>

        {/* Account Actions */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Account Actions
          </h2>
          <div className="space-y-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition-colors"
            >
              <FaSignOutAlt className="w-5 h-5" />
              <span>Logout</span>
            </button>
            <button
              onClick={() => setShowDeleteConfirmation(true)}
              className="w-full flex items-center justify-center space-x-2 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition-colors"
            >
              <FaTrash className="w-5 h-5" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Delete Account
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleInitiateAccountDeletion}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
