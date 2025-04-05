import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import axios from "../utils/axiosConfig";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  ZAxis,
  AreaChart,
  Area,
} from "recharts";

import {
  FaChartLine,
  FaWeight,
  FaRuler,
  FaDumbbell,
  FaRunning,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaDownload,
  FaPrint,
  FaCalendarCheck,
  FaChartPie,
  FaInfoCircle,
  FaShareAlt,
  FaCloudDownloadAlt,
  FaRegLightbulb,
  FaClock,
} from "react-icons/fa";

const backendURL = import.meta.env.VITE_API_URL;

function ProgressTracker() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressData, setProgressData] = useState({
    weight: [],
    strength: [],
    cardio: [],
    workouts: [],
  });
  const [activeMetric, setActiveMetric] = useState("weight");
  const [dateRange, setDateRange] = useState("3m"); // 1m, 3m, 6m, 1y, all
  const [goals, setGoals] = useState({
    weight: { target: '', deadline: '' },
    benchPress: { target: '', deadline: '' },
    squat: { target: '', deadline: '' },
    deadlift: { target: '', deadline: '' },
    runningPace: { target: '', deadline: '' }
  });
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [activeGoal, setActiveGoal] = useState('weight');
  const [compareMode, setCompareMode] = useState(false);
  const [comparisonRange, setComparisonRange] = useState("3m");
  const [smoothData, setSmoothData] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [insights, setInsights] = useState([]);

  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProgressData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch workout stats first
        const workoutStatsResponse = await axios.get(
          `${backendURL}/workout-stats`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Process weight progression
        const weightData = workoutStatsResponse.data.weight_progression
          .map((entry) => ({
            date: new Date(entry.date).toISOString().split("T")[0],
            bodyweight: entry.bodyweight,
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        // Fetch historical data for other metrics
        const strengthResponse = await axios.get(
          `${backendURL}/progress/strength`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const cardioResponse = await axios.get(
          `${backendURL}/progress/cardio`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // For workout frequency, let's fetch directly from the workouts endpoint
        // This ensures we get all workout data
        const workoutsResponse = await axios.get(
          `${backendURL}/workouts`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Process workout data for frequency tracking
        const workoutFrequencyData = processWorkoutFrequencyData(workoutsResponse.data);

        setProgressData({
          weight: weightData,
          strength: strengthResponse.data,
          cardio: cardioResponse.data,
          workouts: workoutFrequencyData,
        });
      } catch (err) {
        console.error("Error fetching progress data:", err);
        
        // Improved error message with more details
        const errorMessage = err.response?.data?.message || err.message || "Failed to load progress data";
        setError(`${errorMessage}. Please try again later.`);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [navigate, dateRange, retryCount]);

  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
  };

  const filterDataByDateRange = (data, range, isComparison = false) => {
    if (!data || data.length === 0) return data;

    const now = new Date();
    const rangeMap = {
      "1m": 30,
      "3m": 90,
      "6m": 180,
      "1y": 365,
      all: Infinity,
    };

    const daysToSubtract = rangeMap[range] || 90;
    
    if (isComparison) {
      // For comparison, get data from the previous period
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - daysToSubtract);
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - daysToSubtract);
      
      return data.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= endDate;
      });
    }

    return data.filter((entry) => {
      const entryDate = new Date(entry.date);
      const daysDiff = (now - entryDate) / (1000 * 60 * 60 * 24);
      return daysDiff <= daysToSubtract;
    });
  };

  const calculateChange = (data, key) => {
    const filteredData = filterDataByDateRange(data, dateRange);
    if (!filteredData || filteredData.length < 2)
      return { value: 0, direction: "none" };

    const latest = filteredData[filteredData.length - 1][key];
    const previous = filteredData[0][key];
    const change = latest - previous;

    return {
      value: Math.abs(change).toFixed(1),
      direction: change > 0 ? "up" : change < 0 ? "down" : "none",
    };
  };

  const renderChangeIndicator = (change, invertColors = false) => {
    const upColor = invertColors ? "text-green-500" : "text-red-500";
    const downColor = invertColors ? "text-red-500" : "text-green-500";

    if (change.direction === "up") {
      return <FaArrowUp className={upColor} />;
    } else if (change.direction === "down") {
      return <FaArrowDown className={downColor} />;
    }
    return <FaMinus className="text-gray-500" />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const renderMetricContent = () => {
    switch (activeMetric) {
      case "weight":
        return renderWeightMetric();
      case "strength":
        return renderStrengthMetric();
      case "cardio":
        return renderCardioMetric();
      case "frequency":
        return renderFrequencyMetric();
      case "dashboard":
        return renderDashboard();
      default:
        return renderWeightMetric();
    }
  };

  const getSmoothedData = (data, key, windowSize = 3) => {
    if (!data || data.length < windowSize) return data;
    
    return data.map((item, index) => {
      if (index < windowSize - 1) return item;
      
      let sum = 0;
      for (let i = 0; i < windowSize; i++) {
        sum += data[index - i][key];
      }
      
      return {
        ...item,
        [key]: sum / windowSize
      };
    });
  };

  const renderWeightMetric = () => {
    let weightData = filterDataByDateRange(progressData.weight, dateRange);
    const weightChange = calculateChange(weightData, "bodyweight");
    
    if (smoothData && weightData.length > 3) {
      weightData = getSmoothedData(weightData, "bodyweight");
    }

    let comparisonData = [];
    if (compareMode) {
      comparisonData = filterDataByDateRange(progressData.weight, dateRange, true);
    }

    const processedData = weightData.map((entry) => ({
      ...entry,
      formattedDate: formatDate(entry.date),
    }));
    
    const processedComparisonData = comparisonData.map((entry) => ({
      ...entry,
      formattedDate: formatDate(entry.date),
    }));

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Current Weight
            </h3>
            <p className="text-2xl font-bold">
              {weightData.length > 0
                ? `${weightData[weightData.length - 1].bodyweight} kg`
                : "N/A"}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Change
            </h3>
            <p className="text-2xl font-bold flex items-center">
              {weightChange.value} kg {renderChangeIndicator(weightChange)}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Total Change
            </h3>
            <p className="text-2xl font-bold">
              {weightData.length > 0
                ? `${(
                    weightData[weightData.length - 1].bodyweight -
                    weightData[0].bodyweight
                  ).toFixed(1)} kg`
                : "N/A"}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Weight Goal
            </h3>
            {goals.weight.target ? (
              <>
                <p className="text-2xl font-bold">{goals.weight.target} kg</p>
                <p className="text-sm text-gray-500">
                  By {new Date(goals.weight.deadline).toLocaleDateString()}
                </p>
                <button 
                  onClick={() => {
                    setActiveGoal('weight');
                    setShowGoalModal(true);
                  }}
                  className="text-blue-500 text-sm mt-2 hover:underline"
                >
                  Update Goal
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setActiveGoal('weight');
                  setShowGoalModal(true);
                }}
                className="mt-2 text-blue-500 hover:underline"
              >
                Set Goal
              </button>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Weight Progression</h3>
            <div className="flex items-center">
              <label className="mr-2 text-sm">Compare with previous period</label>
              <input
                type="checkbox"
                checked={compareMode}
                onChange={toggleCompareMode}
                className="form-checkbox h-5 w-5 text-blue-500"
              />
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="formattedDate" allowDuplicatedCategory={false} />
                <YAxis domain={["dataMin - 2", "dataMax + 2"]} />
                <Tooltip />
                <Legend />
                <Line
                  data={processedData}
                  type="monotone"
                  dataKey="bodyweight"
                  name="Current Period"
                  stroke="#3b82f6"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                {compareMode && (
                  <Line
                    data={processedComparisonData}
                    type="monotone"
                    dataKey="bodyweight"
                    name="Previous Period"
                    stroke="#ef4444"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Weight Progression</h3>
            <div className="flex items-center">
              <label className="mr-2 text-sm">Smooth data</label>
              <input
                type="checkbox"
                checked={smoothData}
                onChange={() => setSmoothData(!smoothData)}
                className="form-checkbox h-5 w-5 text-blue-500"
              />
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="formattedDate" allowDuplicatedCategory={false} />
                <YAxis domain={["dataMin - 2", "dataMax + 2"]} />
                <Tooltip />
                <Legend />
                <Line
                  data={processedData}
                  type="monotone"
                  dataKey="bodyweight"
                  name="Current Period"
                  stroke="#3b82f6"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                {compareMode && (
                  <Line
                    data={processedComparisonData}
                    type="monotone"
                    dataKey="bodyweight"
                    name="Previous Period"
                    stroke="#ef4444"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </>
    );
  };

  const renderStrengthMetric = () => {
    const strengthData = filterDataByDateRange(
      progressData.strength,
      dateRange
    );
    if (!strengthData || strengthData.length === 0)
      return <p>No strength data available</p>;

    const benchChange = calculateChange(strengthData, "benchPress");
    const squatChange = calculateChange(strengthData, "squat");
    const deadliftChange = calculateChange(strengthData, "deadlift");

    const processedData = strengthData.map((entry) => ({
      ...entry,
      formattedDate: formatDate(entry.date),
    }));

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Bench Press
            </h3>
            <p className="text-2xl font-bold">
              {strengthData[strengthData.length - 1].benchPress} kg
            </p>
            <p className="text-sm flex items-center mt-1">
              {benchChange.value} kg {renderChangeIndicator(benchChange, true)}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Squat
            </h3>
            <p className="text-2xl font-bold">
              {strengthData[strengthData.length - 1].squat} kg
            </p>
            <p className="text-sm flex items-center mt-1">
              {squatChange.value} kg {renderChangeIndicator(squatChange, true)}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Deadlift
            </h3>
            <p className="text-2xl font-bold">
              {strengthData[strengthData.length - 1].deadlift} kg
            </p>
            <p className="text-sm flex items-center mt-1">
              {deadliftChange.value} kg{" "}
              {renderChangeIndicator(deadliftChange, true)}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Strength Progression</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="formattedDate" />
                <YAxis domain={["dataMin - 10", "dataMax + 10"]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="benchPress"
                  name="Bench Press (kg)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="squat"
                  name="Squat (kg)"
                  stroke="#10b981"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="deadlift"
                  name="Deadlift (kg)"
                  stroke="#ef4444"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </>
    );
  };

  const renderCardioMetric = () => {
    const cardioData = filterDataByDateRange(progressData.cardio, dateRange);
    if (!cardioData || cardioData.length === 0)
      return <p>No cardio data available</p>;

    const paceChange = calculateChange(cardioData, "runningPace");
    const distanceChange = calculateChange(cardioData, "runningDistance");

    const processedData = cardioData.map((entry) => ({
      ...entry,
      formattedDate: formatDate(entry.date),
    }));

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Running Pace
            </h3>
            <p className="text-2xl font-bold">
              {cardioData[cardioData.length - 1].runningPace} min/km
            </p>
            <p className="text-sm flex items-center mt-1">
              {paceChange.value} min/km{" "}
              {renderChangeIndicator(paceChange, true)}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Running Distance
            </h3>
            <p className="text-2xl font-bold">
              {cardioData[cardioData.length - 1].runningDistance} km
            </p>
            <p className="text-sm flex items-center mt-1">
              {distanceChange.value} km{" "}
              {renderChangeIndicator(distanceChange, true)}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Cardio Progression</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="formattedDate" />
                <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="runningPace"
                  name="Pace (min/km)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="runningDistance"
                  name="Distance (km)"
                  stroke="#10b981"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </>
    );
  };

  const renderFrequencyMetric = () => {
    const workoutData = filterDataByDateRange(progressData.workouts, dateRange);
    
    return (
      <>
        <h2 className="text-2xl font-bold mb-2">Workout Consistency</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Track how consistently you're working out over time. This helps you identify patterns
          and maintain a regular exercise routine.
        </p>
        
        {/* Enhanced visualization with more detailed information */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="w-full">
              <h3 className="font-semibold mb-3">Workout Consistency Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">This Week</p>
                  <p className="text-xl font-bold">{calculateWorkoutsInPeriod(7)} workouts</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">This Month</p>
                  <p className="text-xl font-bold">{calculateWorkoutsInPeriod(30)} workouts</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Per Week</p>
                  <p className="text-xl font-bold">{calculateAverageWorkoutsPerWeek().toFixed(1)}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Longest Streak</p>
                  <p className="text-xl font-bold">{calculateLongestStreak()} days</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Existing chart */}
          <div className="mt-8 mb-8">
            <h3 className="font-semibold mb-3">Workout Frequency Over Time</h3>
            <div className="h-72 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workoutData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value) => [`${value} workout${value !== 1 ? 's' : ''}`, 'Count']}
                  />
                  <Legend />
                  <Bar dataKey="count" name="Workouts" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Add a workout heatmap calendar view */}
          <div className="mb-8">
            <h3 className="font-semibold mb-3">Workout Calendar (Last 4 Weeks)</h3>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="grid grid-cols-7 gap-1">
                {renderWorkoutHeatmap()}
              </div>
              <div className="mt-4 flex items-center justify-end gap-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded-sm mr-2"></div>
                  <span className="text-xs">No workout</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-200 dark:bg-blue-800 rounded-sm mr-2"></div>
                  <span className="text-xs">1 workout</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-300 dark:bg-blue-700 rounded-sm mr-2"></div>
                  <span className="text-xs">2 workouts</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 dark:bg-blue-600 rounded-sm mr-2"></div>
                  <span className="text-xs">3+ workouts</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Workout consistency insights */}
          <div className="mb-8">
            <h3 className="font-semibold mb-3">Consistency Insights</h3>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Most Active Days</h4>
                  {renderMostActiveDays()}
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Current Streak</h4>
                  <p className="text-2xl font-bold">{calculateCurrentStreak()} days</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {calculateCurrentStreak() > 0 
                      ? "Keep it up! Consistency is key to progress." 
                      : "Start a new streak today!"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-semibold mb-3">Recent Workouts</h3>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            {progressData.workouts.length > 0 ? (
              <div className="space-y-3">
                {progressData.workouts
                  .filter(workout => workout.count > 0)
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 5)
                  .map((workout, index) => (
                    <div key={index} className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                      <div>
                        <div className="font-medium">
                          {new Date(workout.date).toLocaleDateString(undefined, {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {workout.count} workout{workout.count !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <Link 
                        to={`/workout-history?date=${workout.date}`}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800"
                      >
                        View Details
                      </Link>
                    </div>
                  ))
                }
                <div className="text-center mt-4">
                  <Link 
                    to="/workout-history"
                    className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    View All Workout History →
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No recent workouts found. Start tracking your workouts to see your consistency!
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold mb-2">Debug Information</h3>
          <p className="text-sm mb-2">Total workouts in dataset: {progressData.workouts.length}</p>
          <p className="text-sm mb-2">Date range: {dateRange}</p>
          <p className="text-sm mb-2">Filtered workouts: {filterDataByDateRange(progressData.workouts, dateRange).length}</p>
          <details className="mt-2">
            <summary className="cursor-pointer text-blue-500">View Raw Workout Data</summary>
            <pre className="mt-2 p-2 bg-gray-200 dark:bg-gray-700 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(progressData.workouts, null, 2)}
            </pre>
          </details>
        </div>
      </>
    );
  };

  const exportProgressData = () => {
    const dataToExport = {
      weight: progressData.weight,
      strength: progressData.strength,
      cardio: progressData.cardio,
      workouts: progressData.workouts,
      exportDate: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `fitness-progress-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleGoalChange = (e) => {
    const { name, value } = e.target;
    const [goalType, field] = name.split('.');
    
    setGoals(prev => ({
      ...prev,
      [goalType]: {
        ...prev[goalType],
        [field]: value
      }
    }));
  };
  
  const saveGoal = () => {
    // Here you would typically save the goal to your backend
    // For now, we'll just close the modal
    setShowGoalModal(false);
    
    // In a real implementation, you would add code like:
    // axios.post(`${backendURL}/goals`, { goals }, { headers: { Authorization: `Bearer ${token}` } });
  };
  
  const renderGoalModal = () => {
    if (!showGoalModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Set {activeGoal.charAt(0).toUpperCase() + activeGoal.slice(1)} Goal</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Target Value</label>
            <input
              type="number"
              name={`${activeGoal}.target`}
              value={goals[activeGoal].target}
              onChange={handleGoalChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              placeholder={`Enter target ${activeGoal}`}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Target Date</label>
            <input
              type="date"
              name={`${activeGoal}.deadline`}
              value={goals[activeGoal].deadline}
              onChange={handleGoalChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowGoalModal(false)}
              className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={saveGoal}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save Goal
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const renderSkeletonLoader = () => {
    return (
      <div className="animate-pulse">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="h-10 w-64 bg-gray-300 dark:bg-gray-700 rounded mb-4 md:mb-0"></div>
          <div className="h-10 w-40 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
        
        <div className="h-80 bg-gray-300 dark:bg-gray-700 rounded-lg mb-6"></div>
      </div>
    );
  };

  const calculateWorkoutsInPeriod = (days) => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - days);
    
    return progressData.workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= startDate && workoutDate <= now;
    }).reduce((total, workout) => total + workout.count, 0);
  };

  const calculateAverageWorkoutsPerWeek = () => {
    if (!progressData.workouts.length) return 0;
    
    const dates = progressData.workouts.map(w => new Date(w.date));
    const earliestDate = new Date(Math.min(...dates));
    const latestDate = new Date(Math.max(...dates));
    
    const totalDays = Math.ceil((latestDate - earliestDate) / (1000 * 60 * 60 * 24)) || 1;
    const totalWeeks = totalDays / 7;
    
    const totalWorkouts = progressData.workouts.reduce((sum, workout) => sum + workout.count, 0);
    
    return totalWorkouts / (totalWeeks || 1);
  };

  const calculateLongestStreak = () => {
    if (!progressData.workouts.length) return 0;
    
    // Create a map of dates with workouts
    const workoutDays = new Set();
    progressData.workouts.forEach(workout => {
      workoutDays.add(workout.date);
    });
    
    // Find the longest streak
    let currentStreak = 0;
    let longestStreak = 0;
    
    // Sort dates and convert to Date objects
    const sortedDates = Array.from(workoutDays)
      .map(dateStr => new Date(dateStr))
      .sort((a, b) => a - b);
    
    for (let i = 0; i < sortedDates.length; i++) {
      if (i > 0) {
        const prevDate = sortedDates[i-1];
        const currDate = sortedDates[i];
        
        // Check if dates are consecutive
        const diffTime = Math.abs(currDate - prevDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      
      longestStreak = Math.max(longestStreak, currentStreak);
    }
    
    return longestStreak;
  };

  const renderWorkoutHeatmap = () => {
    // Create a map of dates with workout counts
    const workoutMap = {};
    progressData.workouts.forEach(workout => {
      workoutMap[workout.date] = workout.count;
    });
    
    // Generate last 4 weeks of dates
    const today = new Date();
    const days = [];
    for (let i = 27; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        count: workoutMap[dateStr] || 0,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    
    // Render the heatmap cells
    return days.map((day, index) => {
      let intensity = 'bg-gray-100 dark:bg-gray-700';
      if (day.count === 1) intensity = 'bg-blue-200 dark:bg-blue-800';
      if (day.count === 2) intensity = 'bg-blue-300 dark:bg-blue-700';
      if (day.count >= 3) intensity = 'bg-blue-500 dark:bg-blue-600';
      
      return (
        <div key={index} className="flex flex-col items-center">
          {index < 7 && <div className="text-xs text-gray-500 mb-1">{day.dayName}</div>}
          <Link 
            to={day.count > 0 ? `/workout-history?date=${day.date}` : '#'}
            className={`w-full aspect-square rounded-sm ${intensity} flex items-center justify-center
              ${day.count > 0 ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
            title={`${day.date}: ${day.count} workouts`}
            onClick={(e) => day.count === 0 && e.preventDefault()}
          >
            {day.count > 0 && <span className="text-xs font-bold">{day.count}</span>}
          </Link>
        </div>
      );
    });
  };

  const calculateCurrentStreak = () => {
    if (!progressData.workouts.length) return 0;
    
    // Get all workout dates
    const workoutDates = progressData.workouts.map(w => w.date);
    const dateSet = new Set(workoutDates);
    
    // Check for consecutive days up to today
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 100; i++) { // Limit to 100 days to prevent infinite loop
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (dateSet.has(dateStr)) {
        streak++;
      } else if (i === 0) {
        // If today doesn't have a workout, check yesterday
        continue;
      } else {
        // Break the streak when we find a day without a workout
        break;
      }
    }
    
    return streak;
  };

  const renderMostActiveDays = () => {
    // Count workouts by day of week
    const dayCount = [0, 0, 0, 0, 0, 0, 0]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    progressData.workouts.forEach(workout => {
      const date = new Date(workout.date);
      const day = date.getDay(); // 0-6
      dayCount[day] += workout.count;
    });
    
    // Find the most active days (top 3)
    const topDays = dayCount
      .map((count, index) => ({ day: dayNames[index], count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    
    return (
      <div className="space-y-2">
        {topDays.map((day, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-1 h-6 ${index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-blue-400' : 'bg-blue-300'} mr-2`}></div>
            <div className="flex-1">
              <div className="flex justify-between">
                <span>{day.day}</span>
                <span className="font-medium">{day.count} workouts</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 mt-1">
                <div 
                  className={`h-full ${index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-blue-400' : 'bg-blue-300'}`}
                  style={{ width: `${Math.min(100, (day.count / Math.max(...dayCount)) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderWorkoutHistoryLink = (date) => {
    // Format date for display
    const formattedDate = new Date(date).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return (
      <Link 
        to={`/workout-history?date=${date}`} 
        className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 underline"
      >
        View details for {formattedDate}
      </Link>
    );
  };

  // Add this helper function to process workout data for frequency tracking
  const processWorkoutFrequencyData = (workouts) => {
    // Create a map to count workouts by date
    const workoutsByDate = {};
    
    workouts.forEach(workout => {
      // Extract the date part only (YYYY-MM-DD)
      const workoutDate = new Date(workout.date || workout.start_time || workout.created_at);
      const dateStr = workoutDate.toISOString().split('T')[0];
      
      // Increment the count for this date
      if (workoutsByDate[dateStr]) {
        workoutsByDate[dateStr]++;
      } else {
        workoutsByDate[dateStr] = 1;
      }
    });
    
    // Convert the map to an array of objects
    return Object.keys(workoutsByDate).map(date => ({
      date: date,
      count: workoutsByDate[date]
    }));
  };

  const generateInsights = () => {
    const newInsights = [];
    
    // Weight insights
    if (progressData.weight.length > 5) {
      const recentWeights = progressData.weight.slice(-5);
      const avgRecentWeight = recentWeights.reduce((sum, entry) => sum + entry.bodyweight, 0) / recentWeights.length;
      const trend = calculateChange(progressData.weight, "bodyweight");
      
      if (trend.direction === "down" && parseFloat(trend.value) > 2) {
        newInsights.push({
          type: "weight",
          icon: <FaWeight />,
          title: "Weight Loss Progress",
          message: `You've lost ${trend.value}kg in the selected period. Great progress!`,
          priority: "high"
        });
      } else if (trend.direction === "up" && parseFloat(trend.value) > 2) {
        newInsights.push({
          type: "weight",
          icon: <FaWeight />,
          title: "Weight Gain Progress",
          message: `You've gained ${trend.value}kg in the selected period.`,
          priority: "medium"
        });
      }
    }
    
    // Workout consistency insights
    if (progressData.workouts.length > 0) {
      const streak = calculateCurrentStreak();
      if (streak >= 3) {
        newInsights.push({
          type: "consistency",
          icon: <FaCalendarCheck />,
          title: "Workout Streak",
          message: `You're on a ${streak}-day workout streak! Keep it up!`,
          priority: "high"
        });
      }
      
      const thisWeekWorkouts = calculateWorkoutsInPeriod(7);
      if (thisWeekWorkouts >= 3) {
        newInsights.push({
          type: "consistency",
          icon: <FaCalendarCheck />,
          title: "Active Week",
          message: `You've completed ${thisWeekWorkouts} workouts this week!`,
          priority: "medium"
        });
      }
    }
    
    // Strength insights
    if (progressData.strength.length > 0) {
      const exercises = ['benchPress', 'squat', 'deadlift'];
      
      exercises.forEach(exercise => {
        const exerciseData = progressData.strength.filter(entry => entry.exercise === exercise);
        if (exerciseData.length > 1) {
          const latest = exerciseData[exerciseData.length - 1];
          const first = exerciseData[0];
          const change = latest.weight - first.weight;
          
          if (change > 10) {
            const exerciseName = exercise === 'benchPress' ? 'Bench Press' : 
                                exercise === 'squat' ? 'Squat' : 'Deadlift';
            
            newInsights.push({
              type: "strength",
              icon: <FaDumbbell />,
              title: `${exerciseName} Progress`,
              message: `Your ${exerciseName} has increased by ${change.toFixed(1)}kg!`,
              priority: "high"
            });
          }
        }
      });
    }
    
    // Best day of the week insight
    const dayCount = [0, 0, 0, 0, 0, 0, 0]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    progressData.workouts.forEach(workout => {
      const date = new Date(workout.date);
      const day = date.getDay(); // 0-6
      dayCount[day] += workout.count;
    });
    
    const bestDayIndex = dayCount.indexOf(Math.max(...dayCount));
    if (dayCount[bestDayIndex] > 0) {
      newInsights.push({
        type: "consistency",
        icon: <FaCalendarCheck />,
        title: "Best Workout Day",
        message: `${dayNames[bestDayIndex]} is your most consistent workout day.`,
        priority: "medium"
      });
    }
    
    // Workout time distribution
    const morningWorkouts = progressData.workouts.filter(w => {
      const date = new Date(w.date);
      const hour = date.getHours();
      return hour >= 5 && hour < 12;
    }).length;
    
    const afternoonWorkouts = progressData.workouts.filter(w => {
      const date = new Date(w.date);
      const hour = date.getHours();
      return hour >= 12 && hour < 18;
    }).length;
    
    const eveningWorkouts = progressData.workouts.filter(w => {
      const date = new Date(w.date);
      const hour = date.getHours();
      return hour >= 18 || hour < 5;
    }).length;
    
    const totalWorkouts = morningWorkouts + afternoonWorkouts + eveningWorkouts;
    
    if (totalWorkouts > 0) {
      const preferredTime = Math.max(morningWorkouts, afternoonWorkouts, eveningWorkouts);
      let timeOfDay = "evening";
      if (preferredTime === morningWorkouts) timeOfDay = "morning";
      if (preferredTime === afternoonWorkouts) timeOfDay = "afternoon";
      
      newInsights.push({
        type: "consistency",
        icon: <FaClock />,
        title: "Preferred Workout Time",
        message: `You tend to work out most often in the ${timeOfDay}.`,
        priority: "low"
      });
    }
    
    setInsights(newInsights);
  };

  useEffect(() => {
    if (!loading && progressData.workouts.length > 0) {
      generateInsights();
    }
  }, [progressData, loading, dateRange]);

  const renderInsights = () => {
    if (insights.length === 0) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
          <FaRegLightbulb className="mx-auto text-2xl text-yellow-500 mb-2" />
          <p className="text-gray-600 dark:text-gray-400">
            Keep tracking your workouts to see personalized insights!
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div 
            key={index} 
            className={`bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 ${
              insight.priority === 'high' ? 'border-green-500' : 
              insight.priority === 'medium' ? 'border-blue-500' : 'border-gray-500'
            }`}
          >
            <div className="flex items-start">
              <div className={`p-2 rounded-full mr-3 ${
                insight.priority === 'high' ? 'bg-green-100 text-green-600' : 
                insight.priority === 'medium' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {insight.icon}
              </div>
              <div>
                <h4 className="font-semibold">{insight.title}</h4>
                <p className="text-gray-600 dark:text-gray-400">{insight.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderWorkoutDistribution = () => {
    // Count workouts by category
    const categoryCount = {};
    
    // Assuming each workout has exercises with categories
    progressData.workouts.forEach(workout => {
      const workoutDate = new Date(workout.date);
      // Only include workouts in the selected date range
      if (isDateInRange(workoutDate, dateRange)) {
        // For each workout, increment the count for its categories
        // This is a placeholder - you'll need to adapt this to your actual data structure
        const categories = ['Strength', 'Cardio', 'Flexibility', 'Other'];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        
        if (categoryCount[randomCategory]) {
          categoryCount[randomCategory]++;
        } else {
          categoryCount[randomCategory] = 1;
        }
      }
    });
    
    const data = Object.keys(categoryCount).map(category => ({
      name: category,
      value: categoryCount[category]
    }));
    
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
    
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} workouts`, 'Count']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const isDateInRange = (date, range) => {
    const now = new Date();
    const rangeMap = {
      "1m": 30,
      "3m": 90,
      "6m": 180,
      "1y": 365,
      all: Infinity,
    };

    const daysToSubtract = rangeMap[range] || 90;
    const daysDiff = (now - date) / (1000 * 60 * 60 * 24);
    return daysDiff <= daysToSubtract;
  };

  const renderDashboard = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weight Section */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <FaWeight className="mr-2 text-blue-500" /> Weight Tracking
            </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filterDataByDateRange(progressData.weight, dateRange)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                <Line
                  type="monotone"
                  dataKey="bodyweight"
                  name="Weight (kg)"
                  stroke="#3B82F6"
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          </div>

        {/* Workout Consistency Section */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <FaCalendarAlt className="mr-2 text-blue-500" /> Workout Consistency
            </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filterDataByDateRange(progressData.workouts, dateRange)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis allowDecimals={false} />
                <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                <Bar dataKey="count" name="Workouts" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          </div>

        {/* Insights Section */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow md:col-span-2">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <FaRegLightbulb className="mr-2 text-yellow-500" /> Personalized Insights
            </h3>
          {renderInsights()}
        </div>
        
        {/* Recent Stats Section */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Recent Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Streak</p>
              <p className="text-xl font-bold">{calculateCurrentStreak()} days</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">This Week</p>
              <p className="text-xl font-bold">{calculateWorkoutsInPeriod(7)} workouts</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">This Month</p>
              <p className="text-xl font-bold">{calculateWorkoutsInPeriod(30)} workouts</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Per Week</p>
              <p className="text-xl font-bold">{calculateAverageWorkoutsPerWeek().toFixed(1)}</p>
            </div>
          </div>
        </div>
        
        {/* Calendar Heatmap */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Workout Calendar</h3>
          <div className="grid grid-cols-7 gap-1">
            {renderWorkoutHeatmap()}
          </div>
        </div>
      </div>
    );
  };

  const renderProgressPrediction = () => {
    if (progressData.weight.length < 5) return null;
    
    // Simple linear regression to predict future weight
    const recentWeights = progressData.weight.slice(-10);
    const xValues = recentWeights.map((_, i) => i);
    const yValues = recentWeights.map(w => w.bodyweight);
    
    // Calculate slope and intercept
    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((a, b, i) => a + b * yValues[i], 0);
    const sumXX = xValues.reduce((a, b) => a + b * b, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Predict next 4 weeks
    const predictions = [];
    const lastDate = new Date(recentWeights[recentWeights.length - 1].date);
    
    for (let i = 1; i <= 4; i++) {
      const predictedWeight = intercept + slope * (xValues.length + i);
      const futureDate = new Date(lastDate);
      futureDate.setDate(lastDate.getDate() + (i * 7)); // Weekly predictions
      
      predictions.push({
        date: futureDate.toISOString().split('T')[0],
        bodyweight: predictedWeight,
        isPrediction: true
      });
    }
    
    return (
      <div className="mb-8">
        <h3 className="font-semibold mb-3">Weight Trend Prediction</h3>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[...recentWeights, ...predictions]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value, name, props) => {
                    if (props.payload.isPrediction) {
                      return [`${value.toFixed(1)} kg (predicted)`, 'Weight'];
                    }
                    return [`${value} kg`, 'Weight'];
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="bodyweight" 
                  name="Weight" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={(props) => {
                    if (props.payload.isPrediction) {
                      return (
                        <circle 
                          cx={props.cx} 
                          cy={props.cy} 
                          r={4} 
                          fill="#fff" 
                          stroke="#3B82F6" 
                          strokeWidth={2} 
                          strokeDasharray="3 3"
                        />
                      );
                    }
                    return (
                      <circle 
                        cx={props.cx} 
                        cy={props.cy} 
                        r={4} 
                        fill="#3B82F6" 
                      />
                    );
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
            * Predictions are based on your recent progress and may vary.
            </p>
          </div>
        </div>
    );
  };

  const renderVolumeTracker = () => {
    // Calculate total volume (weight × reps) per workout
    const volumeData = [];
    
    // This is a placeholder - you'll need to adapt to your actual data structure
    progressData.strength.forEach(entry => {
      const date = entry.date;
      const volume = entry.weight * entry.reps;
      
      const existingEntry = volumeData.find(item => item.date === date);
      if (existingEntry) {
        existingEntry.volume += volume;
      } else {
        volumeData.push({ date, volume });
      }
    });
    
    return (
      <div className="mb-8">
        <h3 className="font-semibold mb-3">Workout Volume Progression</h3>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value) => [`${value.toFixed(0)} kg`, 'Volume']}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="volume" 
                  name="Total Volume" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.3} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Volume = Weight × Reps (total across all exercises)
          </p>
        </div>
      </div>
    );
  };

  const renderGoalProgress = () => {
    const goalData = [
      { name: 'Weight', current: 80, target: 75, unit: 'kg' },
      { name: 'Bench Press', current: 100, target: 120, unit: 'kg' },
      { name: 'Squat', current: 130, target: 150, unit: 'kg' },
      { name: 'Deadlift', current: 160, target: 180, unit: 'kg' },
      { name: 'Running Pace', current: 5.5, target: 5, unit: 'min/km' }
    ];
    
    return (
      <div className="mb-8">
        <h3 className="font-semibold mb-3">Goal Progress</h3>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="space-y-4">
            {goalData.map((goal, index) => {
              const progress = Math.min(100, (goal.current / goal.target) * 100);
              const isInverted = goal.name === 'Running Pace' || goal.name === 'Weight';
              const progressValue = isInverted 
                ? Math.min(100, (goal.target / goal.current) * 100)
                : progress;
              
              return (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span>{goal.name}</span>
                    <span>
                      {goal.current} / {goal.target} {goal.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${progressValue}%` }}
                    ></div>
        </div>
      </div>
    );
            })}
          </div>
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors w-full"
            onClick={() => setShowGoalModal(true)}
          >
            Set New Goals
          </button>
        </div>
      </div>
    );
  };

  const handleShareProgress = () => {
    // Create a shareable link or message
    const shareText = `Check out my fitness progress! I've completed ${calculateWorkoutsInPeriod(30)} workouts this month and I'm on a ${calculateCurrentStreak()}-day streak!`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Fitness Progress',
        text: shareText,
        url: window.location.href,
      })
      .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(shareText)
        .then(() => {
          alert('Progress summary copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        {renderSkeletonLoader()}
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`container mx-auto px-4 py-8 ${
        theme === "dark" ? "text-white" : "text-gray-900"
      } print:text-black print:bg-white`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0 flex items-center">
          <FaChartLine className="mr-3 text-blue-500 print:text-black" /> Progress Tracker
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 print:hidden">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
          >
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
            <option value="all">All Time</option>
          </select>
          
          <button
            onClick={exportProgressData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
          >
            <FaDownload className="mr-2" /> Export Data
          </button>
          
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
          >
            <FaPrint className="mr-2" /> Print Report
          </button>
        </div>
      </div>

      <div className="print:hidden grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => setActiveMetric("weight")}
          className={`p-4 rounded-lg text-center transition-colors ${
            activeMetric === "weight"
              ? "bg-blue-500 text-white"
              : "bg-white dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600"
          }`}
        >
          <FaWeight className="mx-auto text-2xl mb-2" />
          <span className="block">Weight</span>
        </button>

        <button
          onClick={() => setActiveMetric("strength")}
          className={`p-4 rounded-lg text-center transition-colors ${
            activeMetric === "strength"
              ? "bg-blue-500 text-white"
              : "bg-white dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600"
          }`}
        >
          <FaDumbbell className="mx-auto text-2xl mb-2" />
          <span className="block">Strength</span>
        </button>

        <button
          onClick={() => setActiveMetric("cardio")}
          className={`p-4 rounded-lg text-center transition-colors ${
            activeMetric === "cardio"
              ? "bg-blue-500 text-white"
              : "bg-white dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600"
          }`}
        >
          <FaRunning className="mx-auto text-2xl mb-2" />
          <span className="block">Cardio</span>
        </button>

        <button
          onClick={() => setActiveMetric("frequency")}
          className={`flex flex-col items-center p-4 rounded-lg transition-colors ${
            activeMetric === "frequency"
              ? "bg-blue-500 text-white"
              : "bg-white dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600"
          }`}
        >
          <FaCalendarAlt className="mx-auto text-2xl mb-2" />
          <span className="block">Workout Consistency</span>
        </button>

        <button
          onClick={() => setActiveMetric("dashboard")}
          className={`p-4 rounded-lg text-center transition-colors ${
            activeMetric === "dashboard"
              ? "bg-blue-500 text-white"
              : "bg-white dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600"
          }`}
        >
          <FaChartPie className="mx-auto text-2xl mb-2" />
          <span className="block">Dashboard</span>
        </button>
      </div>

      <div className="print:block">
      {renderMetricContent()}
      </div>
      
      <div className="hidden print:block mt-8 pt-4 border-t text-center text-sm text-gray-500">
        <p>Generated on {new Date().toLocaleDateString()} from FitTrackr</p>
      </div>

      {renderGoalModal()}
    </div>
  );
}

export default ProgressTracker;
