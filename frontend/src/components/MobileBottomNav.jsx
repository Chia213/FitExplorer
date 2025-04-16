import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaDumbbell, FaHome, FaUser, FaAppleAlt, FaChartLine } from 'react-icons/fa';

const MobileBottomNav = () => {
  const location = useLocation();
  
  // Only show on mobile devices
  const [isMobile, setIsMobile] = React.useState(false);
  // Track iOS specifically
  const [isIOS, setIsIOS] = React.useState(false);
  // Check if in standalone mode
  const [isStandalone, setIsStandalone] = React.useState(false);
  
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
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Don't render on larger screens
  if (!isMobile) {
    return null;
  }
  
  // Styling for the bottom navigation based on device
  const navStyles = {
    // Base styling with safe area padding
    paddingBottom: `calc(0.5rem + env(safe-area-inset-bottom, 0px))`,
    // Add height that accommodates iOS home indicator
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
    bottom: '8px'
  };
  
  // Navigation items for the bottom nav
  const navItems = [
    { path: '/', icon: <FaHome className="w-6 h-6" />, label: 'Home' },
    { path: '/workout-generator', icon: <FaDumbbell className="w-6 h-6" />, label: 'Workouts' },
    { path: '/nutrition', icon: <FaAppleAlt className="w-6 h-6" />, label: 'Nutrition' },
    { path: '/progress-tracker', icon: <FaChartLine className="w-6 h-6" />, label: 'Progress' },
    { path: '/profile', icon: <FaUser className="w-6 h-6" />, label: 'Profile' }
  ];
  
  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 flex justify-around items-center px-2 md:hidden shadow-lg rounded-xl mx-2 ${isStandalone ? 'pwa-bottom-nav' : ''}`}
      style={navStyles}
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || 
          (item.path !== '/' && location.pathname.startsWith(item.path));
          
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center w-full h-full py-2`}
            onClick={() => {
              // Trigger haptic feedback on navigation if available
              if (navigator.vibrate) {
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
              <span className={`text-sm mt-1 ${isActive ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                {item.label}
              </span>
            </div>
          </Link>
        );
      })}
    </motion.nav>
  );
};

export default MobileBottomNav; 