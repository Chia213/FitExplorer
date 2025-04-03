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
} from "react-icons/fa";
import { LuBicepsFlexed, LuCalendarClock } from "react-icons/lu";
import logo from "../assets/Ronjasdrawing.png";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../hooks/useTheme";
import NotificationDropdown from "./NotificationDropdown";
import { useNotifications } from "../contexts/NotificationContext";
import "../styles/navHover.css";
import { notifyWorkoutCompleted } from '../utils/notificationsHelpers';

// Navigation items configuration
const NAVIGATION_ITEMS = {
  workout: [
    { path: "/workout-log", icon: <FaListAlt className="mr-2 text-blue-500" />, label: "Workout Log" },
    { path: "/workout-history", icon: <FaHistory className="mr-2 text-purple-500" />, label: "Workout History" },
    { path: "/", icon: <LuBicepsFlexed className="mr-2 text-green-500" />, label: "Workout Generator" },
    { path: "/routines", icon: <LuCalendarClock className="mr-2 text-orange-500" />, label: "My Routines" },
  ],
  tools: [
    { path: "/fitness-calculator", icon: <FaCalculator className="mr-2 text-indigo-500" />, label: "Fitness Calculator" },
    { path: "/explore-muscle-guide", icon: <FaAtlas className="mr-2 text-emerald-500" />, label: "Muscle Guide" },
    { path: "/progress-tracker", icon: <FaChartLine className="mr-2 text-purple-500" />, label: "Progress Tracker" },
  ],
  help: [
    { path: "/faq", icon: <FaQuestionCircle className="mr-2 text-blue-500" />, label: "FAQ" },
    { path: "/about", icon: <FaInfoCircle className="mr-2 text-gray-500" />, label: "About" },
  ],
  search: [
    { path: "/", label: "Workout Generator" },
    { path: "/workout-log", label: "Workout Log" },
    { path: "/workout-history", label: "Workout History" },
    { path: "/explore-muscle-guide", label: "Explore Muscle Guide" },
    { path: "/routines", label: "Routines" },
    { path: "/fitness-calculator", label: "Fitness Calculator" },
    { path: "/notifications", label: "Notifications" },
    { path: "/faq", label: "FAQ" },
    { path: "/about", label: "About" },
    { path: "/profile", label: "Profile" },
    { path: "/progress-tracker", label: "Progress Tracker" },
    { path: "/saved-programs", label: "Saved Programs" },
  ]
};

// Dropdown component for better code organization
const NavDropdown = ({ isOpen, children, align = "right" }) => {
  if (!isOpen) return null;
  
  return (
    <div 
      className={`absolute top-full ${align === "right" ? "right-0" : "left-0"} mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden z-50 w-48`}
      role="menu"
      aria-orientation="vertical"
    >
      {children}
    </div>
  );
};

