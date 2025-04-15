import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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
                className="btn-primary group relative overflow-hidden"
              >
                <span className="relative z-10">Start Free Trial</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </Link>
              
              <Link 
                to="/about" 
                className="glass-effect text-white px-8 py-3 rounded-lg hover:bg-white/20 transition-colors duration-300"
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
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="glass-effect p-4 rounded-xl"
                >
                  <div className="text-2xl font-bold text-primary-400">{stat.value}</div>
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
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* App Preview Image */}
              <img
                src="/src/assets/app-preview.png"
                alt="FitExplorer App Preview"
                className="rounded-2xl shadow-2xl"
              />
              
              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-8 -right-8 glass-effect p-4 rounded-xl"
              >
                <div className="text-sm font-medium">Today's Progress</div>
                <div className="text-2xl font-bold text-primary-400">87%</div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-8 -left-8 glass-effect p-4 rounded-xl"
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