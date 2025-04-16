import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  FaListUl,
  FaChartBar,
  FaTrophy,
  FaInfoCircle,
  FaCheck,
  FaEdit,
  FaCalendarAlt,
  FaDumbbell
} from "react-icons/fa";
import AddExercise from "./AddExercise";
import { LuCalendarClock } from "react-icons/lu";
import { 
  notifyWorkoutCompleted, 
  notifyPersonalRecord,
  notifyWorkoutStreak,
  notifyStreakBroken 
} from '../utils/notificationsHelpers';
import '../styles/workout-log-mobile.css'; // Import mobile-specific styles
import WorkoutActionButtons from '../components/WorkoutActionButtons';

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
  const location = useLocation();
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [restTime, setRestTime] = useState(60); // Default 60 seconds
  const [isResting, setIsResting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showSetTypeModal, setShowSetTypeModal] = useState(false);
  const [setTypeExercise, setSetTypeExercise] = useState(null);
  const [selectedSetType, setSelectedSetType] = useState("drop"); // "drop", "warmup", "working", "superset", "amrap", "restpause", "pyramid", "giant"
  const [originalWeight, setOriginalWeight] = useState(null);
  const [timerInterval, setTimerInterval] = useState(null);
  const [savingRoutine, setSavingRoutine] = useState(false);
  const [dropSetWeight, setDropSetWeight] = useState("");
  const [dropSetReps, setDropSetReps] = useState("");
  const [dropSetPercentage, setDropSetPercentage] = useState(20); // Default 20% reduction
  const [dropSetCount, setDropSetCount] = useState(1); // Number of drops to perform
  const [supersetExerciseId, setSupersetExerciseId] = useState(null);
  const [supersetReps, setSupersetReps] = useState("");
  const [supersetWeight, setSupersetWeight] = useState("");
  const [showSupersetExerciseSelector, setShowSupersetExerciseSelector] = useState(false);
  const [fullPyramidChecked, setFullPyramidChecked] = useState(false);
  const [showExerciseHistoryModal, setShowExerciseHistoryModal] = useState(false);
  const [showExerciseChartsModal, setShowExerciseChartsModal] = useState(false);
  const [showPersonalRecordsModal, setShowPersonalRecordsModal] = useState(false);
  const [selectedExerciseForHistory, setSelectedExerciseForHistory] = useState(null);
  const isLocalStorageDisabled = false;

  const toggleWeightUnit = () => {
    const newUnit = weightUnit === "kg" ? "lbs" : "kg";
    setWeightUnit(newUnit);
    localStorage.setItem("weightUnit", newUnit);
    
    // Save to server preferences
    saveUserPreferences({
      weight_unit: newUnit
    });
  };

  const toggleExerciseCollapse = (exerciseIndex) => {
    setCollapsedExercises((prev) => ({
      ...prev,
      [exerciseIndex]: !prev[exerciseIndex],
    }));
  };

  const prepareWorkoutForSaving = (workout) => {
    // Make a deep copy of the workout to avoid modifying the original
    const workoutCopy = JSON.parse(JSON.stringify(workout));

    // If the current unit is lbs, convert weights back to kg for storage
    if (weightUnit === "lbs") {
      // Convert bodyweight to kg if present
      if (workoutCopy.bodyweight) {
        const bw = parseFloat(workoutCopy.bodyweight);
        if (!isNaN(bw)) {
          workoutCopy.bodyweight = (bw / 2.20462).toFixed(1);
        }
      }

      // Convert all exercise weights
      if (workoutCopy.exercises && Array.isArray(workoutCopy.exercises)) {
        workoutCopy.exercises.forEach(exercise => {
          if (!exercise.is_cardio && exercise.sets && Array.isArray(exercise.sets)) {
            exercise.sets.forEach(set => {
              if (set.weight) {
                const weight = parseFloat(set.weight);
                if (!isNaN(weight)) {
                  set.weight = (weight / 2.20462).toFixed(1);
                }
              }
              if (set.original_weight) {
                const originalWeight = parseFloat(set.original_weight);
                if (!isNaN(originalWeight)) {
                  set.original_weight = (originalWeight / 2.20462).toFixed(1);
                }
              }
            });
          }
        });
      }
    }

    // Store the weight unit with the workout
    workoutCopy.weight_unit = weightUnit;

    // Ensure all set type flags are properly preserved as booleans
    if (workoutCopy.exercises && Array.isArray(workoutCopy.exercises)) {
      workoutCopy.exercises.forEach(exercise => {
        if (exercise.sets && Array.isArray(exercise.sets)) {
          exercise.sets.forEach(set => {
            // Ensure all set type flags exist and are booleans
            set.is_warmup = !!set.is_warmup;
            set.is_drop_set = !!set.is_drop_set;
            set.is_superset = !!set.is_superset;
            set.is_amrap = !!set.is_amrap;
            set.is_restpause = !!set.is_restpause;
            set.is_pyramid = !!set.is_pyramid;
            set.is_giant = !!set.is_giant;
          });
        }
      });
    }

    return workoutCopy;
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
    const token = localStorage.getItem("access_token");
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

    console.log("Loading WorkoutLog component");
    console.log("Preloaded exercises found:", !!preloadedExercises);
    
    if (preloadedExercises) {
      try {
        const parsedExercises = JSON.parse(preloadedExercises);
        console.log("Number of preloaded exercises:", parsedExercises.length);
        console.log("Preloaded exercise names:", parsedExercises.map(e => e.name).join(", "));
        
        // Make sure we set the workout exercises first
        setWorkoutExercises(parsedExercises);
        
        // Then set other properties
        if (preloadedWorkoutName) {
          console.log("Setting workout name:", preloadedWorkoutName);
          setWorkoutName(preloadedWorkoutName);
        }

        // Clear the preloaded data after we've used it
        localStorage.removeItem("preloadedWorkoutExercises");
        localStorage.removeItem("preloadedWorkoutName");
        
        // Create a separate effect to check the state
        const timer = setTimeout(() => {
          console.log("Verifying exercises after setTimeout");
          console.log("Current workout exercises:", workoutExercises);
        }, 1000);
        
        return () => clearTimeout(timer);
      } catch (error) {
        console.error("Error parsing preloaded exercises:", error);
      }
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
      // Make sure we have a valid token
      const authToken = token || localStorage.getItem("access_token") || localStorage.getItem("token");
      
      if (!authToken) {
        console.error("No authentication token found");
        throw new Error("Authentication required");
      }
      
      console.log("Fetching routines with token");
      const response = await fetch(`${API_BASE_URL}/routines`, {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json"
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch routines: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Failed to fetch routines: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Successfully fetched ${data.length} routines`);
      setRoutines(data);
    } catch (error) {
      console.error("Error fetching routines:", error);
    } finally {
      setLoadingRoutines(false);
    }
  }

  const handleSelectRoutine = (routine) => {
    // First determine where the exercises are located - support both formats
    const exercises = routine.workout?.exercises || routine.exercises;
    
    if (!exercises || exercises.length === 0) {
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
    const newExercises = exercises.map((exercise) => {
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
                // Set type flags - ensure they're properly converted to boolean
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
            } else {
              return {
                weight: set.weight || "",
                reps: set.reps || "",
                notes: set.notes || "",
                // Set type flags - ensure they're properly converted to boolean
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
            is_warmup: false,
            is_drop_set: false,
            is_superset: false,
            is_amrap: false,
            is_restpause: false,
            is_pyramid: false,
            is_giant: false
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
            is_warmup: false,
            is_drop_set: false,
            is_superset: false,
            is_amrap: false,
            is_restpause: false,
            is_pyramid: false,
            is_giant: false
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
      const token = localStorage.getItem("access_token");
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
      const token = localStorage.getItem("access_token");
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
      // For cardio exercises, check if distance, duration and intensity are filled
      return exercise.sets.every(set => 
        (set.distance && String(set.distance).trim() !== "") && 
        (set.duration && String(set.duration).trim() !== "") &&
        (set.intensity && String(set.intensity).trim() !== "")
      );
    } else {
      // For strength exercises, check if both weight and reps are filled
      return exercise.sets.every(set => 
        set.weight && String(set.weight).trim() !== "" && 
        set.reps && String(set.reps).trim() !== ""
      );
    }
  };
  
  // Validate the entire workout before finishing or saving
  const validateWorkout = (isFromRoutine = false) => {
    let isValid = true;
    let missingFields = [];
    
    // Validate workout name
    if (!workoutName.trim()) {
      if (!isFromRoutine) {
        alert("Please enter a workout name");
        return false;
      } else {
        missingFields.push("workout name");
        isValid = false;
      }
    }
    
    // Validate start time
    if (!startTime) {
      if (!isFromRoutine) {
        alert("Please set a start time for your workout");
        return false;
      } else {
        missingFields.push("start time");
        isValid = false;
      }
    }
    
    // Validate end time
    if (!endTime) {
      if (!isFromRoutine) {
        alert("Please set an end time for your workout");
        return false;
      } else {
        missingFields.push("end time");
        isValid = false;
      }
    }
    
    // Validate bodyweight
    if (!bodyweight || bodyweight.trim() === "") {
      if (!isFromRoutine) {
        alert("Please enter your bodyweight");
        return false;
      } else {
        missingFields.push("bodyweight");
        isValid = false;
      }
    }
    
    // Validate exercises
    if (workoutExercises.length === 0) {
      if (!isFromRoutine) {
        alert("Please add at least one exercise");
        return false;
      } else {
        missingFields.push("at least one exercise");
        isValid = false;
      }
    }
    
    // Validate all sets in all exercises
    for (let i = 0; i < workoutExercises.length; i++) {
      const exercise = workoutExercises[i];
      
      if (!validateExerciseSets(exercise)) {
        if (!isFromRoutine) {
          if (exercise.is_cardio) {
            alert(`Please fill in all distance, duration, and intensity fields for ${exercise.name}`);
          } else {
            alert(`Please fill in all weight and reps fields for ${exercise.name}`);
          }
          return false;
        } else {
          missingFields.push(exercise.is_cardio ? 
            `distance, duration, and intensity for ${exercise.name}` : 
            `weight and reps for ${exercise.name}`);
          isValid = false;
        }
      }
    }
    
    // If coming from a routine and there are missing fields, show a consolidated warning
    if (isFromRoutine && missingFields.length > 0) {
      alert(`Please complete the following before finishing the workout:\n• ${missingFields.join('\n• ')}`);
    }
    
    return isValid;
  };

  // Check if we're working from a routine when finalizing workout
  const handleFinishWorkout = async () => {
    // Validate workout data before proceeding
    if (!validateWorkout()) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("You need to be logged in to save workouts.");
        navigate("/login");
        return;
      }

      // Update end time to current time
      const endTime = new Date().toISOString();
      setEndTime(endTime);

      // Prepare the workout data
      const workoutData = {
        name: workoutName.trim(),
        start_time: new Date(startTime).toISOString(),
        end_time: endTime,
        bodyweight: bodyweight ? parseFloat(bodyweight) : null,
        notes: notes.trim(),
        weight_unit: weightUnit,
        exercises: workoutExercises.map(exercise => ({
          name: exercise.name,
          category: exercise.category || "Uncategorized",
          is_cardio: exercise.is_cardio,
          sets: exercise.sets.map(set => {
            const baseSet = {
              weight: set.weight ? parseFloat(set.weight) : null,
              reps: set.reps ? parseInt(set.reps) : null,
              distance: set.distance ? parseFloat(set.distance) : null,
              duration: set.duration ? parseInt(set.duration) : null,
              intensity: set.intensity || "",
              notes: set.notes || "",
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
            return baseSet;
          })
        }))
      };

      // Check that exercises and sets are properly formatted
      if (!workoutData.exercises || workoutData.exercises.length === 0) {
        alert("Your workout must include at least one exercise.");
        return;
      }

      for (const exercise of workoutData.exercises) {
        if (!exercise.sets || exercise.sets.length === 0) {
          alert(`Exercise '${exercise.name}' must have at least one set.`);
          return;
        }
      }

      console.log("Sending workout data:", workoutData);

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
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || "Failed to save workout";
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log("Workout saved successfully:", responseData);

      // Show success message and reset form
      alert("Workout saved successfully!");
      notifyWorkoutCompleted(workoutName);
      
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
      alert(`Failed to save workout: ${error.message}`);
    }
  };

  const handleSaveAsRoutine = () => {
    // Always use strict validation for saving as routine
    if (!validateWorkout(false)) {
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
      // Get token, checking both localStorage keys
      const authToken = localStorage.getItem("access_token") || localStorage.getItem("token");
      
      if (!authToken) {
        console.error("No authentication token found");
        alert("Please log in to save routines");
        navigate("/login");
        return;
      }

      // Properly format the exercises for saving as a routine
      const formattedExercises = workoutExercises.map(exercise => ({
        name: exercise.name,
        category: exercise.category || null,
        is_cardio: !!exercise.is_cardio,
        sets: exercise.sets.map((set, index) => {
          if (exercise.is_cardio) {
            return {
              distance: set.distance || null,
              duration: set.duration || null,
              intensity: set.intensity || "",
              notes: set.notes || "",
              order: index,  // Keep the same order as in workout log
              // Set type flags
              is_warmup: !!set.is_warmup,
              is_drop_set: !!set.is_drop_set,
              is_superset: !!set.is_superset,
              is_amrap: !!set.is_amrap,
              is_restpause: !!set.is_restpause,
              is_pyramid: !!set.is_pyramid,
              is_giant: !!set.is_giant,
              // Additional properties for special set types
              drop_number: set.drop_number || null,
              original_weight: set.original_weight || null,
              superset_with: set.is_superset ? set.superset_with : null,
              rest_pauses: set.is_restpause ? set.rest_pauses : null,
              pyramid_type: set.is_pyramid ? set.pyramid_type : null,
              pyramid_step: set.is_pyramid ? set.pyramid_step : null,
              // Convert giant_with values to strings if they exist
              giant_with: set.is_giant && set.giant_with ? 
                set.giant_with.map(item => String(item)) : null
            };
          } else {
            return {
              weight: set.weight || null,
              reps: set.reps || null,
              notes: set.notes || "",
              order: index,  // Keep the same order as in workout log
              // Set type flags
              is_warmup: !!set.is_warmup,
              is_drop_set: !!set.is_drop_set,
              is_superset: !!set.is_superset,
              is_amrap: !!set.is_amrap,
              is_restpause: !!set.is_restpause,
              is_pyramid: !!set.is_pyramid,
              is_giant: !!set.is_giant,
              // Additional properties for special set types
              drop_number: set.drop_number || null,
              original_weight: set.original_weight || null,
              superset_with: set.is_superset ? set.superset_with : null,
              rest_pauses: set.is_restpause ? set.rest_pauses : null,
              pyramid_type: set.is_pyramid ? set.pyramid_type : null,
              pyramid_step: set.is_pyramid ? set.pyramid_step : null,
              giant_with: set.is_giant ? (set.giant_with ? set.giant_with.map(item => String(item)) : null) : null
            };
          }
        }) || []
      }));

      // Create the routine data
      const routineData = {
        name: routineName,
        weight_unit: weightUnit || "kg",
        exercises: formattedExercises
      };

      console.log("Saving routine data:", routineData);

      // Check for duplicate routine names
      const routinesResponse = await fetch(`${API_BASE_URL}/routines`, {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json"
        }
      });

      if (!routinesResponse.ok) {
        const errorText = await routinesResponse.text();
        console.error(`Failed to check existing routines: ${routinesResponse.status} ${routinesResponse.statusText}`, errorText);
        throw new Error(`Failed to check existing routines: ${routinesResponse.status}`);
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
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify(routineData)
        });
      } else {
        // Create a new routine - use the /routines endpoint
        response = await fetch(`${API_BASE_URL}/routines`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify(routineData)
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error saving routine: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Failed to save routine: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Routine saved successfully:", responseData);

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
          // Set type flags
          is_warmup: false,
          is_drop_set: false,
          is_superset: false,
          is_amrap: false,
          is_restpause: false,
          is_pyramid: false,
          is_giant: false,
          // Additional properties for special set types
          drop_number: null,
          original_weight: null,
          superset_with: null,
          rest_pauses: null,
          pyramid_type: null,
          pyramid_step: null,
          giant_with: null
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
          // Set type flags
          is_warmup: false,
          is_drop_set: false,
          is_superset: false,
          is_amrap: false,
          is_restpause: false,
          is_pyramid: false,
          is_giant: false,
          // Additional properties for special set types
          drop_number: null,
          original_weight: null,
          superset_with: null,
          rest_pauses: null,
          pyramid_type: null,
          pyramid_step: null,
          giant_with: null
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
            ? { 
                distance: "", 
                duration: "", 
                intensity: "", 
                notes: "", 
                is_warmup: false, 
                is_drop_set: false, 
                is_superset: false,
                is_amrap: false,
                is_restpause: false,
                is_pyramid: false,
                is_giant: false
              }
            : { 
                weight: "", 
                reps: "", 
                notes: "", 
                is_warmup: false, 
                is_drop_set: false, 
                is_superset: false,
                is_amrap: false,
                is_restpause: false,
                is_pyramid: false,
                is_giant: false
              };

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
      prev.map((exercise, eIndex) => {
        if (eIndex === exerciseIndex) {
          return {
            ...exercise,
            sets: exercise.sets.map((set, sIndex) => {
              if (sIndex === setIndex) {
                // Handle special set type changes
                if (field.startsWith('is_')) {
                  // Reset all set type flags when changing to a new type
                  const newSet = {
                    ...set,
                    is_warmup: false,
                    is_drop_set: false,
                    is_superset: false,
                    is_amrap: false,
                    is_restpause: false,
                    is_pyramid: false,
                    is_giant: false,
                    // Reset additional properties
                    drop_number: null,
                    original_weight: null,
                    superset_with: null,
                    rest_pauses: null,
                    pyramid_type: null,
                    pyramid_step: null,
                    giant_with: null
                  };
                  // Set the new type flag
                  newSet[field] = value;
                  return newSet;
                }
                
                // For regular field updates
                return { ...set, [field]: value };
              }
              return set;
            }),
          };
        }
        return exercise;
      })
    );
  };

  const handleDeleteSet = (exerciseIndex, setIndex) => {
    setWorkoutExercises((prev) =>
      prev.map((exercise, eIndex) => {
        if (eIndex === exerciseIndex) {
          // Don't allow deleting the last set
          if (exercise.sets.length <= 1) {
            return exercise;
          }

          const setToDelete = exercise.sets[setIndex];
          let updatedSets = exercise.sets.filter((_, sIndex) => sIndex !== setIndex);

          // If the deleted set was part of a superset, update the related set
          if (setToDelete.is_superset && setToDelete.superset_with !== null) {
            updatedSets = updatedSets.map(set => {
              if (set.superset_with === setIndex) {
                return {
                  ...set,
                  is_superset: false,
                  superset_with: null
                };
              }
              // Update superset_with indices for sets that were after the deleted set
              if (set.superset_with > setIndex) {
                return {
                  ...set,
                  superset_with: set.superset_with - 1
                };
              }
              return set;
            });
          }

          // If the deleted set was part of a giant set, update the related sets
          if (setToDelete.is_giant && setToDelete.giant_with) {
            updatedSets = updatedSets.map(set => {
              if (set.giant_with && set.giant_with.includes(String(setIndex))) {
                const newGiantWith = set.giant_with
                  .filter(idx => idx !== String(setIndex))
                  .map(idx => parseInt(idx) > setIndex ? String(parseInt(idx) - 1) : idx);
                
                return {
                  ...set,
                  is_giant: newGiantWith.length > 0,
                  giant_with: newGiantWith.length > 0 ? newGiantWith : null
                };
              }
              // Update giant_with indices for sets that were after the deleted set
              if (set.giant_with) {
                const newGiantWith = set.giant_with
                  .map(idx => parseInt(idx) > setIndex ? String(parseInt(idx) - 1) : idx);
                return {
                  ...set,
                  giant_with: newGiantWith
                };
              }
              return set;
            });
          }

          // If the deleted set was part of a drop set sequence, update the remaining sets
          if (setToDelete.is_drop_set) {
            updatedSets = updatedSets.map(set => {
              if (set.is_drop_set && set.drop_number > setToDelete.drop_number) {
                return {
                  ...set,
                  drop_number: set.drop_number - 1
                };
              }
              return set;
            });
          }

          // If the deleted set was part of a pyramid sequence, update the remaining sets
          if (setToDelete.is_pyramid) {
            updatedSets = updatedSets.map(set => {
              if (set.is_pyramid && set.pyramid_step > setToDelete.pyramid_step) {
                return {
                  ...set,
                  pyramid_step: set.pyramid_step - 1
                };
              }
              return set;
            });
          }

          return {
            ...exercise,
            sets: updatedSets
          };
        }
        return exercise;
      })
    );
  };

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

  const handleShowSetTypeModal = (exercise) => {
    // Get the last set's weight as the starting point
    const lastSet = exercise.sets[exercise.sets.length - 1];
    if (lastSet && lastSet.weight) {
      setOriginalWeight(lastSet.weight);
      setDropSetWeight(lastSet.weight);
    }
    setSetTypeExercise(exercise);
    setSelectedSetType("drop"); // Default to drop set
    setShowSetTypeModal(true);
  };
  
  const handleShowExerciseHistory = (exercise) => {
    setSelectedExerciseForHistory(exercise);
    setShowExerciseHistoryModal(true);
  };
  
  const handleShowExerciseCharts = (exercise) => {
    setSelectedExerciseForHistory(exercise);
    setShowExerciseChartsModal(true);
  };
  
  const handleShowPersonalRecords = (exercise) => {
    setSelectedExerciseForHistory(exercise);
    setShowPersonalRecordsModal(true);
  };

  const calculateNextWeight = (currentWeight, percentage) => {
    const reduction = (currentWeight * percentage) / 100;
    return (currentWeight - reduction).toFixed(1);
  };

  const getButtonText = () => {
    switch (selectedSetType) {
      case "drop":
        return `Add ${dropSetCount} Drop Set${dropSetCount > 1 ? 's' : ''}`;
      case "warmup":
        return "Add Warm-up Set";
      case "working":
        return "Add Normal Set";
      case "superset":
        return "Add Superset";
      case "amrap":
        return "Add AMRAP Set";
      case "restpause":
        return "Add Rest-Pause Set";
      case "pyramid":
        return "Add Pyramid Set";
      case "giant":
        return "Add Giant Set";
      default:
        return "Add Set";
    }
  };

   const handleAddSetByType = () => {
    if (!setTypeExercise) return;

    if (selectedSetType === "drop") {
      // Drop set functionality
      if (!originalWeight) {
        alert("Please enter the original weight");
        return;
      }

      // Validate that reps are filled
      if (!dropSetReps || dropSetReps.trim() === "") {
        alert("Please enter the number of reps for the drop sets.");
        return;
      }

      const newSets = [];
      let currentWeight = parseFloat(originalWeight);

      // Calculate all weights first
      const weights = [];
      for (let i = 0; i < dropSetCount; i++) {
        const reducedWeight = calculateNextWeight(currentWeight, dropSetPercentage * (i + 1));
        weights.push(reducedWeight);
      }
      weights.push(currentWeight); // Add the original (heaviest) weight

      // Sort weights in ascending order (lightest to heaviest)
      weights.sort((a, b) => parseFloat(a) - parseFloat(b));

      // Create sets in ascending order
      weights.forEach((weight, index) => {
        newSets.push({
          weight: weight,
          reps: dropSetReps,
          notes: index < weights.length - 1 ? 
            `Drop Set #${index + 1} (Build-up)` : 
            `Drop Set #${index + 1} (Top Set)`,
          is_drop_set: true,
          is_warmup: false,
          is_superset: false,
          is_amrap: false,
          is_restpause: false,
          is_pyramid: false,
          is_giant: false,
          original_weight: originalWeight,
          drop_number: index + 1,
        });
      });

      setWorkoutExercises((prev) =>
        prev.map((ex) => {
          if (ex === setTypeExercise) {
            return {
              ...ex,
              sets: [...ex.sets, ...newSets],
            };
          }
          return ex;
        })
      );
    } else if (selectedSetType === "warmup") {
      // Add a warm-up set
      const newSet = setTypeExercise.is_cardio
        ? { 
            distance: "", 
            duration: "", 
            intensity: "", 
            notes: "Warm-up Set", 
            is_warmup: true,
            is_drop_set: false,
            is_superset: false,
            is_amrap: false,
            is_restpause: false,
            is_pyramid: false,
            is_giant: false
          }
        : { 
            weight: originalWeight ? (parseFloat(originalWeight) * 0.7).toFixed(1) : "", 
            reps: "", 
            notes: "Warm-up Set", 
            is_warmup: true,
            is_drop_set: false,
            is_superset: false,
            is_amrap: false,
            is_restpause: false,
            is_pyramid: false,
            is_giant: false
          };


      setWorkoutExercises((prev) =>
        prev.map((ex) => {
          if (ex === setTypeExercise) {
            return {
              ...ex,
              sets: [...ex.sets, newSet],
            };
          }
          return ex;
        })
      );
    } else if (selectedSetType === "superset") {
      // Validate inputs
      if (supersetExerciseId === null) {
        alert("Please select an exercise to pair with.");
        return;
      }
      
      const supersetExercise = workoutExercises[parseInt(supersetExerciseId)];
      
      if (!supersetExercise) {
        alert("The selected superset exercise was not found.");
        return;
      }
      
      // For strength exercises
      if ((!setTypeExercise.is_cardio && !originalWeight) || 
          (!supersetExercise.is_cardio && !supersetWeight)) {
        alert("Please enter weight for strength exercises.");
        return;
      }
      
      if (!dropSetReps || !supersetReps) {
        alert("Please enter reps for both exercises.");
        return;
      }
      
      // Add superset to the primary exercise
      const updatedExercises = [...workoutExercises];
      const primaryExerciseIndex = updatedExercises.findIndex(e => e === setTypeExercise);
      
      if (primaryExerciseIndex === -1) {
        alert("Primary exercise not found.");
        return;
      }
      
      // For the primary exercise
      const primarySet = {
        weight: !setTypeExercise.is_cardio ? originalWeight : "",
        reps: dropSetReps,
        notes: `Superset with ${supersetExercise.name}`,
        is_superset: true,
        is_warmup: false,
        is_drop_set: false,
        is_amrap: false,
        is_restpause: false,
        is_pyramid: false,
        is_giant: false,
        superset_with: String(supersetExerciseId)
      };
      
      updatedExercises[primaryExerciseIndex].sets.push(primarySet);
      
      // For the paired exercise
      const pairedSet = {
        weight: !supersetExercise.is_cardio ? supersetWeight : "",
        reps: supersetReps,
        notes: `Superset with ${setTypeExercise.name}`,
        is_superset: true,
        is_warmup: false,
        is_drop_set: false,
        is_amrap: false,
        is_restpause: false,
        is_pyramid: false,
        is_giant: false,
        superset_with: String(primaryExerciseIndex)
      };
      
      updatedExercises[parseInt(supersetExerciseId)].sets.push(pairedSet);
      
      setWorkoutExercises(updatedExercises);
    } else if (selectedSetType === "amrap") {
      // AMRAP set functionality
      if (!originalWeight) {
        alert("Please enter the weight");
        return;
      }

      // Validate that reps are filled
      if (!dropSetReps || dropSetReps.trim() === "") {
        alert("Please enter the target reps for the AMRAP set.");
        return;
      }

      const newSet = {
        weight: originalWeight,
        reps: dropSetReps,
        notes: `AMRAP Set (As Many Reps As Possible)`,
        is_drop_set: false,
        is_warmup: false,
        is_superset: false,
        is_amrap: true,
        is_restpause: false,
        is_pyramid: false,
        is_giant: false
      };

      setWorkoutExercises((prev) =>
        prev.map((ex) => {
          if (ex === setTypeExercise) {
            return {
              ...ex,
              sets: [...ex.sets, newSet],
            };
          }
          return ex;
        })
      );
    } else if (selectedSetType === "restpause") {
      // Rest-Pause set functionality
      if (!originalWeight) {
        alert("Please enter the weight");
        return;
      }

      // Validate that reps are filled
      if (!dropSetReps || dropSetReps.trim() === "") {
        alert("Please enter the initial reps for the rest-pause set.");
        return;
      }

      // Add a rest-pause set (just one set with a description)
      const newSet = { 
        weight: originalWeight, 
        reps: dropSetReps, 
        notes: `Rest-Pause Set (${dropSetCount} pauses)`, 
        is_warmup: false,
        is_drop_set: false,
        is_superset: false,
        is_amrap: false,
        is_restpause: true,
        is_pyramid: false,
        is_giant: false,
        rest_pauses: dropSetCount
      };

      setWorkoutExercises((prev) =>
        prev.map((ex) => {
          if (ex === setTypeExercise) {
            return {
              ...ex,
              sets: [...ex.sets, newSet],
            };
          }
          return ex;
        })
      );
    } else if (selectedSetType === "pyramid") {
      // Pyramid set functionality
      if (!originalWeight) {
        alert("Please enter the starting weight");
        return;
      }

      // Validate that reps are filled
      if (!dropSetReps || dropSetReps.trim() === "") {
        alert("Please enter the starting reps for the pyramid set.");
        return;
      }

      const newSets = [];
      let currentWeight = parseFloat(originalWeight);
      let currentReps = parseInt(dropSetReps);
      
      // Generate ascending pyramid (weight goes up, reps go down)
      for (let i = 0; i < dropSetCount; i++) {
        const weightIncrease = currentWeight * (dropSetPercentage / 100);
        // First set is the starting weight/reps
        if (i === 0) {
          newSets.push({
            weight: currentWeight.toFixed(1),
            reps: currentReps.toString(),
            notes: `Pyramid Set (Base)`,
            is_drop_set: false,
            is_warmup: false,
            is_superset: false,
            is_amrap: false,
            is_restpause: false,
            is_pyramid: true,
            is_giant: false,
            pyramid_type: "ascending",
            pyramid_step: i + 1
          });
        } else {
          // For following sets, increase weight and decrease reps
          currentWeight += weightIncrease;
          currentReps = Math.max(2, currentReps - 2); // Minimum 2 reps
          
          newSets.push({
            weight: currentWeight.toFixed(1),
            reps: currentReps.toString(),
            notes: `Pyramid Set (Step ${i + 1})`,
            is_drop_set: false,
            is_warmup: false,
            is_superset: false,
            is_amrap: false,
            is_restpause: false,
            is_pyramid: true,
            is_giant: false,
            pyramid_type: "ascending",
            pyramid_step: i + 1
          });
        }
      }
      
      // If full pyramid is selected, add descending part
      if (fullPyramidChecked) {
        // For descending part, we reverse the logic
        for (let i = dropSetCount - 2; i >= 0; i--) {
          // Recalculate to match the ascending side's values
          let calcWeight = parseFloat(originalWeight);
          let calcReps = parseInt(dropSetReps);
          
          for (let j = 0; j < i; j++) {
            const weightIncrease = calcWeight * (dropSetPercentage / 100);
            calcWeight += weightIncrease;
            calcReps = Math.max(2, calcReps - 2);
          }
          
          newSets.push({
            weight: calcWeight.toFixed(1),
            reps: calcReps.toString(),
            notes: `Pyramid Set (Step ${i + 1}, Descending)`,
            is_drop_set: false,
            is_warmup: false,
            is_superset: false,
            is_amrap: false,
            is_restpause: false,
            is_pyramid: true,
            is_giant: false,
            pyramid_type: "descending",
            pyramid_step: i + 1
          });
        }
      }

      setWorkoutExercises((prev) =>
        prev.map((ex) => {
          if (ex === setTypeExercise) {
            return {
              ...ex,
              sets: [...ex.sets, ...newSets],
            };
          }
          return ex;
        })
      );
    } else if (selectedSetType === "giant") {
      // Giant set functionality (similar to superset but with additional exercises)
      if (supersetExerciseId === null) {
        alert("Please select at least one additional exercise for the giant set.");
        return;
      }
      
      const secondExercise = workoutExercises[parseInt(supersetExerciseId)];
      
      if (!secondExercise) {
        alert("The selected exercise was not found.");
        return;
      }
      
      // For strength exercises
      if ((!setTypeExercise.is_cardio && !originalWeight) || 
          (!secondExercise.is_cardio && !supersetWeight)) {
        alert("Please enter weight for strength exercises.");
        return;
      }
      
      if (!dropSetReps || !supersetReps) {
        alert("Please enter reps for all exercises.");
        return;
      }
      
      // Add giant set to the primary exercise
      const updatedExercises = [...workoutExercises];
      const primaryExerciseIndex = updatedExercises.findIndex(e => e === setTypeExercise);
      
      if (primaryExerciseIndex === -1) {
        alert("Primary exercise not found.");
        return;
      }
      
      // For the primary exercise
      const primarySet = {
        weight: !setTypeExercise.is_cardio ? originalWeight : "",
        reps: dropSetReps,
        notes: `Giant Set with ${secondExercise.name}`,
        is_superset: false,
        is_warmup: false,
        is_drop_set: false,
        is_amrap: false,
        is_restpause: false,
        is_pyramid: false,
        is_giant: true,
        giant_with: [String(parseInt(supersetExerciseId))]
      };
      
      updatedExercises[primaryExerciseIndex].sets.push(primarySet);
      
      // For the second exercise
      const secondSet = {
        weight: !secondExercise.is_cardio ? supersetWeight : "",
        reps: supersetReps,
        notes: `Giant Set with ${setTypeExercise.name}`,
        is_superset: false,
        is_warmup: false,
        is_drop_set: false,
        is_amrap: false,
        is_restpause: false,
        is_pyramid: false,
        is_giant: true,
        giant_with: [String(primaryExerciseIndex)]
      };
      
      updatedExercises[parseInt(supersetExerciseId)].sets.push(secondSet);
      
      
      setWorkoutExercises(updatedExercises);
    }
    
    // Reset state and close modal
    closeSetTypeModal();
  };

  // Function to reset and close the Set Type modal
  const closeSetTypeModal = () => {
    setShowSetTypeModal(false);
    setSetTypeExercise(null);
    setSelectedSetType("drop");
    setDropSetWeight("");
    setDropSetReps("");
    setOriginalWeight(null);
    setSupersetExerciseId(null);
    setSupersetWeight("");
    setSupersetReps("");
    setShowSupersetExerciseSelector(false);
    setFullPyramidChecked(false);
    // Reset drop set count and percentage to defaults
    setDropSetCount(1);
    setDropSetPercentage(20);
  };

  const saveWorkout = async () => {
    // Check if we're coming from a routine
    const isFromRoutine = !!location.state?.routineId;
    
    if (!validateWorkout(isFromRoutine)) {
      return;
    }

    const workoutToSave = prepareWorkoutForSaving({
      name: workoutName,
      start_time: startTime,
      end_time: endTime,
      bodyweight: bodyweight,
      notes: notes,
      weight_unit: weightUnit,
      exercises: workoutExercises.map((exercise) => ({
        name: exercise.name,
        category: exercise.category || "Uncategorized",
        is_cardio: exercise.is_cardio,
        sets: exercise.sets.map((set) => {
          // Create a set object with all possible properties
          const setObj = {
            // Common properties
            notes: set.notes || "",
            // Set type flags - ensure they're properly converted to boolean
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

          // Add type-specific properties
          if (exercise.is_cardio) {
            setObj.distance = set.distance || "";
            setObj.duration = set.duration || "";
            setObj.intensity = set.intensity || "";
          } else {
            setObj.weight = set.weight || "";
            setObj.reps = set.reps || "";
          }

          return setObj;
        }),
      })),
    });

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/workouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(workoutToSave)
      });

      if (!response.ok) {
        throw new Error("Failed to save workout");
      }

      // Show success message and reset form
      alert("Workout saved successfully!");
      
      // Reset the form
      setWorkoutName("");
      setStartTime(new Date().toISOString().slice(0, 16));
      setEndTime("");
      setNotes("");
      setWorkoutExercises([]);
      
      // Navigate to workout history
      navigate("/workout-history");
    } catch (error) {
      console.error("Error saving workout:", error);
      alert("Failed to save workout. Please try again.");
    }
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTimeForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString('en-GB', {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const timePart = date.toLocaleTimeString('en-GB', {
      hour: "2-digit",
      minute: "2-digit"
    });
    return `${datePart} ${timePart}`;
  };

  // Add a new useEffect to handle navigation with routineId
  useEffect(() => {
    // Check if we navigated from the Routines page with a routineId
    if (location.state?.routineId) {
      const routineId = location.state.routineId;
      console.log("Detected navigation with routineId:", routineId);
      
      // If the routine is directly included in the state, use it immediately
      if (location.state?.routine) {
        console.log("Found routine in state:", location.state.routine.name);
        handleSelectRoutine(location.state.routine);
        return;
      }
      
      // Load the routine data from localStorage if it exists
      const preloadedExercises = localStorage.getItem("preloadedWorkoutExercises");
      const preloadedWorkoutName = localStorage.getItem("preloadedWorkoutName");
      
      if (preloadedExercises && preloadedWorkoutName) {
        console.log("Loading preloaded data for routine:", routineId);
        try {
          const parsedExercises = JSON.parse(preloadedExercises);
          console.log("Loaded exercises:", parsedExercises.length);
          
          // Set the workout exercises and name
          setWorkoutExercises(parsedExercises);
          setWorkoutName(preloadedWorkoutName);
          
          // Clear the navigation state to prevent reloading on refresh
          window.history.replaceState({}, document.title);
          
          // Clear localStorage after loading
          localStorage.removeItem("preloadedWorkoutExercises");
          localStorage.removeItem("preloadedWorkoutName");
        } catch (error) {
          console.error("Error loading preloaded exercises:", error);
        }
      } else {
        console.log("No preloaded data found for routine:", routineId);
        
        // If no preloaded data is found, try to fetch all routines and find the one we need
        const token = localStorage.getItem("access_token") || localStorage.getItem("token");
        if (token) {
          console.log("Attempting to fetch routines with routineId:", routineId);
          fetch(`${API_BASE_URL}/routines`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then(response => {
              if (!response.ok) throw new Error("Failed to fetch routines");
              return response.json();
            })
            .then(routines => {
              // Find the specific routine by ID - ensure type-safe comparison
              const routineIdNum = parseInt(routineId, 10);
              const routine = routines.find(r => r.id === routineIdNum);
              if (routine) {
                console.log("Found routine in fetch response:", routine.name);
                // Transform the routine to the expected format with workout.exercises
                const formattedRoutine = {
                  ...routine,
                  workout: {
                    exercises: routine.exercises || []
                  }
                };
                handleSelectRoutine(formattedRoutine);
              } else {
                console.error("Routine not found in fetch response. Available routines:", routines.map(r => `ID: ${r.id}, Name: ${r.name}`));
              }
            })
            .catch(error => {
              console.error("Error fetching routines:", error);
            });
        }
      }
    }
  }, [location.state]);

  // Load user preferences function
  const loadUserPreferences = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/workout-preferences`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.bodyweight) {
          setBodyweight(data.bodyweight);
        }
        if (data.weight_unit) {
          setWeightUnit(data.weight_unit);
        }
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  }, []);

  // Load the last used bodyweight from localStorage when the component mounts
  useEffect(() => {
    // First try to load from localStorage as a quick solution
    const storedBodyweight = localStorage.getItem("lastBodyweight");
    if (storedBodyweight && !bodyweight) {
      setBodyweight(storedBodyweight);
    }
    
    // Then try to load from the server preferences
    loadUserPreferences();
  }, [loadUserPreferences]);

  // Update localStorage and API whenever bodyweight changes
  useEffect(() => {
    if (bodyweight) {
      // Store in localStorage for quick access next time
      localStorage.setItem("lastBodyweight", bodyweight);
      
      // Also update on the server if we have a token
      const saveBodyweight = () => {
        // Save to localStorage for immediate access in future sessions
        localStorage.setItem("lastBodyweight", bodyweight);
        
        // Save to server for persistence across devices
        saveUserPreferences({
          bodyweight: bodyweight,
          weight_unit: weightUnit
        });
      };
      
      // Debounce the API call to avoid too many requests
      const timeoutId = setTimeout(() => {
        saveBodyweight();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [bodyweight, weightUnit]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  // Save all user preferences
  const saveUserPreferences = async (preferences) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/workout-preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(preferences)
      });
      
      if (!response.ok) {
        console.error('Failed to save user preferences');
      }
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  };

  // Save to local storage for multi-day workouts
  useEffect(() => {
    if (!isLocalStorageDisabled && workoutExercises.length > 0) {
      try {
        const token = localStorage.getItem("access_token");
        
        // Only attempt to save if a token exists
        if (token) {
          const savedWorkout = {
            name: workoutName,
            start_time: startTime,
            end_time: endTime,
            bodyweight: bodyweight,
            notes: notes,
            weight_unit: weightUnit,
            exercises: workoutExercises
          };
          
          localStorage.setItem("savedWorkout", JSON.stringify(savedWorkout));
        }
      } catch (error) {
        console.error("Error saving workout to localStorage:", error);
      }
    }
  }, [workoutName, startTime, endTime, bodyweight, notes, weightUnit, workoutExercises, isLocalStorageDisabled]);

  const handleExerciseChange = (exerciseIndex, field, value) => {
    setWorkoutExercises((prev) =>
      prev.map((exercise, index) => {
        if (index === exerciseIndex) {
          // If changing the exercise type, we need to update the sets structure
          if (field === "is_cardio") {
            const isCardio = value;
            const newSets = exercise.sets.map(set => {
              if (isCardio) {
                return {
                  distance: "",
                  duration: "",
                  intensity: "",
                  notes: set.notes || "",
                  // Preserve set type flags
                  is_warmup: set.is_warmup || false,
                  is_drop_set: set.is_drop_set || false,
                  is_superset: set.is_superset || false,
                  is_amrap: set.is_amrap || false,
                  is_restpause: set.is_restpause || false,
                  is_pyramid: set.is_pyramid || false,
                  is_giant: set.is_giant || false,
                  // Preserve additional properties
                  drop_number: set.drop_number || null,
                  original_weight: set.original_weight || null,
                  superset_with: set.superset_with || null,
                  rest_pauses: set.rest_pauses || null,
                  pyramid_type: set.pyramid_type || null,
                  pyramid_step: set.pyramid_step || null,
                  giant_with: set.giant_with || null
                };
              } else {
                return {
                  weight: "",
                  reps: "",
                  notes: set.notes || "",
                  // Preserve set type flags
                  is_warmup: set.is_warmup || false,
                  is_drop_set: set.is_drop_set || false,
                  is_superset: set.is_superset || false,
                  is_amrap: set.is_amrap || false,
                  is_restpause: set.is_restpause || false,
                  is_pyramid: set.is_pyramid || false,
                  is_giant: set.is_giant || false,
                  // Preserve additional properties
                  drop_number: set.drop_number || null,
                  original_weight: set.original_weight || null,
                  superset_with: set.superset_with || null,
                  rest_pauses: set.rest_pauses || null,
                  pyramid_type: set.pyramid_type || null,
                  pyramid_step: set.pyramid_step || null,
                  giant_with: set.giant_with || null
                };
              }
            });

            return {
              ...exercise,
              [field]: value,
              sets: newSets
            };
          }
          return { ...exercise, [field]: value };
        }
        return exercise;
      })
    );
  };

  return (
    <div className="workout-log-container p-4 md:p-6 pb-32">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">Workout Log</h1>
        <div className="flex space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setShowHistory(true)}
            className="bg-indigo-500 hover:bg-indigo-400 text-white py-2 px-4 rounded-lg text-sm md:text-base flex items-center justify-center"
            title="View Workout History"
          >
            <FaHistory className="sm:mr-1" />
            <span className="hidden sm:inline">History</span>
          </button>
          
          <button
            onClick={() => {
              fetchRoutines();
              setShowRoutinesSelector(true);
            }}
            className="bg-blue-500 hover:bg-blue-400 text-white py-2 px-4 rounded-lg text-sm md:text-base flex items-center justify-center"
            title="Select Routine"
          >
            <FaListAlt className="sm:mr-1" />
            <span className="hidden sm:inline">Routines</span>
          </button>
          
          <button
            onClick={() => setShowExerciseSelection(true)}
            className="bg-teal-500 hover:bg-teal-400 text-white py-2 px-4 rounded-lg text-sm md:text-base flex items-center justify-center"
            title="Add Exercise"
          >
            <FaDumbbell className="sm:mr-1" />
            <span className="hidden sm:inline">Add Exercise</span>
          </button>
        </div>
      </div>

      {/* Workout name input */}
      <div className="mb-4">
        <input
          type="text"
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
          placeholder="Workout Name"
          className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-lg font-semibold"
        />
      </div>

      <div className="w-full max-w-lg bg-white dark:bg-gray-800 p-4 rounded-lg mt-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <p className="text-gray-700 dark:text-gray-300 mb-1 sm:mb-0">Start Time</p>
          <div className="relative w-full sm:w-auto">
            <div 
              className="bg-gray-200 dark:bg-gray-600 p-2 rounded-lg cursor-pointer pr-10 flex items-center"
              onClick={() => {
                try {
                  document.getElementById('start-time-picker').showPicker();
                } catch (error) {
                  // Fallback for browsers/PWAs that don't support showPicker()
                  document.getElementById('start-time-picker').focus();
                }
              }}
            >
              <span>{startTime ? formatDateTimeForDisplay(startTime) : "Select date & time"}</span>
              <FaCalendarAlt className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>
            <input
              id="start-time-picker"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <p className="text-gray-700 dark:text-gray-300 mb-1 sm:mb-0">End Time</p>
          <div className="relative w-full sm:w-auto">
            <div 
              className="bg-gray-200 dark:bg-gray-600 p-2 rounded-lg cursor-pointer pr-10 flex items-center"
              onClick={() => {
                try {
                  document.getElementById('end-time-picker').showPicker();
                } catch (error) {
                  // Fallback for browsers/PWAs that don't support showPicker()
                  document.getElementById('end-time-picker').focus();
                }
              }}
            >
              <span>{endTime ? formatDateTimeForDisplay(endTime) : "Select date & time"}</span>
              <FaCalendarAlt className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>
            <input
              id="end-time-picker"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <p className="text-gray-700 dark:text-gray-300 mb-1 sm:mb-0">
            Bodyweight ({weightUnit})
          </p>
          <input
            type="number"
            value={bodyweight}
            onChange={(e) => setBodyweight(e.target.value)}
            className="bg-gray-200 dark:bg-gray-600 p-2 rounded-lg w-full sm:w-auto"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <p className="text-gray-700 dark:text-gray-300 mb-1 sm:mb-0">Weight Unit</p>
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
          placeholder="Add any notes..."
          className="w-full h-24 p-2 bg-gray-200 dark:bg-gray-600 rounded-lg resize-none"
        />
      </div>

      {workoutExercises.map((exercise, exerciseIndex) => (
        <div
          key={`${exercise.name}-${exerciseIndex}`}
          className="exercise-card"
        >
          {/* Exercise header */}
          <div className="flex flex-wrap items-center mb-2">
            <div className="flex-grow mr-2 mb-2 sm:mb-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white" data-sets={`${exercise.sets.length} set${exercise.sets.length !== 1 ? 's' : ''}`}>
                {exercise.name}
              </h3>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {exercise.muscle_group}
              </span>
            </div>
            {/* Exercise control buttons */}
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => handleMoveExercise(exerciseIndex, "up")}
                className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white bg-gray-200 dark:bg-gray-700 p-2 rounded"
                disabled={exerciseIndex === 0}
              >
                <FaArrowUp />
              </button>
              <button
                onClick={() => handleMoveExercise(exerciseIndex, "down")}
                className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white bg-gray-200 dark:bg-gray-700 p-2 rounded"
                disabled={exerciseIndex === workoutExercises.length - 1}
              >
                <FaArrowDown />
              </button>
              <button
                onClick={() => toggleExerciseCollapse(exerciseIndex)}
                className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white bg-gray-200 dark:bg-gray-700 p-2 rounded"
              >
                {collapsedExercises[exerciseIndex] ? (
                  <FaChevronDown />
                ) : (
                  <FaChevronUp />
                )}
              </button>
              <button
                onClick={() => handleDeleteExercise(exerciseIndex)}
                className="text-red-500 hover:text-red-600 bg-gray-200 dark:bg-gray-700 p-2 rounded"
              >
                <FaTrash />
              </button>
              <button
                onClick={() => handleStartRestTimer(exercise)}
                className="text-teal-500 hover:text-teal-600 bg-gray-200 dark:bg-gray-700 p-2 rounded"
              >
                <FaClock />
              </button>
              
              <div className="flex gap-1 mt-1 w-full justify-center flex-wrap">
                <button
                  onClick={() => handleShowExerciseHistory(exercise)}
                  className="text-indigo-500 hover:text-indigo-600 bg-gray-200 dark:bg-gray-700 p-2 rounded flex items-center"
                  title="Exercise History"
                >
                  <FaHistory className="mr-1" />
                  <span className="text-xs">History</span>
                </button>
                
                <button
                  onClick={() => handleShowExerciseCharts(exercise)}
                  className="text-green-500 hover:text-green-600 bg-gray-200 dark:bg-gray-700 p-2 rounded flex items-center"
                  title="Progress Charts"
                >
                  <FaChartBar className="mr-1" />
                  <span className="text-xs">Charts</span>
                </button>
                
                <button
                  onClick={() => handleShowPersonalRecords(exercise)}
                  className="text-yellow-500 hover:text-yellow-600 bg-gray-200 dark:bg-gray-700 p-2 rounded flex items-center"
                  title="Personal Records"
                >
                  <FaTrophy className="mr-1" />
                  <span className="text-xs">Records</span>
                </button>
                
                {!exercise.is_cardio && (
                  <button
                    onClick={() => handleShowSetTypeModal(exercise)}
                    className="text-blue-500 hover:text-blue-600 bg-gray-200 dark:bg-gray-700 p-2 rounded flex items-center"
                    title="Add Set Type (Drop Set, Warm-up, Working)"
                  >
                    <FaListUl className="mr-1" />
                    <span className="text-xs">Set Type</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {!collapsedExercises[exerciseIndex] && (
            <>
              {/* Exercise sets section */}
              <div className="mt-3 exercise-set-container">
                {/* Set headers for each column */}
                <div className={`grid ${exercise.is_cardio ? 'grid-cols-4' : 'grid-cols-4'} gap-1 text-sm font-semibold mb-1 text-gray-600 dark:text-gray-300 items-center px-1 set-headers`}>
                  {!exercise.is_cardio ? (
                    <>
                      <div>Weight ({weightUnit})</div>
                      <div>Reps</div>
                      <div className="col-span-1 text-center">Type</div>
                      <div className="text-right">Action</div>
                    </>
                  ) : (
                    <>
                      <div>Distance (km)</div>
                      <div>Duration (min)</div>
                      <div>Intensity</div>
                      <div className="text-right">Action</div>
                    </>
                  )}
                </div>

                {/* Exercise sets */}
                <div className="exercise-sets">
                  {exercise.sets.map((set, setIndex) => (
                    <div key={setIndex} className="set-row">
                      {!exercise.is_cardio ? (
                        <>
                          <div>
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
                              placeholder="0"
                              className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm weight-input"
                            />
                          </div>
                          <div>
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
                              placeholder="0"
                              className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm reps-input"
                            />
                          </div>
                          <div className="text-center">
                            {set.is_warmup && (
                              <span className="bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs py-1 px-2 rounded-full">
                                Warm-up
                              </span>
                            )}
                            {set.is_drop_set && (
                              <span className="bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs py-1 px-2 rounded-full">
                                Drop {set.drop_number}
                              </span>
                            )}
                            {!set.is_warmup && !set.is_drop_set && (
                              <span className="bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs py-1 px-2 rounded-full">
                                Working
                              </span>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <input
                              type="number"
                              value={set.distance}
                              onChange={(e) =>
                                handleEditSet(
                                  exerciseIndex,
                                  setIndex,
                                  "distance",
                                  e.target.value
                                )
                              }
                              placeholder="0"
                              className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                            />
                          </div>
                          <div>
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
                              placeholder="0"
                              className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                            />
                          </div>
                          <div>
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
                              className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                            >
                              <option value="">-</option>
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                              <option value="Very High">Very High</option>
                            </select>
                          </div>
                        </>
                      )}
                      <div className="text-right">
                        <button
                          onClick={() => handleDeleteSet(exerciseIndex, setIndex)}
                          className="text-red-500 hover:text-red-700 p-1 rounded"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleAddSet(exerciseIndex)}
                  className="mt-2 w-full bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded-lg flex items-center justify-center"
                >
                  <FaPlus className="mr-1" /> Add Set
                </button>
              </div>
            </>
          )}
        </div>
      ))}

      {/* Replace the original buttons with the new component */}
      {/* Action buttons at the bottom */}
      <WorkoutActionButtons 
        onFinishWorkout={handleFinishWorkout}
        onSaveRoutine={() => setShowSaveRoutineModal(true)}
      />

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

      {/* Set Type Modal */}
      {showSetTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Set Type
            </h2>
              <button
                onClick={closeSetTypeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
              >
                <FaTimes />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Select Set Type
              </label>
              <select
                value={selectedSetType}
                onChange={(e) => setSelectedSetType(e.target.value)}
                className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white"
              >
                <option value="drop">Drop Set</option>
                <option value="warmup">Warm-up Set</option>
                <option value="working">Normal Set</option>
                <option value="superset">Superset</option>
                <option value="amrap">AMRAP (As Many Reps As Possible)</option>
                <option value="restpause">Rest-Pause</option>
                <option value="pyramid">Pyramid Set</option>
                <option value="giant">Giant Set</option>
              </select>
            </div>
          
            {/* Conditional content based on selected set type */}
            {selectedSetType === "drop" && (
              <>
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
              </>
            )}

            {selectedSetType === "warmup" && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-4">
                <h3 className="font-medium text-yellow-700 dark:text-yellow-400 mb-2">Warm-up Set</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Warm-up sets are typically performed with lighter weights to prepare your muscles and joints.
                  {!setTypeExercise?.is_cardio && " We suggest using about 70% of your working weight."}
                </p>
                {originalWeight && !setTypeExercise?.is_cardio && (
                  <div className="mt-3 font-medium">
                    Suggested warm-up weight: {(parseFloat(originalWeight) * 0.7).toFixed(1)} {weightUnit}
                  </div>
                )}
              </div>
            )}

            {selectedSetType === "working" && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
                <h3 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Normal Set</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Normal sets are your primary training sets performed at your target intensity.
                </p>
              </div>
            )}
            
            {selectedSetType === "superset" && (
              <div className="mb-4">
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg mb-4">
                  <h3 className="font-medium text-purple-700 dark:text-purple-400 mb-2">Superset</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Supersets are two exercises performed back-to-back with minimal rest between them.
                    Pair {setTypeExercise?.name} with another exercise from your list or catalog.
                  </p>
                </div>
                
                <div className="mb-4">
                  <div className="flex flex-col space-y-2">
              <button
                      onClick={() => setShowSupersetExerciseSelector(true)}
                      className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg flex items-center justify-center"
                    >
                      <FaPlus className="mr-2" /> Select Exercise from Catalog
                    </button>
                    
                    {supersetExerciseId !== null && (
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <p className="font-medium">Selected: {workoutExercises[supersetExerciseId]?.name}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {supersetExerciseId !== null && !setTypeExercise?.is_cardio && !workoutExercises[supersetExerciseId]?.is_cardio && (
                  <>
                    <div className="mb-4">
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">
                        {setTypeExercise?.name} Weight ({weightUnit})
                      </label>
                      <input
                        type="number"
                        value={originalWeight || ""}
                        onChange={(e) => setOriginalWeight(e.target.value)}
                        className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white"
                        placeholder="Enter weight"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">
                        {setTypeExercise?.name} Reps
                      </label>
                      <input
                        type="number"
                        value={dropSetReps}
                        onChange={(e) => setDropSetReps(e.target.value)}
                        className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white"
                        placeholder="Enter reps"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">
                        {workoutExercises[supersetExerciseId]?.name} Weight ({weightUnit})
                      </label>
                      <input
                        type="number"
                        value={supersetWeight}
                        onChange={(e) => setSupersetWeight(e.target.value)}
                        className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white"
                        placeholder="Enter weight"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 dark:text-gray-300 mb-2">
                        {workoutExercises[supersetExerciseId]?.name} Reps
                      </label>
                      <input
                        type="number"
                        value={supersetReps}
                        onChange={(e) => setSupersetReps(e.target.value)}
                        className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white"
                        placeholder="Enter reps"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {selectedSetType === "amrap" && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg mb-4">
                <h3 className="font-medium text-green-700 dark:text-green-400 mb-2">AMRAP Set</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AMRAP (As Many Reps As Possible) sets are performed to technical failure - complete as many reps as you can with good form.
                </p>
                
                <div className="mt-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Weight ({weightUnit})
                  </label>
                  <input
                    type="number"
                    value={originalWeight || ""}
                    onChange={(e) => setOriginalWeight(e.target.value)}
                    className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white"
                    placeholder="Enter weight"
                  />
                </div>
                
                <div className="mt-3">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Target Reps (minimum)
                  </label>
                  <input
                    type="number"
                    value={dropSetReps}
                    onChange={(e) => setDropSetReps(e.target.value)}
                    className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white"
                    placeholder="Enter target reps"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Example: If you aim for at least 8 reps, enter "8"
                  </p>
                </div>
              </div>
            )}

            {selectedSetType === "restpause" && (
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg mb-4">
                <h3 className="font-medium text-orange-700 dark:text-orange-400 mb-2">Rest-Pause Set</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Rest-Pause involves performing a set to failure, resting 15-20 seconds, then continuing with the same weight for additional reps.
                </p>
                
                <div className="mt-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Weight ({weightUnit})
                  </label>
                  <input
                    type="number"
                    value={originalWeight || ""}
                    onChange={(e) => setOriginalWeight(e.target.value)}
                    className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white"
                    placeholder="Enter weight"
                  />
                </div>
                
                <div className="mt-3">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Initial Reps
                  </label>
                  <input
                    type="number"
                    value={dropSetReps}
                    onChange={(e) => setDropSetReps(e.target.value)}
                    className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white"
                    placeholder="Enter initial reps"
                  />
                </div>
                
                <div className="mt-3">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Number of Rest-Pauses
                  </label>
                  <input
                    type="number"
                    value={dropSetCount}
                    onChange={(e) => setDropSetCount(parseInt(e.target.value))}
                    className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white"
                    min="1"
                    max="3"
                    placeholder="How many times to rest-pause"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Typically 1-3 rest-pauses are performed
                  </p>
                </div>
              </div>
            )}

            {selectedSetType === "pyramid" && (
              <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg mb-4">
                <h3 className="font-medium text-pink-700 dark:text-pink-400 mb-2">Pyramid Set</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pyramid sets involve progressively increasing the weight while decreasing reps (ascending), then optionally decreasing weight while increasing reps (descending).
                </p>
                
                <div className="mt-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Starting Weight ({weightUnit})
                  </label>
                  <input
                    type="number"
                    value={originalWeight || ""}
                    onChange={(e) => setOriginalWeight(e.target.value)}
                    className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white"
                    placeholder="Enter starting weight"
                  />
                </div>
                
                <div className="mt-3">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Starting Reps
                  </label>
                  <input
                    type="number"
                    value={dropSetReps}
                    onChange={(e) => setDropSetReps(e.target.value)}
                    className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white"
                    placeholder="Enter starting reps"
                  />
                </div>
                
                <div className="mt-3">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Weight Increment (%)
                  </label>
                  <input
                    type="number"
                    value={dropSetPercentage}
                    onChange={(e) => setDropSetPercentage(parseInt(e.target.value))}
                    className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white"
                    min="5"
                    max="30"
                    placeholder="Weight increment percentage"
                  />
                </div>
                
                <div className="mt-3">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Number of Steps
                  </label>
                  <input
                    type="number"
                    value={dropSetCount}
                    onChange={(e) => setDropSetCount(parseInt(e.target.value))}
                    className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white"
                    min="2"
                    max="5"
                    placeholder="How many steps in the pyramid"
                  />
                </div>
                
                <div className="mt-3 flex items-center">
                  <input
                    type="checkbox"
                    id="fullPyramid"
                    className="mr-2"
                    checked={fullPyramidChecked}
                    onChange={(e) => setFullPyramidChecked(e.target.checked)}
                  />
                  <label htmlFor="fullPyramid" className="text-gray-700 dark:text-gray-300">
                    Full Pyramid (ascending + descending)
                  </label>
                </div>
              </div>
            )}

            {selectedSetType === "giant" && (
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg mb-4">
                <h3 className="font-medium text-indigo-700 dark:text-indigo-400 mb-2">Giant Set</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Giant sets link 3 or more exercises performed back-to-back with minimal rest. Select multiple exercises to include in your giant set.
                </p>
                
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium">1. {setTypeExercise?.name}</p>
                    <span className="text-xs bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full">
                      Primary Exercise
                    </span>
                  </div>
                  
                  {!setTypeExercise?.is_cardio && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400">
                          Weight ({weightUnit})
                        </label>
                        <input
                          type="number"
                          value={originalWeight || ""}
                          onChange={(e) => setOriginalWeight(e.target.value)}
                          className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white"
                          placeholder="Weight"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400">
                          Reps
                        </label>
                        <input
                          type="number"
                          value={dropSetReps}
                          onChange={(e) => setDropSetReps(e.target.value)}
                          className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white"
                          placeholder="Reps"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mb-3">
                    <button
                      onClick={() => setShowSupersetExerciseSelector(true)}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg flex items-center justify-center"
                    >
                      <FaPlus className="mr-2" /> Add Exercise to Giant Set
                    </button>
                    
                    {supersetExerciseId !== null && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">2. {workoutExercises[supersetExerciseId]?.name}</p>
                        </div>
                        
                        {!workoutExercises[supersetExerciseId]?.is_cardio && (
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            <div>
                              <label className="text-sm text-gray-600 dark:text-gray-400">
                                Weight ({weightUnit})
                              </label>
                              <input
                                type="number"
                                value={supersetWeight}
                                onChange={(e) => setSupersetWeight(e.target.value)}
                                className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white"
                                placeholder="Weight"
                              />
                            </div>
                            <div>
                              <label className="text-sm text-gray-600 dark:text-gray-400">
                                Reps
                              </label>
                              <input
                                type="number"
                                value={supersetReps}
                                onChange={(e) => setSupersetReps(e.target.value)}
                                className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white"
                                placeholder="Enter reps"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Future enhancement: Add support for more exercises in the giant set */}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between space-x-3 mt-6">
              <button
                className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white py-2 rounded-lg"
                onClick={closeSetTypeModal}
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg"
                onClick={handleAddSetByType}
              >
                {getButtonText()}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Exercise History Modal */}
      {showExerciseHistoryModal && selectedExerciseForHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Exercise History: {selectedExerciseForHistory.name}
              </h2>
              <button
                onClick={() => setShowExerciseHistoryModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
              >
                <FaTimes />
              </button>
            </div>
            
            {/* Summary and trend for strength exercises */}
            {!selectedExerciseForHistory.is_cardio && (
              <div className="mb-4 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                {(() => {
                  const relevantWorkouts = workoutHistory
                    .filter(workout => 
                      workout.exercises?.some(ex => 
                        ex.name === selectedExerciseForHistory.name
                      )
                    )
                    .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
                    
                  if (relevantWorkouts.length >= 2) {
                    const latestWorkout = relevantWorkouts[0];
                    const previousWorkout = relevantWorkouts[1];
                    
                    const latestExercise = latestWorkout.exercises.find(ex => 
                      ex.name === selectedExerciseForHistory.name
                    );
                    const previousExercise = previousWorkout.exercises.find(ex => 
                      ex.name === selectedExerciseForHistory.name
                    );
                    
                    // Find best sets from each workout
                    const getMaxWeightSet = (exercise) => {
                      return exercise.sets.reduce((best, current) => {
                        return (parseFloat(current.weight || 0) > parseFloat(best.weight || 0)) ? current : best;
                      }, exercise.sets[0] || {});
                    };
                    
                    const latestBestSet = getMaxWeightSet(latestExercise);
                    const previousBestSet = getMaxWeightSet(previousExercise);
                    
                    const weightDiff = parseFloat(latestBestSet.weight || 0) - parseFloat(previousBestSet.weight || 0);
                    const percentChange = (previousBestSet.weight && previousBestSet.weight > 0) 
                      ? ((weightDiff / parseFloat(previousBestSet.weight)) * 100).toFixed(1)
                      : 0;
                    
                    return (
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-gray-200">Trend Analysis</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Performance compared to your previous workout
                          </p>
                        </div>
                        <div className={`flex items-center ${weightDiff > 0 ? 'text-green-600 dark:text-green-400' : weightDiff < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                          <span className="text-xl font-bold mr-2">
                            {weightDiff > 0 ? '+' : ''}{weightDiff} {weightUnit}
                          </span>
                          <span className="text-sm">
                            ({weightDiff > 0 ? '+' : ''}{percentChange}%)
                            {weightDiff > 0 ? <FaArrowUp className="inline ml-1" /> : weightDiff < 0 ? <FaArrowDown className="inline ml-1" /> : null}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <p className="text-gray-600 dark:text-gray-400">
                      Not enough history to show performance trend. Continue logging your workouts!
                    </p>
                  );
                })()}
              </div>
            )}
            
            {/* Summary and trend for cardio exercises */}
            {selectedExerciseForHistory.is_cardio && (
              <div className="mb-4 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                {(() => {
                  const relevantWorkouts = workoutHistory
                    .filter(workout => 
                      workout.exercises?.some(ex => 
                        ex.name === selectedExerciseForHistory.name
                      )
                    )
                    .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
                    
                  if (relevantWorkouts.length >= 2) {
                    const latestWorkout = relevantWorkouts[0];
                    const previousWorkout = relevantWorkouts[1];
                    
                    const latestExercise = latestWorkout.exercises.find(ex => 
                      ex.name === selectedExerciseForHistory.name
                    );
                    const previousExercise = previousWorkout.exercises.find(ex => 
                      ex.name === selectedExerciseForHistory.name
                    );
                    
                    // Calculate total distance for comparison
                    const getDistanceTotal = (exercise) => {
                      return exercise.sets.reduce((total, current) => {
                        return total + parseFloat(current.distance || 0);
                      }, 0);
                    };
                    
                    const latestDistance = getDistanceTotal(latestExercise);
                    const previousDistance = getDistanceTotal(previousExercise);
                    
                    const distanceDiff = latestDistance - previousDistance;
                    const percentChange = (previousDistance > 0) 
                      ? ((distanceDiff / previousDistance) * 100).toFixed(1)
                      : 0;
                    
                    return (
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-gray-200">Distance Trend</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Performance compared to your previous session
                          </p>
                        </div>
                        <div className={`flex items-center ${distanceDiff > 0 ? 'text-green-600 dark:text-green-400' : distanceDiff < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                          <span className="text-xl font-bold mr-2">
                            {distanceDiff > 0 ? '+' : ''}{distanceDiff.toFixed(2)} km
                          </span>
                          <span className="text-sm">
                            ({distanceDiff > 0 ? '+' : ''}{percentChange}%)
                            {distanceDiff > 0 ? <FaArrowUp className="inline ml-1" /> : distanceDiff < 0 ? <FaArrowDown className="inline ml-1" /> : null}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <p className="text-gray-600 dark:text-gray-400">
                      Not enough history to show performance trend. Continue logging your cardio sessions!
                    </p>
                  );
                })()}
              </div>
            )}
            
            <div className="mb-4 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Recent Performance</h3>
                <div className="text-sm">
                  <select 
                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm"
                    onChange={(e) => {
                      const sortedHistory = [...workoutHistory].sort((a, b) => {
                        if (e.target.value === "date-desc") {
                          return new Date(b.start_time) - new Date(a.start_time);
                        } else if (e.target.value === "date-asc") {
                          return new Date(a.start_time) - new Date(b.start_time);
                        } else if (e.target.value === "performance-desc") {
                          const exA = a.exercises.find(ex => ex.name === selectedExerciseForHistory.name);
                          const exB = b.exercises.find(ex => ex.name === selectedExerciseForHistory.name);
                          
                          if (selectedExerciseForHistory.is_cardio) {
                            // Compare by distance
                            const distA = exA.sets.reduce((total, set) => total + parseFloat(set.distance || 0), 0);
                            const distB = exB.sets.reduce((total, set) => total + parseFloat(set.distance || 0), 0);
                            return distB - distA;
                          } else {
                            // Compare by max weight
                            const maxWeightA = Math.max(...exA.sets.map(set => parseFloat(set.weight || 0)));
                            const maxWeightB = Math.max(...exB.sets.map(set => parseFloat(set.weight || 0)));
                            return maxWeightB - maxWeightA;
                          }
                        }
                        return 0;
                      });
                      setWorkoutHistory(sortedHistory);
                    }}
                  >
                    <option value="date-desc">Most Recent</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="performance-desc">Best Performance</option>
                  </select>
                </div>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Workout</th>
                    <th className="text-center py-2">Sets</th>
                    <th className="text-center py-2">Best Set</th>
                  </tr>
                </thead>
                <tbody>
                  {workoutHistory
                    .filter(workout => 
                      workout.exercises?.some(ex => 
                        ex.name === selectedExerciseForHistory.name
                      )
                    )
                    .slice(0, 5)
                    .map((workout, idx) => {
                      const exercise = workout.exercises.find(ex => 
                        ex.name === selectedExerciseForHistory.name
                      );
                      const bestSet = exercise.sets.reduce((best, current) => {
                        // For strength exercises
                        if (!exercise.is_cardio) {
                          // Calculate "effective weight" (weight × reps) and compare
                          const currentEffective = parseFloat(current.weight || 0) * parseFloat(current.reps || 0);
                          const bestEffective = parseFloat(best.weight || 0) * parseFloat(best.reps || 0);
                          return currentEffective > bestEffective ? current : best;
                        }
                        // For cardio, compare by distance (if available) or duration
                        else if (current.distance && best.distance) {
                          return parseFloat(current.distance) > parseFloat(best.distance) ? current : best;
                        } else {
                          return parseFloat(current.duration || 0) > parseFloat(best.duration || 0) ? current : best;
                        }
                      }, exercise.sets[0] || {});
                      
                      return (
                        <tr key={idx} className="border-b border-gray-200 dark:border-gray-600">
                          <td className="py-2">{formatDateTimeForDisplay(workout.start_time)}</td>
                          <td className="py-2">{workout.name}</td>
                          <td className="py-2 text-center">{exercise.sets.length}</td>
                          <td className="py-2 text-center">
                            {!exercise.is_cardio ? (
                              `${bestSet.weight || 0} ${weightUnit} × ${bestSet.reps || 0}`
                            ) : (
                              bestSet.distance ? 
                                `${bestSet.distance} km (${bestSet.duration || 0} min)` : 
                                `${bestSet.duration || 0} min`
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  {workoutHistory.filter(workout => 
                    workout.exercises?.some(ex => 
                      ex.name === selectedExerciseForHistory.name
                    )).length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-4 text-center text-gray-500 dark:text-gray-400">
                        No history found for this exercise.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="text-center">
              <button
                onClick={() => {
                  setShowExerciseHistoryModal(false);
                  navigate("/workout-history", { 
                    state: { 
                      filterExercise: selectedExerciseForHistory.name 
                    } 
                  });
                }}
                className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg inline-flex items-center"
              >
                <FaHistory className="mr-2" />
                View Complete History
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Exercise Charts Modal */}
      {showExerciseChartsModal && selectedExerciseForHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Progress Charts: {selectedExerciseForHistory.name}
              </h2>
              <button
                onClick={() => setShowExerciseChartsModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              {(() => {
                // Filter workouts for this exercise
                const relevantWorkouts = workoutHistory
                  .filter(workout => 
                    workout.exercises?.some(ex => 
                      ex.name === selectedExerciseForHistory.name
                    )
                  )
                  .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
                
                if (relevantWorkouts.length < 2) {
                  return (
                    <div className="text-center py-8">
                      <FaChartBar className="text-5xl text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        Not enough workout data to generate meaningful charts. Keep logging your workouts!
                      </p>
                    </div>
                  );
                }
                
                if (!selectedExerciseForHistory.is_cardio) {
                  // For strength exercises - basic visualization
                  const maxWeights = relevantWorkouts.map(workout => {
                    const exercise = workout.exercises.find(ex => 
                      ex.name === selectedExerciseForHistory.name
                    );
                    const maxWeight = Math.max(...exercise.sets.map(set => 
                      parseFloat(set.weight || 0)
                    ));
                    return maxWeight;
                  });
                  
                  const firstWeight = maxWeights[0];
                  const lastWeight = maxWeights[maxWeights.length - 1];
                  const improvement = lastWeight - firstWeight;
                  const percentChange = ((improvement / firstWeight) * 100).toFixed(1);
                  
                  return (
                    <>
                      <div className="mb-6">
                        <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Weight Progression</h3>
                        <div className="h-64 bg-white dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-600 flex flex-col p-4">
                          <div className="flex-1 relative">
                            {/* Simple bar chart */}
                            <div className="absolute inset-0 flex items-end">
                              {maxWeights.map((weight, i) => {
                                const maxVal = Math.max(...maxWeights);
                                const height = (weight / maxVal) * 100;
                                const width = 100 / maxWeights.length;
                                
                                return (
                                  <div 
                                    key={i}
                                    className="mx-0.5 flex-1 bg-indigo-500 hover:bg-indigo-400 transition-all relative group"
                                    style={{ height: `${height}%` }}
                                    title={`${formatDateForDisplay(relevantWorkouts[i].start_time)}: ${weight} ${weightUnit}`}
                                  >
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                      {weight} {weightUnit}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <div className="h-6 mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>{formatDateForDisplay(relevantWorkouts[0].start_time)}</span>
                            <span>{formatDateForDisplay(relevantWorkouts[relevantWorkouts.length - 1].start_time)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-900 p-4 rounded">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Starting Weight</p>
                            <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{firstWeight} {weightUnit}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Current Weight</p>
                            <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{lastWeight} {weightUnit}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Improvement</p>
                            <p className={`text-xl font-bold ${improvement > 0 ? 'text-green-600 dark:text-green-400' : improvement < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                              {improvement > 0 ? '+' : ''}{improvement} {weightUnit}
                              <span className="text-sm ml-1">({percentChange}%)</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                } else {
                  // For cardio exercises - basic visualization
                  const distances = relevantWorkouts.map(workout => {
                    const exercise = workout.exercises.find(ex => 
                      ex.name === selectedExerciseForHistory.name
                    );
                    const totalDistance = exercise.sets.reduce((sum, set) => 
                      sum + parseFloat(set.distance || 0), 0
                    );
                    return totalDistance;
                  });
                  
                  const firstDistance = distances[0];
                  const lastDistance = distances[distances.length - 1];
                  const improvement = lastDistance - firstDistance;
                  const percentChange = ((improvement / firstDistance) * 100).toFixed(1);
                  
                  return (
                    <>
                      <div className="mb-6">
                        <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Distance Progression</h3>
                        <div className="h-64 bg-white dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-600 flex flex-col p-4">
                          <div className="flex-1 relative">
                            {/* Simple bar chart */}
                            <div className="absolute inset-0 flex items-end">
                              {distances.map((distance, i) => {
                                const maxVal = Math.max(...distances);
                                const height = (distance / maxVal) * 100;
                                const width = 100 / distances.length;
                                
                                return (
                                  <div 
                                    key={i}
                                    className="mx-0.5 flex-1 bg-green-500 hover:bg-green-400 transition-all relative group"
                                    style={{ height: `${height}%` }}
                                    title={`${formatDateForDisplay(relevantWorkouts[i].start_time)}: ${distance.toFixed(1)} km`}
                                  >
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                      {distance.toFixed(1)} km
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <div className="h-6 mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>{formatDateForDisplay(relevantWorkouts[0].start_time)}</span>
                            <span>{formatDateForDisplay(relevantWorkouts[relevantWorkouts.length - 1].start_time)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-900 p-4 rounded">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Starting Distance</p>
                            <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{firstDistance.toFixed(1)} km</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Current Distance</p>
                            <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{lastDistance.toFixed(1)} km</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Improvement</p>
                            <p className={`text-xl font-bold ${improvement > 0 ? 'text-green-600 dark:text-green-400' : improvement < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                              {improvement > 0 ? '+' : ''}{improvement.toFixed(1)} km
                              <span className="text-sm ml-1">({percentChange}%)</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                }
              })()}
            </div>
            
            <div className="text-center">
              <button
                onClick={() => {
                  setShowExerciseChartsModal(false);
                  navigate("/progress-tracker", { 
                    state: { 
                      activeExercise: selectedExerciseForHistory.name 
                    } 
                  });
                }}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg inline-flex items-center"
              >
                <FaChartBar className="mr-2" />
                View Full Progress Charts
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Personal Records Modal */}
      {showPersonalRecordsModal && selectedExerciseForHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Personal Records: {selectedExerciseForHistory.name}
              </h2>
              <button
                onClick={() => setShowPersonalRecordsModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4">
              {!selectedExerciseForHistory.is_cardio ? (
                <>
                  {/* For strength exercises */}
                  {(() => {
                    // Find best weight set
                    let bestWeightSet = { weight: 0, reps: 0, date: null };
                    let bestRepsSet = { weight: 0, reps: 0, date: null };
                    
                    // Progress history for timeline
                    const progressHistory = [];
                    
                    // Go through workout history to find PR sets
                    workoutHistory
                      .filter(workout => 
                        workout.exercises?.some(ex => 
                          ex.name === selectedExerciseForHistory.name
                        )
                      )
                      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
                      .forEach(workout => {
                        const exercise = workout.exercises.find(ex => 
                          ex.name === selectedExerciseForHistory.name
                        );
                        
                        let workoutBestWeight = { weight: 0, reps: 0 };
                        
                        exercise.sets.forEach(set => {
                          // Find best weight in this workout
                          if (parseFloat(set.weight || 0) > parseFloat(workoutBestWeight.weight || 0)) {
                            workoutBestWeight = {
                              ...set,
                              date: workout.start_time
                            };
                          }
                          
                          // Find all-time best weight
                          if (parseFloat(set.weight || 0) > parseFloat(bestWeightSet.weight || 0)) {
                            bestWeightSet = {
                              ...set,
                              date: workout.start_time
                            };
                          }
                          
                          // Find all-time best reps
                          if (parseFloat(set.reps || 0) > parseFloat(bestRepsSet.reps || 0)) {
                            bestRepsSet = {
                              ...set,
                              date: workout.start_time
                            };
                          }
                        });
                        
                        // Add to progress history for timeline
                        if (workoutBestWeight.weight > 0) {
                          progressHistory.push({
                            date: workout.start_time,
                            weight: workoutBestWeight.weight,
                            reps: workoutBestWeight.reps
                          });
                        }
                      });
                    
                    // Calculate lifetime improvement
                    let lifetimeImprovement = 0;
                    let improvementPercent = 0;
                    
                    if (progressHistory.length >= 2) {
                      const firstRecord = progressHistory[0];
                      const lastRecord = progressHistory[progressHistory.length - 1];
                      
                      lifetimeImprovement = parseFloat(lastRecord.weight) - parseFloat(firstRecord.weight);
                      improvementPercent = ((lifetimeImprovement / parseFloat(firstRecord.weight)) * 100).toFixed(1);
                    }
                    
                    return (
                      <>
                        <div className="mb-4">
                          <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center">
                            <FaTrophy className="text-yellow-500 mr-2" /> Max Weight
                          </h3>
                          <div className="mt-2 bg-white dark:bg-gray-700 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                            {bestWeightSet.weight ? (
                              <>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                                  {bestWeightSet.weight} {weightUnit}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Achieved on {bestWeightSet.date ? formatDateForDisplay(bestWeightSet.date) : 'N/A'} • {bestWeightSet.reps} reps
                                </p>
                              </>
                            ) : (
                              <p className="text-gray-600 dark:text-gray-400">No records found</p>
                            )}
                          </div>
                        </div>
                        <div className="mb-4">
                          <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center">
                            <FaTrophy className="text-yellow-500 mr-2" /> Max Reps
                          </h3>
                          <div className="mt-2 bg-white dark:bg-gray-700 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                            {bestRepsSet.reps ? (
                              <>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                                  {bestRepsSet.reps} reps
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Achieved on {bestRepsSet.date ? formatDateForDisplay(bestRepsSet.date) : 'N/A'} • {bestRepsSet.weight} {weightUnit}
                                </p>
                              </>
                            ) : (
                              <p className="text-gray-600 dark:text-gray-400">No records found</p>
                            )}
                          </div>
                        </div>
                        
                        {progressHistory.length >= 2 && (
                          <div className="mt-4 pt-4 border-t border-yellow-200 dark:border-yellow-800">
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">Progress Timeline</h3>
                            <div className="h-24 relative mt-4">
                              {/* Timeline line */}
                              <div className="absolute left-0 right-0 top-1/2 h-1 bg-yellow-200 dark:bg-yellow-800 transform -translate-y-1/2"></div>
                              
                              {/* Markers */}
                              {progressHistory.map((record, idx) => {
                                // Calculate position percentage based on time
                                const firstDate = new Date(progressHistory[0].date).getTime();
                                const lastDate = new Date(progressHistory[progressHistory.length - 1].date).getTime();
                                const currentDate = new Date(record.date).getTime();
                                
                                const position = ((currentDate - firstDate) / (lastDate - firstDate)) * 100;
                                
                                // Calculate size based on weight (relative to max)
                                const maxWeight = Math.max(...progressHistory.map(r => parseFloat(r.weight)));
                                const minWeight = Math.min(...progressHistory.map(r => parseFloat(r.weight)));
                                const weightRange = maxWeight - minWeight;
                                
                                const sizePercentage = weightRange === 0 ? 
                                  50 : // If all weights are the same
                                  ((parseFloat(record.weight) - minWeight) / weightRange) * 70 + 30; // 30-100% size range
                                
                                return (
                                  <div
                                    key={idx}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:z-10"
                                    style={{ 
                                      left: `${position}%`, 
                                      top: '50%',
                                      transition: 'all 0.2s ease'
                                    }}
                                    title={`${formatDateForDisplay(record.date)}: ${record.weight} ${weightUnit} × ${record.reps} reps`}
                                  >
                                    <div 
                                      className={`rounded-full flex items-center justify-center text-xs text-white 
                                        ${idx === 0 ? 'bg-blue-500' : 
                                          idx === progressHistory.length - 1 ? 'bg-green-500' : 
                                          'bg-yellow-500'}`}
                                      style={{ 
                                        width: `${sizePercentage}px`, 
                                        height: `${sizePercentage}px`
                                      }}
                                    >
                                      {record.weight}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                              <span>{formatDateForDisplay(progressHistory[0].date)}</span>
                              <span>{formatDateForDisplay(progressHistory[progressHistory.length - 1].date)}</span>
                            </div>
                            
                            <div className="mt-3 bg-white dark:bg-gray-700 p-2 rounded">
                              <p className="text-sm">
                                <span className="font-medium">Lifetime improvement:</span> 
                                <span className={lifetimeImprovement > 0 ? 'text-green-600 dark:text-green-400 ml-1' : 'text-gray-600 dark:text-gray-400 ml-1'}>
                                  {lifetimeImprovement > 0 ? '+' : ''}{lifetimeImprovement} {weightUnit} ({improvementPercent}%)
                                </span>
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </>
              ) : (
                <>
                  {/* For cardio exercises */}
                  {(() => {
                    // Find best distance and pace
                    let bestDistance = { distance: 0, duration: 0, date: null };
                    let bestPace = { distance: 0, duration: 0, date: null, pace: Infinity };
                    
                    // Progress history for timeline
                    const progressHistory = [];
                    
                    // Go through workout history to find PR sets
                    workoutHistory
                      .filter(workout => 
                        workout.exercises?.some(ex => 
                          ex.name === selectedExerciseForHistory.name
                        )
                      )
                      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
                      .forEach(workout => {
                        const exercise = workout.exercises.find(ex => 
                          ex.name === selectedExerciseForHistory.name
                        );
                        
                        let workoutBestDistance = { distance: 0, duration: 0 };
                        
                        exercise.sets.forEach(set => {
                          // Find best distance in this workout
                          if (parseFloat(set.distance || 0) > parseFloat(workoutBestDistance.distance || 0)) {
                            workoutBestDistance = {
                              ...set,
                              date: workout.start_time
                            };
                          }
                          
                          // Find all-time best distance
                          if (parseFloat(set.distance || 0) > parseFloat(bestDistance.distance || 0)) {
                            bestDistance = {
                              ...set,
                              date: workout.start_time
                            };
                          }
                          
                          // Find best pace (if both distance and duration are available)
                          if (set.distance && set.duration) {
                            const pace = parseFloat(set.duration) / parseFloat(set.distance);
                            if (pace < bestPace.pace) {
                              bestPace = {
                                ...set,
                                date: workout.start_time,
                                pace: pace
                              };
                            }
                          }
                        });
                        
                        // Add to progress history for timeline
                        if (workoutBestDistance.distance > 0) {
                          progressHistory.push({
                            date: workout.start_time,
                            distance: workoutBestDistance.distance,
                            duration: workoutBestDistance.duration
                          });
                        }
                      });
                    
                    // Calculate lifetime improvement
                    let distanceImprovement = 0;
                    let improvementPercent = 0;
                    
                    if (progressHistory.length >= 2) {
                      const firstRecord = progressHistory[0];
                      const lastRecord = progressHistory[progressHistory.length - 1];
                      
                      distanceImprovement = parseFloat(lastRecord.distance) - parseFloat(firstRecord.distance);
                      improvementPercent = ((distanceImprovement / parseFloat(firstRecord.distance)) * 100).toFixed(1);
                    }
                    
                    return (
                      <>
                        <div className="mb-4">
                          <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center">
                            <FaTrophy className="text-yellow-500 mr-2" /> Max Distance
                          </h3>
                          <div className="mt-2 bg-white dark:bg-gray-700 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                            {bestDistance.distance ? (
                              <>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                                  {bestDistance.distance} km
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Achieved on {bestDistance.date ? formatDateForDisplay(bestDistance.date) : 'N/A'} • {bestDistance.duration} minutes
                                </p>
                              </>
                            ) : (
                              <p className="text-gray-600 dark:text-gray-400">No records found</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center">
                            <FaTrophy className="text-yellow-500 mr-2" /> Best Pace
                          </h3>
                          <div className="mt-2 bg-white dark:bg-gray-700 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                            {bestPace.pace && bestPace.pace !== Infinity ? (
                              <>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                                  {bestPace.pace.toFixed(2)} min/km
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Achieved on {bestPace.date ? formatDateForDisplay(bestPace.date) : 'N/A'} • {bestPace.distance} km
                                </p>
                              </>
                            ) : (
                              <p className="text-gray-600 dark:text-gray-400">No records found</p>
                            )}
                          </div>
                        </div>
                        
                        {progressHistory.length >= 2 && (
                          <div className="mt-4 pt-4 border-t border-yellow-200 dark:border-yellow-800">
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">Distance Progress</h3>
                            <div className="h-24 relative mt-4">
                              {/* Timeline line */}
                              <div className="absolute left-0 right-0 top-1/2 h-1 bg-yellow-200 dark:bg-yellow-800 transform -translate-y-1/2"></div>
                              
                              {/* Markers */}
                              {progressHistory.map((record, idx) => {
                                // Calculate position percentage based on time
                                const firstDate = new Date(progressHistory[0].date).getTime();
                                const lastDate = new Date(progressHistory[progressHistory.length - 1].date).getTime();
                                const currentDate = new Date(record.date).getTime();
                                
                                const position = ((currentDate - firstDate) / (lastDate - firstDate)) * 100;
                                
                                // Calculate size based on distance (relative to max)
                                const maxDistance = Math.max(...progressHistory.map(r => parseFloat(r.distance)));
                                const minDistance = Math.min(...progressHistory.map(r => parseFloat(r.distance)));
                                const distanceRange = maxDistance - minDistance;
                                
                                const sizePercentage = distanceRange === 0 ? 
                                  50 : // If all distances are the same
                                  ((parseFloat(record.distance) - minDistance) / distanceRange) * 70 + 30; // 30-100% size range
                                
                                return (
                                  <div
                                    key={idx}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:z-10"
                                    style={{ 
                                      left: `${position}%`, 
                                      top: '50%',
                                      transition: 'all 0.2s ease'
                                    }}
                                    title={`${formatDateForDisplay(record.date)}: ${record.distance} km in ${record.duration} min`}
                                  >
                                    <div 
                                      className={`rounded-full flex items-center justify-center text-xs text-white 
                                        ${idx === 0 ? 'bg-blue-500' : 
                                          idx === progressHistory.length - 1 ? 'bg-green-500' : 
                                          'bg-yellow-500'}`}
                                      style={{ 
                                        width: `${sizePercentage}px`, 
                                        height: `${sizePercentage}px`
                                      }}
                                    >
                                      {parseFloat(record.distance).toFixed(1)}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                              <span>{formatDateForDisplay(progressHistory[0].date)}</span>
                              <span>{formatDateForDisplay(progressHistory[progressHistory.length - 1].date)}</span>
                            </div>
                            
                            <div className="mt-3 bg-white dark:bg-gray-700 p-2 rounded">
                              <p className="text-sm">
                                <span className="font-medium">Lifetime improvement:</span> 
                                <span className={distanceImprovement > 0 ? 'text-green-600 dark:text-green-400 ml-1' : 'text-gray-600 dark:text-gray-400 ml-1'}>
                                  {distanceImprovement > 0 ? '+' : ''}{distanceImprovement.toFixed(2)} km ({improvementPercent}%)
                                </span>
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </>
              )}
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                These are your personal records for {selectedExerciseForHistory.name}. Keep pushing to beat them!
              </p>
              <button
                onClick={() => {
                  setShowPersonalRecordsModal(false);
                  navigate("/personal-records");
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg inline-flex items-center"
              >
                <FaTrophy className="mr-2" />
                View All Personal Records
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add the missing superset exercise selector modal */}
      {showSupersetExerciseSelector && (
        <AddExercise
          onClose={() => setShowSupersetExerciseSelector(false)}
          onSelectExercise={(exercise) => {
            // Find the exercise in the current workout
            const exerciseIndex = workoutExercises.findIndex(ex => ex.name === exercise.name);
            
            if (exerciseIndex !== -1) {
              // If the exercise is already in the workout, use its index
              setSupersetExerciseId(exerciseIndex);
            } else {
              // If not in workout yet, add it first then use its index
              setWorkoutExercises(prevExercises => {
                // Create default sets for the exercise
                let newExercise = {
                  name: exercise.name,
                  category: exercise.category,
                  is_cardio: exercise.is_cardio,
                  sets: []
                };
                
                // Add appropriate number of sets
                const initialSets = exercise.initialSets || 1;
                if (exercise.is_cardio) {
                  for (let i = 0; i < initialSets; i++) {
                    newExercise.sets.push({
                      duration: "",
                      distance: "",
                      intensity: ""
                    });
                  }
                } else {
                  for (let i = 0; i < initialSets; i++) {
                    newExercise.sets.push({
                      weight: "",
                      reps: "",
                      is_warmup: false
                    });
                  }
                }
                
                const newExercises = [...prevExercises, newExercise];
                setSupersetExerciseId(newExercises.length - 1);
                return newExercises;
              });
            }
            
            setShowSupersetExerciseSelector(false);
          }}
        />
      )}
    </div>
  );
}

export default WorkoutLog;
