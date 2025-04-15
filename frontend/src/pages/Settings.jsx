import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash, FaSave, FaTimes, FaUser, FaBell, FaLanguage, FaPalette, FaCrown, FaShieldAlt } from "react-icons/fa";
import { getTranslation } from "../utils/translations";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme, premiumThemes } from "../hooks/useTheme";
import SessionsManager from "../components/SessionsManager";
import axios from "axios";
import { toast } from "react-hot-toast";
import { BiPalette, BiColorFill, BiGlobe, BiBell, BiUser, BiDevices } from "react-icons/bi";
import { useTranslation } from "react-i18next";
import { BsCheck2 } from "react-icons/bs";

const backendURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
  const [activeTab, setActiveTab] = useState("appearance");
  const [userPreferences, setUserPreferences] = useState({
    emailNotifications: true,
    workoutReminders: true,
    progressReports: true,
    language: "en",
    summary_frequency: "weekly",
    summary_day: "monday",
    useCustomCardColor: false,
    cardColor: "#f0f4ff",
    showProfileEmoji: true,
    profileEmoji: "🏋️‍♂️",
    emojiAnimation: "lift"
  });
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [showColorOptions, setShowColorOptions] = useState(false);

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
              emojiAnimation: userData.preferences.emoji_animation || "lift"
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
    setUserPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const savePreferences = async () => {
    setIsSavingPreferences(true);
    
    try {
      const toastMessage = activeTab === "language" 
        ? "Language preferences saved!" 
        : activeTab === "appearance" 
          ? "Appearance settings saved!" 
          : activeTab === "colorappearance"
            ? "Color appearance settings saved!"
            : "Preferences saved!";
      
      // Get the token
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to save preferences");
        return;
      }
      
      // Convert userPreferences to backend format
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
        emoji_animation: userPreferences.emojiAnimation
      };
      
      // Send to backend
      const response = await fetch(`${backendURL}/user-profile`, {
        method: "PUT", 
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          preferences: backendPreferences
        })
      });
      
      if (response.ok) {
        // Create prominent toast with appropriate message
        if (activeTab === "colorappearance") {
          if (userPreferences.useCustomCardColor) {
            toast.success(`Custom card color applied: ${userPreferences.cardColor}`, {
              duration: 3000,
              position: 'top-center',
              icon: '🎨',
              style: {
                border: `2px solid ${userPreferences.cardColor}`,
                padding: '16px',
                color: '#713200',
              },
            });
            
            // Also set local success message
            setSuccess(`Custom color ${userPreferences.cardColor} applied to profile!`);
            setTimeout(() => setSuccess(null), 3000);
          } else {
            toast.success(`Using theme colors for profile`, {
              duration: 3000,
              position: 'top-center',
              icon: '🎨'
            });
            
            // Also set local success message
            setSuccess(`Using theme colors for profile`);
            setTimeout(() => setSuccess(null), 3000);
          }
          
          // Dispatch a custom event to notify other components
          notifyCardColorChanged(
            userPreferences.useCustomCardColor, 
            userPreferences.cardColor
          );
        } else {
          toast.success(toastMessage);
        }
        
        // Apply the color immediately to see the effect
        if (userPreferences.useCustomCardColor) {
          document.documentElement.style.setProperty('--custom-card-color', userPreferences.cardColor);
        }
      } else {
        toast.error("Failed to save preferences. Please try again.");
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("An error occurred. Please try again.");
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
              <div className="mt-6 border-t pt-6 dark:border-gray-700">
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
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">{t("selectEmoji")}</label>
                      <div className="grid grid-cols-5 gap-2 max-w-xs">
                        {["😀", "😎", "🚀", "💪", "🔥", "✨", "💯", "🏆", "🎯", "💡"].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handlePreferenceChange("profileEmoji", emoji)}
                            className={`text-2xl p-2 rounded-lg ${
                              userPreferences.profileEmoji === emoji
                                ? "bg-primary/10 border border-primary"
                                : "border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Animation style */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">{t("animationStyle")}</label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {["none", "lift", "bounce", "spin", "pulse", "wave"].map((animation) => (
                          <button
                            key={animation}
                            onClick={() => handlePreferenceChange("emojiAnimation", animation)}
                            className={`px-3 py-2 capitalize rounded-lg border ${
                              userPreferences.emojiAnimation === animation
                                ? "bg-primary/10 border-primary text-primary"
                                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                          >
                            {animation}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Preview */}
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t("preview")}:</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xl ${userPreferences.emojiAnimation !== "none" ? `animate-${userPreferences.emojiAnimation}` : ""}`}>
                          {userPreferences.profileEmoji}
                        </span>
                        <span className="font-medium">Username</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => savePreferences("appearance")}
                  disabled={isLoading}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {isLoading ? t("saving") : t("saveChanges")}
                </button>
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
