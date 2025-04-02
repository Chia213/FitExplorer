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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen p-4 md:p-6 ${
        theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-4 w-full max-w-md flex items-center justify-between">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="ml-2 text-white">
            <FaTimes />
          </button>
        </div>
      )}

      {user && (
        <div
          className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-full max-w-md ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          {/* Greeting Card */}
          <div
            className="p-6 rounded-xl shadow-md text-center mb-6 transition-colors duration-300"
            style={{ backgroundColor: cardColor }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {getGreeting()}, {user.username}!
            </h2>
          </div>

          {/* Card Color Selection */}
          <div className="mb-6 text-center">
            <label className="block text-gray-700 dark:text-gray-300 font-medium">
              Card Color
            </label>
            <div className="flex justify-center mt-2 space-x-2">
              {["#dbeafe", "#dcfce7", "#ffedd5", "#f3e8ff", "#fee2e2"].map(
                (color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${
                      cardColor === color
                        ? "border-gray-800 dark:border-white"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                    aria-label={`Set card color to ${color}`}
                  />
                )
              )}
              <input
                type="color"
                value={cardColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-8 h-8 rounded-full border border-gray-300 cursor-pointer"
                aria-label="Select custom color"
              />
            </div>
          </div>

          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div
                className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 
                           flex items-center justify-center overflow-hidden border-2 border-gray-300 dark:border-gray-600"
              >
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser className="text-5xl text-gray-500 dark:text-gray-400" />
                )}
              </div>

              <div className="absolute bottom-0 right-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleProfilePictureChange}
                  accept="image/jpeg,image/png,image/gif"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
                  title="Upload Profile Picture"
                  disabled={isSaving}
                >
                  <FaCamera />
                </button>
                {profilePicture && (
                  <button
                    onClick={handleRemoveProfilePicture}
                    className="bg-red-500 text-white p-2 rounded-full shadow-lg ml-2 hover:bg-red-600 transition-colors"
                    title="Remove Profile Picture"
                    disabled={isSaving}
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl md:text-3xl font-bold">Profile</h1>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-500 hover:text-blue-600 flex items-center"
                  disabled={isSaving}
                >
                  <FaEdit className="mr-2" /> Edit Username
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleUpdateProfile}
                    className="text-green-500 hover:text-green-600 flex items-center"
                    disabled={isSaving}
                  >
                    <FaSave className="mr-2" /> Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedUsername(user.username);
                    }}
                    className="text-red-500 hover:text-red-600 flex items-center"
                    disabled={isSaving}
                  >
                    <FaTimes className="mr-2" /> Cancel
                  </button>
                </div>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="flex items-center">
                  <FaUser className="mr-3 text-blue-500" />
                  <span className="font-semibold">Username:</span>{" "}
                  <span className="ml-2">{user.username}</span>
                </p>
                <p className="flex items-center">
                  <FaEnvelope className="mr-3 text-blue-500" />
                  <span className="font-semibold">Email:</span>{" "}
                  <span className="ml-2">{user.email}</span>
                </p>
                <p className="flex items-center">
                  <FaCalendarAlt className="mr-3 text-blue-500" />
                  <span className="font-semibold">Member since:</span>{" "}
                  <span className="ml-2">
                    {formatJoinDate(user.created_at)}{" "}
                    <span className="text-sm text-gray-500">
                      {getMembershipDuration(user.created_at)}
                    </span>
                  </span>
                </p>
              </div>
            ) : (
              <div className="space-y-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={editedUsername}
                    onChange={(e) => setEditedUsername(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    minLength={3}
                    maxLength={50}
                    disabled={isSaving}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Username must be between 3 and 50 characters
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 bg-gray-200 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Workout Statistics */}
          {workoutStats && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg w-full shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <FaDumbbell className="mr-2 text-blue-500" />
                  Workout Statistics
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                  <p className="font-medium text-sm text-gray-500 dark:text-gray-400">
                    Total Workouts
                  </p>
                  <p className="text-xl font-bold">
                    {workoutStats.totalWorkouts || 0}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                  <p className="font-medium text-sm text-gray-500 dark:text-gray-400">
                    Favorite Exercise
                  </p>
                  <p
                    className="text-xl font-bold truncate"
                    title={workoutStats.favoriteExercise || "N/A"}
                  >
                    {workoutStats.favoriteExercise || "N/A"}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                  <p className="font-medium text-sm text-gray-500 dark:text-gray-400">
                    Last Workout
                  </p>
                  <p className="text-xl font-bold">
                    {workoutStats.lastWorkout
                      ? new Date(workoutStats.lastWorkout).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">
                  <p className="font-medium text-sm text-gray-500 dark:text-gray-400">
                    Cardio Duration
                  </p>
                  <p className="text-xl font-bold">
                    {workoutStats.totalCardioDuration
                      ? `${workoutStats.totalCardioDuration} min`
                      : "0 min"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Preferences */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaWeightHanging className="mr-2 text-blue-500" />
              Preferences
            </h2>
            <div className="space-y-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              {/* Goal Weight Input */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Goal Weight (kg)
                </label>
                <input
                  type="number"
                  value={preferences.goalWeight || ""}
                  onChange={(e) =>
                    handlePreferenceChange({
                      ...preferences,
                      goalWeight: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={1}
                  placeholder="Enter your goal weight"
                  disabled={isSaving}
                />
              </div>

              {/* Email Notifications */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.emailNotifications}
                    onChange={(e) =>
                      handlePreferenceChange({
                        ...preferences,
                        emailNotifications: e.target.checked,
                        summaryFrequency: e.target.checked
                          ? preferences.summaryFrequency
                          : null,
                      })
                    }
                    className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={isSaving}
                  />
                  <span className="text-sm font-medium">
                    Email Notifications
                  </span>
                </label>
              </div>

              {/* Summary Frequency Selection */}
              {preferences.emailNotifications && (
                <div className="mt-4 pl-6 border-l-2 border-blue-300 dark:border-blue-700">
                  {!ALLOWED_EMAIL_DOMAINS.has(user.email.split("@")[1]) ? (
                    <p className="text-red-500 text-sm">
                      ⚠️ To enable email notifications, please use a valid email
                      provider (Gmail, Yahoo, Outlook, etc.).
                    </p>
                  ) : (
                    <>
                      <label className="block text-sm font-medium mb-1">
                        Workout Summary Frequency
                      </label>
                      <select
                        value={preferences.summaryFrequency || ""}
                        onChange={(e) =>
                          handlePreferenceChange({
                            ...preferences,
                            summaryFrequency: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSaving}
                      >
                        <option value="">Select Frequency</option>
                        <option value="weekly">Weekly Summary</option>
                        <option value="monthly">Monthly Summary</option>
                      </select>
                      {!preferences.summaryFrequency && (
                        <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                          Please select a frequency to receive email summaries
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Save Preferences Button */}
              <button
                onClick={handlePreferenceUpdate}
                disabled={!preferencesChanged || isSaving}
                className={`w-full py-2 rounded-lg flex items-center justify-center ${
                  preferencesChanged && !isSaving
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-gray-400 text-gray-700 cursor-not-allowed"
                }`}
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" /> Save Preferences
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Account Actions */}
          <div className="space-y-4">
            <button
              onClick={() => navigate("/change-password")}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition flex items-center justify-center"
              disabled={isSaving}
            >
              <FaLock className="mr-2" /> Change Password
            </button>

            <button
              onClick={() => setShowDeleteConfirmation(true)}
              className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center"
              disabled={isSaving}
            >
              <FaTrash className="mr-2" /> Delete Account
            </button>

            <button
              onClick={handleLogout}
              className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition flex items-center justify-center"
              disabled={isSaving}
            >
              <FaSignOutAlt className="mr-2" /> Logout
            </button>
          </div>

          {/* Account Deletion Confirmation Modal */}
          {showDeleteConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
                <h2 className="text-xl font-bold mb-4 text-red-500 flex items-center">
                  <FaTrash className="mr-2" /> Delete Account
                </h2>
                <p className="mb-4">
                  Are you sure you want to delete your account? This action
                  cannot be undone.
                </p>
                <p className="mb-4 text-sm bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 p-3 rounded">
                  We'll send you an email with a confirmation link to complete
                  the deletion. This link will expire in 1 hour.
                </p>
                <div className="flex justify-between">
                  <button
                    onClick={() => setShowDeleteConfirmation(false)}
                    className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white py-2 px-4 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInitiateAccountDeletion}
                    className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors flex items-center"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaEnvelope className="mr-2" /> Send Confirmation Email
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Profile;
