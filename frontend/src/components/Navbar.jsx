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
    { label: 'Progress Tracker', path: '/progress-tracker', icon: <FaChartLine /> },
    { label: 'Program Tracker', path: '/program-tracker', icon: <LuCalendarClock /> },
    { label: 'Muscle Guide', path: '/explore-muscle-guide', icon: <LuBicepsFlexed /> },
  ],
  tools: [
    { label: 'Fitness Calculator', path: '/fitness-calculator', icon: <FaCalculator /> },
    { label: 'Nutrition', path: '/nutrition', icon: <FaAppleAlt /> },
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
  
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount, addNotification } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef(null);

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

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click was outside workout dropdown
      if (workoutDropdownRef.current && !workoutDropdownRef.current.contains(event.target)) {
        setWorkoutDropdownOpen(false);
      }
      
      // Check if click was outside tools dropdown
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target)) {
        setToolsDropdownOpen(false);
      }
      
      // Check if click was outside help dropdown
      if (helpDropdownRef.current && !helpDropdownRef.current.contains(event.target)) {
        setHelpDropdownOpen(false);
      }
      
      // Check if click was outside auth dropdown
      if (authDropdownRef.current && !authDropdownRef.current.contains(event.target)) {
        setAuthDropdownOpen(false);
      }
      
      // Check if click was outside search
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
      
      // Check if click was outside notifications
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
              <ThemeToggle />

              {/* Notifications */}
              {isAuthenticated && (
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
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
                  {showNotifications && <NotificationDropdown />}
                </div>
              )}

              {/* User menu - Desktop */}
              <div className="hidden md:block">
                {isAuthenticated ? (
                  <div className="relative" ref={authDropdownRef}>
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
                      <span className="max-w-[100px] truncate">{username || 'Account'}</span>
                      <FaChevronDown className={`ml-1 w-3 h-3 transform transition-transform ${authDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <NavDropdown isOpen={authDropdownOpen}>
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="font-medium text-sm">{username}</div>
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
                      <DropdownItem to="/notifications" onClick={() => setAuthDropdownOpen(false)}>
                        <FaBell className="mr-2 text-yellow-500" />
                        Notifications
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
                      <DropdownItem to="/change-password" onClick={() => setAuthDropdownOpen(false)}>
                        <FaLock className="mr-2 text-red-500" />
                        Change Password
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
                    <div className="font-medium">{username}</div>
                    {isAdmin && <div className="admin-badge mt-1">ADMIN</div>}
                  </div>
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
                    { label: 'Notifications', path: '/notifications', icon: <FaBell className="mr-2" /> },
                    { label: 'Saved Programs', path: '/saved-programs', icon: <FaSave className="mr-2" /> },
                    { label: 'Personal Records', path: '/personal-records', icon: <FaRunning className="mr-2" /> },
                    { label: 'Achievements', path: '/achievements', icon: <FaAtlas className="mr-2" /> },
                    { label: 'Change Password', path: '/change-password', icon: <FaLock className="mr-2" /> },
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
            
              <ThemeToggle />
            
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
