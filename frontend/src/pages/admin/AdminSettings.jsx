import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCog, FaSave, FaSync } from "react-icons/fa";
import LoadingSpinner from "../../components/LoadingSpinner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [adminSettings, setAdminSettings] = useState({
    auto_verify_users: false,
    require_email_verification: true,
    require_2fa_admins: true,
    session_timeout: 60,
    backup_frequency: "daily",
    data_retention_months: 24,
    notify_new_users: true,
    notify_system_alerts: true
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const navigate = useNavigate();

  // Fetch admin settings
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          if (response.status === 403) {
            setError("You don't have admin privileges to access this page.");
            setTimeout(() => navigate("/"), 3000);
            return;
          }
          throw new Error("Failed to fetch admin settings");
        }

        const data = await response.json();
        setAdminSettings(data);
      } catch (err) {
        console.error("Error fetching admin settings:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [navigate]);

  // Handle settings changes
  const handleSettingChange = (key, value) => {
    setAdminSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Save settings
  const handleSaveSettings = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setSavingSettings(true);
      const response = await fetch(`${API_URL}/admin/settings`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(adminSettings)
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      const data = await response.json();
      setAdminSettings(data.settings);
      setSuccess(data.message);
      setError(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setError("Failed to save settings. Please try again.");
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <FaCog className="text-gray-500" />
          Admin Settings
        </h1>
        <button
          onClick={handleSaveSettings}
          disabled={savingSettings}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2 disabled:bg-blue-300 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          {savingSettings ? (
            <>
              <FaSync className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <FaSave />
              Save Settings
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md mb-6">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 text-green-700 dark:text-green-300 p-4 rounded-md mb-6">
          <p>{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* User Management Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">User Management</h3>
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg gap-3">
              <div className="flex-1">
                <p className="font-medium">Auto-verify New Users</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatically verify email for new registrations
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={adminSettings.auto_verify_users}
                  onChange={(e) => handleSettingChange('auto_verify_users', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg gap-3">
              <div className="flex-1">
                <p className="font-medium">Require Email Verification</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Users must verify email before accessing features
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={adminSettings.require_email_verification}
                  onChange={(e) => handleSettingChange('require_email_verification', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Security</h3>
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg gap-3">
              <div className="flex-1">
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Require 2FA for admin accounts
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={adminSettings.require_2fa_admins}
                  onChange={(e) => handleSettingChange('require_2fa_admins', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg gap-3">
              <div className="flex-1">
                <p className="font-medium">Session Timeout</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatically log out inactive admins
                </p>
              </div>
              <select
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 flex-shrink-0"
                value={adminSettings.session_timeout}
                onChange={(e) => handleSettingChange('session_timeout', parseInt(e.target.value))}
              >
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="240">4 hours</option>
              </select>
            </div>
          </div>
        </div>

        {/* Backup Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Backup & Maintenance</h3>
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg gap-3">
              <div className="flex-1">
                <p className="font-medium">Automatic Backups</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Schedule regular database backups
                </p>
              </div>
              <select
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 flex-shrink-0"
                value={adminSettings.backup_frequency}
                onChange={(e) => handleSettingChange('backup_frequency', e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg gap-3">
              <div className="flex-1">
                <p className="font-medium">Data Retention</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Keep workout history for
                </p>
              </div>
              <select
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 flex-shrink-0"
                value={adminSettings.data_retention_months}
                onChange={(e) => handleSettingChange('data_retention_months', parseInt(e.target.value))}
              >
                <option value="6">6 months</option>
                <option value="12">1 year</option>
                <option value="24">2 years</option>
                <option value="0">Forever</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notifications</h3>
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg gap-3">
              <div className="flex-1">
                <p className="font-medium">New User Alerts</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get notified of new registrations
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={adminSettings.notify_new_users}
                  onChange={(e) => handleSettingChange('notify_new_users', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg gap-3">
              <div className="flex-1">
                <p className="font-medium">System Alerts</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive system status notifications
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={adminSettings.notify_system_alerts}
                  onChange={(e) => handleSettingChange('notify_system_alerts', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings; 