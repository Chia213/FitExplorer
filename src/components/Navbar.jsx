import { useState } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaInfoCircle, FaDumbbell } from "react-icons/fa";
import logo from "../assets/logo.png";

function Navbar() {
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const [showWorkoutDropdown, setShowWorkoutDropdown] = useState(false);

  return (
    <header className="w-full bg-gradient-to-r from-blue-400 to-emerald-400 text-black flex justify-between items-center py-6 px-8 md:px-32 drop-shadow-md">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logo}
            alt="Logo"
            className="w-20 hover:scale-105 transition-all"
          />
          <span className="text-xl font-bold cursor-pointer">FitExplorer</span>
        </Link>
      </div>

      <div className="flex items-center gap-8">
        <ul className="flex items-center gap-6 font-semibold text-base">
          <li
            className="relative flex flex-col items-center p-3 hover:bg-sky-700 hover:text-white rounded-md transition-all cursor-pointer"
            onMouseEnter={() => setShowWorkoutDropdown(true)}
            onMouseLeave={() => setShowWorkoutDropdown(false)}
          >
            <div className="flex flex-col items-center">
              <FaDumbbell size={24} />
              <span className="text-sm">Workouts</span>
            </div>
            {showWorkoutDropdown && (
              <ul className="absolute top-12 bg-white shadow-lg rounded-md p-2 text-black w-40">
                <li className="p-2 hover:bg-gray-200 rounded-md">
                  <Link to="/workout-log">Workout Log</Link>
                </li>
                <li className="p-2 hover:bg-gray-200 rounded-md">
                  <Link to="/add-exercise">Add Exercise</Link>
                </li>
              </ul>
            )}
          </li>
          <li className="flex flex-col items-center p-3 hover:bg-sky-700 hover:text-white rounded-md transition-all cursor-pointer">
            <Link to="/about" className="flex flex-col items-center">
              <FaInfoCircle size={24} />
              <span className="text-sm">About</span>
            </Link>
          </li>
          <li
            className="relative flex flex-col items-center p-3 hover:bg-sky-700 hover:text-white rounded-md transition-all cursor-pointer"
            onMouseEnter={() => setShowAuthDropdown(true)}
            onMouseLeave={() => setShowAuthDropdown(false)}
          >
            <div className="flex flex-col items-center">
              <FaUser size={24} />
              <span className="text-sm">Profile</span>
            </div>
            {showAuthDropdown && (
              <ul className="absolute top-12 bg-white shadow-lg rounded-md p-2 text-black w-40">
                <li className="p-2 hover:bg-gray-200 rounded-md">
                  <Link to="/login">Login</Link>
                </li>
                <li className="p-2 hover:bg-gray-200 rounded-md">
                  <Link to="/signup">Signup</Link>
                </li>
              </ul>
            )}
          </li>
        </ul>

        <div className="relative hidden md:flex items-center">
          <input
            type="text"
            placeholder="Search..."
            className="py-2 pl-10 pr-4 rounded-xl border-2 border-blue-300 focus:bg-slate-100 focus:outline-sky-500"
          />
        </div>
      </div>
    </header>
  );
}

export default Navbar;
