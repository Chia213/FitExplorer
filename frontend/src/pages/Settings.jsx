import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaLock, FaEye, FaEyeSlash, FaSave, FaTimes, FaUser, FaBell, FaLanguage, 
  FaPalette, FaCrown, FaShieldAlt, FaClock, FaTachometerAlt, FaBolt, 
  FaDumbbell, FaChartLine, FaFileAlt, FaDownload, FaUpload, FaExternalLinkAlt, 
  FaChartBar, FaTrophy, FaCheckCircle, FaCog, FaChevronRight, FaInfoCircle,
  FaExclamationTriangle, FaSpinner, FaCheck, FaEdit, FaTrash, FaPlus
} from "react-icons/fa";
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
  
  // Password state
  const [passwordState, setPasswordState] = useState({
    current: "",
    new: "",
    confirm: "",
    showCurrent: false,
    showNew: false,
    showConfirm: false
  });
  
  // UI state
  const [uiState, setUiState] = useState({
    error: null,
    success: null,
    isLoading: false,
    isSavingPreferences: false,
    showColorOptions: false,
    emojiChanged: false,
    showAdvanced: false
  });
  
  // User data
  const [userData, setUserData] = useState({
    username: "",
    activeTab: window.location.hash.substring(1) || "appearance",
    emojiCategory: 'faces'
  });
  
  // User preferences with better structure
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
    favoriteEmojis: ["🏋️‍♂️", "💪", "🏃‍♂️", "🏃‍♀️", "🚴", "🏊‍♂️"],
    favoriteAnimations: ["lift", "bounce", "pulse"],
    // Workout preferences
    defaultSets: 3,
    defaultReps: 10,
    defaultRestTime: 60,
    weightUnit: 'kg',
    distanceUnit: 'km',
    temperatureUnit: 'celsius',
    autoAdvanceSets: false,
    restTimerNotifications: true,
    autoSaveWorkouts: true,
    // Privacy preferences
    analyticsUsage: true,
    workoutSharing: false,
    socialFeatures: false
  });

  // Utility functions
  const updatePasswordState = useCallback((field, value) => {
    setPasswordState(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateUiState = useCallback((field, value) => {
    setUiState(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateUserData = useCallback((field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  }, []);

  const showMessage = useCallback((type, message, duration = 3000) => {
    updateUiState(type, message);
    setTimeout(() => updateUiState(type, null), duration);
  }, [updateUiState]);

  // Replace the local applyTheme function with a wrapper that uses the useTheme hook's applyTheme
  const handleApplyTheme = useCallback(async (themeKey) => {
    try {
      const success = await applyTheme(themeKey);
      if (success) {
        showMessage('success', `Applied ${premiumThemes[themeKey].name} theme`);
      } else {
        showMessage('error', "Failed to apply theme. It may not be unlocked yet.");
      }
    } catch (error) {
      console.error("Error applying theme:", error);
      showMessage('error', "There was an error applying the theme.");
    }
  }, [applyTheme, showMessage]);

  // Check if user can access a specific theme
  const canAccessTheme = (themeKey) => {
    return isAdmin || unlockedThemes.includes(themeKey);
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
          const userProfileData = await response.json();
          if (userProfileData.preferences) {
            setUserPreferences({
              emailNotifications: userProfileData.preferences.email_notifications || false,
              workoutReminders: userProfileData.preferences.workout_reminders || false,
              progressReports: userProfileData.preferences.progress_reports || false,
              language: userProfileData.preferences.language || "en",
              summary_frequency: userProfileData.preferences.summary_frequency || "weekly",
              summary_day: userProfileData.preferences.summary_day || "monday",
              useCustomCardColor: userProfileData.preferences.use_custom_card_color || false,
              cardColor: userProfileData.preferences.card_color || "#f0f4ff",
              showProfileEmoji: userProfileData.preferences.show_profile_emoji || true,
              profileEmoji: userProfileData.preferences.profile_emoji || "🏋️‍♂️",
              emojiAnimation: userProfileData.preferences.emoji_animation || "lift",
              enableAnimations: userProfileData.preferences.enable_animations || false,
              animationStyle: userProfileData.preferences.animation_style || "subtle",
              animationSpeed: userProfileData.preferences.animation_speed || "medium",
              customEmojiSrc: userProfileData.preferences.custom_emoji_src || null,
              favoriteEmojis: userProfileData.preferences.favorite_emojis || ["🏋️‍♂️", "💪", "🏃‍♂️", "🏃‍♀️", "🚴", "🏊‍♂️"],
              favoriteAnimations: userProfileData.preferences.favorite_animations || ["lift", "bounce", "pulse"]
            });
          }
          // Add the username
          if (userProfileData.username) {
            updateUserData('username', userProfileData.username);
          }
        }
      } catch (err) {
        console.error("Error fetching user preferences:", err);
      }
    };

    fetchUserPreferences();
  }, [navigate]);

  const handlePasswordChange = useCallback(async (e) => {
    e.preventDefault();
    updateUiState('error', null);
    updateUiState('success', null);

    // Enhanced validation
    const validation = validatePassword(passwordState.new, passwordState.confirm, passwordState.current);
    if (!validation.isValid) {
      updateUiState('error', validation.message);
      return;
    }

    try {
      updateUiState('isLoading', true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendURL}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: passwordState.current,
          new_password: passwordState.new,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', t("passwordChanged"));
        // Reset password state
        setPasswordState({
          current: "",
          new: "",
          confirm: "",
          showCurrent: false,
          showNew: false,
          showConfirm: false
        });
      } else {
        updateUiState('error', data.detail || t("failedToChangePassword"));
      }
    } catch (err) {
      updateUiState('error', t("somethingWentWrong"));
    } finally {
      updateUiState('isLoading', false);
    }
  }, [passwordState, showMessage, t, updateUiState]);

  // Enhanced password validation
  const validatePassword = useCallback((newPassword, confirmPassword, currentPassword) => {
    if (newPassword.length < 8) {
      return { isValid: false, message: t("passwordTooShort") };
    }
    if (newPassword !== confirmPassword) {
      return { isValid: false, message: t("passwordsDoNotMatch") };
    }
    if (newPassword === currentPassword) {
      return { isValid: false, message: t("newPasswordMustBeDifferent") };
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      return { isValid: false, message: "Password must contain uppercase, lowercase, and number" };
    }
    return { isValid: true };
  }, [t]);

  const handlePreferenceChange = useCallback(async (key, value) => {
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
      updateUiState('emojiChanged', true);
    }
    
    setUserPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  }, [changeLanguage, updateUiState]);

  // Enhanced tab management
  const tabs = useMemo(() => [
    { id: "account", label: t("account"), icon: FaUser, description: "Manage your account information" },
    { id: "appearance", label: t("appearance"), icon: FaPalette, description: "Customize the look and feel" },
    { id: "workout", label: "Workout", icon: FaDumbbell, description: "Workout preferences and settings" },
    { id: "notifications", label: t("notifications"), icon: FaBell, description: "Notification preferences" },
    { id: "data", label: "Data", icon: FaChartLine, description: "Data management and export" },
    { id: "privacy", label: "Privacy", icon: FaShieldAlt, description: "Privacy and data sharing" },
    { id: "language", label: t("language"), icon: FaLanguage, description: "Language and localization" },
    { id: "security", label: t("security"), icon: FaLock, description: "Security and password" },
    { id: "sessions", label: t("sessions"), icon: FaShieldAlt, description: "Active sessions and devices" }
  ], [t]);

  const handleTabChange = useCallback((tabId) => {
    updateUserData('activeTab', tabId);
    // Update URL hash
    window.history.replaceState({}, '', `#${tabId}`);
  }, [updateUserData]);

  const savePreferences = useCallback(async (currentTab) => {
    updateUiState('isSavingPreferences', true);
    
    // Reset emoji changed flag when saving
    if (currentTab === "appearance") {
      updateUiState('emojiChanged', false);
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
      updateUiState('isSavingPreferences', false);
    }
  }, [userPreferences, updateUiState, t]);

  // Enhanced UI components
  const AlertMessage = useCallback(({ type, message, onClose }) => {
    if (!message) return null;
    
    const styles = {
      error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
      success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
      warning: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
      info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"
    };

    const icons = {
      error: FaExclamationTriangle,
      success: FaCheck,
      warning: FaExclamationTriangle,
      info: FaInfoCircle
    };

    const Icon = icons[type] || FaInfoCircle;

    return (
      <div className={`mb-6 ${styles[type]} border px-4 py-3 rounded-lg flex justify-between items-center animate-in slide-in-from-top-2 duration-300`}>
        <div className="flex items-center space-x-3">
          <Icon className="w-5 h-5 flex-shrink-0" />
          <span>{message}</span>
        </div>
        <button 
          onClick={onClose} 
          className="text-current hover:opacity-70 transition-opacity"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      </div>
    );
  }, []);

  const LoadingSpinner = useCallback(({ size = "sm" }) => {
    const sizes = {
      sm: "w-4 h-4",
      md: "w-6 h-6",
      lg: "w-8 h-8"
    };
    
    return (
      <FaSpinner className={`${sizes[size]} animate-spin`} />
    );
  }, []);

  const SectionCard = useCallback(({ title, description, children, className = "" }) => (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 ${className}`}>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{title}</h2>
          <p className="text-slate-600 dark:text-slate-400">{description}</p>
        </div>
        {children}
      </div>
    </div>
  ), []);

  const SettingCard = useCallback(({ title, description, children, className = "" }) => (
    <div className={`bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{title}</h3>
      {description && (
        <p className="text-slate-600 dark:text-slate-400 mb-4">{description}</p>
      )}
      {children}
    </div>
  ), []);

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
  const displayUsername = userData.username || "User";

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center space-x-3">
                <FaCog className="w-8 h-8 text-blue-600" />
                <span>{t("settings")}</span>
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Manage your account settings and preferences
          </p>
        </div>
            <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
              <FaUser className="w-4 h-4" />
              <span>{userData.username || "User"}</span>
          </div>
          </div>
        </div>

        {/* Enhanced Alert Messages */}
        <AlertMessage 
          type="error" 
          message={uiState.error} 
          onClose={() => updateUiState('error', null)} 
        />
        <AlertMessage 
          type="success" 
          message={uiState.success} 
          onClose={() => updateUiState('success', null)} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Sidebar Navigation */}
          <div className="lg:col-span-1">
            {/* Mobile Navigation - Horizontal Scroll */}
            <div className="lg:hidden mb-6">
              <nav className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                        userData.activeTab === tab.id 
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800" 
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium text-sm">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
            
            {/* Desktop Navigation - Vertical */}
            <nav className="hidden lg:block space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                      userData.activeTab === tab.id 
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{tab.label}</div>
                      <div className="text-xs opacity-75">{tab.description}</div>
                    </div>
                    <FaChevronRight className={`w-4 h-4 transition-transform ${
                      userData.activeTab === tab.id ? 'rotate-90' : 'group-hover:translate-x-1'
                    }`} />
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Account Settings */}
            {userData.activeTab === "account" && (
              <SectionCard 
                title={t("account")} 
                description="Manage your account information and profile settings"
              >
                {/* Username Section */}
                <SettingCard title={t("username")} description="Update your display name">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <input
                          type="text"
                        value={userData.username}
                        onChange={(e) => updateUserData('username', e.target.value)}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                          placeholder={t("enterUsername")}
                        />
                      </div>
                      <button
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => savePreferences("account")}
                      disabled={uiState.isSavingPreferences}
                    >
                      {uiState.isSavingPreferences ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <FaSave className="w-4 h-4" />
                      )}
                      <span>{uiState.isSavingPreferences ? t("saving") : t("save")}</span>
                      </button>
                    </div>
                </SettingCard>
                
                {/* Emoji Preferences Section */}
                <SettingCard 
                  title={t("profileEmoji")} 
                  description="Customize your profile emoji and animations"
                >
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                        id="showProfileEmoji"
                          checked={userPreferences.showProfileEmoji}
                          onChange={(e) => handlePreferenceChange("showProfileEmoji", e.target.checked)}
                          className="w-5 h-5 text-blue-600 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      <label htmlFor="showProfileEmoji" className="text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                        {t("showProfileEmoji")}
                      </label>
                    </div>
                    
                    {userPreferences.showProfileEmoji && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 font-medium mb-3">{t("chooseEmoji")}</label>
                          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3">
                            {userPreferences.favoriteEmojis.map((emoji, index) => (
                              <button
                                key={index}
                                onClick={() => handlePreferenceChange("profileEmoji", emoji)}
                                className={`text-2xl p-3 border-2 rounded-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  userPreferences.profileEmoji === emoji 
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800' 
                                    : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800'
                                }`}
                                aria-label={`Select emoji ${emoji}`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Animation Settings */}
                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 font-medium mb-3">Emoji Animation</label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {["lift", "bounce", "pulse", "wave"].map(animation => (
                              <button
                                key={animation}
                                onClick={() => handlePreferenceChange("emojiAnimation", animation)}
                                className={`px-3 py-2 text-sm rounded-lg border-2 transition-all duration-200 ${
                                  userPreferences.emojiAnimation === animation
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                    : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {animation.charAt(0).toUpperCase() + animation.slice(1)}
                              </button>
                            ))}
                      </div>
                  </div>
                </div>
                    )}
              </div>
                </SettingCard>
              </SectionCard>
            )}

            {/* Appearance Settings */}
            {userData.activeTab === "appearance" && (
              <SectionCard 
                title={t("appearance")} 
                description="Customize the look and feel of your FitExplorer experience"
              >
                
                {/* Theme Toggle */}
                <SettingCard title={t("theme")} description="Choose your preferred color scheme">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { mode: 'light', icon: '☀️', label: t("light") },
                      { mode: 'dark', icon: '🌙', label: t("dark") },
                      { mode: 'system', icon: '💻', label: t("system") }
                    ].map(({ mode, icon, label }) => (
                      <button
                        key={mode}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-center space-x-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          theme === mode 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800' 
                            : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800'
                        }`}
                        onClick={() => setThemeMode(mode)}
                        aria-pressed={theme === mode}
                      >
                        <span className="text-2xl">{icon}</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
                      </button>
                    ))}
                    </div>
                </SettingCard>
                
                {/* Card Color Customization */}
                <SettingCard 
                  title={t("cardColor")} 
                  description="Customize the color scheme for your cards and interface elements"
                >
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="useCustomCardColor"
                        checked={userPreferences.useCustomCardColor}
                        onChange={(e) => toggleCustomCardColor(e.target.checked)}
                        className="w-5 h-5 text-blue-600 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <label htmlFor="useCustomCardColor" className="text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                        {t("useCustomCardColor")}
                    </label>
                    </div>
                    
                    {userPreferences.useCustomCardColor && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                          {['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4'].map(color => (
                            <button
                              key={color}
                              className={`h-12 rounded-lg border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                userPreferences.cardColor === color 
                                  ? 'border-slate-900 dark:border-white ring-2 ring-slate-300 dark:ring-slate-600' 
                                  : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => handleColorChange(color)}
                              aria-label={`Select color ${color}`}
                            />
                          ))}
                        </div>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={userPreferences.cardColor}
                            onChange={(e) => handleColorChange(e.target.value)}
                            className="w-12 h-12 cursor-pointer rounded-lg border-2 border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Custom color picker"
                          />
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{t("custom")}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </SettingCard>
                
                {/* Animation Settings */}
                <SettingCard 
                  title={t("animations")} 
                  description="Customize animation preferences for a more dynamic experience"
                >
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="enableAnimations"
                        checked={userPreferences.enableAnimations}
                        onChange={(e) => handlePreferenceChange("enableAnimations", e.target.checked)}
                        className="w-5 h-5 text-blue-600 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <label htmlFor="enableAnimations" className="text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                        {t("enableAnimations")}
                    </label>
                    </div>
                    
                    {userPreferences.enableAnimations && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 font-medium mb-3">{t("animationStyle")}</label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {["subtle", "medium", "bold"].map(style => (
                              <button
                                key={style}
                                onClick={() => handlePreferenceChange("animationStyle", style)}
                                className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  userPreferences.animationStyle === style
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800 text-blue-700 dark:text-blue-300'
                                    : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {t(style)}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-slate-700 dark:text-slate-300 font-medium mb-3">{t("animationSpeed")}</label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {["slow", "medium", "fast"].map(speed => (
                              <button
                                key={speed}
                                onClick={() => handlePreferenceChange("animationSpeed", speed)}
                                className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  userPreferences.animationSpeed === speed
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800 text-blue-700 dark:text-blue-300'
                                    : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {t(speed)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </SettingCard>

                {/* Save Button */}
                <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-700">
                  <button
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => savePreferences("appearance")}
                    disabled={uiState.isSavingPreferences}
                  >
                    {uiState.isSavingPreferences ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <FaSave className="w-4 h-4" />
                    )}
                    <span>{uiState.isSavingPreferences ? t("saving") : t("saveChanges")}</span>
                  </button>
                </div>
                
                {/* Premium Theme Showcase */}
                <SettingCard 
                  title="Premium Themes" 
                  description="Unlock exclusive fitness-focused themes"
                >
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Premium Themes</h3>
                        <p className="text-slate-600 dark:text-slate-400">Unlock exclusive fitness-focused themes</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaCrown className="w-5 h-5 text-yellow-500" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Premium</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(premiumThemes).filter(([key]) => 
                        ['gymDark', 'powerLifter', 'cardio', 'zen', 'neonGym', 'steel', 'protein', 'midnightGym', 'energy', 'recovery'].includes(key)
                      ).map(([themeKey, theme]) => (
                        <div
                          key={themeKey}
                          className={`relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                            premiumTheme === themeKey
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800'
                              : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800'
                          }`}
                          onClick={() => canAccessTheme(themeKey) ? handleApplyTheme(themeKey) : null}
                        >
                          {/* Theme Preview */}
                          <div className="mb-3">
                            <div 
                              className="h-16 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                              style={{ 
                                background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 50%, ${theme.accent} 100%)` 
                              }}
                            >
                              {theme.name}
                            </div>
                          </div>
                          
                          {/* Theme Info */}
                          <div className="space-y-2">
                            <h4 className="font-medium text-slate-900 dark:text-white text-sm">{theme.name}</h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400">{theme.description}</p>
                          </div>
                          
                          {/* Access Status */}
                          <div className="absolute top-2 right-2">
                            {canAccessTheme(themeKey) ? (
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <FaCheckCircle className="w-3 h-3 text-white" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 bg-slate-400 rounded-full flex items-center justify-center">
                                <FaLock className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          
                          {/* Color Palette */}
                          <div className="flex space-x-1 mt-3">
                            <div 
                              className="w-4 h-4 rounded-full border border-slate-200 dark:border-slate-600"
                              style={{ backgroundColor: theme.primary }}
                            ></div>
                            <div 
                              className="w-4 h-4 rounded-full border border-slate-200 dark:border-slate-600"
                              style={{ backgroundColor: theme.secondary }}
                            ></div>
                            <div 
                              className="w-4 h-4 rounded-full border border-slate-200 dark:border-slate-600"
                              style={{ backgroundColor: theme.accent }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Theme Unlock Progress */}
                    <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Theme Progress</span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {unlockedThemes.length} / {Object.keys(premiumThemes).length} unlocked
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(unlockedThemes.length / Object.keys(premiumThemes).length) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                        Complete more workouts to unlock premium themes!
                      </p>
                    </div>
                  </div>
                </SettingCard>

                {/* Button to Save Appearance Settings */}
                <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-700">
                  <button
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 flex items-center space-x-2"
                    onClick={() => savePreferences("appearance")}
                    disabled={uiState.isSavingPreferences}
                  >
                    <FaSave className="w-4 h-4" />
                    <span>{uiState.isSavingPreferences ? t("saving") : t("saveChanges")}</span>
                  </button>
                </div>
              </SectionCard>
            )}

            {/* Workout Preferences */}
            {userData.activeTab === "workout" && (
              <div className="p-6">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Workout Preferences</h2>
                  <p className="text-slate-600 dark:text-slate-400">Customize your default workout settings and preferences</p>
                </div>

                {/* Default Exercise Settings */}
                <div className="mb-8">
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Default Exercise Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-medium mb-2">Default Sets</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white"
                          placeholder="3"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-medium mb-2">Default Reps</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white"
                          placeholder="10"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-medium mb-2">Rest Time (seconds)</label>
                        <input
                          type="number"
                          min="0"
                          max="600"
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white"
                          placeholder="60"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Unit Preferences */}
                <div className="mb-8">
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Unit Preferences</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-medium mb-3">Weight Unit</label>
                        <div className="space-y-2">
                          {[
                            { value: 'kg', label: 'Kilograms (kg)', flag: '🇪🇺' },
                            { value: 'lbs', label: 'Pounds (lbs)', flag: '🇺🇸' }
                          ].map(unit => (
                            <label key={unit.value} className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="radio"
                                name="weightUnit"
                                value={unit.value}
                                className="w-4 h-4 text-blue-600 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-blue-500"
                              />
                              <span className="text-2xl">{unit.flag}</span>
                              <span className="text-slate-700 dark:text-slate-300">{unit.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-medium mb-3">Distance Unit</label>
                        <div className="space-y-2">
                          {[
                            { value: 'km', label: 'Kilometers (km)', flag: '🌍' },
                            { value: 'miles', label: 'Miles', flag: '🇺🇸' }
                          ].map(unit => (
                            <label key={unit.value} className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="radio"
                                name="distanceUnit"
                                value={unit.value}
                                className="w-4 h-4 text-blue-600 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-blue-500"
                              />
                              <span className="text-2xl">{unit.flag}</span>
                              <span className="text-slate-700 dark:text-slate-300">{unit.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-medium mb-3">Temperature Unit</label>
                        <div className="space-y-2">
                          {[
                            { value: 'celsius', label: 'Celsius (°C)', flag: '🌡️' },
                            { value: 'fahrenheit', label: 'Fahrenheit (°F)', flag: '🌡️' }
                          ].map(unit => (
                            <label key={unit.value} className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="radio"
                                name="temperatureUnit"
                                value={unit.value}
                                className="w-4 h-4 text-blue-600 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-blue-500"
                              />
                              <span className="text-2xl">{unit.flag}</span>
                              <span className="text-slate-700 dark:text-slate-300">{unit.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Workout Behavior */}
                <div className="mb-8">
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Workout Behavior</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white">Auto-advance sets</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Automatically move to next set after rest time</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white">Rest timer notifications</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Get notified when rest time is over</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            defaultChecked
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white">Auto-save workouts</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Automatically save workout progress</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            defaultChecked
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 flex items-center space-x-2"
                    onClick={() => savePreferences("workout")}
                    disabled={uiState.isSavingPreferences}
                  >
                    <FaSave className="w-4 h-4" />
                    <span>{uiState.isSavingPreferences ? t("saving") : t("saveChanges")}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {userData.activeTab === "security" && (
              <SectionCard 
                title={t("security")} 
                description="Manage your password and security settings"
              >
                <SettingCard 
                  title={t("changePassword")} 
                  description="Update your account password for better security"
                >
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-medium mb-2">
                        {t("currentPassword")}
                      </label>
                      <div className="relative">
                        <input
                          type={passwordState.showCurrent ? "text" : "password"}
                          value={passwordState.current}
                          onChange={(e) => updatePasswordState('current', e.target.value)}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 pr-12"
                          placeholder={t("enterCurrentPassword")}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          onClick={() => updatePasswordState('showCurrent', !passwordState.showCurrent)}
                        >
                          {passwordState.showCurrent ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-medium mb-2">
                        {t("newPassword")}
                      </label>
                      <div className="relative">
                        <input
                          type={passwordState.showNew ? "text" : "password"}
                          value={passwordState.new}
                          onChange={(e) => updatePasswordState('new', e.target.value)}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 pr-12"
                          placeholder={t("enterNewPassword")}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          onClick={() => updatePasswordState('showNew', !passwordState.showNew)}
                        >
                          {passwordState.showNew ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-medium mb-2">
                        {t("confirmPassword")}
                      </label>
                      <div className="relative">
                        <input
                          type={passwordState.showConfirm ? "text" : "password"}
                          value={passwordState.confirm}
                          onChange={(e) => updatePasswordState('confirm', e.target.value)}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 pr-12"
                          placeholder={t("confirmNewPassword")}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          onClick={() => updatePasswordState('showConfirm', !passwordState.showConfirm)}
                        >
                          {passwordState.showConfirm ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 flex items-center space-x-2"
                        disabled={uiState.isLoading}
                      >
                        <FaLock className="w-4 h-4" />
                        <span>{uiState.isLoading ? t("changing") : t("changePassword")}</span>
                      </button>
                    </div>
                  </form>
                </SettingCard>
              </SectionCard>
            )}
            
            {/* Notification Settings */}
            {userData.activeTab === "notifications" && (
              <div className="p-6">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t("notifications")}</h2>
                  <p className="text-slate-600 dark:text-slate-400">Configure how you receive notifications and updates</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Notification Preferences</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-white">{t("emailNotifications")}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Receive notifications via email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={userPreferences.emailNotifications}
                          onChange={(e) => handlePreferenceChange("emailNotifications", e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-white">{t("workoutReminders")}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Get reminded about your workout schedule</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={userPreferences.workoutReminders}
                          onChange={(e) => handlePreferenceChange("workoutReminders", e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-white">{t("progressReports")}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Receive weekly progress summaries</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={userPreferences.progressReports}
                          onChange={(e) => handlePreferenceChange("progressReports", e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-600">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t("summaryFrequency")}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {["daily", "weekly", "monthly"].map(frequency => (
                        <button
                          key={frequency}
                          onClick={() => handlePreferenceChange("summary_frequency", frequency)}
                          className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                            userPreferences.summary_frequency === frequency
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800 text-blue-700 dark:text-blue-300'
                              : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {t(frequency)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {userPreferences.summary_frequency === "weekly" && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t("summaryDay")}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                        {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(day => (
                          <button
                            key={day}
                            onClick={() => handlePreferenceChange("summary_day", day)}
                            className={`px-3 py-2 rounded-lg border-2 transition-all duration-200 text-sm ${
                              userPreferences.summary_day === day
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800 text-blue-700 dark:text-blue-300'
                                : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {t(day)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end mt-8">
                    <button
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 flex items-center space-x-2"
                      onClick={() => savePreferences("notifications")}
                      disabled={uiState.isSavingPreferences}
                    >
                      <FaSave className="w-4 h-4" />
                      <span>{uiState.isSavingPreferences ? t("saving") : t("saveChanges")}</span>
                    </button>
                  </div>
                </div>
              </div>
                        )}

            {/* Data Management */}
            {userData.activeTab === "data" && (
              <div className="p-6">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Data Management</h2>
                  <p className="text-slate-600 dark:text-slate-400">Export, import, and manage your fitness data</p>
                </div>

                {/* Data Export */}
                <div className="mb-8">
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Export Your Data</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-600 transition-colors duration-200">
                        <div className="flex items-center space-x-3 mb-2">
                          <FaChartLine className="w-5 h-5 text-blue-500" />
                          <span className="font-medium text-slate-900 dark:text-white">CSV Export</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Download workout data as CSV</p>
                      </button>
                      <button className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-600 transition-colors duration-200">
                        <div className="flex items-center space-x-3 mb-2">
                          <FaFileAlt className="w-5 h-5 text-green-500" />
                          <span className="font-medium text-slate-900 dark:text-white">PDF Report</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Generate progress report</p>
                      </button>
                      <button className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-600 transition-colors duration-200">
                        <div className="flex items-center space-x-3 mb-2">
                          <FaDownload className="w-5 h-5 text-purple-500" />
                          <span className="font-medium text-slate-900 dark:text-white">Full Backup</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Complete data backup</p>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Data Import */}
                <div className="mb-8">
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Import Data</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FaUpload className="w-5 h-5 text-blue-500" />
                            <div>
                              <h4 className="font-medium text-slate-900 dark:text-white">Import from CSV</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400">Upload workout data from CSV file</p>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200">
                            Choose File
                          </button>
                        </div>
                      </div>
                      <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FaExternalLinkAlt className="w-5 h-5 text-green-500" />
                            <div>
                              <h4 className="font-medium text-slate-900 dark:text-white">Import from MyFitnessPal</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400">Sync nutrition data</p>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors duration-200">
                            Connect
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Analytics */}
                <div className="mb-8">
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Data Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                        <div className="flex items-center space-x-3 mb-3">
                          <FaChartBar className="w-5 h-5 text-blue-500" />
                          <h4 className="font-medium text-slate-900 dark:text-white">Workout Statistics</h4>
                        </div>
                        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex justify-between">
                            <span>Total Workouts:</span>
                            <span className="font-medium text-slate-900 dark:text-white">127</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Hours:</span>
                            <span className="font-medium text-slate-900 dark:text-white">89.5</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Calories Burned:</span>
                            <span className="font-medium text-slate-900 dark:text-white">12,450</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                        <div className="flex items-center space-x-3 mb-3">
                          <FaTrophy className="w-5 h-5 text-yellow-500" />
                          <h4 className="font-medium text-slate-900 dark:text-white">Achievements</h4>
                        </div>
                        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex justify-between">
                            <span>Current Streak:</span>
                            <span className="font-medium text-slate-900 dark:text-white">7 days</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Best Streak:</span>
                            <span className="font-medium text-slate-900 dark:text-white">23 days</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Goals Completed:</span>
                            <span className="font-medium text-slate-900 dark:text-white">15/20</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {userData.activeTab === "privacy" && (
              <div className="p-6">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Privacy & Data</h2>
                  <p className="text-slate-600 dark:text-slate-400">Control your privacy and data sharing preferences</p>
                </div>

                {/* Data Sharing */}
                <div className="mb-8">
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Data Sharing</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white">Analytics & Usage</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Help improve the app with anonymous usage data</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            defaultChecked
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white">Workout Sharing</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Allow others to see your workout achievements</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white">Social Features</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Enable community features and challenges</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Retention */}
                <div className="mb-8">
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Data Management</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-slate-900 dark:text-white">Delete Account</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Permanently delete your account and all data</p>
                          </div>
                          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors duration-200">
                            Delete Account
                          </button>
                        </div>
                      </div>
                      <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-slate-900 dark:text-white">Download All Data</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Get a copy of all your personal data</p>
                          </div>
                          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200">
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Language Settings */}
            {userData.activeTab === "language" && (
              <div className="p-6">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t("language")}</h2>
                  <p className="text-slate-600 dark:text-slate-400">Choose your preferred language for the interface</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Select Language</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {["en", "es", "fr", "de", "it", "pt", "zh", "ja", "ko", "ru"].map(lang => (
                      <button
                        key={lang}
                        onClick={() => {
                          handlePreferenceChange("language", lang);
                          changeLanguage(lang);
                        }}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center space-x-3 ${
                          userPreferences.language === lang
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800'
                            : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800'
                        }`}
                      >
                        <span className="text-2xl">{getLanguageFlag(lang)}</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{getLanguageName(lang)}</span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex justify-end mt-8">
                    <button
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 flex items-center space-x-2"
                      onClick={() => savePreferences("language")}
                      disabled={uiState.isSavingPreferences}
                    >
                      <FaSave className="w-4 h-4" />
                      <span>{uiState.isSavingPreferences ? t("saving") : t("saveChanges")}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sessions Management */}
            {userData.activeTab === "sessions" && (
              <SectionCard 
                title={t("sessions")} 
                description="Manage your active sessions and devices"
              >
                <SessionsManager />
              </SectionCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions for language display
const getLanguageFlag = (code) => {
  const flags = {
    en: "🇺🇸",
    es: "🇪🇸",
    fr: "🇫🇷",
    de: "🇩🇪",
    it: "🇮🇹",
    pt: "🇵🇹",
    zh: "🇨🇳",
    ja: "🇯🇵",
    ko: "🇰🇷",
    ru: "🇷🇺"
  };
  return flags[code] || "🌐";
};

const getLanguageName = (code) => {
  const names = {
    en: "English",
    es: "Español",
    fr: "Français",
    de: "Deutsch",
    it: "Italiano",
    pt: "Português",
    zh: "中文",
    ja: "日本語",
    ko: "한국어",
    ru: "Русский"
  };
  return names[code] || code;
};

export default Settings; 
