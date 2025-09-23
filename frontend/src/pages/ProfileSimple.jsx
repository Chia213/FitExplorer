import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import {
  FaEdit,
  FaSave,
  FaTimes,
  FaCamera,
  FaUser,
  FaSignOutAlt,
  FaTrash,
  FaDumbbell,
  FaChartLine,
  FaHistory,
  FaTrophy,
  FaCog,
  FaWeightHanging,
  FaFire,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

const backendURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function ProfileSimple() {
  console.log("🔍 ProfileSimple: Component starting to render");
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [workoutStats, setWorkoutStats] = useState(null);
  const [lastSavedRoutine, setLastSavedRoutine] = useState(null);
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    height: "",
    weight: "",
    age: "",
    gender: "",
    fitnessGoals: "",
    bio: ""
  });
  const [preferences, setPreferences] = useState({
    goalWeight: null,
    workoutFrequencyGoal: null,
  });
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [achievementsLoading, setAchievementsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const fileInputRef = useRef(null);

  const navigate = useNavigate();
  const { theme } = useTheme();

  // Helper functions for fetching additional data
  const fetchWorkoutStats = async (token) => {
    try {
      const response = await fetch(`${backendURL}/workout-stats`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      if (response.ok) {
        const statsData = await response.json();
        
        // Fetch workout streak
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
        }
        
        setWorkoutStats({
          totalWorkouts: statsData.total_workouts || 0,
          favoriteExercise: statsData.favorite_exercise || null,
          lastWorkout: statsData.last_workout || null,
          totalCardioDuration: statsData.total_cardio_duration || 0,
          weightProgression: statsData.weight_progression || [],
          currentWeight: statsData.current_weight || null,
          currentStreak: currentStreak,
        });
      }
    } catch (err) {
      console.warn("Failed to fetch workout stats:", err);
    }
  };

  const fetchLastSavedRoutine = async (token) => {
    try {
      const response = await fetch(`${backendURL}/api/last-saved-routine`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      if (response.ok) {
        const routineData = await response.json();
        if (routineData && typeof routineData === 'object' && 
            routineData.name && Array.isArray(routineData.exercises)) {
          setLastSavedRoutine(routineData);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch last saved routine:", err);
    }
  };

  const fetchWorkoutPreferences = async (token) => {
    try {
      const response = await fetch(`${backendURL}/api/workout-preferences`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      if (response.ok) {
        const workoutPrefs = await response.json();
        setPreferences(prev => ({
          ...prev,
          workoutFrequencyGoal: workoutPrefs.workout_frequency_goal,
          goalWeight: workoutPrefs.goal_weight,
        }));
      }
    } catch (err) {
      console.warn("Failed to fetch workout preferences:", err);
    }
  };

  const fetchAchievements = async (token) => {
    try {
      setAchievementsLoading(true);
      
      // First try to load cached data
      const cached = localStorage.getItem('cachedAchievements');
      if (cached) {
        const parsedData = JSON.parse(cached);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          setAchievements(parsedData);
        }
      }

      const response = await fetch(`${backendURL}/user/achievements/progress`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      if (response.ok) {
        const achievementsData = await response.json();
        if (achievementsData && Array.isArray(achievementsData)) {
          setAchievements(achievementsData);
          // Cache the achievements
          localStorage.setItem('cachedAchievements', JSON.stringify(achievementsData));
          localStorage.setItem('achievementsLastUpdated', new Date().toISOString());
        }
      }
    } catch (err) {
      console.warn("Failed to fetch achievements:", err);
    } finally {
      setAchievementsLoading(false);
    }
  };

  // Function to fetch user data
  const fetchUserData = async () => {
    console.log("🔍 ProfileSimple: fetchUserData called");
    
    const token = localStorage.getItem("token");
    console.log("🔍 ProfileSimple: Token found:", !!token);
    
    if (!token) {
      console.log("🔍 ProfileSimple: No token, redirecting to login");
      navigate("/login");
      return;
    }

    try {
      console.log("🔍 ProfileSimple: Starting API call");
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${backendURL}/user-profile`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      console.log("🔍 ProfileSimple: API response status:", response.status);

      if (!response.ok) {
        console.log("🔍 ProfileSimple: API failed with status:", response.status);
        if (response.status === 401) {
          console.log("🔍 ProfileSimple: 401 Unauthorized, clearing token and redirecting");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch profile data");
      }

      const userData = await response.json();
      console.log("🔍 ProfileSimple: User data received:", userData);
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

      // Set profile picture
      if (userData.profile_picture) {
        setProfilePicture(`${backendURL}/${userData.profile_picture}?t=${new Date().getTime()}`);
      } else {
        setProfilePicture(null);
      }

      // Set preferences
      if (userData.preferences) {
        setPreferences({
          goalWeight: userData.preferences.goal_weight,
          workoutFrequencyGoal: userData.preferences.workout_frequency_goal,
        });
      }

      // Fetch additional data in parallel
      await Promise.all([
        fetchWorkoutStats(token),
        fetchLastSavedRoutine(token),
        fetchWorkoutPreferences(token),
        fetchAchievements(token)
      ]);

    } catch (err) {
      console.error("🔍 ProfileSimple: Error in fetchUserData:", err);
      setError(err.message || "Failed to load user data. Please try again.");
    } finally {
      console.log("🔍 ProfileSimple: fetchUserData completed, setting loading to false");
      setLoading(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchUserData();
  }, []);

  const handleUpdateProfile = async (updatedData) => {
    try {
      setIsSaving(true);
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

      // Exit editing mode if we were editing username
      if (updatedData.username) {
        setIsEditing(false);
      }

    } catch (err) {
      setError(err.message);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const checkAchievementsProgress = async () => {
    try {
      const toastId = toast.loading("Checking achievements...");
      
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
            setAchievements(data);
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
        toast.error("Failed to check achievements", {
          id: toastId
        });
      }
    } catch (error) {
      console.error("Error checking achievements:", error);
      toast.error("Error checking achievements");
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
        fitness_goals: updatedData.fitnessGoals,
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
      setLoading(false);
      toast.success('Profile updated successfully!');
      
      // Check achievements after profile update
      try {
        await checkAchievementsProgress();
      } catch (error) {
        // Don't let achievement check failures affect the profile update success
        console.warn("Achievement check failed:", error);
      }
    } catch (error) {
      setLoading(false);
      toast.error('Failed to update profile');
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
        setProfilePicture(`${backendURL}/${result.file_path}?t=${new Date().getTime()}`);
        setError(null);
        toast.success("Profile picture updated successfully!");
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
        toast.success("Profile picture removed successfully!");
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
        alert("A confirmation email has been sent. Please check your inbox to complete account deletion.");
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

  const formatJoinDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  const quickAccessLinks = [
    { icon: <FaDumbbell className="w-6 h-6" />, label: "Start doing your workouts!", path: "/workout-log" },
    { icon: <FaChartLine className="w-6 h-6" />, label: "Progress", path: "/progress-tracker" },
    { icon: <FaHistory className="w-6 h-6" />, label: "History", path: "/workout-history" },
    { icon: <FaTrophy className="w-6 h-6" />, label: "Achievements", path: "/achievements" },
    { icon: <FaCog className="w-6 h-6" />, label: "Settings", path: "/settings" },
  ];

  console.log("🔍 ProfileSimple: About to render, current state:", { loading, error, user: !!user });

  if (loading) {
    console.log("🔍 ProfileSimple: Rendering loading state");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    console.log("🔍 ProfileSimple: Rendering error state:", error);
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto pt-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setError(null);
                setEditedUsername(user?.username || "");
                fetchUserData();
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Retry
            </button>
            <button
              onClick={() => {
                setError(null);
                setEditedUsername(user?.username || "");
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

  console.log("🔍 ProfileSimple: Rendering main profile content");
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="mx-auto max-w-2xl p-6 rounded-2xl text-center mb-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-xl">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/30 shadow-lg">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <FaUser className="w-16 h-16 text-gray-600" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 flex space-x-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 hover:scale-110 transition-all duration-200 border border-white/30 shadow-lg"
                >
                  <FaCamera className="w-4 h-4" />
                </button>
                {profilePicture && (
                  <button
                    onClick={handleRemoveProfilePicture}
                    className="bg-red-500/80 backdrop-blur-sm text-white p-2 rounded-full hover:bg-red-500 hover:scale-110 transition-all duration-200 border border-red-400/50 shadow-lg"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
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
            
            <div className="space-y-2">
              {isEditing ? (
                <div className="flex items-center justify-center space-x-3">
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
                    className="text-2xl font-bold bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-white/50 px-2 py-1 rounded border border-white/30 placeholder-white/70"
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
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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
                    className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/20 transition-all duration-200"
                    title="Cancel editing"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <h1 className="text-2xl font-bold text-white drop-shadow-sm">
                    {user?.username}
                  </h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/20 transition-all duration-200"
                  >
                    <FaEdit className="w-5 h-5" />
                  </button>
                </div>
              )}
              
              <p className="text-white/90 text-base italic font-medium">
                {getGreeting()}
              </p>
              <p className="text-white/70 text-sm font-medium">
                Member since {formatJoinDate(user?.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Access Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {quickAccessLinks.map((link, index) => (
            <button
              key={index}
              onClick={() => navigate(link.path)}
              className="bg-card rounded-2xl shadow-md p-4 hover:shadow-lg transition-shadow duration-200 flex items-center space-x-3"
            >
              <div className="text-primary text-xl">{link.icon}</div>
              <span className="text-lg font-medium text-foreground">
                {link.label}
              </span>
            </button>
          ))}
        </div>

        {/* Personal Information */}
        <div className="bg-card rounded-2xl shadow p-6 mb-6">
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
                }}
                className="text-accent hover:text-accent/80 p-1"
              >
                <FaEdit className="w-5 h-5" />
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
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <FaSave className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsEditingPersonalInfo(false);
                  }}
                  className="text-muted-foreground hover:text-muted-foreground/80 p-1"
                  title="Cancel"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {isEditingPersonalInfo ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Height (cm)</label>
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
                <label className="block text-sm font-medium mb-1">Weight (kg)</label>
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
                <label className="block text-sm font-medium mb-1">Age</label>
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
                <label className="block text-sm font-medium mb-1">Gender</label>
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
                <label className="block text-sm font-medium mb-1">Fitness Goals</label>
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
                <label className="block text-sm font-medium mb-1">Bio</label>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <p className="font-medium">
                  {user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : "Not set"}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-gray-500">Fitness Goals</p>
                <p className="font-medium">{user?.fitness_goals || "Not set"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-gray-500">Bio</p>
                <p className="font-medium">{user?.bio || "Not set"}</p>
              </div>
            </div>
          )}
        </div>

        {/* Workout Statistics */}
        {workoutStats && (
          <div className="bg-card rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Workout Statistics</h2>
            <div className="space-y-4">
              {/* Weight Goal */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaWeightHanging className="text-purple-500 w-5 h-5" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Weight Goal</p>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {preferences.goalWeight || "Not set"} kg
                      </span>
                    </div>
                  </div>
                  {preferences.goalWeight && workoutStats.currentWeight && (
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Current: {workoutStats.currentWeight} kg
                    </span>
                  )}
                </div>
              </div>

              {/* Total Workouts */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaDumbbell className="text-blue-500 w-5 h-5" />
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
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaFire className="text-green-500 w-5 h-5" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Current Streak</p>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {workoutStats.currentStreak > 0 ? 
                          <>Day {workoutStats.currentStreak} 🔥</> : 
                          <>💔 Streak Broken</>
                        }
                      </span>
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
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FaSave className="text-yellow-500 w-5 h-5" />
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
            </div>
          </div>
        )}

        {/* Achievements Section */}
        {achievements && achievements.length > 0 && (
          <div className="bg-card rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Achievements</h2>
              <button
                onClick={() => navigate('/achievements')}
                className="text-primary hover:text-primary/80 flex items-center space-x-1"
              >
                <span className="text-sm">View All</span>
                <FaExternalLinkAlt className="w-3 h-3" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements
                .filter(achievement => achievement.is_achieved)
                .slice(0, 6)
                .map((achievement, index) => (
                  <div
                    key={achievement.id || index}
                    className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <FaTrophy className="w-6 h-6 text-yellow-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {achievement.name}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                          {achievement.description}
                        </p>
                        {achievement.achieved_at && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Earned {new Date(achievement.achieved_at).toLocaleDateString('en-GB')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            
            {achievements.filter(achievement => achievement.is_achieved).length === 0 && (
              <div className="text-center py-8">
                <FaTrophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">No achievements earned yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Complete workouts and reach milestones to earn achievements!
                </p>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-300">
                  Total Achievements: {achievements.filter(a => a.is_achieved).length} / {achievements.length}
                </span>
                <button
                  onClick={checkAchievementsProgress}
                  disabled={achievementsLoading}
                  className="text-primary hover:text-primary/80 disabled:opacity-50"
                >
                  {achievementsLoading ? "Checking..." : "Check Progress"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Account Actions */}
        <div className="bg-card rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Account Actions</h2>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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

export default ProfileSimple;
