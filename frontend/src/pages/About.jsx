import React from "react";
import { Link } from "react-router-dom";
import {
  FaDumbbell,
  FaUtensils,
  FaBook,
  FaRandom,
  FaUserFriends,
  FaShieldAlt,
  FaChartLine,
  FaBell,
  FaRobot,
  FaCalendarAlt,
  FaCalculator,
  FaMedal,
  FaCheckCircle,
  FaServer,
} from "react-icons/fa";
import { motion } from "framer-motion";

function About() {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };
  
  const features = [
    {
      icon: <FaRobot className="text-blue-500 dark:text-blue-400" size={24} />,
      title: "AI Workout Generator",
      description: "Get personalized AI workouts based on your goals, equipment, and experience level that adapt as you progress.",
      gradient: "from-blue-50 to-indigo-50",
      darkGradient: "from-blue-900/20 to-indigo-900/20",
      border: "border-blue-100",
      darkBorder: "border-blue-900",
      link: "/ai-workout-generator"
    },
    {
      icon: <FaBook className="text-purple-500 dark:text-purple-400" size={24} />,
      title: "Workout Logging",
      description: "Track your training with our comprehensive workout system. Log exercises, sets, reps, and weights to build a complete fitness history.",
      gradient: "from-purple-50 to-pink-50",
      darkGradient: "from-purple-900/20 to-pink-900/20",
      border: "border-purple-100",
      darkBorder: "border-purple-900",
      link: "/workout-log"
    },
    {
      icon: <FaRandom className="text-green-500 dark:text-green-400" size={24} />,
      title: "Customizable Routines",
      description: "Create and save your favorite workout routines. Organize exercises into effective programs for consistent training.",
      gradient: "from-green-50 to-teal-50",
      darkGradient: "from-green-900/20 to-teal-900/20",
      border: "border-green-100",
      darkBorder: "border-green-900",
      link: "/routines"
    },
    {
      icon: <FaDumbbell className="text-amber-500 dark:text-amber-400" size={24} />,
      title: "Exercise Library",
      description: "Access 500+ exercises with detailed instructions and visual demonstrations for proper form and technique guidance.",
      gradient: "from-amber-50 to-yellow-50",
      darkGradient: "from-amber-900/20 to-yellow-900/20",
      border: "border-amber-100",
      darkBorder: "border-amber-900",
      link: "/explore-muscle-guide"
    },
    {
      icon: <FaChartLine className="text-indigo-500 dark:text-indigo-400" size={24} />,
      title: "Progress Tracking",
      description: "Visualize your fitness journey with comprehensive charts that monitor strength gains, body measurements, and performance metrics.",
      gradient: "from-indigo-50 to-violet-50",
      darkGradient: "from-indigo-900/20 to-violet-900/20",
      border: "border-indigo-100",
      darkBorder: "border-indigo-900",
      link: "/progress-tracker"
    },
    {
      icon: <FaUtensils className="text-rose-500 dark:text-rose-400" size={24} />,
      title: "Nutrition Tracking",
      description: "Track meals, calories, and macros with our smart nutrition system that provides personalized recommendations based on your goals.",
      gradient: "from-rose-50 to-red-50",
      darkGradient: "from-rose-900/20 to-red-900/20",
      border: "border-rose-100",
      darkBorder: "border-rose-900",
      link: "/nutrition"
    },
    {
      icon: <FaMedal className="text-orange-500 dark:text-orange-400" size={24} />,
      title: "Personal Records",
      description: "Track and celebrate your personal bests with automatic PR detection and achievement unlocks to keep you motivated.",
      gradient: "from-orange-50 to-amber-50",
      darkGradient: "from-orange-900/20 to-amber-900/20",
      border: "border-orange-100",
      darkBorder: "border-orange-900",
      link: "/personal-records"
    },
    {
      icon: <FaCalculator className="text-teal-500 dark:text-teal-400" size={24} />,
      title: "Fitness Calculators",
      description: "Calculate BMI, TDEE, body fat percentage, and other important metrics to optimize your fitness and nutrition plan.",
      gradient: "from-teal-50 to-cyan-50",
      darkGradient: "from-teal-900/20 to-cyan-900/20",
      border: "border-teal-100",
      darkBorder: "border-teal-900",
      link: "/fitness-calculator"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white py-24">
        <div 
          className="absolute inset-0 bg-black/10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-indigo-500/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        />
        <div className="container mx-auto text-center relative z-10 px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 inline-block shadow-2xl"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-indigo-200">
              We Are FitExplorer
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 text-blue-50 leading-relaxed">
              The future of fitness is here. Experience AI-powered workout generation, intelligent progress tracking, and personalized guidance that adapts to your unique journey.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 text-sm font-medium">
                ⚡ AI-Powered Workouts
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 text-sm font-medium">
                📊 Data-Driven Insights
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 text-sm font-medium">
                🎯 Personalized Training
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Link
                to="/signup"
                className="bg-white text-blue-600 hover:bg-blue-50 py-4 px-8 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Start Your Journey
              </Link>
              <Link
                to="/ai-workout-generator"
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 py-4 px-8 rounded-full text-lg font-semibold transition-all duration-300 backdrop-blur-sm"
              >
                Try AI Workouts
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 w-full -mt-16">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-6xl mx-auto w-full backdrop-blur-lg"
        >
          {/* About Section */}
          <motion.div 
            variants={cardVariants}
            className="mb-16"
          >
            <h2 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
              About FitExplorer
            </h2>
            <div className="text-center">
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 max-w-3xl mx-auto">
                FitExplorer is a comprehensive fitness platform designed to help you achieve your health and fitness goals through smart technology and personalized guidance.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                Our mission is to make fitness accessible, effective, and enjoyable for everyone by combining AI-powered workout generation, intuitive tracking tools, and data-driven insights that keep you motivated on your journey.
              </p>
            </div>
            
            {/* Statistics Section */}
            <div className="mt-16 mb-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                {[
                  { number: "500+", label: "Exercises", icon: <FaDumbbell size={24} /> },
                  { number: "AI", label: "Powered", icon: <FaRobot size={24} /> },
                  { number: "100%", label: "Free", icon: <FaCheckCircle size={24} /> },
                  { number: "24/7", label: "Available", icon: <FaServer size={24} /> }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl border border-blue-100 dark:border-gray-600"
                  >
                    <div className="text-blue-600 dark:text-blue-400 mb-2 flex justify-center">
                      {stat.icon}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
              {[
                { icon: <FaRobot size={20} />, text: "AI-Powered" },
                { icon: <FaChartLine size={20} />, text: "Data-Driven" },
                { icon: <FaUserFriends size={20} />, text: "Personalized" },
                { icon: <FaShieldAlt size={20} />, text: "Secure" }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full text-gray-800 dark:text-gray-200">
                  {item.icon}
                  <span className="font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold mb-12 text-gray-900 dark:text-white text-center">
              Our Features
            </h2>
            <motion.div 
              variants={containerVariants}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {features.map((feature, index) => (
                <motion.div variants={cardVariants} key={index}>
                  <Link to={feature.link} className="block hover:no-underline h-full">
                    <div className={`bg-gradient-to-br ${feature.gradient} dark:${feature.darkGradient} p-6 rounded-xl hover:shadow-xl transition-all duration-300 ease-in-out h-full border ${feature.border} dark:${feature.darkBorder} group relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 dark:from-white/5"></div>
                      <div className="relative">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                            {feature.icon}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {feature.title}
                          </h3>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          {feature.description}
                        </p>
                        <div className="mt-4 text-blue-600 dark:text-blue-400 font-medium flex items-center text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          Explore feature
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl overflow-hidden mb-16 relative"
          >
            <div className="absolute inset-0 bg-pattern opacity-10"></div>
            <div className="px-8 py-16 relative z-10">
              <div className="max-w-4xl mx-auto text-center text-white">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Fitness?</h2>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  Discover the power of AI-driven fitness planning and tracking. Start your transformation today with our comprehensive fitness platform.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-6 mb-8">
                  <Link
                    to="/signup"
                    className="bg-white text-blue-600 hover:bg-blue-50 py-4 px-10 rounded-full text-lg font-bold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                  >
                    🚀 Start Your Journey
                  </Link>
                  <Link
                    to="/ai-workout-generator"
                    className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 py-4 px-10 rounded-full text-lg font-bold transition-all duration-300 backdrop-blur-sm"
                  >
                    🤖 Try AI Workouts
                  </Link>
                </div>
                <div className="text-blue-200 text-sm">
                  ✨ Free to use • No credit card required • Start today
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact & Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Have questions or feedback? We'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <a
                href="mailto:fitexplorer.fitnessapp@gmail.com"
                className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 py-3 px-6 rounded-lg text-gray-800 dark:text-gray-200 font-medium transition-all flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Contact Support: fitexplorer.fitnessapp@gmail.com
              </a>
              <Link
                to="/faq"
                className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 py-3 px-6 rounded-lg text-gray-800 dark:text-gray-200 font-medium transition-all flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                FAQ
              </Link>
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              <p>© {new Date().getFullYear()} FitExplorer. All rights reserved.</p>
              <div className="flex justify-center gap-4 mt-2">
                <Link to="/privacy-policy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</Link>
                <span>•</span>
                <Link to="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">Terms of Service</Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default About;
