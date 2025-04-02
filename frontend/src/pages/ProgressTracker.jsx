// src/pages/ProgressTracker.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
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
} from "react-icons/fa";

const backendURL = "http://localhost:8000";

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

        // For now we're using mock data, but in a real app you'd fetch from backend endpoints
        // const response = await fetch(`${backendURL}/progress?range=${dateRange}`, {
        //   headers: { Authorization: `Bearer ${token}` },
        // });
        // if (!response.ok) throw new Error("Failed to fetch progress data");
        // const data = await response.json();

        // Mock data for demonstration
        const mockData = generateMockData();
        setProgressData(mockData);
      } catch (err) {
        console.error("Error fetching progress data:", err);
        setError("Failed to load progress data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [navigate, dateRange]);

  const generateMockData = () => {
    // Helper to generate dates
    const generateDates = (numPoints, interval = 7) => {
      const dates = [];
      const today = new Date();

      for (let i = numPoints - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i * interval);
        dates.push(date.toISOString().split("T")[0]);
      }

      return dates;
    };

    // Generate weight data (weekly measurements)
    const weightDates = generateDates(12);
    const weightData = weightDates.map((date, index) => {
      // Start at 80kg and gradually decrease with some fluctuation
      const baseWeight = 80 - index * 0.5;
      const fluctuation = Math.random() * 0.8 - 0.4; // Random fluctuation between -0.4 and 0.4
      return {
        date,
        bodyweight: +(baseWeight + fluctuation).toFixed(1),
      };
    });

    // Generate strength data (less frequent measurements, every 2 weeks)
    const strengthDates = generateDates(6, 14);
    const strengthData = strengthDates.map((date, index) => {
      // Progressive overload with some variation
      return {
        date,
        benchPress: Math.round(80 + index * 2.5 + (Math.random() * 2 - 1)),
        squat: Math.round(100 + index * 5 + (Math.random() * 3 - 1.5)),
        deadlift: Math.round(140 + index * 5 + (Math.random() * 3 - 1.5)),
      };
    });

    // Generate cardio data (weekly measurements)
    const cardioDates = generateDates(12);
    const cardioData = cardioDates.map((date, index) => {
      // Improving cardio performance
      return {
        date,
        runningPace: +(5.5 - index * 0.1 + (Math.random() * 0.2 - 0.1)).toFixed(
          1
        ), // min/km
        runningDistance: Math.round(
          3 + index * 0.3 + (Math.random() * 0.4 - 0.2)
        ), // km
      };
    });

    // Generate workout frequency data (monthly counts)
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const currentMonth = new Date().getMonth();

    const workoutData = [];
    for (let i = 0; i < 12; i++) {
      const monthIndex = (currentMonth - 11 + i) % 12;
      workoutData.push({
        month: months[monthIndex],
        workouts: Math.round(8 + Math.random() * 6), // 8-14 workouts per month
      });
    }

    return {
      weight: weightData,
      strength: strengthData,
      cardio: cardioData,
      workouts: workoutData,
    };
  };

  const calculateChange = (data, key) => {
    if (!data || data.length < 2) return { value: 0, direction: "none" };

    const latest = data[data.length - 1][key];
    const previous = data[data.length - 2][key];
    const change = latest - previous;

    return {
      value: Math.abs(change).toFixed(1),
      direction: change > 0 ? "up" : change < 0 ? "down" : "none",
    };
  };

  const renderChangeIndicator = (change, invertColors = false) => {
    // For weight, down is good (green), for strength, up is good (green)
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

  const renderWeightMetric = () => {
    const weightData = progressData.weight;
    const weightChange = calculateChange(weightData, "bodyweight");
    const processedData = weightData.map((entry) => ({
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
        </div>

        <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Weight Progression</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="formattedDate" />
                <YAxis domain={["dataMin - 2", "dataMax + 2"]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="bodyweight"
                  name="Weight (kg)"
                  stroke="#3b82f6"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </>
    );
  };

  const renderStrengthMetric = () => {
    const strengthData = progressData.strength;
    if (!strengthData.length) return <p>No strength data available</p>;

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
    const cardioData = progressData.cardio;
    if (!cardioData.length) return <p>No cardio data available</p>;

    const paceChange = calculateChange(cardioData, "runningPace");
    const distanceChange = calculateChange(cardioData, "runningDistance");

    // For pace, lower is better, so we invert the arrows
    const invertPaceIndicator = true;

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
              {renderChangeIndicator(paceChange, invertPaceIndicator)}
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
    const workoutData = progressData.workouts;
    if (!workoutData.length) return <p>No workout frequency data available</p>;

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Loading your progress data...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`container mx-auto px-4 py-8 ${
        theme === "dark" ? "text-white" : "text-gray-900"
      }`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0 flex items-center">
          <FaChartLine className="mr-3 text-blue-500" /> Progress Tracker
        </h1>

        <div className="flex flex-col sm:flex-row gap-4">
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
        </div>
      </div>

      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-6">{error}</div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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

      {renderMetricContent()}

      <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Tips for Progress</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Consistency is key - aim for regular workouts rather than sporadic
            intense sessions
          </li>
          <li>
            Track your nutrition alongside your workouts for optimal results
          </li>
          <li>
            Ensure you're getting enough rest and recovery between training
            sessions
          </li>
          <li>
            Set realistic goals and celebrate small victories along the way
          </li>
          <li>
            Consider taking progress photos to visually track changes that
            numbers might not show
          </li>
        </ul>
      </div>
    </div>
  );
}

export default ProgressTracker;
