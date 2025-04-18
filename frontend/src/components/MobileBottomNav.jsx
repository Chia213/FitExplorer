import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaDumbbell, 
  FaHome, 
  FaUser, 
  FaChartLine, 
  FaChevronUp, 
  FaHistory, 
  FaBook, 
  FaRobot,
  FaClock,
  FaCalculator,
  FaAppleAlt,
  FaTools
} from 'react-icons/fa';
import { LuBicepsFlexed} from "react-icons/lu";

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Only show on mobile devices
  const [isMobile, setIsMobile] = React.useState(false);
  // Track iOS specifically
  const [isIOS, setIsIOS] = React.useState(false);
  // Check if in standalone mode
  const [isStandalone, setIsStandalone] = React.useState(false);
  // Dropdown states
  const [showWorkoutsDropdown, setShowWorkoutsDropdown] = React.useState(false);
  const [showToolsDropdown, setShowToolsDropdown] = React.useState(false);
  
  // Refs for dropdown buttons
  const workoutsButtonRef = React.useRef(null);
  const toolsButtonRef = React.useRef(null);
  
  React.useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check if device is iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
               (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(iOS);
    
    // Check if we're in standalone/PWA mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                       window.navigator.standalone === true;
    setIsStandalone(standalone);
    
    // Initial check
    checkMobile();
    
    // Listen for window resize
    window.addEventListener('resize', checkMobile);

    // Close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (workoutsButtonRef.current && !workoutsButtonRef.current.contains(event.target)) {
        setShowWorkoutsDropdown(false);
      }
      if (toolsButtonRef.current && !toolsButtonRef.current.contains(event.target)) {
        setShowToolsDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    
    // Close dropdowns when navigating
    const handleRouteChange = () => {
      setShowWorkoutsDropdown(false);
      setShowToolsDropdown(false);
    };
    
    window.addEventListener('popstate', handleRouteChange);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', checkMobile);
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);
  
  // Don't render on larger screens
  if (!isMobile) {
    return null;
  }
  
  // Navigation items for the bottom nav
  const navItems = [
    { path: '/', icon: <FaHome className="w-6 h-6" />, label: 'Home' },
    { 
      path: '/workout-generator', 
      icon: <FaDumbbell className="w-6 h-6" />, 
      label: 'Workouts',
      hasDropdown: true,
      dropdownType: 'workouts',
      dropdownItems: [
        { path: '/workout-generator', icon: <FaDumbbell />, label: 'Workout Generator' },
        { path: '/ai-workout-generator', icon: <FaRobot />, label: 'AI Generator' },
        { path: '/workout-log', icon: <FaClock />, label: 'Workout Log' },
        { path: '/workout-history', icon: <FaHistory />, label: 'Workout History' },
        { path: '/routines', icon: <FaBook />, label: 'My Routines' },
      ]
    },
    
    { path: 'explore-muscle-guide', icon: <LuBicepsFlexed className="w-6 h-6" />, label: 'Training Library' },
    { 
      path: '/fitness-tools', 
      icon: <FaTools className="w-6 h-6" />, 
      label: 'Tools',
      hasDropdown: true,
      dropdownType: 'tools',
      dropdownItems: [
        { path: '/fitness-calculator', icon: <FaCalculator />, label: 'Fitness Calculator' },
        { path: '/nutrition', icon: <FaAppleAlt />, label: 'Nutrition' },
        { path: '/progress-tracker', icon: <FaChartLine />, label: 'Progress Tracker' },
      ]
    },
    { path: '/profile', icon: <FaUser className="w-6 h-6" />, label: 'Profile' }
  ];
  
  // Check if a route is active
  const isWorkoutActive = location.pathname.includes('workout') || location.pathname.includes('routines');
  const isToolsActive = location.pathname.includes('fitness-') || 
                        location.pathname.includes('nutrition') || 
                        location.pathname.includes('progress-tracker');

  // Handle nav item click with dropdown
  const handleNavItemClick = (e, item) => {
    if (item.hasDropdown) {
      e.preventDefault();
      e.stopPropagation();
      
      if (item.dropdownType === 'workouts') {
        setShowWorkoutsDropdown(!showWorkoutsDropdown);
        setShowToolsDropdown(false);
      } else if (item.dropdownType === 'tools') {
        setShowToolsDropdown(!showToolsDropdown);
        setShowWorkoutsDropdown(false);
      }
      
      // Trigger haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    } else {
      // Normal navigation
      navigate(item.path);
      
      // Trigger haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    }
  };
  
  return (
    <>
      {/* Workouts dropdown menu */}
      <AnimatePresence>
        {showWorkoutsDropdown && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl navbar-dropdown"
            style={{
              bottom: '70px',
              left: '0',
              right: '0',
              maxHeight: '300px',
              overflowY: 'auto',
              margin: '0 8px'
            }}
          >
            <div className="p-1">
              {navItems[1].dropdownItems.map((dropdownItem) => (
                <Link 
                  key={dropdownItem.path}
                  to={dropdownItem.path}
                  className={`dropdown-item flex items-center p-3 ${
                    location.pathname === dropdownItem.path 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' 
                      : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700'
                  }`}
                  onClick={() => {
                    setShowWorkoutsDropdown(false);
                    // Trigger haptic feedback on selection
                    if (navigator.vibrate) {
                      navigator.vibrate(15);
                    }
                  }}
                >
                  <span className="mr-3 text-lg text-blue-500 dark:text-blue-400">{dropdownItem.icon}</span>
                  <span className="text-sm font-medium">{dropdownItem.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Tools dropdown menu */}
      <AnimatePresence>
        {showToolsDropdown && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl navbar-dropdown"
            style={{
              bottom: '70px',
              left: '0',
              right: '0',
              maxHeight: '300px',
              overflowY: 'auto',
              margin: '0 8px'
            }}
          >
            <div className="p-1">
              {navItems[3].dropdownItems.map((dropdownItem) => (
                <Link 
                  key={dropdownItem.path}
                  to={dropdownItem.path}
                  className={`dropdown-item flex items-center p-3 ${
                    location.pathname === dropdownItem.path 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' 
                      : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700'
                  }`}
                  onClick={() => {
                    setShowToolsDropdown(false);
                    // Trigger haptic feedback on selection
                    if (navigator.vibrate) {
                      navigator.vibrate(15);
                    }
                  }}
                >
                  <span className="mr-3 text-lg text-blue-500 dark:text-blue-400">{dropdownItem.icon}</span>
                  <span className="text-sm font-medium">{dropdownItem.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main bottom nav bar - full width */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40 w-full overflow-hidden">
        <div className="h-full flex items-center w-full">
          <div className="flex justify-between items-center w-full h-full">
            {navItems.map((item, index) => {
              const isActive = item.hasDropdown
                ? (item.dropdownType === 'workouts' ? isWorkoutActive : 
                   item.dropdownType === 'tools' ? isToolsActive : false)
                : location.pathname === item.path || 
                  (item.path !== '/' && location.pathname.startsWith(item.path));
                
              return (
                <div 
                  key={item.path}
                  ref={item.hasDropdown ? 
                    (item.dropdownType === 'workouts' ? workoutsButtonRef : 
                     item.dropdownType === 'tools' ? toolsButtonRef : null) 
                    : null}
                  className={`flex flex-col items-center justify-center h-full ${item.hasDropdown ? 'cursor-pointer' : ''}`}
                  style={{ width: '20%' }}
                  onClick={(e) => item.hasDropdown ? handleNavItemClick(e, item) : null}
                >
                  <Link
                    to={item.path}
                    className="flex flex-col items-center w-full"
                    onClick={(e) => {
                      if (item.hasDropdown) {
                        handleNavItemClick(e, item);
                      } else if (navigator.vibrate) {
                        navigator.vibrate(10);
                      }
                    }}
                  >
                    <div className="relative flex flex-col items-center">
                      <div className={`rounded-full p-1 transition-colors ${isActive ? 'text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>
                        {item.icon}
                        
                        {isActive && (
                          <motion.div
                            layoutId="bottomNavIndicator"
                            className="absolute -bottom-1 w-4 h-0.5 bg-blue-600 dark:bg-blue-300 rounded-full"
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        )}
                      </div>
                      <span className={`text-xs mt-1 flex items-center ${isActive ? 'text-blue-600 dark:text-blue-300 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                        {item.label}
                        {item.hasDropdown && (
                          <FaChevronUp 
                            className={`ml-0.5 text-[8px] transform transition-transform ${
                              (item.dropdownType === 'workouts' && showWorkoutsDropdown) || 
                              (item.dropdownType === 'tools' && showToolsDropdown) 
                                ? 'rotate-180' 
                                : 'rotate-0'
                            }`}
                          />
                        )}
                      </span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileBottomNav; 