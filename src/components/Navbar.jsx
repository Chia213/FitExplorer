import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaUser,
  FaInfoCircle,
  FaDumbbell,
  FaSearch,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import logo from "../assets/logo.png";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../hooks/useTheme";

function Navbar() {
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const [showWorkoutDropdown, setShowWorkoutDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const authDropdownRef = useRef(null);
  const workoutDropdownRef = useRef(null);
  const searchRef = useRef(null);

  const pages = [
    { name: "Home", path: "/" },
    { name: "Workout Log", path: "/workout-log" },
    { name: "Add Exercise", path: "/add-exercise" },
    { name: "Profile", path: "/profile" },
    { name: "About", path: "/about" },
    { name: "Login", path: "/login" },
    { name: "Signup", path: "/signup" },
  ];

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.length > 0) {
      const filteredResults = pages.filter((page) =>
        page.name.toLowerCase().includes(query)
      );
      setSearchResults(filteredResults);
    } else {
      setSearchResults([]);
    }
  };

  const handleResultClick = (path) => {
    setSearchQuery("");
    setSearchResults([]);
    setMobileMenuOpen(false);
    navigate(path);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        authDropdownRef.current &&
        !authDropdownRef.current.contains(event.target)
      ) {
        setShowAuthDropdown(false);
      }

      if (
        workoutDropdownRef.current &&
        !workoutDropdownRef.current.contains(event.target)
      ) {
        setShowWorkoutDropdown(false);
      }

      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header
      className={`w-full ${
        theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-r from-blue-400 to-emerald-400 text-black"
      } shadow-md z-50 sticky top-0`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 md:py-4 relative">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center gap-2">
              <img
                src={logo}
                alt="FitExplorer Logo"
                className="w-12 md:w-16 hover:scale-105 transition-all dark:invert"
              />
              <span className="text-lg md:text-xl font-bold hidden sm:block dark:text-white">
                FitExplorer
              </span>
            </Link>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md hover:bg-gray-600/20 dark:hover:bg-gray-600/40"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="relative" ref={searchRef}>
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearch}
                className="py-2 pl-10 pr-4 w-64 rounded-xl border-2 border-blue-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:bg-slate-100 dark:focus:bg-gray-700 focus:outline-sky-500"
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden z-50">
                  {searchResults.map((result) => (
                    <button
                      key={result.path}
                      onClick={() => handleResultClick(result.path)}
                      className="block w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {result.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <nav className="flex items-center gap-1">
              <div ref={workoutDropdownRef} className="relative">
                <button
                  onClick={() => setShowWorkoutDropdown(!showWorkoutDropdown)}
                  className="flex flex-col items-center p-3 hover:bg-sky-700/20 dark:hover:bg-sky-700/40 rounded-md transition-all"
                >
                  <FaDumbbell size={20} />
                  <span className="text-sm mt-1">Workouts</span>
                </button>

                {showWorkoutDropdown && (
                  <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden z-50 w-48">
                    <Link
                      to="/workout-log"
                      className="block p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Workout Log
                    </Link>
                    <Link
                      to="/add-exercise"
                      className="block p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Add Exercise
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/about"
                className="flex flex-col items-center p-3 hover:bg-sky-700/20 dark:hover:bg-sky-700/40 rounded-md transition-all"
              >
                <FaInfoCircle size={20} />
                <span className="text-sm mt-1">About</span>
              </Link>

              <div ref={authDropdownRef} className="relative">
                <button
                  onClick={() => setShowAuthDropdown(!showAuthDropdown)}
                  className="flex flex-col items-center p-3 hover:bg-sky-700/20 dark:hover:bg-sky-700/40 rounded-md transition-all"
                >
                  <FaUser size={20} />
                  <span className="text-sm mt-1">Profile</span>
                </button>

                {showAuthDropdown && (
                  <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden z-50 w-48">
                    <Link
                      to="/login"
                      className="block p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="block p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Signup
                    </Link>
                    <Link
                      to="/profile"
                      className="block p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      View Profile
                    </Link>
                  </div>
                )}
              </div>

              <ThemeToggle className="ml-2" />
            </nav>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-lg">
          <div className="px-4 py-3 border-b dark:border-gray-700">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearch}
                className="py-2 pl-10 pr-4 w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg rounded-md overflow-hidden z-50">
                  {searchResults.map((result) => (
                    <button
                      key={result.path}
                      onClick={() => handleResultClick(result.path)}
                      className="block w-full text-left p-3 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      {result.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <nav className="space-y-1 px-2 pb-3 pt-2">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
            >
              Home
            </Link>

            <div className="border-t dark:border-gray-700 pt-2 mt-2">
              <p className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Workouts
              </p>
              <Link
                to="/workout-log"
                className="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
              >
                Workout Log
              </Link>
              <Link
                to="/add-exercise"
                className="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
              >
                Add Exercise
              </Link>
            </div>

            <Link
              to="/about"
              className="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
            >
              About
            </Link>

            <div className="border-t dark:border-gray-700 pt-2 mt-2">
              <p className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Account
              </p>
              <Link
                to="/profile"
                className="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
              >
                Profile
              </Link>
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
              >
                Signup
              </Link>
            </div>

            <div className="border-t dark:border-gray-700 pt-2 mt-2 flex justify-between items-center px-3 py-2">
              <span className="text-gray-700 dark:text-gray-300">
                {theme === "dark" ? "Dark Mode" : "Light Mode"}
              </span>
              <ThemeToggle />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;