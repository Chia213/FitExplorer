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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="relative bg-gradient-to-r from-blue-500 to-green-500 text-white py-16 mb-12">
        <div className="container mx-auto text-center relative z-10">
          <div className="bg-black/20 rounded-xl p-8 inline-block">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Empower Your Fitness Journey
            </h1>
            <p className="text-xl max-w-2xl mx-auto">
              Transform your health, build strength, and unlock your potential
              with FitExplorer
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white text-center">
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
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white text-center">
              Choose a guide
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: FaRandom,
                  color: "green",
                  title: "Workout Generator",
                  description:
                    "Don't know where to start? Use our generator to customize workout routines based on your fitness level, available equipment, time constraints, and personal goals. Each workout comes with detailed exercise instructions and visual guides.",
                },
                {
                  icon: FaDumbbell,
                  color: "blue",
                  title: "Interactive Muscle Guide",
                  description:
                    "Explore muscle groups and learn proper exercise techniques with our interactive anatomy guide. Click on specific muscle groups to view targeted exercises with detailed instructions and visual demonstrations.",
                },
                {
                  icon: FaBook,
                  color: "purple",
                  title: "Workout Logging",
                  description:
                    "Keep track of your workouts with our easy-to-use logging system. Record exercises, sets, reps, weights, and notes to maintain a detailed history of your fitness journey.",
                },
                {
                  icon: FaChartLine,
                  color: "orange",
                  title: "Progress Tracking",
                  description:
                    "Visualize your fitness progress over time with comprehensive charts and statistics. Monitor strength gains, workout frequency, and other key metrics to stay motivated.",
                },
              ].map(({ icon: Icon, color, title, description }) => (
                <div
                  key={title}
                  className={`bg-${color}-50 dark:bg-gray-700 p-6 rounded-lg hover:scale-105 hover:shadow-xl transition-all duration-300 ease-in-out`}
                >
                  <div className="flex items-center mb-3">
                    <Icon
                      className={`text-${color}-500 dark:text-${color}-400 mr-3`}
                      size={24}
                    />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {title}
                    </h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>

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
              <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                Powered By Cutting-Edge Technology
              </h2>
              <div className="flex flex-wrap justify-center items-center gap-8">
                {[
                  {
                    name: "React",
                    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
                  },
                  {
                    name: "FastAPI",
                    logo: "https://fastapi.tiangolo.com/img/logo-margin/logo-teal.png",
                  },
                  {
                    name: "Tailwind",
                    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg",
                  },
                  {
                    name: "PostgreSQL",
                    logo: "https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg",
                  },
                ].map(({ name, logo }) => (
                  <div key={name} className="flex flex-col items-center">
                    <img
                      src={logo}
                      alt={name}
                      className="w-16 h-16 mb-2 grayscale hover:grayscale-0 transition-all duration-300"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center bg-blue-50 dark:bg-gray-800 p-12 rounded-lg mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Your Fitness Transformation Starts Now
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of users who have transformed their fitness with
              personalized, science-backed workout plans and tracking.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Start Your Journey
              </Link>
              <Link
                to="/explore-muscle-guide"
                className="bg-green-600 hover:bg-green-700 text-white py-4 px-8 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Explore Muscles
              </Link>
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
        </div>
      </div>
    </div>
  );
}

export default About;
