import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaUser,
  FaInfoCircle,
  FaDumbbell,
  FaSearch,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaRandom, // Added for workout generator icon
} from "react-icons/fa";
import logo from "../assets/logo.png";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../hooks/useTheme";

// Pages array for search functionality
const pages = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Workout Log", path: "/workout-log" },
  { name: "Workout History", path: "/workout-history" },
  { name: "Workout Generator", path: "/workout-generator" }, // Added this line
  { name: "Profile", path: "/profile" },
];

function Navbar() {
  const [showDropdown, setShowDropdown] = useState({
    auth: false,
    workout: false,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [username, setUsername] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const authDropdownRef = useRef(null);
  const workoutDropdownRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      setUsername(decodedToken.sub);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [location]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setSearchResults(
      query.length > 0
        ? pages.filter((page) => page.name.toLowerCase().includes(query))
        : []
    );
  };

  const handleResultClick = (path) => {
    setSearchQuery("");
    setSearchResults([]);
    setMobileMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUsername(null);
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        authDropdownRef.current &&
        !authDropdownRef.current.contains(event.target)
      ) {
        setShowDropdown((prev) => ({ ...prev, auth: false }));
      }
      if (
        workoutDropdownRef.current &&
        !workoutDropdownRef.current.contains(event.target)
      ) {
        setShowDropdown((prev) => ({ ...prev, workout: false }));
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-600/20 dark:hover:bg-gray-600/40"
            >
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
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
                  onClick={() =>
                    setShowDropdown({
                      ...showDropdown,
                      workout: !showDropdown.workout,
                    })
                  }
                  className="flex flex-col items-center p-3 hover:bg-sky-700/20 dark:hover:bg-sky-700/40 rounded-md transition-all"
                >
                  <FaDumbbell size={20} />
                  <span className="text-sm mt-1">Workouts</span>
                </button>

                {showDropdown.workout && (
                  <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden z-50 w-48">
                    <Link
                      to="/workout-log"
                      className="block p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Workout Log
                    </Link>
                    <Link
                      to="/workout-history"
                      className="block p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Workout History
                    </Link>
                    <Link
                      to="/workout-generator"
                      className="block p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
                    >
                      <FaRandom className="mr-2 text-green-500" /> Workout
                      Generator
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
                  onClick={() =>
                    setShowDropdown({
                      ...showDropdown,
                      auth: !showDropdown.auth,
                    })
                  }
                  className="flex flex-col items-center p-3 hover:bg-sky-700/20 dark:hover:bg-sky-700/40 rounded-md transition-all"
                >
                  <FaUser size={20} />
                  <span className="text-sm mt-1">
                    {isAuthenticated ? username : "Account"}
                  </span>
                </button>

                {showDropdown.auth && (
                  <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden z-50 w-48">
                    {isAuthenticated ? (
                      <>
                        <Link
                          to="/profile"
                          className="block p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left p-3 hover:bg-red-500 hover:text-white transition-colors flex items-center"
                        >
                          <FaSignOutAlt className="mr-2" /> Logout
                        </button>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>
                )}
              </div>

              <ThemeToggle className="ml-2" />
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-lg rounded-b-lg overflow-hidden">
          <div className="p-4">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-white"
              />
              {searchResults.length > 0 && (
                <div className="mt-2 bg-white dark:bg-gray-800 shadow-inner rounded-md overflow-hidden">
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

            <nav className="space-y-2">
              <div className="mb-2">
                <button
                  className="flex items-center w-full p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                  onClick={() =>
                    setShowDropdown({
                      ...showDropdown,
                      workout: !showDropdown.workout,
                    })
                  }
                >
                  <FaDumbbell className="mr-3" size={18} />
                  <span>Workouts</span>
                </button>

                {showDropdown.workout && (
                  <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-300 dark:border-gray-600 pl-4">
                    <Link
                      to="/workout-log"
                      className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      Workout Log
                    </Link>
                    <Link
                      to="/workout-history"
                      className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      Workout History
                    </Link>
                    <Link
                      to="/workout-generator"
                      className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center"
                    >
                      <FaRandom className="mr-2 text-green-500" /> Workout
                      Generator
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/about"
                className="flex items-center p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FaInfoCircle className="mr-3" size={18} />
                <span>About</span>
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FaUser className="mr-3" size={18} />
                    <span>Profile ({username})</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full p-3 rounded-md hover:bg-red-500 hover:text-white text-left"
                  >
                    <FaSignOutAlt className="mr-3" size={18} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FaUser className="mr-3" size={18} />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FaUser className="mr-3" size={18} />
                    <span>Signup</span>
                  </Link>
                </>
              )}

              <div className="p-3">
                <ThemeToggle />
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
