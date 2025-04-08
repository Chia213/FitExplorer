import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";

// Define the API_URL constant
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Inline implementation of fetchWithTokenRefresh to avoid circular dependencies
const fetchWithTokenRefresh = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");
  if (!token && endpoint !== "/auth/refresh-token") {
    throw new Error("No authentication token found");
  }

  // Prepare headers with auth token
  const headers = {
    ...options.headers,
    "Content-Type": options.headers?.["Content-Type"] || "application/json",
  };

  if (token && endpoint !== "/auth/refresh-token") {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Make the request
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // If unauthorized and not already trying to refresh token
    if (response.status === 401 && endpoint !== "/auth/refresh-token") {
      console.log("Token expired, attempting to refresh...");
      
      try {
        // Try to refresh the token
        const refreshResponse = await fetch(`${API_URL}/auth/refresh-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: localStorage.getItem("refreshToken") }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          localStorage.setItem("token", data.access_token);
          
          if (data.refresh_token) {
            localStorage.setItem("refreshToken", data.refresh_token);
          }

          // Retry the original request with the new token
          headers["Authorization"] = `Bearer ${data.access_token}`;
          return fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
          });
        } else {
          // If refresh fails, logout
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("isAdmin");
          window.location.href = "/login";
          throw new Error("Session expired. Please log in again.");
        }
      } catch (error) {
        console.error("Error refreshing token:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("isAdmin");
        window.location.href = "/login";
        throw new Error("Session expired. Please log in again.");
      }
    }

    return response;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Define premium themes
export const premiumThemes = {
  default: {
    name: "Default",
    isPremium: false,
    description: "The standard theme",
    primary: "#3b82f6", // blue-500
    secondary: "#10b981", // emerald-500
    accent: "#8b5cf6", // violet-500
    primaryRgb: "59, 130, 246",
    secondaryRgb: "16, 185, 129",
    accentRgb: "139, 92, 246",
    preview: "default"
  },
  cosmos: {
    name: "Cosmos",
    isPremium: true,
    description: "Deep space-inspired dark theme with cosmic accents",
    primary: "#6366f1", // indigo-500
    secondary: "#8b5cf6", // violet-500
    accent: "#ec4899", // pink-500
    primaryRgb: "99, 102, 241",
    secondaryRgb: "139, 92, 246",
    accentRgb: "236, 72, 153",
    preview: "cosmos"
  },
  forest: {
    name: "Forest",
    isPremium: true,
    description: "Calming greens and earthy tones for a natural feel",
    primary: "#059669", // emerald-600
    secondary: "#65a30d", // lime-600
    accent: "#92400e", // amber-800
    primaryRgb: "5, 150, 105",
    secondaryRgb: "101, 163, 13",
    accentRgb: "146, 64, 14",
    preview: "forest"
  },
  sunset: {
    name: "Sunset",
    isPremium: true,
    description: "Warm gradient of sunset colors for a relaxing experience",
    primary: "#f59e0b", // amber-500
    secondary: "#ef4444", // red-500  
    accent: "#7c3aed", // violet-600
    primaryRgb: "245, 158, 11",
    secondaryRgb: "239, 68, 68",
    accentRgb: "124, 58, 237",
    preview: "sunset"
  },
  ocean: {
    name: "Ocean",
    isPremium: true,
    description: "Deep blue and teal tones inspired by the sea",
    primary: "#0369a1", // sky-700
    secondary: "#0e7490", // cyan-700
    accent: "#1e40af", // blue-800
    primaryRgb: "3, 105, 161",
    secondaryRgb: "14, 116, 144",
    accentRgb: "30, 64, 175",
    preview: "ocean"
  },
  royal: {
    name: "Royal",
    isPremium: true,
    description: "Sophisticated purple and gold for a premium feel",
    primary: "#7e22ce", // purple-700
    secondary: "#a16207", // yellow-700
    accent: "#4338ca", // indigo-700
    primaryRgb: "126, 34, 206",
    secondaryRgb: "161, 98, 7",
    accentRgb: "67, 56, 202",
    preview: "royal"
  }
};

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light"); // Default to light
  const [premiumTheme, setPremiumTheme] = useState("default");
  const [unlockedThemes, setUnlockedThemes] = useState(["default"]);
  const [loading, setLoading] = useState(true);
  
  // Check if user is admin - still use localStorage for this
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  // Declare function reference for memoization
  const applyTheme = useCallback(async (targetTheme, targetMode = null) => {
    // First check if user has access to this theme
    const hasAccess = await checkThemeAccess(targetTheme);
    
    // Only allow admin or premium themes that have been unlocked
    if (!hasAccess && targetTheme !== 'default' && !unlockedThemes.includes(targetTheme)) {
      toast.error(`You don't have access to the ${targetTheme} theme`);
      return false;
    }
    
    // Set the theme after validation
    setPremiumTheme(targetTheme);
    
    // Update theme mode if specified
    if (targetMode) {
      setTheme(targetMode);
    }
    
    // Save to localStorage
    localStorage.setItem("premiumTheme", targetTheme);
    
    // If user is logged in, save to backend
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await fetchWithTokenRefresh("/user/themes", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ 
            theme: theme,
            premium_theme: targetTheme
          })
        });
        
        if (!response.ok) {
          console.error("Failed to save theme settings to backend");
        }
      } catch (error) {
        console.error("Error saving theme settings:", error);
      }
    }
    
    // Show success toast only if not the default theme
    if (targetTheme !== 'default') {
      toast.success(`${premiumThemes[targetTheme]?.name || 'Custom'} theme applied!`);
    }
    
    return true;
  }, [theme, unlockedThemes]);

  // Load theme settings from backend on component mount
  useEffect(() => {
    // Only fetch themes if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      // If not logged in, use localStorage for theme settings
      const savedTheme = localStorage.getItem("theme") || "light";
      const savedPremiumTheme = localStorage.getItem("premiumTheme") || "default";
      
      try {
        const savedUnlockedThemes = JSON.parse(localStorage.getItem("unlockedThemes") || '["default"]');
        setUnlockedThemes(savedUnlockedThemes);
      } catch (err) {
        console.error("Error parsing unlocked themes from localStorage:", err);
        setUnlockedThemes(["default"]);
      }
      
      setTheme(savedTheme);
      setPremiumTheme(savedPremiumTheme);
      setLoading(false);
      return;
    }
    
    // Fetch theme settings from backend
    const fetchThemeSettings = async () => {
      try {
        setLoading(true);
        const response = await fetchWithTokenRefresh("/user/themes");
        
        if (response.ok) {
          const data = await response.json();
          
          // Always prioritize the backed theme settings over localStorage
          // to ensure user gets their own themes, not the previous user's
          const backendThemeMode = data.theme || "light";
          const backendPremiumTheme = data.premium_theme || "default";
          const backendUnlockedThemes = data.unlocked_themes || ["default"];
          
          // Set the state with backend data
          setTheme(backendThemeMode);
          setPremiumTheme(backendPremiumTheme);
          setUnlockedThemes(backendUnlockedThemes);
          
          // Update localStorage with backend data
          localStorage.setItem("theme", backendThemeMode);
          localStorage.setItem("premiumTheme", backendPremiumTheme);
          localStorage.setItem("unlockedThemes", JSON.stringify(backendUnlockedThemes));
          
          console.log("Theme settings synchronized from backend:", {
            mode: backendThemeMode,
            premiumTheme: backendPremiumTheme,
            unlockedThemes: backendUnlockedThemes
          });
        } else {
          // If API fails, use localStorage
          const savedTheme = localStorage.getItem("theme") || "light";
          const savedPremiumTheme = localStorage.getItem("premiumTheme") || "default";
          const savedUnlockedThemes = JSON.parse(localStorage.getItem("unlockedThemes") || '["default"]');
          
          setTheme(savedTheme);
          setPremiumTheme(savedPremiumTheme);
          setUnlockedThemes(savedUnlockedThemes);
        }
      } catch (err) {
        console.error("Error fetching theme settings:", err);
        
        // Use localStorage as fallback
        const savedTheme = localStorage.getItem("theme") || "light";
        const savedPremiumTheme = localStorage.getItem("premiumTheme") || "default";
        const savedUnlockedThemes = JSON.parse(localStorage.getItem("unlockedThemes") || '["default"]');
        
        setTheme(savedTheme);
        setPremiumTheme(savedPremiumTheme);
        setUnlockedThemes(savedUnlockedThemes);
      } finally {
        setLoading(false);
      }
    };
    
    fetchThemeSettings();
  }, []);

  useEffect(() => {
    if (loading) return; // Skip if still loading
    
    const root = window.document.documentElement;

    // Apply light/dark mode
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme); // Keep in localStorage for faster initial load

    // Apply premium theme CSS variables
    if (!premiumTheme || (premiumThemes && !premiumThemes[premiumTheme])) {
      console.warn(`Theme "${premiumTheme}" not found, falling back to default`);
      setPremiumTheme("default");
      localStorage.setItem("premiumTheme", "default");
      return;
    }

    const currentTheme = premiumThemes[premiumTheme] || premiumThemes.default;
    
    // Apply color values as CSS variables
    root.style.setProperty('--color-primary', currentTheme.primary);
    root.style.setProperty('--color-secondary', currentTheme.secondary);
    root.style.setProperty('--color-accent', currentTheme.accent);
    
    // Apply RGB values for gradients and opacity
    root.style.setProperty('--color-primary-rgb', currentTheme.primaryRgb);
    root.style.setProperty('--color-secondary-rgb', currentTheme.secondaryRgb);
    root.style.setProperty('--color-accent-rgb', currentTheme.accentRgb);
    
    localStorage.setItem("premiumTheme", premiumTheme); // Keep in localStorage for faster initial load
  }, [theme, premiumTheme, loading]);

  // Effect to unlock all themes for admin users
  useEffect(() => {
    if (isAdmin && !loading) {
      // Silently unlock all premium themes for admins
      const allThemes = Object.keys(premiumThemes);
      setUnlockedThemes(allThemes);
    }
  }, [isAdmin, loading]);

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme); // Update local state immediately for responsive UI
    
    // Only update backend if user is logged in
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await fetchWithTokenRefresh("/user/themes/mode", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ theme_mode: newTheme }),
        });
        
        if (!response.ok) {
          console.error("Failed to update theme mode in backend");
          // We don't revert the UI since it's not critical
        }
      } catch (error) {
        console.error("Error updating theme mode:", error);
      }
    }
  };

  const setThemeMode = async (mode) => {
    if (mode === "light" || mode === "dark") {
      setTheme(mode); // Update local state immediately
      
      // Only update backend if user is logged in
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetchWithTokenRefresh("/user/themes/mode", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ theme_mode: mode }),
          });
          
          if (!response.ok) {
            console.error("Failed to update theme mode in backend");
          }
        } catch (error) {
          console.error("Error updating theme mode:", error);
        }
      }
    }
  };
  
  // Function to change the premium theme
  const changePremiumTheme = async (themeKey) => {
    // Check if theme exists
    if (!premiumThemes[themeKey]) {
      console.error(`Theme "${themeKey}" not found`);
      toast.error(`Theme "${themeKey}" not found`);
      return false;
    }
    
    // Admin can change to any theme
    const canChangeTheme = isAdmin || unlockedThemes.includes(themeKey);
    
    if (canChangeTheme) {
      setPremiumTheme(themeKey); // Update local state immediately
      
      // Only update backend if user is logged in
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetchWithTokenRefresh("/user/themes/premium", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ theme_key: themeKey }),
          });
          
          if (!response.ok) {
            const data = await response.json();
            toast.error(data.detail || "Failed to update premium theme");
            return false;
          }
        } catch (error) {
          console.error("Error updating premium theme:", error);
          return false;
        }
      }
      return true;
    }
    
    toast.error("You must unlock this theme first");
    return false;
  };
  
  // Function to unlock a premium theme
  const unlockTheme = async (themeKey) => {
    if (!premiumThemes[themeKey] || unlockedThemes.includes(themeKey)) {
      return false; // Theme doesn't exist or is already unlocked
    }
    
    // Update local state immediately for responsive UI
    const newUnlockedThemes = [...unlockedThemes, themeKey];
    setUnlockedThemes(newUnlockedThemes);
    
    // Only update backend if user is logged in
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await fetchWithTokenRefresh("/user/themes/unlock", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ theme_key: themeKey }),
        });
        
        if (!response.ok) {
          // Revert the local state change
          setUnlockedThemes(unlockedThemes);
          const data = await response.json();
          toast.error(data.detail || "Failed to unlock theme");
          return false;
        }
      } catch (error) {
        // Revert the local state change
        setUnlockedThemes(unlockedThemes);
        console.error("Error unlocking theme:", error);
        return false;
      }
    } else {
      // For non-logged in users, save to localStorage
      localStorage.setItem("unlockedThemes", JSON.stringify(newUnlockedThemes));
    }
    
    return true;
  };
  
  // Function to unlock all premium themes
  const unlockAllThemes = async () => {
    const allThemes = Object.keys(premiumThemes);
    
    // Update local state immediately for responsive UI
    setUnlockedThemes(allThemes);
    
    // Only update backend if user is logged in and not admin (admins have all themes by default)
    const token = localStorage.getItem("token");
    if (token && !isAdmin) {
      // We need to unlock each theme individually in the backend
      try {
        const promises = allThemes.map(themeKey =>
          fetchWithTokenRefresh("/user/themes/unlock", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ theme_key: themeKey }),
          })
        );
        
        await Promise.all(promises);
      } catch (error) {
        console.error("Error unlocking all themes:", error);
        // We don't revert the UI since it's not critical and would be complex to determine which themes failed
      }
    } else if (!token) {
      // For non-logged in users, save to localStorage
      localStorage.setItem("unlockedThemes", JSON.stringify(allThemes));
    }
    
    return true;
  };

  // Add a function to verify theme access with the backend
  const checkThemeAccess = async (themeKey) => {
    // If it's the default theme, everyone has access
    if (themeKey === 'default') return true;
    
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) return false;
    
    try {
      // Check with backend if user has access to this theme
      const response = await fetchWithTokenRefresh("/user/themes/check-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ theme_key: themeKey })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.has_access;
      }
      return false;
    } catch (error) {
      console.error("Error checking theme access:", error);
      return false;
    }
  };

  // Add a function to synchronize themes with the backend
  const synchronizeThemes = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      // Get current theme settings from backend
      const response = await fetchWithTokenRefresh("/user/themes");
      
      if (response.ok) {
        const data = await response.json();
        
        // Check if premium theme is valid according to backend
        const backendPremiumTheme = data.premium_theme || "default";
        const backendUnlockedThemes = data.unlocked_themes || ["default"];
        
        // If current theme is not in unlocked themes and user is not admin,
        // reset to default theme
        if (
          premiumTheme !== "default" && 
          !backendUnlockedThemes.includes(premiumTheme) && 
          !isAdmin
        ) {
          console.warn("Current theme is not unlocked, resetting to default");
          setPremiumTheme("default");
          localStorage.setItem("premiumTheme", "default");
          
          // Update the backend
          await fetchWithTokenRefresh("/user/themes", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
              theme: theme,
              premium_theme: "default"
            })
          });
          
          // Show warning toast
          toast.warning("Theme reset to default because you don't have access to the previous theme");
        }
        
        // Update unlocked themes in local state
        setUnlockedThemes(backendUnlockedThemes);
      }
    } catch (error) {
      console.error("Error synchronizing themes:", error);
    }
  }, [premiumTheme, theme, isAdmin]);

  // Call synchronizeThemes on login/logout or when admin status changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      synchronizeThemes();
    }
  }, [synchronizeThemes]);

  // Add a function to clear theme storage on logout
  const clearThemeStorage = useCallback(() => {
    // Reset to defaults in localStorage
    localStorage.setItem("theme", "light");
    localStorage.setItem("premiumTheme", "default");
    localStorage.setItem("unlockedThemes", JSON.stringify(["default"]));
    
    // Update state
    setTheme("light");
    setPremiumTheme("default");
    setUnlockedThemes(["default"]);
    
    console.log("Theme settings reset to defaults");
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme: () => {
          const newTheme = theme === "light" ? "dark" : "light";
          setTheme(newTheme);
          localStorage.setItem("theme", newTheme);
        },
        setThemeMode: (mode) => {
          setTheme(mode);
          localStorage.setItem("theme", mode);
        },
        premiumTheme,
        changePremiumTheme: (newTheme) => {
          setPremiumTheme(newTheme);
          localStorage.setItem("premiumTheme", newTheme);
        },
        unlockTheme: async (themeKey) => {
          if (!premiumThemes[themeKey]) {
            console.error(`Theme ${themeKey} not found`);
            return false;
          }
          
          try {
            // Update backend if user is logged in
            const token = localStorage.getItem("token");
            if (token) {
              const response = await fetchWithTokenRefresh("/user/themes/unlock", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ theme_key: themeKey })
              });
              
              if (!response.ok) {
                console.error("Failed to unlock theme in backend");
                return false;
              }
              
              // Get updated unlocked themes from response
              const data = await response.json();
              const updatedUnlockedThemes = data.unlocked_themes || [];
              setUnlockedThemes(updatedUnlockedThemes);
              
              // Save to localStorage
              localStorage.setItem("unlockedThemes", JSON.stringify(updatedUnlockedThemes));
              return true;
            }
            
            // Handle unlocking theme locally if not logged in
            if (!unlockedThemes.includes(themeKey)) {
              const updatedUnlockedThemes = [...unlockedThemes, themeKey];
              setUnlockedThemes(updatedUnlockedThemes);
              localStorage.setItem("unlockedThemes", JSON.stringify(updatedUnlockedThemes));
            }
            
            return true;
          } catch (error) {
            console.error("Error unlocking theme:", error);
            return false;
          }
        },
        unlockAllThemes: async () => {
          try {
            // Get all premium theme keys
            const allThemeKeys = Object.keys(premiumThemes);
            
            // Update backend if user is logged in
            const token = localStorage.getItem("token");
            if (token) {
              const response = await fetchWithTokenRefresh("/user/themes/unlock-all", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                }
              });
              
              if (!response.ok) {
                console.error("Failed to unlock all themes in backend");
                return false;
              }
              
              // Get updated unlocked themes from response
              const data = await response.json();
              const updatedUnlockedThemes = data.unlocked_themes || [];
              setUnlockedThemes(updatedUnlockedThemes);
              
              // Save to localStorage
              localStorage.setItem("unlockedThemes", JSON.stringify(updatedUnlockedThemes));
              return true;
            }
            
            // Handle unlocking all themes locally if not logged in
            setUnlockedThemes(allThemeKeys);
            localStorage.setItem("unlockedThemes", JSON.stringify(allThemeKeys));
            
            return true;
          } catch (error) {
            console.error("Error unlocking all themes:", error);
            return false;
          }
        },
        unlockedThemes,
        premiumThemes,
        isAdmin,
        loading,
        applyTheme,
        synchronizeThemes,
        checkThemeAccess,
        clearThemeStorage
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
