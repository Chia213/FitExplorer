import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaDumbbell, FaHome, FaUser, FaAppleAlt, FaChartLine } from 'react-icons/fa';

const MobileBottomNav = () => {
  const location = useLocation();
  
  // Only show on mobile devices
  const [isMobile, setIsMobile] = React.useState(false);
  
  React.useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
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
  
  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`fixed bottom-0 left-0 right-0 z-50 h-16 bg-gray-200 dark:bg-gray-200 border-t border-gray-300 flex justify-around items-center px-2 md:hidden ${isStandalone ? 'bottom-nav' : ''}`}
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
              <div className={`p-1 rounded-full transition-colors ${isActive ? 'text-black' : 'text-gray-600'}`}>
                {item.icon}
                
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -bottom-1 w-1 h-1 bg-black rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </div>
              <span className={`text-xs mt-1 ${isActive ? 'text-black font-medium' : 'text-gray-600'}`}>
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