import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../hooks/useTheme";

export default function Layout() {
  const { theme } = useTheme();
  const location = useLocation();
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if the app is running in standalone mode (installed as PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(isStandalone);
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
        flex flex-col
      `}
    >
      {/* Add subtle pattern overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {!isStandalone && <Navbar />}
      
      <div className="w-full relative z-10 flex-1">
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
            className={`w-full ${isStandalone ? 'pb-16' : ''}`}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>

      {isStandalone && <MobileNav />}
    </div>
  );
}
