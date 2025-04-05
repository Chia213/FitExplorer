import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash, FaSave, FaTimes, FaUser, FaBell, FaLanguage, FaPalette, FaCrown } from "react-icons/fa";
import { getTranslation } from "../utils/translations";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme, premiumThemes } from "../hooks/useTheme";

const backendURL = "http://localhost:8000";

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
    isAdmin 
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
  const [activeTab, setActiveTab] = useState(() => {
    // Check if "tab" query param is set
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tab') || "account";
  });
  const [userPreferences, setUserPreferences] = useState({
    emailNotifications: true,
    workoutReminders: true,
    progressReports: true,
    language: "en",
    summary_frequency: "weekly",
    summary_day: "monday",
    useCustomCardColor: false,
    cardColor: "#f0f4ff"
  });
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [showColorOptions, setShowColorOptions] = useState(false);

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
              cardColor: userData.preferences.card_color || "#f0f4ff"
            });
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
      setError("New password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword === currentPassword) {
      setError("New password must be different from current password");
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
        setSuccess("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(data.detail || "Failed to change password");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
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
      console.log("Saving preferences to backend from Settings page:", userPreferences);
      
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendURL}/user/settings/notifications`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email_notifications: userPreferences.emailNotifications,
          workout_reminders: userPreferences.workoutReminders,
          progress_reports: userPreferences.progressReports,
          language: language,
          summary_frequency: userPreferences.summary_frequency,
          summary_day: userPreferences.summary_day,
          use_custom_card_color: userPreferences.useCustomCardColor,
          card_color: userPreferences.cardColor
        }),
      });

      if (response.ok) {
        setSuccess(t("preferencesSaved"));
        setTimeout(() => setSuccess(null), 3000);
        
        console.log("Preferences saved successfully to backend");
      } else {
        const data = await response.json();
        console.error("Failed to save preferences:", data);
        setError(data.detail || t("failedToSavePreferences"));
      }
    } catch (err) {
      console.error("Error saving preferences:", err);
      setError(t("somethingWentWrong"));
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

  const tabs = [
    { id: "account", label: getTranslation("account", userPreferences.language), icon: <FaUser className="w-5 h-5" /> },
    { id: "notifications", label: getTranslation("notifications", userPreferences.language), icon: <FaBell className="w-5 h-5" /> },
    { id: "language", label: getTranslation("language", userPreferences.language), icon: <FaLanguage className="w-5 h-5" /> },
    { id: "appearance", label: getTranslation("appearance", userPreferences.language) || "Appearance", icon: <FaPalette className="w-5 h-5" /> }
  ];
  
  // Apply a premium theme
  const applyTheme = (themeKey) => {
    if (changePremiumTheme(themeKey)) {
      setSuccess(`Applied ${premiumThemes[themeKey].name} theme`);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError("Failed to apply theme. It may not be unlocked yet.");
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {getTranslation("settings", userPreferences.language)}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {getTranslation("manageSettings", userPreferences.language)}
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 text-sm font-medium ${
                    activeTab === tab.id
                      ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  {tab.icon}
                  <span className="ml-2">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Error and Success Messages */}
            {error && (
              <div className="mb-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-3 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 p-3 rounded-lg">
                {success}
              </div>
            )}

            {/* Account Tab */}
            {activeTab === "account" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Change Password
                </h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current Password
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
                      New Password
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
                      Confirm New Password
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
                  <div className="flex justify-end space-x-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Changing...</span>
                        </>
                      ) : (
                        <>
                          <FaLock className="w-5 h-5" />
                          <span>Change Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Notification Preferences
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userPreferences.emailNotifications}
                        onChange={(e) => handlePreferenceChange("emailNotifications", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {userPreferences.emailNotifications && (
                    <div className="ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Summary Frequency
                        </label>
                        <select
                          value={userPreferences.summary_frequency}
                          onChange={(e) => handlePreferenceChange("summary_frequency", e.target.value)}
                          className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="weekly">Weekly Summary</option>
                          <option value="monthly">Monthly Summary</option>
                        </select>
                        {userPreferences.summary_frequency === "weekly" && (
                          <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Summary Day
                            </label>
                            <select
                              value={userPreferences.summary_day}
                              onChange={(e) => handlePreferenceChange("summary_day", e.target.value)}
                              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="monday">Monday</option>
                              <option value="tuesday">Tuesday</option>
                              <option value="wednesday">Wednesday</option>
                              <option value="thursday">Thursday</option>
                              <option value="friday">Friday</option>
                              <option value="saturday">Saturday</option>
                              <option value="sunday">Sunday</option>
                            </select>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Choose how often and when you'd like to receive your workout summaries
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Workout Reminders</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get reminded about your scheduled workouts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userPreferences.workoutReminders}
                        onChange={(e) => handlePreferenceChange("workoutReminders", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Progress Reports</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive weekly progress reports</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userPreferences.progressReports}
                        onChange={(e) => handlePreferenceChange("progressReports", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={savePreferences}
                      disabled={isSavingPreferences}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isSavingPreferences ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>{getTranslation("saving", userPreferences.language)}</span>
                        </>
                      ) : (
                        <>
                          <FaSave className="w-5 h-5" />
                          <span>{getTranslation("savePreferences", userPreferences.language)}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Language Tab */}
            {activeTab === "language" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {getTranslation("languageSettings", userPreferences.language)}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {getTranslation("selectLanguage", userPreferences.language)}
                    </label>
                    <select
                      value={userPreferences.language}
                      onChange={(e) => handlePreferenceChange("language", e.target.value)}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="en">English</option>
                      <option value="sv">Svenska</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="it">Italiano</option>
                      <option value="pt">Português</option>
                      <option value="ru">Русский</option>
                      <option value="ja">日本語</option>
                      <option value="zh">中文</option>
                    </select>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={savePreferences}
                      disabled={isSavingPreferences}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isSavingPreferences ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>{getTranslation("saving", userPreferences.language)}</span>
                        </>
                      ) : (
                        <>
                          <FaSave className="w-5 h-5" />
                          <span>{getTranslation("savePreferences", userPreferences.language)}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Appearance Settings
                </h2>
                
                {/* Dark/Light Mode Toggle */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Color Mode
                  </h3>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setThemeMode("light")}
                      className={`px-4 py-2 rounded-md ${
                        theme === "light" 
                          ? "bg-blue-500 text-white" 
                          : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => setThemeMode("dark")}
                      className={`px-4 py-2 rounded-md ${
                        theme === "dark" 
                          ? "bg-blue-500 text-white" 
                          : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                </div>
                
                {/* Premium Themes */}
                <div>
                  <div className="flex items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Premium Themes
                    </h3>
                    <div className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      <FaCrown className="w-3 h-3 mr-1" />
                      Premium
                    </div>
                    {isAdmin && (
                      <div className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        Admin
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    <p>Customize the look and feel of your app with premium themes. Your profile card will automatically use your theme's colors.</p>
                    {isAdmin ? (
                      <p className="mt-2 text-purple-600 dark:text-purple-400">
                        As an admin, you have access to all premium themes without needing to unlock them.
                      </p>
                    ) : (
                      unlockedThemes.filter(t => premiumThemes[t].isPremium).length === 0 && (
                        <p className="mt-2 text-amber-600 dark:text-amber-400">
                          <FaLock className="inline-block mr-1" size={12} />
                          Unlock premium themes by earning achievements in the app!
                        </p>
                      )
                    )}
                  </div>
                  
                  {/* Custom Card Color Option */}
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Card Color Options</span>
                        <button 
                          onClick={() => setShowColorOptions(!showColorOptions)}
                          className="text-xs bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 px-2 py-1 rounded"
                        >
                          {showColorOptions ? "Hide Options" : "Show Options"}
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
                              Use custom card color instead of theme colors
                            </label>
                          </div>
                          
                          {userPreferences.useCustomCardColor && (
                            <div className="flex items-center mt-2">
                              <label className="text-sm text-gray-600 dark:text-gray-400 mr-3">
                                Custom Card Color:
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
                            This option overrides any theme colors on your profile card with your custom color.
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <button
                          onClick={savePreferences}
                          disabled={isSavingPreferences}
                          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center space-x-1 disabled:opacity-50"
                        >
                          {isSavingPreferences ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <FaSave className="w-3 h-3" />
                              <span>Save Changes</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(premiumThemes).map(([key, theme]) => {
                      const isUnlocked = unlockedThemes.includes(key);
                      const isActive = premiumTheme === key;
                      
                      return (
                        <div
                          key={key}
                          className={`border rounded-lg overflow-hidden card ${
                            isActive 
                              ? "border-accent shadow-md" 
                              : "border-gray-200 dark:border-gray-700"
                          } ${isUnlocked && theme.isPremium ? "premium" : ""}`}
                        >
                          {/* Theme preview */}
                          <div 
                            className="h-24 w-full relative"
                            style={{
                              background: theme.isPremium 
                                ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary}, ${theme.accent})`
                                : `linear-gradient(to right, ${theme.primary}, ${theme.secondary})`
                            }}
                          >
                            {theme.isPremium && (
                              <div className="absolute top-2 right-2">
                                <FaCrown className="text-yellow-300 drop-shadow-md h-4 w-4" />
                              </div>
                            )}
                          </div>
                          
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                                {theme.name}
                                {theme.isPremium && (
                                  <div className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                    Premium
                                  </div>
                                )}
                              </h4>
                              {theme.isPremium && !isUnlocked && !isAdmin && (
                                <div className="text-gray-500 dark:text-gray-400">
                                  <FaLock className="w-4 h-4" />
                                </div>
                              )}
                              {isActive && (
                                <div className="text-green-500">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex mt-2 space-x-1">
                              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.primary }}></div>
                              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.secondary }}></div>
                              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.accent }}></div>
                            </div>
                            
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 mb-3">
                              {theme.description}
                            </p>
                            
                            <button
                              onClick={() => applyTheme(key)}
                              disabled={!isUnlocked && !isAdmin}
                              className={`w-full py-1.5 rounded-md text-center text-sm ${
                                isUnlocked || isAdmin
                                  ? isActive
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : "btn-primary"
                                  : "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700"
                              }`}
                            >
                              {isActive ? "Active" : isUnlocked || isAdmin ? "Apply" : "Locked"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {!isAdmin && unlockedThemes.filter(t => premiumThemes[t].isPremium).length === 0 && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg">
                      <p className="text-sm">
                        <span className="font-medium">No premium themes unlocked yet.</span>{" "}
                        Complete achievements to unlock premium themes. Visit the Achievements page to track your progress.
                      </p>
                      <button 
                        onClick={() => navigate("/achievements")}
                        className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Go to Achievements
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-between">
            <button
              onClick={() => navigate("/profile")}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white flex items-center"
            >
              <FaTimes className="w-5 h-5 mr-2" />
              <span>{getTranslation("back", userPreferences.language)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings; 