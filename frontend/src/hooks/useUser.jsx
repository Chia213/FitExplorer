import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth.jsx';

const backendURL = 'http://localhost:8000';

export const useUser = () => {
  const { user: authUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }
      
      const data = await response.json();
      setUserData(data);
      return data;
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [authUser]);

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

  return {
    userData,
    loading,
    error,
    fetchUserData,
    updateUserProfile,
    updateUserStats,
    getUserStreak,
    updateProfilePicture
  };
}; 