import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";

const AuthRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Check if running as PWA
  const isPwa = typeof window !== 'undefined' && 
                (window.matchMedia('(display-mode: standalone)').matches || 
                window.navigator.standalone === true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("access_token") || localStorage.getItem("token");
        
        if (!token) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        
        // Verify with backend
        const response = await fetch(`${API_URL}/auth/verify-session`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          // Add a cache busting parameter for PWA
          cache: isPwa ? 'no-store' : 'default'
        });
        
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // Handle all error responses (including 401, 500, etc.)
          // This covers cases like deleted accounts or invalid tokens
          console.log(`Session verification failed with status: ${response.status}`);
          localStorage.removeItem("access_token");
          localStorage.removeItem("token");
          localStorage.removeItem("isAdmin");
          setIsAuthenticated(false);
        }
      } catch (error) {
        // Handle network errors or other exceptions
        console.error("Authentication error:", error);
        localStorage.removeItem("access_token");
        localStorage.removeItem("token");
        localStorage.removeItem("isAdmin");
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    // Initial check
    checkAuth();
    
    // Listen for storage events (like logout from other components)
    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === "access_token" || e.key === null) {
        checkAuth();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    // Add a custom event listener for direct communication between components
    const handleAuthChange = () => {
      checkAuth();
    };
    
    window.addEventListener("auth-change", handleAuthChange);
    
    // Special handling for PWA mode
    if (isPwa) {
      // Check authentication status more frequently in PWA mode
      // This helps with OAuth redirect flows
      const interval = setInterval(checkAuth, 3000);
      return () => {
        clearInterval(interval);
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener("auth-change", handleAuthChange);
      };
    }
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, [API_URL, isPwa]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    // Save current location for return after login
    if (isPwa && location.pathname !== '/login') {
      localStorage.setItem("auth_return_to", location.pathname);
    }
    
    // Redirect to login and pass the intended location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AuthRoute; 