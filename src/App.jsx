import { useState } from "react";
import { FaHome, FaUser, FaInfoCircle } from "react-icons/fa";
import logo from "./assets/logo.png";

function App() {
  const [showAuthOptions, setShowAuthOptions] = useState(false);

  return (
    <div className="w-full h-full absolute bg-gradient-to-r from-blue-400 to-emerald-400">
      <header className="flex justify-between items-center text-black py-6 px-8 md:px-32 bg-white drop-shadow-md">
        <a href="#">
          <img
            src={logo}
            alt="Logo"
            className="w-20 hover:scale-105 transition-all"
          />
        </a>

        <div className="flex items-center gap-8">
          <ul className="flex items-center gap-6 font-semibold text-base">
            <li className="flex flex-col items-center p-3 hover:bg-sky-700 hover:text-white rounded-md transition-all cursor-pointer">
              <FaHome size={24} />
              <span className="text-sm">Home</span>
            </li>
            <li className="flex flex-col items-center p-3 hover:bg-sky-700 hover:text-white rounded-md transition-all cursor-pointer">
              <FaInfoCircle size={24} />
              <span className="text-sm">About</span>
            </li>
            <li
              className="flex flex-col items-center p-3 hover:bg-sky-700 hover:text-white rounded-md transition-all cursor-pointer"
              onClick={() => setShowAuthOptions(!showAuthOptions)}
            >
              <FaUser size={24} />
              <span className="text-sm">Profile</span>
            </li>
          </ul>

          {showAuthOptions ? (
            <div className="flex gap-3">
              <button className="p-3 bg-green-500 text-white rounded-md transition-all cursor-pointer">
                Login
              </button>
              <button className="p-3 bg-blue-500 text-white rounded-md transition-all cursor-pointer">
                Signup
              </button>
            </div>
          ) : null}

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
    </div>
  );
}

export default App;
