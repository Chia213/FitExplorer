import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaDumbbell, 
  FaHome, 
  FaUser, 
  FaAppleAlt, 
  FaChartLine, 
  FaChevronUp, 
  FaHistory, 
  FaBook, 
  FaRobot,
  FaClock
} from 'react-icons/fa';

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Only show on mobile devices
  const [isMobile, setIsMobile] = React.useState(false);
  // Track iOS specifically
  const [isIOS, setIsIOS] = React.useState(false);
  // Check if in standalone mode
  const [isStandalone, setIsStandalone] = React.useState(false);
  // Dropdown state
  const [showWorkoutsDropdown, setShowWorkoutsDropdown] = React.useState(false);
  
  // Ref for the workouts button
  const workoutsButtonRef = React.useRef(null);
  
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

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (workoutsButtonRef.current && !workoutsButtonRef.current.contains(event.target)) {
        setShowWorkoutsDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    
    // Close dropdown when navigating
    const handleRouteChange = () => {
      setShowWorkoutsDropdown(false);
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
  
  // Styling for the bottom navigation based on device
  const navStyles = {
    // Base styling with safe area padding
    paddingBottom: `calc(0.5rem + env(safe-area-inset-bottom, 0px))`,
    // Use original height
    height: isStandalone ? `calc(4rem + env(safe-area-inset-bottom, 0px))` : '4rem',
    // Special iOS styling
    backdropFilter: isIOS ? 'blur(10px)' : 'none',
    WebkitBackdropFilter: isIOS ? 'blur(10px)' : 'none',
    backgroundColor: isIOS 
      ? (document.documentElement.classList.contains('dark') 
          ? 'rgba(31, 41, 55, 0.8)' 
          : 'rgba(255, 255, 255, 0.8)')
      : '',
    borderTop: isIOS ? 'none' : '1px solid',
    borderTopColor: document.documentElement.classList.contains('dark') 
      ? 'rgba(75, 85, 99, 0.4)' 
      : 'rgba(229, 231, 235, 0.8)',
    // Add bottom offset to move the navbar down a bit
    bottom: '0',
    // Full width to remove side gaps
    width: '100%',
    left: '0',
    right: '0',
    transform: 'none',
    maxWidth: '100%',
    borderRadius: '0'
  };
  
  // Navigation items for the bottom nav
  const navItems = [
    { path: '/', icon: <FaHome className="w-6 h-6" />, label: 'Home' },
    { 
      path: '/workout-generator', 
      icon: <FaDumbbell className="w-6 h-6" />, 
      label: 'Workouts',
      hasDropdown: true,
      dropdownItems: [
        { path: '/workout-generator', icon: <FaDumbbell />, label: 'Workout Generator' },
        { path: '/ai-workout-generator', icon: <FaRobot />, label: 'AI Generator' },
        { path: '/workout-log', icon: <FaClock />, label: 'Workout Log' },
        { path: '/workout-history', icon: <FaHistory />, label: 'Workout History' },
        { path: '/routines', icon: <FaBook />, label: 'My Routines' },
      ]
    },
    { path: '/nutrition', icon: <FaAppleAlt className="w-6 h-6" />, label: 'Nutrition' },
    { path: '/progress-tracker', icon: <FaChartLine className="w-6 h-6" />, label: 'Progress' },
    { path: '/profile', icon: <FaUser className="w-6 h-6" />, label: 'Profile' }
  ];
  
  // Check if a workout route is active
  const isWorkoutActive = location.pathname.includes('workout') || location.pathname.includes('routines');

  // Handle nav item click with dropdown
  const handleNavItemClick = (e, item) => {
    if (item.hasDropdown) {
      e.preventDefault();
      e.stopPropagation();
      setShowWorkoutsDropdown(!showWorkoutsDropdown);
      
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 bg-white dark:bg-gray-800 rounded-xl shadow-xl navbar-dropdown"
            style={{
              bottom: '60px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90%',
              backgroundColor: 'white'
            }}
          >
            <div className="p-2 space-y-1">
              {navItems[1].dropdownItems.map((dropdownItem) => (
                <Link 
                  key={dropdownItem.path}
                  to={dropdownItem.path}
                  className={`dropdown-item flex items-center p-2 rounded-lg ${
                    location.pathname === dropdownItem.path 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                  onClick={() => {
                    setShowWorkoutsDropdown(false);
                    // Trigger haptic feedback on selection
                    if (navigator.vibrate) {
                      navigator.vibrate(15);
                    }
                  }}
                >
                  <span className="mr-3 text-lg">{dropdownItem.icon}</span>
                  <span className="text-sm font-medium">{dropdownItem.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Bottom navbar */}
      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed z-40 bg-gray-100 dark:bg-gray-800 flex justify-around items-center px-2 md:hidden ${isStandalone ? 'pwa-bottom-nav' : ''}`}
        style={navStyles}
      >
        {navItems.map((item) => {
          const isActive = item.hasDropdown
            ? isWorkoutActive
            : location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            
          return (
            <div 
              key={item.path}
              ref={item.hasDropdown ? workoutsButtonRef : null}
              className={`flex flex-col items-center justify-center w-full h-full py-1 ${item.hasDropdown ? 'cursor-pointer' : ''}`}
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
                  <div className={`rounded-full transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    {item.icon}
                    
                    {isActive && (
                      <motion.div
                        layoutId="bottomNavIndicator"
                        className="absolute -bottom-1 w-6 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </div>
                  <span className={`text-xs mt-0.5 flex items-center ${isActive ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                    {item.label}
                    {item.hasDropdown && (
                      <FaChevronUp 
                        className={`ml-0.5 text-[8px] transform transition-transform ${showWorkoutsDropdown ? 'rotate-180' : 'rotate-0'}`}
                      />
                    )}
                  </span>
                </div>
              </Link>
            </div>
          );
        })}
      </motion.nav>
    </>
  );
};

export default MobileBottomNav; 