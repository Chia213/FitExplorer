import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaBell, FaCog, FaSignOutAlt } from 'react-icons/fa';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = React.useRef(null);

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsOpen(false);
    setUserDropdownOpen(false);
  }, [location]);

  // Check auth status
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
          setIsAuthenticated(false);
          setUsername(null);
          setIsAdmin(false);
          localStorage.removeItem("token");
          localStorage.removeItem("access_token");
          return;
        }
        
        setUsername(decodedToken.sub);
        setIsAuthenticated(true);
        setIsAdmin(decodedToken.is_admin === true);
      } catch (error) {
        console.error("Error parsing token:", error);
        setIsAuthenticated(false);
        setUsername(null);
        setIsAdmin(false);
      }
    };
    
    checkAuth();
    
    window.addEventListener("storage", checkAuth);
    window.addEventListener("auth-change", checkAuth);
    
    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("auth-change", checkAuth);
    };
  }, [location]);

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
      
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("auth-change"));
      
      setUserDropdownOpen(false);
      navigate("/login");
    }
  };

  // Detect scroll for navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Navigation links
  const mainNavLinks = [
    { name: 'Home', path: '/' },
    { name: 'Workouts', path: '/workout-generator' },
    { name: 'Nutrition', path: '/nutrition' },
    { name: 'Progress', path: '/progress-tracker' },
    { name: 'About', path: '/about' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-neutral-900/80 backdrop-blur-lg shadow-md py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="container-modern flex justify-between items-center">
          {/* Logo with animated gradient */}
          <Link to="/" className="flex items-center group">
            <div className="w-10 h-10 rounded-lg overflow-hidden relative shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 bg-[length:200%_100%] animate-gradient-x"></div>
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">F</div>
            </div>
            <span className="ml-2 text-xl font-semibold text-white hidden sm:block relative group-hover:text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 transition-colors duration-300">
              FitExplorer
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-400 to-accent-400 group-hover:w-full transition-all duration-300"></span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {mainNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
                  isActive(link.path)
                    ? 'bg-white/10 text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 font-medium' 
                    : 'text-neutral-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons or User Menu (Desktop) */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-medium">
                    {username ? username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-white">{username}</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-xl shadow-lg overflow-hidden border border-white/10 backdrop-blur-sm"
                    >
                      <div className="py-2 px-4 border-b border-neutral-700">
                        <p className="text-sm text-neutral-400">Signed in as</p>
                        <p className="font-medium text-white">{username}</p>
                      </div>
                      <div className="py-1">
                        <Link to="/profile" className="block px-4 py-2 text-sm text-neutral-300 hover:bg-white/10 flex items-center">
                          <FaUser className="mr-2 text-primary-400" />
                          Profile
                        </Link>
                        <Link to="/notifications" className="block px-4 py-2 text-sm text-neutral-300 hover:bg-white/10 flex items-center">
                          <FaBell className="mr-2 text-accent-400" />
                          Notifications
                          {notificationCount > 0 && (
                            <span className="ml-2 bg-accent-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {notificationCount}
                            </span>
                          )}
                        </Link>
                        <Link to="/settings" className="block px-4 py-2 text-sm text-neutral-300 hover:bg-white/10 flex items-center">
                          <FaCog className="mr-2 text-neutral-400" />
                          Settings
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" className="block px-4 py-2 text-sm text-neutral-300 hover:bg-white/10 flex items-center">
                            <span className="mr-2 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-1.5 py-0.5 rounded">ADMIN</span>
                            Dashboard
                          </Link>
                        )}
                      </div>
                      <div className="py-1 border-t border-neutral-700">
                        <button 
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center"
                        >
                          <FaSignOutAlt className="mr-2" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="relative px-4 py-2 text-neutral-300 hover:text-white transition-colors duration-300 group"
                >
                  Log In
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link 
                  to="/signup" 
                  className="relative overflow-hidden px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg shadow-lg group"
                >
                  <span className="relative z-10">Sign Up</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-accent-500 to-accent-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-neutral-400 hover:text-white focus:outline-none hover:bg-white/10 transition-colors duration-300"
            aria-label="Toggle menu"
          >
            <div className="relative w-6 h-5">
              <span 
                className={`absolute h-0.5 w-6 bg-current transform transition-all duration-300 ${
                  isOpen ? 'rotate-45 top-2' : 'top-0'
                }`}
              ></span>
              <span 
                className={`absolute h-0.5 w-6 bg-current transform transition-all duration-300 ${
                  isOpen ? 'opacity-0' : 'opacity-100 top-2'
                }`}
              ></span>
              <span 
                className={`absolute h-0.5 w-6 bg-current transform transition-all duration-300 ${
                  isOpen ? '-rotate-45 top-2' : 'top-4'
                }`}
              ></span>
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 w-3/4 max-w-sm bg-neutral-900 shadow-xl p-6 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <Link to="/" className="flex items-center">
                  <div className="w-10 h-10 rounded-lg overflow-hidden relative shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 bg-[length:200%_100%] animate-gradient-x"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">F</div>
                  </div>
                  <span className="ml-2 text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
                    FitExplorer
                  </span>
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-neutral-400 hover:text-white"
                  aria-label="Close menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* User Profile (Mobile) */}
              {isAuthenticated && (
                <div className="mb-6 pb-6 border-b border-neutral-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center text-white font-medium text-lg">
                      {username ? username.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{username}</div>
                      {isAdmin && (
                        <div className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded mt-1 inline-block">
                          ADMIN
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <Link to="/profile" className="flex items-center justify-center space-x-1 py-2 bg-white/10 rounded-lg text-neutral-300 hover:bg-white/20 transition-colors">
                      <FaUser className="text-primary-400" />
                      <span>Profile</span>
                    </Link>
                    <Link to="/notifications" className="flex items-center justify-center space-x-1 py-2 bg-white/10 rounded-lg text-neutral-300 hover:bg-white/20 transition-colors">
                      <FaBell className="text-accent-400" />
                      <span>Notifications</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Mobile Nav Links */}
              <nav className="flex flex-col space-y-1 mb-8">
                {mainNavLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={link.path}
                      className={`block px-4 py-3 rounded-lg transition-colors duration-300 ${
                        isActive(link.path)
                          ? 'bg-primary-900/30 text-primary-400 font-medium border-l-4 border-primary-500' 
                          : 'text-neutral-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Mobile Auth Buttons or Logout */}
              {isAuthenticated ? (
                <button 
                  onClick={handleLogout}
                  className="w-full py-3 text-center bg-red-500/10 text-red-400 font-medium rounded-lg hover:bg-red-500/20 transition-colors duration-300 flex items-center justify-center"
                >
                  <FaSignOutAlt className="mr-2" />
                  Sign out
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-4 mt-auto">
                  <Link 
                    to="/login" 
                    className="py-3 text-center text-neutral-300 hover:text-white border border-neutral-700 rounded-lg hover:border-neutral-600 transition-colors duration-300"
                  >
                    Log In
                  </Link>
                  <Link 
                    to="/signup" 
                    className="py-3 text-center bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium rounded-lg"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Footer */}
              <div className="mt-12 pt-6 border-t border-neutral-800 text-center text-sm text-neutral-500">
                <p>© {new Date().getFullYear()} FitExplorer.</p>
                <p className="mt-1">All rights reserved.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className={`${isScrolled ? 'h-[60px]' : 'h-[80px]'} transition-all duration-300`}></div>
    </>
  );
}

export default Navbar;
