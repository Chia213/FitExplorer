import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaWeight,
  FaClock,
  FaChevronDown,
  FaChevronUp,
  FaArrowLeft,
  FaSave,
  FaSearch,
  FaTrash,
  FaBalanceScale,
  FaTrophy,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { Line } from "react-chartjs-2";

const API_BASE_URL = "http://localhost:8000";

const getIntensityName = (intensityValue) => {
  const intensityMap = {
    "": "-",
    Low: "Low",
    Medium: "Medium",
    High: "High",
    "Very High": "Very High",
    // Handle numeric values too in case they come from the backend
    0: "-",
    1: "Low",
    2: "Medium",
    3: "High",
    4: "Very High",
  };
  return intensityMap[intensityValue] || "-";
};

function WorkoutHistory() {
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedWorkouts, setExpandedWorkouts] = useState({});
  const [filterDate, setFilterDate] = useState("");
  const [filterExercise, setFilterExercise] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSaveRoutineModal, setShowSaveRoutineModal] = useState(false);
  const [routineName, setRoutineName] = useState("");
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [savingRoutine, setSavingRoutine] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState(null);
  const [weightUnit, setWeightUnit] = useState(() => {
    return localStorage.getItem("weightUnit") || "kg";
  });
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'calendar'
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchWorkoutHistory(token);
  }, [navigate]);

  const toggleWeightUnit = () => {
    const newUnit = weightUnit === "kg" ? "lbs" : "kg";
    setWeightUnit(newUnit);
    localStorage.setItem("weightUnit", newUnit);
  };

  async function fetchWorkoutHistory(token) {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/workouts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch workouts");

      const data = await response.json();
      console.log("Fetched workout data:", data);

      // Sort workouts by date in descending order (newest first)
      const sortedWorkouts = data.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });

      const processedWorkouts = sortedWorkouts.map((workout) => {
        if (!workout.exercises) {
          workout.exercises = [];
          return workout;
        }

        if (typeof workout.exercises === "string") {
          try {
            workout.exercises = JSON.parse(workout.exercises);
          } catch (e) {
            console.error("Error parsing exercises JSON:", e);
            workout.exercises = [];
          }
        }

        if (!Array.isArray(workout.exercises)) {
          workout.exercises = [];
        }

        workout.exercises = workout.exercises.map((exercise) => {
          if (
            exercise.is_cardio !== undefined &&
            exercise.is_cardio === undefined
          ) {
            exercise.is_cardio = exercise.is_cardio;
            delete exercise.is_cardio;
          }

          if (
            exercise.is_cardio === undefined &&
            exercise.category === "Cardio"
          ) {
            exercise.is_cardio = true;
          }
          return exercise;
        });

        return workout;
      });

      setWorkoutHistory(processedWorkouts);
      setError(null);
    } catch (error) {
      console.error("Error fetching workouts:", error);
      setError("Failed to load workout history. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  const handleSaveAsRoutine = async (workout) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to be logged in to save routines.");
        navigate("/login");
        return;
      }

      // Show name input dialog
      const routineName = prompt(
        "Enter a name for this routine:",
        workout.name
      );
      if (!routineName) {
        return; // User cancelled
      }

      // Prepare workout data with new name
      const workoutToSave = {
        ...workout,
        name: routineName,
      };

      await saveWorkoutAsRoutine(workoutToSave, token);
      alert("Workout saved as routine successfully!");
    } catch (error) {
      console.error("Error saving routine:", error);
      alert(`Error saving routine: ${error.message}. Please try again.`);
    }
  };

  const handleSaveRoutine = async () => {
    if (!routineName.trim()) {
      alert("Please enter a routine name.");
      return;
    }

    setSavingRoutine(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to be logged in to save routines.");
        navigate("/login");
        return;
      }

      const routineData = {
        name: routineName,
        weight_unit: selectedWorkout.weight_unit || "kg",
        exercises: selectedWorkout.exercises.map((exercise) => ({
          name: exercise.name,
          category: exercise.category || "Uncategorized",
          is_cardio: Boolean(exercise.is_cardio),
          initial_sets: exercise.sets?.length || 1,
          sets:
            exercise.sets?.map((set) => {
              if (exercise.is_cardio) {
                return {
                  distance: set.distance || null,
                  duration: set.duration || null,
                  intensity: set.intensity || "",
                  notes: set.notes || "",
                };
              } else {
                return {
                  weight: set.weight || null,
                  reps: set.reps || null,
                  notes: set.notes || "",
                };
              }
            }) || [],
        })),
      };

      // Use handleSaveAsRoutine instead of duplicating logic
      await saveWorkoutAsRoutine(routineData, token);
      alert("Routine saved successfully!");
      setShowSaveRoutineModal(false);
    } catch (error) {
      console.error("Error saving routine:", error);
      alert(`Error saving routine: ${error.message}. Please try again.`);
    } finally {
      setSavingRoutine(false);
    }
  };

  const handleDeleteWorkout = (workoutId) => {
    setWorkoutToDelete(workoutId);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteWorkout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to be logged in to delete workouts.");
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/workouts/${workoutToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete workout: ${response.status}`);
      }

      // Remove the workout from state
      setWorkoutHistory(
        workoutHistory.filter((workout) => workout.id !== workoutToDelete)
      );
      setShowDeleteConfirmation(false);
      setWorkoutToDelete(null);

      alert("Workout deleted successfully!");
    } catch (error) {
      console.error("Error deleting workout:", error);
      alert(`Error deleting workout: ${error.message}. Please try again.`);
    }
  };

  const toggleWorkoutExpansion = (workoutId) => {
    setExpandedWorkouts((prev) => ({
      ...prev,
      [workoutId]: !prev[workoutId],
    }));
  };

  const formatWeight = (weight, originalUnit = "kg") => {
    if (!weight) return "-";

    // No conversion needed if display unit matches stored unit
    if (weightUnit === originalUnit) {
      return `${weight} ${weightUnit}`;
    }

    // Convert between units
    if (weightUnit === "lbs" && originalUnit === "kg") {
      // Convert kg to lbs
      return `${(parseFloat(weight) * 2.20462).toFixed(1)} lbs`;
    } else if (weightUnit === "kg" && originalUnit === "lbs") {
      // Convert lbs to kg
      return `${(parseFloat(weight) / 2.20462).toFixed(1)} kg`;
    }

    // Fallback
    return `${weight} ${originalUnit}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "N/A";

    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;

    const minutes = Math.floor(durationMs / 60000);

    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  const calculateTotalDistance = (workout) => {
    if (!workout.exercises || !Array.isArray(workout.exercises)) return 0;

    let totalDistance = 0;

    workout.exercises.forEach((exercise) => {
      if (!exercise.is_cardio) return;

      if (!exercise.sets || !Array.isArray(exercise.sets)) return;

      exercise.sets.forEach((set) => {
        if (set.distance) {
          totalDistance += parseFloat(set.distance);
        }
      });
    });

    return totalDistance > 0 ? totalDistance.toFixed(2) : 0;
  };

  const calculateTotalDuration = (workout) => {
    if (!workout.exercises || !Array.isArray(workout.exercises)) return 0;

    let totalDuration = 0;

    workout.exercises.forEach((exercise) => {
      if (!exercise.is_cardio) return;

      if (!exercise.sets || !Array.isArray(exercise.sets)) return;

      exercise.sets.forEach((set) => {
        if (set.duration) {
          totalDuration += parseFloat(set.duration);
        }
      });
    });

    return totalDuration > 0 ? totalDuration : 0;
  };

  const getAllExerciseNames = () => {
    const names = new Set();
    workoutHistory.forEach((workout) => {
      if (workout.exercises && Array.isArray(workout.exercises)) {
        workout.exercises.forEach((exercise) => {
          if (exercise && exercise.name) {
            names.add(exercise.name);
          }
        });
      }
    });
    return Array.from(names).sort();
  };

  const filteredWorkouts = workoutHistory.filter((workout) => {
    let matchesDate = true;
    let matchesExercise = true;
    let matchesSearch = true;

    if (filterDate) {
      const workoutDate = new Date(workout.date || workout.start_time)
        .toISOString()
        .split("T")[0];
      matchesDate = workoutDate === filterDate;
    }

    if (
      filterExercise &&
      workout.exercises &&
      Array.isArray(workout.exercises)
    ) {
      matchesExercise = workout.exercises.some(
        (exercise) =>
          exercise &&
          exercise.name &&
          exercise.name.toLowerCase().includes(filterExercise.toLowerCase())
      );
    } else if (filterExercise) {
      matchesExercise = false;
    }

    if (searchQuery.trim() !== "") {
      matchesSearch = workout.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    }

    return matchesDate && matchesExercise && matchesSearch;
  });

  const generateExerciseProgressData = (exerciseName) => {
    const data = workoutHistory
      .filter((workout) =>
        workout.exercises?.some((ex) => ex.name === exerciseName)
      )
      .map((workout) => {
        const exercise = workout.exercises.find(
          (ex) => ex.name === exerciseName
        );
        // For strength exercises, find the max weight used
        if (!exercise.is_cardio) {
          const maxWeight = Math.max(
            ...exercise.sets.map((set) => set.weight || 0)
          );
          return {
            date: new Date(workout.date || workout.start_time),
            value: maxWeight,
          };
        }
        // For cardio, use distance or duration
        return {
          date: new Date(workout.date || workout.start_time),
          value: exercise.sets.reduce(
            (sum, set) => sum + (set.distance || 0),
            0
          ),
        };
      })
      .sort((a, b) => a.date - b.date);

    return {
      labels: data.map((d) => d.date.toLocaleDateString()),
      datasets: [
        {
          label: exerciseName,
          data: data.map((d) => d.value),
          borderColor: "#4F46E5",
          tension: 0.1,
        },
      ],
    };
  };

  const workoutStats = useMemo(() => {
    if (workoutHistory.length === 0) return null;

    const totalWorkouts = workoutHistory.length;
    const thisMonth = workoutHistory.filter((w) => {
      const date = new Date(w.date || w.start_time);
      const now = new Date();
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length;

    const avgDuration =
      workoutHistory.reduce((sum, w) => {
        const start = new Date(w.start_time);
        const end = new Date(w.end_time);
        return sum + (end - start) / (1000 * 60); // in minutes
      }, 0) / totalWorkouts;

    const mostFrequentExercise = Object.entries(
      workoutHistory
        .flatMap((w) => w.exercises?.map((e) => e.name) || [])
        .reduce((acc, name) => {
          acc[name] = (acc[name] || 0) + 1;
          return acc;
        }, {})
    ).sort((a, b) => b[1] - a[1])[0];

    return {
      totalWorkouts,
      thisMonth,
      avgDuration: Math.round(avgDuration),
      mostFrequentExercise: mostFrequentExercise
        ? mostFrequentExercise[0]
        : "None",
    };
  }, [workoutHistory]);

  const personalRecords = useMemo(() => {
    const records = {};

    workoutHistory.forEach((workout) => {
      workout.exercises?.forEach((exercise) => {
        if (exercise.is_cardio) {
          // For cardio, track fastest pace or longest distance
          const totalDistance =
            exercise.sets?.reduce(
              (sum, set) => sum + (parseFloat(set.distance) || 0),
              0
            ) || 0;
          const totalDuration =
            exercise.sets?.reduce(
              (sum, set) => sum + (parseFloat(set.duration) || 0),
              0
            ) || 0;

          if (totalDistance > 0 && totalDuration > 0) {
            const pace = totalDuration / totalDistance; // min/km

            if (
              !records[exercise.name] ||
              (records[exercise.name].type === "pace" &&
                pace < records[exercise.name].value)
            ) {
              records[exercise.name] = {
                type: "pace",
                value: pace,
                display: `${pace.toFixed(2)} min/km`,
                date: workout.date || workout.start_time,
              };
            }

            if (
              !records[`${exercise.name}_distance`] ||
              totalDistance > records[`${exercise.name}_distance`].value
            ) {
              records[`${exercise.name}_distance`] = {
                type: "distance",
                value: totalDistance,
                display: `${totalDistance.toFixed(2)} km`,
                date: workout.date || workout.start_time,
              };
            }
          }
        } else {
          // For strength, track max weight
          exercise.sets?.forEach((set) => {
            if (set.weight && set.reps) {
              const key = `${exercise.name}_${set.reps}reps`;
              if (
                !records[key] ||
                parseFloat(set.weight) > records[key].value
              ) {
                records[key] = {
                  type: "weight",
                  value: parseFloat(set.weight),
                  display: `${set.weight}${workout.weight_unit || "kg"} × ${
                    set.reps
                  }`,
                  date: workout.date || workout.start_time,
                };
              }
            }
          });
        }
      });
    });

    return Object.entries(records)
      .filter(([key]) => !key.includes("_distance")) // Filter out duplicate records
      .map(([key, record]) => ({
        name: key.split("_")[0],
        ...record,
      }));
  }, [workoutHistory]);

  const generateCalendarDays = () => {
    const days = [];
    const firstDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    ).getDay();
    const totalDays = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate();

    for (let i = 0; i < firstDay; i++) {
      days.push({
        date: new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth(),
          0 - i
        ),
        workouts: [],
        isCurrentMonth: false,
        isToday: false,
      });
    }

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const workouts = workoutHistory.filter((workout) => {
        const workoutDate = new Date(workout.date || workout.start_time);
        return (
          workoutDate.getDate() === day &&
          workoutDate.getMonth() === currentMonth.getMonth()
        );
      });
      const isToday = date.toDateString() === new Date().toDateString();
      days.push({ date, workouts, isCurrentMonth: true, isToday });
    }

    const remainingDays = 7 - (days.length % 7);
    for (let i = 0; i < remainingDays; i++) {
      days.push({
        date: new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() + 1,
          i + 1
        ),
        workouts: [],
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  };

  const handleViewWorkout = (workout) => {
    setSelectedWorkout(workout);
    setShowSaveRoutineModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Workout History
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 rounded ${
                viewMode === "list"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              }`}
            >
              View Listed Workouts
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1 rounded ${
                viewMode === "calendar"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              }`}
            >
              Calendar View
            </button>
            <button
              onClick={toggleWeightUnit}
              className="flex items-center bg-gray-200 dark:bg-gray-700 px-3 py-2 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <FaBalanceScale className="mr-2" />
              <span>{weightUnit.toUpperCase()}</span>
            </button>
          </div>
          <button
            onClick={() => navigate("/workout-log")}
            className="flex items-center text-teal-500 hover:text-teal-400"
          >
            <FaArrowLeft className="mr-2" /> Back to Workout
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {workoutStats && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
            <h2 className="text-lg font-semibold mb-3">Your Workout Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Workouts
                </p>
                <p className="text-2xl font-bold">
                  {workoutStats.totalWorkouts}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This Month
                </p>
                <p className="text-2xl font-bold">{workoutStats.thisMonth}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Avg Duration
                </p>
                <p className="text-2xl font-bold">
                  {workoutStats.avgDuration} min
                </p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Favorite Exercise
                </p>
                <p className="text-xl font-bold truncate">
                  {workoutStats.mostFrequentExercise}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Filter by Date
              </label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full bg-gray-200 dark:bg-gray-700 rounded p-2"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Filter by Exercise
              </label>
              <select
                value={filterExercise}
                onChange={(e) => setFilterExercise(e.target.value)}
                className="w-full bg-gray-200 dark:bg-gray-700 rounded p-2"
              >
                <option value="">All Exercises</option>
                {Array.from(
                  new Set(
                    workoutHistory.flatMap((w) =>
                      w.exercises?.map((e) => e.name)
                    )
                  )
                ).map((name, index) => (
                  <option key={index} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => navigate("/personal-records")}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:from-purple-600 hover:to-indigo-700 transition-all flex items-center"
            >
              <FaTrophy className="text-yellow-300 mr-2" />
              <span>View Personal Records</span>
            </button>

            <button
              onClick={() => {
                setFilterDate("");
                setFilterExercise("");
              }}
              className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              Clear Filters
            </button>
          </div>

          <div className="mt-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Search Workouts
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by workout name..."
                className="w-full bg-gray-200 dark:bg-gray-700 rounded p-2 pl-10"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-500 dark:text-gray-400" />
            </div>
          </div>
        </div>

        {viewMode === "calendar" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
            <div className="mb-4 flex justify-between items-center">
              <button
                onClick={() => {
                  const newDate = new Date(currentMonth);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setCurrentMonth(newDate);
                }}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <FaChevronLeft />
              </button>

              <h3 className="text-lg font-medium">
                {new Date(currentMonth).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>

              <button
                onClick={() => {
                  const newDate = new Date(currentMonth);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setCurrentMonth(newDate);
                }}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <FaChevronRight />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center font-medium p-2">
                  {day}
                </div>
              ))}

              {/* Generate calendar days */}
              {generateCalendarDays().map((day, i) => (
                <div
                  key={i}
                  className={`p-2 min-h-[80px] border rounded ${
                    day.isCurrentMonth
                      ? "border-gray-200 dark:border-gray-700"
                      : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-400"
                  } ${day.isToday ? "ring-2 ring-blue-500" : ""}`}
                >
                  <div className="text-right mb-1">{day.date.getDate()}</div>
                  {day.workouts.map((workout, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleViewWorkout(workout)}
                      className="text-xs p-1 mb-1 rounded bg-blue-100 dark:bg-blue-900/30 cursor-pointer truncate hover:bg-blue-200 dark:hover:bg-blue-800/30"
                    >
                      {workout.name}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading workout history...
            </p>
          </div>
        ) : filteredWorkouts.length === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-600 dark:text-gray-400">
              {workoutHistory.length === 0
                ? "No workouts found in your history. Start logging your workouts!"
                : "No workouts match your filters."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWorkouts.map((workout, index) => (
              <div
                key={workout.id || index}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden`}
              >
                <div
                  className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWorkoutExpansion(workout.id || index);
                  }}
                >
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {workout.name}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-1" />
                        {formatDate(workout.date || workout.start_time)}
                      </div>
                      {workout.bodyweight && (
                        <div className="flex items-center">
                          <FaWeight className="mr-1" />
                          {formatWeight(
                            workout.bodyweight,
                            workout.weight_unit || "kg"
                          )}
                        </div>
                      )}
                      <div className="flex items-center">
                        <FaClock className="mr-1" />
                        {calculateDuration(
                          workout.start_time,
                          workout.end_time
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Time: </span>&nbsp;
                        {formatTime(workout.start_time)} -{" "}
                        {formatTime(workout.end_time)}
                      </div>
                      {calculateTotalDistance(workout) > 0 && (
                        <div className="flex items-center">
                          <span className="font-medium">Distance: </span>&nbsp;
                          {calculateTotalDistance(workout)} km
                        </div>
                      )}
                      {calculateTotalDuration(workout) > 0 && (
                        <div className="flex items-center">
                          <span className="font-medium">Cardio: </span>&nbsp;
                          {calculateTotalDuration(workout)} min
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWorkout(workout.id);
                      }}
                      className="text-red-500 hover:text-red-700 mr-4"
                      title="Delete workout"
                    >
                      <FaTrash />
                    </button>
                    {expandedWorkouts[workout.id || index] ? (
                      <FaChevronUp className="text-gray-400" />
                    ) : (
                      <FaChevronDown className="text-gray-400" />
                    )}
                  </div>
                </div>

                {expandedWorkouts[workout.id || index] && (
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    {workout.notes && (
                      <div className="mb-4 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                        <p className="text-gray-600 dark:text-gray-300">
                          {workout.notes}
                        </p>
                      </div>
                    )}

                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="font-medium">Started Workout:</span>{" "}
                          {formatTime(workout.start_time)}
                        </div>
                        <div></div>
                        <div>
                          <span className="font-medium">Ended Workout:</span>{" "}
                          {workout.end_time
                            ? formatTime(workout.end_time)
                            : "N/A"}
                        </div>
                        <div></div>
                      </div>
                    </div>

                    <div className="flex justify-end mb-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveAsRoutine(workout);
                        }}
                        className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
                      >
                        <FaSave className="mr-2" />
                        <span>Save as Routine</span>
                      </button>
                    </div>

                    <h3 className="font-medium text-lg text-gray-800 dark:text-gray-200 mb-3">
                      Exercises
                    </h3>

                    {workout.exercises &&
                    Array.isArray(workout.exercises) &&
                    workout.exercises.length > 0 ? (
                      <div className="space-y-6">
                        {workout.exercises.map((exercise, eIndex) => (
                          <div
                            key={eIndex}
                            className="bg-gray-50 dark:bg-gray-700 p-4 rounded"
                          >
                            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                              {exercise.name}{" "}
                              {exercise.is_cardio ? "(Cardio)" : ""}
                            </h4>

                            <div className="overflow-x-auto">
                              <table className="min-w-full text-sm">
                                <thead>
                                  <tr className="border-b border-gray-200 dark:border-gray-600">
                                    <th className="text-left py-2 pr-4">Set</th>
                                    {exercise.is_cardio ? (
                                      <>
                                        <th className="text-left py-2 pr-4">
                                          Distance
                                        </th>
                                        <th className="text-left py-2 pr-4">
                                          Duration
                                        </th>
                                        <th className="text-left py-2 pr-4">
                                          Intensity
                                        </th>
                                      </>
                                    ) : (
                                      <>
                                        <th className="text-left py-2 pr-4">
                                          Weight (kg)
                                        </th>
                                        <th className="text-left py-2 pr-4">
                                          Reps
                                        </th>
                                      </>
                                    )}
                                    <th className="text-left py-2">Notes</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {exercise.sets &&
                                  Array.isArray(exercise.sets) ? (
                                    exercise.sets.map((set, sIndex) => (
                                      <tr
                                        key={sIndex}
                                        className="border-b border-gray-200 dark:border-gray-600"
                                      >
                                        <td className="py-2 pr-4">
                                          {sIndex + 1}
                                        </td>
                                        {exercise.is_cardio ? (
                                          <>
                                            <td className="py-2 pr-4">
                                              {set.distance
                                                ? `${set.distance} km`
                                                : "-"}
                                            </td>
                                            <td className="py-2 pr-4">
                                              {set.duration
                                                ? `${set.duration} min`
                                                : "-"}
                                            </td>
                                            <td className="py-2 pr-4">
                                              {set.intensity !== undefined
                                                ? getIntensityName(
                                                    set.intensity
                                                  )
                                                : "-"}
                                            </td>
                                          </>
                                        ) : (
                                          <>
                                            <td className="py-2 pr-4">
                                              {set.weight
                                                ? formatWeight(
                                                    set.weight,
                                                    workout.weight_unit || "kg"
                                                  )
                                                : "-"}
                                            </td>
                                            <td className="py-2 pr-4">
                                              {set.reps || "-"}
                                            </td>
                                          </>
                                        )}
                                        <td className="py-2 text-gray-600 dark:text-gray-400">
                                          {set.notes || "-"}
                                        </td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td
                                        colSpan="4"
                                        className="py-2 text-center text-gray-500"
                                      >
                                        No sets recorded for this exercise.
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        No exercises recorded for this workout.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showSaveRoutineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Save as Routine
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Save this workout as a reusable routine template. You can access
              and start this routine from the Routines page.
            </p>

            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Routine Name
              </label>
              <input
                type="text"
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white"
                placeholder="Enter routine name"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleSaveRoutine}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center"
                disabled={savingRoutine}
              >
                {savingRoutine ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Saving...
                  </>
                ) : (
                  "Save Routine"
                )}
              </button>
              <button
                onClick={() => setShowSaveRoutineModal(false)}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                disabled={savingRoutine}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4 text-red-600 dark:text-red-500">
              Delete Workout
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete this workout? This action cannot
              be undone.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={confirmDeleteWorkout}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setWorkoutToDelete(null);
                }}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkoutHistory;
