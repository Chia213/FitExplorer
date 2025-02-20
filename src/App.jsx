import { useState } from "react";
import logo from "./assets/logo.png";

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        <ul className="hidden xl:flex items-center gap-12 font-semibold text-base">
          <li className="p-3 hover:bg-sky-700 hover:text-white rounded-md transition-all cursor-pointer">
            Home
          </li>
          <li className="p-3 hover:bg-sky-700 hover:text-white rounded-md transition-all cursor-pointer">
            About
          </li>
          <li className="p-3 hover:bg-sky-700 hover:text-white rounded-md transition-all cursor-pointer">
            Profile
          </li>
        </ul>
        <div className="relative hidden md:flex items-center justify-center gap-3">
          <i className="bx bx-search absolute left-3 text-2xl text-gray-500"></i>
          <input
            type="text"
            placeholder="Search..."
            className="py-2 pl-10 rounded-xl border-2 border-blue-300 focus:bg-slate-100 focus:outline-sky-500"
          />
        </div>
        {/* Menyikon för mobila enheter */}
        <i
          className="bx bx-menu xl:hidden block text-5xl cursor-pointer"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        ></i>

        {/* Mobilmeny */}
        <div
          className={`absolute xl:hidden top-24 left-0 w-full bg-white flex flex-col items-center gap-6 font-semibold text-lg transform transition-transform ${
            isMenuOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-5"
          }`}
          style={{ transition: "transform 0.3s ease, opacity 0.3s ease" }}
        >
          <ul className="w-full text-center">
            <li className="list-none w-full p-4 hover:bg-sky-400 hover:text-white transition-all cursor-pointer">
              Home
            </li>
            <li className="list-none w-full p-4 hover:bg-sky-400 hover:text-white transition-all cursor-pointer">
              About
            </li>
            <li className="list-none w-full p-4 hover:bg-sky-400 hover:text-white transition-all cursor-pointer">
              Profile
            </li>
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;
