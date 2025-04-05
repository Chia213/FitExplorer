import { createContext, useContext, useEffect, useState } from "react";

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
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme;
    }

    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }

    return "light";
  });
  
  // State for currently active premium theme
  const [premiumTheme, setPremiumTheme] = useState(() => {
    const savedPremiumTheme = localStorage.getItem("premiumTheme");
    return savedPremiumTheme || "default";
  });
  
  // State for unlocked premium themes
  const [unlockedThemes, setUnlockedThemes] = useState(() => {
    try {
      const saved = localStorage.getItem("unlockedThemes");
      return saved ? JSON.parse(saved) : ["default"];
    } catch (err) {
      console.error("Error parsing unlocked themes:", err);
      return ["default"];
    }
  });

  // Check if user is admin
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  useEffect(() => {
    const root = window.document.documentElement;

    // Apply light/dark mode
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);

    // Apply premium theme CSS variables
    const currentTheme = premiumThemes[premiumTheme] || premiumThemes.default;
    
    // Apply color values as CSS variables
    root.style.setProperty('--color-primary', currentTheme.primary);
    root.style.setProperty('--color-secondary', currentTheme.secondary);
    root.style.setProperty('--color-accent', currentTheme.accent);
    
    // Apply RGB values for gradients and opacity
    root.style.setProperty('--color-primary-rgb', currentTheme.primaryRgb);
    root.style.setProperty('--color-secondary-rgb', currentTheme.secondaryRgb);
    root.style.setProperty('--color-accent-rgb', currentTheme.accentRgb);
    
    localStorage.setItem("premiumTheme", premiumTheme);
  }, [theme, premiumTheme]);

  // Effect to unlock all themes for admin users
  useEffect(() => {
    if (isAdmin) {
      // Silently unlock all premium themes for admins
      const allThemes = Object.keys(premiumThemes);
      setUnlockedThemes(allThemes);
    }
  }, [isAdmin]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const setThemeMode = (mode) => {
    if (mode === "light" || mode === "dark") {
      setTheme(mode);
    }
  };
  
  // Function to change the premium theme
  const changePremiumTheme = (themeKey) => {
    // Admin can change to any theme
    if (isAdmin && premiumThemes[themeKey]) {
      setPremiumTheme(themeKey);
      return true;
    }
    
    // Regular users need to have the theme unlocked
    if (premiumThemes[themeKey] && unlockedThemes.includes(themeKey)) {
      setPremiumTheme(themeKey);
      return true;
    }
    return false;
  };
  
  // Function to unlock a premium theme
  const unlockTheme = (themeKey) => {
    if (premiumThemes[themeKey] && !unlockedThemes.includes(themeKey)) {
      const newUnlockedThemes = [...unlockedThemes, themeKey];
      setUnlockedThemes(newUnlockedThemes);
      // Only save to localStorage for non-admin users to avoid cluttering storage
      if (!isAdmin) {
        localStorage.setItem("unlockedThemes", JSON.stringify(newUnlockedThemes));
      }
      return true;
    }
    return false;
  };
  
  // Function to unlock all premium themes
  const unlockAllThemes = () => {
    const allThemes = Object.keys(premiumThemes);
    setUnlockedThemes(allThemes);
    // Only save to localStorage for non-admin users
    if (!isAdmin) {
      localStorage.setItem("unlockedThemes", JSON.stringify(allThemes));
    }
    return true;
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      setThemeMode,
      premiumTheme,
      changePremiumTheme,
      unlockTheme,
      unlockAllThemes,
      unlockedThemes,
      premiumThemes,
      isAdmin
    }}>
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
