import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTrash,
  FaPlus,
  FaArrowUp,
  FaArrowDown,
  FaListAlt,
  FaHistory,
  FaChevronUp,
  FaChevronDown,
  FaSave,
  FaPlayCircle,
  FaBook,
  FaTimes,
  FaBalanceScale,
  FaArrowLeft,
  FaClock,
  FaWeight,
} from "react-icons/fa";
import AddExercise from "./AddExercise";
import { LuCalendarClock } from "react-icons/lu";
import { 
  notifyWorkoutCompleted, 
  notifyPersonalRecord,
  notifyWorkoutStreak,
  notifyStreakBroken 
} from '../utils/notificationsHelpers';

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

const WorkoutLog = () => {
  const [workoutName, setWorkoutName] = useState("");
  const [startTime, setStartTime] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [endTime, setEndTime] = useState("");
  const [bodyweight, setBodyweight] = useState("");
  const [notes, setNotes] = useState("");
  const [workoutExercises, setWorkoutExercises] = useState([]);
  const [showExerciseSelection, setShowExerciseSelection] = useState(false);
  const [collapsedExercises, setCollapsedExercises] = useState({});
  const [showSaveRoutineModal, setShowSaveRoutineModal] = useState(false);
  const [routineName, setRoutineName] = useState("");
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [showRoutinesSelector, setShowRoutinesSelector] = useState(false);
  const [loadingRoutines, setLoadingRoutines] = useState(false);
  const [weightUnit, setWeightUnit] = useState("kg");
  const [showHistory, setShowHistory] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [restTime, setRestTime] = useState(60); // Default 60 seconds
  const [isResting, setIsResting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showDropSet, setShowDropSet] = useState(false);
  const [dropSetExercise, setDropSetExercise] = useState(null);
  const [dropSetWeight, setDropSetWeight] = useState("");
  const [dropSetReps, setDropSetReps] = useState("");
  const [dropSetPercentage, setDropSetPercentage] = useState(20); // Default 20% reduction
  const [dropSetCount, setDropSetCount] = useState(1); // Number of drops to perform
  const [originalWeight, setOriginalWeight] = useState(null);
  const [timerInterval, setTimerInterval] = useState(null);
  const [savingRoutine, setSavingRoutine] = useState(false);

  const toggleWeightUnit = () => {
    const newUnit = weightUnit === "kg" ? "lbs" : "kg";
    setWeightUnit(newUnit);
    localStorage.setItem("weightUnit", newUnit);

    // Convert existing bodyweight
    if (bodyweight) {
      const numValue = parseFloat(bodyweight);
      if (!isNaN(numValue)) {
        const convertedValue =
          newUnit === "kg"
            ? (numValue / 2.20462).toFixed(1) // lbs to kg
            : (numValue * 2.20462).toFixed(1); // kg to lbs
        setBodyweight(convertedValue);
      }
    }

    // Convert all exercise weights
    setWorkoutExercises((prev) =>
      prev.map((exercise) => {
        if (!exercise.is_cardio) {
          return {
            ...exercise,
            sets: exercise.sets.map((set) => {
              if (set.weight) {
                const weight = parseFloat(set.weight);
                if (!isNaN(weight)) {
                  return {
                    ...set,
                    weight:
                      newUnit === "kg"
                        ? (weight / 2.20462).toFixed(1) // lbs to kg
                        : (weight * 2.20462).toFixed(1), // kg to lbs
                  };
                }
              }
              return set;
            }),
          };
        }
        return exercise;
      })
    );
  };

  const toggleExerciseCollapse = (exerciseIndex) => {
    setCollapsedExercises((prev) => ({
      ...prev,
      [exerciseIndex]: !prev[exerciseIndex],
    }));
  };

  const prepareWorkoutForSaving = (workout) => {
    // If the current unit is lbs, convert weights back to kg for storage
    if (weightUnit === "lbs") {
      // Convert bodyweight and exercise weights to kg
      // (code shown in the artifact)
    }
    return workout;
  };

  const handleMoveExercise = (exerciseIndex, direction) => {
    if (
      (direction === "up" && exerciseIndex === 0) ||
      (direction === "down" && exerciseIndex === workoutExercises.length - 1)
    ) {
      return;
    }

    const newExercises = [...workoutExercises];
    const targetIndex =
      direction === "up" ? exerciseIndex - 1 : exerciseIndex + 1;

    [newExercises[exerciseIndex], newExercises[targetIndex]] = [
      newExercises[targetIndex],
      newExercises[exerciseIndex],
    ];

    setWorkoutExercises(newExercises);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchWorkoutHistory(token);
    fetchRoutines(token);

    // Check for preloaded exercises from a routine
    const preloadedExercises = localStorage.getItem(
      "preloadedWorkoutExercises"
    );
    const preloadedWorkoutName = localStorage.getItem("preloadedWorkoutName");

    if (preloadedExercises) {
      try {
        const parsedExercises = JSON.parse(preloadedExercises);
        setWorkoutExercises(parsedExercises);

        if (preloadedWorkoutName) {
          setWorkoutName(preloadedWorkoutName);
        }

        // Clear the preloaded data
        localStorage.removeItem("preloadedWorkoutExercises");
        localStorage.removeItem("preloadedWorkoutName");
      } catch (error) {}
    }
  }, [navigate]);

  useEffect(() => {
    if (workoutHistory.length > 0 && bodyweight === undefined) {
      const recentWorkoutWithBodyweight = workoutHistory.find(
        (workout) => workout.bodyweight && workout.bodyweight !== null
      );

      if (
        recentWorkoutWithBodyweight &&
        recentWorkoutWithBodyweight.bodyweight
      ) {
        setBodyweight(recentWorkoutWithBodyweight.bodyweight.toString());
      }
    }
  }, [workoutHistory, bodyweight]);

  async function fetchWorkoutHistory(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/workouts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch workouts");
      const data = await response.json();
      setWorkoutHistory(data);
    } catch (error) {
      console.error("Error fetching workout history:", error);
    }
  }

  async function fetchRoutines(token) {
    setLoadingRoutines(true);
    try {
      const response = await fetch(`${API_BASE_URL}/routines`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch routines");
      const data = await response.json();
      setRoutines(data);
    } catch (error) {
      console.error("Error fetching routines:", error);
    } finally {
      setLoadingRoutines(false);
    }
  }

  const handleSelectRoutine = (routine) => {
    if (!routine || !routine.workout || !routine.workout.exercises) {
      alert("This routine doesn't have any exercises.");
      return;
    }

    // Confirm with user if they're about to replace existing exercises
    if (workoutExercises.length > 0) {
      if (
        !window.confirm("This will replace your current workout. Continue?")
      ) {
        return;
      }
    }

    // Set the workout name
    setWorkoutName(routine.name);

    // Convert routine exercises to workout exercises
    const newExercises = routine.workout.exercises.map((exercise) => {
      // Ensure is_cardio is properly set as a boolean
      const isCardio = Boolean(exercise.is_cardio);
      const initialSets = exercise.initial_sets || exercise.sets?.length || 1;

      // If the exercise has existing sets, use those
      if (Array.isArray(exercise.sets) && exercise.sets.length > 0) {
        return {
          name: exercise.name,
          category: exercise.category || "Uncategorized",
          is_cardio: isCardio,
          sets: exercise.sets.map((set) => {
            if (isCardio) {
              return {
                distance: set.distance || "",
                duration: set.duration || "",
                intensity: set.intensity || "",
                notes: set.notes || "",
              };
            } else {
              return {
                weight: set.weight || "",
                reps: set.reps || "",
                notes: set.notes || "",
              };
            }
          }),
        };
      }

      // Otherwise create new empty sets
      if (isCardio) {
        const cardioSets = Array(initialSets)
          .fill()
          .map(() => ({
            distance: "",
            duration: "",
            intensity: "",
            notes: "",
          }));

        return {
          name: exercise.name,
          category: exercise.category || "Uncategorized",
          is_cardio: true,
          sets: cardioSets,
        };
      } else {
        const sets = Array(initialSets)
          .fill()
          .map(() => ({
            weight: "",
            reps: "",
            notes: "",
          }));

        return {
          name: exercise.name,
          category: exercise.category || "Uncategorized",
          is_cardio: false,
          sets: sets,
        };
      }
    });

    setWorkoutExercises(newExercises);
    setShowRoutinesSelector(false);
  };

  const checkForPersonalRecords = async (workout) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/personal-records`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return;

      const personalRecords = await response.json();

      // Check each exercise in the workout for new records
      for (const exercise of workout.exercises) {
        if (!exercise.is_cardio) {
          // For strength exercises, check each set
          for (const set of exercise.sets) {
            if (set.weight && set.reps) {
              const currentPR = personalRecords[exercise.name];
              if (!currentPR || set.weight > currentPR.weight) {
                // New personal record!
                await notifyPersonalRecord(
                  exercise.name,
                  set.weight,
                  workout.weight_unit
                );
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error checking personal records:", error);
    }
  };

  const checkWorkoutStreak = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/workout-streak`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return;

      const streakData = await response.json();
      
      // Check for streak milestones (3, 7, 14, 30 days)
      if (streakData.streak > 0) {
        if ([3, 7, 14, 30].includes(streakData.streak)) {
          await notifyWorkoutStreak(streakData.streak);
        }
      } else if (streakData.last_workout) {
        // Check if streak was broken
        const lastWorkoutDate = new Date(streakData.last_workout);
        const today = new Date();
        const daysSinceLastWorkout = Math.floor(
          (today - lastWorkoutDate) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceLastWorkout > 1) {
          await notifyStreakBroken();
        }
      }
    } catch (error) {
      console.error("Error checking workout streak:", error);
    }
  };

  const validateExerciseSets = (exercise) => {
    if (exercise.is_cardio) {
      // For cardio exercises, check if either distance or duration is filled
      return exercise.sets.every(set => 
        (set.distance && set.distance.trim() !== "") || 
        (set.duration && set.duration.trim() !== "")
      );
    } else {
      // For strength exercises, check if both weight and reps are filled
      return exercise.sets.every(set => 
        set.weight && set.weight.trim() !== "" && 
        set.reps && set.reps.trim() !== ""
      );
    }
  };

  const handleFinishWorkout = async () => {
    if (!workoutName.trim()) {
      alert("Please enter a workout name");
      return;
    }

    if (workoutExercises.length === 0) {
      alert("Please add at least one exercise");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Set end time if not already set
      if (!endTime) {
        setEndTime(new Date().toISOString().slice(0, 16));
      }

      // Prepare the workout data
      const workoutData = {
        name: workoutName,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime || new Date()).toISOString(),
        bodyweight: bodyweight ? parseFloat(bodyweight) : null,
        notes: notes,
        exercises: workoutExercises.map(exercise => ({
          name: exercise.name,
          category: exercise.category || "Uncategorized",
          is_cardio: exercise.is_cardio,
          sets: exercise.sets.map(set => ({
            ...set,
            weight: set.weight ? parseFloat(set.weight) : null,
            reps: set.reps ? parseInt(set.reps) : null,
            distance: set.distance ? parseFloat(set.distance) : null,
            duration: set.duration ? parseInt(set.duration) : null
          }))
        }))
      };

      // Send the request to create a workout
      const response = await fetch(`${API_BASE_URL}/workouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(workoutData)
      });

      if (!response.ok) {
        throw new Error("Failed to save workout");
      }

      // Show success message and reset form
      alert("Workout saved successfully!");
      notifyWorkoutCompleted();
      
      // Reset the form
      setWorkoutName("");
      setStartTime(new Date().toISOString().slice(0, 16));
      setEndTime("");
      setNotes("");
      setWorkoutExercises([]);
      
      // Refresh workout history
      fetchWorkoutHistory(token);
      
      // Navigate to workout history
      navigate("/workout-history");
    } catch (error) {
      console.error("Error saving workout:", error);
      alert("Failed to save workout. Please try again.");
    }
  };

  const handleSaveAsRoutine = () => {
    if (!workoutName.trim()) {
      alert("Please enter a workout name before saving as a routine.");
      return;
    }

    if (!workoutExercises.length) {
      alert("Please add at least one exercise before saving as a routine.");
      return;
    }

    setRoutineName(workoutName);
    setShowSaveRoutineModal(true);
  };

  const handleSaveRoutine = async () => {
    if (!routineName.trim()) {
      alert("Please enter a routine name");
      return;
    }

    setSavingRoutine(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Properly format the exercises for saving as a routine
      const formattedExercises = workoutExercises.map(exercise => ({
        name: exercise.name,
        category: exercise.category || "Uncategorized",
        is_cardio: Boolean(exercise.is_cardio),
        initial_sets: exercise.sets?.length || 1,
        sets: exercise.sets?.map(set => {
          if (exercise.is_cardio) {
            return {
              distance: set.distance || null,
              duration: set.duration || null,
              intensity: set.intensity || "",
              notes: set.notes || ""
            };
          } else {
            return {
              weight: set.weight || null,
              reps: set.reps || null,
              notes: set.notes || ""
            };
          }
        }) || []
      }));

      // Create the routine data
      const routineData = {
        name: routineName,
        exercises: formattedExercises
      };

      console.log("Saving routine data:", routineData);

      // Check for duplicate routine names
      const routinesResponse = await fetch(`${API_BASE_URL}/routines`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!routinesResponse.ok) {
        throw new Error("Failed to check existing routines");
      }
      
      const existingRoutines = await routinesResponse.json();
      const duplicateRoutine = existingRoutines.find(r => r.name === routineName);
      
      let response;
      
      if (duplicateRoutine) {
        // Ask user if they want to overwrite
        const shouldOverwrite = window.confirm(
          `A routine named "${routineName}" already exists. Do you want to overwrite it?`
        );
        
        if (!shouldOverwrite) {
          setSavingRoutine(false);
          return;
        }
        
        // Update the existing routine
        response = await fetch(`${API_BASE_URL}/routines/${duplicateRoutine.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(routineData)
        });
      } else {
        // Create a new routine
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

      setShowSaveRoutineModal(false);
      setRoutineName("");
      alert("Workout saved as routine successfully!");
    } catch (error) {
      console.error("Error saving routine:", error);
      alert("Failed to save routine. Please try again.");
    } finally {
      setSavingRoutine(false);
    }
  };

  const handleAddExercise = (exercise) => {
    const initialSets = exercise.initialSets || 1;

    // Auto-collapse all existing exercises when adding a new one
    const allCollapsed = {};
    workoutExercises.forEach((_, index) => {
      allCollapsed[index] = true;
    });
    setCollapsedExercises(allCollapsed);

    if (exercise.is_cardio) {
      const emptyCardioSets = Array(initialSets)
        .fill()
        .map(() => ({
          distance: "",
          duration: "",
          intensity: "",
          notes: "",
        }));

      setWorkoutExercises([
        ...workoutExercises,
        {
          ...exercise,
          sets: emptyCardioSets,
          is_cardio: true,
        },
      ]);
    } else {
      const emptySets = Array(initialSets)
        .fill()
        .map(() => ({
          weight: "",
          reps: "",
          notes: "",
        }));

      setWorkoutExercises([
        ...workoutExercises,
        { ...exercise, sets: emptySets, is_cardio: false },
      ]);
    }

    setShowExerciseSelection(false);
  };

  const handleDeleteExercise = (exerciseIndex) => {
    setWorkoutExercises(
      workoutExercises.filter((_, index) => index !== exerciseIndex)
    );

    setCollapsedExercises((prev) => {
      const updated = { ...prev };
      delete updated[exerciseIndex];
      return updated;
    });
  };

  const handleAddSet = (exerciseIndex) => {
    setWorkoutExercises((prev) =>
      prev.map((exercise, index) => {
        if (index === exerciseIndex) {
          const newSet = exercise.is_cardio
            ? { distance: "", duration: "", intensity: "", notes: "", is_warmup: false }
            : { weight: "", reps: "", notes: "", is_warmup: false };

          return {
            ...exercise,
            sets: [...exercise.sets, newSet],
          };
        }
        return exercise;
      })
    );
  };

  const handleEditSet = (exerciseIndex, setIndex, field, value) => {
    setWorkoutExercises((prev) =>
      prev.map((exercise, eIndex) =>
        eIndex === exerciseIndex
          ? {
              ...exercise,
              sets: exercise.sets.map((set, sIndex) =>
                sIndex === setIndex ? { ...set, [field]: value } : set
              ),
            }
          : exercise
      )
    );
  };

  const handleDeleteSet = (exerciseIndex, setIndex) => {
    setWorkoutExercises((prev) =>
      prev.map((exercise, eIndex) =>
        eIndex === exerciseIndex
          ? {
              ...exercise,
              sets: exercise.sets.filter((_, sIndex) => sIndex !== setIndex),
            }
          : exercise
      )
    );
  };

  // Load workout preferences from backend
  useEffect(() => {
    const loadWorkoutPreferences = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/workout-preferences`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) return;

        const preferences = await response.json();
        if (preferences.last_bodyweight) setBodyweight(preferences.last_bodyweight.toString());
        if (preferences.last_weight_unit) setWeightUnit(preferences.last_weight_unit);
        if (preferences.last_exercises) setWorkoutExercises(preferences.last_exercises);
      } catch (error) {
        console.error("Error loading workout preferences:", error);
      }
    };

    loadWorkoutPreferences();
  }, []);

  // Save workout preferences to backend
  const saveWorkoutPreferences = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const preferences = {
        last_bodyweight: bodyweight ? parseFloat(bodyweight) : null,
        last_weight_unit: weightUnit,
        last_exercises: workoutExercises,
      };

      await fetch(`${API_BASE_URL}/workout-preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(preferences),
      });
    } catch (error) {
      console.error("Error saving workout preferences:", error);
    }
  };

  // Save preferences whenever relevant data changes
  useEffect(() => {
    saveWorkoutPreferences();
  }, [bodyweight, weightUnit, workoutExercises]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  const handleStartRestTimer = (exercise) => {
    setCurrentExercise(exercise);
    setShowRestTimer(true);
    setTimeLeft(restTime);
    setIsResting(false);
  };

  const handleRestTimerChange = (e) => {
    const newTime = parseInt(e.target.value);
    if (!isNaN(newTime) && newTime > 0) {
      setRestTime(newTime);
      setTimeLeft(newTime);
    }
  };

  const startRestTimer = () => {
    // Clear any existing interval
    if (timerInterval) {
      clearInterval(timerInterval);
    }

    setIsResting(true);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsResting(false);
          setTimerInterval(null);
          // Play sound
          new Audio('/timer-done.mp3').play().catch(() => {});
          // Auto close timer and update workout time
          setShowRestTimer(false);
          // If no end time is set, set it to current time
          if (!endTime) {
            setEndTime(new Date().toISOString().slice(0, 16));
          }
          return restTime;
        }
        return prev - 1;
      });
    }, 1000);
    setTimerInterval(interval);
  };

  const pauseRestTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setIsResting(false);
  };

  const resetRestTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setTimeLeft(restTime);
    setIsResting(false);
  };

  const closeRestTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setShowRestTimer(false);
    setIsResting(false);
    setTimeLeft(restTime);
  };

  const handleAddDropSet = (exercise) => {
    // Get the last set's weight as the starting point
    const lastSet = exercise.sets[exercise.sets.length - 1];
    if (lastSet && lastSet.weight) {
      setOriginalWeight(lastSet.weight);
      setDropSetWeight(lastSet.weight);
    }
    setDropSetExercise(exercise);
    setShowDropSet(true);
  };

  const calculateNextWeight = (currentWeight, percentage) => {
    const reduction = (currentWeight * percentage) / 100;
    return (currentWeight - reduction).toFixed(1);
  };

  const handleSaveDropSet = () => {
    if (!dropSetExercise || !originalWeight) return;

    // Validate that reps are filled
    if (!dropSetReps || dropSetReps.trim() === "") {
      alert("Please enter the number of reps for the drop sets.");
      return;
    }

    const newSets = [];
    let currentWeight = parseFloat(originalWeight);

    // Create all drop sets at once
    for (let i = 0; i < dropSetCount; i++) {
      currentWeight = calculateNextWeight(currentWeight, dropSetPercentage);
      newSets.push({
        weight: currentWeight,
        reps: dropSetReps,
        notes: `Drop Set ${i + 1} (${dropSetPercentage}% reduction)`,
        is_drop_set: true,
        original_weight: originalWeight,
        drop_number: i + 1,
      });
    }

    setWorkoutExercises((prev) =>
      prev.map((ex) => {
        if (ex === dropSetExercise) {
          return {
            ...ex,
            sets: [...ex.sets, ...newSets],
          };
        }
        return ex;
      })
    );

    setShowDropSet(false);
    setDropSetExercise(null);
    setDropSetWeight("");
    setDropSetReps("");
    setOriginalWeight(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-lg p-4 flex justify-between items-center">
        <input
          type="text"
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
          placeholder="What are we training today?"
          className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold text-lg px-3 py-2 rounded-lg flex-grow mr-2"
        />
        <div className="flex space-x-2">
          <button
            onClick={() => setShowRoutinesSelector(true)}
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-400"
            title="Select Routine"
          >
            <LuCalendarClock className="text-xl" />
          </button>
          <button
            onClick={() => navigate("/workout-history")}
            className="bg-teal-500 text-white p-2 rounded-lg hover:bg-teal-400"
            title="View Workout History"
          >
            <FaHistory className="text-xl" />
          </button>
        </div>
      </div>

      <div className="w-full max-w-lg bg-white dark:bg-gray-800 p-4 rounded-lg mt-4 space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-gray-700 dark:text-gray-300">Start Time</p>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="bg-gray-200 dark:bg-gray-600 p-2 rounded-lg"
          />
        </div>

        <div className="flex justify-between items-center">
          <p className="text-gray-700 dark:text-gray-300">End Time</p>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="bg-gray-200 dark:bg-gray-600 p-2 rounded-lg"
          />
        </div>

        <div className="flex justify-between items-center">
          <p className="text-gray-700 dark:text-gray-300">
            Bodyweight ({weightUnit})
          </p>
          <input
            type="number"
            value={bodyweight}
            onChange={(e) => setBodyweight(e.target.value)}
            className="bg-gray-200 dark:bg-gray-600 p-2 rounded-lg"
          />
        </div>

        <div className="flex justify-between items-center">
          <p className="text-gray-700 dark:text-gray-300">Weight Unit</p>
          <button
            onClick={toggleWeightUnit}
            className="flex items-center bg-gray-200 dark:bg-gray-600 px-3 py-2 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            <FaBalanceScale className="mr-2" />
            <span>{weightUnit.toUpperCase()}</span>
          </button>
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="bg-gray-200 dark:bg-gray-600 p-2 rounded-lg w-full"
          placeholder="Add any notes..."
        ></textarea>
      </div>

      <button
        onClick={() => setShowExerciseSelection(true)}
        className="w-full max-w-lg text-white font-semibold text-lg p-4 mt-6 bg-teal-500 hover:bg-teal-400 rounded-lg"
      >
        Add Exercise
      </button>

      {workoutExercises.map((exercise, exerciseIndex) => (
        <div
          key={exerciseIndex}
          className="bg-white dark:bg-gray-700 p-4 rounded-lg mt-4 w-full max-w-lg"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h3 className="text-black dark:text-white font-semibold">
                {exercise.name}
              </h3>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                {exercise.sets.length}{" "}
                {exercise.sets.length === 1 ? "set" : "sets"}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1">
                <button
                  onClick={() => handleMoveExercise(exerciseIndex, "up")}
                  disabled={exerciseIndex === 0}
                  className={`text-teal-500 hover:text-teal-400 ${
                    exerciseIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <FaArrowUp />
                </button>
                <button
                  onClick={() => handleMoveExercise(exerciseIndex, "down")}
                  disabled={exerciseIndex === workoutExercises.length - 1}
                  className={`text-teal-500 hover:text-teal-400 ${
                    exerciseIndex === workoutExercises.length - 1
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <FaArrowDown />
                </button>
              </div>

              <button
                onClick={() => toggleExerciseCollapse(exerciseIndex)}
                className="text-gray-500 hover:text-gray-400"
              >
                {collapsedExercises[exerciseIndex] ? (
                  <FaChevronDown />
                ) : (
                  <FaChevronUp />
                )}
              </button>

              <button
                onClick={() => handleDeleteExercise(exerciseIndex)}
                className="text-red-400 hover:text-red-300"
              >
                <FaTrash />
              </button>

              <button
                onClick={() => handleStartRestTimer(exercise)}
                className="text-teal-500 hover:text-teal-400"
                title="Start Rest Timer"
              >
                <FaClock />
              </button>

              {!exercise.is_cardio && (
                <button
                  onClick={() => handleAddDropSet(exercise)}
                  className="text-blue-500 hover:text-blue-400"
                  title="Add Drop Set"
                >
                  <FaWeight />
                </button>
              )}
            </div>
          </div>

          {!collapsedExercises[exerciseIndex] && (
            <>
              {exercise.sets.map((set, setIndex) => (
                <div
                  key={setIndex}
                  className={`mt-4 border-t border-gray-200 dark:border-gray-600 pt-3 ${
                    set.is_drop_set ? "bg-blue-50 dark:bg-blue-900/20" : 
                    set.is_warmup ? "bg-yellow-50 dark:bg-yellow-900/20" : ""
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Set {setIndex + 1}
                      </span>
                      {set.is_drop_set ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                            Drop Set {set.drop_number}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({set.original_weight} {weightUnit} → {set.weight} {weightUnit})
                          </span>
                        </div>
                      ) : set.is_warmup ? (
                        <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full">
                          Warm-up Set
                        </span>
                      ) : (
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                          Working Set
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {!set.is_drop_set && (
                        <button
                          onClick={() => {
                            setWorkoutExercises((prev) =>
                              prev.map((ex, eIndex) => {
                                if (eIndex === exerciseIndex) {
                                  return {
                                    ...ex,
                                    sets: ex.sets.map((s, sIndex) => {
                                      if (sIndex === setIndex) {
                                        return { ...s, is_warmup: !s.is_warmup };
                                      }
                                      return s;
                                    }),
                                  };
                                }
                                return ex;
                              })
                            );
                          }}
                          className={`text-sm px-2 py-1 rounded ${
                            set.is_warmup
                              ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {set.is_warmup ? "Mark as Working Set" : "Mark as Warm-up"}
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteSet(exerciseIndex, setIndex)}
                        className="text-red-500 hover:text-red-400"
                        disabled={exercise.sets.length === 1}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  {exercise.is_cardio ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400">
                            Distance (km)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={set.distance}
                            onChange={(e) =>
                              handleEditSet(
                                exerciseIndex,
                                setIndex,
                                "distance",
                                e.target.value
                              )
                            }
                            className="bg-gray-200 dark:bg-gray-600 p-2 rounded-lg w-full"
                            placeholder="Distance"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400">
                            Duration (min)
                          </label>
                          <input
                            type="number"
                            value={set.duration}
                            onChange={(e) =>
                              handleEditSet(
                                exerciseIndex,
                                setIndex,
                                "duration",
                                e.target.value
                              )
                            }
                            className="bg-gray-200 dark:bg-gray-600 p-2 rounded-lg w-full"
                            placeholder="Minutes"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400">
                          Intensity
                        </label>
                        <select
                          value={set.intensity}
                          onChange={(e) =>
                            handleEditSet(
                              exerciseIndex,
                              setIndex,
                              "intensity",
                              e.target.value
                            )
                          }
                          className="bg-gray-200 dark:bg-gray-600 p-2 rounded-lg w-full"
                        >
                          <option value="">Select Intensity</option>
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Very High">Very High</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400">
                          Notes
                        </label>
                        <input
                          type="text"
                          value={set.notes}
                          onChange={(e) =>
                            handleEditSet(
                              exerciseIndex,
                              setIndex,
                              "notes",
                              e.target.value
                            )
                          }
                          className="bg-gray-200 dark:bg-gray-600 p-2 rounded-lg w-full"
                          placeholder="Notes (optional)"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400">
                            Weight ({weightUnit})
                          </label>
                          <input
                            type="number"
                            value={set.weight}
                            onChange={(e) =>
                              handleEditSet(
                                exerciseIndex,
                                setIndex,
                                "weight",
                                e.target.value
                              )
                            }
                            className="bg-gray-200 dark:bg-gray-600 p-2 rounded-lg w-full"
                            placeholder="Weight"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400">
                            Reps
                          </label>
                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) =>
                              handleEditSet(
                                exerciseIndex,
                                setIndex,
                                "reps",
                                e.target.value
                              )
                            }
                            className="bg-gray-200 dark:bg-gray-600 p-2 rounded-lg w-full"
                            placeholder="Reps"
                          />
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className="text-sm text-gray-600 dark:text-gray-400">
                          Notes
                        </label>
                        <input
                          type="text"
                          value={set.notes}
                          onChange={(e) =>
                            handleEditSet(
                              exerciseIndex,
                              setIndex,
                              "notes",
                              e.target.value
                            )
                          }
                          className="bg-gray-200 dark:bg-gray-600 p-2 rounded-lg w-full"
                          placeholder="Notes (optional)"
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}

              <button
                onClick={() => handleAddSet(exerciseIndex)}
                className="w-full text-teal-500 hover:text-teal-400 mt-4 flex items-center justify-center"
              >
                <FaPlus className="mr-2" /> Add Set
              </button>
            </>
          )}
        </div>
      ))}

      <div className="w-full max-w-lg flex space-x-4 mt-6">
        <button
          onClick={handleFinishWorkout}
          className="flex-1 text-white font-semibold text-lg p-4 bg-teal-500 hover:bg-teal-400 rounded-lg"
          disabled={workoutExercises.length === 0}
        >
          Finish Workout
        </button>

        <button
          onClick={handleSaveAsRoutine}
          className="flex-1 text-white font-semibold text-lg p-4 bg-blue-500 hover:bg-blue-400 rounded-lg flex items-center justify-center"
        >
          <FaSave className="mr-2" /> Save as Routine
        </button>
      </div>

      {showExerciseSelection && (
        <AddExercise
          onClose={() => setShowExerciseSelection(false)}
          onSelectExercise={handleAddExercise}
        />
      )}

      {/* Routines Selector Modal */}
      {showRoutinesSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Select a Routine
              </h2>
              <button
                onClick={() => setShowRoutinesSelector(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 dark:text-gray-400">
                Choose a routine to start your workout with predefined
                exercises.
              </p>
            </div>

            {loadingRoutines ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : routines.length === 0 ? (
              <div className="text-center py-6 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">
                  You don't have any saved routines yet.
                </p>
                <button
                  onClick={() => {
                    setShowRoutinesSelector(false);
                    navigate("/routines");
                  }}
                  className="mt-4 text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Go to Routines
                </button>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                <div className="space-y-3">
                  {routines.map((routine) => (
                    <div
                      key={routine.id}
                      className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                      onClick={() => handleSelectRoutine(routine)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {routine.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {routine.workout && routine.workout.exercises
                              ? `${routine.workout.exercises.length} Exercise${
                                  routine.workout.exercises.length !== 1
                                    ? "s"
                                    : ""
                                }`
                              : "No exercises"}
                          </p>
                        </div>
                        <button
                          className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectRoutine(routine);
                          }}
                        >
                          <FaPlayCircle />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowRoutinesSelector(false);
                  navigate("/routines");
                }}
                className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
              >
                View All Routines
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Routine Modal */}
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
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
              >
                Save Routine
              </button>
              <button
                onClick={() => setShowSaveRoutineModal(false)}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rest Timer Modal */}
      {showRestTimer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Rest Timer - {currentExercise?.name}
              </h3>
              <button
                onClick={closeRestTimer}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FaTimes />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rest Duration (seconds)
              </label>
              <input
                type="number"
                min="1"
                value={restTime}
                onChange={handleRestTimerChange}
                className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isResting}
              />
            </div>

            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {timeLeft}s
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {isResting ? "Resting..." : "Ready to start"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {!isResting ? (
                <button
                  onClick={startRestTimer}
                  className="col-span-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 flex items-center justify-center"
                >
                  <FaPlayCircle className="mr-2" />
                  Start Timer
                </button>
              ) : (
                <>
                  <button
                    onClick={pauseRestTimer}
                    className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600"
                  >
                    Pause
                  </button>
                  <button
                    onClick={resetRestTimer}
                    className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
                  >
                    Reset
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showDropSet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Add Drop Sets
            </h2>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Original Weight ({weightUnit})
              </label>
              <input
                type="number"
                value={originalWeight || ""}
                onChange={(e) => {
                  setOriginalWeight(e.target.value);
                  setDropSetWeight(e.target.value);
                }}
                className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white"
                placeholder="Enter original weight"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Weight Reduction (%)
              </label>
              <input
                type="number"
                value={dropSetPercentage}
                onChange={(e) => setDropSetPercentage(parseInt(e.target.value))}
                className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white"
                min="5"
                max="50"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Each drop will reduce the weight by this percentage
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Number of Drops
              </label>
              <input
                type="number"
                value={dropSetCount}
                onChange={(e) => setDropSetCount(parseInt(e.target.value))}
                className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white"
                min="1"
                max="5"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Reps per Drop
              </label>
              <input
                type="number"
                value={dropSetReps}
                onChange={(e) => setDropSetReps(e.target.value)}
                className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white"
                placeholder="Enter reps"
              />
            </div>
            {originalWeight && (
              <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <h3 className="font-medium mb-2">Drop Set Preview:</h3>
                <div className="space-y-1">
                  {Array.from({ length: dropSetCount }).map((_, i) => {
                    const weight = calculateNextWeight(
                      parseFloat(originalWeight),
                      dropSetPercentage * (i + 1)
                    );
                    return (
                      <div key={i} className="text-sm">
                        Drop {i + 1}: {weight} {weightUnit} ({dropSetPercentage}% reduction)
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="flex space-x-3">
              <button
                onClick={handleSaveDropSet}
                className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg"
              >
                Add Drop Sets
              </button>
              <button
                onClick={() => {
                  setShowDropSet(false);
                  setDropSetExercise(null);
                  setDropSetWeight("");
                  setDropSetReps("");
                  setOriginalWeight(null);
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

export default WorkoutLog;
