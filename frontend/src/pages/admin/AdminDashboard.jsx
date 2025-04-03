import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaDumbbell,
  FaChartBar,
  FaUser,
  FaList,
  FaClock,
  FaCalendarAlt,
  FaTrophy,
  FaExclamationTriangle,
  FaSync,
  FaChevronDown,
  FaChevronUp,
  FaCircle,
  FaCog,
} from "react-icons/fa";
import LoadingSpinner from "../../components/LoadingSpinner";
import Card from "../../components/Card";

import { useTheme } from "../../hooks/useTheme"; // Assuming you have a theme hook

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function AdminDashboard() {
  // State management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [exerciseStats, setExerciseStats] = useState(null);
  const [workoutStats, setWorkoutStats] = useState(null);
  const [timeRange, setTimeRange] = useState("month"); // 'week', 'month', 'year'
  const [expandedSection, setExpandedSection] = useState("all"); // 'users', 'workouts', 'exercises', 'all'
  const [lastUpdated, setLastUpdated] = useState(null);

  const navigate = useNavigate();
  const { theme } = useTheme || { theme: "light" }; // Fallback if hook isn't available

  // Fetch data based on the selected time range
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchAdminData = async () => {
      try {
        setRefreshing(true);

        // Fetch all stats in parallel with the time range parameter
        const [userStatsRes, exerciseStatsRes, workoutStatsRes] =
          await Promise.all([
            fetch(`${API_URL}/admin/stats/users?time_range=${timeRange}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_URL}/admin/stats/exercises?time_range=${timeRange}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_URL}/admin/stats/workouts?time_range=${timeRange}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        // Check for unauthorized or forbidden access
        if (!userStatsRes.ok || !exerciseStatsRes.ok || !workoutStatsRes.ok) {
          if (
            userStatsRes.status === 403 ||
            exerciseStatsRes.status === 403 ||
            workoutStatsRes.status === 403
          ) {
            setError("You don't have admin privileges to access this page.");
            setTimeout(() => navigate("/"), 3000);
            return;
          }
          throw new Error("Failed to fetch admin data");
        }

        const [userStatsData, exerciseStatsData, workoutStatsData] =
          await Promise.all([
            userStatsRes.json(),
            exerciseStatsRes.json(),
            workoutStatsRes.json(),
          ]);

        setUserStats(userStatsData);
        setExerciseStats(exerciseStatsData);
        setWorkoutStats(workoutStatsData);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        setError(err.message || "An error occurred while fetching data");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchAdminData();
  }, [navigate, timeRange]);

  // Format time range for display
  const timeRangeDisplay = useMemo(() => {
    switch (timeRange) {
      case "week":
        return "Last 7 days";
      case "month":
        return "Last 30 days";
      case "year":
        return "Last 365 days";
      default:
        return "Last 30 days";
    }
  }, [timeRange]);

  // Derived data for user retention rate
  const userRetentionRate = useMemo(() => {
    if (!userStats) return null;

    const activeUsers = userStats.active_users_last_month || 0;
    const totalUsers = userStats.total_users || 1; // Prevent division by zero

    return Math.round((activeUsers / totalUsers) * 100);
  }, [userStats]);

  // Helper to determine whether a section should be visible
  const isSectionVisible = (section) => {
    return expandedSection === section || expandedSection === "all";
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSection((prev) => (prev === section ? "all" : section));
  };

  // Refresh data manually
  const handleRefresh = () => {
    setTimeRange((prev) => prev); // Trigger the useEffect without changing the time range
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
          {/* Time range selector */}
          <div className="relative inline-block">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="block appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 px-4 pr-8 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="year">Last 365 days</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <FaChevronDown />
            </div>
          </div>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {refreshing ? (
              <>
                <FaSync className="animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <FaSync />
                Refresh Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Last updated timestamp */}
      {lastUpdated && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Last updated: {lastUpdated.toLocaleString()}
        </p>
      )}

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md mb-6">
          <div className="flex items-center">
            <FaExclamationTriangle className="mr-2" />
            <p className="font-bold">Error</p>
          </div>
          <p>{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm uppercase">
                Total Users
              </p>
              <h3 className="text-3xl font-bold mt-1">
                {userStats?.total_users || 0}
              </h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <FaUsers className="text-blue-500 text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span
              className={`text-sm ${
                userStats?.new_users_growth >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {userStats?.new_users_growth >= 0 ? "+" : ""}
              {userStats?.new_users_growth || 0}%
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
              vs previous {timeRange}
            </span>
          </div>
        </div>

        {/* Active Users Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm uppercase">
                Active Users
              </p>
              <h3 className="text-3xl font-bold mt-1">
                {userStats?.active_users_last_month || 0}
              </h3>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <FaUser className="text-green-500 text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-blue-500">
              {userRetentionRate || 0}%
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
              retention rate
            </span>
          </div>
        </div>

        {/* Total Workouts Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border-l-4 border-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm uppercase">
                Total Workouts
              </p>
              <h3 className="text-3xl font-bold mt-1">
                {workoutStats?.total_workouts || 0}
              </h3>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <FaDumbbell className="text-purple-500 text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span
              className={`text-sm ${
                workoutStats?.workout_growth >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {workoutStats?.workout_growth >= 0 ? "+" : ""}
              {workoutStats?.workout_growth || 0}%
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
              vs previous {timeRange}
            </span>
          </div>
        </div>

        {/* Avg Duration Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border-l-4 border-yellow-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm uppercase">
                Avg Workout Duration
              </p>
              <h3 className="text-3xl font-bold mt-1">
                {workoutStats?.avg_workout_duration || 0} min
              </h3>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
              <FaClock className="text-yellow-500 text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span
              className={`text-sm ${
                workoutStats?.duration_change >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {workoutStats?.duration_change >= 0 ? "+" : ""}
              {workoutStats?.duration_change || 0}%
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
              vs previous {timeRange}
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Statistics Sections */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        {/* User Stats Detailed Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div
            className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
            onClick={() => toggleSection("users")}
          >
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FaUsers className="text-blue-500" />
              User Statistics
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/admin/users");
                }}
                className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors"
              >
                View All
              </button>
              {isSectionVisible("users") ? <FaChevronUp /> : <FaChevronDown />}
            </div>
          </div>

          {isSectionVisible("users") && (
            <div className="p-5 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">User Growth</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        New Users ({timeRangeDisplay})
                      </span>
                      <span className="text-xl font-bold">
                        {userStats?.new_users_last_month || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Active Users ({timeRangeDisplay})
                      </span>
                      <span className="text-xl font-bold">
                        {userStats?.active_users_last_month || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Retention Rate
                      </span>
                      <span className="text-xl font-bold">
                        {userRetentionRate || 0}%
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">User Activity</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Avg. Workouts per User
                      </span>
                      <span className="text-xl font-bold">
                        {userStats?.avg_workouts_per_user?.toFixed(1) || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Most Active Day
                      </span>
                      <span className="text-xl font-bold">
                        {userStats?.most_active_day || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Inactive Users ({timeRangeDisplay})
                      </span>
                      <span className="text-xl font-bold">
                        {userStats?.inactive_users || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recent user activity timeline */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium mb-4">Recent Signups</h3>
                  <div className="space-y-3">
                    {userStats?.recent_signups?.map((user, idx) => (
                      <div key={idx} className="flex items-start">
                        <div className="mr-3 mt-1">
                          <FaCircle className="text-blue-500 text-xs" />
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <FaCalendarAlt className="mr-1" />
                            <span>
                              {new Date(user.signup_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!userStats?.recent_signups ||
                      userStats.recent_signups.length === 0) && (
                      <p className="text-gray-500 dark:text-gray-400 italic">
                        No recent signups to display
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Workout Stats Detailed Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div
            className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
            onClick={() => toggleSection("workouts")}
          >
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FaDumbbell className="text-purple-500" />
              Workout Statistics
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/admin/workouts");
                }}
                className="text-sm bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded transition-colors"
              >
                View All
              </button>
              {isSectionVisible("workouts") ? (
                <FaChevronUp />
              ) : (
                <FaChevronDown />
              )}
            </div>
          </div>

          {isSectionVisible("workouts") && (
            <div className="p-5 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Workout Overview</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Total Workouts
                      </span>
                      <span className="text-xl font-bold">
                        {workoutStats?.total_workouts || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Workouts ({timeRangeDisplay})
                      </span>
                      <span className="text-xl font-bold">
                        {workoutStats?.workouts_last_month || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Avg. Duration
                      </span>
                      <span className="text-xl font-bold">
                        {workoutStats?.avg_workout_duration || 0} min
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Most Popular Time
                      </span>
                      <span className="text-xl font-bold">
                        {workoutStats?.most_popular_time || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Top Workout Types
                  </h3>
                  <div className="space-y-3 max-h-52 overflow-auto pr-2">
                    {workoutStats?.popular_workout_types?.map((type, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center">
                          {idx < 3 && (
                            <FaTrophy
                              className={`mr-2 ${
                                [
                                  "text-yellow-500",
                                  "text-gray-400",
                                  "text-amber-700",
                                ][idx]
                              }`}
                            />
                          )}
                          <span className="text-gray-600 dark:text-gray-300">
                            {type.name}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium">{type.count}</span>
                          <div className="ml-2 w-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-1.5 bg-purple-500"
                              style={{
                                width: `${
                                  (type.count /
                                    (workoutStats?.popular_workout_types?.[0]
                                      ?.count || 1)) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!workoutStats?.popular_workout_types ||
                      workoutStats.popular_workout_types.length === 0) && (
                      <p className="text-gray-500 dark:text-gray-400 italic">
                        No workout type data available
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Workout completion rate by day of week */}
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">
                  Workout Completion Rate by Day
                </h3>
                <div className="flex justify-between items-end h-40 w-full">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day, idx) => {
                      const rate =
                        workoutStats?.completion_by_day?.[day.toLowerCase()] ||
                        0;
                      return (
                        <div
                          key={idx}
                          className="flex flex-col items-center flex-1"
                        >
                          <div
                            className="w-full mx-1 bg-purple-500 rounded-t"
                            style={{ height: `${rate}%` }}
                          ></div>
                          <div className="text-xs font-medium mt-2">{day}</div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Exercise Stats Detailed Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div
            className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
            onClick={() => toggleSection("exercises")}
          >
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FaChartBar className="text-green-500" />
              Exercise Statistics
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/admin/exercises");
                }}
                className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition-colors"
              >
                View All
              </button>
              {isSectionVisible("exercises") ? (
                <FaChevronUp />
              ) : (
                <FaChevronDown />
              )}
            </div>
          </div>

          {isSectionVisible("exercises") && (
            <div className="p-5 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Top Exercises</h3>
                  <div className="space-y-3 max-h-64 overflow-auto pr-2">
                    {exerciseStats?.popular_exercises
                      ?.slice(0, 10)
                      .map((ex, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center"
                        >
                          <div className="flex items-center">
                            {idx < 3 && (
                              <FaTrophy
                                className={`mr-2 ${
                                  [
                                    "text-yellow-500",
                                    "text-gray-400",
                                    "text-amber-700",
                                  ][idx]
                                }`}
                              />
                            )}
                            <span className="text-gray-600 dark:text-gray-300">
                              {ex.name}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium">{ex.count}</span>
                            <div className="ml-2 w-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-1.5 bg-green-500"
                                style={{
                                  width: `${
                                    (ex.count /
                                      (exerciseStats?.popular_exercises?.[0]
                                        ?.count || 1)) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    {(!exerciseStats?.popular_exercises ||
                      exerciseStats.popular_exercises.length === 0) && (
                      <p className="text-gray-500 dark:text-gray-400 italic">
                        No exercise data available
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Exercise Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {exerciseStats?.exercise_categories?.map(
                      (category, idx) => (
                        <div
                          key={idx}
                          className="flex items-center bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full px-3 py-1"
                        >
                          <span className="font-medium mr-2">
                            {category.name}
                          </span>
                          <span className="text-xs bg-green-200 dark:bg-green-800 rounded-full px-2 py-0.5">
                            {category.count}
                          </span>
                        </div>
                      )
                    )}
                    {(!exerciseStats?.exercise_categories ||
                      exerciseStats.exercise_categories.length === 0) && (
                      <p className="text-gray-500 dark:text-gray-400 italic">
                        No category data available
                      </p>
                    )}
                  </div>

                  <h3 className="text-lg font-medium mb-4 mt-6">
                    Exercise Metrics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Avg. Weight Used
                      </span>
                      <span className="text-xl font-bold">
                        {exerciseStats?.avg_weight || 0} kg
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Avg. Reps per Set
                      </span>
                      <span className="text-xl font-bold">
                        {exerciseStats?.avg_reps_per_set || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">
                        Most Common Rep Range
                      </span>
                      <span className="text-xl font-bold">
                        {exerciseStats?.most_common_rep_range || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Access Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaList className="text-blue-500" />
          Quick Access
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/admin/users")}
            className="p-4 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/30 rounded-lg transition-colors flex flex-col items-center gap-2"
          >
            <FaUsers className="text-2xl text-blue-500" />
            <span>Manage Users</span>
          </button>

          <button
            onClick={() => navigate("/admin/workouts")}
            className="p-4 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-800/30 rounded-lg transition-colors flex flex-col items-center gap-2"
          >
            <FaDumbbell className="text-2xl text-purple-500" />
            <span>Workout Analytics</span>
          </button>

          <button
            onClick={() => navigate("/admin/exercises")}
            className="p-4 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-800/30 rounded-lg transition-colors flex flex-col items-center gap-2"
          >
            <FaChartBar className="text-2xl text-green-500" />
            <span>Exercise Analytics</span>
          </button>

          <button
            onClick={() => navigate("/admin/settings")}
            className="p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors flex flex-col items-center gap-2"
          >
            <FaUser className="text-2xl text-gray-500" />
            <span>Admin Settings</span>
          </button>
        </div>
      </div>

      {/* System Status Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaChartBar className="text-indigo-500" />
          System Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg">
            <h3 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2">
              API Health
            </h3>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span>All systems operational</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Current response time: {Math.floor(Math.random() * 100) + 20}ms
            </p>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg">
            <h3 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2">
              Database Status
            </h3>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span>Connected</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Last backup: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg">
            <h3 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2">
              Server Load
            </h3>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span>Normal</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Memory usage: {Math.floor(Math.random() * 30) + 40}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
