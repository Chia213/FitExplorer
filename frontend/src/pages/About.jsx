import React from "react";
import { Link } from "react-router-dom";
import {
  FaDumbbell,
  FaChartLine,
  FaBook,
  FaRandom,
  FaUserFriends,
  FaShieldAlt,
} from "react-icons/fa";

function About() {
  return (
    <div className="min-h-screen flex flex-col items-center p-6 py-12">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-4xl w-full">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white text-center">
          About FitExplorer
        </h1>

        <div className="mb-8">
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            FitExplorer is a comprehensive fitness platform designed to help you
            achieve your health and fitness goals. Whether you're a beginner
            looking to start your fitness journey or an experienced athlete
            tracking your progress, FitExplorer provides all the tools you need
            in one place.
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Our mission is to make fitness accessible, educational, and
            enjoyable for everyone by providing science-backed guidance,
            interactive tools, and progress tracking that keeps you motivated.
          </p>
        </div>

        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Key Features
        </h2>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 dark:bg-gray-700 p-6 rounded-lg">
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
              Explore muscle groups and learn proper exercise techniques with
              our interactive anatomy guide. Click on specific muscle groups to
              view targeted exercises with detailed instructions and visual
              demonstrations.
            </p>
          </div>

          <div className="bg-green-50 dark:bg-gray-700 p-6 rounded-lg">
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
              Generate customized workout routines based on your fitness level,
              available equipment, time constraints, and personal goals. Each
              workout comes with detailed exercise instructions and visual
              guides.
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-gray-700 p-6 rounded-lg">
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
              Keep track of your workouts with our easy-to-use logging system.
              Record exercises, sets, reps, weights, and notes to maintain a
              detailed history of your fitness journey.
            </p>
          </div>

          <div className="bg-orange-50 dark:bg-gray-700 p-6 rounded-lg">
            <div className="flex items-center mb-3">
              <FaChartLine
                className="text-orange-500 dark:text-orange-400 mr-3"
                size={24}
              />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Progress Tracking
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              Visualize your fitness progress over time with comprehensive
              charts and statistics. Monitor strength gains, workout frequency,
              and other key metrics to stay motivated.
            </p>
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Our Approach
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-white dark:bg-gray-600 p-2 rounded-full mr-4 mt-1">
                <FaUserFriends
                  className="text-blue-500 dark:text-blue-400"
                  size={20}
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  User-Centered Design
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We prioritize intuitive interfaces and personalized
                  experiences to make fitness tracking and learning as seamless
                  as possible.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-white dark:bg-gray-600 p-2 rounded-full mr-4 mt-1">
                <FaShieldAlt
                  className="text-green-500 dark:text-green-400"
                  size={20}
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
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

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Start Your Fitness Journey Today
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            Whether you're looking to build muscle, lose weight, or improve your
            overall fitness, FitExplorer provides the tools and knowledge you
            need to succeed.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/"
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors"
            >
              Explore Muscles
            </Link>
            <Link
              to="/workout-generator"
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition-colors"
            >
              Generate Workout
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} FitExplorer. All rights reserved.</p>
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
      </div>
    </div>
  );
}

export default About;
