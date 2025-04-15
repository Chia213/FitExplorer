import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaUser,
  FaInfoCircle,
  FaDumbbell,
  FaSearch,
  FaBars,
  FaTimes,
  FaSave,
  FaSignOutAlt,
  FaHistory,
  FaListAlt,
  FaRunning,
  FaAtlas,
  FaLock,
  FaChartLine,
  FaBell,
  FaCalculator,
  FaTools,
  FaQuestionCircle,
  FaAppleAlt,
  FaRobot,
  FaChevronDown,
  FaCog,
  FaQrcode,
} from "react-icons/fa";
import { LuBicepsFlexed, LuCalendarClock } from "react-icons/lu";
import logo from "../assets/Ronjasdrawing.png";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../hooks/useTheme";
import NotificationDropdown from "./NotificationDropdown";
import { useNotifications } from "../contexts/NotificationContext";
import MobileInstallQR from "./MobileInstallQR";
import "../styles/navHover.css";
import "../styles/navbar.css";
import { notifyWorkoutCompleted } from '../utils/notificationsHelpers';
import { SunIcon, MoonIcon } from "lucide-react";

// Mobile Accordion component for the mobile menu
const MobileAccordion = ({ title, icon, items, onItemClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-3 px-1 font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        <div className="flex items-center">
          {icon}
          <span>{title}</span>
        </div>
        <FaChevronDown className={`w-3 h-3 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <div className={`mt-2 ml-2 pl-6 border-l border-gray-200 dark:border-gray-700 space-y-1 ${isOpen ? 'block' : 'hidden'}`}>
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center py-2 px-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-sm"
            onClick={onItemClick}
          >
            <span className="mr-2">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Navigation items grouped by category
const NAVIGATION_ITEMS = {
  workout: [
    { label: 'Workout Generator', path: '/workout-generator', icon: <FaDumbbell /> },
    { label: 'AI Workout Generator', path: '/ai-workout-generator', icon: <FaRobot /> },
    { label: 'Workout Log', path: '/workout-log', icon: <FaListAlt /> },
    { label: 'Workout History', path: '/workout-history', icon: <FaHistory /> },
    { label: 'My Routines', path: '/routines', icon: <FaSave /> },
  ],
  tools: [
    { label: 'Fitness Calculator', path: '/fitness-calculator', icon: <FaCalculator /> },
    { label: 'Nutrition', path: '/nutrition', icon: <FaAppleAlt /> },
    { label: 'Progress Tracker', path: '/progress-tracker', icon: <FaChartLine /> },
    { label: 'Muscle Guide', path: '/explore-muscle-guide', icon: <LuBicepsFlexed /> },
  ],
  help: [
    { label: 'About', path: '/about', icon: <FaInfoCircle /> },
    { label: 'FAQ', path: '/faq', icon: <FaQuestionCircle /> },
    { label: 'Privacy Policy', path: '/privacy-policy', icon: <FaLock /> },
    { label: 'Terms of Service', path: '/terms', icon: <FaListAlt /> }
  ]
};

// Dropdown component for better code organization
const NavDropdown = ({ isOpen, children, align = "right" }) => {
  if (!isOpen) return null;
  
  return (
    <div 
      className={`dropdown-menu ${align === "right" ? "right-0" : "left-0"} mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden z-50 w-56 border border-gray-200 dark:border-gray-700 animate-fadeIn`}
      role="menu"
      aria-orientation="vertical"
    >
      {children}
    </div>
  );
};

// Dropdown item component
const DropdownItem = ({ to, onClick, children, className = "" }) => {
  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <Link
      to={to}
      className={`block p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center text-gray-700 dark:text-gray-200 ${className}`}
      onClick={handleClick}
      role="menuitem"
    >
      {children}
    </Link>
  );
};

// Main Navbar component
function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [username, setUsername] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [emojiPrefs, setEmojiPrefs] = useState(() => {
    // Try to get saved emoji prefs from localStorage first
    try {
      const savedPrefs = localStorage.getItem("emoji_prefs");
      if (savedPrefs) {
        return JSON.parse(savedPrefs);
      }
    } catch (e) {
      console.warn("Could not parse saved emoji preferences:", e);
    }
    
    // Default fallback values
    return {
      show: true,
      emoji: "🏋️‍♂️",
      animation: "lift",
      customEmojiSrc: null
    };
  });
  
  // Dropdowns state
  const [workoutDropdownOpen, setWorkoutDropdownOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [helpDropdownOpen, setHelpDropdownOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  
  // Refs for detecting outside clicks
  const workoutDropdownRef = useRef(null);
  const toolsDropdownRef = useRef(null);
  const helpDropdownRef = useRef(null);
  const authDropdownRef = useRef(null);
  const searchRef = useRef(null);
  
  // Custom hooks
  const { theme, toggleTheme } = useTheme() || { theme: 'light', toggleTheme: () => {} };
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get notification context with safe fallback
  const notifications = useNotifications();
  const unreadCount = notifications?.unreadCount || 0;
  const addNotification = notifications?.addNotification || (() => {});
  
  // State hooks
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [showEmojiSettings, setShowEmojiSettings] = useState(false);
  const emojiSettingsRef = useRef(null);

  // Track scroll position for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check authentication status when location changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      
      if (!token) {
        setIsAuthenticated(false);
        setUsername(null);
        setIsAdmin(false);
        return;
      }
      
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        // Check if token is expired
        const expiry = new Date(decodedToken.exp * 1000);
        const isExpired = expiry < new Date();
        
        if (isExpired) {
          // Token is expired
          setIsAuthenticated(false);
          setUsername(null);
          setIsAdmin(false);
          localStorage.removeItem("token");
          localStorage.removeItem("access_token");
          localStorage.removeItem("isAdmin");
          return;
        }
        
        setUsername(decodedToken.sub);
        setIsAuthenticated(true);
        
        // Check admin status
        const adminStatus = decodedToken.is_admin === true;
        setIsAdmin(adminStatus);
        localStorage.setItem("isAdmin", adminStatus ? "true" : "false");
        
        // Fetch emoji preferences
        fetchEmojiPreferences();
      } catch (error) {
        // Handle token parsing errors
        console.error("Error parsing token:", error);
        setIsAdmin(false);
        setIsAuthenticated(false);
        setUsername(null);
        localStorage.removeItem("token");
        localStorage.removeItem("access_token");
        localStorage.setItem("isAdmin", "false");
      }
    };
    
    // Fetch emoji preferences
    const fetchEmojiPreferences = async () => {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("access_token");
        if (!token) return;
        
        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/user-profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const userData = await response.json();
          if (userData.preferences) {
            const emojiPreferences = {
              show: userData.preferences.show_profile_emoji || true,
              emoji: userData.preferences.profile_emoji || "🏋️‍♂️",
              animation: userData.preferences.emoji_animation || "lift",
              customEmojiSrc: userData.preferences.custom_emoji_src || null
            };
            
            setEmojiPrefs(emojiPreferences);
            
            // Save to localStorage as a backup
            try {
              localStorage.setItem("emoji_prefs", JSON.stringify(emojiPreferences));
            } catch (e) {
              console.warn("Could not save emoji preferences to localStorage:", e);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching emoji preferences:", error);
      }
    };
    
    // Check auth on mount and location change
    checkAuth();
    
    // Add storage event listener to detect token changes from other tabs/components
    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === "access_token" || e.key === null) {
        // If token was changed or removed, or localStorage was cleared
        checkAuth();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    // Listen for auth-change events
    const handleAuthChange = () => {
      checkAuth();
    };
    
    window.addEventListener("auth-change", handleAuthChange);
    
    // Clean up the event listeners
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, [location]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Handle dropdown toggle functions
  const toggleWorkoutDropdown = () => {
    setToolsDropdownOpen(false);
    setHelpDropdownOpen(false);
    setAuthDropdownOpen(false);
    setWorkoutDropdownOpen(!workoutDropdownOpen);
  };
  
  const toggleToolsDropdown = () => {
    setWorkoutDropdownOpen(false);
    setHelpDropdownOpen(false);
    setAuthDropdownOpen(false);
    setToolsDropdownOpen(!toolsDropdownOpen);
  };
  
  const toggleHelpDropdown = () => {
    setWorkoutDropdownOpen(false);
    setToolsDropdownOpen(false);
    setAuthDropdownOpen(false);
    setHelpDropdownOpen(!helpDropdownOpen);
  };
  
  const toggleAuthDropdown = () => {
    // Verify authentication state before showing dropdown
    const token = localStorage.getItem("token") || localStorage.getItem("access_token");
    if (!token) {
      setIsAuthenticated(false);
      setUsername(null);
      setIsAdmin(false);
    }
    setWorkoutDropdownOpen(false);
    setToolsDropdownOpen(false);
    setHelpDropdownOpen(false);
    setAuthDropdownOpen(!authDropdownOpen);
  };
  
  // Centralized function to close all dropdowns
  const closeAllDropdowns = () => {
    setWorkoutDropdownOpen(false);
    setToolsDropdownOpen(false);
    setHelpDropdownOpen(false);
    setAuthDropdownOpen(false);
  };

  // Handle click outside for all dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click was on any dropdown button
      const notificationButton = document.querySelector('[aria-label^="Notifications"]');
      const profileButton = document.querySelector('[aria-label^="Profile"]');
      const themeButton = document.querySelector('[aria-label^="Theme"]');
      
      if (notificationButton && notificationButton.contains(event.target)) {
        return;
      }
      if (profileButton && profileButton.contains(event.target)) {
        return;
      }
      if (themeButton && themeButton.contains(event.target)) {
        return;
      }

      // Check if the click was inside any dropdown
      const notificationDropdown = document.querySelector('.notification-dropdown');
      const profileDropdown = document.querySelector('.profile-dropdown');
      const themeDropdown = document.querySelector('.theme-dropdown');

      if (notificationDropdown && notificationDropdown.contains(event.target)) {
        // Don't close the dropdown if clicking inside it
        return;
      }
      if (profileDropdown && profileDropdown.contains(event.target)) {
        return;
      }
      if (themeDropdown && themeDropdown.contains(event.target)) {
        return;
      }

      // Close all dropdowns if click was outside
      setShowNotifications(false);
      setShowProfile(false);
      setShowTheme(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle notification dropdown
  const toggleNotifications = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowNotifications(!showNotifications);
    setShowProfile(false);
    setShowTheme(false);
  };

  // Toggle profile dropdown
  const toggleProfile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowProfile(!showProfile);
    setShowNotifications(false);
    setShowTheme(false);
  };

  // Handle theme toggle with dropdown
  const handleThemeToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTheme(!showTheme);
    setShowNotifications(false);
    setShowProfile(false);
    toggleTheme(); // Call the imported toggleTheme function
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      
      if (token) {
        await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("isAdmin");
      
      // Dispatch events to notify other components
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("auth-change"));
      
      // Close dropdown
      setAuthDropdownOpen(false);
      
      // Navigate to login page
      navigate("/login");
    }
  };  

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query.length > 0) {
      // Combine all navigation items into one array for searching
      const allItems = [
        ...NAVIGATION_ITEMS.workout,
        ...NAVIGATION_ITEMS.tools,
        ...NAVIGATION_ITEMS.help,
      ];

      // First, try to find exact matches at the start of words
      let filtered = allItems.filter(item =>
        item.label.toLowerCase().startsWith(query)
      );

      // If no exact matches, look for partial matches
      if (filtered.length === 0) {
        filtered = allItems.filter(item => {
          const words = item.label.toLowerCase().split(' ');
          return words.some(word => word.startsWith(query)) ||
                 item.label.toLowerCase().includes(query);
        });
      }

      // Sort results: exact matches first, then partial matches
      filtered.sort((a, b) => {
        const aStartsWith = a.label.toLowerCase().startsWith(query);
        const bStartsWith = b.label.toLowerCase().startsWith(query);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return a.label.localeCompare(b.label);
      });

      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };
  
  // Handle search result selection
  const handleResultClick = (path) => {
    setSearchQuery("");
    setSearchResults([]);
    setMobileMenuOpen(false);
    navigate(path);
  };

  const createSampleNotification = () => {
    addNotification({
      title: "New Notification",
      message: "This is a test notification",
      type: "info",
      icon: "dumbbell" // Available icons: dumbbell, user, calendar
    });
  };

  // Add an event listener to handle clicks outside the emoji settings dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiSettingsRef.current && !emojiSettingsRef.current.contains(event.target)) {
        setShowEmojiSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Listen for preferences changes
  useEffect(() => {
    const handlePreferencesChange = (event) => {
      // If the event has specific emoji details, use them directly for immediate update
      if (event.detail && event.detail.type === 'emoji') {
        const { show, emoji, animation, customEmojiSrc } = event.detail;
        const emojiPreferences = {
          show,
          emoji,
          animation,
          customEmojiSrc
        };
        
        setEmojiPrefs(emojiPreferences);
        
        // Save to localStorage as a backup
        try {
          localStorage.setItem("emoji_prefs", JSON.stringify(emojiPreferences));
        } catch (e) {
          console.warn("Could not save emoji preferences to localStorage:", e);
        }
        
        console.log('Updated emoji preferences directly from event:', event.detail);
      } else {
        // Reference to fetchEmojiPreferences is not available in this scope
        // Use a function reference that's always available
        const fetchPreferences = async () => {
          try {
            const token = localStorage.getItem("token") || localStorage.getItem("access_token");
            if (!token) return;
            
            const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/user-profile`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.ok) {
              const userData = await response.json();
              if (userData.preferences) {
                setEmojiPrefs({
                  show: userData.preferences.show_profile_emoji || true,
                  emoji: userData.preferences.profile_emoji || "🏋️‍♂️",
                  animation: userData.preferences.emoji_animation || "lift",
                  customEmojiSrc: userData.preferences.custom_emoji_src || null
                });
              }
            }
          } catch (error) {
            console.error("Error fetching emoji preferences:", error);
          }
        };

        fetchPreferences();
      }
    };
    
    window.addEventListener('preferences-change', handlePreferencesChange);
    return () => {
      window.removeEventListener('preferences-change', handlePreferencesChange);
    };
  }, []);

  // Toggle emoji setting
  const toggleEmojiSetting = async (setting, value) => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      if (!token) return;

      // Get current preferences first
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/user-profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) return;
      
      const userData = await response.json();
      const currentPrefs = userData.preferences || {};
      
      // Update appropriate setting
      let updatedPrefs = {
        email_notifications: currentPrefs.email_notifications || true,
        summary_frequency: currentPrefs.summary_frequency || null,
        summary_day: currentPrefs.summary_day || null,
        use_custom_card_color: currentPrefs.use_custom_card_color || false,
        card_color: currentPrefs.card_color || "#dbeafe"
      };
      
      // Update the local emojiPrefs state
      let updatedEmojiPrefs = { ...emojiPrefs };
      
      if (setting === 'show') {
        updatedPrefs.show_profile_emoji = value;
        updatedEmojiPrefs.show = value;
      } else if (setting === 'emoji') {
        updatedPrefs.profile_emoji = value;
        updatedEmojiPrefs.emoji = value;
      } else if (setting === 'animation') {
        updatedPrefs.emoji_animation = value;
        updatedEmojiPrefs.animation = value;
      }
      
      // Update local state
      setEmojiPrefs(updatedEmojiPrefs);
      
      // Save to localStorage as backup
      try {
        localStorage.setItem("emoji_prefs", JSON.stringify(updatedEmojiPrefs));
      } catch (e) {
        console.warn("Could not save emoji preferences to localStorage:", e);
      }
      
      // Save updated preferences to backend
      await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/user/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedPrefs)
      });
      
      // No need to refetch as we've already updated the local state
    } catch (error) {
      console.error("Error updating emoji preferences:", error);
    }
  };

  return (
    <>
      {/* Desktop & Tablet Navbar */}
      <header 
        className={`navbar w-full ${
          isScrolled ? 'navbar-glass shadow-md py-2' : 'bg-white dark:bg-gray-900 py-4'
        } transition-all duration-300`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center relative">
            {/* Logo and brand */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center logo-container">
                <img 
                  src={logo} 
                  alt="FitExplorer Logo" 
                  className="h-14 w-auto dark:invert" 
                />
              </Link>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:block relative w-64" ref={searchRef}>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full py-2 pl-10 pr-4 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                />
              </div>
              
              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((result) => (
                    <div
                      key={result.path}
                      className="search-result-item flex items-center"
                      onClick={() => handleResultClick(result.path)}
                    >
                      {result.icon}
                      <span>{result.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Main navigation - Only show on tablet/desktop */}
            <div className="hidden md:flex items-center space-x-1">
              {/* Workout dropdown */}
              <div className="relative" ref={workoutDropdownRef}>
                <button
                  onClick={toggleWorkoutDropdown}
                  className={`flex items-center px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                    workoutDropdownOpen ? 'bg-gray-100 dark:bg-gray-800' : ''
                  }`}
                  aria-expanded={workoutDropdownOpen}
                >
                  <FaDumbbell className="mr-1" />
                  <span className="mr-1">Workouts</span>
                  <FaChevronDown className={`w-3 h-3 transform transition-transform ${workoutDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <NavDropdown isOpen={workoutDropdownOpen}>
                  {NAVIGATION_ITEMS.workout.map((item) => (
                    <DropdownItem key={item.path} to={item.path} onClick={() => setWorkoutDropdownOpen(false)}>
                      {item.icon}
                      {item.label}
                    </DropdownItem>
                  ))}
                </NavDropdown>
              </div>

              {/* Tools dropdown */}
              <div className="relative" ref={toolsDropdownRef}>
                <button
                  onClick={toggleToolsDropdown}
                  className={`flex items-center px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                    toolsDropdownOpen ? 'bg-gray-100 dark:bg-gray-800' : ''
                  }`}
                  aria-expanded={toolsDropdownOpen}
                >
                  <FaTools className="mr-1" />
                  <span className="mr-1">Tools</span>
                  <FaChevronDown className={`w-3 h-3 transform transition-transform ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <NavDropdown isOpen={toolsDropdownOpen}>
                  {NAVIGATION_ITEMS.tools.map((item) => (
                    <DropdownItem key={item.path} to={item.path} onClick={() => setToolsDropdownOpen(false)}>
                      {item.icon}
                      {item.label}
                    </DropdownItem>
                  ))}
                </NavDropdown>
              </div>

              {/* Help dropdown */}
              <div className="relative" ref={helpDropdownRef}>
                <button
                  onClick={toggleHelpDropdown}
                  className={`flex items-center px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                    helpDropdownOpen ? 'bg-gray-100 dark:bg-gray-800' : ''
                  }`}
                  aria-expanded={helpDropdownOpen}
                >
                  <FaInfoCircle className="mr-1" />
                  <span className="mr-1">Help</span>
                  <FaChevronDown className={`w-3 h-3 transform transition-transform ${helpDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <NavDropdown isOpen={helpDropdownOpen}>
                  {NAVIGATION_ITEMS.help.map((item) => (
                    <DropdownItem key={item.path} to={item.path} onClick={() => setHelpDropdownOpen(false)}>
                      {item.icon}
                      {item.label}
                    </DropdownItem>
                  ))}
                </NavDropdown>
              </div>
            </div>

            {/* Right side items */}
            <div className="flex items-center space-x-2">
              {/* QR Code for mobile install */}
              <button
                onClick={() => setShowQRModal(true)}
                className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Install Mobile App"
                title="Scan to install on mobile"
              >
                <FaQrcode className="w-5 h-5" />
              </button>
              
              {/* Theme toggle */}
              <button
                onClick={handleThemeToggle}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <SunIcon className="h-6 w-6 text-yellow-500" />
                ) : (
                  <MoonIcon className="h-6 w-6 text-gray-600" />
                )}
              </button>

              {/* Notifications */}
              {isAuthenticated && (
                <div className="relative">
                  <button
                    onClick={toggleNotifications}
                    className="nav-item flex flex-col items-center p-3 hover:bg-sky-700/20 dark:hover:bg-sky-700/40 rounded-md transition-all"
                    aria-label={`Notifications - ${unreadCount} unread`}
                    ref={notificationsRef}
                  >
                    <div className="relative">
                      <FaBell className="nav-icon" size={20} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="nav-text text-sm mt-1">Alerts</span>
                  </button>
                  <NotificationDropdown 
                    isOpen={showNotifications} 
                    toggleDropdown={toggleNotifications} 
                  />
                </div>
              )}

              {/* User menu - Desktop */}
              <div className="hidden md:block">
                {isAuthenticated ? (
                  <div className="relative" ref={authDropdownRef}>
                    <div className="flex items-center space-x-2">
                      {/* Emoji Settings Button */}
                      <div className="relative" ref={emojiSettingsRef}>
                        <button
                          onClick={() => setShowEmojiSettings(!showEmojiSettings)}
                          className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 text-lg p-2 rounded-lg"
                          title="Emoji Settings"
                        >
                          {emojiPrefs.show ? (
                            emojiPrefs.emoji && emojiPrefs.emoji.startsWith('custom:') && emojiPrefs.customEmojiSrc ? (
                              <img 
                                src={emojiPrefs.customEmojiSrc} 
                                alt="Custom emoji" 
                                className={`w-6 h-6 object-contain ${emojiPrefs.animation !== "none" ? `animate-${emojiPrefs.animation}` : ""}`}
                              />
                            ) : (
                              <span className={emojiPrefs.animation !== "none" ? `animate-${emojiPrefs.animation}` : ""}>
                                {emojiPrefs.emoji}
                              </span>
                            )
                          ) : "😶"}
                        </button>
                        
                        {/* Emoji Settings Dropdown */}
                        {showEmojiSettings && (
                          <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden z-50 border border-gray-200 dark:border-gray-700">
                            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-800 dark:text-gray-200">Emoji Settings</span>
                                <div className="flex items-center space-x-1">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">Show</span>
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={emojiPrefs.show}
                                      onChange={(e) => toggleEmojiSetting('show', e.target.checked)}
                                      className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                  </label>
                                </div>
                              </div>
                            </div>
                            
                            {emojiPrefs.show && (
                              <>
                                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                                  <div className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Choose Emoji
                                  </div>
                                  <div className="grid grid-cols-6 gap-1">
                                    {["🏋️‍♂️", "💪", "🏃‍♂️", "🏃‍♀️", "🚴", "🏊‍♂️", "⚽", "🏀", "🎯", "🥊", "🐻", "🦁"].map(emoji => (
                                      <button
                                        key={emoji}
                                        onClick={() => toggleEmojiSetting('emoji', emoji)}
                                        className={`w-8 h-8 flex items-center justify-center text-lg rounded ${
                                          emojiPrefs.emoji === emoji 
                                            ? "bg-blue-100 dark:bg-blue-900/30" 
                                            : "hover:bg-gray-100 dark:hover:bg-gray-700"
                                        }`}
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                  <div className="mt-2 text-center">
                                    <Link 
                                      to="/settings?tab=appearance" 
                                      onClick={() => setShowEmojiSettings(false)}
                                      className="text-xs text-blue-500 hover:text-blue-700 flex items-center justify-center"
                                    >
                                      <span className="mr-1">More emoji options</span>
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                      </svg>
                                    </Link>
                                  </div>
                                </div>
                                
                                <div className="p-2">
                                  <div className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Animation Style
                                  </div>
                                  <div className="grid grid-cols-2 gap-1">
                                    {[
                                      { id: "lift", label: "Lift" },
                                      { id: "bounce", label: "Bounce" },
                                      { id: "spin", label: "Spin" },
                                      { id: "pulse", label: "Pulse" },
                                      { id: "wave", label: "Wave" },
                                      { id: "shake", label: "Shake" },
                                      { id: "flip", label: "Flip" },
                                      { id: "rotate", label: "Rotate" },
                                      { id: "sparkle", label: "Sparkle" },
                                      { id: "float", label: "Float" },
                                      { id: "wiggle", label: "Wiggle" },
                                      { id: "zoom", label: "Zoom" },
                                      { id: "workout", label: "Workout" }
                                    ].map(animation => (
                                      <button
                                        key={animation.id}
                                        onClick={() => toggleEmojiSetting('animation', animation.id)}
                                        className={`px-2 py-1 text-xs rounded flex items-center ${
                                          emojiPrefs.animation === animation.id
                                            ? "bg-blue-100 dark:bg-blue-900/30 font-medium"
                                            : "hover:bg-gray-100 dark:hover:bg-gray-700"
                                        }`}
                                      >
                                        <span className="mr-1">{animation.label}</span>
                                        <span 
                                          className={`profile-emoji ${animation.id}`}
                                          data-emoji={emojiPrefs.emoji}
                                        ></span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                                  More options in <a href="/settings?tab=appearance" className="text-blue-500 hover:underline">Settings</a>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={toggleAuthDropdown}
                        className={`flex items-center px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                          authDropdownOpen ? 'bg-gray-100 dark:bg-gray-800' : ''
                        }`}
                        aria-expanded={authDropdownOpen}
                      >
                        <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium mr-2">
                          {username ? username.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="font-medium text-sm flex items-center">
                          {username}
                        </div>
                        <FaChevronDown className={`ml-1 w-3 h-3 transform transition-transform ${authDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    
                    <NavDropdown isOpen={authDropdownOpen}>
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="font-medium text-sm flex items-center">
                          {username}
                          {emojiPrefs.show && (
                            <span 
                              className={`profile-emoji ${emojiPrefs.animation}`}
                              data-emoji={emojiPrefs.emoji}
                            ></span>
                          )}
                        </div>
                        {isAdmin && (
                          <div className="admin-badge mt-1 inline-block">ADMIN</div>
                        )}
                      </div>
                      <DropdownItem to="/profile" onClick={() => setAuthDropdownOpen(false)}>
                        <FaUser className="mr-2 text-blue-500" />
                        Profile
                      </DropdownItem>
                      <DropdownItem to="/settings" onClick={() => setAuthDropdownOpen(false)}>
                        <FaCog className="mr-2 text-gray-500" />
                        Settings
                      </DropdownItem>
                      <DropdownItem to="/saved-programs" onClick={() => setAuthDropdownOpen(false)}>
                        <FaSave className="mr-2 text-indigo-500" />
                        Saved Programs
                      </DropdownItem>
                      <DropdownItem to="/personal-records" onClick={() => setAuthDropdownOpen(false)}>
                        <FaRunning className="mr-2 text-green-500" />
                        Personal Records
                      </DropdownItem>
                      <DropdownItem to="/achievements" onClick={() => setAuthDropdownOpen(false)}>
                        <FaAtlas className="mr-2 text-orange-500" />
                        Achievements
                      </DropdownItem>
                      {isAdmin && (
                        <DropdownItem to="/admin" onClick={() => setAuthDropdownOpen(false)}>
                          <FaLock className="mr-2 text-purple-500" />
                          Admin Dashboard
                        </DropdownItem>
                      )}
                      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center text-red-600 dark:text-red-400"
                        >
                          <FaSignOutAlt className="mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </NavDropdown>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link
                      to="/login"
                      className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden menu-button flex items-center justify-center p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                <div className="relative w-6 h-5">
                  <span 
                    className={`menu-button-bar bg-current ${
                      mobileMenuOpen ? 'top-2 rotate-45' : 'top-0'
                    }`}
                  ></span>
                  <span 
                    className={`menu-button-bar bg-current top-2 ${
                      mobileMenuOpen ? 'opacity-0' : 'opacity-100'
                    }`}
                  ></span>
                  <span 
                    className={`menu-button-bar bg-current ${
                      mobileMenuOpen ? 'top-2 -rotate-45' : 'top-4'
                    }`}
                  ></span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-50 md:hidden transform ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)}></div>
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-900 shadow-xl flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <img src={logo} alt="FitExplorer" className="h-12 w-auto dark:invert" />
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
              aria-label="Close menu"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full py-2 pl-10 pr-4 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="search-results mt-2">
                {searchResults.map((result) => (
                  <div
                    key={result.path}
                    className="search-result-item flex items-center"
                    onClick={() => {
                      handleResultClick(result.path);
                      setMobileMenuOpen(false);
                    }}
                  >
                    {result.icon}
                    <span>{result.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mobile navigation */}
          <div className="overflow-y-auto flex-1 p-4">
            {/* Auth section */}
            {isAuthenticated ? (
              <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium mr-3">
                    {username ? username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="font-medium flex items-center">
                      {username}
                      {emojiPrefs.show && (
                        <span 
                          className={`profile-emoji ${emojiPrefs.animation}`}
                          data-emoji={emojiPrefs.emoji}
                        ></span>
                      )}
                    </div>
                    {isAdmin && <div className="admin-badge mt-1">ADMIN</div>}
                  </div>
                </div>
                
                {/* Quick Emoji Settings in Mobile View */}
                <div className="mb-3 p-2 bg-white dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Profile Emoji</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Show</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={emojiPrefs.show}
                          onChange={(e) => toggleEmojiSetting('show', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                  
                  {emojiPrefs.show && (
                    <>
                      <div className="mb-2">
                        <div className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                          Choose Emoji
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {["🏋️‍♂️", "💪", "🏃‍♂️", "🏃‍♀️", "🚴", "🏊‍♂️", "⚽", "🏀", "🐻", "🦁"].map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => toggleEmojiSetting('emoji', emoji)}
                              className={`w-8 h-8 flex items-center justify-center text-lg rounded ${
                                emojiPrefs.emoji === emoji 
                                  ? "bg-blue-100 dark:bg-blue-900/30" 
                                  : "bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500"
                              }`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                        <div className="mt-2 text-center">
                          <Link 
                            to="/settings?tab=appearance" 
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-xs text-blue-500 hover:text-blue-700 flex items-center justify-center"
                          >
                            <span className="mr-1">More emoji options</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                      
                      <div>
                        <div className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                          Animation
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {[
                            { id: "lift", label: "Lift" },
                            { id: "bounce", label: "Bounce" },
                            { id: "spin", label: "Spin" },
                            { id: "pulse", label: "Pulse" },
                            { id: "wave", label: "Wave" },
                            { id: "shake", label: "Shake" },
                            { id: "flip", label: "Flip" },
                            { id: "rotate", label: "Rotate" },
                            { id: "sparkle", label: "Sparkle" },
                            { id: "float", label: "Float" },
                            { id: "wiggle", label: "Wiggle" },
                            { id: "zoom", label: "Zoom" },
                            { id: "workout", label: "Workout" }
                          ].map(animation => (
                            <button
                              key={animation.id}
                              onClick={() => toggleEmojiSetting('animation', animation.id)}
                              className={`px-2 py-1 text-xs rounded ${
                                emojiPrefs.animation === animation.id
                                  ? "bg-blue-100 dark:bg-blue-900/30 font-medium"
                                  : "bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500"
                              }`}
                            >
                              {animation.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/profile"
                    className="text-sm px-3 py-2 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FaUser className="mr-1" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-sm px-3 py-2 rounded-lg flex items-center justify-center bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/30 text-red-600 dark:text-red-400 transition-colors"
                  >
                    <FaSignOutAlt className="mr-1" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-6 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  className="py-2 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="py-2 rounded-lg flex items-center justify-center bg-blue-600 hover:bg-blue-700 transition-colors text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu accordion sections */}
            <div className="space-y-3">
              <MobileAccordion 
                title="Workouts" 
                icon={<FaDumbbell className="mr-2" />}
                items={NAVIGATION_ITEMS.workout}
                onItemClick={() => setMobileMenuOpen(false)}
              />
              
              <MobileAccordion 
                title="Tools" 
                icon={<FaTools className="mr-2" />}
                items={NAVIGATION_ITEMS.tools}
                onItemClick={() => setMobileMenuOpen(false)}
              />
              
              <MobileAccordion 
                title="Help" 
                icon={<FaInfoCircle className="mr-2" />}
                items={NAVIGATION_ITEMS.help}
                onItemClick={() => setMobileMenuOpen(false)}
              />

              {isAuthenticated && (
                <MobileAccordion 
                  title="User" 
                  icon={<FaUser className="mr-2" />}
                  items={[
                    { label: 'Settings', path: '/settings', icon: <FaCog className="mr-2" /> },
                    { label: 'Saved Programs', path: '/saved-programs', icon: <FaSave className="mr-2" /> },
                    { label: 'Personal Records', path: '/personal-records', icon: <FaRunning className="mr-2" /> },
                    { label: 'Achievements', path: '/achievements', icon: <FaAtlas className="mr-2" /> },
                    ...(isAdmin ? [{ label: 'Admin Dashboard', path: '/admin', icon: <FaLock className="mr-2" /> }] : [])
                  ]}
                  onItemClick={() => setMobileMenuOpen(false)}
                />
              )}
            </div>
          </div>

          {/* Mobile footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowQRModal(true)}
                className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Install Mobile App"
              >
                <FaQrcode className="w-5 h-5" />
              </button>
            
              <button
                onClick={handleThemeToggle}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <SunIcon className="h-6 w-6 text-yellow-500" />
                ) : (
                  <MoonIcon className="h-6 w-6 text-gray-600" />
                )}
              </button>
            
              {isAuthenticated && (
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setMobileMenuOpen(false);
                  }}
                  className="relative p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Notifications"
                >
                  <FaBell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="notification-badge bg-red-500 text-white w-5 h-5 min-w-[1.25rem]">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <MobileInstallQR isOpen={showQRModal} onClose={() => setShowQRModal(false)} />
    </>
  );
}

export default Navbar;
