import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaDumbbell, FaChartPie } from "react-icons/fa";
import LoadingSpinner from "../../components/LoadingSpinner";
import Card from "../../components/Card";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function AdminExercises() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exerciseStats, setExerciseStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchExerciseStats = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/admin/stats/exercises`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          if (response.status === 403) {
            setError("You don't have admin privileges to access this page.");
            setTimeout(() => navigate("/"), 3000);
            return;
          }
          throw new Error("Failed to fetch exercise statistics");
        }

        const data = await response.json();
        setExerciseStats(data);
      } catch (err) {
        console.error("Error fetching exercise statistics:", err);
        setError(err.message || "An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseStats();
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
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <FaArrowLeft /> Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold">Exercise Analytics</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card
          title="Most Popular Exercises"
          icon={<FaDumbbell className="text-purple-500" />}
          elevated
        >
          <div className="max-h-96 overflow-y-auto pr-2">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Rank
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Exercise Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Usage Count
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {exerciseStats?.popular_exercises?.map((exercise, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {exercise.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                      {exercise.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card
          title="Exercise Categories"
          icon={<FaChartPie className="text-green-500" />}
          elevated
        >
          <div className="max-h-96 overflow-y-auto pr-2">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Exercise Count
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {exerciseStats?.exercise_categories?.map((category, index) => {
                  // Calculate percentage
                  const totalCount = exerciseStats.exercise_categories.reduce(
                    (sum, cat) => sum + cat.count,
                    0
                  );
                  const percentage =
                    totalCount > 0
                      ? ((category.count / totalCount) * 100).toFixed(1)
                      : 0;

                  return (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {category.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                        {category.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                        {percentage}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card title="Exercise Insights" elevated>
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">
              Most Popular Exercise
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-bold">
                {exerciseStats?.popular_exercises?.[0]?.name || "N/A"}
              </span>{" "}
              is currently the most popular exercise, performed{" "}
              {exerciseStats?.popular_exercises?.[0]?.count || 0} times by
              users.
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-purple-800 dark:text-purple-300 mb-2">
              Category Distribution
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              The most common exercise category is{" "}
              <span className="font-bold">
                {exerciseStats?.exercise_categories?.[0]?.category || "N/A"}
              </span>
              , accounting for approximately
              {exerciseStats?.exercise_categories?.length > 0
                ? ` ${(
                    (exerciseStats.exercise_categories[0].count /
                      exerciseStats.exercise_categories.reduce(
                        (sum, cat) => sum + cat.count,
                        0
                      )) *
                    100
                  ).toFixed(1)}%`
                : " 0%"}
              of all exercises.
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-green-800 dark:text-green-300 mb-2">
              Variety Analysis
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Users are tracking {exerciseStats?.popular_exercises?.length || 0}{" "}
              different exercises, showing
              {exerciseStats?.popular_exercises?.length > 20
                ? " excellent"
                : exerciseStats?.popular_exercises?.length > 10
                ? " good"
                : " limited"}
              exercise variety in their workouts.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default AdminExercises;
