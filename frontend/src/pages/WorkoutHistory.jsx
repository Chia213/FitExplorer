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
  FaExclamationTriangle,
  FaCheckSquare,
} from "react-icons/fa";
import { Line } from "react-chartjs-2";
import { notifyRoutineCreated } from '../utils/notificationsHelpers';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
  const [showDeleteAllConfirmation, setShowDeleteAllConfirmation] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [weightUnit, setWeightUnit] = useState(() => {
    return localStorage.getItem("weightUnit") || "kg";
  });
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'calendar'
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [urlParams] = useState(new URLSearchParams(window.location.search));
  const dateFromUrl = urlParams.get('date');
  const navigate = useNavigate();
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);
  const [showDeleteSelectedConfirmation, setShowDeleteSelectedConfirmation] = useState(false);
  const [deletingSelected, setDeletingSelected] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        if (token) {
          await fetchWorkoutHistory(token);
        }
      } catch (error) {
        console.error("Error fetching workout history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // If we have a date from URL, set it as filter and expand those workouts
    if (dateFromUrl) {
      setFilterDate(dateFromUrl);
      
      // After data is loaded, expand workouts from this date
      const timer = setTimeout(() => {
        workoutHistory.forEach(workout => {
          if (workout.date === dateFromUrl) {
            setExpandedWorkouts(prev => ({
              ...prev,
              [workout.id]: true
            }));
          }
        });
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [navigate, dateFromUrl]);

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

  const saveWorkoutAsRoutine = async (workoutData, token) => {
    // First fetch all routines to check for duplicates
    const allRoutines = await fetch(`${API_BASE_URL}/routines`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!allRoutines.ok) {
      throw new Error("Failed to check existing routines");
    }

    const routinesData = await allRoutines.json();
    const existingRoutine = routinesData.find(r => r.name === workoutData.name);

    let shouldOverwrite = false;
    let routineId = null;

    if (existingRoutine) {
      // Routine exists
      routineId = existingRoutine.id;
      
      // Ask user if they want to overwrite
      shouldOverwrite = window.confirm(
        `A routine named "${workoutData.name}" already exists. Do you want to overwrite it?`
      );
      
      if (!shouldOverwrite) {
        return false; // User canceled the operation
      }
    }

    // Log the workout data to see its structure
    console.log("Workout data to save:", workoutData);
    
    // Make sure exercises is an array
    const exercises = Array.isArray(workoutData.exercises) ? workoutData.exercises : [];
    
    // Prepare the routine data - IMPORTANT: Match the structure expected by Routines.jsx
    const routineData = {
      name: workoutData.name,
      exercises: exercises.map(exercise => ({
        name: exercise.name,
        category: exercise.category || "Uncategorized",
        is_cardio: Boolean(exercise.is_cardio),
        initial_sets: exercise.sets?.length || 1,
        sets: exercise.sets?.map((set, index) => {
          const baseSet = {
            notes: set.notes || "",
            order: index,  // Keep the same order as in workout history
            // Set type flags
            is_warmup: !!set.is_warmup,
            is_drop_set: !!set.is_drop_set,
            is_superset: !!set.is_superset,
            is_amrap: !!set.is_amrap,
            is_restpause: !!set.is_restpause,
            is_pyramid: !!set.is_pyramid,
            is_giant: !!set.is_giant,
            // Additional set properties
            drop_number: set.drop_number || null,
            original_weight: set.original_weight || null,
            superset_with: set.superset_with !== undefined ? set.superset_with : null,
            rest_pauses: set.rest_pauses || null,
            pyramid_type: set.pyramid_type || null,
            pyramid_step: set.pyramid_step || null,
            giant_with: Array.isArray(set.giant_with) ? set.giant_with.map(item => String(item)) : null
          };

          if (exercise.is_cardio) {
            return {
              ...baseSet,
              distance: set.distance || null,
              duration: set.duration || null,
              intensity: set.intensity || ""
            };
          } else {
            return {
              ...baseSet,
              weight: set.weight || null,
              reps: set.reps || null
            };
          }
        }) || []
      }))
    };

    let response;
    
    if (shouldOverwrite && routineId) {
      // Update existing routine
      response = await fetch(`${API_BASE_URL}/routines/${routineId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(routineData)
      });
    } else {
      // Create new routine
      response = await fetch(`${API_BASE_URL}/routines`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(routineData)
      });
    }

    if (!response.ok) {
      throw new Error("Failed to save routine");
    }
    
    return { success: true, updated: shouldOverwrite };
  };

  const handleSaveAsRoutine = async (workout) => {
    try {
      const token = localStorage.getItem("access_token");
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

      const result = await saveWorkoutAsRoutine(workoutToSave, token);
      if (result && result.success) {
        alert(result.updated ? "Routine updated successfully!" : "Workout saved as routine successfully!");
        
        // Send notification for new routine or skip if it was just an update
        if (!result.updated) {
          try {
            console.log("Creating notification for new routine:", routineName);
            await notifyRoutineCreated(routineName);
          } catch (notificationError) {
            console.error("Error creating notification:", notificationError);
          }
        }
      }
    } catch (error) {
      console.error("Error saving routine:", error);
      alert(`Error saving routine: ${error.message}. Please try again.`);
    }
  };

  const handleSaveRoutine = async () => {
    if (!routineName.trim()) {
      alert("Please enter a routine name");
      return;
    }

    setSavingRoutine(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Prepare the workout data with the entered name
      const workoutToSave = {
        ...selectedWorkout,
        name: routineName
      };

      const result = await saveWorkoutAsRoutine(workoutToSave, token);
      if (result && result.success) {
        alert(result.updated ? "Routine updated successfully!" : "Routine saved successfully!");
        setShowSaveRoutineModal(false);
        
        // Send notification for new routine or skip if it was just an update
        if (!result.updated) {
          try {
            console.log("Creating notification for new routine:", routineName);
            await notifyRoutineCreated(routineName);
          } catch (notificationError) {
            console.error("Error creating notification:", notificationError);
          }
        }
      }
    } catch (error) {
      console.error("Error saving routine:", error);
      alert("Failed to save routine. Please try again.");
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
      const token = localStorage.getItem("access_token");
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
    return date.toLocaleDateString('en-GB', {
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
      labels: data.map((d) => d.date.toLocaleDateString('en-GB')),
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

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleDeleteAllWorkouts = () => {
    setShowDeleteAllConfirmation(true);
  };

  const confirmDeleteAllWorkouts = async () => {
    setDeletingAll(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/api/workouts-delete-all`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete all workouts");
      }

      const result = await response.json();
      console.log(result.message);
      
      // Clear the workout history
      setWorkoutHistory([]);
      setShowDeleteAllConfirmation(false);
      
      // Show success message
      setError(`Success: ${result.message}`);
      
      // Clear the success message after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    } catch (error) {
      console.error("Error deleting all workouts:", error);
      setError(`Failed to delete all workouts: ${error.message}`);
    } finally {
      setDeletingAll(false);
    }
  };

  const handleSelectWorkout = (workoutId) => {
    setSelectedWorkouts(prev => {
      if (prev.includes(workoutId)) {
        return prev.filter(id => id !== workoutId);
      } else {
        return [...prev, workoutId];
      }
    });
  };

  const handleSelectAllWorkouts = () => {
    if (selectedWorkouts.length === filteredWorkouts.length) {
      // If all are selected, unselect all
      setSelectedWorkouts([]);
    } else {
      // Otherwise select all filtered workouts
      setSelectedWorkouts(filteredWorkouts.map(workout => workout.id));
    }
  };

  const handleDeleteSelectedWorkouts = () => {
    if (selectedWorkouts.length === 0) {
      alert("Please select workouts to delete");
      return;
    }
    setShowDeleteSelectedConfirmation(true);
  };

  const confirmDeleteSelectedWorkouts = async () => {
    setDeletingSelected(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/api/workouts-delete-selected`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(selectedWorkouts)
      });

      if (!response.ok) {
        throw new Error("Failed to delete selected workouts");
      }

      const result = await response.json();
      console.log(result.message);
      
      // Remove deleted workouts from state
      setWorkoutHistory(prev => prev.filter(workout => !selectedWorkouts.includes(workout.id)));
      setSelectedWorkouts([]);
      setShowDeleteSelectedConfirmation(false);
      
      // Show success message
      setError(`Success: ${result.message}`);
      
      // Clear the success message after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    } catch (error) {
      console.error("Error deleting selected workouts:", error);
      setError(`Failed to delete selected workouts: ${error.message}`);
    } finally {
      setDeletingSelected(false);
    }
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
              View Calendar
            </button>
          </div>
        </div>
        
        {error && (
          <div className={`mb-4 p-4 rounded-lg ${error.includes("Success") ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"}`}>
            {error}
          </div>
        )}
        
        {/* Action Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
            <div className="flex space-x-2 items-center">
              <button
                onClick={handleSelectAllWorkouts}
                className="flex items-center text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-2 py-1 rounded"
              >
                <FaCheckSquare className="mr-1" />
                {selectedWorkouts.length === filteredWorkouts.length && filteredWorkouts.length > 0 
                  ? "Unselect All" 
                  : "Select All"}
              </button>
              
              <button
                onClick={handleDeleteSelectedWorkouts}
                disabled={selectedWorkouts.length === 0}
                className={`flex items-center text-sm ${
                  selectedWorkouts.length > 0
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                } px-2 py-1 rounded`}
              >
                <FaTrash className="mr-1" />
                Delete Selected ({selectedWorkouts.length})
              </button>
              
              <button
                onClick={handleDeleteAllWorkouts}
                className="flex items-center text-sm bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
              >
                <FaTrash className="mr-1" />
                Delete All
              </button>
              
              <button
                onClick={() => navigate('/personal-records')}
                className="flex items-center text-sm bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded ml-2"
              >
                <FaTrophy className="mr-1" />
                Personal Records
              </button>
            </div>
            
            <div className="flex items-center">
              <button
                onClick={toggleWeightUnit}
                className="flex items-center text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
              >
                <FaBalanceScale className="mr-1" />
                {weightUnit === "kg" ? "Switch to LBS" : "Switch to KG"}
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="mt-4 flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
            <div className="flex-1 flex items-center">
              <label htmlFor="search-query" className="mr-2 text-gray-700 dark:text-gray-300 text-sm">
                Search:
              </label>
              <div className="relative flex-1">
                <input
                  type="text"
                  id="search-query"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by workout name..."
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            
            <div className="flex items-center">
              <label htmlFor="filter-date" className="mr-2 text-gray-700 dark:text-gray-300 text-sm">
                Date:
              </label>
              <input
                type="date"
                id="filter-date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center">
              <label htmlFor="filter-exercise" className="mr-2 text-gray-700 dark:text-gray-300 text-sm">
                Exercise:
              </label>
              <select
                id="filter-exercise"
                value={filterExercise}
                onChange={(e) => setFilterExercise(e.target.value)}
                className="rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Exercises</option>
                {getAllExerciseNames().map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading workout history...
            </p>
          </div>
        ) : (
          <>
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
                    {new Date(currentMonth).toLocaleDateString("en-GB", {
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

            {viewMode === "list" && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                {filteredWorkouts.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    No workouts found matching your criteria.
                  </div>
                ) : (
                  <div>
                    {filteredWorkouts.map((workout) => (
                      <div
                        key={workout.id}
                        className="border-b dark:border-gray-700 last:border-b-0"
                      >
                        <div
                          className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                          onClick={() => toggleWorkoutExpansion(workout.id)}
                        >
                          <div className="flex items-center mr-2">
                            <input
                              type="checkbox"
                              checked={selectedWorkouts.includes(workout.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleSelectWorkout(workout.id);
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600 rounded"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {workout.name}
                              </h3>
                              {expandedWorkouts[workout.id] ? (
                                <FaChevronUp className="ml-2 text-gray-500 dark:text-gray-400" />
                              ) : (
                                <FaChevronDown className="ml-2 text-gray-500 dark:text-gray-400" />
                              )}
                            </div>
                            <div className="flex flex-wrap text-sm text-gray-600 dark:text-gray-300 mt-1">
                              <span className="flex items-center mr-4 mb-1">
                                <FaCalendarAlt className="mr-1" />
                                {formatDate(workout.date || workout.start_time)}
                              </span>
                              {workout.start_time && workout.end_time && (
                                <span className="flex items-center mr-4 mb-1">
                                  <FaClock className="mr-1" />
                                  {calculateDuration(
                                    workout.start_time,
                                    workout.end_time
                                  )}
                                </span>
                              )}
                              {workout.bodyweight && (
                                <span className="flex items-center mr-4 mb-1">
                                  <FaWeight className="mr-1" />
                                  {formatWeight(
                                    workout.bodyweight,
                                    workout.weight_unit
                                  )}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {workout.exercises && workout.exercises.length > 0 && (
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {workout.exercises.length} exercise
                                {workout.exercises.length > 1 ? "s" : ""}
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteWorkout(workout.id);
                              }}
                              className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                              title="Delete workout"
                            >
                              <FaTrash />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewWorkout(workout);
                              }}
                              className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400"
                              title="View workout"
                            >
                              <FaEye />
                            </button>
                          </div>
                        </div>
                        {expandedWorkouts[workout.id] && (
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
                                            <th className="text-left py-2 pr-4">Set Type</th>
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
                                                <td className="py-2 pr-4">
                                                  {set.is_warmup ? (
                                                    <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                                                      Warm-up
                                                    </span>
                                                  ) : set.is_drop_set ? (
                                                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                                      Drop Set {set.drop_number ? `#${set.drop_number}` : ""}
                                                      {set.original_weight ? ` (${formatWeight(set.original_weight, workout.weight_unit)})` : ""}
                                                    </span>
                                                  ) : set.is_superset ? (
                                                    <span className="px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                                                      Superset
                                                      {set.superset_with ? ` with ${set.superset_with}` : ""}
                                                    </span>
                                                  ) : set.is_amrap ? (
                                                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                                      AMRAP
                                                    </span>
                                                  ) : set.is_restpause ? (
                                                    <span className="px-2 py-1 rounded-full text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                                                      Rest-Pause
                                                      {set.rest_pauses ? ` (${set.rest_pauses})` : ""}
                                                    </span>
                                                  ) : set.is_pyramid ? (
                                                    <span className="px-2 py-1 rounded-full text-xs bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200">
                                                      Pyramid
                                                      {set.pyramid_type ? ` (${set.pyramid_type})` : ""}
                                                      {set.pyramid_step ? ` Step ${set.pyramid_step}` : ""}
                                                    </span>
                                                  ) : set.is_giant ? (
                                                    <span className="px-2 py-1 rounded-full text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                                                      Giant Set
                                                      {Array.isArray(set.giant_with) && set.giant_with.length > 0 
                                                        ? ` with ${set.giant_with.join(", ")}` 
                                                        : ""}
                                                    </span>
                                                  ) : (
                                                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                      Normal Set
                                                    </span>
                                                  )}
                                                </td>
                                                <td className="py-2 text-gray-600 dark:text-gray-400">
                                                  {set.notes || "-"}
                                                </td>
                                              </tr>
                                            ))
                                          ) : (
                                            <tr>
                                              <td
                                                colSpan="5"
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
                              <p className="text-gray-500 dark:text-gray-400">
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
            )}
          </>
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

      {showDeleteAllConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4 text-red-600 dark:text-red-500">
              Delete All Workouts
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete all workouts? This action cannot
              be undone.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={confirmDeleteAllWorkouts}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteAllConfirmation(false);
                }}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Selected Confirmation Modal */}
      {showDeleteSelectedConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center text-red-500 mb-4">
              <FaExclamationTriangle className="text-2xl mr-2" />
              <h3 className="text-xl font-bold">Delete Selected Workouts</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete {selectedWorkouts.length} selected workout{selectedWorkouts.length === 1 ? '' : 's'}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteSelectedConfirmation(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600"
                disabled={deletingSelected}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteSelectedWorkouts}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center"
                disabled={deletingSelected}
              >
                {deletingSelected ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash className="mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkoutHistory;
