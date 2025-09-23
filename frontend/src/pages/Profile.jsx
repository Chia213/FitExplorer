import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
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
import "../styles/profile-card-animations.css";

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
    return fallback || <div className="text-destructive p-4 rounded bg-destructive/10 my-4">Something went wrong loading this component.</div>;
  }
  
  return children;
}

function Profile() {
  console.log("🔍 Profile: Component starting to render");
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  console.log("🔍 Profile: State initialized", { user: !!user, loading, error });
  const [cardColor, setCardColor] = useState(null); // Initialize as null to prevent default color flash
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
    cardColor: null, // Initialize as null to prevent default color flash
    nameBorderColor: "#3b82f6", // Initialize with default border color
    workoutFrequencyGoal: null,
    goalWeight: null,
    useCustomCardColor: false,
    useCustomNameBorderColor: false,
    enableAnimations: false,
    animationStyle: "subtle",
    animationSpeed: "medium"
  });
  const [preferencesChanged, setPreferencesChanged] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const fileInputRef = useRef(null);
  const [lastUpdated, setLastUpdated] = useState(Date.now()); // Track last update time for achievements

  const navigate = useNavigate();
  
  console.log("🔍 Profile: About to call useTheme hook");
  const { theme, premiumTheme, premiumThemes, isAdmin, changePremiumTheme } = useTheme();
  console.log("🔍 Profile: useTheme hook successful", { theme, premiumTheme, isAdmin });
  
  // const { allNotificationsEnabled } = useNotifications(); // Temporarily disabled
  const allNotificationsEnabled = true; // Temporary fallback
  
  console.log("🔍 Profile: Hooks initialized successfully");

  // Add a function to get animation classes based on user preferences
  const getAnimationClasses = () => {
    // Direct debugging of preferences
    console.log("Current animation preferences:", {
      enabled: preferences.enableAnimations,
      style: preferences.animationStyle,
      speed: preferences.animationSpeed
    });
    
    // Check if global animation state exists as fallback
    const globalAnimations = window.FitExplorerAnimations || null;
    let animationsEnabled = preferences.enableAnimations;
    let animationStyle = preferences.animationStyle || 'subtle';
    let animationSpeed = preferences.animationSpeed || 'medium';
    
    // If preferences aren't set but global state exists, use it instead
    if (!animationsEnabled && globalAnimations && globalAnimations.enabled) {
      console.log("Using global animation state as fallback:", globalAnimations);
      animationsEnabled = globalAnimations.enabled;
      animationStyle = globalAnimations.style;
      animationSpeed = globalAnimations.speed;
    }
    
    if (animationsEnabled) {
      // Apply animation classes directly for maximum compatibility
      return `profile-animation ${animationStyle} ${animationSpeed}`;
    }
    return '';
  };
  
  // Apply animations directly when component mounts or preferences change
  useEffect(() => {
    // Check if global animation state exists and use as fallback
    const globalAnimations = window.FitExplorerAnimations || null;
    
    let animationsEnabled = preferences.enableAnimations;
    let animationStyle = preferences.animationStyle || 'subtle';
    let animationSpeed = preferences.animationSpeed || 'medium';
    
    // If preferences aren't set but global state exists, use it instead
    if (!animationsEnabled && globalAnimations && globalAnimations.enabled) {
      console.log("Using global animation state as fallback:", globalAnimations);
      animationsEnabled = globalAnimations.enabled;
      animationStyle = globalAnimations.style;
      animationSpeed = globalAnimations.speed;
      
      // Update local state with global settings
      setPreferences(prev => ({
        ...prev,
        enableAnimations: globalAnimations.enabled,
        animationStyle: globalAnimations.style,
        animationSpeed: globalAnimations.speed
      }));
    }
    
    console.log("Applying animations directly from useEffect - preferences:", {
      enabled: animationsEnabled,
      style: animationStyle,
      speed: animationSpeed
    });
    
    // Small delay to ensure the DOM is ready
    setTimeout(() => {
      const profileCard = document.querySelector('.profile-header-card');
      if (profileCard) {
        // Clear existing animation classes
        profileCard.classList.remove('profile-animation');
        ['subtle', 'bounce', 'pulse', 'wave', 'glide', 'sparkle', 'pop', 'swing', 'ripple',
         'float', 'rotate', 'spin', 'shake', 'wobble'].forEach(style => 
          profileCard.classList.remove(style));
        ['slow', 'medium', 'fast'].forEach(speed => 
          profileCard.classList.remove(speed));
        
        // Apply new animation classes if enabled
        if (animationsEnabled) {
          profileCard.classList.add('profile-animation');
          profileCard.classList.add(animationStyle);
          profileCard.classList.add(animationSpeed);
          
          // Set animation duration
          profileCard.style.setProperty('--animation-duration', 
            animationSpeed === "slow" ? "4s" : 
            animationSpeed === "fast" ? "1.5s" : "2.5s"
          );
          
          console.log("Animation classes applied:", 
            `profile-animation ${animationStyle} ${animationSpeed}`);
        } else {
          console.log("Animations disabled, classes removed");
        }
      }
    }, 100);
  }, [preferences.enableAnimations, preferences.animationStyle, preferences.animationSpeed]);

  // Effect to update profile picture when user data changes (for cross-device sync)
  useEffect(() => {
    if (user && user.profile_picture) {
      // Force refresh profile picture with cache busting when user data changes
      setProfilePicture(
        `${backendURL}/${user.profile_picture}?t=${new Date().getTime()}`
      );
    } else if (user && !user.profile_picture) {
      setProfilePicture(null);
    }
  }, [user?.profile_picture]);

  // Effect to refresh user data when component becomes visible (for cross-device sync)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        // Refresh user data when tab becomes visible (user switched back to this tab)
        fetchUserData();
      }
    };

    const handleFocus = () => {
      if (user) {
        // Refresh user data when window regains focus
        fetchUserData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, fetchUserData]);

  // Function to fetch user data - extracted for reuse
  const fetchUserData = useCallback(async () => {
    console.log("🔍 Profile: fetchUserData called");
    
    const token = localStorage.getItem("token");
    console.log("🔍 Profile: Token found:", !!token);
    
    if (!token) {
      console.log("🔍 Profile: No token, redirecting to login");
      navigate("/login");
      return;
    }

    try {
      console.log("🔍 Profile: Starting API calls");
      setLoading(true);
      setError(null); // Clear any previous errors
      
      // First, check if backend is reachable
      try {
        console.log("🔍 Profile: Checking backend health at", `${backendURL}/`);
        const healthCheck = await fetch(`${backendURL}/`, { 
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        console.log("🔍 Profile: Health check response:", healthCheck.status);
        if (!healthCheck.ok) {
          throw new Error("Backend server is not responding");
        }
      } catch (healthErr) {
        console.warn("🔍 Profile: Backend health check failed:", healthErr);
        // Continue anyway, the main request might still work
      }
      
      // Fetch profile data first (most important)
      console.log("🔍 Profile: Fetching user profile from", `${backendURL}/user-profile`);
      const profileRes = await fetch(`${backendURL}/user-profile`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      console.log("🔍 Profile: Profile API response status:", profileRes.status);

      // Handle profile response
      if (!profileRes.ok) {
        console.log("🔍 Profile: Profile API failed with status:", profileRes.status);
        if (profileRes.status === 401) {
          console.log("🔍 Profile: 401 Unauthorized, clearing token and redirecting");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        const errorData = await profileRes.json();
        throw new Error(errorData.detail || "Failed to fetch profile data");
      }

      const userData = await profileRes.json();
      console.log("🔍 Profile: User data received:", userData);
      setUser(userData);
      setEditedUsername(userData.username);

      // Initialize personal information from user data
      setPersonalInfo({
        height: userData.height?.toString() || "",
        weight: userData.weight?.toString() || "",
        age: userData.age?.toString() || "",
        gender: userData.gender || "",
        fitnessGoals: userData.fitness_goals || "",
        bio: userData.bio || ""
      });

      // Set profile picture with cache busting
      if (userData.profile_picture) {
        setProfilePicture(
          `${backendURL}/${userData.profile_picture}?t=${new Date().getTime()}`
        );
      } else {
        setProfilePicture(null);
      }

      // Set user preferences
      if (userData.preferences) {
        console.log("Loading preferences from backend:", userData.preferences);
        setPreferences((prev) => {
          const savedColor = userData.preferences.card_color || "#f0f4ff";
          const isCustomColor = userData.preferences.card_color && userData.preferences.card_color !== "#f0f4ff";
          const newPrefs = {
            ...prev,
            cardColor: savedColor,
            nameBorderColor: userData.preferences.name_border_color || prev.nameBorderColor || "#3b82f6",
            useCustomCardColor: userData.preferences.use_custom_card_color || isCustomColor || false,
            useCustomNameBorderColor: userData.preferences.use_custom_name_border_color || false,
            enableAnimations: userData.preferences.enable_animations === true,
            animationStyle: userData.preferences.animation_style || "subtle",
            animationSpeed: userData.preferences.animation_speed || "medium"
          };
          console.log("Setting preferences:", newPrefs);
          return newPrefs;
        });
      } else {
        // Fallback to localStorage if backend data is not available
        console.log("No backend preferences, checking localStorage fallback");
        const cachedPreferences = localStorage.getItem('cachedUserPreferences');
        if (cachedPreferences) {
          try {
            const parsed = JSON.parse(cachedPreferences);
            if (parsed.cardColor && parsed.cardColor !== "#f0f4ff") {
              console.log("Using cached preferences:", parsed);
              setPreferences(prev => ({
                ...prev,
                cardColor: parsed.cardColor,
                useCustomCardColor: true,
                nameBorderColor: parsed.nameBorderColor || "#3b82f6"
              }));
              setCardColor(parsed.cardColor);
            }
          } catch (err) {
            console.warn("Failed to parse cached preferences:", err);
          }
        }
        
        // Set card color from backend preferences
        if (userData.preferences.use_custom_card_color) {
          setCardColor(userData.preferences.card_color || "#f0f4ff");
        } else {
          setCardColor(userData.preferences.card_color || "#f0f4ff");
        }
      }

      // Now fetch additional data in parallel (with error handling for each)
      const additionalDataPromises = [
        // Workout stats
        fetch(`${backendURL}/workout-stats`, {
          method: "GET",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          credentials: "include"
        }).catch(err => {
          console.warn("Failed to fetch workout stats:", err);
          return { ok: false, status: 500 };
        }),
        
        // Last saved routine
        fetch(`${backendURL}/api/last-saved-routine`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }).catch(err => {
          console.warn("Failed to fetch last saved routine:", err);
          return { ok: false, status: 500 };
        }),
        
        // Workout preferences
        fetch(`${backendURL}/api/workout-preferences`, {
          method: "GET",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }).catch(err => {
          console.warn("Failed to fetch workout preferences:", err);
          return { ok: false, status: 500 };
        })
      ];

      const [statsRes, routineRes, workoutPrefsRes] = await Promise.all(additionalDataPromises);

      // Fetch workout preferences data
      let workoutFrequencyGoal = null;
      let goalWeight = null;
      
      if (workoutPrefsRes.ok) {
        try {
          const workoutPrefs = await workoutPrefsRes.json();
          workoutFrequencyGoal = workoutPrefs.workout_frequency_goal;
          goalWeight = workoutPrefs.goal_weight;
        } catch (err) {
          console.warn("Error parsing workout preferences:", err);
        }
      }
      
      // Update preferences with workout data
      if (userData.preferences) {
        setPreferences((prev) => {
          const newPrefs = {
            ...prev,
            workoutFrequencyGoal: workoutFrequencyGoal, 
            goalWeight: goalWeight,
          };
          return newPrefs;
        });
      }

      // Handle workout stats
      if (statsRes.ok) {
        try {
          const statsData = await statsRes.json();
          
          // Fetch the workout streak information
          const streakRes = await fetch(`${backendURL}/workout-streak`, {
            headers: { 
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
          }).catch(err => {
            console.warn("Failed to fetch workout streak:", err);
            return { ok: false, status: 500 };
          });
          
          let currentStreak = 0;
          
          if (streakRes.ok) {
            try {
              const streakData = await streakRes.json();
              currentStreak = streakData.streak;
              // If streakData has a frequency_goal and we didn't get it from preferences
              if (streakData.frequency_goal !== null && !workoutFrequencyGoal) {
                workoutFrequencyGoal = streakData.frequency_goal;
              }
            } catch (err) {
              console.warn("Error parsing streak data:", err);
            }
          }
          
          setWorkoutStats({
            totalWorkouts: statsData.total_workouts || 0,
            favoriteExercise: statsData.favorite_exercise || null,
            lastWorkout: statsData.last_workout || null,
            totalCardioDuration: statsData.total_cardio_duration || 0,
            weightProgression: statsData.weight_progression || [],
            currentWeight: statsData.current_weight || null,
            currentStreak: currentStreak,
            frequencyGoal: workoutFrequencyGoal
          });
        } catch (err) {
          console.warn("Error processing workout stats:", err);
        }
      }

      // Handle last saved routine
      if (routineRes.ok) {
        try {
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
        } catch (err) {
          console.warn("Error processing last saved routine:", err);
        }
      } else if (routineRes.status === 404) {
        console.log("No saved routines found (404)");
      } else {
        console.warn("Failed to fetch last saved routine:", routineRes.status);
      }
    } catch (err) {
      console.error("🔍 Profile: Error in fetchUserData:", err);
      setError(err.message || "Failed to load user data. Please try again.");
    } finally {
      console.log("🔍 Profile: fetchUserData completed, setting loading to false");
      setLoading(false);
    }
  }, [navigate]);

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
        setPreferences(prev => ({
          ...prev,
          useCustomCardColor: false,
          cardColor: premiumThemes[premiumTheme].primary
        }));
      } else {
        // No premium theme, use backend card color or default
        const savedColor = user.preferences.card_color || "#f0f4ff";
        const isCustomColor = user.preferences.card_color && user.preferences.card_color !== "#f0f4ff";
        setCardColor(savedColor);
        setPreferences(prev => ({
          ...prev,
          useCustomCardColor: isCustomColor || user.preferences.use_custom_card_color || false,
          cardColor: savedColor
        }));
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

  // Listen for card color changes from Settings page
  useEffect(() => {
    const handleCardColorChange = (event) => {
      console.log('Card color changed:', event.detail);
      const { useCustomColor, color } = event.detail;
      
      // Update local state
      setPreferences(prev => ({
        ...prev,
        useCustomCardColor: useCustomColor,
        cardColor: color
      }));
      
      // Update card color display
      if (useCustomColor) {
        setCardColor(color);
      } else if (premiumTheme && premiumThemes[premiumTheme]) {
        setCardColor(premiumThemes[premiumTheme].primary);
      }
    };
    
    // Add event listener
    window.addEventListener('cardColorChanged', handleCardColorChange);
    
    // Clean up
    return () => {
      window.removeEventListener('cardColorChanged', handleCardColorChange);
    };
  }, [premiumTheme, premiumThemes]);

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
    // When user manually changes color, enable custom color mode
    setPreferences(prev => ({
      ...prev,
      useCustomCardColor: true,
      cardColor: newColor
    }));
    setPreferencesChanged(true);
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
                // await notifyUsernameChanged(updatedData.username); // Temporarily disabled
            } catch (notificationError) {
                // Don't fail the whole update if notification fails
            }
        }

        // Exit editing mode if we were editing username
        if (updatedData.username) {
            setIsEditing(false);
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
          // await notifyProfilePictureUpdated(); // Temporarily disabled
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
          // await notifyProfilePictureUpdated(); // Temporarily disabled
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
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      // Prepare requests for both endpoints
      const settingsRequestBody = {
        use_custom_card_color: preferences.useCustomCardColor,
        card_color: preferences.cardColor,
        use_custom_name_border_color: preferences.useCustomNameBorderColor,
        name_border_color: preferences.nameBorderColor,
        clear_premium_theme: preferences.useCustomCardColor,
        goal_weight: preferences.goalWeight
      };
      
      const frequencyRequestBody = {
        workout_frequency_goal: preferences.workoutFrequencyGoal
      };
      
      console.log("Saving preferences to backend:", settingsRequestBody);
      console.log("Saving workout frequency:", frequencyRequestBody);
      
      // Make both API calls in parallel
      const [settingsResponse, frequencyResponse] = await Promise.all([
        fetch(`${backendURL}/user/settings`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(settingsRequestBody),
        }),
        fetch(`${backendURL}/user/workout-frequency`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(frequencyRequestBody),
        })
      ]);

      // Check if both requests were successful
      if (settingsResponse.ok && frequencyResponse.ok) {
        setSuccessMessage("Changes saved successfully!");
        // Cache preferences to localStorage as fallback
        localStorage.setItem('cachedUserPreferences', JSON.stringify({
          cardColor: preferences.cardColor,
          useCustomCardColor: preferences.useCustomCardColor,
          nameBorderColor: preferences.nameBorderColor,
          goalWeight: preferences.goalWeight,
          workoutFrequencyGoal: preferences.workoutFrequencyGoal
        }));
        // If using custom color, we need to clear the premium theme locally
        if (preferences.useCustomCardColor && premiumTheme !== 'default') {
          changePremiumTheme('default');
        }
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        // Handle errors from either request
        const settingsError = settingsResponse.ok ? null : await settingsResponse.json();
        const frequencyError = frequencyResponse.ok ? null : await frequencyResponse.json();
        
        const errorMessage = settingsError?.detail || frequencyError?.detail || "Failed to save changes";
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Error saving preferences:", err);
      setError("Failed to save changes");
    } finally {
      setIsSaving(false);
      setPreferencesChanged(false);
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
          // await notifyHeightUpdated(mappedData.height); // Temporarily disabled
          notificationSent = true;
        }
        
        if (mappedData.weight !== originalWeight && mappedData.weight !== null) {
          // await notifyWeightUpdated(mappedData.weight); // Temporarily disabled
          notificationSent = true;
        }
        
        if (mappedData.age !== originalAge && mappedData.age !== null) {
          // await notifyAgeUpdated(mappedData.age); // Temporarily disabled
          notificationSent = true;
        }
        
        if (mappedData.gender !== originalGender && mappedData.gender) {
          // await notifyGenderUpdated(); // Temporarily disabled
          notificationSent = true;
        }
        
        if (mappedData.fitness_goals !== originalFitnessGoals && mappedData.fitness_goals) {
          // Use the new specific notification for workout goals
          // await notifyWorkoutGoalUpdated(mappedData.fitness_goals); // Temporarily disabled
          notificationSent = true;
        }
        
        if (mappedData.bio !== originalBio && mappedData.bio) {
          // await notifyBioUpdated(); // Temporarily disabled
          notificationSent = true;
        }
        
        // If no specific field notifications were sent but something changed, send generic update
        if (!notificationSent && profileChanged) {
          // await notifyPersonalInfoUpdated(); // Temporarily disabled
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
  const toggleCustomColorMode = (enabled) => {
    setPreferences(prev => ({
      ...prev,
      useCustomCardColor: enabled,
      cardColor: enabled ? (prev.cardColor || "#f0f4ff") : (prev.cardColor || "#f0f4ff")
    }));
    setPreferencesChanged(true);
  };

  // Listen for animation preference changes
  useEffect(() => {
    const handleAnimationPreferences = (event) => {
      if (event.detail) {
        const { enabled, style, speed } = event.detail;
        console.log("Received animation preferences event:", enabled, style, speed);
        
        // Force immediate state update
        setPreferences(prev => {
          const newPrefs = {
            ...prev,
            enableAnimations: enabled,
            animationStyle: style || prev.animationStyle,
            animationSpeed: speed || prev.animationSpeed
          };
          
          console.log("Updating preferences to:", newPrefs);
          
          // Apply changes directly to DOM for immediate effect
          setTimeout(() => {
            const profileCard = document.querySelector('.profile-header-card');
            if (profileCard) {
              if (enabled) {
                profileCard.classList.add('profile-animation');
                profileCard.classList.add(style || 'subtle');
                profileCard.classList.add(speed || 'medium');
                
                // Update custom properties
                profileCard.style.setProperty('--animation-duration', 
                  speed === "slow" ? "4s" : 
                  speed === "fast" ? "1.5s" : "2.5s"
                );
                
                // Force a repaint to ensure animation restarts
                profileCard.style.animation = 'none';
                profileCard.offsetHeight; // Trigger reflow
                profileCard.style.animation = '';
              } else {
                profileCard.classList.remove('profile-animation');
                // Remove all possible animation styles
                ['subtle', 'bounce', 'pulse', 'wave', 'glide', 'sparkle', 'pop', 'swing', 'ripple',
                 'float', 'rotate', 'spin', 'shake', 'wobble'].forEach(s => 
                  profileCard.classList.remove(s));
                // Remove all possible speeds
                ['slow', 'medium', 'fast'].forEach(s => 
                  profileCard.classList.remove(s));
              }
            }
          }, 0);
          
          return newPrefs;
        });
      }
    };
    
    console.log("Adding animationPreferencesChanged event listener");
    window.addEventListener('animationPreferencesChanged', handleAnimationPreferences);
    
    // Cleanup
    return () => {
      console.log("Removing animationPreferencesChanged event listener");
      window.removeEventListener('animationPreferencesChanged', handleAnimationPreferences);
    };
  }, []);

  console.log("🔍 Profile: About to render, current state:", { loading, error, user: !!user });

  if (loading) {
    console.log("🔍 Profile: Rendering loading state");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    console.log("🔍 Profile: Rendering error state:", error);
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto pt-8">
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setError(null);  // Clear the error
                setEditedUsername(user?.username || "");  // Reset username field
                fetchUserData(); // Retry fetching data
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Retry
            </button>
            <button
              onClick={() => {
                setError(null);  // Clear the error
                setEditedUsername(user?.username || "");  // Reset username field
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Continue Anyway
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log("🔍 Profile: Rendering main profile content");
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header - Mobile Optimized */}
        <div 
          className={`mx-auto max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl p-2 sm:p-4 md:p-6 rounded-2xl text-center mb-4 sm:mb-6 md:mb-8 profile-header-card border border-gray-200 dark:border-gray-700 sm:border-0 shadow-xl hover:shadow-2xl transition-all duration-300 ${getAnimationClasses()}`} 
          style={{ 
            backgroundColor: preferences.useCustomCardColor 
              ? preferences.cardColor 
              : (premiumTheme && premiumTheme !== "default" && premiumThemes && premiumThemes[premiumTheme])
                ? premiumThemes[premiumTheme].primary
                : (preferences.cardColor || '#f0f4ff'),
            background: preferences.useCustomCardColor 
              ? `linear-gradient(135deg, ${preferences.cardColor}ee, ${preferences.cardColor}cc)`
              : (premiumTheme && premiumTheme !== "default" && premiumThemes && premiumThemes[premiumTheme])
                ? `linear-gradient(135deg, ${premiumThemes[premiumTheme].primary}dd, ${premiumThemes[premiumTheme].secondary}aa)`
                : `linear-gradient(135deg, ${preferences.cardColor || '#f0f4ff'}ee, ${preferences.cardColor || '#f0f4ff'}cc)`,
            color: theme === "dark" ? "white" : "#334155",
            "--animation-duration": preferences.animationSpeed === "slow" ? "4s" : preferences.animationSpeed === "fast" ? "1.5s" : "2.5s"
          }}
        >
          <div className="flex flex-row items-center justify-between space-x-3 sm:space-x-4">
            <div className="flex flex-row items-center space-x-3 sm:space-x-4">
              <div className="flex flex-col items-center space-y-1">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white/20 backdrop-blur-sm text-white p-1.5 rounded-full hover:bg-white/30 hover:scale-110 transition-all duration-200 border border-white/30 shadow-lg"
                  >
                    <FaCamera className="w-2.5 h-2.5" />
                  </button>
                  {profilePicture && (
                    <button
                      onClick={handleRemoveProfilePicture}
                      className="bg-red-500/80 backdrop-blur-sm text-white p-1.5 rounded-full hover:bg-red-500 hover:scale-110 transition-all duration-200 border border-red-400/50 shadow-lg"
                    >
                      <FaTrash className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
                <div className="relative w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" style={{ aspectRatio: '1/1' }}>
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover object-center"
                      style={{ 
                        imageRendering: 'high-quality',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center" style={{ aspectRatio: '1/1' }}>
                      <FaUser className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                />
              </div>
              <div className="flex-1 text-left">
                <div className="flex flex-row items-center space-x-2 sm:space-x-3">
                  {isEditing ? (
                    <div className="flex flex-row items-center space-x-2 sm:space-x-3">
                      <input
                        type="text"
                        value={editedUsername}
                        onChange={(e) => setEditedUsername(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && editedUsername.trim() && !isSaving) {
                            handleUpdateProfile({ username: editedUsername });
                          } else if (e.key === 'Escape') {
                            setIsEditing(false);
                            setEditedUsername(user.username);
                          }
                        }}
                        className="text-lg sm:text-xl md:text-3xl font-bold bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-white/50 flex-1 px-2 py-1 rounded border border-white/30 placeholder-white/70"
                        placeholder="Enter username"
                        autoFocus
                      />
                      <button
                        onClick={() => handleUpdateProfile({ username: editedUsername })}
                        disabled={isSaving || !editedUsername.trim()}
                        className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/20 transition-all duration-200"
                        title="Save changes"
                      >
                        {isSaving ? (
                          <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                        ) : (
                          <FaSave className="w-4 h-4 sm:w-5 sm:h-5" />
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
                        className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/20 transition-all duration-200"
                        title="Cancel editing"
                      >
                        <FaTimes className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-lg sm:text-xl md:text-3xl font-bold flex items-center justify-start text-white drop-shadow-sm">
                        {user?.username}
                      </h1>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/20 transition-all duration-200 self-center sm:self-auto"
                      >
                        <FaEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </>
                  )}
                </div>
                <p className="text-white/90 text-sm sm:text-base mt-2 italic font-medium">
                  {getGreeting()}
                </p>
                <p className="text-white/70 text-xs sm:text-sm mt-1 font-medium">
                  Member since {formatJoinDate(user?.created_at)} {getMembershipDuration(user?.created_at)}
                </p>
              </div>
            </div>
            <div className="relative flex flex-col items-center sm:items-end space-y-2 mt-4 sm:mt-0">
              {/* Theme info and color picker */}
              {premiumTheme && premiumTheme !== "default" ? (
                <div className="flex flex-col items-center sm:items-end space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm font-medium">
                      {premiumThemes && premiumThemes[premiumTheme] 
                        ? `Using ${premiumThemes[premiumTheme].name} Theme` 
                        : "Using Theme"}
                    </span>
                    <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full" style={{ 
                      backgroundColor: premiumThemes && premiumThemes[premiumTheme] 
                        ? premiumThemes[premiumTheme].primary 
                        : (preferences.cardColor || '#f0f4ff')
                    }}></div>
                    {isAdmin && premiumThemes && premiumThemes[premiumTheme] && premiumThemes[premiumTheme].isPremium && (
                      <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="text-xs sm:text-sm bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full hover:bg-white/30 hover:scale-105 transition-all duration-200 border border-white/30 shadow-lg font-medium"
                    >
                      {showColorPicker ? "Hide Colors" : "Customize Colors"}
                    </button>
                  </div>
                  
                  {showColorPicker && (
                    <div className="absolute top-full right-0 mt-2 p-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 w-64 max-w-[calc(100vw-2rem)] z-10">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Card Color</span>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={preferences.useCustomCardColor}
                              onChange={(e) => toggleCustomColorMode(e.target.checked)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-xs text-gray-600">Custom</span>
                          </label>
                        </div>
                        
                        {preferences.useCustomCardColor && (
                          <div className="space-y-2">
                            <div className="flex flex-col space-y-2">
                              <span className="text-xs text-gray-600">Choose Color:</span>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="color"
                                  value={preferences.cardColor || "#f0f4ff"}
                                  onChange={(e) => {
                                    handleColorChange(e.target.value);
                                    // Ensure custom color mode is enabled when user picks a color
                                    setPreferences(prev => ({
                                      ...prev,
                                      useCustomCardColor: true,
                                      cardColor: e.target.value
                                    }));
                                    setPreferencesChanged(true);
                                  }}
                                  className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-200 hover:border-gray-300 transition-colors flex-shrink-0"
                                />
                                <span className="text-xs text-gray-500 font-mono truncate">{preferences.cardColor || "#f0f4ff"}</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {preferencesChanged && (
                          <div className="pt-2 border-t border-gray-200">
                            <button
                              onClick={handlePreferenceUpdate}
                              disabled={isSaving}
                              className="w-full bg-blue-600 text-white text-sm py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                              {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="text-xs sm:text-sm bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full hover:bg-white/30 hover:scale-105 transition-all duration-200 border border-white/30 shadow-lg font-medium"
                  >
                    {showColorPicker ? "Hide Colors" : "Customize Colors"}
                  </button>
                  
                  {showColorPicker && (
                    <div className="absolute top-full right-0 mt-2 p-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 w-64 max-w-[calc(100vw-2rem)] z-10">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Card Color</span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex flex-col space-y-2">
                            <span className="text-xs text-gray-600">Choose Color:</span>
                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                value={preferences.cardColor || "#f0f4ff"}
                                onChange={(e) => {
                                  handleColorChange(e.target.value);
                                  // Ensure custom color mode is enabled when user picks a color
                                  setPreferences(prev => ({
                                    ...prev,
                                    useCustomCardColor: true,
                                    cardColor: e.target.value
                                  }));
                                  setPreferencesChanged(true);
                                }}
                                className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-200 hover:border-gray-300 transition-colors flex-shrink-0"
                              />
                              <span className="text-xs text-gray-500 font-mono truncate">{preferences.cardColor || "#f0f4ff"}</span>
                            </div>
                          </div>
                        </div>
                        
                        {preferencesChanged && (
                          <div className="pt-2 border-t border-gray-200">
                            <button
                              onClick={handlePreferenceUpdate}
                              disabled={isSaving}
                              className="w-full bg-blue-600 text-white text-sm py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                              {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Save button appears outside the hidden section when preferences changed */}
              {preferencesChanged && !showColorPicker && (
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={handlePreferenceUpdate}
                    disabled={isSaving}
                    className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary/90 transition-colors"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
              
              {successMessage && (
                <div className="text-sm text-accent bg-accent/10 px-2 py-1 rounded">
                  {successMessage}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Access Grid - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          {quickAccessLinks.map((link, index) => (
            <button
              key={index}
              onClick={() => navigate(link.path)}
              className="bg-card rounded-2xl shadow-md p-2 sm:p-4 md:p-6 hover:shadow-lg transition-shadow duration-200 flex items-center space-x-2 sm:space-x-3 md:space-x-4"
            >
              <div className="text-primary text-lg sm:text-xl">{link.icon}</div>
              <span className="text-base sm:text-lg font-medium text-foreground">
                {link.label}
              </span>
            </button>
          ))}
        </div>

        {/* Stats and Preferences - Mobile Optimized */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {/* Personal Information */}
          <div className="bg-card rounded-2xl shadow p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 md:mb-6">
            <div className="flex justify-between items-center mb-2 sm:mb-3 md:mb-4">
              <h2 className="text-lg sm:text-xl font-bold">Personal Information</h2>
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
                  className="text-accent hover:text-accent/80 p-1"
                >
                  <FaEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePersonalInfoUpdate(personalInfo)}
                    className="text-accent hover:text-accent/80 p-1"
                    title="Save changes"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <FaSave className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingPersonalInfo(false);
                      setPersonalInfoError("");
                    }}
                    className="text-muted-foreground hover:text-muted-foreground/80 p-1"
                    title="Cancel"
                  >
                    <FaTimes className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              )}
            </div>

            {personalInfoError && (
              <div className="bg-red-500 text-white p-3 rounded mb-4">{personalInfoError}</div>
            )}

            {isEditingPersonalInfo ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={personalInfo.height}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, height: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${
                      theme === "dark"
                        ? "bg-gray-700 text-white border-gray-600"
                        : "bg-muted text-foreground border-border"
                    } border`}
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={personalInfo.weight}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, weight: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${
                      theme === "dark"
                        ? "bg-gray-700 text-white border-gray-600"
                        : "bg-muted text-foreground border-border"
                    } border`}
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={personalInfo.age}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, age: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${
                      theme === "dark"
                        ? "bg-gray-700 text-white border-gray-600"
                        : "bg-muted text-foreground border-border"
                    } border`}
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">Gender</label>
                  <select
                    name="gender"
                    value={personalInfo.gender}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, gender: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg text-sm ${
                      theme === "dark"
                        ? "bg-gray-700 text-white border-gray-600"
                        : "bg-muted text-foreground border-border"
                    } border`}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium mb-1">Fitness Goals</label>
                  <textarea
                    name="fitnessGoals"
                    value={personalInfo.fitnessGoals}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, fitnessGoals: e.target.value }))}
                    rows="3"
                    className={`w-full px-3 py-2 rounded-lg text-sm ${
                      theme === "dark"
                        ? "bg-gray-700 text-white border-gray-600"
                        : "bg-muted text-foreground border-border"
                    } border`}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium mb-1">Bio</label>
                  <textarea
                    name="bio"
                    value={personalInfo.bio}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, bio: e.target.value }))}
                    rows="3"
                    className={`w-full px-3 py-2 rounded-lg text-sm ${
                      theme === "dark"
                        ? "bg-gray-700 text-white border-gray-600"
                        : "bg-muted text-foreground border-border"
                    } border`}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Height</p>
                  <p className="font-medium text-sm sm:text-base">{user?.height ? `${user.height} cm` : "Not set"}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Weight</p>
                  <p className="font-medium text-sm sm:text-base">{user?.weight ? `${user.weight} kg` : "Not set"}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Age</p>
                  <p className="font-medium text-sm sm:text-base">{user?.age || "Not set"}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Gender</p>
                  <p className="font-medium text-sm sm:text-base">{user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : "Not set"}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs sm:text-sm text-gray-500">Fitness Goals</p>
                  <p className="font-medium text-sm sm:text-base">{user?.fitness_goals || "Not set"}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs sm:text-sm text-gray-500">Bio</p>
                  <p className="font-medium text-sm sm:text-base">{user?.bio || "Not set"}</p>
                </div>
              </div>
            )}
          </div>

          {/* Workout Stats - Mobile Optimized */}
          <div className="bg-card rounded-2xl shadow-lg p-3 sm:p-4 md:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Workout Statistics
            </h2>
            {workoutStats && (
              <div className="space-y-3">
                {/* Weight Goal */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-2">
                      <FaWeightHanging className="text-purple-500 w-4 h-4 sm:w-5 sm:h-5" />
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Weight Goal</p>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
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
                            className="text-purple-500 hover:text-purple-600 p-1"
                          >
                            <FaEdit className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {preferences.goalWeight && workoutStats.currentWeight && (
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        Current: {workoutStats.currentWeight} kg
                      </span>
                    )}
                  </div>
                  {preferencesChanged && (
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={handlePreferenceUpdate}
                        disabled={isSaving}
                        className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary/90 transition-colors"
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
                              className="w-full mt-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black dark:bg-gray-700 dark:text-white"
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
                                className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary/90 transition-colors"
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

        {/* Achievements Section - Temporarily disabled to fix circular dependency */}
        {/* <div className="mt-8" id="achievements">
          <ErrorBoundary>
            <AchievementsSection 
              backendURL={backendURL} 
              key={`achievements-${user?.id}-${lastUpdated}`} 
            />
          </ErrorBoundary>
        </div> */}

        {/* Account Actions */}
        <div className="mt-4 sm:mt-6 md:mt-8 bg-card rounded-2xl shadow-lg p-3 sm:p-4 md:p-6">
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
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
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
