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
} from "react-icons/fa";

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
  const [savedProgramId, setSavedProgramId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const saveExerciseWeight = (exerciseName, weight) => {
    const newWeights = {
      ...exerciseWeights,
      [exerciseName]: weight,
    };

    // Save to local state
    setExerciseWeights(newWeights);

    // Close weight editing
    setEditingWeight(null);
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
    } catch (error) {
      console.error("Error updating program progress:", error);
      alert("Failed to update program progress. Please try again.");
    }
  };

  const completeWeek = () => {
    if (!programProgress) return;

    const updatedProgress = {
      ...programProgress,
      completedWeeks: [
        ...programProgress.completedWeeks,
        programProgress.currentWeek,
      ],
      currentWeek: Math.min(programProgress.currentWeek + 1, 6),
    };

    updateProgramProgress(updatedProgress);

    // Reset exercise progress
    setExerciseProgress({});
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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link
            to="/saved-programs"
            className="mr-4 text-blue-500 hover:text-blue-600"
          >
            <FaArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">
            {workout.title} - Week {programProgress.currentWeek}
          </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Program Overview */}
          <div className="md:col-span-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-medium mb-4 flex items-center">
              <FaCalendarAlt className="mr-2 text-blue-500" /> Program Progress
            </h2>
            <div className="space-y-3">
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
              <div className="mt-4">
                <h3 className="font-medium mb-2">Week Focus</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {programProgress.currentWeek <= 2
                    ? "Form & Adaptation"
                    : programProgress.currentWeek <= 4
                    ? "Progressive Overload"
                    : "Peak Intensity"}
                </p>
              </div>
            </div>
          </div>

          {/* Workout Details */}
          <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-medium mb-4 flex items-center">
              <FaClipboardList className="mr-2 text-blue-500" /> Workout
              Exercises
            </h2>
            <div className="space-y-4">
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
                        onClick={() => setShowExerciseDetails(exercise)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Details
                      </button>
                      <button
                        onClick={() =>
                          updateExerciseProgress(exercise.name, true)
                        }
                        className={`p-2 rounded-full ${
                          exerciseProgress[exercise.name]
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                        }`}
                      >
                        <FaCheckCircle />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-2">
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
                    <div
                      className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-center relative"
                      onClick={() => setEditingWeight(exercise.name)}
                    >
                      <span className="text-xs block text-gray-500 dark:text-gray-400">
                        Weight
                      </span>
                      <div className="flex items-center justify-center">
                        <span className="font-medium mr-1">
                          {exerciseWeights?.[exercise.name] || "-"} kg
                        </span>
                        <FaEdit className="text-gray-500 dark:text-gray-400" />
                      </div>
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

        {/* Weight Input Modal */}
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
                  placeholder="Weight in kg"
                  defaultValue={exerciseWeights?.[editingWeight] || ""}
                  id="weightInput"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                />
                <span className="ml-2 text-gray-500 dark:text-gray-400">
                  kg
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
                      saveExerciseWeight(editingWeight, weight);
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
                <div className="grid grid-cols-4 gap-2 mb-4">
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
                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-center">
                  <span className="text-xs block text-gray-500 dark:text-gray-400">
                    Weight
                  </span>
                  <span className="font-medium">
                    {exerciseWeights?.[showExerciseDetails.name] || "-"} kg
                  </span>
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                <h4 className="font-medium mb-2">Performance Notes</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Focus on maintaining proper form. Aim to progressively
                  increase weight or resistance each week. If you cannot
                  complete all sets with good form, reduce the weight.
                </p>
              </div>

              <button
                onClick={() => setShowExerciseDetails(null)}
                className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgramTracker;
