import React, { useState, useEffect, useCallback, useRef } from "react";
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
  FaDumbbell,
  FaSort,
  FaGripVertical,
  FaLayerGroup,
  FaChartLine,
  FaWeightHanging,
  FaEllipsisV,
  FaExclamationTriangle
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

// Weight conversion utility functions
const kgToLbs = (kg) => {
  if (!kg || isNaN(parseFloat(kg))) return "";
  return (parseFloat(kg) * 2.20462).toFixed(1);
};

const lbsToKg = (lbs) => {
  if (!lbs || isNaN(parseFloat(lbs))) return "";
  return (parseFloat(lbs) / 2.20462).toFixed(1);
};

// Define a new function to format the current time in the required format for datetime-local input
const getCurrentTimeForInput = () => {
  const now = new Date();
  
  // Format with local timezone consideration
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const WorkoutLog = () => {
  const [workoutName, setWorkoutName] = useState("");
  const [startTime, setStartTime] = useState(getCurrentTimeForInput());
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
  const [dropSetCount, setDropSetCount] = useState(2); // Default: top set + 1 drop
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
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [exerciseReorderList, setExerciseReorderList] = useState([]);
  const [draggedExerciseIndex, setDraggedExerciseIndex] = useState(null);
  const [timerRunningInBackground, setTimerRunningInBackground] = useState(false);
  const [showLoadConfirmation, setShowLoadConfirmation] = useState(false);
  const [workoutToLoad, setWorkoutToLoad] = useState(null);
  const [exerciseMemory, setExerciseMemory] = useState({});

  // Load exercise memory from localStorage and backend
  useEffect(() => {
    // First load from localStorage as a fallback
    const savedMemory = localStorage.getItem('exerciseMemory');
    if (savedMemory) {
      try {
        setExerciseMemory(JSON.parse(savedMemory));
      } catch (error) {
        console.error('Error loading exercise memory from localStorage:', error);
      }
    }
    
    // Then try to load from backend (will override localStorage values)
    fetchExerciseMemory();
  }, []);
  
  // Function to fetch exercise memory from backend
  const fetchExerciseMemory = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/exercise-memory`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setExerciseMemory(data);
        
        // Also update localStorage for offline fallback
        localStorage.setItem('exerciseMemory', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error fetching exercise memory from backend:', error);
    }
  };
  
  // Function to save exercise memory to backend
  const saveExerciseMemory = async (updatedMemory) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/exercise-memory`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedMemory)
      });
      
      if (!response.ok) {
        console.error('Failed to save exercise memory to backend:', response.status);
      }
    } catch (error) {
      console.error('Error saving exercise memory to backend:', error);
    }
  };

  // Load weight unit preference from localStorage on component mount
  useEffect(() => {
    const storedWeightUnit = localStorage.getItem("weightUnit");
    if (storedWeightUnit && (storedWeightUnit === "kg" || storedWeightUnit === "lbs")) {
      setWeightUnit(storedWeightUnit);
    }
    // Also try to load from user preferences later
  }, []);

  // Function to toggle weight unit and convert all weights
  const toggleWeightUnit = () => {
    const newUnit = weightUnit === "kg" ? "lbs" : "kg";
    
    // Convert bodyweight
    if (bodyweight) {
      const convertedBodyweight = weightUnit === "kg" 
        ? kgToLbs(bodyweight) 
        : lbsToKg(bodyweight);
      setBodyweight(convertedBodyweight);
    }
    
    // Convert all exercise weights
    setWorkoutExercises(prev => 
      prev.map(exercise => {
        if (!exercise.is_cardio) {
          return {
            ...exercise,
            sets: exercise.sets.map(set => {
              const convertedWeight = weightUnit === "kg" 
                ? kgToLbs(set.weight) 
                : lbsToKg(set.weight);
              
              const convertedOriginalWeight = set.original_weight 
                ? (weightUnit === "kg" 
                    ? kgToLbs(set.original_weight) 
                    : lbsToKg(set.original_weight))
                : set.original_weight;
              
              return {
                ...set,
                weight: convertedWeight,
                original_weight: convertedOriginalWeight
              };
            })
          };
        }
        return exercise;
      })
    );
    
    // Update state and save preference
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
        workoutCopy.bodyweight = lbsToKg(workoutCopy.bodyweight);
      }

      // Convert all exercise weights
      if (workoutCopy.exercises && Array.isArray(workoutCopy.exercises)) {
        workoutCopy.exercises.forEach(exercise => {
          if (!exercise.is_cardio && exercise.sets && Array.isArray(exercise.sets)) {
            exercise.sets.forEach(set => {
              if (set.weight) {
                set.weight = lbsToKg(set.weight);
              }
              if (set.original_weight) {
                set.original_weight = lbsToKg(set.original_weight);
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

    // Show the load confirmation dialog
    handleShowWorkoutLoadOptions(routine);
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
    // Check if data is filled in properly
    let hasValidData = false;
    
    if (exercise.is_cardio) {
      // For cardio exercises, check if distance, duration and intensity are filled
      hasValidData = exercise.sets.every(set => 
        (set.distance && String(set.distance).trim() !== "") && 
        (set.duration && String(set.duration).trim() !== "") &&
        (set.intensity && String(set.intensity).trim() !== "")
      );
    } else {
      // For strength exercises, check if both weight and reps are filled
      hasValidData = exercise.sets.every(set => 
        set.weight && String(set.weight).trim() !== "" && 
        set.reps && String(set.reps).trim() !== ""
      );
    }
    
    // Check if all sets are marked as completed
    const allSetsCompleted = exercise.sets.every(set => set.completed === true);
    
    return { 
      hasValidData,
      allSetsCompleted 
    };
  };
  
  // Validate the entire workout before finishing or saving
  const validateWorkout = (isFromRoutine = false, bypassCompletionCheck = false) => {
    let isValid = true;
    let missingFields = [];
    let incompleteExercises = [];
    
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
      const { hasValidData, allSetsCompleted } = validateExerciseSets(exercise);
      
      if (!hasValidData) {
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
      
      // Check for completed sets if we're not bypassing the completion check
      if (!bypassCompletionCheck && !allSetsCompleted) {
        incompleteExercises.push(exercise.name);
        isValid = false;
      }
    }
    
    // If there are incomplete exercises and we're not bypassing the check
    if (!bypassCompletionCheck && incompleteExercises.length > 0) {
      const confirmSave = window.confirm(
        `The following exercises have uncompleted sets:\n• ${incompleteExercises.join('\n• ')}\n\nDo you want to mark all sets as completed and continue?`
      );
      
      if (confirmSave) {
        // Mark all sets as completed
        setWorkoutExercises(prev => prev.map(exercise => ({
          ...exercise,
          sets: exercise.sets.map(set => ({
            ...set,
            completed: true
          }))
        })));
        
        // Run validation again but bypass completion check
        return validateWorkout(isFromRoutine, true);
      } else {
        return false;
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
    // First check if all sets are completed
    const incompleteExercises = [];
    
    for (const exercise of workoutExercises) {
      const hasIncompleteSet = exercise.sets.some(set => set.completed !== true);
      if (hasIncompleteSet) {
        incompleteExercises.push(exercise.name);
      }
    }
    
    // If there are incomplete sets, ask user if they want to continue anyway
    if (incompleteExercises.length > 0) {
      const confirmSave = window.confirm(
        `The following exercises have uncompleted sets:\n• ${incompleteExercises.join('\n• ')}\n\nDo you want to mark all sets as completed and continue?`
      );
      
      if (confirmSave) {
        // Mark all sets as completed
        setWorkoutExercises(prev => prev.map(exercise => ({
          ...exercise,
          sets: exercise.sets.map(set => ({
            ...set,
            completed: true
          }))
        })));
      } else {
        return; // Stop the workout finishing process
      }
    }
    
    // Validate other workout data before proceeding
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
    // First check if all sets are completed
    const incompleteExercises = [];
    
    for (const exercise of workoutExercises) {
      const hasIncompleteSet = exercise.sets.some(set => set.completed !== true);
      if (hasIncompleteSet) {
        incompleteExercises.push(exercise.name);
      }
    }
    
    // If there are incomplete sets, ask user if they want to continue anyway
    if (incompleteExercises.length > 0) {
      const confirmSave = window.confirm(
        `The following exercises have uncompleted sets:\n• ${incompleteExercises.join('\n• ')}\n\nDo you want to mark all sets as completed and continue?`
      );
      
      if (confirmSave) {
        // Mark all sets as completed
        setWorkoutExercises(prev => prev.map(exercise => ({
          ...exercise,
          sets: exercise.sets.map(set => ({
            ...set,
            completed: true
          }))
        })));
      } else {
        return; // Stop the routine saving process
      }
    }
    
    // Always use strict validation for saving as routine
    if (!validateWorkout(false)) {
      return;
    }

    // Set routine name to the current workout name (if available)
    if (workoutName && workoutName.trim() !== "") {
      setRoutineName(workoutName);
    } else {
      // Default name if workout name is empty
      setRoutineName(`Routine ${new Date().toLocaleDateString()}`);
    }
    
    // Show the save routine modal
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

  const handleAddExercise = (exercise, initialSetsCount) => {
    console.log("Adding exercise:", exercise); // Debug: log exercise data
    
    // Ensure exercise is an object with a name
    if (typeof exercise === 'string') {
      exercise = { name: exercise };
    }
    
    // Ensure exercise has a valid name
    if (!exercise.name) {
      console.error("Exercise missing name:", exercise);
      exercise.name = "Unnamed Exercise";
    }
    
    const initialSets = initialSetsCount || exercise.initialSets || 1;
    console.log(`Adding ${initialSets} sets for ${exercise.name}`);

    // Auto-collapse all existing exercises when adding a new one
    const allCollapsed = {};
    workoutExercises.forEach((_, index) => {
      allCollapsed[index] = true;
    });
    setCollapsedExercises(allCollapsed);

    // Detect if the exercise is a cardio exercise
    // First check explicitly set is_cardio property, then check category
    const isCardio = exercise.is_cardio === true || 
                    exercise.category === "Cardio" || 
                    (typeof exercise.category === 'string' && 
                    exercise.category.toLowerCase() === 'cardio');
    
    console.log("Is cardio exercise:", isCardio);

    // Create the new exercise with the appropriate sets
    let newExercise;
    
    // Check if we have memory for this exercise
    const memory = exerciseMemory[exercise.name] || {};
    
    if (isCardio) {
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
          giant_with: null,
          completed: false,
          // Include the memory values for UI reference
          memoryDistance: memory.distance || "",
          memoryDuration: memory.duration || "",
          memoryIntensity: memory.intensity || "",
          memoryNotes: memory.notes || ""
        }));

      newExercise = {
        ...exercise,
        sets: emptyCardioSets,
        is_cardio: true,
      };
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
          giant_with: null,
          completed: false,
          // Include the memory values for UI reference
          memoryWeight: memory.weight || "",
          memoryReps: memory.reps || "",
          memoryNotes: memory.notes || ""
        }));

      newExercise = {
        ...exercise,
        sets: emptySets,
        is_cardio: false
      };
    }
    
    // Add the new exercise to the workout
    setWorkoutExercises([
      ...workoutExercises,
      newExercise
    ]);
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
          // Check if we have memory for this exercise
          const memory = exerciseMemory[exercise.name] || {};
          
          // Create new set with memory values if available
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
                is_giant: false,
                completed: false,
                // Include the memory values for UI reference
                memoryDistance: memory.distance || "",
                memoryDuration: memory.duration || "",
                memoryIntensity: memory.intensity || "",
                memoryNotes: memory.notes || ""
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
                is_giant: false,
                completed: false,
                // Include the memory values for UI reference
                memoryWeight: memory.weight || "",
                memoryReps: memory.reps || "",
                memoryNotes: memory.notes || ""
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
    setWorkoutExercises(
      workoutExercises.map((exercise, idx) => {
        if (idx === exerciseIndex) {
          const sets = [...exercise.sets];
          if (sets[setIndex]) {
            sets[setIndex] = {
              ...sets[setIndex],
              [field]: value,
            };

            // Only save memory for completed sets with non-empty values
            if (field === 'completed' && value === true) {
              // When marking as completed, remember the values for this exercise
              const updatedMemory = { ...exerciseMemory };
              
              if (!updatedMemory[exercise.name]) {
                updatedMemory[exercise.name] = {};
              }
              
              // Check if it's cardio or strength exercise
              if (exercise.is_cardio) {
                // For cardio, remember distance, duration and intensity
                if (sets[setIndex].distance && sets[setIndex].duration && sets[setIndex].intensity) {
                  updatedMemory[exercise.name] = {
                    distance: sets[setIndex].distance,
                    duration: sets[setIndex].duration,
                    intensity: sets[setIndex].intensity,
                    notes: sets[setIndex].notes
                  };
                }
              } else {
                // For strength, remember weight and reps
                if (sets[setIndex].weight && sets[setIndex].reps) {
                  updatedMemory[exercise.name] = {
                    weight: sets[setIndex].weight,
                    reps: sets[setIndex].reps,
                    notes: sets[setIndex].notes
                  };
                }
              }
              
              // Save to state, localStorage, and backend
              setExerciseMemory(updatedMemory);
              localStorage.setItem('exerciseMemory', JSON.stringify(updatedMemory));
              
              // Save to backend - create a single-exercise object for the API
              const memoryToSave = {
                [exercise.name]: updatedMemory[exercise.name]
              };
              saveExerciseMemory(memoryToSave);
            }
          }
          return {
            ...exercise,
            sets,
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
    const newValue = e.target.value;
    
    // Always update restTime with the raw input value to allow empty input during editing
    setRestTime(newValue === '' ? '' : parseInt(newValue));
    
    // Only update timeLeft if we have a valid positive number
    const newTime = parseInt(newValue);
    if (!isNaN(newTime) && newTime > 0) {
      setTimeLeft(newTime);
    }
  };

  const setRestTimePreset = (seconds) => {
    setRestTime(seconds);
    setTimeLeft(seconds);
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
          setTimerRunningInBackground(false);
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
    setTimerRunningInBackground(false);
  };

  const closeRestTimer = () => {
    if (isResting) {
      // If timer is running, just hide the UI but keep timer running
      setShowRestTimer(false);
      setTimerRunningInBackground(true);
    } else {
      // If timer is not running, completely close the timer
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
      setShowRestTimer(false);
      setIsResting(false);
      setTimeLeft(restTime);
      setTimerRunningInBackground(false);
    }
  };

  const reopenRestTimer = () => {
    setShowRestTimer(true);
    setTimerRunningInBackground(false);
  };

  const handleShowSetTypeModal = (exercise) => {
    // Early return if this is a cardio exercise - set types don't apply to cardio
    if (exercise.is_cardio) {
      console.log("Set types are not applicable to cardio exercises");
      return;
    }
    
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
        return `Add ${dropSetCount} Set Drop Series`;
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
      // Add the original (heaviest) weight first
      weights.push(currentWeight);
      
      // Then add the progressively lighter weights
      // We subtract 1 because dropSetCount should represent the TOTAL number of sets including the top set
      for (let i = 0; i < dropSetCount - 1; i++) {
        const reducedWeight = calculateNextWeight(currentWeight, dropSetPercentage * (i + 1));
        weights.push(reducedWeight);
      }

      // No need to sort - already in descending order (heaviest to lightest)
      
      // Create sets in descending order (proper drop set)
      weights.forEach((weight, index) => {
        newSets.push({
          weight: weight,
          reps: dropSetReps,
          notes: index === 0 ? 
            `Drop Set #${index + 1} (Top Set)` : 
            `Drop Set #${index + 1} (Drop)`,
          is_drop_set: true,
          is_warmup: false,
          is_superset: false,
          is_amrap: false,
          is_restpause: false,
          is_pyramid: false,
          is_giant: false,
          original_weight: originalWeight,
          drop_number: index + 1,
          completed: false
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
    setDropSetCount(2);
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

  // Only set the start time when the component first mounts
  useEffect(() => {
    // Set the initial start time when the component first loads
    setStartTime(getCurrentTimeForInput());
  }, []);  // Empty dependency array means this only runs once on mount

  // Listen for when the page becomes visible again (user returns to the tab or refreshes)
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Only update when page becomes visible again and the URL includes workout-log
      if (document.visibilityState === 'visible' && window.location.pathname.includes('workout-log')) {
        setStartTime(getCurrentTimeForInput());
      }
    };

    // Add the visibility listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);  // Empty dependency array - we don't want to depend on workout state

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
  
  // Format time only (for mobile display)
  const formatTimeOnlyForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', {
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  
  // Format date only
  const formatDateOnlyForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: "2-digit",
      month: "short",
    });
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
        const preferences = await response.json();
        if (preferences.weight_unit) {
          setWeightUnit(preferences.weight_unit);
          localStorage.setItem("weightUnit", preferences.weight_unit);
        }
        
        // Also load other preferences here if needed
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
      // Fallback to localStorage if API fails
      const storedWeightUnit = localStorage.getItem("weightUnit");
      if (storedWeightUnit) {
        setWeightUnit(storedWeightUnit);
      }
    }
  }, []);

  // Call loadUserPreferences when component mounts
  useEffect(() => {
    loadUserPreferences();
  }, [loadUserPreferences]);

  // Load the last used bodyweight from localStorage when the component mounts
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
      // Store preferences in localStorage first as a fallback
      if (preferences.weight_unit) {
        localStorage.setItem("weightUnit", preferences.weight_unit);
      }
      
      // Updated to use POST instead of PUT and use the correct endpoint
      const response = await fetch(`${API_BASE_URL}/user/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(preferences)
      });
      
      if (!response.ok) {
        console.error('Failed to save user preferences:', response.status, response.statusText);
        // Continue using the local settings without showing an error to the user
      }
    } catch (error) {
      console.error('Error saving user preferences:', error);
      // Continue using the local settings without showing an error to the user
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

  const handlePersonalRecordsClose = () => {
    setShowPersonalRecordsModal(false);
  };

  const handleShowReorderModal = () => {
    setExerciseReorderList([...workoutExercises]);
    setShowReorderModal(true);
  };

  const handleCloseReorderModal = () => {
    setShowReorderModal(false);
    setDraggedExerciseIndex(null);
  };

  const handleDragStart = (index) => {
    setDraggedExerciseIndex(index);
  };
  
  // Add touch event handlers for mobile
  const handleTouchStart = (index) => {
    setDraggedExerciseIndex(index);
  };
  
  const handleTouchMove = (e, index) => {
    e.preventDefault();
    if (draggedExerciseIndex === null) return;
    handleDragOver(e, index);
  };
  
  const handleTouchEnd = () => {
    // Keep the draggedExerciseIndex set for visual feedback
    // It will be cleared when the modal is closed or reorder is confirmed
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedExerciseIndex === null) return;
    
    // Skip if dragging over itself
    if (draggedExerciseIndex === index) return;
    
    // Make a copy of the list
    const newList = [...exerciseReorderList];
    
    // Remove the dragged item
    const draggedItem = newList[draggedExerciseIndex];
    newList.splice(draggedExerciseIndex, 1);
    
    // Insert it at the new position
    newList.splice(index, 0, draggedItem);
    
    // Update the reordered list and the dragged index
    setExerciseReorderList(newList);
    setDraggedExerciseIndex(index);
  };

  const handleReorderConfirm = () => {
    setWorkoutExercises(exerciseReorderList);
    setShowReorderModal(false);
    setDraggedExerciseIndex(null);
  };

  const handleShowWorkoutLoadOptions = (workout) => {
    // Store the workout to load and show confirmation modal
    setWorkoutToLoad(workout);
    setShowLoadConfirmation(true);
  };

  const loadWorkoutWithData = () => {
    if (!workoutToLoad) return;
    
    // Set the workout name
    setWorkoutName(workoutToLoad.name || "");

    // Get exercises from the workout (handle both formats)
    const exercises = workoutToLoad.workout?.exercises || workoutToLoad.exercises || [];
    
    // Convert exercises to workout exercises with their original data
    const newExercises = exercises.map((exercise) => {
      return {
        name: exercise.name,
        category: exercise.category || "Uncategorized",
        is_cardio: Boolean(exercise.is_cardio),
        sets: Array.isArray(exercise.sets) ? [...exercise.sets] : []
      };
    });

    setWorkoutExercises(newExercises);
    setShowLoadConfirmation(false);
    setShowHistory(false);
    setShowRoutinesSelector(false);
  };

  const loadWorkoutWithoutData = () => {
    if (!workoutToLoad) return;
    
    // Set the workout name
    setWorkoutName(workoutToLoad.name || "");

    // Get exercises from the workout (handle both formats)
    const exercises = workoutToLoad.workout?.exercises || workoutToLoad.exercises || [];
    
    // Convert exercises to workout exercises but with empty sets
    const newExercises = exercises.map((exercise) => {
      // Determine if cardio
      const isCardio = Boolean(exercise.is_cardio);
      
      // Get the number of sets from the original
      const setsCount = Array.isArray(exercise.sets) ? exercise.sets.length : 1;
      
      // Create empty sets based on exercise type
      const emptySets = Array(setsCount).fill().map(() => {
        if (isCardio) {
          return {
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
          };
        } else {
          return {
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
        }
      });

      return {
        name: exercise.name,
        category: exercise.category || "Uncategorized",
        is_cardio: isCardio,
        sets: emptySets
      };
    });

    setWorkoutExercises(newExercises);
    setShowLoadConfirmation(false);
    setShowHistory(false);
    setShowRoutinesSelector(false);
  };

  const closeLoadConfirmation = () => {
    setShowLoadConfirmation(false);
    setWorkoutToLoad(null);
  };

  return (
    <div className="workout-log-container p-4 md:p-6 pb-32">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">Workout Log</h1>
        <div className="flex space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setShowHistory(true)}
            className="bg-indigo-500 hover:bg-indigo-400 text-white py-1.5 px-3 rounded-lg text-xs flex items-center justify-center flex-1 sm:flex-none"
            title="View Workout History"
          >
            <FaHistory className="text-sm" />
            <span className="ml-1">History</span>
          </button>
          
          <button
            onClick={() => {
              fetchRoutines();
              setShowRoutinesSelector(true);
            }}
            className="bg-blue-500 hover:bg-blue-400 text-white py-1.5 px-3 rounded-lg text-xs flex items-center justify-center flex-1 sm:flex-none"
            title="Select Routine"
          >
            <FaListAlt className="text-sm" />
            <span className="ml-1">Routines</span>
          </button>
          
          {/* Only show Add Exercise button in header if there are already exercises */}
          {workoutExercises.length > 0 && (
            <button
              onClick={() => setShowExerciseSelection(true)}
              className="bg-teal-500 hover:bg-teal-400 text-white py-1.5 px-3 rounded-lg text-xs flex items-center justify-center flex-1 sm:flex-none"
              title="Add Exercise"
            >
              <FaDumbbell className="text-sm" />
              <span className="ml-1">Add Exercise</span>
            </button>
          )}
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
                  // Don't update time automatically when clicking if workout has started
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
        
        {/* Add Exercise button when no exercises exist */}
        {workoutExercises.length === 0 && (
          <button
            onClick={() => setShowExerciseSelection(true)}
            className="w-full bg-teal-500 hover:bg-teal-400 text-white py-2 px-4 rounded-lg text-sm flex items-center justify-center mt-4"
          >
            <FaPlus className="mr-2" />
            Add Exercise
          </button>
        )}
      </div>

      {workoutExercises.map((exercise, exerciseIndex) => (
        <div
          key={`${exercise.name}-${exerciseIndex}`}
          className="exercise-card"
        >
          {/* Exercise header */}
          <div className="flex flex-wrap items-center mb-2">
            <div className="flex-grow mr-2 mb-2 sm:mb-0 w-full">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {exercise.name}
              </h3>
            </div>
            {/* Exercise control buttons */}
            <div className="flex flex-wrap gap-1 mt-1">
              <button
                onClick={() => handleShowReorderModal()}
                className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white bg-gray-200 dark:bg-gray-700 p-2 rounded flex items-center"
                title="Reorder Exercises"
              >
                <FaSort className="mr-1" />
                <span className="text-xs">Reorder</span>
              </button>
              
              {/* Only show Set Type button for strength exercises, not cardio */}
              {!exercise.is_cardio && (
                <button
                  onClick={() => handleShowSetTypeModal(exercise)}
                  className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white bg-gray-200 dark:bg-gray-700 p-2 rounded flex items-center"
                  title="Set Type"
                >
                  <FaLayerGroup className="mr-1" />
                  <span className="text-xs">Set Type</span>
                </button>
              )}
              
              <button
                onClick={() => handleShowExerciseHistory(exercise)}
                className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white bg-gray-200 dark:bg-gray-700 p-2 rounded flex items-center"
                title="Exercise History"
              >
                <FaHistory className="mr-1" />
                <span className="text-xs">History</span>
              </button>
              
              <button
                onClick={() => handleShowExerciseCharts(exercise)}
                className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white bg-gray-200 dark:bg-gray-700 p-2 rounded flex items-center"
                title="Exercise Charts"
              >
                <FaChartLine className="mr-1" />
                <span className="text-xs">Charts</span>
              </button>
              
              <button
                onClick={() => handleShowPersonalRecords(exercise)}
                className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white bg-gray-200 dark:bg-gray-700 p-2 rounded flex items-center"
                title="Personal Records"
              >
                <FaTrophy className="mr-1" />
                <span className="text-xs">Records</span>
              </button>
              
              <button
                onClick={() => toggleExerciseCollapse(exerciseIndex)}
                className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white bg-gray-200 dark:bg-gray-700 p-2 rounded flex items-center"
              >
                {collapsedExercises[exerciseIndex] ? (
                  <>
                    <FaChevronDown className="mr-1" />
                    <span className="text-xs">Expand</span>
                  </>
                ) : (
                  <>
                    <FaChevronUp className="mr-1" />
                    <span className="text-xs">Collapse</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => handleDeleteExercise(exerciseIndex)}
                className="text-red-500 hover:text-red-600 bg-gray-200 dark:bg-gray-700 p-2 rounded flex items-center"
              >
                <FaTrash className="mr-1" />
                <span className="text-xs">Delete</span>
              </button>
              
              <button
                onClick={() => handleStartRestTimer(exercise)}
                className="text-teal-500 hover:text-teal-600 bg-gray-200 dark:bg-gray-700 p-2 rounded flex items-center"
              >
                <FaClock className="mr-1" />
                <span className="text-xs">Timer</span>
              </button>
            </div>
          </div>

          {!collapsedExercises[exerciseIndex] && (
            <>
              {/* Exercise sets section */}
              <div className="mt-3 exercise-set-container">
                {/* Set headers for each column - these will be hidden on mobile but visible on desktop */}
                <div className={`grid ${exercise.is_cardio ? 'grid-cols-4' : 'grid-cols-4'} gap-1 text-sm font-semibold mb-1 text-gray-600 dark:text-gray-300 items-center px-1 set-headers desktop-only`}>
                  {!exercise.is_cardio ? (
                    <>
                      <div>Set</div>
                      <div>Weight ({weightUnit})</div>
                      <div>Reps</div>
                      <div className="text-right">Action</div>
                    </>
                  ) : (
                    <>
                      <div>Set</div>
                      <div>Distance (km)</div>
                      <div>Duration (min)</div>
                      <div className="text-right">Action</div>
                    </>
                  )}
                </div>

                {/* Exercise sets */}
                <div className="exercise-sets">
                  {exercise && exercise.sets && exercise.sets.length > 0 ? (
                    exercise.sets.map((set, setIndex) => (
                      <div key={setIndex} className="set-row mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                        {/* Set header showing set number and type */}
                        <div className="set-number-heading w-full mb-2 flex justify-between items-center">
                          <div className="flex items-center">
                            <span className="font-medium">Set {setIndex + 1}</span>
                            <div className="ml-2">
                              <input
                                type="checkbox"
                                checked={set.completed || false}
                                onChange={(e) => 
                                  handleEditSet(
                                    exerciseIndex, 
                                    setIndex, 
                                    "completed", 
                                    e.target.checked
                                  )
                                }
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                              />
                            </div>
                          </div>
                          <div className="set-type-controls flex items-center">
                            {set.is_warmup ? (
                              <span className="set-type-badge bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs py-1 px-2 rounded-full">
                                Warm-up
                              </span>
                            ) : set.is_drop_set ? (
                              <span className="set-type-badge bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs py-1 px-2 rounded-full">
                                Drop {set.drop_number}
                              </span>
                            ) : (
                              <span className="set-type-badge bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs py-1 px-2 rounded-full">
                                Normal
                              </span>
                            )}
                            <button
                              onClick={() => handleEditSet(exerciseIndex, setIndex, "is_warmup", !set.is_warmup)}
                              className="set-type-toggle ml-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 text-xs"
                            >
                              {set.is_warmup ? "Mark Normal" : "Mark Warm-up"}
                            </button>
                          </div>
                        </div>
                      
                        {/* Set inputs */}
                        <div className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2`}>
                          {!exercise || !exercise.is_cardio ? (
                            <>
                              <div>
                                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
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
                                  placeholder="0"
                                  className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
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
                                  placeholder="0"
                                  className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              {/* Cardio fields */}
                              <div>
                                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
                                  Distance (km)
                                </label>
                                <input
                                  type="number"
                                  value={set.distance || ""}
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
                                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
                                  Duration (min)
                                </label>
                                <input
                                  type="number"
                                  value={set.duration || ""}
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
                                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
                                  Intensity
                                </label>
                                <select
                                  value={set.intensity || ""}
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

                          <div>
                            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
                              Notes
                            </label>
                            <input
                              type="text"
                              value={set.notes || ""}
                              onChange={(e) =>
                                handleEditSet(
                                  exerciseIndex,
                                  setIndex,
                                  "notes",
                                  e.target.value
                                )
                              }
                              placeholder="Notes (optional)"
                              className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                            />
                          </div>
                                
                          <div className="flex justify-end items-center space-x-1 col-span-1 set-actions">
                            <button
                              onClick={() => handleDeleteSet(exerciseIndex, setIndex)}
                              className="p-2 text-red-500 hover:text-red-600 bg-gray-100 dark:bg-gray-700 rounded"
                              title="Delete Set"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      No sets added yet.
                    </div>
                  )}
                </div>

                {/* Add Set button after all sets */}
                <div className="mt-3 text-center">
                  <button
                    onClick={() => handleAddSet(exerciseIndex)}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm flex items-center justify-center w-full sm:w-auto mx-auto"
                  >
                    <FaPlus className="mr-1" />
                    Add Set
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ))}

      {/* Add Exercise button at the bottom if exercises exist */}
      {workoutExercises.length > 0 && (
        <div className="mt-4 mb-16 sm:mb-4 text-center">
          <button
            onClick={() => setShowExerciseSelection(true)}
            className="bg-teal-500 hover:bg-teal-400 text-white py-3 sm:py-2 px-6 sm:px-4 rounded-lg text-base sm:text-sm inline-flex items-center justify-center w-full sm:w-auto sticky bottom-4 sm:static shadow-lg sm:shadow-none"
          >
            <FaPlus className="mr-2" />
            Add Another Exercise
          </button>
        </div>
      )}

      {/* Fixed floating add exercise button for mobile devices */}
      {workoutExercises.length > 0 && (
        <div className="fixed bottom-20 right-4 sm:hidden z-10">
          <button
            onClick={() => setShowExerciseSelection(true)}
            className="bg-teal-500 hover:bg-teal-400 text-white p-4 rounded-full shadow-lg flex items-center justify-center"
            aria-label="Add Exercise"
          >
            <FaPlus size={24} />
          </button>
        </div>
      )}

      {/* Replace the original buttons with the new component */}
      {/* Action buttons at the bottom */}
      <WorkoutActionButtons 
        onFinishWorkout={handleFinishWorkout}
        onSaveRoutine={handleSaveAsRoutine}
      />

      {/* Add Exercise Modal */}
      {showExerciseSelection && (
        <AddExercise
          onClose={() => setShowExerciseSelection(false)}
          onSelectExercise={(exercise, initialSets) => {
            handleAddExercise(exercise, initialSets);
            setShowExerciseSelection(false);
          }}
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
                            {(() => {
                              // First determine where the exercises are located - support both formats
                              const exercises = routine.workout?.exercises || routine.exercises;
                              
                              if (exercises && exercises.length > 0) {
                                return `${exercises.length} Exercise${exercises.length !== 1 ? "s" : ""}`;
                              } else {
                                return "No exercises";
                              }
                            })()}
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
                title={isResting ? "Minimize (timer will continue running)" : "Close"}
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
                value={restTime === '' ? '' : restTime}
                onChange={handleRestTimerChange}
                className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isResting}
              />
              {!isResting && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <button 
                    onClick={() => setRestTimePreset(30)}
                    className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 rounded px-3 py-1 text-sm"
                  >
                    30s
                  </button>
                  <button 
                    onClick={() => setRestTimePreset(60)}
                    className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 rounded px-3 py-1 text-sm"
                  >
                    60s
                  </button>
                  <button 
                    onClick={() => setRestTimePreset(90)}
                    className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 rounded px-3 py-1 text-sm"
                  >
                    90s
                  </button>
                  <button 
                    onClick={() => setRestTimePreset(120)}
                    className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 rounded px-3 py-1 text-sm"
                  >
                    2m
                  </button>
                  <button 
                    onClick={() => setRestTimePreset(180)}
                    className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 rounded px-3 py-1 text-sm"
                  >
                    3m
                  </button>
                </div>
              )}
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

      {/* Timer Running Indicator (when minimized) */}
      {timerRunningInBackground && (
        <div 
          onClick={reopenRestTimer}
          className="fixed bottom-36 right-4 sm:bottom-20 bg-blue-600 text-white p-3 rounded-full shadow-xl cursor-pointer flex items-center justify-center z-[1000] hover:bg-blue-700 min-w-[70px] min-h-[70px] border-2 border-white dark:border-gray-800 animate-pulse"
          style={{
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)'
          }}
          title="Click to open rest timer"
        >
          <FaClock className="mr-2 text-xl" />
          <span className="text-lg font-bold">{timeLeft}s</span>
        </div>
      )}

      {/* Set Type Modal */}
      {showSetTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-3 sm:p-6 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Set Type
              </h2>
              <button
                onClick={closeSetTypeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
              >
                <FaTimes />
              </button>
            </div>

            <div className="mb-3">
              <label className="block text-gray-700 dark:text-gray-300 mb-1 text-sm sm:text-base">
                Select Set Type
              </label>
              <select
                value={selectedSetType}
                onChange={(e) => setSelectedSetType(e.target.value)}
                className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white text-sm"
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
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg mb-4">
                  <h3 className="font-medium text-red-700 dark:text-red-400 mb-2 text-sm sm:text-base">Drop Set</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Drop sets involve performing a set to near-failure, then immediately reducing the weight and continuing with additional reps.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-1 text-xs sm:text-sm">
                        Starting Weight ({weightUnit})
                      </label>
                      <input
                        type="number"
                        value={originalWeight || ""}
                        onChange={(e) => {
                          setOriginalWeight(e.target.value);
                          setDropSetWeight(e.target.value);
                        }}
                        className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white text-sm"
                        placeholder="Weight"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-1 text-xs sm:text-sm">
                        Reps per Drop
                      </label>
                      <input
                        type="number"
                        value={dropSetReps}
                        onChange={(e) => setDropSetReps(e.target.value)}
                        className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white text-sm"
                        placeholder="Reps"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-1 text-xs sm:text-sm">
                        Weight Reduction (%)
                      </label>
                      <input
                        type="number"
                        value={dropSetPercentage}
                        onChange={(e) => setDropSetPercentage(parseInt(e.target.value))}
                        className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white text-sm"
                        min="5"
                        max="50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-1 text-xs sm:text-sm">
                        Total Sets
                      </label>
                      <input
                        type="number"
                        value={dropSetCount}
                        onChange={(e) => setDropSetCount(parseInt(e.target.value))}
                        className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white text-sm"
                        min="2"
                        max="5"
                      />
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Includes top set + drop sets (min: 2, max: 5)
                  </p>
                  
                  {originalWeight && (
                    <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <h4 className="font-medium text-xs sm:text-sm mb-1">Drop Set Preview:</h4>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div className="font-medium">
                          Top: {originalWeight} {weightUnit}
                        </div>
                        {Array.from({ length: dropSetCount - 1 }).map((_, i) => {
                          const weight = calculateNextWeight(
                            parseFloat(originalWeight),
                            dropSetPercentage * (i + 1)
                          );
                          return (
                            <div key={i}>
                              Drop {i + 1}: {weight} {weightUnit}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {selectedSetType === "warmup" && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-4">
                <h3 className="font-medium text-yellow-700 dark:text-yellow-400 mb-2 text-sm sm:text-base">Warm-up Set</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Warm-up sets are typically performed with lighter weights to prepare your muscles and joints.
                  {!setTypeExercise?.is_cardio && " We suggest using about 60-70% of your working weight."}
                </p>
                
                {originalWeight && !setTypeExercise?.is_cardio && (
                  <div className="bg-yellow-100 dark:bg-yellow-800/30 p-2 rounded-lg mt-2">
                    <div className="flex items-center text-xs text-yellow-800 dark:text-yellow-300">
                      <FaInfoCircle className="mr-1 flex-shrink-0" />
                      <span>
                        Suggested warm-up weight: {(parseFloat(originalWeight) * 0.7).toFixed(1)} {weightUnit}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedSetType === "working" && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
                <h3 className="font-medium text-blue-700 dark:text-blue-400 mb-2 text-sm sm:text-base">Normal Set</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Normal sets are your primary training sets performed at your target intensity.
                </p>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-1 text-xs sm:text-sm">
                      Weight ({weightUnit})
                    </label>
                    <input
                      type="number"
                      value={originalWeight || ""}
                      onChange={(e) => setOriginalWeight(e.target.value)}
                      className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white text-sm"
                      placeholder="Weight"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-1 text-xs sm:text-sm">
                      Reps
                    </label>
                    <input
                      type="number"
                      value={dropSetReps}
                      onChange={(e) => setDropSetReps(e.target.value)}
                      className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white text-sm"
                      placeholder="Reps"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {selectedSetType === "superset" && (
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg mb-4">
                <h3 className="font-medium text-purple-700 dark:text-purple-400 mb-2 text-sm sm:text-base">Superset</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Supersets are two exercises performed back-to-back with minimal rest between them.
                  Pair {setTypeExercise?.name} with another exercise from your list.
                </p>
                
                <div className="mb-3">
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => setShowSupersetExerciseSelector(true)}
                      className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded-lg flex items-center justify-center text-sm"
                    >
                      <FaPlus className="mr-2" /> Select Secondary Exercise
                    </button>
                    
                    {supersetExerciseId !== null && (
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <p className="font-medium text-xs sm:text-sm">Secondary Exercise: {workoutExercises[supersetExerciseId]?.name}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {supersetExerciseId !== null && !setTypeExercise?.is_cardio && !workoutExercises[supersetExerciseId]?.is_cardio && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-2 mb-2">
                    <h4 className="font-medium text-xs sm:text-sm mb-2 text-purple-700 dark:text-purple-400">
                      {setTypeExercise?.name} (Primary)
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-1 text-xs">
                          Weight ({weightUnit})
                        </label>
                        <input
                          type="number"
                          value={originalWeight || ""}
                          onChange={(e) => setOriginalWeight(e.target.value)}
                          className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white text-sm"
                          placeholder="Weight"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-1 text-xs">
                          Reps
                        </label>
                        <input
                          type="number"
                          value={dropSetReps}
                          onChange={(e) => setDropSetReps(e.target.value)}
                          className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white text-sm"
                          placeholder="Reps"
                        />
                      </div>
                    </div>
                    
                    <h4 className="font-medium text-xs sm:text-sm mb-2 text-purple-700 dark:text-purple-400">
                      {workoutExercises[supersetExerciseId]?.name} (Secondary)
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-1 text-xs">
                          Weight ({weightUnit})
                        </label>
                        <input
                          type="number"
                          value={supersetWeight}
                          onChange={(e) => setSupersetWeight(e.target.value)}
                          className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white text-sm"
                          placeholder="Weight"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-1 text-xs">
                          Reps
                        </label>
                        <input
                          type="number"
                          value={supersetReps}
                          onChange={(e) => setSupersetReps(e.target.value)}
                          className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white text-sm"
                          placeholder="Reps"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {supersetExerciseId !== null && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                    <div className="font-medium mb-1">Superset Tip:</div>
                    For best results, pair opposing or non-competing muscle groups 
                    (e.g., push/pull, upper/lower body).
                  </div>
                )}
              </div>
            )}

            {selectedSetType === "amrap" && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg mb-4">
                <h3 className="font-medium text-green-700 dark:text-green-400 mb-2 text-sm sm:text-base">AMRAP Set</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">
                  AMRAP (As Many Reps As Possible) sets are performed to technical failure - complete as many reps as you can with good form.
                </p>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-1 text-xs sm:text-sm">
                      Weight ({weightUnit})
                    </label>
                    <input
                      type="number"
                      value={originalWeight || ""}
                      onChange={(e) => setOriginalWeight(e.target.value)}
                      className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white text-sm"
                      placeholder="Weight"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-1 text-xs sm:text-sm">
                      Target Reps (min)
                    </label>
                    <input
                      type="number"
                      value={dropSetReps}
                      onChange={(e) => setDropSetReps(e.target.value)}
                      className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white text-sm"
                      placeholder="Min. reps"
                    />
                  </div>
                </div>
                
                <div className="mt-3 bg-green-100 dark:bg-green-800/30 p-2 rounded-lg">
                  <div className="text-xs text-green-800 dark:text-green-300 flex items-start">
                    <FaInfoCircle className="mr-1 mt-0.5 flex-shrink-0" />
                    <span>
                      Aim to exceed your target reps. Record the total reps completed after set.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {selectedSetType === "restpause" && (
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg mb-4">
                <h3 className="font-medium text-orange-700 dark:text-orange-400 mb-2 text-sm sm:text-base">Rest-Pause Set</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Rest-Pause involves performing a set to failure, resting 15-20 seconds, then continuing with the same weight for additional reps.
                </p>
                
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-1 text-xs sm:text-sm">
                      Weight ({weightUnit})
                    </label>
                    <input
                      type="number"
                      value={originalWeight || ""}
                      onChange={(e) => setOriginalWeight(e.target.value)}
                      className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white text-sm"
                      placeholder="Weight"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-1 text-xs sm:text-sm">
                      Initial Reps
                    </label>
                    <input
                      type="number"
                      value={dropSetReps}
                      onChange={(e) => setDropSetReps(e.target.value)}
                      className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white text-sm"
                      placeholder="Reps"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1 text-xs sm:text-sm">
                    Number of Rest-Pauses
                  </label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="1"
                      max="3"
                      value={dropSetCount}
                      onChange={(e) => setDropSetCount(parseInt(e.target.value))}
                      className="flex-grow mr-2"
                    />
                    <span className="w-6 text-center bg-orange-200 dark:bg-orange-800 rounded-md text-xs py-1">
                      {dropSetCount}
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 bg-orange-100 dark:bg-orange-800/30 p-2 rounded-lg">
                  <div className="text-xs text-orange-800 dark:text-orange-300 flex items-start">
                    <FaInfoCircle className="mr-1 mt-0.5 flex-shrink-0" />
                    <span>
                      Between each attempt, rest for 15-20 seconds. This technique increases time under tension for better muscle growth.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {selectedSetType === "pyramid" && (
              <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg mb-4">
                <h3 className="font-medium text-pink-700 dark:text-pink-400 mb-2 text-sm sm:text-base">Pyramid Set</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Pyramid sets involve progressively increasing weight while decreasing reps, with an option to reverse the pyramid.
                </p>
                
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-1 text-xs sm:text-sm">
                      Starting Weight ({weightUnit})
                    </label>
                    <input
                      type="number"
                      value={originalWeight || ""}
                      onChange={(e) => setOriginalWeight(e.target.value)}
                      className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white text-sm"
                      placeholder="Weight"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-1 text-xs sm:text-sm">
                      Starting Reps
                    </label>
                    <input
                      type="number"
                      value={dropSetReps}
                      onChange={(e) => setDropSetReps(e.target.value)}
                      className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white text-sm"
                      placeholder="Reps"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-1 text-xs sm:text-sm">
                      Weight Increment (%)
                    </label>
                    <input
                      type="number"
                      value={dropSetPercentage}
                      onChange={(e) => setDropSetPercentage(parseInt(e.target.value))}
                      className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white text-sm"
                      min="5"
                      max="30"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-1 text-xs sm:text-sm">
                      Number of Steps
                    </label>
                    <input
                      type="number"
                      value={dropSetCount}
                      onChange={(e) => setDropSetCount(parseInt(e.target.value))}
                      className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-gray-900 dark:text-white text-sm"
                      min="2"
                      max="5"
                    />
                  </div>
                </div>
                
                <div className="mt-2 flex items-center">
                  <input
                    type="checkbox"
                    id="fullPyramid"
                    className="mr-2"
                    checked={fullPyramidChecked}
                    onChange={(e) => setFullPyramidChecked(e.target.checked)}
                  />
                  <label htmlFor="fullPyramid" className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                    Full Pyramid (ascending + descending)
                  </label>
                </div>
                
                {originalWeight && dropSetReps && (
                  <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-medium text-xs sm:text-sm mb-1">Pyramid Preview:</h4>
                    <div className="grid grid-cols-3 gap-1 text-xs">
                      {Array.from({ length: dropSetCount }).map((_, i) => {
                        const stepPercent = dropSetPercentage * i;
                        const weight = i === 0 
                          ? originalWeight 
                          : calculateNextWeight(parseFloat(originalWeight), stepPercent);
                        const reps = Math.max(1, parseInt(dropSetReps) - (i * 2));
                        
                        return (
                          <div key={`up-${i}`} className={i === 0 ? "font-medium" : ""}>
                            Step {i+1}: {weight}{weightUnit} × {reps}
                          </div>
                        );
                      })}
                      
                      {fullPyramidChecked && Array.from({ length: dropSetCount - 1 }).map((_, i) => {
                        const reverseIdx = dropSetCount - 2 - i;
                        const stepPercent = dropSetPercentage * reverseIdx;
                        const weight = reverseIdx === 0 
                          ? originalWeight 
                          : calculateNextWeight(parseFloat(originalWeight), stepPercent);
                        const reps = Math.max(1, parseInt(dropSetReps) - (reverseIdx * 2));
                        
                        return (
                          <div key={`down-${i}`}>
                            Step {dropSetCount + i + 1}: {weight}{weightUnit} × {reps}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
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

            {/* Add the footer buttons after all set type sections */}
            <div className="flex justify-between space-x-3 mt-4">
              <button
                className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white py-2 rounded-lg text-sm"
                onClick={closeSetTypeModal}
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg text-sm"
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
                  setShowHistory(true);
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
                  // We close the modal but we don't navigate away
                }}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg inline-flex items-center"
              >
                <FaChartBar className="mr-2" />
                Close
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
                  // We close the modal but we don't navigate away
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg inline-flex items-center"
              >
                <FaTrophy className="mr-2" />
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add the missing superset exercise selector modal */}
      {showSupersetExerciseSelector && (
        <AddExercise
          onClose={() => setShowSupersetExerciseSelector(false)}
          onSelectExercise={(exercise, initialSets) => {
            // Find the exercise in the current workout
            const exerciseIndex = workoutExercises.findIndex(ex => ex.name === exercise.name);
            
            if (exerciseIndex !== -1) {
              // If the exercise is already in the workout, use its index
              setSupersetExerciseId(exerciseIndex);
            } else {
              // If not in workout yet, add it first then use its index
              setWorkoutExercises(prevExercises => {
                // Detect if this is a cardio exercise
                const isCardio = exercise.is_cardio || 
                                exercise.category === "Cardio" || 
                                (typeof exercise.category === 'string' && 
                                exercise.category.toLowerCase() === 'cardio');
                
                // Create default sets for the exercise
                let newExercise = {
                  name: exercise.name,
                  category: exercise.category,
                  is_cardio: isCardio,
                  sets: []
                };
                
                // Add appropriate number of sets
                const setsToAdd = initialSets || exercise.initialSets || 1;
                if (isCardio) {
                  for (let i = 0; i < setsToAdd; i++) {
                    newExercise.sets.push({
                      duration: "",
                      distance: "",
                      intensity: "",
                      notes: "",
                      completed: false
                    });
                  }
                } else {
                  for (let i = 0; i < setsToAdd; i++) {
                    newExercise.sets.push({
                      weight: "",
                      reps: "",
                      notes: "",
                      is_warmup: false,
                      completed: false
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

      {/* Workout History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md sm:max-w-lg p-3 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Workout History
              </h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="mb-3">
              <div className="overflow-x-auto -mx-3">
                <table className="min-w-full bg-white dark:bg-gray-800">
                  <thead className="bg-gray-100 dark:bg-gray-700 text-xs">
                    <tr>
                      <th className="py-2 px-2 text-left">Date</th>
                      <th className="py-2 px-2 text-left">Workout</th>
                      <th className="py-2 px-2 text-center whitespace-nowrap">Duration</th>
                      <th className="py-2 px-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {workoutHistory.length > 0 ? (
                      workoutHistory
                        .sort((a, b) => new Date(b.start_time) - new Date(a.start_time))
                        .slice(0, 10)
                        .map((workout, idx) => {
                          const duration = workout.end_time ? 
                            ((new Date(workout.end_time) - new Date(workout.start_time)) / (1000 * 60)).toFixed(0) + " min" : 
                            "--";
                          
                          return (
                            <tr key={idx} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="py-2 px-2 whitespace-nowrap">{formatDateForDisplay(workout.start_time)}</td>
                              <td className="py-2 px-2 truncate max-w-[80px]">{workout.name || "Unnamed"}</td>
                              <td className="py-2 px-2 text-center whitespace-nowrap">{duration}</td>
                              <td className="py-2 px-2 text-center">
                                <button
                                  onClick={() => {
                                    // Show the load confirmation modal instead of directly loading
                                    handleShowWorkoutLoadOptions({
                                      name: workout.name,
                                      exercises: workout.exercises || []
                                    });
                                  }}
                                  className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-xs"
                                >
                                  Load
                                </button>
                              </td>
                            </tr>
                          );
                        })
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-4 text-center text-gray-500 dark:text-gray-400">
                          No workout history found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="text-center">
              <button
                onClick={() => {
                  setShowHistory(false);
                  // We close the modal but we don't navigate away
                }}
                className="bg-indigo-500 hover:bg-indigo-600 text-white py-1.5 px-4 rounded-lg inline-flex items-center text-xs"
              >
                <FaHistory className="mr-1 text-xs" />
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reorder Exercises Modal */}
      {showReorderModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-4 max-h-[90vh] flex flex-col reorder-modal">
            <div className="flex justify-between items-center mb-3 reorder-modal-header">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Reorder Exercises
              </h2>
              <button
                onClick={handleCloseReorderModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <FaTimes />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 reorder-modal-instructions">
              Drag and drop exercises to reorder them in your workout.
            </p>
            
            <div className="overflow-y-auto flex-1 mb-3 reorder-modal-list">
              <ul className="space-y-2">
                {exerciseReorderList.map((exercise, index) => (
                  <li 
                    key={`${exercise.name}-${index}`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onTouchStart={() => handleTouchStart(index)}
                    onTouchMove={(e) => handleTouchMove(e, index)}
                    onTouchEnd={handleTouchEnd}
                    className={`p-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center cursor-move reorder-modal-item ${
                      draggedExerciseIndex === index ? 'border-2 border-blue-500 dragging' : ''
                    }`}
                  >
                    <div className="mr-3 text-gray-500 dark:text-gray-400 reorder-modal-item-grip">
                      <FaGripVertical />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white truncate reorder-modal-item-name">
                        {index + 1}. {exercise.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {exercise.sets.length} set{exercise.sets.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex space-x-2 justify-end mt-auto">
              <button
                onClick={handleCloseReorderModal}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReorderConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Apply Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Confirmation Modal */}
      {showLoadConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Load {workoutToLoad?.name || "Workout"}
              </h2>
              <button
                onClick={closeLoadConfirmation}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <FaTimes />
              </button>
            </div>
            
            {workoutToLoad?.start_time && (
              <div className="mb-4 text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <span className="text-blue-600 dark:text-blue-300 font-medium">Last performed: </span>
                <span className="text-gray-700 dark:text-gray-300">
                  {formatDateForDisplay(workoutToLoad.start_time)}
                </span>
              </div>
            )}
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              How would you like to load this workout?
            </p>

            <div className="space-y-4">
              <button
                onClick={loadWorkoutWithData}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg text-left flex flex-col"
              >
                <span className="font-semibold text-lg">Repeat Workout</span>
                <span className="text-sm text-blue-100">
                  Use the same weights, reps, distances, and notes from the previous workout
                </span>
              </button>
              
              <button
                onClick={loadWorkoutWithoutData}
                className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-3 px-4 rounded-lg text-left flex flex-col"
              >
                <span className="font-semibold text-lg">Fresh Start</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Use the same exercises but start with empty values
                </span>
              </button>
              
              <button
                onClick={closeLoadConfirmation}
                className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
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

