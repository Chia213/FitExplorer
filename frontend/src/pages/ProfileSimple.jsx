import { useEffect, useState } from "react";
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

  const navigate = useNavigate();
  const { theme } = useTheme();

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

      // Set profile picture
      if (userData.profile_picture) {
        setProfilePicture(`${backendURL}/${userData.profile_picture}?t=${new Date().getTime()}`);
      } else {
        setProfilePicture(null);
      }

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

        {/* Personal Information */}
        <div className="bg-card rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Personal Information</h2>
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
        </div>

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
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileSimple;
