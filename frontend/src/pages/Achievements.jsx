import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import {
  FaTrophy,
  FaDumbbell,
  FaFire,
  FaCrown,
  FaArrowLeft,
} from "react-icons/fa";

const backendURL = "http://localhost:8000";

function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${backendURL}/achievements`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        throw new Error("Failed to fetch achievements");
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

  const getIcon = (iconName) => {
    switch (iconName) {
      case "FaDumbbell":
        return <FaDumbbell className="w-6 h-6" />;
      case "FaFire":
        return <FaFire className="w-6 h-6" />;
      case "FaCrown":
        return <FaCrown className="w-6 h-6" />;
      default:
        return <FaTrophy className="w-6 h-6" />;
    }
  };

  const filteredAchievements = selectedCategory === "all"
    ? achievements
    : achievements.filter(achievement => achievement.category === selectedCategory);

  const categories = ["all", "workout", "streak"];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl mb-4">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"} ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-500 hover:text-blue-600"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold flex items-center">
            <FaTrophy className="mr-2 text-yellow-500" />
            Achievements
          </h1>
          <button
            onClick={checkAchievements}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Check Progress
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex space-x-4 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded ${
                selectedCategory === category
                  ? "bg-blue-500 text-white"
                  : theme === "dark"
                  ? "bg-gray-800 text-gray-300"
                  : "bg-white text-gray-700"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              } rounded-lg shadow-lg p-6 ${
                achievement.is_achieved ? "border-2 border-yellow-500" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="text-yellow-500 mr-3">
                    {getIcon(achievement.icon)}
                  </div>
                  <h3 className="text-xl font-semibold">{achievement.name}</h3>
                </div>
                {achievement.is_achieved && (
                  <span className="text-green-500">Achieved!</span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {achievement.description}
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                <div
                  className="bg-blue-500 h-2.5 rounded-full"
                  style={{
                    width: `${(achievement.progress / achievement.requirement) * 100}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Progress: {achievement.progress}/{achievement.requirement}</span>
                {achievement.achieved_at && (
                  <span>
                    Achieved: {new Date(achievement.achieved_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Achievements; 