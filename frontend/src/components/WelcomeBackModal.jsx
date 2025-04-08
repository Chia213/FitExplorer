import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSave,
  FaListAlt,
  FaAtlas,
  FaRunning,
  FaTimes,
  FaHistory,
} from "react-icons/fa";
import { LuBicepsFlexed } from "react-icons/lu";
import { getSavedPrograms } from "../api/savedProgramsApi";

// This will be the welcome-back modal component that shows after login
const WelcomeBackModal = ({ username, onClose, isFirstLogin }) => {
  const [savedPrograms, setSavedPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedPrograms = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const programs = await getSavedPrograms(token);
        setSavedPrograms(programs);
      } catch (err) {
        console.error("Error fetching saved programs:", err);
        setError("Unable to load your saved programs");
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPrograms();
  }, []);

  const navigateTo = (path, params) => {
    if (params) {
      navigate(path, { state: params });
    } else {
      navigate(path);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="relative p-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
              {isFirstLogin
                ? "Welcome to FitExplorer!"
                : `Welcome back, ${username}!`}
            </h2>
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FaTimes size={24} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {isFirstLogin ? (
              <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
                Let's start your fitness journey! What would you like to do
                first?
              </p>
            ) : (
              <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
                Pick up where you left off or start something new
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Recently used options will come first for returning users */}
              {!isFirstLogin && savedPrograms.length > 0 && (
                <div className="col-span-2">
                  <button
                    onClick={() => navigateTo("/program-tracker", { programId: savedPrograms[0]?.id })}
                    className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition shadow-md hover:shadow-lg flex flex-col items-center justify-center"
                  >
                    <FaSave size={24} className="mb-2" />
                    <span className="font-semibold text-center">
                      Continue Your Latest Program
                    </span>
                    <span className="text-xs mt-1 text-blue-100">
                      {savedPrograms[0]?.name || "Saved Program"}
                    </span>
                  </button>
                </div>
              )}

              <button
                onClick={() => navigateTo("/ai-workout-generator")}
                className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition shadow-md hover:shadow-lg flex flex-col items-center justify-center"
              >
                <LuBicepsFlexed size={24} className="mb-2" />
                <span className="font-semibold text-center">
                  Generate AI Workout
                </span>
              </button>

              <button
                onClick={() => navigateTo("/explore-muscle-guide")}
                className="p-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg transition shadow-md hover:shadow-lg flex flex-col items-center justify-center"
              >
                <FaAtlas size={24} className="mb-2" />
                <span className="font-semibold text-center">Muscle Guide</span>
              </button>

              <button
                onClick={() => navigateTo("/workout-log")}
                className="p-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-lg transition shadow-md hover:shadow-lg flex flex-col items-center justify-center"
              >
                <FaListAlt size={24} className="mb-2" />
                <span className="font-semibold text-center">Workout Log</span>
              </button>

              <button
                onClick={() => navigateTo("/workout-history")}
                className="p-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg transition shadow-md hover:shadow-lg flex flex-col items-center justify-center"
              >
                <FaHistory size={24} className="mb-2" />
                <span className="font-semibold text-center">
                  Workout History
                </span>
              </button>
            </div>
          </div>

          {/* Footer with "don't show again" option for returning users */}
          {!isFirstLogin && (
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 text-center">
              <label className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400">
                <input
                  type="checkbox"
                  className="mr-2"
                  onChange={(e) => {
                    if (e.target.checked) {
                      localStorage.setItem("hideWelcomeBack", "true");
                    } else {
                      localStorage.removeItem("hideWelcomeBack");
                    }
                  }}
                />
                Don't show this again
              </label>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WelcomeBackModal;
