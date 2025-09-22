import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth.jsx';
import { useNavigate } from 'react-router-dom';

const backendURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const useUser = () => {
  const { user: authUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [unlockedFeatures, setUnlockedFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch user profile data
  const fetchUserData = useCallback(async () => {
    if (!authUser) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendURL}/user-profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }
        return null;
      }
      
      const data = await response.json();
      setUserData(data);
      
      // Set unlocked features
      setUnlockedFeatures(data.unlocked_features || []);
      
      return data;
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [authUser, navigate]);

  // Update user profile
  const updateUserProfile = useCallback(async (profileData) => {
    if (!authUser) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendURL}/user-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update user profile: ${response.status}`);
      }
      
      const data = await response.json();
      setUserData(prev => ({ ...prev, ...data }));
      
      // Update unlocked features
      setUnlockedFeatures(data.unlocked_features || []);
      
      return true;
    } catch (err) {
      console.error("Error updating user profile:", err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  // Update user stats
  const updateUserStats = useCallback(async (statsData) => {
    if (!authUser) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendURL}/user-stats`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(statsData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update user stats: ${response.status}`);
      }
      
      // Refresh user data to get updated stats
      await fetchUserData();
      return true;
    } catch (err) {
      console.error("Error updating user stats:", err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [authUser, fetchUserData]);

  // Get user workout streak
  const getUserStreak = useCallback(async () => {
    if (!authUser) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendURL}/user-streak`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user streak: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error fetching user streak:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  // Update user profile picture
  const updateProfilePicture = useCallback(async (imageFile) => {
    if (!authUser || !imageFile) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("profile_picture", imageFile);
      
      const response = await fetch(`${backendURL}/user-profile/picture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update profile picture: ${response.status}`);
      }
      
      const data = await response.json();
      setUserData(prev => ({ ...prev, profile_picture: data.profile_picture_url }));
      return true;
    } catch (err) {
      console.error("Error updating profile picture:", err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  // Load user data when auth user changes
  useEffect(() => {
    if (authUser) {
      fetchUserData();
    } else {
      setUserData(null);
    }
  }, [authUser, fetchUserData]);

  // Global refresh mechanism for cross-device synchronization
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && authUser) {
        // Refresh user data when tab becomes visible (user switched back to this tab)
        fetchUserData();
      }
    };

    const handleFocus = () => {
      if (authUser) {
        // Refresh user data when window regains focus
        fetchUserData();
      }
    };

    // Listen for storage events (like logout from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === "access_token" || e.key === null) {
        if (authUser) {
          fetchUserData();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [authUser, fetchUserData]);

  // Function to check if a feature is unlocked
  const hasFeature = useCallback((featureKey) => {
    // Admin users have all features
    if (userData?.is_admin) return true;
    
    // Check if the feature is in the unlocked features array
    return unlockedFeatures.includes(featureKey);
  }, [userData, unlockedFeatures]);

  return {
    userData,
    loading,
    error,
    fetchUserData,
    updateUserProfile,
    updateUserStats,
    getUserStreak,
    updateProfilePicture,
    unlockedFeatures,
    hasFeature
  };
}; 
