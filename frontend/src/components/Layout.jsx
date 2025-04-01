import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";

function Layout({ children }) {
  const { theme } = useTheme();
  const location = useLocation();

  return (
    <div
      className={`
        min-h-screen 
        ${
          theme === "dark"
            ? "bg-gray-900 text-white transition-colors duration-300"
            : "bg-gradient-to-r from-green-50 to-blue-100 text-gray-800 transition-colors duration-300"
        }
        selection:bg-blue-200 dark:selection:bg-blue-800
        antialiased
        overflow-x-hidden
      `}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Layout;
