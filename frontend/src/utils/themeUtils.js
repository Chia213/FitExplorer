// Premium theme definitions
export const premiumThemes = {
  default: {
    name: "Default",
    description: "The standard theme with blue accents",
    colors: {
      primary: "#3b82f6", // blue-500
      secondary: "#10b981", // emerald-500
      accent: "#8b5cf6", // violet-500
      primaryRgb: "59, 130, 246",
      secondaryRgb: "16, 185, 129",
      accentRgb: "139, 92, 246"
    },
    preview: "/themes/default.png"
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
    preview: "/themes/forest.png"
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
    preview: "/themes/sunset.png"
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
    preview: "/themes/ocean.png"
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
    preview: "/themes/royal.png"
  }
};

// Apply theme to document
export const applyTheme = (themeName) => {
  const theme = premiumThemes[themeName] || premiumThemes.default;
  const root = document.documentElement;
  
  // Apply CSS variables
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-secondary', theme.colors.secondary);
  root.style.setProperty('--color-accent', theme.colors.accent);
  
  // Apply RGB values for gradients
  root.style.setProperty('--color-primary-rgb', theme.colors.primaryRgb);
  root.style.setProperty('--color-secondary-rgb', theme.colors.secondaryRgb);
  root.style.setProperty('--color-accent-rgb', theme.colors.accentRgb);
  
  // Save theme preference
  localStorage.setItem('selectedTheme', themeName);
  
  return theme;
};

// Get currently active theme
export const getActiveTheme = () => {
  const savedTheme = localStorage.getItem('selectedTheme') || 'default';
  return savedTheme;
};

// Get unlocked premium themes
export const getUnlockedThemes = () => {
  const unlockedThemes = JSON.parse(localStorage.getItem('unlockedThemes')) || ['default'];
  return unlockedThemes;
};

// Unlock a specific theme
export const unlockTheme = (themeName) => {
  if (!premiumThemes[themeName]) return false;
  
  const unlockedThemes = getUnlockedThemes();
  if (!unlockedThemes.includes(themeName)) {
    unlockedThemes.push(themeName);
    localStorage.setItem('unlockedThemes', JSON.stringify(unlockedThemes));
  }
  
  return true;
};

// Unlock all available themes
export const unlockAllThemes = () => {
  const allThemes = Object.keys(premiumThemes);
  localStorage.setItem('unlockedThemes', JSON.stringify(allThemes));
  return allThemes;
};

// Initialize theme system
export const initializeTheme = () => {
  const activeTheme = getActiveTheme();
  applyTheme(activeTheme);
  
  // Initialize unlocked themes if not set
  if (!localStorage.getItem('unlockedThemes')) {
    localStorage.setItem('unlockedThemes', JSON.stringify(['default']));
  }
}; 