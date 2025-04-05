import React, { useState, useEffect } from 'react';
import {
  FaTrophy,
  FaDumbbell,
  FaFire,
  FaStar,
  FaMedal,
  FaCrown,
  FaBolt,
  FaStopwatch,
  FaCalendarCheck,
  FaChartLine
} from 'react-icons/fa';

const iconMap = {
  FaTrophy,
  FaDumbbell,
  FaFire,
  FaStar,
  FaMedal,
  FaCrown,
  FaBolt,
  FaStopwatch,
  FaCalendarCheck,
  FaChartLine
};

const AchievementsSection = ({ backendURL }) => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendURL}/achievements`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch achievements');
      }

      const data = await response.json();
      setAchievements(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkAchievements = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendURL}/achievements/check`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchAchievements(); // Refresh achievements after checking
      }
    } catch (err) {
      console.error("Error checking achievements:", err);
    }
  };

  const categories = ['all', ...new Set(achievements.map(a => a.category))];

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === selectedCategory);

  const renderProgress = (achievement) => {
    const percentage = Math.min((achievement.progress / achievement.requirement) * 100, 100);
    
    return (
      <div className="mt-2">
        <div className="flex justify-between text-sm mb-1">
          <span>{achievement.progress} / {achievement.requirement}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className={`h-2.5 rounded-full ${
              achievement.is_achieved ? 'bg-green-600' : 'bg-blue-600'
            }`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-4">Loading achievements...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FaTrophy className="text-yellow-500" />
          Achievements
        </h2>
        <button
          onClick={checkAchievements}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Check Progress
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full capitalize whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map(achievement => {
          const Icon = iconMap[achievement.icon] || FaTrophy;
          return (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border ${
                achievement.is_achieved
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${
                  achievement.is_achieved
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{achievement.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {achievement.description}
                  </p>
                  {renderProgress(achievement)}
                  {achievement.achieved_at && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                      Achieved on {new Date(achievement.achieved_at).toLocaleDateString('en-GB')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsSection; 