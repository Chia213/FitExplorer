import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { updateSavedProgram, getSavedPrograms } from "../api/savedProgramsApi";
import {
  FaCheckCircle,
  FaCalendarAlt,
  FaClipboardList,
  FaArrowLeft,
  FaEdit,
  FaSpinner,
  FaTrophy,
  FaDumbbell,
  FaChartLine,
  FaHistory,
  FaInfoCircle,
  FaStar,
  FaStopwatch,
  FaClock,
  FaExclamationTriangle,
  FaPlay,
  FaVideo,
  FaCheckSquare,
  FaExchangeAlt,
  FaMagic,
  FaClipboard,
} from "react-icons/fa";

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
  const [activeTab, setActiveTab] = useState("workout"); // workout, progress, history
  const [showWeekCompleteModal, setShowWeekCompleteModal] = useState(false);
  const [showProgramCompleteModal, setShowProgramCompleteModal] =
    useState(false);
  const [lastCompletedWeek, setLastCompletedWeek] = useState(null);
  const [showExerciseNotesModal, setShowExerciseNotesModal] = useState(null);
  const [weightUnit, setWeightUnit] = useState("kg"); // kg or lbs
  const [editingSetWeight, setEditingSetWeight] = useState(null); // { exerciseName, setIndex }
  const [showExerciseDemo, setShowExerciseDemo] = useState(null);

  useEffect(() => {
    const initializeTracker = async () => {
      try {
        // Log the entire location state for debugging
        console.log("Location state:", location.state);

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

        // Validate required data
        if (!workoutData || !progressData) {
          throw new Error("Incomplete workout or progress information");
        }

        // Ensure sixWeekProgram exists and is an array
        if (
          !workoutData.sixWeekProgram ||
          !Array.isArray(workoutData.sixWeekProgram)
        ) {
          throw new Error("Invalid workout program structure");
        }

        // Set initial states
        setWorkout(workoutData);
        setProgramProgress(progressData);

        // Find the current week's workout
        const weekWorkout = workoutData.sixWeekProgram.find(
          (weekPlan) => weekPlan.week === progressData.currentWeek
        );

        if (!weekWorkout) {
          throw new Error(
            `Could not find workout for week ${progressData.currentWeek}`
          );
        }

        setCurrentWeekWorkout(weekWorkout);

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
            } catch (error) {
              console.error("Failed to parse saved weights:", error);
            }
          }

          // Load saved weight unit preference if it exists
          if (matchingProgram.weight_unit) {
            setWeightUnit(matchingProgram.weight_unit);
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

        setIsLoading(false);
      } catch (error) {
        console.error("Initialization error:", error);
        setError(error.message);
        setIsLoading(false);
        navigate("/saved-programs");
      }
    };

    initializeTracker();
  }, [location.state, navigate]);

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
    currentWeekWorkout.exercises.forEach((exercise) => {
      allExercisesComplete[exercise.name] = true;
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
      const token = localStorage.getItem("token");

      if (savedProgramId) {
        await updateSavedProgram(
          savedProgramId,
          {
            program_data: workout,
            current_week: newProgress.currentWeek,
            completed_weeks: newProgress.completedWeeks,
          },
          token
        );
      }

      // Update local state
      setProgramProgress(newProgress);

      // If we're moving to a new week, update current week workout
      if (newProgress.currentWeek !== programProgress.currentWeek) {
        const nextWeekWorkout = workout.sixWeekProgram.find(
          (weekPlan) => weekPlan.week === newProgress.currentWeek
        );
        if (nextWeekWorkout) {
          setCurrentWeekWorkout(nextWeekWorkout);

          // Reset exercise progress for the new week
          setExerciseProgress({});
        }
      }
    } catch (error) {
      console.error("Error updating program progress:", error);
      alert("Failed to update program progress. Please try again.");
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
    } else {
      // Regular week completion
      setShowWeekCompleteModal(true);
    }
  };

  const updateExerciseProgress = (exerciseName, completed) => {
    const newProgress = {
      ...exerciseProgress,
      [exerciseName]: completed,
    };
    setExerciseProgress(newProgress);
  };

  const isWeekComplete = currentWeekWorkout?.exercises.every(
    (exercise) => exerciseProgress[exercise.name]
  );

  const getProgramPhase = (week) => {
    if (week <= 2) return "Form & Adaptation";
    if (week <= 4) return "Progressive Overload";
    return "Peak Intensity";
  };

  const getWeekStatus = (weekNumber) => {
    if (programProgress.completedWeeks.includes(weekNumber)) {
      return "completed";
    }
    if (weekNumber === programProgress.currentWeek) {
      return "current";
    }
    if (weekNumber < programProgress.currentWeek) {
      return "skipped";
    }
    return "upcoming";
  };

  const getExerciseDemo = (exerciseName) => {
    return exerciseDemos[exerciseName] || defaultExerciseDescription;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading workout tracker...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">
            Error Loading Workout
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate("/saved-programs")}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Back to Saved Programs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 bg-white dark:bg-gray-900">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <Link
              to="/saved-programs"
              className="mr-4 text-blue-500 hover:text-blue-600"
            >
              <FaArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold">{workout.title}</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full flex items-center">
              <FaCalendarAlt className="mr-1" size={14} />
              Week {programProgress.currentWeek}/6
            </div>

            <div className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-3 py-1 rounded-full flex items-center">
              <FaClock className="mr-1" size={14} />
              {workout.duration} min
            </div>

            {/* Weight Unit Toggle Button */}
            <button
              onClick={toggleWeightUnit}
              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded-full flex items-center"
              title={`Switch to ${weightUnit === "kg" ? "lbs" : "kg"}`}
            >
              <FaExchangeAlt className="mr-1" size={14} />
              {weightUnit.toUpperCase()}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            className={`py-3 px-4 font-medium flex items-center ${
              activeTab === "workout"
                ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("workout")}
          >
            <FaDumbbell className="mr-2" /> Workout
          </button>
          <button
            className={`py-3 px-4 font-medium flex items-center ${
              activeTab === "progress"
                ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("progress")}
          >
            <FaChartLine className="mr-2" /> Progress
          </button>
          <button
            className={`py-3 px-4 font-medium flex items-center ${
              activeTab === "history"
                ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("history")}
          >
            <FaHistory className="mr-2" /> History
          </button>
        </div>

        {/* Workout Tab Content */}
        {activeTab === "workout" && (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Program Overview */}
            <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h2 className="text-xl font-medium mb-4 flex items-center">
                <FaCalendarAlt className="mr-2 text-blue-500" /> Week{" "}
                {programProgress.currentWeek} Overview
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Current Week:</span>
                  <span className="font-bold">
                    {programProgress.currentWeek}/6
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Completed Weeks:</span>
                  <span className="font-bold">
                    {programProgress.completedWeeks.length}
                  </span>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{
                      width: `${
                        (programProgress.completedWeeks.length / 6) * 100
                      }%`,
                    }}
                  ></div>
                </div>

                <div className="mt-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <FaTrophy className="mr-2 text-yellow-500" /> Week Focus
                  </h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <span className="font-medium text-blue-800 dark:text-blue-200">
                      {getProgramPhase(programProgress.currentWeek)}
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {programProgress.currentWeek <= 2
                        ? "Focus on learning proper technique and allowing your body to adapt to the new stimulus."
                        : programProgress.currentWeek <= 4
                        ? "Start increasing weights gradually while maintaining good form."
                        : "Push for personal records while still maintaining proper form."}
                    </p>
                  </div>
                </div>

                {/* Complete All Exercises Button */}
                <button
                  onClick={completeAllExercises}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  <FaCheckSquare className="mr-2" /> Complete All Exercises
                </button>

                {isWeekComplete && (
                  <div className="mt-2">
                    <button
                      onClick={completeWeek}
                      className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center"
                    >
                      <FaCheckCircle className="mr-2" /> Complete Week{" "}
                      {programProgress.currentWeek}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Workout Details */}
            <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-medium mb-4 flex items-center">
                <FaClipboardList className="mr-2 text-blue-500" /> Week{" "}
                {programProgress.currentWeek} Exercises
              </h2>
              <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
                {currentWeekWorkout.exercises.map((exercise, index) => (
                  <div
                    key={exercise.name}
                    className={`border rounded-lg p-4 transition-all ${
                      exerciseProgress[exercise.name]
                        ? "border-green-300 bg-green-50 dark:bg-green-900/20"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-lg">
                          {index + 1}. {exercise.name}
                        </h3>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {exercise.muscle}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowExerciseDemo(exercise.name)}
                          className="text-blue-500 hover:text-blue-700 p-2"
                          title="View demonstration"
                        >
                          <FaVideo />
                        </button>
                        <button
                          onClick={() =>
                            setShowExerciseNotesModal(exercise.name)
                          }
                          className="text-gray-500 hover:text-gray-700 p-2"
                          title="Add notes"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => setShowExerciseDetails(exercise)}
                          className="text-blue-500 hover:text-blue-700 p-2"
                          title="View details"
                        >
                          <FaInfoCircle />
                        </button>
                        <button
                          onClick={() =>
                            updateExerciseProgress(
                              exercise.name,
                              !exerciseProgress[exercise.name]
                            )
                          }
                          className={`p-2 rounded-full ${
                            exerciseProgress[exercise.name]
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                          }`}
                          title={
                            exerciseProgress[exercise.name]
                              ? "Mark as incomplete"
                              : "Mark as complete"
                          }
                        >
                          <FaCheckCircle />
                        </button>
                      </div>
                    </div>

                    {/* Exercise Notes (if any) */}
                    {exerciseNotes[exercise.name] && (
                      <div className="mt-2 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg text-sm">
                        <div className="font-medium text-yellow-800 dark:text-yellow-200">
                          Notes:
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          {exerciseNotes[exercise.name]}
                        </p>
                      </div>
                    )}

                    {/* Basic Exercise Info */}
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-center">
                        <span className="text-xs block text-gray-500 dark:text-gray-400">
                          Sets
                        </span>
                        <span className="font-medium">{exercise.sets}</span>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-center">
                        <span className="text-xs block text-gray-500 dark:text-gray-400">
                          Reps
                        </span>
                        <span className="font-medium">{exercise.reps}</span>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-center">
                        <span className="text-xs block text-gray-500 dark:text-gray-400">
                          Rest
                        </span>
                        <span className="font-medium">{exercise.rest}s</span>
                      </div>
                    </div>

                    {/* Set by Set Tracking */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-sm">Set Tracking</h4>
                        <button
                          onClick={() => completeAllSets(exercise.name)}
                          className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
                        >
                          Complete All Sets
                        </button>
                      </div>
                      <div className="space-y-2">
                        {Array.from({ length: exercise.sets }, (_, i) => i).map(
                          (setIndex) => (
                            <div
                              key={`${exercise.name}-set-${setIndex}`}
                              className="flex items-center"
                            >
                              <div className="w-16 text-sm">
                                Set {setIndex + 1}
                              </div>
                              <div
                                className="flex-1 ml-2 bg-gray-100 dark:bg-gray-700 p-2 rounded cursor-pointer text-center"
                                onClick={() =>
                                  setEditingSetWeight({
                                    exerciseName: exercise.name,
                                    setIndex,
                                  })
                                }
                              >
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  Weight:{" "}
                                  {getWeightDisplay(exercise.name, setIndex)}
                                </span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {isWeekComplete && (
                <div className="mt-6">
                  <button
                    onClick={completeWeek}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center"
                  >
                    <FaCheckCircle className="mr-2" /> Complete Week{" "}
                    {programProgress.currentWeek}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress Tab Content */}
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

        {/* History Tab Content */}
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

        {/* Set Weight Modal */}
        {editingSetWeight && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setEditingSetWeight(null);
              }
            }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-xl font-bold mb-4">
                Set Weight for {editingSetWeight.exerciseName} - Set{" "}
                {editingSetWeight.setIndex + 1}
              </h3>
              <div className="flex items-center mb-4">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder={`Weight in ${weightUnit}`}
                  defaultValue={
                    (exerciseWeights[editingSetWeight.exerciseName] &&
                      exerciseWeights[editingSetWeight.exerciseName][
                        `set${editingSetWeight.setIndex}`
                      ]) ||
                    ""
                  }
                  id="weightInput"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                />
                <span className="ml-2 text-gray-500 dark:text-gray-400">
                  {weightUnit}
                </span>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    const weightInput = document.getElementById("weightInput");
                    const weight = weightInput
                      ? parseFloat(weightInput.value)
                      : null;
                    if (weight !== null && !isNaN(weight)) {
                      saveExerciseWeight(
                        editingSetWeight.exerciseName,
                        editingSetWeight.setIndex,
                        weight
                      );
                    }
                  }}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingSetWeight(null)}
                  className="flex-1 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Original Weight Modal - kept for backward compatibility */}
        {editingWeight && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setEditingWeight(null);
              }
            }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-xl font-bold mb-4">
                Enter Weight for {editingWeight}
              </h3>
              <div className="flex items-center mb-4">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder={`Weight in ${weightUnit}`}
                  defaultValue={
                    (exerciseWeights[editingWeight] &&
                      exerciseWeights[editingWeight].general) ||
                    ""
                  }
                  id="weightInput"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                />
                <span className="ml-2 text-gray-500 dark:text-gray-400">
                  {weightUnit}
                </span>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    const weightInput = document.getElementById("weightInput");
                    const weight = weightInput
                      ? parseFloat(weightInput.value)
                      : null;
                    if (weight !== null && !isNaN(weight)) {
                      saveExerciseWeight(editingWeight, null, weight);
                    }
                  }}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingWeight(null)}
                  className="flex-1 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Exercise Notes Modal */}
        {showExerciseNotesModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowExerciseNotesModal(null);
              }
            }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">
                Notes for {showExerciseNotesModal}
              </h3>
              <div className="mb-4">
                <textarea
                  id="exerciseNoteInput"
                  placeholder="Add your notes about this exercise (form tips, personal records, etc.)"
                  defaultValue={exerciseNotes?.[showExerciseNotesModal] || ""}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white h-32"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    const noteInput =
                      document.getElementById("exerciseNoteInput");
                    if (noteInput) {
                      saveExerciseNote(showExerciseNotesModal, noteInput.value);
                    }
                  }}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowExerciseNotesModal(null)}
                  className="flex-1 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Exercise Demo Modal */}
        {showExerciseDemo && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowExerciseDemo(null);
              }
            }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  {showExerciseDemo} Demonstration
                </h3>
                <button
                  onClick={() => setShowExerciseDemo(null)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <div className="mb-6">
                {/* This would be an actual GIF or video in production */}
                <div className="bg-gray-200 dark:bg-gray-700 h-64 md:h-80 flex items-center justify-center rounded-lg mb-4">
                  <div className="text-center">
                    <FaVideo className="text-4xl mx-auto text-gray-500 mb-2" />
                    <p className="text-gray-500">
                      Exercise demonstration would appear here
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      ({getExerciseDemo(showExerciseDemo).gifUrl})
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-lg mb-2">How to perform</h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {getExerciseDemo(showExerciseDemo).description}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-lg mb-2">
                    Tips for good form
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                    {getExerciseDemo(showExerciseDemo).tips.map(
                      (tip, index) => (
                        <li key={index}>{tip}</li>
                      )
                    )}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setShowExerciseDemo(null)}
                className="mt-6 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Exercise Details Modal */}
        {showExerciseDetails && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowExerciseDetails(null);
              }
            }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  {showExerciseDetails.name}
                </h3>
                <button
                  onClick={() => setShowExerciseDetails(null)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <div className="mb-4">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-center">
                    <span className="text-xs block text-gray-500 dark:text-gray-400">
                      Sets
                    </span>
                    <span className="font-medium">
                      {showExerciseDetails.sets}
                    </span>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-center">
                    <span className="text-xs block text-gray-500 dark:text-gray-400">
                      Reps
                    </span>
                    <span className="font-medium">
                      {showExerciseDetails.reps}
                    </span>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-center">
                    <span className="text-xs block text-gray-500 dark:text-gray-400">
                      Rest
                    </span>
                    <span className="font-medium">
                      {showExerciseDetails.rest}s
                    </span>
                  </div>
                </div>

                {/* Set-specific weights */}
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded mb-4">
                  <h4 className="font-medium mb-2">Weights</h4>
                  {exerciseWeights[showExerciseDetails.name] ? (
                    <div className="space-y-1">
                      {Object.entries(exerciseWeights[showExerciseDetails.name])
                        .filter(([key]) => key.startsWith("set"))
                        .sort((a, b) => {
                          const setA = parseInt(a[0].replace("set", ""));
                          const setB = parseInt(b[0].replace("set", ""));
                          return setA - setB;
                        })
                        .map(([key, weight]) => (
                          <div
                            key={key}
                            className="flex justify-between text-sm"
                          >
                            <span>Set {key.replace("set", "")}</span>
                            <span className="font-medium">
                              {weight} {weightUnit}
                            </span>
                          </div>
                        ))}

                      {/* Show general weight if available */}
                      {exerciseWeights[showExerciseDetails.name].general && (
                        <div className="flex justify-between text-sm">
                          <span>General</span>
                          <span className="font-medium">
                            {exerciseWeights[showExerciseDetails.name].general}{" "}
                            {weightUnit}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No weights recorded yet
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                  <h4 className="font-medium mb-2">Muscle Group</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {showExerciseDetails.muscle}
                  </p>
                </div>

                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                  <h4 className="font-medium mb-2">Performance Notes</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Focus on maintaining proper form. Aim to progressively
                    increase weight or resistance each week. If you cannot
                    complete all sets with good form, reduce the weight.
                  </p>
                </div>

                {exerciseNotes[showExerciseDetails.name] && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
                    <h4 className="font-medium mb-2">Your Notes</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {exerciseNotes[showExerciseDetails.name]}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    setShowExerciseDetails(null);
                    setShowExerciseDemo(showExerciseDetails.name);
                  }}
                  className="py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  <FaVideo className="mr-2" /> Demo
                </button>
                <button
                  onClick={() => {
                    setShowExerciseDetails(null);
                    setEditingSetWeight({
                      exerciseName: showExerciseDetails.name,
                      setIndex: 0,
                    });
                  }}
                  className="py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  <FaEdit className="mr-2" /> Weights
                </button>
                <button
                  onClick={() => {
                    setShowExerciseDetails(null);
                    setShowExerciseNotesModal(showExerciseDetails.name);
                  }}
                  className="py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  <FaEdit className="mr-2" /> Notes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Week Complete Modal */}
        {showWeekCompleteModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowWeekCompleteModal(false);
              }
            }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full text-center">
              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-full">
                <FaTrophy className="text-4xl text-yellow-500" />
              </div>

              <h3 className="text-2xl font-bold mb-2">
                Week {lastCompletedWeek} Complete!
              </h3>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Congratulations on completing week {lastCompletedWeek} of your
                program!
                {programProgress.currentWeek <= 6
                  ? ` You're now ready to start week ${programProgress.currentWeek}.`
                  : " You've completed the entire 6-week program!"}
              </p>

              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="flex items-center space-x-1">
                  <FaStar className="text-yellow-500" />
                  <FaStar className="text-yellow-500" />
                  <FaStar className="text-yellow-500" />
                  <FaStar className="text-yellow-500" />
                  <FaStar className="text-yellow-500" />
                </div>
              </div>

              <button
                onClick={() => setShowWeekCompleteModal(false)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Continue to Week {programProgress.currentWeek}
              </button>
            </div>
          </div>
        )}

        {/* Program Complete Modal with Options */}
        {showProgramCompleteModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                // Don't auto-close this modal on click - user needs to choose an option
              }
            }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full text-center">
              <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-full">
                <FaTrophy className="text-5xl text-yellow-500" />
              </div>

              <h3 className="text-2xl font-bold mb-2">Program Complete!</h3>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Congratulations! You've successfully completed the entire 6-week
                program. What would you like to do next?
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    // Navigate to workout generator
                    navigate("/");
                  }}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  <FaMagic className="mr-2" /> Generate a New Program
                </button>

                <button
                  onClick={() => {
                    // Navigate to workout log
                    navigate("/workout-log");
                  }}
                  className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  <FaClipboard className="mr-2" /> Do your own Workouts and
                  Create your own Routines
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
