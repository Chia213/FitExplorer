import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  ChartBarIcon, 
  UserIcon, 
  CogIcon,
  PlusIcon,
  FireIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Home' },
    { path: '/workout-log', icon: PlusIcon, label: 'Log Workout' },
    { path: '/progress-tracker', icon: ChartBarIcon, label: 'Progress' },
    { path: '/nutrition', icon: FireIcon, label: 'Nutrition' },
    { path: '/workout-history', icon: ClipboardDocumentListIcon, label: 'History' },
    { path: '/profile', icon: UserIcon, label: 'Profile' },
    { path: '/settings', icon: CogIcon, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden">
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
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNav; 