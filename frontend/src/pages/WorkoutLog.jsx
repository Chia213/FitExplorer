import { useState, useEffect, useCallback, useMemo } from "react";
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
  FaListUl,
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
                giant_with: Array.isArray(set.giant_with) ? set.giant_with : null
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
                giant_with: Array.isArray(set.giant_with) ? set.giant_with : null
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
              notes: set.notes || "",
              is_warmup: !!set.is_warmup,
              is_drop_set: !!set.is_drop_set,
              is_superset: !!set.is_superset,
              superset_with: set.is_superset ? set.superset_with : null
            };
          } else {
            return {
              weight: set.weight || null,
              reps: set.reps || null,
              notes: set.notes || "",
              is_warmup: !!set.is_warmup,
              is_drop_set: !!set.is_drop_set,
              is_superset: !!set.is_superset,
              superset_with: set.is_superset ? set.superset_with : null
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
          is_warmup: false,
          is_drop_set: false,
          is_superset: false
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
          is_warmup: false,
          is_drop_set: false,
          is_superset: false
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

    // Create all drop sets at once
    for (let i = 0; i < dropSetCount; i++) {
      currentWeight = calculateNextWeight(currentWeight, dropSetPercentage);
      newSets.push({
        weight: currentWeight,
        reps: dropSetReps,
        notes: `Drop Set ${i + 1} (${dropSetPercentage}% reduction)`,
        is_drop_set: true,
        is_warmup: false,
        is_superset: false,
        is_amrap: false,
        is_restpause: false,
        is_pyramid: false,
        is_giant: false,
        original_weight: originalWeight,
        drop_number: i + 1,
      });
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
    } else if (selectedSetType === "working") {
      // Add a working set
      const newSet = setTypeExercise.is_cardio
        ? { 
            distance: "", 
            duration: "", 
            intensity: "", 
            notes: "Normal Set", 
            is_warmup: false,
            is_drop_set: false,
            is_superset: false,
            is_amrap: false,
            is_restpause: false,
            is_pyramid: false,
            is_giant: false
          }
        : { 
            weight: originalWeight || "", 
            reps: "", 
            notes: "Normal Set", 
            is_warmup: false,
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
        superset_with: parseInt(supersetExerciseId)
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
        superset_with: primaryExerciseIndex
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
        giant_with: [parseInt(supersetExerciseId)]
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
        giant_with: [primaryExerciseIndex]
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
    // ... existing validation code ...

    const workoutToSave = prepareWorkoutForSaving({
      name: workoutName || "Workout " + new Date().toLocaleDateString(),
      start_time: startTime,
      end_time: endTime || new Date().toISOString().slice(0, 16),
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
            giant_with: Array.isArray(set.giant_with) ? set.giant_with : null
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

    // ... existing API call code ...
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
                <div className="flex flex-col items-center">
                <button
                    onClick={() => handleShowSetTypeModal(exercise)}
                    className="text-blue-500 hover:text-blue-400 mb-1"
                    title="Add Set Type (Drop Set, Warm-up, Working)"
                  >
                    <FaListUl className="text-lg" />
                </button>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Set Type</span>
                </div>
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
                    set.is_warmup ? "bg-yellow-50 dark:bg-yellow-900/20" : 
                    set.is_superset ? "bg-purple-50 dark:bg-purple-900/20" : 
                    set.is_amrap ? "bg-green-50 dark:bg-green-900/20" : 
                    set.is_restpause ? "bg-orange-50 dark:bg-orange-900/20" :
                    set.is_pyramid ? "bg-pink-50 dark:bg-pink-900/20" : 
                    set.is_giant ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
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
                      ) : set.is_superset ? (
                        <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full">
                          Superset with {workoutExercises[set.superset_with]?.name || "Deleted Exercise"}
                        </span>
                      ) : set.is_amrap ? (
                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                          AMRAP Set
                        </span>
                      ) : set.is_restpause ? (
                        <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded-full">
                          Rest-Pause Set ({set.rest_pauses} pauses)
                        </span>
                      ) : set.is_pyramid ? (
                        <span className="text-xs bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 px-2 py-1 rounded-full">
                          Pyramid Set {set.pyramid_type === "descending" ? "(Descending)" : ""}
                        </span>
                      ) : set.is_giant ? (
                        <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full">
                          Giant Set
                        </span>
                      ) : (
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                          Normal Set
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {!set.is_drop_set && !set.is_superset && !set.is_amrap && !set.is_restpause && !set.is_pyramid && !set.is_giant && (
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
                          {set.is_warmup ? "Mark as Normal Set" : "Mark as Warm-up"}
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

      {/* Set Type Modal */}
      {showSetTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Set Type
            </h2>
            
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

            <div className="flex space-x-3">
              <button
                onClick={handleAddSetByType}
                className="bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded-lg"
              >
                {getButtonText()}
              </button>
              <button
                onClick={closeSetTypeModal}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showSupersetExerciseSelector && (
        <AddExercise
          onClose={() => setShowSupersetExerciseSelector(false)}
          onSelectExercise={(exercise) => {
            // Add the selected exercise to the workout if not already present
            const existingIndex = workoutExercises.findIndex(ex => ex.name === exercise.name);
            
            if (existingIndex === -1) {
              // If the exercise doesn't exist yet, add it to the workout
              const emptySets = Array(exercise.initialSets || 1)
                .fill()
                .map(() => ({
                  weight: "",
                  reps: "",
                  notes: "",
                  is_warmup: false,
                  is_drop_set: false,
                  is_superset: false
                }));
              
              // Add the new exercise
              const newExercise = { 
                ...exercise, 
                sets: emptySets, 
                is_cardio: exercise.is_cardio || false 
              };
              
              setWorkoutExercises(prev => [...prev, newExercise]);
              
              // Use the last index as the superset exercise ID
              setSupersetExerciseId(String(workoutExercises.length));
            } else {
              // If the exercise already exists, use its index
              setSupersetExerciseId(String(existingIndex));
            }
            
            setShowSupersetExerciseSelector(false);
          }}
        />
      )}
    </div>
  );
}

export default WorkoutLog;