// Dropdown item component
const DropdownItem = ({ to, onClick, children }) => {
  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <Link
      to={to}
      className="block p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
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
  
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount, addNotification } = useNotifications();

  // Check authentication status when location changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
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
        localStorage.setItem("isAdmin", "false");
      }
    } else {
      setIsAuthenticated(false);
      setIsAdmin(false);
      localStorage.setItem("isAdmin", "false");
    }
  }, [location]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Handle dropdown toggle functions
  const toggleWorkoutDropdown = () => setWorkoutDropdownOpen(!workoutDropdownOpen);
  const toggleToolsDropdown = () => setToolsDropdownOpen(!toolsDropdownOpen);
  const toggleHelpDropdown = () => setHelpDropdownOpen(!helpDropdownOpen);
  const toggleAuthDropdown = () => setAuthDropdownOpen(!authDropdownOpen);
  
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
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    setIsAuthenticated(false);
    setUsername(null);
    setIsAdmin(false);
    navigate("/login");
  };

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query.length > 0) {
      const filtered = NAVIGATION_ITEMS.search.filter(
        item => item.label.toLowerCase().includes(query)
      );
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
    <header
      className={`w-full ${
        theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-r from-green-400 to-blue-500 text-black"
      } shadow-md z-50 sticky top-0`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 md:py-4 relative">
          {/* Logo and mobile menu button */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center">
              <img
                src={logo}
                alt="FitExplorer Logo"
                className="w-20 md:w-56 hover:scale-105 transition-all dark:invert"
              />
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-600/20 dark:hover:bg-gray-600/40"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearch}
                className="py-2 pl-10 pr-4 w-64 rounded-xl border-2 border-blue-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:bg-slate-100 dark:focus:bg-gray-700 focus:outline-sky-500"
                aria-label="Search navigation"
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden z-50">
                  {searchResults.map((result) => (
                    <button
                      key={result.path}
                      onClick={() => handleResultClick(result.path)}
                      className="block w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {result.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <nav className="flex items-center gap-1">
              {/* Workouts Dropdown */}
              <div ref={workoutDropdownRef} className="relative">
                <button
                  onClick={toggleWorkoutDropdown}
                  className="nav-item flex flex-col items-center p-3 hover:bg-sky-700/20 dark:hover:bg-sky-700/40 rounded-md transition-all"
                  aria-expanded={workoutDropdownOpen}
                  aria-haspopup="true"
                >
                  <FaDumbbell className="nav-icon" size={20} />
                  <span className="nav-text text-sm mt-1">Workouts</span>
                </button>

                <NavDropdown isOpen={workoutDropdownOpen}>
                  {NAVIGATION_ITEMS.workout.map((item) => (
                    <DropdownItem 
                      key={item.path} 
                      to={item.path} 
                      onClick={() => setWorkoutDropdownOpen(false)}
                    >
                      {item.icon} {item.label}
                    </DropdownItem>
                  ))}
                </NavDropdown>
              </div>
              
              {/* Tools Dropdown */}
              <div ref={toolsDropdownRef} className="relative">
                <button
                  onClick={toggleToolsDropdown}
                  className="nav-item flex flex-col items-center p-3 hover:bg-sky-700/20 dark:hover:bg-sky-700/40 rounded-md transition-all"
                  aria-expanded={toolsDropdownOpen}
                  aria-haspopup="true"
                >
                  <FaTools className="nav-icon" size={20} />
                  <span className="nav-text text-sm mt-1">Tools</span>
                </button>

                <NavDropdown isOpen={toolsDropdownOpen}>
                  {NAVIGATION_ITEMS.tools.map((item) => (
                    <DropdownItem 
                      key={item.path} 
                      to={item.path} 
                      onClick={() => setToolsDropdownOpen(false)}
                    >
                      {item.icon} {item.label}
                    </DropdownItem>
                  ))}
                </NavDropdown>
              </div>

              {/* Notifications Dropdown */}
              <NotificationDropdown />
              
              {/* Help & Info Dropdown */}
              <div ref={helpDropdownRef} className="relative">
                <button
                  onClick={toggleHelpDropdown}
                  className="nav-item flex flex-col items-center p-3 hover:bg-sky-700/20 dark:hover:bg-sky-700/40 rounded-md transition-all"
                  aria-expanded={helpDropdownOpen}
                  aria-haspopup="true"
                >
                  <FaInfoCircle className="nav-icon" size={20} />
                  <span className="nav-text text-sm mt-1">Help</span>
                </button>

                <NavDropdown isOpen={helpDropdownOpen}>
                  {NAVIGATION_ITEMS.help.map((item) => (
                    <DropdownItem 
                      key={item.path} 
                      to={item.path} 
                      onClick={() => setHelpDropdownOpen(false)}
                    >
                      {item.icon} {item.label}
                    </DropdownItem>
                  ))}
                </NavDropdown>
              </div>

              {/* User Account Dropdown */}
              <div ref={authDropdownRef} className="relative">
                <button
                  onClick={toggleAuthDropdown}
                  className="nav-item flex flex-col items-center p-3 hover:bg-sky-700/20 dark:hover:bg-sky-700/40 rounded-md transition-all"
                  aria-expanded={authDropdownOpen}
                  aria-haspopup="true"
                >
                  <FaUser className="nav-icon" size={20} />
                  <span className="nav-text text-sm mt-1 max-w-[80px] truncate">
                    {isAuthenticated ? username : "Account"}
                  </span>
                </button>

                <NavDropdown isOpen={authDropdownOpen}>
                  {isAuthenticated ? (
                    <>
                      <DropdownItem 
                        to="/profile" 
                        onClick={() => setAuthDropdownOpen(false)}
                      >
                        <FaUser className="mr-2 text-blue-500" /> Profile
                      </DropdownItem>
                      
                      <DropdownItem 
                        to="/saved-programs" 
                        onClick={() => setAuthDropdownOpen(false)}
                      >
                        <FaSave className="mr-2 text-indigo-500" /> Saved Programs
                      </DropdownItem>

                      {isAdmin && (
                        <DropdownItem 
                          to="/admin" 
                          onClick={() => setAuthDropdownOpen(false)}
                        >
                          <FaLock className="mr-2 text-red-500" /> Admin Dashboard
                        </DropdownItem>
                      )}

                      <button
                        onClick={() => {
                          setAuthDropdownOpen(false);
                          handleLogout();
                        }}
                        className="block w-full text-left p-3 hover:bg-red-500 hover:text-white transition-colors flex items-center"
                        role="menuitem"
                      >
                        <FaSignOutAlt className="mr-2" /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <DropdownItem 
                        to="/login" 
                        onClick={() => setAuthDropdownOpen(false)}
                      >
                        <FaUser className="mr-2 text-blue-500" /> Login
                      </DropdownItem>
                      
                      <DropdownItem 
                        to="/signup" 
                        onClick={() => setAuthDropdownOpen(false)}
                      >
                        <FaUser className="mr-2 text-green-500" /> Sign Up
                      </DropdownItem>
                    </>
                  )}
                </NavDropdown>
              </div>

              <ThemeToggle className="ml-2" />
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden bg-white dark:bg-gray-800 shadow-lg rounded-b-lg overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div className="p-4">
            {/* Mobile Search */}
            <div className="mb-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="mt-2 bg-white dark:bg-gray-700 shadow-inner rounded-md overflow-hidden">
                  {searchResults.map((result) => (
                    <button
                      key={result.path}
                      onClick={() => handleResultClick(result.path)}
                      className="block w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {result.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <nav className="space-y-2">
              {/* Workout Navigation */}
              <Link
                to="/"
                className="nav-link block w-full p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
              >
                <FaRunning className="mr-3 text-green-500" /> Workout Generator
              </Link>

              <div className="mb-2">
                <button
                  onClick={toggleWorkoutDropdown}
                  className="nav-link w-full p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                  aria-expanded={workoutDropdownOpen}
                >
                  <span className="flex items-center">
                    <FaDumbbell className="mr-3 text-blue-500" /> Workouts
                  </span>
                  {workoutDropdownOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
                </button>

                {workoutDropdownOpen && (
                  <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-300 dark:border-gray-600 pl-4">
                    {NAVIGATION_ITEMS.workout.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center"
                      >
                        {item.icon} {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Tools section in mobile menu */}
              <div className="border-t border-gray-200 dark:border-gray-700 my-2 pt-2">
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 font-medium">Tools</div>
                
                <Link
                  to="/fitness-calculator"
                  className="nav-link block w-full p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
                >
                  <FaCalculator className="mr-3 text-indigo-500" /> Fitness Calculator
                </Link>
                
                <Link
                  to="/explore-muscle-guide"
                  className="nav-link block w-full p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
                >
                  <FaAtlas className="mr-3 text-blue-500" /> Muscle Guide
                </Link>

                <Link
                  to="/notifications"
                  className="nav-link block w-full p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <FaBell className="mr-3 text-yellow-500" /> Notifications
                  </div>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* Help & About section in mobile menu */}
              <div className="border-t border-gray-200 dark:border-gray-700 my-2 pt-2">
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 font-medium">Help & Info</div>
                
                <Link
                  to="/faq"
                  className="nav-link block w-full p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
                >
                  <FaQuestionCircle className="mr-3 text-blue-500" /> FAQ
                </Link>

                <Link
                  to="/about"
                  className="nav-link block w-full p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
                >
                  <FaInfoCircle className="mr-3 text-gray-500" /> About
                </Link>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 my-2 pt-2"></div>

              {/* User Account Section */}
              {isAuthenticated ? (
                <>
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md mb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Logged in as:</p>
                    <p className="font-semibold">{username}</p>
                  </div>

                  <Link
                    to="/profile"
                    className="nav-link block w-full p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
                  >
                    <FaUser className="mr-3 text-blue-500" /> Profile
                  </Link>
                  
                  <Link
                    to="/saved-programs"
                    className="nav-link block w-full p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
                  >
                    <FaSave className="mr-3 text-indigo-500" /> Saved Programs
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="nav-link block w-full p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
                    >
                      <FaLock className="mr-3 text-red-500" /> Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="nav-link block w-full p-3 mt-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors flex items-center justify-center"
                  >
                    <FaSignOutAlt className="mr-2" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="nav-link block w-full p-3 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-colors flex items-center justify-center"
                  >
                    <FaUser className="mr-2" /> Login
                  </Link>
                  
                  <Link
                    to="/signup"
                    className="nav-link block w-full p-3 mt-2 rounded-md bg-green-500 hover:bg-green-600 text-white transition-colors flex items-center justify-center"
                  >
                    <FaUser className="mr-2" /> Sign Up
                  </Link>
                </>
              )}

              <div className="flex items-center justify-center p-3">
                <ThemeToggle />
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;