import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import React, { useState, useEffect } from 'react';

function Layout({ children }) {
  const { theme } = useTheme();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div
      className={`
        min-h-screen w-full
        ${
          theme === "dark"
            ? "bg-gray-900 text-white transition-colors duration-500"
            : "bg-gradient-to-br from-blue-50 via-white to-green-50 text-gray-800 transition-colors duration-500"
        }
        selection:bg-blue-200 dark:selection:bg-blue-800
        antialiased
        overflow-x-hidden
        relative
        ${isMobile ? 'pb-24' : 'pb-6'}
      `}
    >
      
      <div className="w-full relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ 
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Layout;
