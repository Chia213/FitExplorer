import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getSavedPrograms, updateSavedProgram } from "../api/savedProgramsApi";
import { toast } from "react-hot-toast";
import {
  FaDumbbell,
  FaClipboardList,
  FaCalendarAlt,
  FaChartLine,
  FaHistory,
  FaSpinner,
  FaExclamationTriangle,
  FaStar,
  FaCheck,
  FaPlay,
  FaArrowLeft,
  FaArrowRight,
  FaRegCalendarCheck,
  FaUserAlt,
  FaBolt,
  FaLayerGroup,
  FaHourglass,
  FaSync,
  FaSyncAlt,
  FaPlayCircle,
  FaClock,
  FaChartBar,
  FaFire,
  FaTachometerAlt,
  FaBookmark,
  FaInfoCircle,
  FaPlus,
  FaTrash,
  FaWeight,
  FaStopwatch,
  FaFlagCheckered,
  FaStopwatch20,
  FaChevronRight,
  FaChevronDown,
  FaChevronUp,
  FaHotTub,
  FaWalking,
  FaRunning,
  FaCheckCircle,
  FaCheckSquare,
  FaExchangeAlt,
  FaTrophy,
  FaBullseye,
  FaHeartbeat,
  FaWeightHanging
} from "react-icons/fa";
import { notifyGoalAchieved, notifyProgramStarted } from '../utils/notificationsHelpers';
import Modal from "../components/Modal";

// Sample exercise demo GIFs - in a real application, you would store these URLs in your database
// or fetch them from an API. This is just for demonstration purposes.
const exerciseDemos = {
  "Bench Press": {
    gifUrl: "https://example.com/bench-press.gif",
    description:
      "Lie on a flat bench with your feet firmly on the ground. Grip the barbell slightly wider than shoulder-width apart. Lower the bar to your mid-chest, then press it back up to the starting position, fully extending your arms.",
    tips: [
      "Keep your wrists straight and elbows at about 45-degree angles.",
      "Maintain a slight arch in your lower back.",
      "Keep your feet flat on the floor for stability.",
      "Breathe in as you lower the bar and exhale as you press up.",
    ],
  },
  Squat: {
    gifUrl: "https://example.com/squat.gif",
    description:
      "Stand with feet shoulder-width apart, toes slightly turned out. Hold the barbell across your upper back. Bend your knees and hips to lower your body, keeping your chest up and back straight. Push through your heels to return to standing.",
    tips: [
      "Keep your knees in line with your toes, not caving inward.",
      "Maintain a neutral spine throughout the movement.",
      "Go as deep as your mobility allows while maintaining proper form.",
      "Drive through your heels on the way up.",
    ],
  },
  Deadlift: {
    gifUrl: "https://example.com/deadlift.gif",
    description:
      "Stand with feet hip-width apart, with the barbell over your mid-foot. Bend at the hips and knees, gripping the bar just outside your legs. Keeping your back straight, stand up by driving through your heels, extending your hips and knees.",
    tips: [
      "Keep the bar close to your body throughout the movement.",
      "Your shoulders should be slightly in front of the bar in the starting position.",
      "Engage your core and lats before lifting.",
      "Push the floor away as you lift rather than pulling with your back.",
    ],
  },
  // You can add more exercises as needed
};

// Generic exercise description if a specific one isn't available
const defaultExerciseDescription = {
  gifUrl: "https://example.com/default-exercise.gif",
  description:
    "This exercise targets the specified muscle group through a controlled range of motion. Focus on proper form rather than the amount of weight lifted, especially when learning the movement.",
  tips: [
    "Maintain proper posture throughout the exercise.",
    "Control the movement during both the concentric and eccentric phases.",
    "Breathe steadily and don't hold your breath.",
    "If you feel pain (not muscle fatigue), stop and check your form.",
  ],
};

