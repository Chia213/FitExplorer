import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaChartArea, FaCalendar, FaClock } from "react-icons/fa";
import LoadingSpinner from "../../components/LoadingSpinner";
import Card from "../../components/Card";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function AdminWorkouts() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workoutStats, setWorkoutStats] = useState(null);
  const [workoutDistribution, setWorkoutDistribution] = useState({
    byDay: [0, 0, 0, 0, 0, 0, 0], // Sun to Sat
    byHour: Array(24).fill(0), // 0-23 hours
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchWorkoutData = async () => {
      try {
        setLoading(true);

        // Fetch workout stats
        const statsResponse = await fetch(`${API_URL}/admin/stats/workouts`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!statsResponse.ok) {
          if (statsResponse.status === 403) {
            setError("You don't have admin privileges to access this page.");
            setTimeout(() => navigate("/"), 3000);
            return;
          }
          throw new Error("Failed to fetch workout statistics");
        }

        const statsData = await statsResponse.json();
        setWorkoutStats(statsData);

        // Simulate fetching workout distribution data
        // In a real implementation, you'd have an endpoint for this
        setTimeout(() => {
          // Sample data - in a real app, this would come from the backend
          const sampleDistribution = {
            byDay: [15, 22, 18, 25, 30, 28, 35], // Sun to Sat
            byHour: [
              2, 1, 0, 0, 3, 8, 15, 24, 18, 12, 15, 22, 25, 20, 15, 18, 28, 35,
              30, 20, 12, 8, 5, 3,
            ], // 0-23 hours
          };

          setWorkoutDistribution(sampleDistribution);
        }, 500);
      } catch (err) {
        console.error("Error fetching workout data:", err);
        setError(err.message || "An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutData();
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

  // Helper function to get the max value in an array
  const getMaxValue = (arr) => Math.max(...arr);

  // Days of the week
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <FaArrowLeft /> Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold">Workout Analytics</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card
          title="Total Workouts"
          icon={<FaChartArea className="text-blue-500" />}
          elevated
        >
          <div className="text-center py-6">
            <p className="text-5xl font-bold text-blue-600 dark:text-blue-400">
              {workoutStats?.total_workouts || 0}
            </p>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              All-time workout logs
            </p>
          </div>
        </Card>

        <Card
          title="Recent Activity"
          icon={<FaCalendar className="text-green-500" />}
          elevated
        >
          <div className="text-center py-6">
            <p className="text-5xl font-bold text-green-600 dark:text-green-400">
              {workoutStats?.workouts_last_month || 0}
            </p>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Workouts in the last 30 days
            </p>
          </div>
        </Card>

        <Card
          title="Average Duration"
          icon={<FaClock className="text-purple-500" />}
          elevated
        >
          <div className="text-center py-6">
            <p className="text-5xl font-bold text-purple-600 dark:text-purple-400">
              {workoutStats?.avg_workout_duration || 0}
            </p>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Minutes per workout
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card title="Workouts by Day of Week" elevated>
          <div className="h-64 flex items-end justify-between px-4 pt-4">
            {workoutDistribution.byDay.map((count, index) => {
              const maxValue = getMaxValue(workoutDistribution.byDay);
              const percentage = maxValue > 0 ? (count / maxValue) * 100 : 0;

              return (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="w-10 bg-blue-500 dark:bg-blue-600 rounded-t-md flex items-end"
                    style={{ height: `${percentage}%` }}
                  >
                    <span className="w-full text-center text-xs text-white font-bold pb-1">
                      {count}
                    </span>
                  </div>
                  <span className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    {daysOfWeek[index]}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Workout Time Distribution" elevated>
          <div className="h-64 flex items-end justify-between px-2 pt-4">
            {workoutDistribution.byHour.map((count, index) => {
              // We're going to group by 3-hour blocks to make it fit
              if (index % 3 !== 0) return null;

              // Sum the current block of 3 hours
              const blockCount = workoutDistribution.byHour
                .slice(index, index + 3)
                .reduce((sum, val) => sum + val, 0);
              const maxBlockValue = Math.max(
                ...Array(8)
                  .fill(0)
                  .map((_, i) => {
                    return workoutDistribution.byHour
                      .slice(i * 3, (i + 1) * 3)
                      .reduce((sum, val) => sum + val, 0);
                  })
              );

              const percentage =
                maxBlockValue > 0 ? (blockCount / maxBlockValue) * 100 : 0;

              // Format the time label
              const startHour = index;
              const endHour = index + 3;
              const formatHour = (hour) => {
                if (hour === 0 || hour === 24) return "12AM";
                if (hour === 12) return "12PM";
                return hour < 12 ? `${hour}AM` : `${hour - 12}PM`;
              };

              return (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="w-12 bg-green-500 dark:bg-green-600 rounded-t-md flex items-end"
                    style={{ height: `${percentage}%` }}
                  >
                    <span className="w-full text-center text-xs text-white font-bold pb-1">
                      {blockCount}
                    </span>
                  </div>
                  <span className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    {formatHour(startHour)}-{formatHour(endHour)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card title="Workout Insights" elevated>
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">
              Most Active Day
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-bold">
                {
                  daysOfWeek[
                    workoutDistribution.byDay.indexOf(
                      getMaxValue(workoutDistribution.byDay)
                    )
                  ]
                }
              </span>{" "}
              is the most popular day for workouts, with users logging{" "}
              {getMaxValue(workoutDistribution.byDay)} sessions.
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-green-800 dark:text-green-300 mb-2">
              Peak Workout Hours
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              The most popular time for workouts is between
              <span className="font-bold">
                {" "}
                {(() => {
                  const peakHourIndex = workoutDistribution.byHour.indexOf(
                    getMaxValue(workoutDistribution.byHour)
                  );
                  const formatHour = (hour) => {
                    if (hour === 0 || hour === 24) return "12 AM";
                    if (hour === 12) return "12 PM";
                    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
                  };
                  return formatHour(peakHourIndex);
                })()}
              </span>
              .
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-purple-800 dark:text-purple-300 mb-2">
              Workout Frequency
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              With {workoutStats?.total_workouts || 0} total workouts and{" "}
              {workoutStats?.workouts_last_month || 0} in the last month, user
              engagement is
              {workoutStats?.workouts_last_month >
              workoutStats?.total_workouts / 12
                ? " increasing"
                : workoutStats?.workouts_last_month <
                  workoutStats?.total_workouts / 24
                ? " decreasing"
                : " stable"}
              .
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default AdminWorkouts;
