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
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-green-500 text-white py-24">
        <div 
          className="absolute inset-0 bg-black/10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="container mx-auto text-center relative z-10 px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 inline-block shadow-2xl"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              Empower Your Fitness Journey
            </h1>
            <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-8 text-blue-50">
              Transform your health, build strength, and unlock your potential
              with FitExplorer
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Link
                to="/signup"
                className="bg-white text-blue-600 hover:bg-blue-50 py-4 px-8 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Start Your Journey
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 w-full -mt-16">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-6xl mx-auto w-full backdrop-blur-lg"
        >
          <motion.div 
            variants={cardVariants}
            className="mb-16"
          >
            <h2 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-500">
              About FitExplorer
            </h2>
            <div className="text-center">
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 max-w-3xl mx-auto">
                FitExplorer is a comprehensive fitness platform designed to help
                you achieve your health and fitness goals. Whether you're a
                beginner looking to start your fitness journey or an experienced
                athlete tracking your progress, FitExplorer provides all the
                tools you need in one place.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                Our mission is to make fitness accessible, educational, and
                enjoyable for everyone by providing science-backed guidance,
                interactive tools, and progress tracking that keeps you
                motivated.
              </p>
            </div>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            className="grid md:grid-cols-2 gap-8"
          >
            <motion.div variants={cardVariants}>
              <Link to="/" className="block hover:no-underline">
                <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:bg-gray-700 p-8 rounded-xl hover:scale-105 hover:shadow-xl transition-all duration-300 ease-in-out h-full border border-green-100 dark:border-gray-600">
                  <div className="flex items-center mb-3">
                    <FaRandom
                      className="text-green-500 dark:text-green-400 mr-3"
                      size={24}
                    />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Workout Generator
                    </h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Don't know where to start? Use our generator to customize
                    workout routines based on your fitness level, available
                    equipment, time constraints, and personal goals. Each
                    workout comes with detailed exercise instructions and visual
                    guides.
                  </p>
                </div>
              </Link>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Link
                to="/explore-muscle-guide"
                className="block hover:no-underline"
              >
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:bg-gray-700 p-8 rounded-xl hover:scale-105 hover:shadow-xl transition-all duration-300 ease-in-out h-full border border-blue-100 dark:border-gray-600">
                  <div className="flex items-center mb-3">
                    <FaDumbbell
                      className="text-blue-500 dark:text-blue-400 mr-3"
                      size={24}
                    />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Interactive Muscle Guide
                    </h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Explore muscle groups and learn proper exercise techniques
                    with our interactive anatomy guide. Click on specific muscle
                    groups to view targeted exercises with detailed instructions
                    and visual demonstrations.
                  </p>
                </div>
              </Link>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Link to="/workout-log" className="block hover:no-underline">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:bg-gray-700 p-8 rounded-xl hover:scale-105 hover:shadow-xl transition-all duration-300 ease-in-out h-full border border-purple-100 dark:border-gray-600">
                  <div className="flex items-center mb-3">
                    <FaBook
                      className="text-purple-500 dark:text-purple-400 mr-3"
                      size={24}
                    />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Workout Logging
                    </h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Do you wanna do your own workouts? Keep in track with your
                    fitness journey our comprehensive workout tracking system.
                    Log your exercises, sets, reps, weights, and personal notes
                    for each session. Review your complete workout history to
                    see your progress over time, and save favorite workouts as
                    reusable routines to streamline your training. Whether
                    you're just starting out or looking to optimize your
                    regimen, our tools help you train smarter and reach your
                    fitness goals faster.
                  </p>
                </div>
              </Link>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Link to="/progress-tracker" className="block hover:no-underline">
                <div className="bg-gradient-to-br from-pink-50 to-indigo-50 dark:bg-gray-700 p-8 rounded-xl hover:scale-105 hover:shadow-xl transition-all duration-300 ease-in-out h-full border border-pink-100 dark:border-gray-600">
                  <div className="flex items-center mb-3">
                    <FaChartLine
                      className="text-indigo-500 dark:text-indigo-400 mr-3"
                      size={24}
                    />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Progress Tracking
                    </h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Visualize your fitness journey with comprehensive progress
                    tracking. Monitor your strength gains, exercise consistency,
                    personal records, and body measurements over time with
                    easy-to-understand charts and metrics that keep you
                    motivated.
                  </p>
                </div>
              </Link>
            </motion.div>

            <motion.div variants={cardVariants}>
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:bg-gray-700 p-8 rounded-xl hover:scale-105 hover:shadow-xl transition-all duration-300 ease-in-out h-full border border-indigo-100 dark:border-gray-600">
                <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 font-bold text-sm rounded-md">
                  Coming Soon
                </div>
                <div className="flex items-center mb-3">
                  <FaRobot
                    className="text-purple-500 dark:text-purple-400 mr-3"
                    size={24}
                  />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    AI Workout Generator
                  </h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  Our advanced AI system will analyze your fitness history,
                  goals, and preferences to create hyper-personalized workout
                  programs. Get custom progression plans, intelligent exercise
                  selection, and automatic adjustments based on your
                  performance.
                </p>
              </div>
            </motion.div>

            <motion.div variants={cardVariants}>
              <div className="bg-gradient-to-br from-purple-50 to-orange-50 dark:bg-gray-700 p-8 rounded-xl hover:scale-105 hover:shadow-xl transition-all duration-300 ease-in-out h-full border border-purple-100 dark:border-gray-600">
                <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 font-bold text-sm rounded-bl-lg">
                  Coming Soon
                </div>
                <div className="flex items-center mb-3">
                  <FaBell
                    className="text-orange-500 dark:text-orange-400 mr-3"
                    size={24}
                  />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Email Notifications
                  </h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  Stay motivated with personalized email summaries of your
                  fitness progress. Choose between weekly and monthly frequency
                  options to receive tailored reports highlighting your
                  achievements, workout consistency, and personalized tips to
                  help you reach your fitness goals.
                </p>
              </div>
            </motion.div>

            <motion.div variants={cardVariants}>
              <div className="bg-gradient-to-br from-orange-50 to-rose-50 dark:bg-gray-700 p-8 rounded-xl hover:scale-105 hover:shadow-xl transition-all duration-300 ease-in-out h-full border border-orange-100 dark:border-gray-600">
                <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 font-bold text-sm rounded-bl-lg">
                  Coming Soon
                </div>
                <div className="flex items-center mb-3">
                  <FaUtensils
                    className="text-rose-500 dark:text-rose-400 mr-3"
                    size={24}
                  />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Nutrition
                  </h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  Track your nutrition and dietary habits alongside your
                  workouts. Calculate macros, log meals, and receive
                  personalized nutrition tips to complement your fitness goals
                  and optimize your results.
                </p>
              </div>
            </motion.div>
          </motion.div>

          <div className="bg-gray-100 dark:bg-gray-800 py-12 mb-12 rounded-lg">
            <div className="container mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                What Our Users Say
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    quote:
                      "FitExplorer transformed my fitness journey. The personalized workouts are game-changing!",
                    name: "Sarah M.",
                    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
                  },
                  {
                    quote:
                      "The muscle guide helped me understand proper form like never before.",
                    name: "Mike T.",
                    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
                  },
                  {
                    quote:
                      "Tracking my progress has never been easier. Highly recommended!",
                    name: "Emma K.",
                    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
                  },
                ].map(({ quote, name, avatar }) => (
                  <div
                    key={name}
                    className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <p className="italic mb-4 text-gray-700 dark:text-gray-300">
                      "{quote}"
                    </p>
                    <div className="flex items-center">
                      <img
                        src={avatar}
                        alt={name}
                        className="w-12 h-12 rounded-full mr-4 object-cover"
                      />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg mb-12">
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white text-center">
              Our Approach
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex items-start">
                <div className="bg-white dark:bg-gray-600 p-3 rounded-full mr-4 mt-1">
                  <FaUserFriends
                    className="text-blue-500 dark:text-blue-400"
                    size={24}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    User-Centered Design
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    We prioritize intuitive interfaces and personalized
                    experiences to make fitness tracking and learning as
                    seamless as possible.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-white dark:bg-gray-600 p-3 rounded-full mr-4 mt-1">
                  <FaShieldAlt
                    className="text-green-500 dark:text-green-400"
                    size={24}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Evidence-Based Guidance
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    All exercise recommendations and workout plans are based on
                    scientific principles and best practices in fitness and
                    exercise physiology.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 py-12 rounded-lg mb-12">
            <div className="container mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                Our Policies
              </h2>
              <div className="max-w-3xl mx-auto text-left px-4">
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  Privacy Commitment
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We take your privacy seriously. Your personal data is securely
                  stored and never shared with third parties without your
                  explicit consent. We only collect information necessary to
                  provide you with a personalized fitness experience.
                </p>

                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  Data Usage
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Your workout data is used solely to help you track progress
                  and provide personalized recommendations. All information is
                  encrypted and protected using industry-standard security
                  measures.
                </p>

                <div className="text-center mt-6">
                  <Link
                    to="/privacy"
                    className="text-blue-500 hover:text-blue-700 underline"
                  >
                    View Full Privacy Policy
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 text-center text-gray-600 dark:text-gray-400">
            <p>
              © {new Date().getFullYear()} FitExplorer. All rights reserved.
            </p>
            <p className="mt-2">For support or inquiries, contact us at: </p>
            <div className="flex flex-col sm:flex-row justify-center gap-2 mt-1">
              <a
                href="mailto:chiranchber@gmail.com"
                className="text-blue-500 hover:underline"
              >
                chiranchber@gmail.com
              </a>
              <span className="hidden sm:inline">or</span>
              <a
                href="mailto:ivan98lee@gmail.com"
                className="text-blue-500 hover:underline"
              >
                ivan98lee@gmail.com
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default About;
