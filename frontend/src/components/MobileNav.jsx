import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const MobileNav = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: 'bx-home', label: 'Home' },
    { path: '/workout-generator', icon: 'bx-dumbbell', label: 'Workouts' },
    { path: '/nutrition', icon: 'bx-food-menu', label: 'Nutrition' },
    { path: '/progress-tracker', icon: 'bx-chart', label: 'Progress' },
    { path: '/profile', icon: 'bx-user', label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center w-full h-full ${
              location.pathname === item.path
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <i className={`bx ${item.icon} text-2xl`}></i>
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileNav; 