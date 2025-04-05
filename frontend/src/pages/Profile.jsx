import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { notifyProfileUpdated, notifyUsernameChanged } from '../utils/notificationsHelpers';
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

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cardColor, setCardColor] = useState(() => {
    return localStorage.getItem("cardColor") || "#f0f4ff";
  });
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
  });
  const [preferencesChanged, setPreferencesChanged] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef(null);

  const navigate = useNavigate();
  const { theme } = useTheme();

  // Save card color to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("cardColor", cardColor);
  }, [cardColor]);

  // Function to fetch user data - extracted for reuse
  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      console.log("Fetching user data...");
      setLoading(true);
      const [profileRes, statsRes, routineRes] = await Promise.all([
        fetch(`${backendURL}/user-profile`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }),
        fetch(`${backendURL}/workout-stats`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }),
        fetch(`${backendURL}/last-saved-routine`, {
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
      console.log("User data received:", userData);
      
      // Check if we have a stored username that should override the server value
      const storedUsername = localStorage.getItem("username");
      if (storedUsername && (!userData.username || userData.username !== storedUsername)) {
        console.log("Using stored username instead of server value:", storedUsername);
        userData.username = storedUsername;
      }
      
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

      // Handle card color setting
      if (userData.preferences?.card_color) {
        setCardColor(userData.preferences.card_color);
        setPreferences((prev) => ({
          ...prev,
          cardColor: userData.preferences.card_color,
        }));
      } else {
        const savedColor = localStorage.getItem("cardColor");
        if (savedColor) {
          setCardColor(savedColor);
          setPreferences((prev) => ({
            ...prev,
            cardColor: savedColor,
          }));
        }
      }

      // Set user preferences
      if (userData.preferences) {
        setPreferences((prev) => ({
          ...prev,
          workoutFrequencyGoal: userData.preferences.workout_frequency_goal,
          goalWeight: userData.preferences.goal_weight,
        }));
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
        setWorkoutStats({
          totalWorkouts: statsData.total_workouts,
          favoriteExercise: statsData.favorite_exercise,
          lastWorkout: statsData.last_workout,
          totalCardioDuration: statsData.total_cardio_duration,
          weightProgression: statsData.weight_progression,
        });
      } else if (statsRes.status !== 404) {
        console.error("Failed to fetch workout stats:", statsRes.status);
      }

      // Handle last saved routine
      if (routineRes.ok) {
        const routineData = await routineRes.json();
        if (routineData.message !== "No saved routines found") {
          setLastSavedRoutine(routineData);
        }
      } else if (routineRes.status !== 404) {
        console.error("Failed to fetch last saved routine:", routineRes.status);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err.message || "Failed to load user data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Initial data loading
  useEffect(() => {
    console.log("Profile component mounted");
    fetchUserData();
    
    // Add listener for before page unload/refresh
    const handleBeforeUnload = () => {
      console.log("Page about to refresh/unload. Current username state:", user?.username);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      console.log("Profile component unmounting");
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [fetchUserData]);

  const handleColorChange = (newColor) => {
    setCardColor(newColor);
    setPreferences((prev) => ({
      ...prev,
      cardColor: newColor,
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

  const handleUpdateProfile = async () => {
    if (!editedUsername.trim() || editedUsername.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    try {
      console.log("Updating username to:", editedUsername);
      setIsSaving(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendURL}/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: editedUsername }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        console.log("Server response after update:", updatedUser);
        
        // Use the edited username directly since server doesn't return it
        setUser((prevUser) => {
          const newUserState = {
            ...prevUser,
            username: editedUsername // Use the edited username directly
          };
          console.log("Updated user state:", newUserState);
          return newUserState;
        });

        // Update the token in local storage
        if (updatedUser.access_token) {
          console.log("New access token received, updating localStorage");
          localStorage.setItem("token", updatedUser.access_token);
        } else {
          console.log("No new access token received from server");
        }

        setIsEditing(false);
        setError(null);
        await notifyUsernameChanged(editedUsername); // Use edited username here too
        
        // Store username in localStorage as a backup
        localStorage.setItem("username", editedUsername);
        
        // Fetch updated user data to ensure it's properly synced
        console.log("Re-fetching user data after username update");
        await fetchUserData();
        
        // Verify immediately with a direct fetch to check if change was persisted on server
        console.log("Verifying username update with direct fetch...");
        const verifyToken = localStorage.getItem("token");
        const verifyResponse = await fetch(`${backendURL}/user-profile`, {
          headers: { 
            "Authorization": `Bearer ${verifyToken}`,
            "Content-Type": "application/json"
          },
        });
        
        if (verifyResponse.ok) {
          const verifiedUserData = await verifyResponse.json();
          console.log("Verification fetch result:", verifiedUserData);
          console.log("Verified username on server:", verifiedUserData.username);
          console.log("Does it match what we set?", verifiedUserData.username === editedUsername);
          
          // If username on server doesn't match what we set, force an update
          if (verifiedUserData.username !== editedUsername) {
            console.log("Username mismatch detected, forcing update in state");
            setUser(prev => ({...prev, username: editedUsername}));
          }
        } else {
          console.error("Failed to verify username update");
        }
      } else {
        const errorData = await response.json();
        console.error("Error response from server:", errorData);
        setError(errorData.detail || "Failed to update profile");
      }
    } catch (err) {
      console.error("Exception during username update:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
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
        await notifyProfileUpdated();
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
        await notifyProfileUpdated();
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
    setPreferences(newPrefs);
    setPreferencesChanged(true);
  };

  const handlePreferenceUpdate = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendURL}/user-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          card_color: preferences.cardColor,
          workout_frequency_goal: preferences.workoutFrequencyGoal,
          goal_weight: preferences.goalWeight,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to update preferences");
      } else {
        const updatedPreferences = await response.json();
        setPreferences({
          cardColor: updatedPreferences.preferences.card_color,
          workoutFrequencyGoal: updatedPreferences.preferences.workout_frequency_goal,
          goalWeight: updatedPreferences.preferences.goal_weight,
        });
        setCardColor(updatedPreferences.preferences.card_color);
        setPreferencesChanged(false);
        setError(null);
        await notifyProfileUpdated("Preferences updated successfully!");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInitiateAccountDeletion = async () => {
    setShowDeleteConfirmation(false);
    try {
      setIsSaving(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendURL}/request-account-deletion`, {
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    navigate("/login");
  };

  const handlePersonalInfoUpdate = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem("token");

      // Update user profile using the correct endpoint
      const response = await fetch(`${backendURL}/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          height: parseFloat(personalInfo.height) || null,
          weight: parseFloat(personalInfo.weight) || null,
          age: parseInt(personalInfo.age) || null,
          gender: personalInfo.gender,
          fitness_goals: personalInfo.fitnessGoals,
          bio: personalInfo.bio
        }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        
        // Update the local state with the response data
        setUser(prevUser => ({
          ...prevUser,
          height: updatedData.height,
          weight: updatedData.weight,
          age: updatedData.age,
          gender: updatedData.gender,
          fitness_goals: updatedData.fitness_goals,
          bio: updatedData.bio
        }));

        // Update personal info state to match the response
        setPersonalInfo({
          height: updatedData.height?.toString() || "",
          weight: updatedData.weight?.toString() || "",
          age: updatedData.age?.toString() || "",
          gender: updatedData.gender || "",
          fitnessGoals: updatedData.fitness_goals || "",
          bio: updatedData.bio || ""
        });

        setIsEditingPersonalInfo(false);
        setPersonalInfoError("");
        setSuccessMessage("Personal information updated successfully");
      } else if (response.status === 401) {
        setPersonalInfoError("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        const data = await response.json();
        const errorMessage = data.detail || "Failed to update personal information";
        setPersonalInfoError(errorMessage);
      }
    } catch (err) {
      setPersonalInfoError("Failed to update personal information. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const quickAccessLinks = [
    { icon: <FaDumbbell className="w-6 h-6" />, label: "Start doing your workouts!", path: "/workout-log" },
    { icon: <FaChartLine className="w-6 h-6" />, label: "Progress", path: "/progress-tracker" },
    { icon: <FaHistory className="w-6 h-6" />, label: "History", path: "/workout-history" },
    { icon: <FaTrophy className="w-6 h-6" />, label: "Achievements", path: "/achievements" },
    { icon: <FaCog className="w-6 h-6" />, label: "Settings", path: "/settings" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl mb-4">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"} ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8" style={{ backgroundColor: preferences.cardColor }}>
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
                          onClick={handleUpdateProfile}
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
                            setError(null);
                          }}
                          className="text-red-500 hover:text-red-600"
                        >
                          <FaTimes className="w-5 h-5" />
                        </button>
                      </div>
                      {error && (
                        <div className="text-red-500 text-sm mt-1">{error}</div>
                      )}
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
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Card Color</span>
                <input
                  type="color"
                  value={preferences.cardColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                />
              </div>
              {preferencesChanged && (
                <button
                  onClick={handlePreferenceUpdate}
                  className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                >
                  Save
                </button>
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
                    onClick={handlePersonalInfoUpdate}
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
                          {workoutStats.currentStreak || 0} {workoutStats.frequencyGoal ? 'weeks' : 'days'}
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
                      {workoutStats.lastWorkout ? new Date(workoutStats.lastWorkout).toLocaleDateString() : "Never"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Total Duration</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.floor(workoutStats.totalCardioDuration / 60)} hours
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Favorite Exercise</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {workoutStats.favoriteExercise || "None"}
                    </span>
                  </div>
                </div>

                {/* Last Saved Routine */}
                {lastSavedRoutine && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FaSave className="text-yellow-500" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Last Saved Routine</p>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {lastSavedRoutine.name}
                            </span>
                            <button
                              onClick={() => navigate(`/routines`)}
                              className="text-yellow-500 hover:text-yellow-600"
                            >
                              <FaExternalLinkAlt className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(lastSavedRoutine.created_at).toLocaleDateString()}
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
                      {workoutStats.weightProgression.map((entry, index) => (
                        <div
                          key={index}
                          className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                          style={{
                            height: `${(entry.weight / Math.max(...workoutStats.weightProgression.map(e => e.weight))) * 100}%`,
                          }}
                          title={`${entry.weight}kg on ${new Date(entry.date).toLocaleDateString()}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Achievements Section */}
        <div className="mt-8" id="achievements">
          <AchievementsSection backendURL={backendURL} />
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