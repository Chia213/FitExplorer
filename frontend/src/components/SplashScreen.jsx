import React from "react";

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-green-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-purple-500 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-xs sm:max-w-sm mx-auto">
        {/* App Name */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6">
          <span className="block text-white text-xl sm:text-2xl md:text-3xl font-light mb-3">
            Welcome to
          </span>
          <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent leading-tight">
            FitExplorer
          </span>
        </h1>
        
        {/* Tagline */}
        <p className="text-base sm:text-lg md:text-xl text-gray-300 font-light tracking-wide uppercase mb-16 leading-relaxed px-2">
          Your Fitness Adventure Awaits
        </p>
        
        {/* Loading Container */}
        <div className="space-y-6">
          <div className="text-gray-400 text-sm font-medium tracking-wide">
            Loading...
          </div>
          
          {/* Loading Bar */}
          <div className="w-40 sm:w-48 md:w-56 h-1 bg-gray-700 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
      
      {/* Version */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <p className="text-gray-500 text-xs font-light tracking-wider">v1.0.0</p>
      </div>
    </div>
  );
};

export default SplashScreen;
