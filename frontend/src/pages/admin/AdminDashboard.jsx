import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaDumbbell,
  FaChartBar,
  FaUser,
  FaList,
} from "react-icons/fa";
import LoadingSpinner from "../../components/LoadingSpinner";
import Card from "../../components/Card";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [exerciseStats, setExerciseStats] = useState(null);
  const [workoutStats, setWorkoutStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchAdminData = async () => {
      try {
        setLoading(true);

        // Fetch all stats in parallel
        const [userStatsRes, exerciseStatsRes, workoutStatsRes] =
          await Promise.all([
            fetch(`${API_URL}/admin/stats/users`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_URL}/admin/stats/exercises`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_URL}/admin/stats/workouts`, {
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
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setError(err.message || "An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* User Stats Card */}
        <Card
          title="User Statistics"
          icon={<FaUsers className="text-blue-500" />}
          elevated
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">
                Total Users
              </span>
              <span className="text-xl font-bold">
                {userStats?.total_users || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">
                Active Users (30d)
              </span>
              <span className="text-xl font-bold">
                {userStats?.active_users_last_month || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">
                New Users (30d)
              </span>
              <span className="text-xl font-bold">
                {userStats?.new_users_last_month || 0}
              </span>
            </div>
          </div>
          <button
            className="mt-4 w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
            onClick={() => navigate("/admin/users")}
          >
            View All Users
          </button>
        </Card>

        {/* Workout Stats Card */}
        <Card
          title="Workout Statistics"
          icon={<FaDumbbell className="text-green-500" />}
          elevated
        >
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
                Workouts (30d)
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
          </div>
          <button
            className="mt-4 w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
            onClick={() => navigate("/admin/workouts")}
          >
            View Workout Data
          </button>
        </Card>

        {/* Exercise Stats Card */}
        <Card
          title="Exercise Statistics"
          icon={<FaChartBar className="text-purple-500" />}
          elevated
        >
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2">
              Top Exercises
            </h3>
            <div className="space-y-2 max-h-36 overflow-auto pr-2">
              {exerciseStats?.popular_exercises?.slice(0, 5).map((ex, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-gray-600 dark:text-gray-300">
                    {ex.name}
                  </span>
                  <span className="font-medium">{ex.count}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            className="mt-4 w-full py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md transition-colors"
            onClick={() => navigate("/admin/exercises")}
          >
            View Exercise Data
          </button>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
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
              className="p-4 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-800/30 rounded-lg transition-colors flex flex-col items-center gap-2"
            >
              <FaDumbbell className="text-2xl text-green-500" />
              <span>Workout Analytics</span>
            </button>

            <button
              onClick={() => navigate("/admin/exercises")}
              className="p-4 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-800/30 rounded-lg transition-colors flex flex-col items-center gap-2"
            >
              <FaChartBar className="text-2xl text-purple-500" />
              <span>Exercise Analytics</span>
            </button>

            <button
              onClick={() => navigate("/")}
              className="p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors flex flex-col items-center gap-2"
            >
              <FaUser className="text-2xl text-gray-500" />
              <span>Back to App</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
