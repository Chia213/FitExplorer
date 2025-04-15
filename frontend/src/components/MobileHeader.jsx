import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const MobileHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', icon: 'bx-home', label: 'Home' },
    { path: '/workout-generator', icon: 'bx-dumbbell', label: 'Workouts' },
    { path: '/nutrition', icon: 'bx-food-menu', label: 'Nutrition' },
    { path: '/progress-tracker', icon: 'bx-chart', label: 'Progress' },
    { path: '/profile', icon: 'bx-user', label: 'Profile' },
  ];

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm md:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img
                className="h-8 w-auto"
                src="/logo.png"
                alt="FitExplorer"
              />
            </Link>
          </div>
          
          <div className="flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <i className="bx bx-menu text-2xl"></i>
              ) : (
                <i className="bx bx-x text-2xl"></i>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="absolute top-16 inset-x-0 p-2 transform origin-top-right md:hidden">
          <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white dark:bg-gray-800 divide-y divide-gray-100">
            <div className="px-5 pt-5 pb-6">
              <nav className="grid gap-y-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      location.pathname === item.path
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    <i className={`bx ${item.icon} text-xl mr-3`}></i>
                    <span className="text-base font-medium">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default MobileHeader; 