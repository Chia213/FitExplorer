import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { COLORS } from './theme';

// Premium theme definitions
export const premiumThemes = {
  default: {
    name: "Default",
    description: "The standard theme with green accents",
    colors: {
      primary: COLORS.primary, // Green from the base theme
      secondary: "#10b981", // emerald-500
      accent: "#8b5cf6", // violet-500
      primaryRgb: "76, 175, 80",
      secondaryRgb: "16, 185, 129",
      accentRgb: "139, 92, 246"
    },
    preview: require('../assets/themes/default.png')
  },
  forest: {
    name: "Forest",
    description: "Calming green tones inspired by nature",
    colors: {
      primary: "#059669", // emerald-600
      secondary: "#65a30d", // lime-600
      accent: "#15803d", // green-700
      primaryRgb: "5, 150, 105",
      secondaryRgb: "101, 163, 13",
      accentRgb: "21, 128, 61"
    },
    preview: require('../assets/themes/forest.png')
  },
  sunset: {
    name: "Sunset",
    description: "Warm orange and red tones",
    colors: {
      primary: "#ea580c", // orange-600
      secondary: "#b91c1c", // red-700
      accent: "#c2410c", // amber-700
      primaryRgb: "234, 88, 12",
      secondaryRgb: "185, 28, 28",
      accentRgb: "194, 65, 12"
    },
    preview: require('../assets/themes/sunset.png')
  },
  ocean: {
    name: "Ocean",
    description: "Deep blue and teal tones",
    colors: {
      primary: "#0369a1", // sky-700
      secondary: "#0e7490", // cyan-700
      accent: "#1e40af", // blue-800
      primaryRgb: "3, 105, 161",
      secondaryRgb: "14, 116, 144",
      accentRgb: "30, 64, 175"
    },
    preview: require('../assets/themes/ocean.png')
  },
  royal: {
    name: "Royal",
    description: "Sophisticated purple and gold",
    colors: {
      primary: "#7e22ce", // purple-700
      secondary: "#a16207", // yellow-700
      accent: "#4338ca", // indigo-700
      primaryRgb: "126, 34, 206",
      secondaryRgb: "161, 98, 7",
      accentRgb: "67, 56, 202"
    },
    preview: require('../assets/themes/royal.png')
  }
};

// Apply theme and return theme object
export const applyTheme = async (themeName) => {
  const theme = premiumThemes[themeName] || premiumThemes.default;
  
  // Save theme preference
  await AsyncStorage.setItem('selectedTheme', themeName);
  
  // Return the theme for immediate use
  return theme;
};

// Get currently active theme name
export const getActiveThemeName = async () => {
  try {
    const savedTheme = await AsyncStorage.getItem('selectedTheme');
    return savedTheme || 'default';
  } catch (error) {
    console.error('Error getting active theme:', error);
    return 'default';
  }
};

// Get currently active theme object
export const getActiveTheme = async () => {
  const themeName = await getActiveThemeName();
  return premiumThemes[themeName] || premiumThemes.default;
};

// Get unlocked premium themes
export const getUnlockedThemes = async () => {
  try {
    const unlockedThemesJson = await AsyncStorage.getItem('unlockedThemes');
    const unlockedThemes = unlockedThemesJson ? JSON.parse(unlockedThemesJson) : ['default'];
    return unlockedThemes;
  } catch (error) {
    console.error('Error getting unlocked themes:', error);
    return ['default'];
  }
};

// Check if a theme is unlocked
export const isThemeUnlocked = async (themeName) => {
  const unlockedThemes = await getUnlockedThemes();
  return unlockedThemes.includes(themeName);
};

// Unlock a specific theme
export const unlockTheme = async (themeName) => {
  if (!premiumThemes[themeName]) return false;
  
  try {
    const unlockedThemes = await getUnlockedThemes();
    if (!unlockedThemes.includes(themeName)) {
      unlockedThemes.push(themeName);
      await AsyncStorage.setItem('unlockedThemes', JSON.stringify(unlockedThemes));
    }
    return true;
  } catch (error) {
    console.error('Error unlocking theme:', error);
    return false;
  }
};

// Unlock all available themes
export const unlockAllThemes = async () => {
  try {
    const allThemes = Object.keys(premiumThemes);
    await AsyncStorage.setItem('unlockedThemes', JSON.stringify(allThemes));
    return allThemes;
  } catch (error) {
    console.error('Error unlocking all themes:', error);
    return ['default'];
  }
};

// Get appearance mode (light/dark)
export const getAppearanceMode = async () => {
  try {
    // Check saved preference
    const savedMode = await AsyncStorage.getItem('appearanceMode');
    
    if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
      return savedMode;
    }
    
    if (savedMode === 'system') {
      // Use system preference
      return Appearance.getColorScheme() || 'light';
    }
    
    // Default to light mode
    return 'light';
  } catch (error) {
    console.error('Error getting appearance mode:', error);
    return 'light';
  }
};

// Set appearance mode (light/dark/system)
export const setAppearanceMode = async (mode) => {
  try {
    if (['light', 'dark', 'system'].includes(mode)) {
      await AsyncStorage.setItem('appearanceMode', mode);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error setting appearance mode:', error);
    return false;
  }
};

// Initialize theme system
export const initializeTheme = async () => {
  try {
    // Initialize unlocked themes if not set
    const unlockedThemes = await AsyncStorage.getItem('unlockedThemes');
    if (!unlockedThemes) {
      await AsyncStorage.setItem('unlockedThemes', JSON.stringify(['default']));
    }
    
    // Get current appearance mode if not set
    const appearanceMode = await AsyncStorage.getItem('appearanceMode');
    if (!appearanceMode) {
      await AsyncStorage.setItem('appearanceMode', 'system');
    }
    
    // Get current theme
    const activeTheme = await getActiveThemeName();
    return premiumThemes[activeTheme] || premiumThemes.default;
  } catch (error) {
    console.error('Error initializing theme:', error);
    return premiumThemes.default;
  }
};

export default {
  premiumThemes,
  applyTheme,
  getActiveThemeName,
  getActiveTheme,
  getUnlockedThemes,
  isThemeUnlocked,
  unlockTheme,
  unlockAllThemes,
  getAppearanceMode,
  setAppearanceMode,
  initializeTheme
}; 