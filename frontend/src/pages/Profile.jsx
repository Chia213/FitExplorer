import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { notifyProfileUpdated, notifyUsernameChanged } from '../utils/notificationsHelpers';
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
} from "react-icons/fa";

const backendURL = "http://localhost:8000";

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
  const [profilePicture, setProfilePicture] = useState(null);
  const [preferences, setPreferences] = useState({
    goalWeight: null,
    emailNotifications: false,
    summaryFrequency: null,
    cardColor: "#dbeafe",
  });
  const [preferencesChanged, setPreferencesChanged] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
      setLoading(true);
      const [profileRes, statsRes] = await Promise.all([
        fetch(`${backendURL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${backendURL}/workout-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!profileRes.ok) throw new Error("Unauthorized");
      const userData = await profileRes.json();

      setUser(userData);
      setEditedUsername(userData.username);

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
          goalWeight: userData.preferences.goal_weight,
          emailNotifications: userData.preferences.email_notifications || false,
          summaryFrequency: userData.preferences.summary_frequency,
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
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Session expired. Please log in again.");
      localStorage.removeItem("token");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Initial data loading
  useEffect(() => {
    fetchUserData();
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
    return date.toLocaleDateString("en-US", {
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
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const handleUpdateProfile = async () => {
    if (!editedUsername.trim() || editedUsername.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    try {
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
        setUser((prevUser) => ({
          ...prevUser,
          username: updatedUser.username,
        }));

        // Update the token in local storage
        if (updatedUser.access_token) {
          localStorage.setItem("token", updatedUser.access_token);
        }

        setIsEditing(false);
        setError(null);
        await notifyUsernameChanged(updatedUser.username);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to update profile");
      }
    } catch (err) {
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
      const response = await fetch(`${backendURL}/update-preferences`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          goal_weight: preferences.goalWeight,
          email_notifications: preferences.emailNotifications,
          summary_frequency: preferences.emailNotifications
            ? preferences.summaryFrequency
            : null,
          card_color: preferences.cardColor,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to update preferences");
      } else {
        // Update the local state with the server response
        const updatedPreferences = await response.json();
        setPreferences({
          goalWeight: updatedPreferences.goal_weight,
          emailNotifications: updatedPreferences.email_notifications || false,
          summaryFrequency: updatedPreferences.summary_frequency,
          cardColor: updatedPreferences.card_color,
        });

        // Update the cardColor state to ensure UI consistency
        setCardColor(updatedPreferences.card_color);

        setPreferencesChanged(false);
        setError(null);
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

  const quickAccessLinks = [
    { icon: <FaDumbbell className="w-6 h-6" />, label: "Workouts", path: "/workout-log" },
    { icon: <FaChartLine className="w-6 h-6" />, label: "Progress", path: "/progress-tracker" },
    { icon: <FaHistory className="w-6 h-6" />, label: "History", path: "/workout-history" },
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
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
                      <FaSave className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedUsername(user.username);
                      }}
                      className="text-red-500 hover:text-red-600"
                    >
                      <FaTimes className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {user.username}
                    </h1>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Member since {formatJoinDate(user.created_at)} {getMembershipDuration(user.created_at)}
              </p>
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
          {/* Workout Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Workout Statistics
            </h2>
            {workoutStats && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Total Workouts</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {workoutStats.totalWorkouts}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Favorite Exercise</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {workoutStats.favoriteExercise || "None"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Last Workout</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {workoutStats.lastWorkout ? new Date(workoutStats.lastWorkout).toLocaleDateString() : "Never"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Preferences */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Preferences
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Card Color</span>
                <input
                  type="color"
                  value={preferences.cardColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Email Notifications</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.emailNotifications}
                    onChange={(e) =>
                      handlePreferenceChange({
                        ...preferences,
                        emailNotifications: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              {preferencesChanged && (
                <button
                  onClick={handlePreferenceUpdate}
                  className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Save Preferences
                </button>
              )}
            </div>
          </div>
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