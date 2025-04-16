import React, { createContext, useState, useContext, useEffect } from 'react';
import { retrieveObject, storeObject } from '../utils/storage';

// Define default themes
export const premiumThemes = {
  default: {
    name: "Default",
    isPremium: false,
    description: "The standard theme",
    primary: "#3b82f6", // blue-500
    secondary: "#10b981", // emerald-500
    accent: "#8b5cf6", // violet-500
    background: "#ffffff",
    card: "#f9fafb",
    text: "#1f2937",
    darkMode: false
  },
  dark: {
    name: "Dark",
    isPremium: false,
    description: "Dark mode theme",
    primary: "#3b82f6", // blue-500
    secondary: "#10b981", // emerald-500
    accent: "#8b5cf6", // violet-500
    background: "#1f2937",
    card: "#374151",
    text: "#f9fafb",
    darkMode: true
  },
  ocean: {
    name: "Ocean",
    isPremium: true,
    description: "Deep blue and teal tones inspired by the sea",
    primary: "#0369a1", // sky-700
    secondary: "#0e7490", // cyan-700
    accent: "#1e40af", // blue-800
    background: "#f0f9ff",
    card: "#e0f2fe",
    text: "#0c4a6e",
    darkMode: false
  },
  forest: {
    name: "Forest",
    isPremium: true,
    description: "Calming greens and earthy tones for a natural feel",
    primary: "#059669", // emerald-600
    secondary: "#65a30d", // lime-600
    accent: "#92400e", // amber-800
    background: "#f0fdf4",
    card: "#dcfce7",
    text: "#166534",
    darkMode: false
  }
};

// Create the context
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState("default");
  const [unlockedThemes, setUnlockedThemes] = useState(["default", "dark"]);
  const [loading, setLoading] = useState(true);
  const [customColor, setCustomColor] = useState(null);
  const [useCustomColor, setUseCustomColor] = useState(false);

  // Load saved theme preferences
  useEffect(() => {
    const loadThemePreferences = async () => {
      try {
        setLoading(true);
        
        // Load theme name
        const savedTheme = await retrieveObject('themeName');
        if (savedTheme) {
          setThemeName(savedTheme);
        }
        
        // Load unlocked themes
        const savedUnlockedThemes = await retrieveObject('unlockedThemes');
        if (savedUnlockedThemes && Array.isArray(savedUnlockedThemes)) {
          setUnlockedThemes(savedUnlockedThemes);
        }
        
        // Load custom color preferences
        const savedCustomColor = await retrieveObject('customColor');
        if (savedCustomColor) {
          setCustomColor(savedCustomColor);
        }
        
        const savedUseCustomColor = await retrieveObject('useCustomColor');
        if (savedUseCustomColor !== null) {
          setUseCustomColor(savedUseCustomColor);
        }
      } catch (error) {
        console.error('Error loading theme preferences:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadThemePreferences();
  }, []);

  // Save theme preferences when they change
  useEffect(() => {
    if (loading) return;
    
    const saveThemePreferences = async () => {
      try {
        await storeObject('themeName', themeName);
        await storeObject('unlockedThemes', unlockedThemes);
        await storeObject('customColor', customColor);
        await storeObject('useCustomColor', useCustomColor);
      } catch (error) {
        console.error('Error saving theme preferences:', error);
      }
    };
    
    saveThemePreferences();
  }, [themeName, unlockedThemes, customColor, useCustomColor, loading]);

  // Get the current theme object
  const getCurrentTheme = () => {
    const themeObject = premiumThemes[themeName] || premiumThemes.default;
    
    // If using custom color, override the primary color
    if (useCustomColor && customColor) {
      return {
        ...themeObject,
        primary: customColor
      };
    }
    
    return themeObject;
  };

  // Change the theme
  const changeTheme = (newThemeName) => {
    if (!premiumThemes[newThemeName]) {
      console.error(`Theme "${newThemeName}" not found`);
      return false;
    }
    
    // Check if theme is unlocked
    if (!unlockedThemes.includes(newThemeName)) {
      console.error(`Theme "${newThemeName}" is not unlocked`);
      return false;
    }
    
    setThemeName(newThemeName);
    
    // When changing themes, disable custom color
    setUseCustomColor(false);
    
    return true;
  };

  // Toggle between light and dark mode
  const toggleDarkMode = () => {
    if (getCurrentTheme().darkMode) {
      // Currently in dark mode, switch to light
      changeTheme('default');
    } else {
      // Currently in light mode, switch to dark
      changeTheme('dark');
    }
  };

  // Set custom color
  const setCustomThemeColor = (color) => {
    setCustomColor(color);
    setUseCustomColor(true);
    // When using custom color, revert to default theme
    setThemeName('default');
  };

  // Disable custom color
  const disableCustomThemeColor = () => {
    setUseCustomColor(false);
  };

  // Unlock a new theme
  const unlockTheme = (themeKey) => {
    if (!premiumThemes[themeKey]) {
      console.error(`Theme "${themeKey}" not found`);
      return false;
    }
    
    if (unlockedThemes.includes(themeKey)) {
      // Already unlocked
      return true;
    }
    
    setUnlockedThemes(prev => [...prev, themeKey]);
    return true;
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: getCurrentTheme(),
        themeName,
        changeTheme,
        toggleDarkMode,
        unlockedThemes,
        premiumThemes,
        loading,
        customColor,
        useCustomColor,
        setCustomThemeColor,
        disableCustomThemeColor,
        unlockTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
}

export default ThemeProvider; 