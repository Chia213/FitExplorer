import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import titanImage from '../assets/titan.png';
import femaleTitanImage from '../assets/female-titan.png';
import aiWorkoutGeneratorImage from '../assets/ai-workoutgenerator.png';
import nutritionTrackingImage from '../assets/nutrition-tracking.png';
import progressTrackingImage from '../assets/progress-tracking.png';
import personalRecordsImage from '../assets/personal-records.png';
import fitnessCalculatorImage from '../assets/fitness-calculator.png';
import '../styles/landing-page.css';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const LandingPage = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  useEffect(() => {
    // Only scroll to top on initial page load, not when changing features
    if (activeFeature === 0) {
      window.scrollTo(0, 0);
    }
    
    // Auto-rotate through features
    let interval;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setActiveFeature(prev => (prev + 1) % features.length);
      }, 4000);
    }
    
    return () => clearInterval(interval);
  }, [isAutoPlaying, activeFeature]);

  const features = [
    {
      id: 1,
      title: "AI Workout Generator",
      description: "Get personalized AI workouts based on your goals, equipment, and experience level that adapt as you progress.",
      icon: "🏋️‍♀️",
      link: "/ai-workout-generator",
      color: "bg-blue-500",
      bgGradient: "from-blue-600 to-indigo-700",
      image: aiWorkoutGeneratorImage,
      specialStyle: "h-full object-cover"
    },
    {
      id: 2,
      title: "Workout Log & Routines",
      description: "Track your training progress and create personalized workout plans. Log exercises, record sets, reps, and weights with our intuitive interface for a complete history of your fitness journey.",
      icon: "📝",
      link: "/workout-log",
      color: "bg-orange-500",
      bgGradient: "from-orange-500 to-amber-600",
      image: titanImage,
      hasSplitView: true,
      splitViewLinks: [
        { title: "Workout Log", subtitle: "Track your exercises", link: "/workout-log", icon: "📊" },
        { title: "Routines", subtitle: "Build custom plans", link: "/routines", icon: "🔄" }
      ]
    },
    {
      id: 3,
      title: "Nutrition Tracking",
      description: "Track meals, calories, and macros with our smart nutrition system that provides personalized recommendations.",
      icon: "🥗",
      link: "/nutrition",
      color: "bg-green-500",
      bgGradient: "from-green-600 to-teal-700",
      image: nutritionTrackingImage,
      specialStyle: "h-auto object-contain max-h-80"
    },
    {
      id: 4,
      title: "Progress Tracking",
      description: "Visualize your fitness journey with detailed progress graphs, body measurements, and performance metrics.",
      icon: "📈",
      link: "/progress-tracker",
      color: "bg-purple-500",
      bgGradient: "from-purple-600 to-pink-700",
      image: progressTrackingImage,
      specialStyle: "h-auto object-contain max-h-80"
    },
    {
      id: 5,
      title: "Exercise Library",
      description: "Access 500+ exercises with step-by-step instructions, video demonstrations, and proper form guidance.",
      icon: "📚",
      link: "/routines",
      color: "bg-amber-500",
      bgGradient: "from-amber-600 to-orange-700",
      image: null,
      hasBothImages: true
    },
    {
      id: 6,
      title: "Personal Records",
      description: "Track and celebrate your personal bests with automatic PR detection and achievement unlocks.",
      icon: "🏆",
      link: "/personal-records",
      color: "bg-red-500",
      bgGradient: "from-red-600 to-rose-700",
      image: personalRecordsImage,
      specialStyle: "h-auto object-contain max-h-80"
    },
    {
      id: 7,
      title: "Fitness Calculators",
      description: "Optimize your fitness journey with BMI, TDEE, body fat, and other essential calculators in one place.",
      icon: "🧮",
      link: "/fitness-calculator",
      color: "bg-teal-500",
      bgGradient: "from-teal-600 to-cyan-700",
      image: fitnessCalculatorImage,
      specialStyle: "h-auto object-contain max-h-80"
    }
  ];

  const testimonials = [
    {
      id: 1,
      quote: "The AI workout generator is incredible! It adapts to my progress and keeps challenging me with new routines. I've seen more progress in 3 months than I did in a whole year before.",
      name: "Sarah K.",
      title: "Fitness Enthusiast",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      id: 2,
      quote: "The nutrition tracking paired with workout planning has completely transformed my approach to fitness. I've lost 25lbs and gained significant muscle definition.",
      name: "Michael T.",
      title: "Weight Loss Journey",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      id: 3,
      quote: "As a busy professional, I love how this app streamlines everything. The progress tracking keeps me motivated and the workout variety prevents plateaus.",
      name: "Emma R.",
      title: "Working Professional",
      avatar: "https://randomuser.me/api/portraits/women/67.jpg"
    }
  ];

  const stats = [
    { value: "500+", label: "Exercises" },
    { value: "New", label: "AI Workout Generator" },
    { value: "Free", label: "14-Day Trial" },
    { value: "24/7", label: "Progress Tracking" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section 
        className="relative py-20 bg-gradient-to-b from-blue-900 via-indigo-800 to-purple-900 text-white overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-20 pulse-animation"></div>
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-20 pulse-animation" style={{ animationDelay: '2s' }}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0 text-center md:text-left">
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-text"
                variants={fadeIn}
                transition={{ delay: 0.2 }}
              >
                Your Fitness Journey, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Reimagined</span>
              </motion.h1>
              <motion.p 
                className="text-xl mb-8 text-blue-100"
                variants={fadeIn}
                transition={{ delay: 0.4 }}
              >
                Achieve your fitness goals faster with AI-powered workouts, smart tracking, and personalized nutrition plans designed specifically for your body.
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row justify-center md:justify-start gap-4"
                variants={fadeIn}
                transition={{ delay: 0.6 }}
              >
                <Link to="/signup" className="btn-gradient text-white font-bold py-4 px-10 rounded-lg shadow-lg transform transition hover:scale-105 hover:-translate-y-1 flex items-center justify-center">
                  Start Your Journey Today!
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
                <Link to="/login" className="glass-effect text-white font-semibold py-4 px-10 rounded-lg shadow-lg transform transition hover:scale-105 hover:-translate-y-1">
                  Sign In
                </Link>
              </motion.div>
              <motion.p
                className="text-blue-200 mt-4 text-sm"
                variants={fadeIn}
                transition={{ delay: 0.8 }}
              >

              </motion.p>
            </div>
            <motion.div 
              className="md:w-1/2 relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative h-80 sm:h-96 overflow-hidden">
                <img 
                  src={titanImage} 
                  alt="Male Fitness" 
                  className="absolute w-72 h-auto object-contain object-center right-0 top-0 float-animation"
                  style={{ animationDelay: '0.5s' }}
                />
                <img 
                  src={femaleTitanImage} 
                  alt="Female Fitness" 
                  className="absolute w-64 h-auto object-contain object-center left-10 bottom-0 float-animation"
                />
              </div>
            </motion.div>
          </div>
          
          {/* Stats Bar */}
          <motion.div 
            className="mt-16 py-6 px-6 glass-effect rounded-2xl shadow-lg"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm md:text-base text-blue-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* App Showcase Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase text-sm">App Features</span>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 mt-2">Explore Our Powerful Features</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Discover how our comprehensive fitness platform can transform your health and fitness journey.
            </p>
          </div>

          {/* Feature Navigation */}
          <div className="flex justify-center mb-8 overflow-x-auto pb-4 hide-scrollbar">
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 w-full max-w-5xl">
              {features.map((feature, index) => (
                <button
                  key={feature.id}
                  onClick={() => {
                    setActiveFeature(index);
                    setIsAutoPlaying(false);
                  }}
                  className={`flex items-center px-4 py-2 rounded-full transition-all whitespace-nowrap ${
                    activeFeature === index 
                      ? `bg-gradient-to-r ${feature.bgGradient} text-white shadow-md`
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-2">{feature.icon}</span>
                  <span>{feature.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Feature Showcase */}
          <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Progress indicators */}
            <div className="absolute top-0 left-0 right-0 flex">
              {features.map((_, index) => (
                <div key={index} className="h-1 flex-1 bg-gray-700">
                  {index === activeFeature && (
                    <div className="h-full loading-bar"></div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`content-${activeFeature}`}
                    className="text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={`w-16 h-16 rounded-full ${features[activeFeature].color} flex items-center justify-center text-white text-2xl mb-6`}>
                      <span>{features[activeFeature].icon}</span>
                    </div>
                    <h3 className="text-3xl font-bold mb-4">{features[activeFeature].title}</h3>
                    <p className="text-gray-300 text-lg mb-8">{features[activeFeature].description}</p>
                    <Link 
                      to={features[activeFeature].link}
                      className={`inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r ${features[activeFeature].bgGradient} text-white font-medium shadow-lg transform transition hover:scale-105`}
                    >
                      Explore {features[activeFeature].title}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </motion.div>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`image-${activeFeature}`}
                    className="app-screen-container mx-auto"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative app-screen">
                      {/* Simulated device frame */}
                      <div className="absolute inset-0 border-[12px] border-gray-800 rounded-3xl z-10 pointer-events-none"></div>
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-6 bg-gray-800 rounded-b-xl z-20 pointer-events-none"></div>
                      
                      {/* Screen content */}
                      <div className="overflow-hidden rounded-2xl relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-white/20 animate-gleam z-10"></div>
                        <div className={`pt-6 pb-12 px-4 bg-gradient-to-br ${features[activeFeature].bgGradient} bg-opacity-10`}>
                          {features[activeFeature].hasBothImages ? (
                            <div className="flex flex-col items-center space-y-6">
                              <h4 className="text-white text-lg font-medium">Complete Exercise Library</h4>
                              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                                <div className="relative">
                                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg blur opacity-30 animate-pulse"></div>
                                  <div className="relative bg-gray-800 rounded-lg p-1">
                                    <img 
                                      src={titanImage} 
                                      alt="Male Exercise Demonstrations" 
                                      className="w-44 h-auto object-contain rounded shadow-lg"
                                    />
                                    <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-white bg-black/50 py-1">Male Exercises</div>
                                  </div>
                                </div>
                                <div className="relative">
                                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg blur opacity-30 animate-pulse"></div>
                                  <div className="relative bg-gray-800 rounded-lg p-1">
                                    <img 
                                      src={femaleTitanImage} 
                                      alt="Female Exercise Demonstrations" 
                                      className="w-44 h-auto object-contain rounded shadow-lg"
                                    />
                                    <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-white bg-black/50 py-1">Female Exercises</div>
                                  </div>
                                </div>
                              </div>
                              <p className="text-white/70 text-sm text-center">500+ exercises with proper form demonstrations</p>
                            </div>
                          ) : features[activeFeature].hasSplitView ? (
                            <div className="flex flex-col items-center space-y-6">
                              <h4 className="text-white text-lg font-medium">Manage Your Training</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full max-w-xl mx-auto">
                                {features[activeFeature].splitViewLinks.map((item, idx) => (
                                  <Link 
                                    key={idx}
                                    to={item.link}
                                    className="group relative"
                                  >
                                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-amber-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                                    <div className="relative bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-amber-400 transition duration-300">
                                      <div className="flex items-start space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-xl">
                                          {item.icon}
                                        </div>
                                        <div>
                                          <h5 className="text-white font-bold">{item.title}</h5>
                                          <p className="text-gray-300 text-sm">{item.subtitle}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                              <div className="w-full max-w-xl bg-black/30 rounded-xl p-4">
                                <div className="flex justify-between items-center text-amber-300 text-sm font-semibold mb-2">
                                  <span>Recent Workout: Push Day</span>
                                  <span>3 days ago</span>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-white text-xs">
                                    <span>Bench Press</span>
                                    <span>3 × 8 @ 85kg</span>
                                  </div>
                                  <div className="flex justify-between text-white text-xs">
                                    <span>Shoulder Press</span>
                                    <span>3 × 10 @ 45kg</span>
                                  </div>
                                  <div className="flex justify-between text-white text-xs">
                                    <span>Tricep Extensions</span>
                                    <span>3 × 12 @ 25kg</span>
                                  </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-700">
                                  <div className="flex justify-between items-center">
                                    <span className="text-white text-xs">Next workout: Leg Day</span>
                                    <span className="text-green-400 text-xs font-medium bg-green-900/30 px-2 py-1 rounded">Tomorrow</span>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2 flex justify-center space-x-3">
                                <div className="bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1 text-xs text-amber-300 flex items-center">
                                  <span className="mr-1">⏱️</span> Track time
                                </div>
                                <div className="bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1 text-xs text-amber-300 flex items-center">
                                  <span className="mr-1">📊</span> Stats
                                </div>
                                <div className="bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1 text-xs text-amber-300 flex items-center">
                                  <span className="mr-1">🔄</span> History
                                </div>
                              </div>
                            </div>
                          ) : (
                            <img 
                              src={features[activeFeature].image} 
                              alt={features[activeFeature].title} 
                              className={`w-full max-w-md mx-auto rounded-lg shadow-lg ${features[activeFeature].specialStyle || 'h-auto object-contain'}`}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Pagination dots for mobile */}
            <div className="flex justify-center pb-6">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveFeature(index);
                    setIsAutoPlaying(false);
                  }}
                  className={`w-3 h-3 mx-1 rounded-full transition-all ${
                    activeFeature === index 
                      ? 'bg-white' 
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  aria-label={`View feature ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-indigo-950"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase text-sm">How It Works</span>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 mt-2">Start Your Fitness Journey in Seconds</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Just one sign-up away from all the tools you need to transform your body and health.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg relative"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">1</div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Create Your Account</h3>
              <p className="text-gray-600 dark:text-gray-300">Sign up in 30 seconds - no credit card needed. Get instant access to AI workouts, meal tracking, and progress tools.</p>
            </motion.div>
            
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg relative"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">2</div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Explore Amazing Features</h3>
              <p className="text-gray-600 dark:text-gray-300">Discover AI workout generation, nutrition tracking, exercise library, and fitness calculators all in one powerful app.</p>
            </motion.div>
            
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg relative"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">3</div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Transform Your Body</h3>
              <p className="text-gray-600 dark:text-gray-300">Experience real results with our data-driven approach. Our adaptive AI system learns what works for your unique body to optimize your fitness journey.</p>
            </motion.div>
          </div>
          
          <div className="flex justify-center mt-12">
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20 pulse-animation"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-600 rounded-full filter blur-3xl opacity-20 pulse-animation" style={{ animationDelay: '1.5s' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to start your fitness journey?</h2>
            <p className="text-xl mb-8 text-blue-100">Join our community of fitness enthusiasts today!</p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup" className="bg-white text-indigo-700 font-bold py-4 px-10 rounded-lg shadow-xl transform transition hover:scale-105 hover:-translate-y-1 flex items-center justify-center">
                Join FitExplorer
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link to="/about" className="glass-effect border-2 border-white text-white font-semibold py-4 px-10 rounded-lg shadow-lg transform transition hover:scale-105 hover:-translate-y-1">
                Explore Features
              </Link>
            </div>
            <p className="text-blue-200 mt-6">Let's build your fitness journey together!</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 