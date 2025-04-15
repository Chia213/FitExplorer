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
    <div className="settings-page">
      <div className="flex flex-col min-h-screen w-full max-w-6xl mx-auto p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 flex items-center">
          {t("settings")}
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-700">
              <FaTimes />
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 flex justify-between items-center">
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="text-green-700">
              <FaTimes />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-fit">
            <div className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto pb-2 md:pb-0">
              {renderTabButton("account", t("account"), <FaUser className="text-blue-500" />)}
              {renderTabButton("appearance", t("appearance"), <FaPalette className="text-purple-500" />)}
              {renderTabButton("notifications", t("notifications"), <FaBell className="text-yellow-500" />)}
              {renderTabButton("language", t("language"), <FaLanguage className="text-green-500" />)}
              {renderTabButton("security", t("security"), <FaLock className="text-red-500" />)}
              {renderTabButton("sessions", t("sessions"), <FaShieldAlt className="text-gray-500" />)}
            </div>
          </div>

          {/* Main content */}
          <div className="md:col-span-9 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 min-h-[60vh]">
            {/* Account Settings */}
            {activeTab === "account" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">{t("account")}</h2>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">{t("username")}</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full md:w-[70%] px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      placeholder={t("enterUsername")}
                    />
                    <button
                      className="ml-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={() => savePreferences("account")}
                    >
                      {t("save")}
                    </button>
                  </div>
                </div>
                
                {/* Emoji Preferences Section */}
                <div id="emoji-preferences-section" className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">{t("profileEmoji")}</h3>
                  <div className="mb-4">
                    <label className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={userPreferences.showProfileEmoji}
                        onChange={(e) => handlePreferenceChange("showProfileEmoji", e.target.checked)}
                        className="mr-2 h-5 w-5"
                      />
                      <span>{t("showProfileEmoji")}</span>
                    </label>
                  </div>
                  
                  {userPreferences.showProfileEmoji && (
                    <div className="space-y-4">
                      <div>
                        <label className="block mb-2">{t("chooseEmoji")}</label>
                        <div className="flex flex-wrap gap-2">
                          {userPreferences.favoriteEmojis.map((emoji, index) => (
                            <button
                              key={index}
                              onClick={() => handlePreferenceChange("profileEmoji", emoji)}
                              className={`text-2xl p-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 
                                ${userPreferences.profileEmoji === emoji ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900' : ''}`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === "appearance" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">{t("appearance")}</h2>
                
                {/* Theme Toggle */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">{t("theme")}</h3>
                  <div className="flex items-center space-x-4">
                    <button
                      className={`px-4 py-2 rounded-lg flex items-center justify-center ${
                        theme === 'light' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                      onClick={() => setThemeMode('light')}
                    >
                      <span className="mr-2">☀️</span>
                      {t("light")}
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg flex items-center justify-center ${
                        theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                      onClick={() => setThemeMode('dark')}
                    >
                      <span className="mr-2">🌙</span>
                      {t("dark")}
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg flex items-center justify-center ${
                        theme === 'system' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                      onClick={() => setThemeMode('system')}
                    >
                      <span className="mr-2">💻</span>
                      {t("system")}
                    </button>
                  </div>
                </div>
                
                {/* Card Color Customization */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">{t("cardColor")}</h3>
                  <label className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      checked={userPreferences.useCustomCardColor}
                      onChange={(e) => toggleCustomCardColor(e.target.checked)}
                      className="mr-2 h-5 w-5"
                    />
                    <span>{t("useCustomCardColor")}</span>
                  </label>
                  
                  {userPreferences.useCustomCardColor && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4'].map(color => (
                        <button
                          key={color}
                          className={`h-10 rounded-lg border-2 ${
                            userPreferences.cardColor === color ? 'border-black dark:border-white' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => handleColorChange(color)}
                        />
                      ))}
                      <div className="flex items-center">
                        <input
                          type="color"
                          value={userPreferences.cardColor}
                          onChange={(e) => handleColorChange(e.target.value)}
                          className="w-10 h-10 cursor-pointer"
                        />
                        <span className="ml-2">{t("custom")}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Animation Settings */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">{t("animations")}</h3>
                  <label className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      checked={userPreferences.enableAnimations}
                      onChange={(e) => handlePreferenceChange("enableAnimations", e.target.checked)}
                      className="mr-2 h-5 w-5"
                    />
                    <span>{t("enableAnimations")}</span>
                  </label>
                  
                  {userPreferences.enableAnimations && (
                    <div className="space-y-4">
                      <div>
                        <label className="block mb-2">{t("animationStyle")}</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {["subtle", "medium", "bold"].map(style => (
                            <button
                              key={style}
                              onClick={() => handlePreferenceChange("animationStyle", style)}
                              className={`px-4 py-2 rounded-lg ${
                                userPreferences.animationStyle === style
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 dark:bg-gray-700'
                              }`}
                            >
                              {t(style)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block mb-2">{t("animationSpeed")}</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {["slow", "medium", "fast"].map(speed => (
                            <button
                              key={speed}
                              onClick={() => handlePreferenceChange("animationSpeed", speed)}
                              className={`px-4 py-2 rounded-lg ${
                                userPreferences.animationSpeed === speed
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 dark:bg-gray-700'
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
                
                {/* Button to Save Appearance Settings */}
                <button
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center"
                  onClick={() => savePreferences("appearance")}
                  disabled={isSavingPreferences}
                >
                  {isSavingPreferences ? t("saving") : t("saveChanges")}
                  <FaSave className="ml-2" />
                </button>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">{t("security")}</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      {t("currentPassword")}
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full md:w-[70%] px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        placeholder={t("enterCurrentPassword")}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm mr-[30%]"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      {t("newPassword")}
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full md:w-[70%] px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        placeholder={t("enterNewPassword")}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm mr-[30%]"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      {t("confirmPassword")}
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full md:w-[70%] px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        placeholder={t("confirmNewPassword")}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm mr-[30%]"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center"
                    disabled={isLoading}
                  >
                    {isLoading ? t("changing") : t("changePassword")}
                    <FaLock className="ml-2" />
                  </button>
                </form>
              </div>
            )}
            
            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">{t("notifications")}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={userPreferences.emailNotifications}
                        onChange={(e) => handlePreferenceChange("emailNotifications", e.target.checked)}
                        className="h-5 w-5"
                      />
                      <span>{t("emailNotifications")}</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={userPreferences.workoutReminders}
                        onChange={(e) => handlePreferenceChange("workoutReminders", e.target.checked)}
                        className="h-5 w-5"
                      />
                      <span>{t("workoutReminders")}</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={userPreferences.progressReports}
                        onChange={(e) => handlePreferenceChange("progressReports", e.target.checked)}
                        className="h-5 w-5"
                      />
                      <span>{t("progressReports")}</span>
                    </label>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-2">{t("summaryFrequency")}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {["daily", "weekly", "monthly"].map(frequency => (
                        <button
                          key={frequency}
                          onClick={() => handlePreferenceChange("summary_frequency", frequency)}
                          className={`px-4 py-2 rounded-lg ${
                            userPreferences.summary_frequency === frequency
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          {t(frequency)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {userPreferences.summary_frequency === "weekly" && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2">{t("summaryDay")}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
                        {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(day => (
                          <button
                            key={day}
                            onClick={() => handlePreferenceChange("summary_day", day)}
                            className={`px-2 py-2 rounded-lg ${
                              userPreferences.summary_day === day
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          >
                            {t(day)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <button
                    className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center"
                    onClick={() => savePreferences("notifications")}
                    disabled={isSavingPreferences}
                  >
                    {isSavingPreferences ? t("saving") : t("saveChanges")}
                    <FaSave className="ml-2" />
                  </button>
                </div>
              </div>
            )}
            
            {/* Language Settings */}
            {activeTab === "language" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">{t("language")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {["en", "es", "fr", "de", "it", "pt", "zh", "ja", "ko", "ru"].map(lang => (
                    <button
                      key={lang}
                      onClick={() => {
                        handlePreferenceChange("language", lang);
                        changeLanguage(lang);
                      }}
                      className={`px-4 py-3 rounded-lg flex items-center ${
                        userPreferences.language === lang
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      <span className="mr-2">{getLanguageFlag(lang)}</span>
                      {getLanguageName(lang)}
                    </button>
                  ))}
                </div>
                
                <button
                  className="mt-6 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center"
                  onClick={() => savePreferences("language")}
                  disabled={isSavingPreferences}
                >
                  {isSavingPreferences ? t("saving") : t("saveChanges")}
                  <FaSave className="ml-2" />
                </button>
              </div>
            )}

            {/* Sessions Management */}
            {activeTab === "sessions" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">{t("sessions")}</h2>
                <SessionsManager />
              </div>
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
