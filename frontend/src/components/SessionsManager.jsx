import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLogOut, FiSettings, FiTrash2, FiClock, FiShield, FiInfo, FiMonitor, FiSmartphone, FiGlobe } from 'react-icons/fi';
import { getUserSessions, revokeSession, revokeAllSessions, updateSessionSettings, logoutUser } from '../api/auth';
import { format, formatDistanceToNow } from 'date-fns';

const SessionsManager = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const sessionsData = await getUserSessions();
      
      // Find current session
      const currentToken = localStorage.getItem('access_token');
      const current = sessionsData.find(s => s.token === currentToken) || sessionsData[0];
      
      setSessions(sessionsData);
      setCurrentSession(current);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load sessions. Please try again.');
      setLoading(false);
    }
  };

  const handleRevoke = async (sessionId) => {
    try {
      await revokeSession(sessionId);
      // Update sessions list
      setSessions(sessions.filter(s => s.id !== sessionId));
    } catch (err) {
      console.error('Error revoking session:', err);
      setError('Failed to revoke session. Please try again.');
    }
  };

  const handleRevokeAll = async () => {
    try {
      await revokeAllSessions();
      // Update sessions list - keep only current session
      if (currentSession) {
        setSessions(sessions.filter(s => s.id === currentSession.id));
      } else {
        setSessions([]);
      }
    } catch (err) {
      console.error('Error revoking all sessions:', err);
      setError('Failed to revoke all sessions. Please try again.');
    }
  };

  const handleToggleMultipleSessions = async (e) => {
    const newValue = e.target.checked;
    setAllowMultiple(newValue);
    
    try {
      await updateSessionSettings(newValue);
    } catch (err) {
      console.error('Error updating session settings:', err);
      setError('Failed to update settings. Please try again.');
      // Revert UI if the API call fails
      setAllowMultiple(!newValue);
    }
  };

  const getDeviceIcon = (deviceInfo) => {
    if (!deviceInfo || deviceInfo === 'Unknown') return <FiGlobe />;
    if (deviceInfo === 'Mobile') return <FiSmartphone />;
    if (deviceInfo === 'Tablet') return <FiSmartphone />;
    return <FiMonitor />;
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold flex items-center">
          <FiShield className="mr-2 w-4 h-4" />
          Session Management
        </h2>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white flex items-center text-xs px-3 py-1.5 rounded-md transition-colors"
        >
          <FiLogOut className="mr-1 w-3 h-3" />
          Logout
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}
      
      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={allowMultiple}
                  onChange={handleToggleMultipleSessions}
                />
                <div className={`block w-8 h-5 rounded-full ${allowMultiple ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition ${allowMultiple ? 'transform translate-x-3' : ''}`}></div>
              </div>
              <span className="ml-2 text-sm font-medium">
                Allow multiple sessions
              </span>
            </label>
            <div className="ml-2 text-gray-400 cursor-help" title="When disabled, logging in on a new device will automatically log out all other devices.">
              <FiInfo size={14} />
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {allowMultiple 
            ? "You can be logged in on multiple devices at the same time." 
            : "When you log in on a new device, you'll be logged out from all other devices."}
        </p>
      </div>

      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
        <h3 className="text-sm font-medium mb-3 flex items-center">
          <FiUser className="mr-1 w-4 h-4" /> Active Sessions ({sessions.length})
        </h3>

        {sessions.length === 0 ? (
          <div className="text-center text-gray-500 py-6 text-sm">
            <FiUser className="mx-auto mb-2 w-8 h-8 text-gray-300" />
            <p>No active sessions found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map(session => (
              <div 
                key={session.id} 
                className={`border rounded-lg p-2.5 flex justify-between items-center ${
                  currentSession && session.id === currentSession.id 
                    ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex items-center flex-1 min-w-0">
                  <div className="text-blue-500 mr-2 flex-shrink-0">
                    {getDeviceIcon(session.device_info)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm flex items-center">
                      <span className="truncate">{session.device_info || 'Unknown Device'}</span>
                      {currentSession && session.id === currentSession.id && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded flex-shrink-0">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                      <div className="flex items-center">
                        <FiGlobe className="mr-1 w-3 h-3" /> 
                        <span className="truncate">{session.ip_address || 'Unknown IP'}</span>
                      </div>
                      <div className="flex items-center">
                        <FiClock className="mr-1 w-3 h-3" /> 
                        <span className="truncate">Created {formatDistanceToNow(new Date(session.created_at))} ago</span>
                      </div>
                    </div>
                  </div>
                </div>
                {(!currentSession || session.id !== currentSession.id) && (
                  <button 
                    onClick={() => handleRevoke(session.id)} 
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded flex-shrink-0"
                    title="End this session"
                  >
                    <FiTrash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {sessions.length > 1 && (
        <div className="flex justify-end">
          <button
            onClick={handleRevokeAll}
            className="text-xs text-red-500 hover:text-red-600 border border-red-300 px-3 py-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center transition-colors"
          >
            <FiLogOut className="mr-1 w-3 h-3" />
            Logout from all other devices
          </button>
        </div>
      )}
    </div>
  );
};

export default SessionsManager; 