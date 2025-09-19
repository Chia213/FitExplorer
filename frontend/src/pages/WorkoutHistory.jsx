import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import usePullToRefresh from "../hooks/usePullToRefresh";
import useHapticFeedback from "../hooks/useHapticFeedback";
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
  FaSyncAlt
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

  // Initialize haptic feedback
  const haptic = useHapticFeedback();
  
  // Initialize pull-to-refresh
  const { refreshing, PullToRefreshIndicator, pullToRefreshProps } = usePullToRefresh(async () => {
    // Trigger haptic feedback when refresh starts
    haptic.selection();
    
    // Create a small delay to make the refresh feel more natural
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Fetch fresh data
    const token = localStorage.getItem("access_token");
    if (token) {
      await fetchWorkoutHistory(token);
      
      // Success haptic feedback
      haptic.success();
    }
  });

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
    // Light haptic feedback for menu opening
    haptic.buttonPress();
    
    // Set the workout to be saved as a routine
    setSelectedWorkout(workout);
    
    // Use workout name if available, otherwise use first exercise name
    let defaultName = "";
    
    if (workout.name && workout.name.trim() !== "") {
      // Use the workout name if it exists
      defaultName = workout.name;
    } else if (
      workout.exercises &&
      workout.exercises.length > 0 &&
      workout.exercises[0].name
    ) {
      // Fallback to first exercise name
      defaultName = workout.exercises[0].name;
    } else {
      // Default fallback
      defaultName = "Workout";
    }
    
    setRoutineName(defaultName);
    setShowSaveRoutineModal(true);
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
        alert(result.updated ? "Routine updated successfully!" : "Routine saved as routine successfully!");
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
    // Use warning haptic pattern for destructive action
    haptic.warning();
    
    setWorkoutToDelete(workoutId);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteWorkout = async () => {
    try {
      // Use error haptic pattern for destructive action confirmation
      haptic.error();
      
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("You need to be logged in to delete workouts.");
        navigate("/login");
        return;
      }

      setDeletingAll(true);
      const response = await fetch(
        `${API_BASE_URL}/workouts/${workoutToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Filter out the deleted workout
        setWorkoutHistory(prev => prev.filter(workout => workout.id !== workoutToDelete));
        
        // Success haptic feedback on successful deletion
        haptic.success();
        
        setShowDeleteConfirmation(false);
        setWorkoutToDelete(null);
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete workout");
      }
    } catch (error) {
      console.error("Error deleting workout:", error);
      alert(`Error deleting workout: ${error.message}`);
    } finally {
      setDeletingAll(false);
    }
  };

  const toggleWorkoutExpansion = (workoutId) => {
    // Provide haptic feedback on expansion toggle
    haptic.selection();
    
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
      const workoutDateObj = new Date(workout.date || workout.start_time);
      const workoutDate = `${workoutDateObj.getFullYear()}-${String(workoutDateObj.getMonth() + 1).padStart(2, '0')}-${String(workoutDateObj.getDate()).padStart(2, '0')}`;
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
    try {
      // Use error haptic pattern for destructive action confirmation
      haptic.error();
      
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("You need to be logged in to delete workouts.");
        navigate("/login");
        return;
      }

      setDeletingAll(true);
      const response = await fetch(
        `${API_BASE_URL}/api/workouts-delete-all`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Clear all workouts
        setWorkoutHistory([]);
        
        // Success haptic feedback on successful deletion
        haptic.success();
        
        setShowDeleteAllConfirmation(false);
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete all workouts");
      }
    } catch (error) {
      console.error("Error deleting all workouts:", error);
      alert(`Error deleting all workouts: ${error.message}`);
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            Workout History
          </h1>
          <div className="flex space-x-1.5">
            <button
              onClick={() => setViewMode("list")}
              className={`px-2 py-1 rounded text-xs ${
                viewMode === "list"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-2 py-1 rounded text-xs ${
                viewMode === "calendar"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Calendar
            </button>
          </div>
        </div>
        
        {error && (
          <div className={`mb-4 p-4 rounded-lg ${error.includes("Success") ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"}`}>
            {error}
          </div>
        )}
        
        {/* Action Bar */}
        <div className="bg-card rounded-lg p-3 mb-4 shadow">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
            <div className="flex flex-wrap gap-1.5 items-center">
              <button
                onClick={handleSelectAllWorkouts}
                className="flex items-center text-xs bg-muted hover:bg-accent hover:text-accent-foreground text-foreground px-1.5 py-1 rounded"
              >
                <FaCheckSquare className="mr-1 text-xs" />
                {selectedWorkouts.length === filteredWorkouts.length && filteredWorkouts.length > 0 
                  ? "Unselect All" 
                  : "Select All"}
              </button>
              
              <button
                onClick={handleDeleteSelectedWorkouts}
                disabled={selectedWorkouts.length === 0}
                className={`flex items-center text-xs ${
                  selectedWorkouts.length > 0
                    ? "bg-destructive hover:bg-destructive/80 text-destructive-foreground"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                } px-1.5 py-1 rounded`}
              >
                <FaTrash className="mr-1 text-xs" />
                Del ({selectedWorkouts.length})
              </button>
              
              <button
                onClick={handleDeleteAllWorkouts}
                className="flex items-center text-xs bg-destructive hover:bg-destructive/80 text-destructive-foreground px-1.5 py-1 rounded"
              >
                <FaTrash className="mr-1 text-xs" />
                Del All
              </button>
              
              <button
                onClick={() => navigate('/personal-records')}
                className="flex items-center text-xs bg-accent hover:bg-accent/80 text-accent-foreground px-1.5 py-1 rounded"
              >
                <FaTrophy className="mr-1 text-xs" />
                Records
              </button>
            </div>
            
            <div className="flex items-center mt-2 md:mt-0">
              <button
                onClick={toggleWeightUnit}
                className="flex items-center text-xs bg-primary hover:bg-primary/80 text-primary-foreground px-2 py-1 rounded font-medium"
              >
                <FaBalanceScale className="mr-1 text-xs" />
                {weightUnit === "kg" ? "→ LBS" : "→ KG"}
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="mt-1.5 flex flex-col space-y-1">
            <div className="flex flex-col">
              <label htmlFor="search-query" className="text-foreground text-[10px] font-medium mb-0.5">
                Search:
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search-query"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search workouts..."
                  className="w-full rounded border border-border bg-background text-foreground px-3 py-1 text-[11px] focus:ring-primary focus:border-primary shadow-sm"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-1">
              <div className="flex flex-col">
                <label htmlFor="filter-date" className="text-foreground text-[10px] font-medium mb-0.5">
                  Date:
                </label>
                <input
                  type="date"
                  id="filter-date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full rounded border border-border bg-background text-foreground px-2 py-1 text-[11px] focus:ring-primary focus:border-primary shadow-sm"
                />
              </div>
              
              <div className="flex flex-col">
                <label htmlFor="filter-exercise" className="text-foreground text-[10px] font-medium mb-0.5">
                  Exercise:
                </label>
                <select
                  id="filter-exercise"
                  value={filterExercise}
                  onChange={(e) => setFilterExercise(e.target.value)}
                  className="w-full rounded border border-border bg-background text-foreground px-2 py-1 text-[11px] focus:ring-primary focus:border-primary shadow-sm appearance-none bg-no-repeat bg-right pr-7"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")' }}
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
        </div>
        
        {loading ? (
          <div className="text-center py-8 bg-card rounded-lg shadow">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">
              Loading workout history...
            </p>
          </div>
        ) : (
          <>
            {workoutStats && (
              <div className="bg-card rounded-lg shadow p-3 mb-4">
                <h2 className="text-sm font-semibold mb-2">Your Workout Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      Total Workouts
                    </p>
                    <p className="text-lg font-bold">
                      {workoutStats.totalWorkouts}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      This Month
                    </p>
                    <p className="text-lg font-bold">{workoutStats.thisMonth}</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/30 p-2 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      Avg Duration
                    </p>
                    <p className="text-lg font-bold">
                      {workoutStats.avgDuration} min
                    </p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      Favorite Exercise
                    </p>
                    <p className="text-sm font-bold truncate">
                      {workoutStats.mostFrequentExercise}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {viewMode === "calendar" && (
              <div className="bg-card rounded-lg shadow p-2 mb-4">
                <div className="mb-2 flex justify-between items-center">
                  <button
                    onClick={() => {
                      const newDate = new Date(currentMonth);
                      newDate.setMonth(newDate.getMonth() - 1);
                      setCurrentMonth(newDate);
                    }}
                    className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <FaChevronLeft className="text-xs" />
                  </button>

                  <h3 className="text-sm font-medium">
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
                    className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <FaChevronRight className="text-xs" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-0.5">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                    <div key={day} className="text-center font-medium p-0.5 text-[10px]">
                      {day}
                    </div>
                  ))}

                  {/* Generate calendar days */}
                  {generateCalendarDays().map((day, i) => (
                    <div
                      key={i}
                      className={`p-0.5 min-h-[40px] border rounded text-[10px] ${
                        day.isCurrentMonth
                          ? "border-border"
                          : "border-border bg-muted text-muted-foreground"
                      } ${day.isToday ? "ring-1 ring-blue-500" : ""}`}
                    >
                      <div className="text-right mb-0.5">{day.date.getDate()}</div>
                      <div className="flex flex-col gap-0.5">
                        {day.workouts.length > 0 ? (
                          day.workouts.map((workout, idx) => (
                            <div 
                              key={idx}
                              onClick={() => {
                                // Format date as YYYY-MM-DD for filter (avoid timezone issues)
                                const formattedDate = `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, '0')}-${String(day.date.getDate()).padStart(2, '0')}`;
                                setFilterDate(formattedDate);
                                // Clear other filters that might interfere
                                setFilterExercise("");
                                setSearchQuery("");
                                // Switch to list view and expand the workout
                                setViewMode("list");
                                // Expand the specific workout
                                setExpandedWorkouts(prev => ({
                                  ...prev,
                                  [workout.id]: true
                                }));
                                // Scroll to the workout after a short delay to ensure it's rendered
                                setTimeout(() => {
                                  const workoutElement = document.querySelector(`[data-workout-id="${workout.id}"]`);
                                  if (workoutElement) {
                                    workoutElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }
                                }, 100);
                              }}
                              className="text-[9px] p-0.5 rounded bg-blue-100 dark:bg-blue-900/30 cursor-pointer truncate hover:bg-blue-200 dark:hover:bg-blue-800/30"
                            >
                              {workout.name || (workout.exercises?.[0]?.name || "Workout")}
                            </div>
                          ))
                        ) : day.isCurrentMonth ? (
                          <div className="text-[9px] text-center text-gray-400">No workouts</div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewMode === "list" && (
              <div className="bg-card rounded-lg shadow overflow-hidden">
                {filteredWorkouts.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No workouts found matching your criteria.
                  </div>
                ) : (
                  <div>
                    {filteredWorkouts.map((workout) => (
                      <div
                        key={workout.id}
                        data-workout-id={workout.id}
                        className="border-b border-border last:border-b-0"
                      >
                        <div
                          className="p-3 cursor-pointer"
                          onClick={() => toggleWorkoutExpansion(workout.id)}
                        >
                          <div className="flex items-start">
                            <div className="flex items-center mr-2 mt-1">
                              <input
                                type="checkbox"
                                checked={selectedWorkouts.includes(workout.id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleSelectWorkout(workout.id);
                                }}
                                className="h-4 w-4 text-primary focus:ring-primary rounded"
                              />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="text-base font-semibold text-foreground truncate pr-2">
                                  {workout.name}
                                </h3>
                                <div className="flex flex-shrink-0 space-x-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteWorkout(workout.id);
                                    }}
                                    className="text-destructive hover:text-destructive/80 p-1.5 rounded-full bg-muted"
                                    title="Delete workout"
                                  >
                                    <FaTrash className="text-xs" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSaveAsRoutine(workout);
                                    }}
                                    className="text-primary hover:text-primary/80 p-1.5 rounded-full bg-muted"
                                    title="Save as Routine"
                                  >
                                    <FaSave className="text-xs" />
                                  </button>
                                </div>
                              </div>
                              <div className="flex flex-wrap text-xs text-muted-foreground mt-1">
                                <span className="flex items-center mr-2 mb-1">
                                  <FaCalendarAlt className="mr-1" />
                                  {formatDate(workout.date || workout.start_time)}
                                </span>
                                {workout.start_time && workout.end_time && (
                                  <span className="flex items-center mr-2 mb-1">
                                    <FaClock className="mr-1" />
                                    {calculateDuration(
                                      workout.start_time,
                                      workout.end_time
                                    )}
                                  </span>
                                )}
                                {workout.bodyweight && (
                                  <span className="flex items-center mr-2 mb-1">
                                    <FaWeight className="mr-1" />
                                    {formatWeight(
                                      workout.bodyweight,
                                      workout.weight_unit
                                    )}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-muted-foreground">
                                  {workout.exercises && workout.exercises.length > 0 
                                    ? `${workout.exercises.length} exercise${workout.exercises.length > 1 ? "s" : ""}`
                                    : "No exercises"}
                                </span>
                                {expandedWorkouts[workout.id] ? (
                                  <FaChevronUp className="text-muted-foreground" />
                                ) : (
                                  <FaChevronDown className="text-muted-foreground" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        {expandedWorkouts[workout.id] && (
                          <div className="p-3 border-t border-border text-sm">
                            {workout.notes && (
                              <div className="mb-3 bg-muted p-2 rounded">
                                <p className="text-muted-foreground text-xs">
                                  {workout.notes}
                                </p>
                              </div>
                            )}

                            <div className="text-xs text-muted-foreground mb-3">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <span className="font-medium">Started:</span>{" "}
                                  {formatTime(workout.start_time)}
                                </div>
                                <div>
                                  <span className="font-medium">Ended:</span>{" "}
                                  {workout.end_time
                                    ? formatTime(workout.end_time)
                                    : "N/A"}
                                </div>
                              </div>
                            </div>

                            <h3 className="font-medium text-base text-foreground mb-2">
                              Exercises
                            </h3>

                            {workout.exercises &&
                              Array.isArray(workout.exercises) &&
                              workout.exercises.length > 0 ? (
                              <div className="space-y-4">
                                {workout.exercises.map((exercise, eIndex) => (
                                  <div
                                    key={eIndex}
                                    className="bg-muted p-3 rounded"
                                  >
                                    <h4 className="font-medium text-foreground mb-2 text-sm">
                                      {exercise.name}{" "}
                                      {exercise.is_cardio ? "(Cardio)" : ""}
                                    </h4>

                                    <div className="overflow-x-auto -mx-3">
                                      <div className="inline-block min-w-full align-middle px-3">
                                        <table className="min-w-full divide-y divide-border text-xs">
                                          <thead className="bg-muted">
                                            <tr>
                                              <th scope="col" className="py-1 pl-1 pr-2 text-left font-medium text-muted-foreground tracking-wider">#</th>
                                              {exercise.is_cardio ? (
                                                <>
                                                  <th scope="col" className="py-1 px-2 text-left font-medium text-muted-foreground tracking-wider">Distance</th>
                                                  <th scope="col" className="py-1 px-2 text-left font-medium text-muted-foreground tracking-wider">Duration</th>
                                                  <th scope="col" className="py-1 px-2 text-left font-medium text-muted-foreground tracking-wider">Intensity</th>
                                                </>
                                              ) : (
                                                <>
                                                  <th scope="col" className="py-1 px-2 text-left font-medium text-muted-foreground tracking-wider">Weight</th>
                                                  <th scope="col" className="py-1 px-2 text-left font-medium text-muted-foreground tracking-wider">Reps</th>
                                                </>
                                              )}
                                              <th scope="col" className="py-1 px-2 text-left font-medium text-muted-foreground tracking-wider">Set Type</th>
                                              <th scope="col" className="py-1 px-2 text-left font-medium text-muted-foreground tracking-wider">Notes</th>
                                            </tr>
                                          </thead>
                                          <tbody className="bg-card divide-y divide-border">
                                            {exercise.sets &&
                                            Array.isArray(exercise.sets) ? (
                                              exercise.sets.map((set, sIndex) => (
                                                <tr
                                                  key={sIndex}
                                                  className={sIndex % 2 === 0 ? "bg-card" : "bg-muted"}
                                                >
                                                  <td className="py-1 pl-1 pr-2 whitespace-nowrap">{sIndex + 1}</td>
                                                  {exercise.is_cardio ? (
                                                    <>
                                                      <td className="py-1 px-2 whitespace-nowrap">
                                                        {set.distance
                                                          ? `${set.distance} km`
                                                          : "-"}
                                                      </td>
                                                      <td className="py-1 px-2 whitespace-nowrap">
                                                        {set.duration
                                                          ? `${set.duration} min`
                                                          : "-"}
                                                      </td>
                                                      <td className="py-1 px-2 whitespace-nowrap">
                                                        {set.intensity !== undefined
                                                          ? getIntensityName(
                                                              set.intensity
                                                            )
                                                          : "-"}
                                                      </td>
                                                    </>
                                                  ) : (
                                                    <>
                                                      <td className="py-1 px-2 whitespace-nowrap">
                                                        {set.weight
                                                          ? formatWeight(
                                                              set.weight,
                                                              workout.weight_unit || "kg"
                                                            )
                                                          : "-"}
                                                      </td>
                                                      <td className="py-1 px-2 whitespace-nowrap">
                                                        {set.reps || "-"}
                                                      </td>
                                                    </>
                                                  )}
                                                  <td className="py-1 px-2 whitespace-nowrap">
                                                    {set.is_warmup ? (
                                                      <span className="inline-flex px-1 text-[10px] rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                                                        Warm
                                                      </span>
                                                    ) : set.is_drop_set ? (
                                                      <span className="inline-flex px-1 text-[10px] rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                                        Drop
                                                      </span>
                                                    ) : set.is_superset ? (
                                                      <span className="inline-flex px-1 text-[10px] rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                                                        Super
                                                      </span>
                                                    ) : set.is_amrap ? (
                                                      <span className="inline-flex px-1 text-[10px] rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                                        AMRAP
                                                      </span>
                                                    ) : set.is_restpause ? (
                                                      <span className="inline-flex px-1 text-[10px] rounded-full bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                                                        Rest-P
                                                      </span>
                                                    ) : set.is_pyramid ? (
                                                      <span className="inline-flex px-1 text-[10px] rounded-full bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200">
                                                        Pyra
                                                      </span>
                                                    ) : set.is_giant ? (
                                                      <span className="inline-flex px-1 text-[10px] rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                                                        Giant
                                                      </span>
                                                    ) : (
                                                      <span className="inline-flex px-1 text-[10px] rounded-full bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                                                        Normal
                                                      </span>
                                                    )}
                                                  </td>
                                                  <td className="py-1 px-2 text-xs max-w-[150px] truncate">
                                                    {set.notes || "-"}
                                                  </td>
                                                </tr>
                                              ))
                                            ) : (
                                              <tr>
                                                  <td
                                                  colSpan="5"
                                                  className="py-2 text-center text-muted-foreground"
                                                >
                                                  No sets recorded
                                                </td>
                                              </tr>
                                            )}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted-foreground text-xs">
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
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-4">
            <h2 className="text-lg font-bold mb-3 text-foreground">
              Save as Routine
            </h2>
            <p className="text-muted-foreground mb-3 text-sm">
              Save this workout as a reusable routine template. You can access
              and start this routine from the Routines page.
            </p>

            <div className="mb-3">
              <label className="block text-foreground mb-1 text-sm">
                Routine Name
              </label>
              <input
                type="text"
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                className="w-full bg-muted p-2 rounded-lg text-foreground text-sm"
                placeholder="Enter routine name"
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleSaveRoutine}
                className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground py-2 rounded-lg flex items-center justify-center text-sm"
                disabled={savingRoutine}
              >
                {savingRoutine ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                    Saving...
                  </>
                ) : (
                  "Save Routine"
                )}
              </button>
              <button
                onClick={() => setShowSaveRoutineModal(false)}
                className="flex-1 bg-muted text-foreground py-2 rounded-lg hover:bg-accent hover:text-accent-foreground text-sm"
                disabled={savingRoutine}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteAllConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-4">
            <h2 className="text-lg font-bold mb-3 text-destructive">
              Delete All Workouts
            </h2>
            <p className="text-muted-foreground mb-3 text-sm">
              Are you sure you want to delete all workouts? This action cannot
              be undone.
            </p>

            <div className="flex space-x-2">
              <button
                onClick={confirmDeleteAllWorkouts}
                className="flex-1 bg-destructive hover:bg-destructive/80 text-destructive-foreground py-2 rounded-lg text-sm"
              >
                Delete All
              </button>
              <button
                onClick={() => {
                  setShowDeleteAllConfirmation(false);
                }}
                className="flex-1 bg-muted text-foreground py-2 rounded-lg hover:bg-accent hover:text-accent-foreground text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Workout Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-md w-full">
            <div className="flex items-center text-red-500 mb-3">
              <FaExclamationTriangle className="text-xl mr-2" />
              <h3 className="text-lg font-bold">Delete Workout</h3>
            </div>
            <p className="text-foreground mb-4 text-sm">
              Are you sure you want to delete this workout? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setWorkoutToDelete(null);
                }}
                className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-accent hover:text-accent-foreground text-sm"
                disabled={deletingAll}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteWorkout}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/80 flex items-center text-sm"
                disabled={deletingAll}
              >
                {deletingAll ? (
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

      {/* Delete Selected Confirmation Modal */}
      {showDeleteSelectedConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-md w-full">
            <div className="flex items-center text-red-500 mb-3">
              <FaExclamationTriangle className="text-xl mr-2" />
              <h3 className="text-lg font-bold">Delete Selected</h3>
            </div>
            <p className="text-foreground mb-4 text-sm">
              Are you sure you want to delete {selectedWorkouts.length} selected workout{selectedWorkouts.length === 1 ? '' : 's'}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteSelectedConfirmation(false)}
                className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-accent hover:text-accent-foreground text-sm"
                disabled={deletingSelected}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteSelectedWorkouts}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/80 flex items-center text-sm"
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
