import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// App UI Mockup Component
const AppPreviewMockup = () => (
  <div className="relative aspect-[9/16] max-w-xs mx-auto bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden border-8 border-neutral-800">
    {/* App Status Bar */}
    <div className="bg-neutral-800 p-2 flex justify-between items-center">
      <div className="text-xs text-neutral-400">9:41</div>
      <div className="w-24 h-5 rounded-full bg-neutral-950"></div>
      <div className="flex space-x-1">
        <div className="w-3 h-3 rounded-full bg-primary-400"></div>
        <div className="w-3 h-3 rounded-full bg-neutral-400"></div>
        <div className="w-3 h-3 rounded-full bg-neutral-400"></div>
      </div>
    </div>
    
    {/* App Content */}
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="text-xl font-bold text-white">Hi, Alex 👋</div>
          <div className="text-xs text-neutral-400">Let's crush your workout today!</div>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-accent-500"></div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-6 bg-neutral-800 p-3 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-white">Today's Progress</div>
          <div className="text-sm text-primary-400 font-semibold">87%</div>
        </div>
        <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full" style={{width: "87%"}}></div>
        </div>
      </div>
      
      {/* Workout Card */}
      <div className="bg-gradient-to-r from-primary-900/50 to-primary-800/50 backdrop-blur-sm p-4 rounded-xl mb-4 border border-primary-700/30">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs text-primary-400 mb-1">NEXT WORKOUT</div>
            <div className="text-lg font-bold text-white mb-1">Upper Body</div>
            <div className="flex items-center text-xs text-neutral-400">
              <span className="mr-2">🕑 45 min</span>
              <span>💪 5 exercises</span>
            </div>
          </div>
          <div className="bg-primary-500 rounded-lg p-2">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>
      
      {/* Nutrition Card */}
      <div className="bg-gradient-to-r from-accent-900/50 to-accent-800/50 backdrop-blur-sm p-4 rounded-xl mb-4 border border-accent-700/30">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs text-accent-400 mb-1">TODAY'S NUTRITION</div>
            <div className="text-lg font-bold text-white mb-1">1,850 / 2,200 kcal</div>
            <div className="flex items-center text-xs text-neutral-400">
              <span className="mr-2">🍗 Protein: 120g</span>
              <span>🍚 Carbs: 180g</span>
            </div>
          </div>
          <div className="bg-accent-500 rounded-lg p-2">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
        </div>
      </div>
      
      {/* Exercise Icons */}
      <div className="mt-6">
        <div className="text-sm font-semibold text-white mb-3">Exercise Categories</div>
        <div className="grid grid-cols-4 gap-2">
          {["🏋️", "🏃", "🧘", "💪"].map((icon, index) => (
            <div key={index} className="aspect-square rounded-xl flex items-center justify-center bg-neutral-800 text-xl">
              {icon}
            </div>
          ))}
        </div>
      </div>
    </div>
    
    {/* Bottom Navigation */}
    <div className="absolute bottom-0 left-0 right-0 bg-neutral-800 p-3 flex justify-around">
      <div className="rounded-lg p-2 bg-primary-800">
        <svg className="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
        </svg>
      </div>
      {[
        <svg className="w-5 h-5 text-neutral-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"></path>
        </svg>,
        <svg className="w-5 h-5 text-neutral-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" clipRule="evenodd"></path>
        </svg>,
        <svg className="w-5 h-5 text-neutral-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"></path>
        </svg>
      ].map((icon, index) => (
        <div key={index} className="p-2">
          {icon}
        </div>
      ))}
    </div>
    
    {/* Floating Badges */}
    <div className="absolute top-12 right-0 translate-x-1/2 bg-gradient-to-r from-accent-500 to-accent-600 text-white text-xs font-bold py-1 px-2 rounded-full">
      PRO
    </div>
  </div>
);

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-b from-neutral-900 via-primary-900 to-neutral-900 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/src/assets/grid-pattern.svg')] opacity-10"></div>
        <div className="absolute -left-48 -top-48 w-96 h-96 bg-primary-500/30 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute -right-48 -bottom-48 w-96 h-96 bg-accent-500/30 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Content Container */}
      <div className="container-modern relative z-10 pt-32 pb-20 min-h-screen flex flex-col justify-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-block mb-6 px-4 py-1.5 bg-white/10 rounded-full backdrop-blur-sm border border-white/20"
            >
              <span className="text-sm font-medium text-primary-400">AI-Powered Fitness Platform</span>
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Transform Your 
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
                Fitness Journey
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-neutral-300 mb-8 max-w-2xl">
              Experience the future of fitness with AI-powered workouts, smart tracking, 
              and personalized nutrition plans designed for your unique goals.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link 
                to="/signup" 
                className="relative overflow-hidden group bg-gradient-to-r from-primary-600 to-primary-500 text-white px-8 py-3 rounded-lg shadow-lg flex items-center justify-center"
              >
                <span className="relative z-10 font-semibold">Start Free Trial</span>
                <span className="absolute inset-0 bg-gradient-to-r from-accent-500 to-accent-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 relative z-10" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              
              <Link 
                to="/about" 
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-3 rounded-lg hover:bg-white/20 transition-colors duration-300 border border-white/20"
              >
                Learn More
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: "10K+", label: "Active Users" },
                { value: "500+", label: "Workouts" },
                { value: "4.8★", label: "App Rating" },
                { value: "24/7", label: "Support" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl"
                >
                  <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">{stat.value}</div>
                  <div className="text-sm text-neutral-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Feature Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative max-w-sm mx-auto">
              {/* Phone frame and UI mockup */}
              <div className="relative z-10">
                <AppPreviewMockup />
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary-500/20 rounded-full filter blur-3xl"></div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-accent-500/20 rounded-full filter blur-3xl"></div>
              
              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-8 -right-8 bg-black/20 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg z-20"
              >
                <div className="text-sm font-medium">Workout Streak</div>
                <div className="text-2xl font-bold text-accent-400">12 Days</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 