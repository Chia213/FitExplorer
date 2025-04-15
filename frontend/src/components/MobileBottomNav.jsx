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
  
  React.useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check if device is iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
               (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(iOS);
    
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
  
  // Check if the app is running in standalone mode (installed PWA)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                      window.navigator.standalone === true;
  
  // Navigation items for the bottom nav
  const navItems = [
    { path: '/', icon: <FaHome className="w-6 h-6" />, label: 'Home' },
    { path: '/workout-generator', icon: <FaDumbbell className="w-6 h-6" />, label: 'Workouts' },
    { path: '/nutrition', icon: <FaAppleAlt className="w-6 h-6" />, label: 'Nutrition' },
    { path: '/progress-tracker', icon: <FaChartLine className="w-6 h-6" />, label: 'Progress' },
    { path: '/profile', icon: <FaUser className="w-6 h-6" />, label: 'Profile' }
  ];
  
  // Determine additional styles for iOS
  const iosStyles = isIOS ? {
    // Add more space for home indicator on iOS
    paddingBottom: isStandalone ? 'env(safe-area-inset-bottom, 20px)' : '20px',
    height: isStandalone ? 'calc(5rem + env(safe-area-inset-bottom, 20px))' : '5rem',
    // Remove border for cleaner look on iOS
    borderTopWidth: '1px',
    // Add backdrop blur effect that matches iOS style
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    dark: {
      backgroundColor: 'rgba(31, 41, 55, 0.8)'
    }
  } : {};
  
  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`fixed bottom-0 left-0 right-0 z-50 h-20 bg-white dark:bg-gray-800 border-t border-gray-300 dark:border-gray-600 flex justify-around items-center px-2 md:hidden shadow-lg ${isStandalone ? 'bottom-nav' : ''}`}
      style={{ 
        paddingBottom: isIOS ? iosStyles.paddingBottom : 'env(safe-area-inset-bottom, 0px)',
        height: isIOS ? iosStyles.height : '5rem',
        borderTopWidth: isIOS ? iosStyles.borderTopWidth : '2px',
        backdropFilter: isIOS ? iosStyles.backdropFilter : 'none',
        backgroundColor: isIOS 
          ? (document.documentElement.classList.contains('dark') 
            ? iosStyles.dark.backgroundColor 
            : iosStyles.backgroundColor)
          : ''
      }}
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || 
          (item.path !== '/' && location.pathname.startsWith(item.path));
          
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center w-full h-full`}
            onClick={() => {
              // Trigger haptic feedback on navigation if available
              if (navigator.vibrate) {
                navigator.vibrate(10);
              }
            }}
          >
            <div className="relative flex flex-col items-center">
              <div className={`p-1.5 rounded-full transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
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