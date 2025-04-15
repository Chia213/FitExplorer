import React from 'react';
import MobileNav from './MobileNav';

const MobileLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="pb-16 md:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
};

export default MobileLayout; 