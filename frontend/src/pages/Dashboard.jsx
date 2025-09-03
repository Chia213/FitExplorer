import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaDumbbell,
  FaChartLine,
  FaUtensils,
  FaTrophy,
  FaPlus,
  FaHistory,
  FaCog,
  FaUser,
  FaFire,
  FaClock,
  FaBullseye,
  FaHeart,
  FaWeight,
  FaRuler,
  FaCalendarAlt,
  FaPlay,
  FaBookmark,
  FaBrain,
  FaCalculator,
  FaRunning,
  FaBolt,
  FaMedal,
  FaArrowUp,
  FaArrowDown,
  FaChartBar,
  FaStar,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/Card';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [dashboardData, setDashboardData] = useState({
    recentWorkouts: [],
    userStats: {},
    achievements: [],
    isLoading: true
  });

  // Quick action cards with fitness-focused design
  const quickActions = [
    {
      title: "Start Workout",
      description: "Begin your fitness journey",
      icon: FaPlay,
      link: "/workout-log",
      gradient: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      pulse: true,
      badge: "HOT"
    },
    {
      title: "AI Workout Generator",
      description: "Personalized workouts powered by AI",
      icon: FaBrain,
      link: "/ai-workout-generator",
      gradient: "from-purple-500 to-indigo-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
      badge: "NEW"
    },
    {
      title: "Track Nutrition",
      description: "Monitor your daily nutrition",
      icon: FaUtensils,
      link: "/nutrition",
      gradient: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      iconColor: "text-orange-600 dark:text-orange-400"
    },
    {
      title: "View Progress",
      description: "Track your fitness journey",
      icon: FaChartLine,
      link: "/progress-tracker",
      gradient: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400"
    }
  ];

  // Feature cards
  const features = [
    {
      title: "Workout History",
      description: "View your past workouts and track improvements",
      icon: FaHistory,
      link: "/workout-history",
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Routines",
      description: "Create and manage your workout routines",
      icon: FaBookmark,
      link: "/routines",
      color: "text-green-600 dark:text-green-400"
    },
    {
      title: "Achievements",
      description: "Track your fitness milestones and badges",
      icon: FaTrophy,
      link: "/achievements",
      color: "text-yellow-600 dark:text-yellow-400"
    },
    {
      title: "Fitness Calculator",
      description: "Calculate BMI, body fat, and more",
      icon: FaCalculator,
      link: "/fitness-calculator",
      color: "text-purple-600 dark:text-purple-400"
    }
  ];

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated) return;
      
      try {
        const token = localStorage.getItem('access_token');
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Fetch recent workouts
        const workoutsResponse = await fetch(`${API_URL}/workouts/recent?limit=3`, { headers });
        const recentWorkouts = workoutsResponse.ok ? await workoutsResponse.json() : [];

        // Fetch user stats (you might need to create this endpoint)
        const statsResponse = await fetch(`${API_URL}/users/stats`, { headers });
        const userStats = statsResponse.ok ? await statsResponse.json() : {};

        setDashboardData({
          recentWorkouts,
          userStats,
          achievements: [], // You can fetch this from your achievements endpoint
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardData(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchDashboardData();
  }, [isAuthenticated]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading || dashboardData.isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Header with Fitness Theme */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 dark:from-emerald-700 dark:via-blue-700 dark:to-purple-700"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-16 h-16 bg-white/5 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl sm:text-4xl font-bold mb-2"
              >
                {getGreeting()}, {user?.username || 'Champion'}! 💪
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-white/90 mb-4"
              >
                Ready to transform your fitness journey today?
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center space-x-4"
              >
                <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
                  <FaFire className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm font-medium">Streak: {dashboardData.userStats.currentStreak || 0} days</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
                  <FaTrophy className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm font-medium">Level: {Math.floor((dashboardData.userStats.totalWorkouts || 0) / 10) + 1}</span>
                </div>
              </motion.div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/profile"
                className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-200 backdrop-blur-sm"
              >
                <FaUser className="w-6 h-6 text-white" />
              </Link>
              <Link
                to="/settings"
                className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-200 backdrop-blur-sm"
              >
                <FaCog className="w-6 h-6 text-white" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Quick Actions - Enhanced Design */}
          <motion.div variants={fadeInUp}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Quick Actions
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <FaBolt className="w-4 h-4 text-yellow-500" />
                <span>Power up your fitness</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <Link to={action.link}>
                    <Card className={`p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer group border-0 ${action.bgColor} relative overflow-hidden`}>
                      {/* Badge */}
                      {action.badge && (
                        <div className="absolute top-3 right-3">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                            action.badge === 'HOT' ? 'bg-red-500 text-white' : 
                            action.badge === 'NEW' ? 'bg-blue-500 text-white' : 
                            'bg-gray-500 text-white'
                          }`}>
                            {action.badge}
                          </span>
                        </div>
                      )}
                      
                      {/* Pulse animation for hot items */}
                      {action.pulse && (
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-lg animate-pulse"></div>
                      )}
                      
                      <div className="relative z-10">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className={`p-4 rounded-2xl bg-gradient-to-r ${action.gradient} text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                            <action.icon className="w-7 h-7" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                              {action.title}
                            </h3>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {action.description}
                        </p>
                        <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                          <span>Get Started</span>
                          <FaArrowUp className="w-3 h-3 ml-2 transform rotate-45 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Enhanced Stats Overview */}
          <motion.div variants={fadeInUp}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Your Fitness Journey
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <FaChartBar className="w-4 h-4 text-green-500" />
                <span>Keep pushing forward!</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative"
              >
                <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {dashboardData.userStats.totalWorkouts || 0}
                      </p>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Total Workouts
                      </p>
                      <div className="flex items-center mt-2">
                        <FaArrowUp className="w-3 h-3 text-green-500 mr-1" />
                        <span className="text-xs text-green-600 dark:text-green-400">+2 this week</span>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl shadow-lg">
                      <FaFire className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative"
              >
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {Math.floor((dashboardData.userStats.totalMinutes || 0) / 60)}h
                      </p>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Hours Trained
                      </p>
                      <div className="flex items-center mt-2">
                        <FaClock className="w-3 h-3 text-blue-500 mr-1" />
                        <span className="text-xs text-blue-600 dark:text-blue-400">45min today</span>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                      <FaClock className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative"
              >
                <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {dashboardData.userStats.currentStreak || 0}
                      </p>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Day Streak
                      </p>
                      <div className="flex items-center mt-2">
                        <FaBullseye className="w-3 h-3 text-green-500 mr-1" />
                        <span className="text-xs text-green-600 dark:text-green-400">Keep it up!</span>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                      <FaBullseye className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative"
              >
                <Card className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {dashboardData.achievements.length || 0}
                      </p>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Achievements
                      </p>
                      <div className="flex items-center mt-2">
                        <FaMedal className="w-3 h-3 text-yellow-500 mr-1" />
                        <span className="text-xs text-yellow-600 dark:text-yellow-400">2 new badges!</span>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-2xl shadow-lg">
                      <FaTrophy className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </motion.div>

          {/* Recent Workouts */}
          {dashboardData.recentWorkouts.length > 0 && (
            <motion.div variants={fadeInUp}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Recent Workouts
                </h2>
                <Link
                  to="/workout-history"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {dashboardData.recentWorkouts.map((workout, index) => (
                  <Card key={workout.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <FaDumbbell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {workout.name || 'Workout'}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(workout.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {workout.duration || 'N/A'} min
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {workout.sets?.length || 0} sets
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Features Grid */}
          <motion.div variants={fadeInUp}>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Explore Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link to={feature.link}>
                    <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group">
                      <div className="text-center">
                        <div className="flex justify-center mb-4">
                          <feature.icon className={`w-8 h-8 ${feature.color} group-hover:scale-110 transition-transform duration-200`} />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {feature.description}
                        </p>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Motivational Section */}
          <motion.div variants={fadeInUp}>
            <Card className="p-8 text-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white relative overflow-hidden">
              {/* Animated background */}
              <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20"></div>
                <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
                <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/5 rounded-full animate-bounce delay-1000"></div>
              </div>
              
              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  className="mb-6"
                >
                  <FaDumbbell className="w-16 h-16 mx-auto text-white/80" />
                </motion.div>
                
                <blockquote className="text-2xl font-bold mb-4">
                  "The only bad workout is the one that didn't happen."
                </blockquote>
                <p className="text-lg text-white/90 mb-6">
                  Every rep counts. Every step matters. You've got this! 🚀
                </p>
                
                <div className="flex justify-center space-x-4">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Link
                      to="/workout-log"
                      className="bg-white text-indigo-600 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                    >
                      Start Workout Now
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Link
                      to="/ai-workout-generator"
                      className="bg-white/20 text-white px-6 py-3 rounded-full font-bold hover:bg-white/30 transition-colors duration-200 backdrop-blur-sm"
                    >
                      Generate AI Workout
                    </Link>
                  </motion.div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Daily Challenge */}
          <motion.div variants={fadeInUp}>
            <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl">
                    <FaStar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                      Daily Challenge
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Complete 20 push-ups to earn 50 points!
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-16 relative">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="2"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeDasharray="75, 100"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-green-600 dark:text-green-400">75%</span>
                    </div>
                  </div>
                  <button className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors">
                    Complete
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
