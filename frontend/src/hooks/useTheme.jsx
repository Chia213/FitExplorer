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
  },
  neon: {
    name: "Neon",
    isPremium: true,
    description: "Vibrant neon colors inspired by cyberpunk aesthetics",
    primary: "#06b6d4", // cyan-500
    secondary: "#d946ef", // fuchsia-500
    accent: "#22c55e", // green-500
    primaryRgb: "6, 182, 212",
    secondaryRgb: "217, 70, 239",
    accentRgb: "34, 197, 94",
    preview: "neon"
  },
  midnight: {
    name: "Midnight",
    isPremium: true,
    description: "Dark and mysterious theme with deep blues and purples",
    primary: "#312e81", // indigo-900
    secondary: "#5b21b6", // purple-800
    accent: "#1e3a8a", // blue-900
    primaryRgb: "49, 46, 129",
    secondaryRgb: "91, 33, 182",
    accentRgb: "30, 58, 138",
    preview: "midnight"
  },
  autumn: {
    name: "Autumn",
    isPremium: true,
    description: "Warm autumn colors inspired by fall foliage",
    primary: "#b45309", // amber-700
    secondary: "#7c2d12", // red-800
    accent: "#b91c1c", // red-700
    primaryRgb: "180, 83, 9",
    secondaryRgb: "124, 45, 18",
    accentRgb: "185, 28, 28",
    preview: "autumn"
  },
  pastel: {
    name: "Pastel",
    isPremium: true,
    description: "Soft, calming pastel colors for a gentle experience",
    primary: "#818cf8", // indigo-400
    secondary: "#f9a8d4", // pink-300
    accent: "#a5f3fc", // cyan-200
    primaryRgb: "129, 140, 248",
    secondaryRgb: "249, 168, 212",
    accentRgb: "165, 243, 252",
    preview: "pastel"
  },
  fitness: {
    name: "Fitness",
    isPremium: true,
    description: "Energetic colors to motivate your fitness journey",
    primary: "#16a34a", // green-600
    secondary: "#fb923c", // orange-400
    accent: "#2563eb", // blue-600
    primaryRgb: "22, 163, 74",
    secondaryRgb: "251, 146, 60",
    accentRgb: "37, 99, 235",
    preview: "fitness"
  },
  monochrome: {
    name: "Monochrome",
    isPremium: true,
    description: "Classic black and white theme with subtle gray accents",
    primary: "#18181b", // zinc-900
    secondary: "#71717a", // zinc-500
    accent: "#e4e4e7", // zinc-200
    primaryRgb: "24, 24, 27",
    secondaryRgb: "113, 113, 122",
    accentRgb: "228, 228, 231",
    preview: "monochrome"
  },
  tropical: {
    name: "Tropical",
    isPremium: true,
    description: "Bright and vibrant colors inspired by tropical paradise",
    primary: "#0ea5e9", // sky-500
    secondary: "#f472b6", // pink-400
    accent: "#facc15", // yellow-400
    primaryRgb: "14, 165, 233",
    secondaryRgb: "244, 114, 182",
    accentRgb: "250, 204, 21",
    preview: "tropical"
  },
  nordic: {
    name: "Nordic",
    isPremium: true,
    description: "Minimalist Scandinavian design with cool, calm tones",
    primary: "#475569", // slate-600
    secondary: "#94a3b8", // slate-400
    accent: "#cbd5e1", // slate-300
    primaryRgb: "71, 85, 105",
    secondaryRgb: "148, 163, 184",
    accentRgb: "203, 213, 225",
    preview: "nordic"
  },
  retro: {
    name: "Retro",
    isPremium: true,
    description: "Vintage colors with a nostalgic 80s vibe",
    primary: "#db2777", // pink-600
    secondary: "#6366f1", // indigo-500
    accent: "#fbbf24", // amber-400
    primaryRgb: "219, 39, 119",
    secondaryRgb: "99, 102, 241",
    accentRgb: "251, 191, 36",
    preview: "retro"
  },
  earth: {
    name: "Earth",
    isPremium: true,
    description: "Natural earth tones for a grounded, organic feel",
    primary: "#65a30d", // lime-600
    secondary: "#92400e", // amber-800
    accent: "#166534", // green-800
    primaryRgb: "101, 163, 13",
    secondaryRgb: "146, 64, 14",
    accentRgb: "22, 101, 52",
    preview: "earth"
  },
  galaxy: {
    name: "Galaxy",
    isPremium: true,
    description: "Deep space colors inspired by celestial imagery",
    primary: "#1e1b4b", // indigo-950
    secondary: "#7e22ce", // purple-700
    accent: "#3b82f6", // blue-500
    primaryRgb: "30, 27, 75",
    secondaryRgb: "126, 34, 206",
    accentRgb: "59, 130, 246",
    preview: "galaxy"
  },
  cherry: {
    name: "Cherry",
    isPremium: true,
    description: "Rich red and pink tones inspired by cherry blossoms",
    primary: "#be123c", // rose-700
    secondary: "#e11d48", // rose-600
    accent: "#fb7185", // rose-400
    primaryRgb: "190, 18, 60",
    secondaryRgb: "225, 29, 72",
    accentRgb: "251, 113, 133",
    preview: "cherry"
  },
  mint: {
    name: "Mint",
    isPremium: true,
    description: "Refreshing mint greens for a clean, cool aesthetic",
    primary: "#059669", // emerald-600
    secondary: "#10b981", // emerald-500
    accent: "#a7f3d0", // emerald-200
    primaryRgb: "5, 150, 105",
    secondaryRgb: "16, 185, 129",
    accentRgb: "167, 243, 208",
    preview: "mint"
  },
  coffee: {
    name: "Coffee",
    isPremium: true,
    description: "Warm, rich coffee tones for a cozy experience",
    primary: "#78350f", // amber-900
    secondary: "#92400e", // amber-800
    accent: "#d97706", // amber-600
    primaryRgb: "120, 53, 15",
    secondaryRgb: "146, 64, 14",
    accentRgb: "217, 119, 6",
    preview: "coffee"
  },
  electric: {
    name: "Electric",
    isPremium: true,
    description: "High-energy electric blue and purple tones",
    primary: "#2563eb", // blue-600
    secondary: "#4f46e5", // indigo-600
    accent: "#06b6d4", // cyan-500
    primaryRgb: "37, 99, 235",
    secondaryRgb: "79, 70, 229",
    accentRgb: "6, 182, 212",
    preview: "electric"
  },
  coral: {
    name: "Coral",
    isPremium: true,
    description: "Vibrant coral and teal inspired by tropical reefs",
    primary: "#f43f5e", // rose-500
    secondary: "#0d9488", // teal-600
    accent: "#fda4af", // rose-300
    primaryRgb: "244, 63, 94",
    secondaryRgb: "13, 148, 136",
    accentRgb: "253, 164, 175",
    preview: "coral"
  },
  lavender: {
    name: "Lavender",
    isPremium: true,
    description: "Soft purple hues inspired by lavender fields",
    primary: "#8b5cf6", // violet-500
    secondary: "#a78bfa", // violet-400
    accent: "#ddd6fe", // violet-200
    primaryRgb: "139, 92, 246",
    secondaryRgb: "167, 139, 250",
    accentRgb: "221, 214, 254",
    preview: "lavender"
  },
  ruby: {
    name: "Ruby",
    isPremium: true,
    description: "Deep and rich red gemstone colors",
    primary: "#b91c1c", // red-700
    secondary: "#dc2626", // red-600
    accent: "#fca5a5", // red-300
    primaryRgb: "185, 28, 28",
    secondaryRgb: "220, 38, 38",
    accentRgb: "252, 165, 165",
    preview: "ruby"
  },
  aqua: {
    name: "Aqua",
    isPremium: true,
    description: "Refreshing aquatic blues and greens",
    primary: "#0891b2", // cyan-600
    secondary: "#0ea5e9", // sky-500
    accent: "#67e8f9", // cyan-300
    primaryRgb: "8, 145, 178",
    secondaryRgb: "14, 165, 233",
    accentRgb: "103, 232, 249",
    preview: "aqua"
  },
  citrus: {
    name: "Citrus",
    isPremium: true,
    description: "Energizing lemon and lime colors",
    primary: "#ca8a04", // yellow-600
    secondary: "#65a30d", // lime-600
    accent: "#fef08a", // yellow-200
    primaryRgb: "202, 138, 4",
    secondaryRgb: "101, 163, 13",
    accentRgb: "254, 240, 138",
    preview: "citrus"
  },
  // Add 10 new premium themes here
  neonPink: {
    name: "Neon Pink",
    isPremium: true,
    description: "Bold neon pink with vibrant accents",
    primary: "#ec4899", // pink-500
    secondary: "#8b5cf6", // violet-500
    accent: "#10b981", // emerald-500
    primaryRgb: "236, 72, 153",
    secondaryRgb: "139, 92, 246",
    accentRgb: "16, 185, 129",
    preview: "neonPink"
  },
  deepOcean: {
    name: "Deep Ocean",
    isPremium: true,
    description: "Dark blue hues inspired by the depths of the ocean",
    primary: "#1e3a8a", // blue-900
    secondary: "#0f766e", // teal-700
    accent: "#0c4a6e", // sky-900
    primaryRgb: "30, 58, 138",
    secondaryRgb: "15, 118, 110",
    accentRgb: "12, 74, 110",
    preview: "deepOcean"
  },
  goldRush: {
    name: "Gold Rush",
    isPremium: true,
    description: "Luxurious gold and brown tones for elegance",
    primary: "#b45309", // amber-700
    secondary: "#92400e", // amber-800
    accent: "#fbbf24", // amber-400
    primaryRgb: "180, 83, 9",
    secondaryRgb: "146, 64, 14",
    accentRgb: "251, 191, 36",
    preview: "goldRush"
  },
  ultraViolet: {
    name: "Ultra Violet",
    isPremium: true,
    description: "Rich purple and violet shades with cosmic vibes",
    primary: "#7e22ce", // purple-700
    secondary: "#4c1d95", // purple-900
    accent: "#a78bfa", // violet-400
    primaryRgb: "126, 34, 206",
    secondaryRgb: "76, 29, 149",
    accentRgb: "167, 139, 250",
    preview: "ultraViolet"
  },
  matcha: {
    name: "Matcha",
    isPremium: true,
    description: "Soothing green tones inspired by Japanese tea culture",
    primary: "#15803d", // green-700
    secondary: "#4d7c0f", // lime-700
    accent: "#a3e635", // lime-400
    primaryRgb: "21, 128, 61",
    secondaryRgb: "77, 124, 15",
    accentRgb: "163, 230, 53",
    preview: "matcha"
  },
  iceCream: {
    name: "Ice Cream",
    isPremium: true,
    description: "Sweet pastel colors reminiscent of dessert treats",
    primary: "#f472b6", // pink-400
    secondary: "#a78bfa", // violet-400
    accent: "#93c5fd", // blue-300
    primaryRgb: "244, 114, 182",
    secondaryRgb: "167, 139, 250",
    accentRgb: "147, 197, 253",
    preview: "iceCream"
  },
  cyberpunk: {
    name: "Cyberpunk",
    isPremium: true,
    description: "Futuristic neon colors inspired by cyberpunk aesthetics",
    primary: "#f43f5e", // rose-500
    secondary: "#6366f1", // indigo-500
    accent: "#22d3ee", // cyan-400
    primaryRgb: "244, 63, 94",
    secondaryRgb: "99, 102, 241",
    accentRgb: "34, 211, 238",
    preview: "cyberpunk"
  },
  desert: {
    name: "Desert",
    isPremium: true,
    description: "Warm sand tones and sunset hues of arid landscapes",
    primary: "#d97706", // amber-600
    secondary: "#b45309", // amber-700
    accent: "#f97316", // orange-500
    primaryRgb: "217, 119, 6",
    secondaryRgb: "180, 83, 9",
    accentRgb: "249, 115, 22",
    preview: "desert"
  },
  moonlight: {
    name: "Moonlight",
    isPremium: true,
    description: "Ethereal silver and blue tones inspired by moonlit nights",
    primary: "#64748b", // slate-500
    secondary: "#475569", // slate-600
    accent: "#94a3b8", // slate-400
    primaryRgb: "100, 116, 139",
    secondaryRgb: "71, 85, 105",
    accentRgb: "148, 163, 184",
    preview: "moonlight"
  },
  fireTech: {
    name: "Fire Tech",
    isPremium: true,
    description: "Bold red and orange with high contrast for tech intensity",
    primary: "#dc2626", // red-600
    secondary: "#ea580c", // orange-600
    accent: "#fbbf24", // amber-400
    primaryRgb: "220, 38, 38",
    secondaryRgb: "234, 88, 12",
    accentRgb: "251, 191, 36",
    preview: "fireTech"
  },
  // New fitness-focused themes
  gymDark: {
    name: "Gym Dark",
    isPremium: true,
    description: "Professional dark theme perfect for serious fitness enthusiasts",
    primary: "#1f2937", // gray-800
    secondary: "#374151", // gray-700
    accent: "#10b981", // emerald-500
    primaryRgb: "31, 41, 55",
    secondaryRgb: "55, 65, 81",
    accentRgb: "16, 185, 129",
    preview: "gymDark"
  },
  powerLifter: {
    name: "Power Lifter",
    isPremium: true,
    description: "Bold and strong colors for power athletes",
    primary: "#dc2626", // red-600
    secondary: "#1f2937", // gray-800
    accent: "#fbbf24", // amber-400
    primaryRgb: "220, 38, 38",
    secondaryRgb: "31, 41, 55",
    accentRgb: "251, 191, 36",
    preview: "powerLifter"
  },
  cardio: {
    name: "Cardio",
    isPremium: true,
    description: "Energetic colors to boost your cardio sessions",
    primary: "#ef4444", // red-500
    secondary: "#f97316", // orange-500
    accent: "#fbbf24", // amber-400
    primaryRgb: "239, 68, 68",
    secondaryRgb: "249, 115, 22",
    accentRgb: "251, 191, 36",
    preview: "cardio"
  },
  zen: {
    name: "Zen",
    isPremium: true,
    description: "Calming colors for yoga and meditation sessions",
    primary: "#059669", // emerald-600
    secondary: "#0d9488", // teal-600
    accent: "#6b7280", // gray-500
    primaryRgb: "5, 150, 105",
    secondaryRgb: "13, 148, 136",
    accentRgb: "107, 114, 128",
    preview: "zen"
  },
  neonGym: {
    name: "Neon Gym",
    isPremium: true,
    description: "Vibrant neon colors for high-energy workouts",
    primary: "#06b6d4", // cyan-500
    secondary: "#8b5cf6", // violet-500
    accent: "#10b981", // emerald-500
    primaryRgb: "6, 182, 212",
    secondaryRgb: "139, 92, 246",
    accentRgb: "16, 185, 129",
    preview: "neonGym"
  },
  steel: {
    name: "Steel",
    isPremium: true,
    description: "Metallic grays and blues for a professional gym aesthetic",
    primary: "#475569", // slate-600
    secondary: "#64748b", // slate-500
    accent: "#0ea5e9", // sky-500
    primaryRgb: "71, 85, 105",
    secondaryRgb: "100, 116, 139",
    accentRgb: "14, 165, 233",
    preview: "steel"
  },
  protein: {
    name: "Protein",
    isPremium: true,
    description: "Rich browns and golds inspired by protein supplements",
    primary: "#92400e", // amber-800
    secondary: "#b45309", // amber-700
    accent: "#fbbf24", // amber-400
    primaryRgb: "146, 64, 14",
    secondaryRgb: "180, 83, 9",
    accentRgb: "251, 191, 36",
    preview: "protein"
  },
  midnightGym: {
    name: "Midnight Gym",
    isPremium: true,
    description: "Deep dark theme for late-night training sessions",
    primary: "#111827", // gray-900
    secondary: "#1f2937", // gray-800
    accent: "#7c3aed", // violet-600
    primaryRgb: "17, 24, 39",
    secondaryRgb: "31, 41, 55",
    accentRgb: "124, 58, 237",
    preview: "midnightGym"
  },
  energy: {
    name: "Energy",
    isPremium: true,
    description: "High-energy colors to fuel your workouts",
    primary: "#f59e0b", // amber-500
    secondary: "#ef4444", // red-500
    accent: "#8b5cf6", // violet-500
    primaryRgb: "245, 158, 11",
    secondaryRgb: "239, 68, 68",
    accentRgb: "139, 92, 246",
    preview: "energy"
  },
  recovery: {
    name: "Recovery",
    isPremium: true,
    description: "Soft, healing colors for rest and recovery days",
    primary: "#6366f1", // indigo-500
    secondary: "#8b5cf6", // violet-500
    accent: "#a78bfa", // violet-400
    primaryRgb: "99, 102, 241",
    secondaryRgb: "139, 92, 246",
    accentRgb: "167, 139, 250",
    preview: "recovery"
  }
};

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark"); // Default to dark for fitness vibe
  const [premiumTheme, setPremiumTheme] = useState("default");
  const [unlockedThemes, setUnlockedThemes] = useState(["default"]);
  const [loading, setLoading] = useState(true);

  // Immediately apply dark mode on mount for non-logged-in users
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // For non-logged-in users, immediately apply dark mode
      const root = window.document.documentElement;
      root.classList.remove("light");
      root.classList.add("dark");
    }
  }, []);
  
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
        const response = await fetchWithTokenRefresh("/user/themes/premium", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ 
            theme_key: targetTheme
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
    const token = localStorage.getItem("token");
    
    if (!token) {
      // Set default theme when not logged in
      setTheme("dark");
      setPremiumTheme("default");
      setUnlockedThemes(["default"]);
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
          
          // Get theme settings from backend
          const backendThemeMode = data.theme || "dark";
          const backendPremiumTheme = data.premium_theme || "default";
          const backendUnlockedThemes = data.unlocked_themes || ["default"];
          
          // Set the state with backend data
          setTheme(backendThemeMode);
          setPremiumTheme(backendPremiumTheme);
          setUnlockedThemes(backendUnlockedThemes);
          
          // Apply the theme immediately
          const root = window.document.documentElement;
          root.classList.remove("light", "dark");
          root.classList.add(backendThemeMode);
          
          const currentTheme = premiumThemes[backendPremiumTheme] || premiumThemes.default;
          root.style.setProperty('--color-primary', currentTheme.primary);
          root.style.setProperty('--color-secondary', currentTheme.secondary);
          root.style.setProperty('--color-accent', currentTheme.accent);
          root.style.setProperty('--color-primary-rgb', currentTheme.primaryRgb);
          root.style.setProperty('--color-secondary-rgb', currentTheme.secondaryRgb);
          root.style.setProperty('--color-accent-rgb', currentTheme.accentRgb);
          
          console.log("Theme settings loaded from backend:", {
            mode: backendThemeMode,
            premiumTheme: backendPremiumTheme,
            unlockedThemes: backendUnlockedThemes
          });
        } else {
          // If API fails, use defaults
          setTheme("dark");
          setPremiumTheme("default");
          setUnlockedThemes(["default"]);
        }
      } catch (err) {
        console.error("Error fetching theme settings:", err);
        // Use defaults
        setTheme("dark");
        setPremiumTheme("default");
        setUnlockedThemes(["default"]);
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

  // Add token change listener
  useEffect(() => {
    const handleTokenChange = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        // Reset to defaults when logged out
        setTheme("dark");
        setPremiumTheme("default");
        setUnlockedThemes(["default"]);
        
        // Apply default theme
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add("dark");
        
        const defaultTheme = premiumThemes.default;
        root.style.setProperty('--color-primary', defaultTheme.primary);
        root.style.setProperty('--color-secondary', defaultTheme.secondary);
        root.style.setProperty('--color-accent', defaultTheme.accent);
        root.style.setProperty('--color-primary-rgb', defaultTheme.primaryRgb);
        root.style.setProperty('--color-secondary-rgb', defaultTheme.secondaryRgb);
        root.style.setProperty('--color-accent-rgb', defaultTheme.accentRgb);
      } else {
        // Fetch new user's theme settings when logged in
        const fetchThemeSettings = async () => {
          try {
            setLoading(true);
            const response = await fetchWithTokenRefresh("/user/themes");
            
            if (response.ok) {
              const data = await response.json();
              
              // Get theme settings from backend
              const backendThemeMode = data.theme || "dark";
              const backendPremiumTheme = data.premium_theme || "default";
              const backendUnlockedThemes = data.unlocked_themes || ["default"];
              
              // Set the state with backend data
              setTheme(backendThemeMode);
              setPremiumTheme(backendPremiumTheme);
              setUnlockedThemes(backendUnlockedThemes);
              
              // Apply the theme immediately
              const root = window.document.documentElement;
              root.classList.remove("light", "dark");
              root.classList.add(backendThemeMode);
              
              const currentTheme = premiumThemes[backendPremiumTheme] || premiumThemes.default;
              root.style.setProperty('--color-primary', currentTheme.primary);
              root.style.setProperty('--color-secondary', currentTheme.secondary);
              root.style.setProperty('--color-accent', currentTheme.accent);
              root.style.setProperty('--color-primary-rgb', currentTheme.primaryRgb);
              root.style.setProperty('--color-secondary-rgb', currentTheme.secondaryRgb);
              root.style.setProperty('--color-accent-rgb', currentTheme.accentRgb);
            }
          } catch (err) {
            console.error("Error fetching theme settings:", err);
            // Reset to defaults on error
            setTheme("dark");
            setPremiumTheme("default");
            setUnlockedThemes(["default"]);
          } finally {
            setLoading(false);
          }
        };
        
        fetchThemeSettings();
      }
    };

    // Listen for storage events to detect token changes
    window.addEventListener('storage', handleTokenChange);
    
    // Also run once on mount
    handleTokenChange();
    
    return () => {
      window.removeEventListener('storage', handleTokenChange);
    };
  }, []);

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
          
          // Apply the theme immediately after successful backend update
          const currentTheme = premiumThemes[themeKey] || premiumThemes.default;
          const root = window.document.documentElement;
          root.style.setProperty('--color-primary', currentTheme.primary);
          root.style.setProperty('--color-secondary', currentTheme.secondary);
          root.style.setProperty('--color-accent', currentTheme.accent);
          root.style.setProperty('--color-primary-rgb', currentTheme.primaryRgb);
          root.style.setProperty('--color-secondary-rgb', currentTheme.secondaryRgb);
          root.style.setProperty('--color-accent-rgb', currentTheme.accentRgb);
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

  // Function to toggle theme mode
  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme); // Update local state immediately
    
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
        } else {
          // Apply the theme immediately after successful backend update
          const root = window.document.documentElement;
          root.classList.remove("light", "dark");
          root.classList.add(newTheme);
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
          await fetchWithTokenRefresh("/user/themes/premium", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
              theme_key: "default"
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
    // Clear all theme-related items from localStorage
    localStorage.removeItem("theme");
    localStorage.removeItem("premiumTheme");
    localStorage.removeItem("unlockedThemes");
    
    // Reset to defaults
    setTheme("dark");
    setPremiumTheme("default");
    setUnlockedThemes(["default"]);
    
    // Apply default theme immediately
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add("dark");
    
    // Reset CSS variables to default theme
    const defaultTheme = premiumThemes.default;
    root.style.setProperty('--color-primary', defaultTheme.primary);
    root.style.setProperty('--color-secondary', defaultTheme.secondary);
    root.style.setProperty('--color-accent', defaultTheme.accent);
    root.style.setProperty('--color-primary-rgb', defaultTheme.primaryRgb);
    root.style.setProperty('--color-secondary-rgb', defaultTheme.secondaryRgb);
    root.style.setProperty('--color-accent-rgb', defaultTheme.accentRgb);
    
    console.log("Theme settings reset to defaults");
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setThemeMode,
        premiumTheme,
        changePremiumTheme,
        unlockedThemes,
        premiumThemes,
        isAdmin,
        loading,
        applyTheme,
        synchronizeThemes,
        checkThemeAccess,
        clearThemeStorage,
        unlockTheme,
        unlockAllThemes
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
