import { useState } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaInfoCircle, FaDumbbell } from "react-icons/fa";
import logo from "../assets/logo.png";

function Navbar() {
  const [showAuthOptions, setShowAuthOptions] = useState(false);

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
          <li className="flex flex-col items-center p-3 hover:bg-sky-700 hover:text-white rounded-md transition-all cursor-pointer">
            <Link to="/workout-log" className="flex flex-col items-center">
              <FaDumbbell size={24} />
              <span className="text-sm">Workout Log</span>
            </Link>
          </li>
          <li className="flex flex-col items-center p-3 hover:bg-sky-700 hover:text-white rounded-md transition-all cursor-pointer">
            <Link to="/add-exercise" className="flex flex-col items-center">
              <span className="text-sm">Add Exercise</span>
            </Link>
          </li>
          <li className="flex flex-col items-center p-3 hover:bg-sky-700 hover:text-white rounded-md transition-all cursor-pointer">
            <Link to="/about" className="flex flex-col items-center">
              <FaInfoCircle size={24} />
              <span className="text-sm">About</span>
            </Link>
          </li>
          <li
            className="flex flex-col items-center p-3 hover:bg-sky-700 hover:text-white rounded-md transition-all cursor-pointer"
            onClick={() => setShowAuthOptions(!showAuthOptions)}
          >
            <FaUser size={24} />
            <span className="text-sm">Profile</span>
          </li>
        </ul>

        {showAuthOptions && (
          <div className="flex gap-3">
            <Link
              to="/login"
              className="p-3 bg-green-500 text-white rounded-md transition-all cursor-pointer"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="p-3 bg-blue-500 text-white rounded-md transition-all cursor-pointer"
            >
              Signup
            </Link>
          </div>
        )}

        <div className="relative hidden md:flex items-center">
          <i className="bx bx-search absolute left-3 text-2xl text-gray-500"></i>
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
