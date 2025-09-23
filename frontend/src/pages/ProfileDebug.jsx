import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ProfileDebug() {
  console.log("🔍 ProfileDebug: Component starting to render");
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  console.log("🔍 ProfileDebug: State initialized", { user: !!user, loading });
  
  useEffect(() => {
    console.log("🔍 ProfileDebug: useEffect called");
    
    const token = localStorage.getItem("token");
    console.log("🔍 ProfileDebug: Token found:", !!token);
    
    if (!token) {
      console.log("🔍 ProfileDebug: No token, redirecting to login");
      navigate("/login");
      return;
    }
    
    // Simple API call
    const fetchUser = async () => {
      try {
        console.log("🔍 ProfileDebug: Starting API call");
        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/user-profile`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });
        
        console.log("🔍 ProfileDebug: API response status:", response.status);
        
        if (response.ok) {
          const userData = await response.json();
          console.log("🔍 ProfileDebug: User data received:", userData);
          setUser(userData);
        } else {
          console.log("🔍 ProfileDebug: API failed with status:", response.status);
        }
      } catch (error) {
        console.error("🔍 ProfileDebug: API error:", error);
      } finally {
        console.log("🔍 ProfileDebug: Setting loading to false");
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [navigate]);
  
  console.log("🔍 ProfileDebug: About to render, current state:", { loading, user: !!user });
  
  if (loading) {
    console.log("🔍 ProfileDebug: Rendering loading state");
    return <div className="p-4">Loading...</div>;
  }
  
  if (!user) {
    console.log("🔍 ProfileDebug: No user, rendering error state");
    return <div className="p-4">No user data</div>;
  }
  
  console.log("🔍 ProfileDebug: Rendering main content");
  return (
    <div className="p-4">
      <h1>Profile Debug</h1>
      <p>Username: {user.username}</p>
      <p>Email: {user.email}</p>
      <p>This is a minimal profile component for debugging.</p>
    </div>
  );
}

export default ProfileDebug;
