import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash, FaSave, FaTimes, FaUser, FaBell, FaLanguage, FaPalette, FaCrown, FaShieldAlt, FaClock, FaTachometerAlt, FaBolt } from "react-icons/fa";
import { getTranslation } from "../utils/translations";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme, premiumThemes } from "../hooks/useTheme";
import SessionsManager from "../components/SessionsManager";
import axios from "axios";
import { toast } from "react-hot-toast";
import { BiPalette, BiColorFill, BiGlobe, BiBell, BiUser, BiDevices } from "react-icons/bi";
import { useTranslation } from "react-i18next";
import { BsCheck2 } from "react-icons/bs";
import { FaPlay } from "react-icons/fa";
import "../styles/theme-animations.css";  // Import the animations CSS

// Import custom emoji assets - SVG placeholders
// These could be replaced with actual emojis downloaded from slackmojis.com
import dumbbellEmoji from '../assets/emojis/dumbbell.svg';
import proteinEmoji from '../assets/emojis/protein.svg';

// Import downloaded emoji from Slackmojis
import yayEmoji from '../assets/emojis/downloads/yay.gif';
import coolEmoji from '../assets/emojis/downloads/cool-doge.gif';
import typingEmoji from '../assets/emojis/downloads/typingcat.gif';

const backendURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Define custom emojis
// To add more emojis from Slackmojis.com:
// 1. Visit https://slackmojis.com/ and find emojis you like
// 2. Download them (right-click on emoji and "Save Image As...")
// 3. Save them to frontend/src/assets/emojis/downloads folder
// 4. Import them at the top of this file
// 5. Add them to this list with a unique ID
const customEmojis = {
  fitness: [
    { id: 'dumbbell', src: dumbbellEmoji, alt: 'Dumbbell Emoji' },
    { id: 'protein', src: proteinEmoji, alt: 'Protein Shake Emoji' },
    { id: 'yay', src: yayEmoji, alt: 'Yay Emoji' },
    { id: 'cool', src: coolEmoji, alt: 'Cool Emoji' },
    { id: 'typing', src: typingEmoji, alt: 'Typing Emoji' },
    // Add downloaded emojis from Slackmojis.com here following this format:
    // { id: 'unique-id', src: importedEmojiVariable, alt: 'Description' },
  ]
};

// Custom event for notifying other components about card color changes
export const notifyCardColorChanged = (useCustomColor, color) => {
  const event = new CustomEvent('cardColorChanged', { 
    detail: { 
      useCustomColor, 
      color 
    } 
  });
  window.dispatchEvent(event);
};

