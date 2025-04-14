import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  ChartBarIcon, 
  UserIcon, 
  Cog6ToothIcon,
  PlusCircleIcon,
  CalendarIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

export default function MobileNav() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Home' },
    { path: '/workout-log', icon: PlusCircleIcon, label: 'Log' },
    { path: '/workout-history', icon: CalendarIcon, label: 'History' },
    { path: '/progress-tracker', icon: ChartBarIcon, label: 'Progress' },
    { path: '/explore-muscle-guide', icon: BookOpenIcon, label: 'Guide' },
    { path: '/profile', icon: UserIcon, label: 'Profile' },
    { path: '/settings', icon: Cog6ToothIcon, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full ${
                isActive 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 