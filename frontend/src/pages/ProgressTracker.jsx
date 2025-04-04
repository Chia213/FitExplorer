import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "react-icons/fa";

const backendURL = import.meta.env.VITE_BACKEND_URL;

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

        // Fetch historical data for other metrics (you'll need to implement these endpoints)
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

        const workoutsResponse = await axios.get(
          `${backendURL}/progress/workout-frequency`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setProgressData({
          weight: weightData,
          strength: strengthResponse.data,
          cardio: cardioResponse.data,
          workouts: workoutsResponse.data,
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
    if (!workoutData || workoutData.length === 0)
      return <p>No workout frequency data available</p>;

    // Calculate total workouts
    const totalWorkouts = workoutData.reduce(
      (sum, entry) => sum + entry.workouts,
      0
    );
    const averageWorkouts = (totalWorkouts / workoutData.length).toFixed(1);

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Total Workouts
            </h3>
            <p className="text-2xl font-bold">{totalWorkouts}</p>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Monthly Average
            </h3>
            <p className="text-2xl font-bold">{averageWorkouts}</p>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Last Month
            </h3>
            <p className="text-2xl font-bold">
              {workoutData[workoutData.length - 1].workouts}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Workout Frequency</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workoutData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="workouts" name="Workouts" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 print:mb-4">
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
          className={`p-4 rounded-lg text-center transition-colors ${
            activeMetric === "frequency"
              ? "bg-blue-500 text-white"
              : "bg-white dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600"
          }`}
        >
          <FaCalendarAlt className="mx-auto text-2xl mb-2" />
          <span className="block">Frequency</span>
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