function Settings() {
  const navigate = useNavigate();
  const { language, changeLanguage, t } = useLanguage();
  const { 
    theme, 
    toggleTheme, 
    setThemeMode, 
    premiumTheme, 
    changePremiumTheme, 
    unlockedThemes,
    isAdmin,
    loading,
    applyTheme
  } = useTheme();
  
  const { i18n } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [activeTab, setActiveTab] = useState(window.location.hash.substring(1) || "appearance");
  const [userPreferences, setUserPreferences] = useState({
    language: i18n.language,
    emailNotifications: true,
    pushNotifications: false,
    useCustomCardColor: false,
    cardColor: "#3b82f6",
    premiumTheme: "default",
    enableAnimations: false,
    animationStyle: "subtle",
    animationSpeed: "medium",
    showProfileEmoji: true,
    profileEmoji: "🏋️‍♂️",
    emojiAnimation: "lift",
    customEmojiSrc: null,
    favoriteEmojis: ["🏋️‍♂️", "💪", "🏃‍♂️", "🏃‍♀️", "🚴", "🏊‍♂️"], // Default favorite emojis
    favoriteAnimations: ["lift", "bounce", "pulse"] // Default favorite animations
  });
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [showColorOptions, setShowColorOptions] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState('faces');
  const [emojiChanged, setEmojiChanged] = useState(false);

  // Replace the local applyTheme function with a wrapper that uses the useTheme hook's applyTheme
  const handleApplyTheme = async (themeKey) => {
    try {
      const success = await applyTheme(themeKey); // Use the one from the hook
      if (success) {
        setSuccess(`Applied ${premiumThemes[themeKey].name} theme`);
      } else {
        setError("Failed to apply theme. It may not be unlocked yet.");
      }
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
    } catch (error) {
      console.error("Error applying theme:", error);
      setError("There was an error applying the theme.");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Update the useEffect to use our new handleApplyTheme function 
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const themeParam = urlParams.get('theme');
    
    if (themeParam && !loading && premiumThemes[themeParam]) {
      // If we have a theme parameter and it's a valid theme, try to apply it
      setActiveTab("appearance");
      setTimeout(() => {
        handleApplyTheme(themeParam);
        
        // Remove the theme parameter from URL without page reload
        const newUrl = window.location.pathname + 
          window.location.search.replace(/[?&]theme=[^&]+/, '');
        window.history.replaceState({}, '', newUrl);
      }, 500);
    }
    
    // Check if we need to scroll to the emoji section
    const tabParam = urlParams.get('tab');
    if (tabParam === 'appearance') {
      setActiveTab("appearance");
      
      // After a short delay, scroll to the emoji section
      setTimeout(() => {
        const emojiSection = document.getElementById('emoji-preferences-section');
        if (emojiSection) {
          emojiSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 600);
    }
  }, [loading, navigate, premiumThemes, applyTheme]);

  // Apply language to the document
  useEffect(() => {
    document.documentElement.lang = userPreferences.language;
  }, [userPreferences.language]);

  useEffect(() => {
    // Fetch user preferences when component mounts
    const fetchUserPreferences = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(`${backendURL}/user-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData.preferences) {
            setUserPreferences({
              emailNotifications: userData.preferences.email_notifications || false,
              workoutReminders: userData.preferences.workout_reminders || false,
              progressReports: userData.preferences.progress_reports || false,
              language: userData.preferences.language || "en",
              summary_frequency: userData.preferences.summary_frequency || "weekly",
              summary_day: userData.preferences.summary_day || "monday",
              useCustomCardColor: userData.preferences.use_custom_card_color || false,
              cardColor: userData.preferences.card_color || "#f0f4ff",
              showProfileEmoji: userData.preferences.show_profile_emoji || true,
              profileEmoji: userData.preferences.profile_emoji || "🏋️‍♂️",
              emojiAnimation: userData.preferences.emoji_animation || "lift",
              enableAnimations: userData.preferences.enable_animations || false,
              animationStyle: userData.preferences.animation_style || "subtle",
              animationSpeed: userData.preferences.animation_speed || "medium",
              customEmojiSrc: userData.preferences.custom_emoji_src || null,
              favoriteEmojis: userData.preferences.favorite_emojis || ["🏋️‍♂️", "💪", "🏃‍♂️", "🏃‍♀️", "🚴", "🏊‍♂️"],
              favoriteAnimations: userData.preferences.favorite_animations || ["lift", "bounce", "pulse"]
            });
          }
          // Add the username
          if (userData.username) {
            setUsername(userData.username);
          }
        }
      } catch (err) {
        console.error("Error fetching user preferences:", err);
      }
    };

    fetchUserPreferences();
  }, [navigate]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (newPassword.length < 8) {
      setError(t("passwordTooShort"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      return;
    }

    if (newPassword === currentPassword) {
      setError(t("newPasswordMustBeDifferent"));
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendURL}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(t("passwordChanged"));
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        
        // Reset password field visibility
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        
        // Display a success message that automatically dismisses after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        setError(data.detail || t("failedToChangePassword"));
      }
    } catch (err) {
      setError(t("somethingWentWrong"));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = async (key, value) => {
    if (key === 'language') {
      const success = await changeLanguage(value);
      if (success) {
        setUserPreferences(prev => ({
          ...prev,
          language: value
        }));
      }
      return;
    }
    
    // Mark emoji settings as changed if related to emojis
    if (['showProfileEmoji', 'profileEmoji', 'emojiAnimation', 'customEmojiSrc'].includes(key)) {
      setEmojiChanged(true);
    }
    
    setUserPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const savePreferences = async (currentTab) => {
    setIsSavingPreferences(true);
    
    // Reset emoji changed flag when saving
    if (currentTab === "appearance") {
      setEmojiChanged(false);
    }
    
    try {
      // Transform preferences to backend format
      const backendPreferences = {
          email_notifications: userPreferences.emailNotifications,
          workout_reminders: userPreferences.workoutReminders,
          progress_reports: userPreferences.progressReports,
          language: userPreferences.language,
          summary_frequency: userPreferences.summary_frequency,
          summary_day: userPreferences.summary_day,
          use_custom_card_color: userPreferences.useCustomCardColor,
          card_color: userPreferences.cardColor,
          show_profile_emoji: userPreferences.showProfileEmoji,
          profile_emoji: userPreferences.profileEmoji,
          emoji_animation: userPreferences.emojiAnimation,
          enable_animations: userPreferences.enableAnimations,
          animation_style: userPreferences.animationStyle,
          animation_speed: userPreferences.animationSpeed,
          custom_emoji_src: userPreferences.customEmojiSrc,
          favorite_emojis: userPreferences.favoriteEmojis,
          favorite_animations: userPreferences.favoriteAnimations
      };
      
      console.log("Saving preferences:", backendPreferences);
      
      // Also save emoji preferences to localStorage as a backup
      if (currentTab === "appearance") {
        try {
          const emojiPrefsObj = {
            show: userPreferences.showProfileEmoji,
            emoji: userPreferences.profileEmoji,
            animation: userPreferences.emojiAnimation,
            customEmojiSrc: userPreferences.customEmojiSrc
          };
          localStorage.setItem("emoji_prefs", JSON.stringify(emojiPrefsObj));
          console.log("Emoji preferences saved to localStorage:", emojiPrefsObj);
        } catch (e) {
          console.warn("Could not save emoji preferences to localStorage:", e);
        }
      }
      
      const token = localStorage.getItem("token");
      console.log("Using token for API call:", token ? "Valid token" : "No token");
      
      const response = await fetch(`${backendURL}/user/settings`, {
        method: "PATCH",  // Changed from PUT to PATCH to match Profile.jsx
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(backendPreferences),
      });

      console.log("API Response status:", response.status);
      
      if (response.ok) {
        // Always dispatch a preferences-change event when preferences are saved successfully,
        // so all components can update accordingly
        const preferenceEvent = new CustomEvent('preferences-change', {
          detail: {
            type: 'general',
            preferences: userPreferences
          }
        });
        window.dispatchEvent(preferenceEvent);
        console.log("Dispatched general preferences-change event");
        
        // If we have emoji changes, also dispatch specific emoji event for immediate UI update
        if (currentTab === "appearance") {
          const emojiEvent = new CustomEvent('preferences-change', {
            detail: {
              type: 'emoji',
              show: userPreferences.showProfileEmoji,
              emoji: userPreferences.profileEmoji,
              animation: userPreferences.emojiAnimation,
              customEmojiSrc: userPreferences.customEmojiSrc
            }
          });
          window.dispatchEvent(emojiEvent);
          console.log("Dispatched emoji preferences-change event:", {
            show: userPreferences.showProfileEmoji,
            emoji: userPreferences.profileEmoji,
            animation: userPreferences.emojiAnimation,
            customEmojiSrc: userPreferences.customEmojiSrc
          });
        }
        
        if (currentTab) {
          // Update the tab-specific toast message
          switch (currentTab) {
            case "appearance":
              toast.success(t("appearancePreferencesSaved"));
              // Show special toast for emoji changes if they were changed
              if (emojiChanged) {
                toast.success(t("emojiSaved"), { 
                  icon: userPreferences.profileEmoji || '👍',
                  duration: 3000,
                  style: {
                    borderRadius: '10px',
                    background: '#4CAF50',
                    color: '#fff',
                  },
                });
              }
              break;
            case "colorappearance":
              toast.success(t("colorAppearancePreferencesSaved"));
              // When animation settings are saved, dispatch custom event for other components to listen
              if (userPreferences.enableAnimations !== undefined) {
                const { enableAnimations, animationStyle, animationSpeed } = userPreferences;
                
                // Notify other components (like Profile) about animation preference changes
                const event = new CustomEvent('animationPreferencesChanged', { 
                  detail: { 
                    enabled: enableAnimations, 
                    style: animationStyle, 
                    speed: animationSpeed 
                  } 
                });
                window.dispatchEvent(event);
              }
              break;
            case "language":
              toast.success(t("languagePreferencesSaved"));
              break;
            case "notifications":
              toast.success(t("notificationPreferencesSaved"));
              break;
            case "account":
              toast.success(t("accountPreferencesSaved"));
              break;
            case "sessions":
              toast.success(t("sessionsPreferencesSaved"));
              break;
            default:
              toast.success(t("preferencesSaved"));
          }
        }
        
        // If there was a function to update user prefs in context, we'd call it here
        // For now, we'll just log that preferences were saved
        console.log("Preferences saved successfully", userPreferences);
      } else {
        // Handle error response
        try {
          const errorData = await response.json();
          console.error("Error saving preferences:", errorData);
          toast.error(errorData.detail || t("errorSavingPreferences"));
        } catch (e) {
          console.error("Error parsing error response:", e);
          console.error("Response status:", response.status, response.statusText);
          toast.error(`${response.status}: ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error(error.message || t("errorSavingPreferences"));
    } finally {
      setIsSavingPreferences(false);
    }
  };

  // Toggle custom card color
  const toggleCustomCardColor = (checked) => {
    console.log("Toggling custom card color to:", checked);
    
    setUserPreferences(prev => ({
      ...prev,
      useCustomCardColor: checked
    }));
  };

  // Add a handler for the color change
  const handleColorChange = (newColor) => {
    console.log("Color changed to:", newColor);
    
    setUserPreferences(prev => ({
      ...prev,
      cardColor: newColor
    }));
  };

  const renderTabButton = (tabName, label, icon) => {
  return (
                <button
        onClick={() => setActiveTab(tabName)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
          activeTab === tabName 
            ? "bg-primary/10 dark:bg-primary/20 text-primary" 
            : "hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        {icon}
        <span>{label}</span>
                </button>
    );
  };

  // Apply animation settings to the body element
  const applyAnimationSettings = (enabled, style, speed) => {
    const body = document.body;
    
    console.log("Applying animation settings:", enabled, style, speed);
    
    // Set animation enabled state
    if (enabled) {
      body.setAttribute('data-animations-enabled', 'true');
      body.setAttribute('data-animation-style', style || 'subtle');
      body.setAttribute('data-animation-speed', speed || 'medium');
      
      // Try to apply to profile card directly if it exists on the page
      const profileCards = document.querySelectorAll('.profile-header-card');
      profileCards.forEach(card => {
        // Remove all animation classes first
        card.classList.remove('profile-animation');
        ['subtle', 'bounce', 'pulse', 'wave', 'glide', 'sparkle', 'pop', 'swing', 'ripple',
         'float', 'rotate', 'spin', 'shake', 'wobble'].forEach(s => 
          card.classList.remove(s));
        ['slow', 'medium', 'fast'].forEach(s => 
          card.classList.remove(s));
        
        // Apply new classes
        card.classList.add('profile-animation');
        card.classList.add(style || 'subtle');
        card.classList.add(speed || 'medium');
        
        // Set animation duration
        card.style.setProperty('--animation-duration', 
          speed === "slow" ? "4s" : 
          speed === "fast" ? "1.5s" : "2.5s");
      });
    } else {
      body.removeAttribute('data-animations-enabled');
      body.removeAttribute('data-animation-style');
      body.removeAttribute('data-animation-speed');
      
      // Disable animations on profile cards if they exist
      const profileCards = document.querySelectorAll('.profile-header-card');
      profileCards.forEach(card => {
        card.classList.remove('profile-animation');
        // Remove all possible animation styles
        ['subtle', 'bounce', 'pulse', 'wave', 'glide', 'sparkle', 'pop', 'swing', 'ripple',
         'float', 'rotate', 'spin', 'shake', 'wobble'].forEach(s => 
          card.classList.remove(s));
        // Remove all possible speeds
        ['slow', 'medium', 'fast'].forEach(s => 
          card.classList.remove(s));
      });
    }
    
    // Update global animation state that can be used anywhere in the app
    window.FitExplorerAnimations = {
      enabled: enabled,
      style: style || 'subtle',
      speed: speed || 'medium'
    };
    
    // Notify other components (like Profile) about animation preference changes
    const event = new CustomEvent('animationPreferencesChanged', { 
      detail: { 
        enabled, 
        style, 
        speed 
      } 
    });
    console.log("Dispatching animationPreferencesChanged event", { enabled, style, speed });
    window.dispatchEvent(event);
  };

  // Also apply animation settings when they change
  useEffect(() => {
    if (userPreferences) {
      console.log("Initial animation settings being applied:", {
        enable: userPreferences.enableAnimations,
        style: userPreferences.animationStyle,
        speed: userPreferences.animationSpeed
      });
      
      applyAnimationSettings(
        userPreferences.enableAnimations,
        userPreferences.animationStyle,
        userPreferences.animationSpeed
      );
    }
  }, [
    userPreferences.enableAnimations,
    userPreferences.animationStyle,
    userPreferences.animationSpeed
  ]);

  // Get display username with fallback
  const displayUsername = username || "User";

  const getEmojisForCategory = () => {
    // For standard Unicode emojis
    const emojis = {
      faces: ["😀", "😎", "🤩", "😍", "🥳", "😊", "🤓", "🥸", "🤪", "🤗", "😏", "😇", "🤠", "🥺", "😁", "🤯", "🧠", "🦾", "👑", "✌️"],
      fitness: ["💪", "🏋️‍♂️", "🏋️‍♀️", "🏃‍♂️", "🏃‍♀️", "🧘‍♂️", "🧘‍♀️", "🤸‍♂️", "🤸‍♀️", "🦾", "🦵", "🦿", "👊", "✊", "🤛", "🤜", "👏", "🧍‍♂️", "🧎‍♂️", "🧠"],
      nutrition: ["🥗", "🥦", "🍗", "🥚", "🍌", "🥛", "🧃", "🥤", "🍲", "🥩", "🍓", "🥑", "🌰", "🥕", "⚖️", "🥜", "🍇", "💊", "💉", "🧬"],
      activities: ["🏋️‍♂️", "🧘‍♀️", "🏃‍♂️", "🤸‍♀️", "🚴‍♂️", "🏊‍♀️", "⚽", "🏀", "🎾", "🏈", "🏄‍♂️", "🧗‍♀️", "🏌️‍♂️", "🤺", "⛹️‍♀️", "🤾‍♂️", "🏂", "🏆", "🥇", "⛳"],
      animals: ["🐱", "🐶", "🦁", "🦊", "🐻", "🐨", "🦄", "🦋", "🦖", "🐙", "🦈", "🐉", "🐬", "🦜", "🦢", "🐘", "🦔", "🐅", "🦩", "🦦"],
      objects: ["🔥", "✨", "💯", "🏆", "🎯", "💡", "🥇", "🌟", "💪", "👊", "🚀", "📊", "📈", "⏱️", "⏲️", "🧮", "🔋", "🧲", "💎", "🛡️"]
    };
    
    // If the category is for custom emojis, return those instead
    if (emojiCategory === 'custom') {
      return customEmojis.fitness || [];
    }
    
    return emojis[emojiCategory] || [];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t("settings")}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
        {/* Sidebar Navigation */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm flex flex-col gap-2">
          {renderTabButton("appearance", t("appearance"), <BiPalette className="text-xl" />)}
          {renderTabButton("colorappearance", t("colorAppearance"), <BiColorFill className="text-xl" />)}
          {renderTabButton("language", t("language"), <BiGlobe className="text-xl" />)}
          {renderTabButton("notifications", t("notifications"), <BiBell className="text-xl" />)}
          {renderTabButton("account", t("changePassword"), <BiUser className="text-xl" />)}
          {renderTabButton("sessions", t("sessions"), <BiDevices className="text-xl" />)}
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
            {/* Error and Success Messages */}
            {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg">
                {error}
            </div>
            )}
            {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-200 text-green-700 rounded-lg">
                {success}
            </div>
            )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">{t("appearance")}</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">{t("theme")}</label>
                <div className="flex gap-3">
                      <button
                    onClick={() => setThemeMode("light")}
                    className={`px-4 py-2 rounded-lg border ${
                      theme === "light"
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    {t("light")}
                  </button>
                  <button
                    onClick={() => setThemeMode("dark")}
                    className={`px-4 py-2 rounded-lg border ${
                      theme === "dark"
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    {t("dark")}
                  </button>
                  <button
                    onClick={() => setThemeMode("system")}
                    className={`px-4 py-2 rounded-lg border ${
                      theme === "system"
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    {t("system")}
                  </button>
                </div>
              </div>

              {/* Emoji preferences */}
              <div className="mt-6 border-t pt-6 dark:border-gray-700" id="emoji-preferences-section">
                <h3 className="text-lg font-medium mb-4">{t("emojiPreferences")}</h3>
                
                {/* Show profile emoji toggle */}
                <div className="mb-4">
                  <label className="flex items-center">
                      <input
                      type="checkbox"
                      checked={userPreferences.showProfileEmoji}
                      onChange={(e) => handlePreferenceChange("showProfileEmoji", e.target.checked)}
                      className="form-checkbox rounded text-primary"
                    />
                    <span className="ml-2">{t("showEmojiNextToUsername")}</span>
                  </label>
                </div>
                
                {/* Emoji selection */}
                {userPreferences.showProfileEmoji && (
                  <>
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-2">{t("selectEmoji")}</label>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        {/* Emoji categories */}
                        <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700 flex space-x-2 overflow-x-auto">
                          <button
                            onClick={() => setEmojiCategory('fitness')}
                            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                              emojiCategory === 'fitness' 
                                ? 'bg-primary text-white' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            💪 {t("fitness")}
                          </button>
                          <button 
                            onClick={() => setEmojiCategory('custom')}
                            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                              emojiCategory === 'custom' 
                                ? 'bg-primary text-white' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            🎨 {t("custom")}
                          </button>
                          <button 
                            onClick={() => setEmojiCategory('nutrition')}
                            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                              emojiCategory === 'nutrition' 
                                ? 'bg-primary text-white' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            🥗 {t("nutrition")}
                          </button>
                          <button 
                            onClick={() => setEmojiCategory('faces')}
                            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                              emojiCategory === 'faces' 
                                ? 'bg-primary text-white' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            😀 {t("faces")}
                          </button>
                          <button 
                            onClick={() => setEmojiCategory('activities')}
                            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                              emojiCategory === 'activities' 
                                ? 'bg-primary text-white' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            🏃‍♂️ {t("activities")}
                          </button>
                          <button 
                            onClick={() => setEmojiCategory('animals')}
                            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                              emojiCategory === 'animals' 
                                ? 'bg-primary text-white' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            🐱 {t("animals")}
                          </button>
                          <button 
                            onClick={() => setEmojiCategory('objects')}
                            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                              emojiCategory === 'objects' 
                                ? 'bg-primary text-white' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            🔥 {t("objects")}
                          </button>
                        </div>
                        
                        {emojiCategory === 'custom' && (
                          <div className="mb-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                            <p>These are custom emoji examples. You can download more from <a href="https://slackmojis.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Slackmojis.com</a> and add them to your app.</p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-8 gap-2 max-h-40 overflow-y-auto p-2">
                          {getEmojisForCategory().map((emoji) => (
                            <button
                              key={typeof emoji === 'string' ? emoji : emoji.id}
                              onClick={() => {
                                // Handle both Unicode emojis and custom emojis
                                if (typeof emoji === 'string') {
                                  console.log("Selected standard emoji:", emoji);
                                  handlePreferenceChange("profileEmoji", emoji);
                                } else {
                                  console.log("Selected custom emoji:", emoji.id, emoji.src);
                                  handlePreferenceChange("profileEmoji", `custom:${emoji.id}`);
                                  handlePreferenceChange("customEmojiSrc", emoji.src);
                                }
                              }}
                              className={`text-2xl p-2 rounded-lg transition-all ${
                                userPreferences.profileEmoji === (typeof emoji === 'string' ? emoji : `custom:${emoji.id}`)
                                  ? "bg-primary/10 border border-primary shadow-inner"
                                  : "border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                              }`}
                            >
                              {typeof emoji === 'string' 
                                ? emoji 
                                : <img src={emoji.src} alt={emoji.alt} className="w-full h-full object-contain" />
                              }
                            </button>
                          ))}
                        </div>

                        {/* Animation style for emoji */}
                        <div className="mt-4">
                          <div className="text-sm font-medium mb-2">{t("emojiAnimation")}</div>
                          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                            {["none", "bounce", "pulse", "spin", "float", "shake", "tada"].map((animation) => (
                              <button
                                key={animation}
                                onClick={() => handlePreferenceChange("emojiAnimation", animation)}
                                className={`px-2 py-1.5 rounded-lg border text-xs capitalize transition-all ${
                                  userPreferences.emojiAnimation === animation
                                    ? "bg-primary/10 border-primary text-primary"
                                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                }`}
                              >
                                <div className="flex flex-col items-center">
                                  <span className={`text-xl mb-1 ${animation !== "none" ? `animate-${animation}` : ""}`}>
                                    {userPreferences.profileEmoji && userPreferences.profileEmoji.startsWith('custom:') 
                                      ? <img 
                                          src={userPreferences.customEmojiSrc} 
                                          alt="Custom emoji" 
                                          className="w-6 h-6 object-contain" 
                                        />
                                      : userPreferences.profileEmoji
                                    }
                                  </span>
                                  <span>{animation}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Emoji preview */}
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t("preview")}:</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 rounded shadow-sm">
                              <span className={`text-xl ${userPreferences.emojiAnimation !== "none" ? `animate-${userPreferences.emojiAnimation}` : ""}`}>
                                {userPreferences.profileEmoji && userPreferences.profileEmoji.startsWith('custom:') 
                                  ? <img 
                                      src={userPreferences.customEmojiSrc} 
                                      alt="Custom emoji" 
                                      className="w-6 h-6 object-contain" 
                                    />
                                  : userPreferences.profileEmoji
                                }
                              </span>
                              <span className="font-medium">{displayUsername}</span>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {userPreferences.emojiAnimation !== "none" ? 
                                <span>{t("animationActive")}: <span className="font-medium">{userPreferences.emojiAnimation}</span></span> : 
                                <span>{t("noAnimation")}</span>
                              }
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-amber-600 dark:text-amber-400 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Don't forget to click "Save Changes" button below to save your emoji selection permanently.</span>
                          </div>
                        </div>

                        {/* Favorite Emojis Management - outside the conditional rendering */}
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium">Favorite Emojis for Dropdown</h4>
                            <span className="text-xs text-gray-500">Max 8</span>
                          </div>
                          
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                            These emojis will appear in your quick-access dropdown in the navbar
                          </p>
                          
                          {/* Display and manage current favorites */}
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            <div className="mb-2 font-medium text-xs">Current Favorites:</div>
                            <div className="flex flex-wrap gap-2">
                              {userPreferences.favoriteEmojis.map((emoji, index) => (
                                <div 
                                  key={index} 
                                  className="relative group p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                                >
                                  <span className="text-xl">{emoji}</span>
                                  <button
                                    onClick={() => {
                                      const updatedFavorites = userPreferences.favoriteEmojis.filter((_, i) => i !== index);
                                      handlePreferenceChange("favoriteEmojis", updatedFavorites);
                                      setEmojiChanged(true);
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Remove from favorites"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                              
                              {/* Add button if we have less than 8 favorites */}
                              {userPreferences.favoriteEmojis.length < 8 && (
                                <button
                                  onClick={() => {
                                    // If current emoji isn't already in favorites, add it
                                    if (!userPreferences.favoriteEmojis.includes(userPreferences.profileEmoji)) {
                                      const newFavorites = [...userPreferences.favoriteEmojis, userPreferences.profileEmoji];
                                      handlePreferenceChange("favoriteEmojis", newFavorites);
                                      setEmojiChanged(true);
                                    } else {
                                      toast.error("This emoji is already in your favorites");
                                    }
                                  }}
                                  className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg border border-dashed border-gray-300 dark:border-gray-500 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                                  title="Add current emoji to favorites"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Favorite Animation Styles */}
                          <div className="mt-5">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-medium">Favorite Animation Styles</h4>
                              <span className="text-xs text-gray-500">Max 5</span>
                            </div>
                            
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                              These animation styles will appear in your quick-access dropdown
                            </p>
                            
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                              <div className="mb-2 font-medium text-xs">Current Favorites:</div>
                              <div className="flex flex-wrap gap-2">
                                {userPreferences.favoriteAnimations.map((animation, index) => (
                                  <div 
                                    key={index} 
                                    className="relative group p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                                  >
                                    <span className="text-sm capitalize">{animation}</span>
                                    <button
                                      onClick={() => {
                                        const updatedFavorites = userPreferences.favoriteAnimations.filter((_, i) => i !== index);
                                        handlePreferenceChange("favoriteAnimations", updatedFavorites);
                                        setEmojiChanged(true);
                                      }}
                                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                      title="Remove from favorites"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                                
                                {/* Add button if we have less than 5 favorites */}
                                {userPreferences.favoriteAnimations.length < 5 && (
                                  <button
                                    onClick={() => {
                                      // If current animation isn't already in favorites, add it
                                      if (!userPreferences.favoriteAnimations.includes(userPreferences.emojiAnimation)) {
                                        const newFavorites = [...userPreferences.favoriteAnimations, userPreferences.emojiAnimation];
                                        handlePreferenceChange("favoriteAnimations", newFavorites);
                                        setEmojiChanged(true);
                                      } else {
                                        toast.error("This animation is already in your favorites");
                                      }
                                    }}
                                    className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg border border-dashed border-gray-300 dark:border-gray-500 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                                    title="Add current animation to favorites"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => {
                      console.log("Saving emoji preferences:", {
                        showProfileEmoji: userPreferences.showProfileEmoji,
                        profileEmoji: userPreferences.profileEmoji,
                        emojiAnimation: userPreferences.emojiAnimation,
                        customEmojiSrc: userPreferences.customEmojiSrc
                      });
                      savePreferences("appearance");
                    }}
                    disabled={isLoading || isSavingPreferences}
                    className={`px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 ${
                      emojiChanged 
                      ? "bg-primary text-white border-2 border-primary/50 shadow-md animate-pulse" 
                      : "bg-primary text-white"
                    }`}
                  >
                    {isSavingPreferences ? (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t("saving")}
                      </span>
                    ) : (
                      t("saveChanges")
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
           

          {/* Color Appearance Tab */}
          {activeTab === "colorappearance" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">{t("colorAppearance")}</h2>
              
              {/* Premium Themes Section */}
              <div className="border-gray-200 dark:border-gray-700 pt-2">
                <div className="flex items-center mb-4">
                  <h3 className="text-lg font-medium">{t("premiumThemes")}</h3>
                  <div className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <FaCrown className="w-3 h-3 mr-1" />
                    {t("premium")}
                    </div>
                  {isAdmin && (
                    <div className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      {t("admin")}
                    </div>
                  )}
                  </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  {t("premiumThemesDescription")}
                  {isAdmin ? (
                    <span className="block mt-2 text-purple-600 dark:text-purple-400">
                      {t("adminThemesAccess")}
                    </span>
                  ) : (
                    unlockedThemes.filter(t => premiumThemes[t]?.isPremium).length === 0 && (
                      <span className="block mt-2 text-amber-600 dark:text-amber-400">
                        <FaLock className="inline-block mr-1" size={12} />
                        {t("unlockPremiumThemes")}
                      </span>
                    )
                  )}
                </p>
                
                {/* Premium Theme Selection Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.keys(premiumThemes).map(themeKey => (
                    <div 
                      key={themeKey}
                      className={`p-4 rounded-lg border ${
                        premiumTheme === themeKey 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{premiumThemes[themeKey].name}</h4>
                        {premiumThemes[themeKey].isPremium && !isAdmin && !unlockedThemes.includes(themeKey) && (
                          <FaLock className="text-amber-500" size={14} />
                        )}
                          </div>

                      <div 
                        className="h-20 mb-3 rounded-md overflow-hidden"
                        style={{ 
                          background: `linear-gradient(to right, ${premiumThemes[themeKey].primary}, ${premiumThemes[themeKey].secondary})` 
                        }}
                      ></div>
                      
                      <button
                        onClick={() => handleApplyTheme(themeKey)}
                        disabled={premiumThemes[themeKey].isPremium && !isAdmin && !unlockedThemes.includes(themeKey)}
                        className={`w-full py-2 px-3 rounded-lg font-medium ${
                          premiumTheme === themeKey
                            ? 'bg-green-500 dark:bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-700 flex items-center justify-center gap-2'
                            : premiumThemes[themeKey].isPremium && !isAdmin && !unlockedThemes.includes(themeKey)
                              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                              : 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm'
                        }`}
                      >
                        {premiumTheme === themeKey ? (
                          <>
                            <BsCheck2 size={18} />
                            <span>{t("applied")}</span>
                          </>
                        ) : (
                          t("applyTheme")
                        )}
                      </button>
                      </div>
                  ))}
                    </div>
              </div>

              {/* Premium Theme Animations */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex flex-col">
                  <div className="flex items-center mb-4">
                    <h3 className="text-lg font-medium">{t("themeAnimations")}</h3>
                    <div className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <FaCrown className="w-3 h-3 mr-1" />
                      {t("premium")}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t("animationsDescription")}
                    </p>
                    </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                    {/* Enable Animations Toggle */}
                    <div className="col-span-full mb-3 flex items-center">
                      <input
                        type="checkbox"
                        id="enableAnimations"
                        checked={userPreferences.enableAnimations || false}
                        onChange={(e) => handlePreferenceChange("enableAnimations", e.target.checked)}
                        className="mr-2 h-4 w-4"
                      />
                      <label htmlFor="enableAnimations" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("enableAnimations")}
                    </label>
                  </div>

                    {/* Animation Options */}
                    {userPreferences.enableAnimations && (
                      <>
                        <div className="col-span-full mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t("animationStyle")}
                          </label>
                          
                          {/* Animation categories */}
                          <div className="mb-3">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t("movementAnimations")}</div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4">
                              {["subtle", "bounce", "float", "wave", "glide"].map(style => (
                    <button
                                  key={style}
                                  onClick={() => handlePreferenceChange("animationStyle", style)}
                                  className={`p-3 rounded-lg border text-sm capitalize transition-all ${
                                    userPreferences.animationStyle === style 
                                    ? "bg-primary/10 border-primary text-primary shadow-md" 
                                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                  }`}
                                >
                                  <div className="flex flex-col items-center">
                                    <div className={`w-6 h-6 bg-primary/20 rounded-full mb-1.5 animate-${style}`}>
                                      <span className="sr-only">{style}</span>
                  </div>
                                    {style}
                </div>
                                </button>
                              ))}
              </div>
                            
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t("rotationAnimations")}</div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4">
                              {["rotate", "spin", "swing", "wobble", "shake"].map(style => (
                                <button
                                  key={style}
                                  onClick={() => handlePreferenceChange("animationStyle", style)}
                                  className={`p-3 rounded-lg border text-sm capitalize transition-all ${
                                    userPreferences.animationStyle === style 
                                    ? "bg-primary/10 border-primary text-primary shadow-md" 
                                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                  }`}
                                >
                                  <div className="flex flex-col items-center">
                                    <div className={`w-6 h-6 bg-primary/20 rounded-full mb-1.5 animate-${style}`}>
                                      <span className="sr-only">{style}</span>
                                    </div>
                                    {style}
                                  </div>
                                </button>
                              ))}
                  </div>

                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t("specialEffects")}</div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4">
                              {["pulse", "sparkle", "pop", "ripple"].map(style => (
                    <button
                                  key={style}
                                  onClick={() => handlePreferenceChange("animationStyle", style)}
                                  className={`p-3 rounded-lg border text-sm capitalize transition-all ${
                                    userPreferences.animationStyle === style 
                                    ? "bg-primary/10 border-primary text-primary shadow-md" 
                                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                  }`}
                                >
                                  <div className="flex flex-col items-center">
                                    <div className={`w-6 h-6 bg-primary/20 rounded-full mb-1.5 animate-${style}`}>
                                      <span className="sr-only">{style}</span>
                                    </div>
                                    {style}
                                  </div>
                    </button>
                              ))}
                  </div>
                </div>
              </div>
                        
                        <div className="col-span-full mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t("animationSpeed")}
                          </label>
                          <div className="flex space-x-2">
                            {["slow", "medium", "fast"].map(speed => (
                    <button
                                key={speed}
                                onClick={() => handlePreferenceChange("animationSpeed", speed)}
                                className={`flex-1 p-3 rounded-lg border text-sm capitalize transition-all ${
                                  userPreferences.animationSpeed === speed 
                                  ? "bg-primary/10 border-primary text-primary font-medium" 
                                  : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                }`}
                              >
                                <div className="flex items-center justify-center">
                                  <div className={`animation-${speed} mr-2`}>
                                    {speed === "slow" && <FaClock className="text-primary w-4 h-4" />}
                                    {speed === "medium" && <FaTachometerAlt className="text-primary w-4 h-4" />}
                                    {speed === "fast" && <FaBolt className="text-primary w-4 h-4" />}
                                  </div>
                                  {speed}
                                </div>
                    </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Animation Preview */}
                        <div className="col-span-full mt-4 p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                          <h4 className="text-sm font-medium mb-3">{t("preview")}</h4>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div className={`inline-flex items-center p-3 rounded-lg shadow-sm
                              ${userPreferences.enableAnimations ? `animate-${userPreferences.animationStyle || 'subtle'} 
                              ${userPreferences.animationSpeed || 'medium'}` : ''
                              }`}
                              style={{
                                backgroundColor: userPreferences.useCustomCardColor ? userPreferences.cardColor : 'var(--color-primary-light)'
                              }}
                            >
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                <span className="text-sm">{displayUsername.charAt(0).toUpperCase()}</span>
                              </div>
                              <span className="ml-2 font-medium">{displayUsername}</span>
                            </div>
                            
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-medium">{userPreferences.animationStyle}</span> at <span className="font-medium">{userPreferences.animationSpeed}</span> speed
                            </div>
                          </div>
                          
                          {/* Card animation previews */}
                          <h4 className="text-sm font-medium mt-6 mb-3">{t("cardPreview")}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div 
                              className={`card p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md ${
                                userPreferences.enableAnimations ? `animate-${userPreferences.animationStyle || 'subtle'} 
                                ${userPreferences.animationSpeed || 'medium'}` : ''
                              }`}
                              style={userPreferences.useCustomCardColor ? { backgroundColor: userPreferences.cardColor } : {}}
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                  <span className="text-lg">{displayUsername.charAt(0).toUpperCase()}</span>
                                </div>
                                <h3 className="font-medium">Profile Card</h3>
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {t("cardAnimationPreviewText")}
                  </div>
                </div>
                
                            <div 
                              className={`card p-4 dark:text-white rounded-xl shadow-md theme-animated-card ${
                                userPreferences.enableAnimations ? `animate-${userPreferences.animationStyle || 'subtle'} 
                                ${userPreferences.animationSpeed || 'medium'}` : ''
                              }`}
                              style={{ 
                                background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
                                color: 'white'
                              }}
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                  <span className="text-lg">{displayUsername.charAt(0).toUpperCase()}</span>
                    </div>
                                <h3 className="font-medium">Premium Card</h3>
                      </div>
                              <div className="text-sm text-white/80">
                                {t("premiumCardAnimationPreview")}
                              </div>
                            </div>
                  </div>
                  
                          {/* Animation settings button - Always visible regardless of animation state */}
                          <div className="mt-6 flex justify-end">
                            <button
                              onClick={() => {
                                savePreferences("colorappearance");
                                toast.success("Animation settings applied to profile cards");
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md flex items-center justify-center"
                            >
                              <FaPlay className="mr-2" />
                              <span>{isSavingPreferences ? "Saving..." : "Apply Animations"}</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                  </div>
                  
                  {/* Custom Card Color Option */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("cardColorOptions")}</span>
                        <button 
                          onClick={() => setShowColorOptions(!showColorOptions)}
                          className="text-xs bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 px-2 py-1 rounded"
                        >
                      {showColorOptions ? t("hideOptions") : t("showOptions")}
                        </button>
                      </div>
                      
                      {showColorOptions && (
                        <div className="mt-3 border-t pt-3 border-gray-200 dark:border-gray-600">
                          <div className="flex items-center mb-2">
                            <input
                              type="checkbox" 
                              id="useCustomCardColor"
                              checked={userPreferences.useCustomCardColor}
                              onChange={(e) => toggleCustomCardColor(e.target.checked)}
                              className="mr-2 h-4 w-4"
                            />
                            <label htmlFor="useCustomCardColor" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t("useCustomCardColor")}
                            </label>
                          </div>
                          
                          {userPreferences.useCustomCardColor && (
                            <div className="flex items-center mt-2">
                              <label className="text-sm text-gray-600 dark:text-gray-400 mr-3">
                            {t("customCardColor")}:
                              </label>
                              <input
                                type="color"
                                value={userPreferences.cardColor}
                                onChange={(e) => handleColorChange(e.target.value)}
                                className="w-8 h-8 rounded cursor-pointer"
                              />
                            </div>
                          )}
                          
                          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                        {t("cardColorDescription")}
                          </div>
                      
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => {
                            savePreferences();
                            // Success message is now handled in the savePreferences function
                          }}
                          className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium border border-blue-700 shadow-sm"
                        >
                          {isSavingPreferences ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Saving...
                            </span>
                          ) : (
                            "Save Card Colors"
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                    </div>
                  </div>
                  
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => savePreferences("colorappearance")}
                  disabled={isLoading}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {isLoading ? t("saving") : t("saveChanges")}
                </button>
              </div>
            </div>
          )}

          {/* Language Tab */}
          {activeTab === "language" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">{t("language")}</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">{t("selectLanguage")}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => changeLanguage("en")}
                    className={`px-4 py-2 flex items-center justify-between rounded-lg border ${
                      language === "en"
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span>English</span>
                    {language === "en" && <BsCheck2 className="text-lg" />}
                  </button>
                  <button
                    onClick={() => changeLanguage("es")}
                    className={`px-4 py-2 flex items-center justify-between rounded-lg border ${
                      language === "es"
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span>Español</span>
                    {language === "es" && <BsCheck2 className="text-lg" />}
                  </button>
                  <button
                    onClick={() => changeLanguage("fr")}
                    className={`px-4 py-2 flex items-center justify-between rounded-lg border ${
                      language === "fr"
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span>Français</span>
                    {language === "fr" && <BsCheck2 className="text-lg" />}
                  </button>
                  <button
                    onClick={() => changeLanguage("de")}
                    className={`px-4 py-2 flex items-center justify-between rounded-lg border ${
                      language === "de"
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span>Deutsch</span>
                    {language === "de" && <BsCheck2 className="text-lg" />}
                  </button>
                              </div>
                          </div>
                          
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => savePreferences("language")}
                  disabled={isLoading}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {isLoading ? t("saving") : t("saveChanges")}
                </button>
                                  </div>
                                </div>
                              )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">{t("notifications")}</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{t("emailNotifications")}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t("emailNotificationsDesc")}</p>
                                </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userPreferences.emailNotifications}
                      onChange={(e) => 
                        handlePreferenceChange("emailNotifications", e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{t("pushNotifications")}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t("pushNotificationsDesc")}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userPreferences.pushNotifications}
                      onChange={(e) => 
                        handlePreferenceChange("pushNotifications", e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </label>
                </div>
                            </div>
                            
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => savePreferences("notifications")}
                  disabled={isLoading}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {isLoading ? t("saving") : t("saveChanges")}
                </button>
                            </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === "account" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">{t("changePassword")}</h2>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("currentPassword")}
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full p-2 pr-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                    />
                            <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showCurrentPassword ? (
                        <FaEyeSlash className="w-5 h-5" />
                      ) : (
                        <FaEye className="w-5 h-5" />
                      )}
                            </button>
                          </div>
                        </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("newPassword")}
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-2 pr-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showNewPassword ? (
                        <FaEyeSlash className="w-5 h-5" />
                      ) : (
                        <FaEye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  </div>
                  
                {/* Confirm New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("confirmPassword")}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-2 pr-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                    />
                      <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash className="w-5 h-5" />
                      ) : (
                        <FaEye className="w-5 h-5" />
                      )}
                      </button>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8 border-t pt-6 dark:border-gray-700">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center text-lg font-medium shadow-lg border-2 border-blue-400"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                        <span className="text-xl">{t("changing")}</span>
                      </>
                    ) : (
                      <>
                        <FaLock className="w-6 h-6 mr-3" />
                        <span className="text-xl">{t("savePassword")}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
              </div>
            )}

            {/* Sessions Tab */}
            {activeTab === "sessions" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">{t("sessions")}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("activeSessions")}
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 text-green-600 rounded-full mr-3">
                        <BiDevices className="text-xl" />
              </div>
                      <div>
                        <h3 className="font-medium">Current Session</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Chrome on Windows • {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Active
                    </span>
                  </div>
          </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full mr-3">
                        <BiDevices className="text-xl" />
                      </div>
                      <div>
                        <h3 className="font-medium">Mobile App</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          iPhone • {new Date(Date.now() - 86400000).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button className="text-sm text-red-600 hover:text-red-700">
                      Revoke
                    </button>
                  </div>
                </div>
              </div>
              
            <button
                onClick={() => {/* Handle revoke all sessions */}}
                className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10"
            >
                {t("revokeAllSessions")}
            </button>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings; 
