import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [workoutStats, setWorkoutStats] = useState(null);
  const [editedUser, setEditedUser] = useState({
    username: "",
    email: "",
  });
  const [preferences, setPreferences] = useState({
    weightUnit: "kg",
    goalWeight: null,
    emailNotifications: false,
  });
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch user profile
    fetch("http://localhost:8000/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setEditedUser({
          username: data.username,
          email: data.email,
        });
        setLoading(false);

        // Fetch workout statistics
        return fetch("http://localhost:8000/workout-stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      })
      .then((statsRes) => {
        if (statsRes.ok) {
          return statsRes.json();
        }
        return null;
      })
      .then((statsData) => {
        setWorkoutStats(statsData);
      })
      .catch((err) => {
        console.error("Profile fetch error:", err);
        setError("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editedUser),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to update profile");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  const handleAccountDeletion = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/delete-account", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        localStorage.removeItem("token");
        navigate("/signup");
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to delete account");
      }
    } catch (err) {
      console.error("Account deletion error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  const handlePreferenceUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/update-preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to update preferences");
      }
    } catch (err) {
      console.error("Preferences update error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Loading...
      </div>
    );

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen p-6 ${
        theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-4">{error}</div>
      )}

      {user && (
        <div
          className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-full max-w-md ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          {/* Profile Information Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold">Profile</h1>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-500 hover:text-blue-600 flex items-center"
                >
                  <FaEdit className="mr-2" /> Edit
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleUpdateProfile}
                    className="text-green-500 hover:text-green-600 flex items-center"
                  >
                    <FaSave className="mr-2" /> Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedUser({
                        username: user.username,
                        email: user.email,
                      });
                    }}
                    className="text-red-500 hover:text-red-600 flex items-center"
                  >
                    <FaTimes className="mr-2" /> Cancel
                  </button>
                </div>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Username:</span>{" "}
                  {user.username}
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  {user.email || "N/A"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={editedUser.username}
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, username: e.target.value })
                    }
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editedUser.email}
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, email: e.target.value })
                    }
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Workout Statistics Section */}
          {workoutStats && (
            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Workout Statistics</h2>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="font-medium">Total Workouts</p>
                  <p>{workoutStats.totalWorkouts || 0}</p>
                </div>
                <div>
                  <p className="font-medium">Total Volume</p>
                  <p>{workoutStats.totalVolume || 0} kg</p>
                </div>
                <div>
                  <p className="font-medium">Favorite Exercise</p>
                  <p>{workoutStats.favoriteExercise || "N/A"}</p>
                </div>
                <div>
                  <p className="font-medium">Last Workout</p>
                  <p>
                    {workoutStats.lastWorkout
                      ? new Date(workoutStats.lastWorkout).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* User Preferences Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.emailNotifications}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        emailNotifications: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  Email Notifications
                </label>
              </div>
              <div>
                <label className="block mb-1">Weight Unit</label>
                <select
                  value={preferences.weightUnit}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      weightUnit: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="lbs">Pounds (lbs)</option>
                </select>
              </div>
              <button
                onClick={handlePreferenceUpdate}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                Save Preferences
              </button>
            </div>
          </div>

          {/* Account Actions */}
          <div className="space-y-4">
            <button
              onClick={() => navigate("/change-password")}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Change Password
            </button>

            <button
              onClick={() => setShowDeleteConfirmation(true)}
              className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
            >
              Delete Account
            </button>

            <button
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
              className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
            >
              Logout
            </button>
          </div>

          {/* Account Deletion Confirmation Modal */}
          {showDeleteConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
                <h2 className="text-xl font-bold mb-4 text-red-500">
                  Delete Account
                </h2>
                <p className="mb-4">
                  Are you sure you want to delete your account? This action
                  cannot be undone.
                </p>
                <div className="flex justify-between">
                  <button
                    onClick={() => setShowDeleteConfirmation(false)}
                    className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAccountDeletion}
                    className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                  >
                    Confirm Delete
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