function ProgramTracker() {
  const location = useLocation();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [programProgress, setProgramProgress] = useState(null);
  const [currentWeekWorkout, setCurrentWeekWorkout] = useState(null);
  const [exerciseProgress, setExerciseProgress] = useState({});
  const [showExerciseDetails, setShowExerciseDetails] = useState(null);
  const [editingWeight, setEditingWeight] = useState(null);
  const [exerciseWeights, setExerciseWeights] = useState({});
  const [exerciseNotes, setExerciseNotes] = useState({});
  const [savedProgramId, setSavedProgramId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, workout, progress, history
  const [showWeekCompleteModal, setShowWeekCompleteModal] = useState(false);
  const [showProgramCompleteModal, setShowProgramCompleteModal] = useState(false);
  const [lastCompletedWeek, setLastCompletedWeek] = useState(null);
  const [showExerciseNotesModal, setShowExerciseNotesModal] = useState(null);
  const [weightUnit, setWeightUnit] = useState("kg"); // kg or lbs
  const [editingSetWeight, setEditingSetWeight] = useState(null); // { exerciseName, setIndex }
  const [showExerciseDemo, setShowExerciseDemo] = useState(null);
  const [showStartProgramModal, setShowStartProgramModal] = useState(false);
  const [weekStats, setWeekStats] = useState({
    totalSets: 0,
    totalExercises: 0,
    completedExercises: 0,
    completedSets: 0,
    volumeLifted: 0,
    cardioMinutes: 0
  });
  const [showFilter, setShowFilter] = useState("all"); // all, todo, completed
  const [exerciseSets, setExerciseSets] = useState({});
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [modalFormData, setModalFormData] = useState({
    duration: "",
    distance: "",
    heartRate: "",
    intensity: "moderate",
    weight: "",
    reps: ""
  });

  // Get programId from URL query parameters if available
  const queryParams = new URLSearchParams(location.search);
  const programIdFromQuery = queryParams.get('programId');
  
  // Initialize the tracker with workout data
  useEffect(() => {
    const initializeTracker = async () => {
      try {
        setIsLoading(true);
        // Log the entire location state for debugging
        console.log("Location state:", location.state);
        console.log("Program ID from query:", programIdFromQuery);
        
        // Check if we're initializing with a program ID
        const programId = programIdFromQuery || location.state?.programId;
        
        // Fetch the saved program if a programId is provided
        if (programId) {
          const token = localStorage.getItem("token");
          if (!token) {
            toast.error("Please log in to view your program");
            navigate('/login', { state: { from: '/program-tracker' } });
            return;
          }
          
          const savedPrograms = await getSavedPrograms(token);
          const program = savedPrograms.find(p => p.id === programId);
          
          if (!program) {
            throw new Error("Program not found. It may have been deleted.");
          }
          
          setSavedProgramId(program.id);
          
          // Parse program data
          let programData = program.program_data;
          if (typeof programData === "string") {
            programData = JSON.parse(programData);
          }
          
          // Setup initial progress data
          const initialProgressData = {
            currentWeek: 1,
            completedWeeks: []
          };
          
          // Set workout and progress data
          setWorkout(programData);
          setProgramProgress(initialProgressData);
          
          // Find the first week's workout
          const weekWorkout = programData.sixWeekProgram.find(
            (weekPlan) => weekPlan.week === 1
          );
          
          if (!weekWorkout) {
            throw new Error("Could not find workout for week 1");
          }
          
          // Always organize exercises by day, even if workouts property already exists
          // This ensures consistent grouping
          const workouts = [];
          
          // If we have a training schedule in the workout, use it
          if (programData.trainingSchedule) {
            // Create days based on training schedule
            Object.entries(programData.trainingSchedule).forEach(([dayName, muscles]) => {
              // Filter exercises for this day's muscle groups
              const dayExercises = weekWorkout.exercises.filter(ex => 
                muscles.includes(ex.muscle)
              );
              
              if (dayExercises.length > 0) {
                workouts.push({
                  day: dayName,
                  focus: muscles.join(', '),
                  exercises: dayExercises
                });
              }
            });
          } else {
            // Create a simple split based on the number of workouts per week
            // Use daysPerWeek explicitly if available, otherwise fall back to workoutsPerWeek
            const dayCount = parseInt(programData.daysPerWeek || programData.workoutsPerWeek) || Math.min(5, weekWorkout.exercises.length);
            const exercisesPerDay = Math.ceil(weekWorkout.exercises.length / dayCount);
            
            // Check if we should use a single day full-body workout
            if (dayCount === 1) {
              workouts.push({
                day: "Day 1",
                focus: "Full Body",
                exercises: weekWorkout.exercises
              });
            } else {
              // Distribute exercises evenly across days
              for (let i = 0; i < dayCount; i++) {
                const startIdx = i * exercisesPerDay;
                const endIdx = Math.min(startIdx + exercisesPerDay, weekWorkout.exercises.length);
                const dayExercises = weekWorkout.exercises.slice(startIdx, endIdx);
                
                if (dayExercises.length > 0) {
                  const muscleGroups = [...new Set(dayExercises.map(ex => ex.muscle))];
                  workouts.push({
                    day: `Day ${i + 1}`,
                    focus: muscleGroups.join(', '),
                    exercises: dayExercises
                  });
                }
              }
            }
          }
          
          // Make sure we have at least one day
          if (workouts.length === 0 && weekWorkout.exercises.length > 0) {
            workouts.push({
              day: 'Day 1',
              focus: 'Full Body',
              exercises: [...weekWorkout.exercises]
            });
          }
          
          // Update the current week workout with day structure
          const updatedWeekWorkout = {
            ...weekWorkout,
            workouts: workouts
          };
          
          // Update in the six week program
          const updatedSixWeekProgram = programData.sixWeekProgram.map(w => {
            if (w.week === 1) {
              return updatedWeekWorkout;
            }
            return w;
          });
          
          const updatedProgramData = {
            ...programData,
            sixWeekProgram: updatedSixWeekProgram
          };
          
          // Set workout and updated week workout
          setWorkout(updatedProgramData);
          setCurrentWeekWorkout(updatedWeekWorkout);
          
          // Load saved weights and notes if they exist
          if (program.exercise_weights) {
            try {
              const weights =
                typeof program.exercise_weights === "string"
                  ? JSON.parse(program.exercise_weights)
                  : program.exercise_weights;
              setExerciseWeights(weights);
              
              // Calculate volume lifted for dashboard stats
              calculateWeekStats(weights, updatedWeekWorkout);
            } catch (error) {
              console.error("Failed to parse saved weights:", error);
            }
          } else {
            // Initialize stats even if no weights are saved
            calculateWeekStats({}, updatedWeekWorkout);
          }
          
          if (program.exercise_notes) {
            try {
              const notes =
                typeof program.exercise_notes === "string"
                  ? JSON.parse(program.exercise_notes)
                  : program.exercise_notes;
              setExerciseNotes(notes);
            } catch (error) {
              console.error("Failed to parse saved notes:", error);
            }
          }
          
          // Show the start program modal
          setShowStartProgramModal(true);
        }
        // Otherwise use the workout and progress from location state
        else {
          // Attempt to parse workout data more flexibly
          let workoutData = location.state?.workout;
          let progressData = location.state?.progress;

          // If workout is a string, try parsing it
          if (typeof workoutData === "string") {
            try {
              workoutData = JSON.parse(workoutData);
            } catch (parseError) {
              console.error("Failed to parse workout data:", parseError);
              throw new Error("Invalid workout data format");
            }
          }

          // If progress is a string, try parsing it
          if (typeof progressData === "string") {
            try {
              progressData = JSON.parse(progressData);
            } catch (parseError) {
              console.error("Failed to parse progress data:", parseError);
              throw new Error("Invalid progress data format");
            }
          }

          // Validate required data and handle missing data gracefully
          if (!workoutData || !progressData) {
            console.warn("Missing workout or progress information, checking localStorage");
            
            // Try to recover data from localStorage
            const savedWorkoutData = localStorage.getItem("currentWorkout");
            const savedProgressData = localStorage.getItem("programProgress");
            
            if (savedWorkoutData) {
              try {
                workoutData = JSON.parse(savedWorkoutData);
                console.log("Recovered workout data from localStorage");
              } catch (e) {
                console.error("Failed to parse saved workout data:", e);
              }
            }
            
            if (savedProgressData) {
              try {
                progressData = JSON.parse(savedProgressData);
                console.log("Recovered progress data from localStorage");
              } catch (e) {
                console.error("Failed to parse saved progress data:", e);
              }
            }
            
            // If still missing required data
            if (!workoutData || !progressData) {
              // Redirect to program selection page
              toast.error("Program data not found. Please select a program.");
              navigate('/programs');
              return;
            }
          }

          // Ensure sixWeekProgram exists and is an array
          if (
            !workoutData.sixWeekProgram ||
            !Array.isArray(workoutData.sixWeekProgram)
          ) {
            throw new Error("Invalid workout program structure");
          }

          // Find the current week's workout plan
          const weekWorkout = workoutData.sixWeekProgram.find(
            weekPlan => weekPlan.week === progressData.currentWeek
          );

          if (!weekWorkout) {
            throw new Error(`Could not find workout for week ${progressData.currentWeek}`);
          }

          // Group exercises by day if not already grouped
          let updatedWeekWorkout = weekWorkout;
          
          if (!weekWorkout.workouts && workoutData.sixWeekProgram) {
            // Group exercises by muscle group or create a sensible daily split
            const muscleGroups = [...new Set(weekWorkout.exercises.map(ex => ex.muscle))];
            const dayCount = parseInt(workoutData.daysPerWeek || workoutData.workoutsPerWeek) || muscleGroups.length;
            
            // Create workouts array with day structure
            const workouts = [];
            
            // If we have a training schedule in the workout, use it
            if (workoutData.trainingSchedule) {
              // Create days based on training schedule
              Object.entries(workoutData.trainingSchedule).forEach(([dayName, muscles], index) => {
                // Filter exercises that belong to this day's muscle groups
                const dayExercises = weekWorkout.exercises.filter(ex => 
                  muscles.includes(ex.muscle)
                );
                
                if (dayExercises.length > 0) {
                  workouts.push({
                    day: dayName,
                    focus: muscles.join(', '),
                    exercises: dayExercises
                  });
                }
              });
            } else {
              // Create a simple split based on the number of workouts per week
              // Group exercises by muscle and distribute them across days
              
              // Check if we should use a single day full-body workout
              if (dayCount === 1) {
                workouts.push({
                  day: "Day 1",
                  focus: "Full Body",
                  exercises: weekWorkout.exercises
                });
              } else {
                const exercisesByMuscle = {};
                weekWorkout.exercises.forEach(ex => {
                  if (!exercisesByMuscle[ex.muscle]) {
                    exercisesByMuscle[ex.muscle] = [];
                  }
                  exercisesByMuscle[ex.muscle].push(ex);
                });
                
                // Distribute muscle groups across the days
                const muscleGroupArray = Object.keys(exercisesByMuscle);
                const musclesPerDay = Math.ceil(muscleGroupArray.length / dayCount);
                
                // If we have muscle groups, distribute them across days
                if (muscleGroupArray.length > 0) {
                  for (let i = 0; i < dayCount; i++) {
                    const startIdx = i * musclesPerDay;
                    const endIdx = Math.min(startIdx + musclesPerDay, muscleGroupArray.length);
                    const dayMuscles = muscleGroupArray.slice(startIdx, endIdx);
                    
                    if (dayMuscles.length > 0) {
                      const dayExercises = [];
                      dayMuscles.forEach(muscle => {
                        dayExercises.push(...exercisesByMuscle[muscle]);
                      });
                      
                      workouts.push({
                        day: `Day ${i + 1}`,
                        focus: dayMuscles.join(', '),
                        exercises: dayExercises
                      });
                    }
                  }
                } else {
                  // Fallback to simple distribution if no muscle groups exist
                  const exercisesPerDay = Math.ceil(weekData.exercises.length / dayCount);
                  
                  for (let i = 0; i < dayCount; i++) {
                    const startIdx = i * exercisesPerDay;
                    const endIdx = Math.min(startIdx + exercisesPerDay, weekData.exercises.length);
                    const dayExercises = weekData.exercises.slice(startIdx, endIdx);
                    
                    if (dayExercises.length > 0) {
                      // Try to determine a focus area from the exercises
                      const muscleGroups = [...new Set(dayExercises.map(ex => ex.muscle))];
                      workouts.push({
                        day: `Day ${i + 1}`,
                        focus: muscleGroups.join(', '),
                        exercises: dayExercises
                      });
                    }
                  }
                }
              }
            }
            
            // Make sure we have at least one day
            if (workouts.length === 0 && weekWorkout.exercises.length > 0) {
              workouts.push({
                day: 'Day 1',
                focus: 'Full Body',
                exercises: [...weekWorkout.exercises]
              });
            }
            
            // Update the current week workout to include the day structure
            updatedWeekWorkout = {
              ...weekWorkout,
              workouts: workouts
            };
            
            // Update the workout structure to include the new day-based organization
            const updatedSixWeekProgram = workoutData.sixWeekProgram.map(w => {
              if (w.week === progressData.currentWeek) {
                return updatedWeekWorkout;
              }
              return w;
            });
            
            const updatedWorkoutData = {
              ...workoutData,
              sixWeekProgram: updatedSixWeekProgram
            };
            
            setWorkout(updatedWorkoutData);
          }
          
          // Set initial states
          setWorkout(workoutData);
          setProgramProgress(progressData);
          setCurrentWeekWorkout(updatedWeekWorkout);

          // Find the corresponding saved program
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("No authentication token found");
          }

          const savedPrograms = await getSavedPrograms(token);

          // Look for the matching program
          const matchingProgram = savedPrograms.find((program) => {
            // Handle potential parsing of program_data
            let programData = program.program_data;
            if (typeof programData === "string") {
              try {
                programData = JSON.parse(programData);
              } catch {
                return false;
              }
            }
            return programData.id === workoutData.id;
          });

          if (matchingProgram) {
            setSavedProgramId(matchingProgram.id);

            // Load saved weights and notes if they exist
            if (matchingProgram.exercise_weights) {
              try {
                const weights =
                  typeof matchingProgram.exercise_weights === "string"
                    ? JSON.parse(matchingProgram.exercise_weights)
                    : matchingProgram.exercise_weights;
                setExerciseWeights(weights);
                
                // Calculate volume lifted for dashboard stats
                calculateWeekStats(weights, updatedWeekWorkout);
              } catch (error) {
                console.error("Failed to parse saved weights:", error);
              }
            } else {
              // Initialize stats even if no weights are saved
              calculateWeekStats({}, updatedWeekWorkout);
            }

            if (matchingProgram.exercise_notes) {
              try {
                const notes =
                  typeof matchingProgram.exercise_notes === "string"
                    ? JSON.parse(matchingProgram.exercise_notes)
                    : matchingProgram.exercise_notes;
                setExerciseNotes(notes);
              } catch (error) {
                console.error("Failed to parse saved notes:", error);
              }
            }
          }
        }

        // Initialize exercise progress state
        const initialProgress = {};
        if (currentWeekWorkout && currentWeekWorkout.workouts) {
          currentWeekWorkout.workouts.forEach((dayWorkout) => {
            dayWorkout.exercises.forEach((exercise) => {
              initialProgress[exercise.name] = false;
            });
          });
        }
        setExerciseProgress(initialProgress);

        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing workout tracker:", error);
        toast.error(error.message || "Failed to load workout tracker");
        setError(error.message || "Failed to load workout tracker");
        setIsLoading(false);
      }
    };

    initializeTracker();
  }, [location.state, navigate, programIdFromQuery]);

  // Helper function to calculate week statistics for dashboard
  const calculateWeekStats = (weights, weekWorkout) => {
    if (!weekWorkout || !weekWorkout.workouts) return;
    
    let totalSets = 0;
    let totalExercises = 0;
    let completedExercises = 0;
    let completedSets = 0;
    let volumeLifted = 0;
    let cardioMinutes = 0;
    
    weekWorkout.workouts.forEach(day => {
      day.exercises.forEach(exercise => {
        totalExercises++;
        totalSets += exercise.sets;
        
        // Check if exercise is completed
        if (exerciseProgress[exercise.name]) {
          completedExercises++;
          completedSets += exercise.sets;
        }
        
        // Calculate volume (weight x sets x reps)
        if (weights[exercise.name]) {
          if (exercise.is_cardio) {
            // Add up cardio minutes
            for (let i = 0; i < exercise.sets; i++) {
              const setData = weights[exercise.name][`set${i}`];
              if (setData && setData.duration) {
                cardioMinutes += parseInt(setData.duration) || 0;
              }
            }
          } else {
            // Calculate weight volume
            for (let i = 0; i < exercise.sets; i++) {
              const weight = weights[exercise.name][`set${i}`] || 0;
              // Use middle of rep range if a range is provided
              let reps = exercise.reps;
              if (typeof reps === 'string' && reps.includes('-')) {
                const [min, max] = reps.split('-').map(r => parseInt(r.trim()));
                reps = Math.round((min + max) / 2);
              } else {
                reps = parseInt(reps) || 8; // Default to 8 if can't parse
              }
              volumeLifted += weight * reps;
            }
          }
        }
      });
    });
    
    setWeekStats({
      totalSets,
      totalExercises,
      completedExercises,
      completedSets,
      volumeLifted,
      cardioMinutes
    });
  };

  const saveExerciseWeight = async (exerciseName, setIndex, weight) => {
    // Create a deep copy of the current weights
    const newWeights = JSON.parse(JSON.stringify(exerciseWeights));

    // Initialize the exercise entry if it doesn't exist
    if (!newWeights[exerciseName]) {
      newWeights[exerciseName] = {};
    }

    // For backward compatibility, if setIndex is null, treat it as the exercise's general weight
    if (setIndex === null) {
      newWeights[exerciseName].general = weight;
    } else {
      // Save weight for the specific set
      newWeights[exerciseName][`set${setIndex}`] = weight;
    }

    // Save to local state
    setExerciseWeights(newWeights);

    // Also save to the database
    try {
      const token = localStorage.getItem("token");
      if (savedProgramId) {
        await updateSavedProgram(
          savedProgramId,
          {
            exercise_weights: JSON.stringify(newWeights),
          },
          token
        );
      }
    } catch (error) {
      console.error("Error saving weight:", error);
    }

    // Close weight editing
    setEditingSetWeight(null);
    setEditingWeight(null);
  };

  const toggleWeightUnit = async () => {
    const oldUnit = weightUnit;
    const newUnit = oldUnit === "kg" ? "lbs" : "kg";

    // Convert all weights to the new unit
    const convertedWeights = {};

    for (const [exerciseName, exerciseData] of Object.entries(
      exerciseWeights
    )) {
      convertedWeights[exerciseName] = {};

      for (const [key, value] of Object.entries(exerciseData)) {
        if (value !== null && value !== undefined && !isNaN(value)) {
          convertedWeights[exerciseName][key] = convertWeight(
            value,
            oldUnit,
            newUnit
          );
        } else {
          convertedWeights[exerciseName][key] = value;
        }
      }
    }

    // Update state
    setWeightUnit(newUnit);
    setExerciseWeights(convertedWeights);

    // Save preference and converted weights to database
    try {
      const token = localStorage.getItem("token");
      if (savedProgramId) {
        await updateSavedProgram(
          savedProgramId,
          {
            weight_unit: newUnit,
            exercise_weights: JSON.stringify(convertedWeights),
          },
          token
        );
      }
    } catch (error) {
      console.error("Error saving weight unit preference:", error);
    }
  };

  const convertWeight = (weight, from, to) => {
    if (weight === null || weight === undefined || isNaN(weight)) return weight;

    if (from === to) return weight;

    // kg to lbs: multiply by 2.20462
    if (from === "kg" && to === "lbs") {
      return parseFloat((weight * 2.20462).toFixed(1));
    }

    // lbs to kg: divide by 2.20462
    if (from === "lbs" && to === "kg") {
      return parseFloat((weight / 2.20462).toFixed(1));
    }

    return weight;
  };

  const getWeightDisplay = (exerciseName, setIndex) => {
    if (!exerciseWeights[exerciseName]) return "-";

    // If looking for a specific set
    if (setIndex !== undefined) {
      const weight = exerciseWeights[exerciseName][`set${setIndex}`];
      if (weight !== undefined) {
        return `${weight} ${weightUnit}`;
      }
    }

    // Fallback to general weight if set-specific is not found
    const generalWeight = exerciseWeights[exerciseName].general;
    return generalWeight !== undefined ? `${generalWeight} ${weightUnit}` : "-";
  };

  const completeAllSets = (exerciseName) => {
    // Mark the exercise as completed
    updateExerciseProgress(exerciseName, true);
  };

  const completeAllExercises = () => {
    // Create a new progress object marking all exercises as complete
    const allExercisesComplete = {};
    currentWeekWorkout.workouts.forEach((dayWorkout) => {
      dayWorkout.exercises.forEach((exercise) => {
      allExercisesComplete[exercise.name] = true;
      });
    });

    // Update state
    setExerciseProgress(allExercisesComplete);
  };

  const saveExerciseNote = async (exerciseName, note) => {
    const newNotes = {
      ...exerciseNotes,
      [exerciseName]: note,
    };

    // Save to local state
    setExerciseNotes(newNotes);

    // Also save to the database
    try {
      const token = localStorage.getItem("token");
      if (savedProgramId) {
        await updateSavedProgram(
          savedProgramId,
          {
            exercise_notes: JSON.stringify(newNotes),
          },
          token
        );
      }
    } catch (error) {
      console.error("Error saving note:", error);
    }

    // Close note editing
    setShowExerciseNotesModal(null);
  };

  const updateProgramProgress = async (newProgress) => {
    try {
      // Always save the progress to localStorage for persistence
      localStorage.setItem("programProgress", JSON.stringify(newProgress));
      
      if (!savedProgramId) {
        console.warn("No saved program ID available");
        setProgramProgress(newProgress);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Save the current exercise weights and notes
      const updatedData = {
        current_week: newProgress.currentWeek,
        completed_weeks: newProgress.completedWeeks,
        exercise_weights: JSON.stringify(exerciseWeights),
        exercise_notes: JSON.stringify(exerciseNotes),
        weight_unit: weightUnit
      };

      // Update the program on the server
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/saved-programs/${savedProgramId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update program progress");
      }

      // Update local state
      setProgramProgress(newProgress);

      // Update UI based on progress
      if (
        !newProgress.completedWeeks.includes(newProgress.currentWeek) &&
        Object.values(exerciseProgress).every((completed) => completed === true)
      ) {
        // All exercises are completed
        setShowWeekCompleteModal(true);
      }

      return true;
    } catch (error) {
      console.error("Error updating program progress:", error);
      // Still update local state even if server update fails
      setProgramProgress(newProgress);
      return false;
    }
  };

  const completeWeek = () => {
    if (!programProgress) return;

    // Save the last completed week for the success modal
    setLastCompletedWeek(programProgress.currentWeek);

    const updatedProgress = {
      ...programProgress,
      completedWeeks: [
        ...programProgress.completedWeeks,
        programProgress.currentWeek,
      ],
      currentWeek: Math.min(programProgress.currentWeek + 1, 6),
    };

    updateProgramProgress(updatedProgress);

    // If this was the final week (week 6), show the program completion modal
    if (programProgress.currentWeek === 6) {
      // Program is fully complete - show the completion options modal
      setShowProgramCompleteModal(true);
      notifyGoalAchieved("6-week workout program");
    } else {
      // Regular week completion
      setShowWeekCompleteModal(true);
      notifyGoalAchieved(`Week ${programProgress.currentWeek} of workout program`);
    }
  };

  const updateExerciseProgress = (exerciseName, completed) => {
    const newProgress = {
      ...exerciseProgress,
      [exerciseName]: completed,
    };
    setExerciseProgress(newProgress);
  };

  const isWeekComplete = currentWeekWorkout?.workouts
    ? currentWeekWorkout.workouts.every(day => 
        day.exercises.every(exercise => exerciseProgress[exercise.name])
      )
    : currentWeekWorkout?.exercises
      ? currentWeekWorkout.exercises.every(exercise => exerciseProgress[exercise.name])
      : false;

  // Helper function to determine the program phase based on the week
  const getProgramPhase = (week) => {
    if (week === 1) return "Base Building";
    if (week === 2) return "Progressive Overload";
    if (week === 3) return "Volume Challenge";
    if (week === 4) return "Intensity Peak";
    if (week === 5) return "Performance Week";
    if (week === 6) return "Maintenance & Deload";
    return "Custom Phase";
  };

  // Helper function to determine the status of a week
  const getWeekStatus = (weekNumber) => {
    if (programProgress.completedWeeks.includes(weekNumber)) return "completed";
    if (weekNumber === programProgress.currentWeek) return "current";
    if (weekNumber < programProgress.currentWeek) return "skipped";
    return "upcoming";
  };

  const getExerciseDemo = (exerciseName) => {
    return exerciseDemos[exerciseName] || defaultExerciseDescription;
  };

  const handleStartProgram = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to be logged in to start a program.");
        navigate("/login");
        return;
      }

      // Save current workout and progress data to localStorage
      // to ensure it's available if the page is refreshed
      localStorage.setItem("currentWorkout", JSON.stringify(workout));
      
      const initialProgress = {
        currentWeek: 1,
        completedWeeks: [],
      };
      
      localStorage.setItem("programProgress", JSON.stringify(initialProgress));

      const programData = {
        program_data: workout,
        current_week: 1,
        completed_weeks: [],
      };

      const response = await fetch(`${backendURL}/saved-programs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(programData),
      });

      if (!response.ok) {
        throw new Error("Failed to start program");
      }

      const savedProgram = await response.json();
      setSavedProgramId(savedProgram.id);
      setProgramProgress(initialProgress);
      setShowStartProgramModal(false);
      await notifyProgramStarted(workout.name);
    } catch (error) {
      alert("Error starting program. Please try again.");
    }
  };

  const getCardioDisplay = (exerciseName, setIndex, type) => {
    if (!exerciseWeights[exerciseName]) return "-";
    
    const setData = exerciseWeights[exerciseName][`set${setIndex}`];
    if (!setData) return "-";
    
    return setData[type] || "-";
  };

  // Helper function to calculate pace (min/km) from duration and distance
  const calculatePace = (duration, distance) => {
    if (!duration || !distance || isNaN(duration) || isNaN(distance) || parseFloat(distance) === 0) {
      return "-";
    }
    
    const durationMinutes = parseFloat(duration);
    const distanceKm = parseFloat(distance);
    
    // Calculate pace in minutes per kilometer
    const pace = durationMinutes / distanceKm;
    
    // Format the pace
    const paceMinutes = Math.floor(pace);
    const paceSeconds = Math.round((pace - paceMinutes) * 60);
    
    return `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}`;
  };

  const getIntensityColor = (intensity) => {
    const colors = {
      low: "text-green-500",
      moderate: "text-yellow-500",
      high: "text-orange-500",
      very_high: "text-red-500"
    };
    return colors[intensity] || "text-gray-500";
  };

  const intensityLevels = [
    { value: "low", label: "Low (50-60% MHR)", color: "bg-green-100 dark:bg-green-800" },
    { value: "moderate", label: "Moderate (60-70% MHR)", color: "bg-yellow-100 dark:bg-yellow-800" },
    { value: "high", label: "High (70-85% MHR)", color: "bg-orange-100 dark:bg-orange-800" },
    { value: "very_high", label: "Very High (85-95% MHR)", color: "bg-red-100 dark:bg-red-800" }
  ];

  // Add new helper function for cardio stats
  const getCardioStats = (exerciseName) => {
    if (!exerciseWeights[exerciseName]) return null;

    const sets = Object.entries(exerciseWeights[exerciseName])
      .filter(([key]) => key.startsWith('set'))
      .map(([_, data]) => data);

    if (sets.length === 0) return null;

    const totalDistance = sets.reduce((sum, set) => sum + (parseFloat(set.distance) || 0), 0);
    const totalDuration = sets.reduce((sum, set) => sum + (parseFloat(set.duration) || 0), 0);
    const avgHeartRate = sets.reduce((sum, set) => sum + (parseFloat(set.heartRate) || 0), 0) / sets.length;
    
    return {
      totalDistance: totalDistance.toFixed(2),
      totalDuration: totalDuration.toFixed(1),
      averagePace: totalDistance > 0 ? (totalDuration / totalDistance).toFixed(2) : null,
      averageHeartRate: avgHeartRate > 0 ? Math.round(avgHeartRate) : null
    };
  };

  // Add new helper function to determine if exercise is treadmill or bicycle
  const isCardioMachineExercise = (exerciseName) => {
    const name = exerciseName.toLowerCase();
    return name.includes('treadmill') || name.includes('bike') || name.includes('bicycle') || name.includes('cycle');
  };

  const isTreadmillExercise = (exerciseName) => {
    return exerciseName.toLowerCase().includes('treadmill');
  };

  const isBicycleExercise = (exerciseName) => {
    const name = exerciseName.toLowerCase();
    return name.includes('bike') || name.includes('bicycle') || name.includes('cycle');
  };

  // Function to complete all exercises in a day
  const completeDayExercises = (exercises) => {
    const updatedProgress = { ...exerciseProgress };
    exercises.forEach(exercise => {
      updatedProgress[exercise.name] = true;
    });
    setExerciseProgress(updatedProgress);
    toast.success("All exercises for this day marked as complete!");
  };

  const toggleExerciseCompletion = (exerciseName) => {
    updateExerciseProgress(exerciseName, !exerciseProgress[exerciseName]);
  };

  const openExerciseDemo = (exercise) => {
    setShowExerciseDemo(exercise.name);
  };

  // Function to remove a set for an exercise
  const removeSet = (exerciseName, setIndex) => {
    if (!exerciseSets[exerciseName]) return;
    
    // Create a copy of the current sets
    const currentSets = [...exerciseSets[exerciseName]];
    
    // Remove the set at the specified index
    currentSets.splice(setIndex, 1);
    
    // Update state with the modified sets
    setExerciseSets({
      ...exerciseSets,
      [exerciseName]: currentSets
    });
    
    // Also update exercise weights for persistence
    // We need to rearrange the set keys in exerciseWeights
    const updatedWeights = { ...exerciseWeights };
    
    if (updatedWeights[exerciseName]) {
      // Create a new object without the deleted set
      const newSetWeights = {};
      
      // Copy remaining sets with updated indices
      for (let i = 0; i < currentSets.length; i++) {
        if (i < setIndex) {
          // Sets before the deleted one keep the same index
          newSetWeights[`set${i}`] = updatedWeights[exerciseName][`set${i}`];
        } else {
          // Sets after the deleted one need to have their index shifted down
          newSetWeights[`set${i}`] = updatedWeights[exerciseName][`set${i+1}`];
        }
      }
      
      // Update weights with the rearranged sets
      updatedWeights[exerciseName] = newSetWeights;
      setExerciseWeights(updatedWeights);
      
      // Persist the changes
      saveExerciseWeightsToAPI(updatedWeights);
    }
    
    // Update week stats
    calculateWeekStats(exerciseWeights, currentWeekWorkout);
    
    toast.success("Set removed successfully");
  };

  // Tracking Modal - Enhanced for both strength and cardio exercises
  const renderTrackingModal = () => {
    if (!selectedExercise) return null;
    
    const isCardio = selectedExercise.type === 'cardio' || 
                    selectedExercise.name.toLowerCase().includes('cardio') ||
                    selectedExercise.category === 'cardio';
    
    // Calculate pace for cardio
    const pace = modalFormData.duration && modalFormData.distance
      ? calculatePace(modalFormData.duration, modalFormData.distance)
      : "";
      
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setModalFormData(prev => ({ ...prev, [name]: value }));
    };
    
    // Define intensity levels for cardio
    const intensityLevels = [
      { id: "low", label: "Low", color: "bg-green-500" },
      { id: "moderate", label: "Moderate", color: "bg-yellow-500" },
      { id: "high", label: "High", color: "bg-orange-500" },
      { id: "very-high", label: "Very High", color: "bg-red-500" }
    ];
    
    // Handle saving the set
    const handleSaveSet = () => {
      if (isCardio) {
        // Validate cardio inputs
        if (!modalFormData.duration) {
          toast.error("Please enter the duration");
          return;
        }
        
        if (!modalFormData.distance) {
          toast.error("Please enter the distance");
          return;
        }
        
        // Add new cardio set
        addSet(selectedExercise.name, {
          duration: modalFormData.duration,
          distance: modalFormData.distance,
          heartRate: modalFormData.heartRate || "",
          intensity: modalFormData.intensity
        });
      } else {
        // Validate strength inputs
        if (!modalFormData.weight) {
          toast.error("Please enter the weight");
          return;
        }
        
        if (!modalFormData.reps) {
          toast.error("Please enter the number of reps");
          return;
        }
        
        // Add new strength set
        addSet(selectedExercise.name, {
          weight: modalFormData.weight,
          reps: modalFormData.reps
        });
      }
      
      // Reset form
      setModalFormData({
        duration: "",
        distance: "",
        heartRate: "",
        intensity: "moderate",
        weight: "",
        reps: ""
      });
      
      // Mark exercise as in progress
      if (!exerciseProgress[selectedExercise.name]) {
        const updatedProgress = { ...exerciseProgress };
        updatedProgress[selectedExercise.name] = true;
        setExerciseProgress(updatedProgress);
      }
      
      toast.success("Set added successfully!");
    };
    
    return (
      <Modal 
        isOpen={isTrackingModalOpen} 
        onClose={() => setIsTrackingModalOpen(false)}
        title={`Track Your ${isCardio ? 'Cardio' : 'Strength'} Exercise`}
      >
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
              {isCardio ? <FaRunning size={24} className="text-blue-500" /> : <FaDumbbell size={24} className="text-blue-500" />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedExercise.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{selectedExercise.muscle}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isCardio ? (
                <>
                  {/* Cardio tracking fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        name="duration"
                        value={modalFormData.duration}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="e.g. 30"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Distance (km)
                      </label>
                      <input
                        type="number"
                        name="distance"
                        value={modalFormData.distance}
                        onChange={handleInputChange}
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="e.g. 5.0"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Heart Rate (bpm, optional)
                      </label>
                      <input
                        type="number"
                        name="heartRate"
                        value={modalFormData.heartRate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="e.g. 150"
                      />
                    </div>
                    
                    {/* Pace calculation display */}
                    {pace && (
                      <div className="bg-gray-100 dark:bg-gray-750 p-3 rounded-md">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Calculated Pace
                        </label>
                        <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                          {pace} min/km
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Intensity selection */}
                  <div className="col-span-1 md:col-span-2 mt-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Intensity Level
                    </label>
                    <div className="flex space-x-2">
                      {intensityLevels.map((level) => (
                        <button
                          key={level.id}
                          type="button"
                          onClick={() => setModalFormData({ ...modalFormData, intensity: level.id })}
                          className={`flex-1 py-2 px-3 border rounded-md text-sm font-medium transition-colors ${
                            modalFormData.intensity === level.id
                              ? `${level.color} text-white border-transparent`
                              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-650'
                          }`}
                        >
                          {level.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Strength training fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Weight ({weightUnit})
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={modalFormData.weight}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder={`e.g. 50`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Repetitions
                    </label>
                    <input
                      type="number"
                      name="reps"
                      value={modalFormData.reps}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder={`e.g. ${selectedExercise.reps}`}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Current sets table - shows previous sets for this exercise */}
          {exerciseSets[selectedExercise.name] && exerciseSets[selectedExercise.name].length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">Previous Sets</h4>
              
              <div className="overflow-x-auto bg-gray-50 dark:bg-gray-750 rounded-md p-2">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Set</th>
                      {!isCardio && (
                        <>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Weight</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reps</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                        </>
                      )}
                      {isCardio && (
                        <>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Distance</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pace</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Heart Rate</th>
                        </>
                      )}
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {exerciseSets[selectedExercise.name].map((set, setIndex) => (
                      <tr key={setIndex}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{setIndex + 1}</td>
                        
                        {!isCardio && (
                          <>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                              {set.weight} {weightUnit}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                              {set.reps}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm">
                              {set.is_warmup ? (
                                <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                                  Warm-up
                                </span>
                              ) : set.is_drop_set ? (
                                <span className="px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                  Drop Set
                                </span>
                              ) : set.is_superset ? (
                                <span className="px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                                  Superset
                                </span>
                              ) : set.is_amrap ? (
                                <span className="px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                  AMRAP
                                </span>
                              ) : set.is_restpause ? (
                                <span className="px-2 py-1 rounded-full text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                                  Rest-Pause
                                </span>
                              ) : set.is_pyramid ? (
                                <span className="px-2 py-1 rounded-full text-xs bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200">
                                  Pyramid
                                </span>
                              ) : set.is_giant ? (
                                <span className="px-2 py-1 rounded-full text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                                  Giant Set
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                  Normal
                                </span>
                              )}
                            </td>
                          </>
                        )}
                        
                        {isCardio && (
                          <>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                              {set.duration} min
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                              {set.distance} km
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                              {calculatePace(set.duration, set.distance)} min/km
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                              {set.heartRate ? `${set.heartRate} bpm` : '-'}
                            </td>
                          </>
                        )}
                        
                        <td className="px-3 py-2 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => removeSet(selectedExercise.name, setIndex)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          >
                            <FaTrash size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Quick reference information */}
          {!isCardio && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md mb-6 text-sm text-blue-800 dark:text-blue-200">
              <div className="flex items-start">
                <FaInfoCircle className="mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">Training Tip:</p>
                  <p className="mt-1">
                    <strong>Suggested:</strong> {selectedExercise.sets} sets of {selectedExercise.reps} reps 
                    {selectedExercise.weight && ` at ${selectedExercise.weight}${weightUnit}`}
                  </p>
                  <p className="mt-1">
                    <strong>Rest:</strong> {selectedExercise.rest || '60-90'} seconds between sets
          </p>
        </div>
      </div>
            </div>
          )}
          
          {isCardio && (
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md mb-6 text-sm text-green-800 dark:text-green-200">
              <div className="flex items-start">
                <FaInfoCircle className="mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">Cardio Training Tip:</p>
                  <p className="mt-1">
                    <strong>Suggested:</strong> {selectedExercise.duration || '20-30'} minutes at 
                    {selectedExercise.intensity ? ` ${selectedExercise.intensity} intensity` : ' moderate intensity'}
                  </p>
                  <p className="mt-1">
                    <strong>Heart Rate Target:</strong> {selectedExercise.targetHeartRate || '130-150'} BPM or 65-75% of max heart rate
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsTrackingModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-650 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSaveSet}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Set
            </button>
          </div>
        </div>
      </Modal>
    );
  };

  // Render a dashboard component with workout statistics
  const renderDashboard = () => {
    if (!currentWeekWorkout || !workout) return null;
    
    // Calculate week completion percentage
    const completionPercentage = Math.round(
      (weekStats.completedExercises / weekStats.totalExercises) * 100
    ) || 0;
    
    // Get the current week's muscle focus areas
    const muscleFocusAreas = currentWeekWorkout.workouts
      ? [...new Set(currentWeekWorkout.workouts.flatMap(day => day.focus.split(', ')))]
      : [];
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Completion Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Week Completion</h3>
              <div className={`text-lg font-bold ${
                completionPercentage < 25 ? 'text-red-500' :
                completionPercentage < 75 ? 'text-yellow-500' : 'text-green-500'
              }`}>
                {completionPercentage}%
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
              <div
                className={`h-2.5 rounded-full ${
                  completionPercentage < 25 ? 'bg-red-500' :
                  completionPercentage < 75 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{width: `${completionPercentage}%`}}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{weekStats.completedExercises} of {weekStats.totalExercises} exercises</span>
              <span>{weekStats.completedSets} of {weekStats.totalSets} sets</span>
            </div>
          </div>
          
          {/* Volume Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full mr-3">
                <FaWeightHanging className="text-blue-500 dark:text-blue-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Volume Lifted</h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(weekStats.volumeLifted).toLocaleString()} {weightUnit}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total weight lifted this week
            </p>
          </div>
          
          {/* Cardio Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full mr-3">
                <FaHeartbeat className="text-green-500 dark:text-green-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Cardio</h3>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {weekStats.cardioMinutes} min
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total cardio minutes this week
            </p>
          </div>
          
          {/* Program Progress Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full mr-3">
                <FaTrophy className="text-purple-500 dark:text-purple-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Program Progress</h3>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    Week {programProgress.currentWeek}
                  </p>
                  <p className="text-sm ml-2 text-gray-500 dark:text-gray-400">
                    of 6
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-purple-600 h-2.5 rounded-full"
                style={{width: `${(programProgress.currentWeek / 6) * 100}%`}}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Week Overview Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-5 flex items-center">
            <FaRegCalendarCheck className="mr-2 text-blue-500" /> Week {programProgress.currentWeek} Schedule
          </h3>
          
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-3">
              {currentWeekWorkout.workouts && currentWeekWorkout.workouts.map((day, index) => {
                // Calculate day completion percentage
                const dayExercises = day.exercises.length;
                const completedDayExercises = day.exercises.filter(ex => exerciseProgress[ex.name]).length;
                const dayCompletionPercentage = Math.round((completedDayExercises / dayExercises) * 100) || 0;
                
                return (
                  <div 
                    key={`day-${index}`}
                    className={`border rounded-lg overflow-hidden transition-all ${
                      dayCompletionPercentage === 100 
                        ? 'border-green-300 dark:border-green-700' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className={`py-2 px-3 font-medium text-center ${
                      dayCompletionPercentage === 100 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                        : 'bg-gray-100 dark:bg-gray-750 text-gray-700 dark:text-gray-300'
                    }`}>
                      {day.day}
                    </div>
                    <div className="p-3">
                      <div className="mb-2">
                        <span className="inline-block px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          {day.focus}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {day.exercises.length} exercises
                      </p>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-2">
                        <div
                          className={`h-1.5 rounded-full ${
                            dayCompletionPercentage === 0 ? 'bg-gray-400' :
                            dayCompletionPercentage < 100 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{width: `${dayCompletionPercentage}%`}}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{completedDayExercises}/{dayExercises}</span>
                        <span>{dayCompletionPercentage}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <FaBolt className="mr-2 text-yellow-500" /> Quick Actions
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <button
              onClick={() => setActiveTab("workout")}
              className="flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          >
              <FaDumbbell className="mr-2" /> Start Workout
          </button>
            
            <button
              onClick={completeAllExercises}
              className="flex items-center justify-center p-3 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary rounded-lg hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors"
            >
              <FaCheckSquare className="mr-2" /> Complete All
            </button>
            
            <button
              onClick={() => setActiveTab("progress")}
              className="flex items-center justify-center p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            >
              <FaChartLine className="mr-2" /> View Progress
            </button>
            
            {isWeekComplete && (
              <button
                onClick={completeWeek}
                className="flex items-center justify-center p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
              >
                <FaArrowRight className="mr-2" /> Next Week
              </button>
            )}
          </div>
        </div>
        
        {/* Muscle Focus */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <FaBullseye className="mr-2 text-red-500" /> This Week's Focus
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {muscleFocusAreas.map((muscle, index) => (
              <div
                key={index}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg flex items-center"
              >
                <FaFire className="mr-2 text-orange-500" />
                {muscle}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // This function gets called when changing weeks
  const handleWeekChange = (newWeek) => {
    // Check if this is a new week (not yet loaded)
    const weekData = workout.sixWeekProgram.find(
      (weekPlan) => weekPlan.week === newWeek
    );

    if (weekData) {
      // If the week data exists, set it as the current week
      
      // Always organize exercises by day, even if workouts property already exists
      // This ensures consistent grouping
      let updatedWeekData = weekData;
      
      if (!weekData.workouts || weekData.workouts.length === 0) {
        const workouts = [];
        
        // If we have a training schedule in the workout, use it
        if (workout.trainingSchedule) {
          // Create days based on training schedule
          Object.entries(workout.trainingSchedule).forEach(([dayName, muscles]) => {
            // Filter exercises for this day's muscle groups
            const dayExercises = weekData.exercises.filter(ex => 
              muscles.includes(ex.muscle)
            );
            
            if (dayExercises.length > 0) {
              workouts.push({
                day: dayName,
                focus: muscles.join(', '),
                exercises: dayExercises
              });
            }
          });
        } 
        
        // If no workouts were created or no training schedule exists, create a simple split
        if (workouts.length === 0 && weekData.exercises.length > 0) {
          const dayCount = parseInt(workout.daysPerWeek || workout.workoutsPerWeek) || Math.min(5, weekData.exercises.length);
          
          // Check if we should use a single day full-body workout
          if (dayCount === 1) {
            workouts.push({
              day: "Day 1",
              focus: "Full Body",
              exercises: weekData.exercises
            });
          } else {
            // Group exercises by muscle for better distribution
            const exercisesByMuscle = {};
            weekData.exercises.forEach(ex => {
              if (!exercisesByMuscle[ex.muscle]) {
                exercisesByMuscle[ex.muscle] = [];
              }
              exercisesByMuscle[ex.muscle].push(ex);
            });
            
            // Distribute muscle groups across the days
            const muscleGroupArray = Object.keys(exercisesByMuscle);
            const musclesPerDay = Math.ceil(muscleGroupArray.length / dayCount);
            
            // If we have muscle groups, distribute them across days
            if (muscleGroupArray.length > 0) {
              for (let i = 0; i < dayCount; i++) {
                const startIdx = i * musclesPerDay;
                const endIdx = Math.min(startIdx + musclesPerDay, muscleGroupArray.length);
                const dayMuscles = muscleGroupArray.slice(startIdx, endIdx);
                
                if (dayMuscles.length > 0) {
                  const dayExercises = [];
                  dayMuscles.forEach(muscle => {
                    dayExercises.push(...exercisesByMuscle[muscle]);
                  });
                  
                  workouts.push({
                    day: `Day ${i + 1}`,
                    focus: dayMuscles.join(', '),
                    exercises: dayExercises
                  });
                }
              }
            } else {
              // Fallback to simple distribution if no muscle groups exist
              const exercisesPerDay = Math.ceil(weekData.exercises.length / dayCount);
              
              for (let i = 0; i < dayCount; i++) {
                const startIdx = i * exercisesPerDay;
                const endIdx = Math.min(startIdx + exercisesPerDay, weekData.exercises.length);
                const dayExercises = weekData.exercises.slice(startIdx, endIdx);
                
                if (dayExercises.length > 0) {
                  // Try to determine a focus area from the exercises
                  const muscleGroups = [...new Set(dayExercises.map(ex => ex.muscle))];
                  workouts.push({
                    day: `Day ${i + 1}`,
                    focus: muscleGroups.join(', '),
                    exercises: dayExercises
                  });
                }
              }
            }
          }
        }
        
        // Update the week data with the workouts
        updatedWeekData = {
          ...weekData,
          workouts: workouts
        };
        
        // Update in the six week program
        const updatedSixWeekProgram = workout.sixWeekProgram.map(w => {
          if (w.week === newWeek) {
            return updatedWeekData;
          }
          return w;
        });
        
        setWorkout({
          ...workout,
          sixWeekProgram: updatedSixWeekProgram
        });
      }
      
      setCurrentWeekWorkout(updatedWeekData);
      
      // Initialize progress for this week's exercises if not already tracked
      const initialProgress = { ...exerciseProgress };
      const exercisesToTrack = updatedWeekData.workouts 
        ? updatedWeekData.workouts.flatMap(day => day.exercises)
        : updatedWeekData.exercises;
        
      exercisesToTrack.forEach(exercise => {
        if (initialProgress[exercise.name] === undefined) {
          initialProgress[exercise.name] = false;
        }
      });
      
      setExerciseProgress(initialProgress);
      
      // Calculate new stats for this week
      calculateWeekStats(exerciseWeights, updatedWeekData);
    }

    setProgramProgress({
      ...programProgress,
      currentWeek: newWeek,
    });
    
    // Notify the user about the week change
    toast.success(`Switched to Week ${newWeek}`);
  };

  // Function to add a set for an exercise
  const addSet = (exerciseName, setData) => {
    // Create a copy of the current sets or initialize an empty array if none exist
    const currentSets = exerciseSets[exerciseName] ? [...exerciseSets[exerciseName]] : [];
    
    // Add the new set data
    currentSets.push(setData);
    
    // Update state with the new sets
    setExerciseSets({
      ...exerciseSets,
      [exerciseName]: currentSets
    });
    
    // Also update exercise weights for persistence
    if (setData.weight) {
      const setIndex = currentSets.length - 1;
      saveExerciseWeight(exerciseName, `set${setIndex}`, setData.weight);
    }
    
    // Update week stats
    calculateWeekStats(exerciseWeights, currentWeekWorkout);
  };

  // Improved UI for the program tracker
  return (
    <div className="min-h-screen p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Header with back button and program title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <Link
              to="/saved-programs"
              className="mr-4 text-blue-500 hover:text-blue-600 transition-colors"
            >
              <FaArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {workout?.title || "Workout Program"}
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Program phase badge */}
            <div className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full flex items-center">
              <FaCalendarAlt className="mr-1" size={14} />
              Week {programProgress?.currentWeek || 1}/6
            </div>

            {/* Program duration badge */}
            <div className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-3 py-1 rounded-full flex items-center">
              <FaClock className="mr-1" size={14} />
              {workout?.duration || 45} min
            </div>

            {/* Weight Unit Toggle Button */}
            <button
              onClick={toggleWeightUnit}
              className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary px-3 py-1 rounded-full flex items-center transition-colors hover:bg-primary/20 dark:hover:bg-primary/30"
              title={`Switch to ${weightUnit === "kg" ? "lbs" : "kg"}`}
            >
              <FaExchangeAlt className="mr-1" size={14} />
              {weightUnit.toUpperCase()}
            </button>
          </div>
        </div>

        {/* Navigation Tabs - Improved with active indicator */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
          <button
            className={`py-3 px-5 font-medium flex items-center whitespace-nowrap transition-colors ${
              activeTab === "dashboard"
                ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("dashboard")}
          >
            <FaChartLine className="mr-2" /> Dashboard
          </button>
          <button
            className={`py-3 px-5 font-medium flex items-center whitespace-nowrap transition-colors ${
              activeTab === "workout"
                ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("workout")}
          >
            <FaDumbbell className="mr-2" /> Workout
          </button>
          <button
            className={`py-3 px-5 font-medium flex items-center whitespace-nowrap transition-colors ${
              activeTab === "progress"
                ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("progress")}
          >
            <FaChartLine className="mr-2" /> Progress
          </button>
          <button
            className={`py-3 px-5 font-medium flex items-center whitespace-nowrap transition-colors ${
              activeTab === "history"
                ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("history")}
          >
            <FaHistory className="mr-2" /> History
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="min-h-[60vh] flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="flex flex-col items-center">
              <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Loading workout tracker...
              </p>
            </div>
          </div>
        ) : error ? (
          // Error State
          <div className="min-h-[60vh] flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="text-red-500 mb-4">
                <FaExclamationTriangle size={48} className="mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                Error Loading Workout
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
              <button
                onClick={() => navigate("/saved-programs")}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Back to Saved Programs
              </button>
                </div>
                </div>
        ) : (
          // Content based on active tab
          <>
            {/* Dashboard tab content */}
            {activeTab === "dashboard" && renderDashboard()}
            
            {/* Week Selector - when not on dashboard */}
            {activeTab !== "dashboard" && (
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center mb-4 md:mb-0">
                    <div className="text-xl font-bold">Week Selector</div>
                    <div className="ml-3 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full">
                      {getProgramPhase(programProgress.currentWeek)}
                  </div>
                </div>
                  <div className="flex space-x-2">
                    {workout.sixWeekProgram.map((weekData) => (
                <button
                        key={weekData.week}
                        onClick={() => handleWeekChange(weekData.week)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center focus:outline-none transition-colors ${
                          getWeekStatus(weekData.week) === "completed"
                            ? "bg-green-500 text-white"
                            : getWeekStatus(weekData.week) === "current"
                            ? "bg-blue-500 text-white"
                            : getWeekStatus(weekData.week) === "skipped"
                            ? "bg-yellow-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        }`}
                        disabled={
                          getWeekStatus(weekData.week) === "upcoming" &&
                          weekData.week > programProgress.currentWeek &&
                          getWeekStatus(weekData.week - 1) !== "completed"
                        }
                      >
                        {weekData.week}
                </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Workout tab content */}
            {activeTab === "workout" && (
              <div>
                {/* Filter buttons for all/todo/completed */}
                <div className="flex mb-4 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm">
                    <button
                    onClick={() => setShowFilter("all")}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                      showFilter === "all"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    All Exercises
                  </button>
                  <button
                    onClick={() => setShowFilter("todo")}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                      showFilter === "todo"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    To Do
                  </button>
                  <button
                    onClick={() => setShowFilter("completed")}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                      showFilter === "completed"
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    Completed
                    </button>
            </div>

              <h2 className="text-xl font-medium mb-4 flex items-center">
                <FaClipboardList className="mr-2 text-blue-500" /> Week{" "}
                {programProgress.currentWeek} Exercises
              </h2>
                
                <div className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
                  {/* Group exercises by day */}
                  {currentWeekWorkout?.workouts?.map((day, dayIndex) => {
                    // Check if this is a rest day
                    const isRestDay = day.focus === "Rest" || !day.exercises || day.exercises.length === 0;
                    
                    // For non-rest days, filter exercises based on the showFilter setting
                    const filteredExercises = isRestDay ? [] : day.exercises.filter(exercise => {
                      if (showFilter === "all") return true;
                      if (showFilter === "todo") return !exerciseProgress[exercise.name];
                      if (showFilter === "completed") return exerciseProgress[exercise.name];
                      return true;
                    });
                    
                    // Skip rendering this day if it's not a rest day and has no exercises matching the filter
                    if (!isRestDay && filteredExercises.length === 0) return null;
                    
                    // Always show rest days regardless of filter
                    if (showFilter !== "all" && isRestDay) return null;
                    
                    return (
                      <div 
                        key={`day-${dayIndex}`} 
                        className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                      >
                        {/* Day header with day name and focus area */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="mb-2 md:mb-0">
                              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                {day.day}
                        </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Focus: {day.focus}
                              </p>
                        </div>
                            
                            {!isRestDay && (
                              <div className="flex items-center space-x-3">
                                {/* Day completion status */}
                                <div className="flex items-center">
                                  <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-2">
                                    <div 
                                      className="h-2 bg-green-500 rounded-full"
                                      style={{ 
                                        width: `${(day.exercises.filter(ex => exerciseProgress[ex.name]).length / day.exercises.length) * 100}%` 
                                      }}
                                    ></div>
                      </div>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {day.exercises.filter(ex => exerciseProgress[ex.name]).length}/{day.exercises.length}
                                  </span>
                                </div>
                                
                                {/* Complete all button */}
                        <button
                                  onClick={() => completeDayExercises(day.exercises)}
                                  className="text-sm px-3 py-1 rounded bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors focus:outline-none"
                        >
                                  <FaCheck className="inline-block mr-1" /> Complete All
                        </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* If it's a rest day, show rest day information */}
                        {isRestDay ? (
                          <div className="p-8 text-center">
                            <div className="inline-block p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4">
                              <FaHotTub className="text-blue-500 text-3xl" />
                            </div>
                            <h4 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
                              Rest Day
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                              Today is scheduled for recovery. Focus on good nutrition, hydration, 
                              and getting enough sleep. Light activities like walking or stretching 
                              are recommended.
                            </p>
                            
                            {day.notes && (
                              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-750 rounded-md inline-block">
                                <h5 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">
                                  Coach Notes:
                                </h5>
                                <p className="text-sm italic text-gray-600 dark:text-gray-400">
                                  {day.notes}
                                </p>
                              </div>
                            )}
                            
                            <div className="mt-6 flex justify-center space-x-4">
                        <button
                                className="px-4 py-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors focus:outline-none flex items-center"
                              >
                                <FaWalking className="mr-2" /> Log Recovery Activity
                        </button>
                              
                        <button
                                className="px-4 py-2 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors focus:outline-none flex items-center"
                        >
                                <FaDumbbell className="mr-2" /> View Stretching Routine
                        </button>
                            </div>
                          </div>
                        ) : (
                          /* Exercises for this day */
                          <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredExercises.map((exercise, exerciseIndex) => {
                              const isCardio = exercise.type === 'cardio' || 
                                              exercise.name.toLowerCase().includes('cardio') ||
                                              exercise.category === 'cardio';
                              
                              return (
                                <div 
                                  key={`exercise-${dayIndex}-${exerciseIndex}`}
                                  className={`p-4 transition-all ${
                            exerciseProgress[exercise.name]
                                      ? 'bg-green-50 dark:bg-green-900/10' 
                                      : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                                  }`}
                                >
                                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                    {/* Exercise info */}
                                    <div className="flex items-start mb-3 md:mb-0">
                                      {/* Checkbox for completion */}
                                      <div className="mr-3 pt-1">
                                        <input
                                          type="checkbox"
                                          id={`exercise-${dayIndex}-${exerciseIndex}`}
                                          checked={!!exerciseProgress[exercise.name]}
                                          onChange={() => toggleExerciseCompletion(exercise.name)}
                                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                    </div>

                                      {/* Exercise details */}
                                      <div>
                                        <div className="flex items-center">
                                          <h4 className="text-base font-medium text-gray-900 dark:text-white">
                                            {exerciseIndex + 1}. {exercise.name}
                                          </h4>
                                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                            {exercise.muscle}
                                          </span>
                                          {isCardio && (
                                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                              Cardio
                                            </span>
                                          )}
                                        </div>
                                        
                                        {/* Exercise parameters */}
                                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                          {isCardio ? (
                                            <>
                                              <span className="inline-flex items-center mr-3">
                                                <FaClock className="mr-1" />
                                                Duration: {exercise.duration || '20-30'} min
                        </span>
                                              <span className="inline-flex items-center">
                                                <FaTachometerAlt className="mr-1" />
                                                Intensity: {exercise.intensity || 'Moderate'}
                        </span>
                                            </>
                                          ) : (
                                            <>
                                              <span className="inline-flex items-center mr-3">
                                                <FaLayerGroup className="mr-1" />
                                                {exercise.sets} sets
                        </span>
                                              <span className="inline-flex items-center mr-3">
                                                <FaSyncAlt className="mr-1" />
                                                {exercise.reps} reps
                                              </span>
                                              <span className="inline-flex items-center">
                                                <FaHourglass className="mr-1" />
                                                {exercise.rest || '60-90'} sec rest
                                              </span>
                                            </>
                                          )}
                                        </div>
                                        
                                        {/* Exercise notes if any */}
                                        {exercise.notes && (
                                          <div className="mt-2 text-sm italic text-gray-600 dark:text-gray-400">
                                            Note: {exercise.notes}
                                          </div>
                                        )}
                      </div>
                    </div>

                                    {/* Exercise actions */}
                                    <div className="flex items-center space-x-2">
                                      {/* View demo button */}
                        <button
                                        onClick={() => openExerciseDemo(exercise)}
                                        className="text-sm px-3 py-1.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors focus:outline-none flex items-center"
                                      >
                                        <FaPlayCircle className="mr-1" /> Demo
                                      </button>
                                      
                                      {/* Track button - Opens tracking modal */}
                                      <button
                                        onClick={() => {
                                          setSelectedExercise(exercise);
                                          setIsTrackingModalOpen(true);
                                        }}
                                        className="text-sm px-3 py-1.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors focus:outline-none flex items-center"
                                      >
                                        <FaChartLine className="mr-1" /> Track
                        </button>
                      </div>
                                  </div>
                                  
                                  {/* Exercise Sets - Show only if exercise is in progress */}
                                  {exerciseSets[exercise.name] && exerciseSets[exercise.name].length > 0 && (
                                    <div className="mt-4 bg-gray-50 dark:bg-gray-750 p-3 rounded-md">
                                      <h5 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Tracked Sets</h5>
                                      
                                      <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                          <thead>
                                            <tr>
                                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Set</th>
                                              {!isCardio && (
                                                <>
                                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Weight</th>
                                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reps</th>
                                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                                                </>
                                              )}
                                              {isCardio && (
                                                <>
                                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Distance</th>
                                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pace</th>
                                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Heart Rate</th>
                                                </>
                                              )}
                                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"></th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {exerciseSets[exercise.name].map((set, setIndex) => (
                                              <tr key={setIndex}>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{setIndex + 1}</td>
                                                
                                                {!isCardio && (
                                                  <>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                      {set.weight} {weightUnit}
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                      {set.reps}
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                                                      {set.is_warmup ? (
                                                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                                                          Warm-up
                                                        </span>
                                                      ) : set.is_drop_set ? (
                                                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                                          Drop Set
                                                        </span>
                                                      ) : set.is_superset ? (
                                                        <span className="px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                                                          Superset
                                                        </span>
                                                      ) : set.is_amrap ? (
                                                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                                          AMRAP
                                                        </span>
                                                      ) : set.is_restpause ? (
                                                        <span className="px-2 py-1 rounded-full text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                                                          Rest-Pause
                                                        </span>
                                                      ) : set.is_pyramid ? (
                                                        <span className="px-2 py-1 rounded-full text-xs bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200">
                                                          Pyramid
                                                        </span>
                                                      ) : set.is_giant ? (
                                                        <span className="px-2 py-1 rounded-full text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                                                          Giant Set
                                                        </span>
                                                      ) : (
                                                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                          Normal
                                                        </span>
                                                      )}
                                                    </td>
                                                  </>
                                                )}
                                                
                                                {isCardio && (
                                                  <>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                      {set.duration} min
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                      {set.distance} km
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                      {calculatePace(set.duration, set.distance)} min/km
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                      {set.heartRate ? `${set.heartRate} bpm` : '-'}
                                                    </td>
                                                  </>
                                                )}
                                                
                                                <td className="px-3 py-2 whitespace-nowrap text-right text-sm">
                                                  <button
                                                    onClick={() => removeSet(exercise.name, setIndex)}
                                                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                                  >
                                                    <FaTrash size={14} />
                                                  </button>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                              </div>
                                      
                                      {/* Quick add set button */}
                                      <button
                                        onClick={() => {
                                          setSelectedExercise(exercise);
                                          setIsTrackingModalOpen(true);
                                        }}
                                        className="mt-3 text-xs px-3 py-1 rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors focus:outline-none flex items-center w-auto mx-auto"
                                      >
                                        <FaPlus className="mr-1" /> Add Set
                                      </button>
                              </div>
                        )}
                      </div>
                              );
                            })}
                    </div>
                        )}
                  </div>
                    );
                  })}
              </div>

              {isWeekComplete && (
                <div className="mt-6">
                  <button
                    onClick={completeWeek}
                    className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors flex items-center justify-center"
                  >
                    <FaCheckCircle className="mr-2" /> Complete Week{" "}
                    {programProgress.currentWeek}
                  </button>
                </div>
              )}
          </div>
        )}

            {/* Progress tab content */}
        {activeTab === "progress" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-medium mb-4 flex items-center">
              <FaChartLine className="mr-2 text-blue-500" /> Your Progress
            </h2>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">6-Week Program Completion</h3>
                <span className="text-blue-600 font-medium">
                  {Math.round(
                    (programProgress.completedWeeks.length / 6) * 100
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full"
                  style={{
                    width: `${
                      (programProgress.completedWeeks.length / 6) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Week Progress Blocks */}
              <div>
                <h3 className="font-medium mb-3">Weekly Progress</h3>
                <div className="space-y-3">
                  {Array.from({ length: 6 }, (_, i) => i + 1).map((week) => {
                    const status = getWeekStatus(week);

                    let statusColors = {
                      completed:
                        "bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700",
                      current:
                        "bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700",
                      skipped:
                        "bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700",
                      upcoming:
                        "bg-gray-100 border-gray-300 dark:bg-gray-700/30 dark:border-gray-600",
                    };

                    let statusIcons = {
                      completed: <FaCheckCircle className="text-green-500" />,
                      current: <FaPlay className="text-blue-500" />,
                      skipped: (
                        <FaExclamationTriangle className="text-yellow-500" />
                      ),
                      upcoming: <FaCalendarAlt className="text-gray-400" />,
                    };

                    return (
                      <div
                        key={`week-${week}`}
                        className={`border rounded-lg p-3 ${statusColors[status]}`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="mr-3">{statusIcons[status]}</div>
                            <div>
                              <div className="font-medium">Week {week}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {getProgramPhase(week)}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm capitalize font-medium">
                            {status}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Weights Tracking */}
              <div>
                <h3 className="font-medium mb-3">Weight Progress</h3>
                {Object.keys(exerciseWeights).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(exerciseWeights).map(
                      ([exercise, weightData]) => (
                        <div
                          key={exercise}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="font-medium">{exercise}</div>
                          </div>

                          {/* Show set-specific weights if they exist */}
                          <div className="space-y-1">
                            {Object.entries(weightData)
                              .filter(([key]) => key.startsWith("set"))
                              .sort((a, b) => {
                                // Extract set numbers and sort numerically
                                const setA = parseInt(a[0].replace("set", ""));
                                const setB = parseInt(b[0].replace("set", ""));
                                return setA - setB;
                              })
                              .map(([key, weight]) => (
                                <div
                                  key={`${exercise}-${key}`}
                                  className="flex justify-between text-sm"
                                >
                                  <span>Set {key.replace("set", "")}</span>
                                  <span className="text-blue-600 font-medium">
                                    {weight} {weightUnit}
                                  </span>
                                </div>
                              ))}

                            {/* Show general weight if no set-specific weights or as a fallback */}
                            {!Object.keys(weightData).some((k) =>
                              k.startsWith("set")
                            ) &&
                              weightData.general && (
                                <div className="flex justify-between text-sm">
                                  <span>General</span>
                                  <span className="text-blue-600 font-medium">
                                    {weightData.general} {weightUnit}
                                  </span>
                                </div>
                              )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <FaDumbbell className="mx-auto text-2xl mb-2" />
                    <p>No weights logged yet</p>
                    <p className="text-sm mt-1">
                      Add weights as you complete exercises
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

            {/* History tab content */}
        {activeTab === "history" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-medium mb-4 flex items-center">
              <FaHistory className="mr-2 text-blue-500" /> Workout History
            </h2>

            {programProgress.completedWeeks.length > 0 ? (
              <div className="space-y-4">
                {programProgress.completedWeeks
                  .sort((a, b) => b - a)
                  .map((week) => {
                    const weekWorkout = workout.sixWeekProgram.find(
                      (w) => w.week === week
                    );
                    if (!weekWorkout) return null;

                    return (
                      <div
                        key={`history-week-${week}`}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-medium text-lg">
                            Week {week}: {getProgramPhase(week)}
                          </h3>
                          <div className="flex items-center text-green-600">
                            <FaCheckCircle className="mr-1" /> Completed
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {weekWorkout.exercises.length} exercises completed
                        </div>

                        <button
                          onClick={() => {
                            // Show details of the week
                            setProgramProgress({
                              ...programProgress,
                              currentWeek: week,
                            });
                            setCurrentWeekWorkout(weekWorkout);
                            setActiveTab("workout");
                          }}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View Details
                        </button>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <FaCalendarAlt className="mx-auto text-3xl mb-3" />
                <p className="font-medium">No completed workouts yet</p>
                <p className="text-sm mt-1">
                  Your workout history will appear here after you complete a
                  week
                </p>
              </div>
            )}
          </div>
        )}
          </>
        )}
        
        {/* Render tracking modal */}
        {renderTrackingModal()}

        {/* Program Complete Modal */}
        {showProgramCompleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                  <FaTrophy className="h-8 w-8 text-green-600 dark:text-green-300" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  You've successfully completed the entire 6-week workout program! 
                  Your dedication and hard work have paid off.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <p className="text-blue-700 dark:text-blue-300 font-medium">
                    Would you like to generate a new program to continue your fitness journey?
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setShowProgramCompleteModal(false);
                      navigate('/ai-workout-generator');
                    }}
                    className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center"
                  >
                    <FaPlus className="mr-2" /> New Program
                  </button>
                  
                  <button
                    onClick={() => setShowProgramCompleteModal(false)}
                    className="py-3 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Continue Current
                  </button>
                </div>
                
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowProgramCompleteModal(false);
                      navigate('/saved-programs');
                    }}
                    className="w-full py-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-center transition-colors"
                  >
                    View All Programs
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Week Complete Modal */}
        {showWeekCompleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                  <FaCheckCircle className="h-8 w-8 text-green-600 dark:text-green-300" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Week {lastCompletedWeek} Complete!</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Great job completing Week {lastCompletedWeek} of your workout program!
                </p>
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => {
                    setShowWeekCompleteModal(false);
                    setActiveTab("dashboard");
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-flex items-center justify-center"
                >
                  Continue to Week {Math.min(lastCompletedWeek + 1, 6)}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgramTracker;
