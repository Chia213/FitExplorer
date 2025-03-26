import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaTrash,
  FaPrint,
  FaEye,
  FaArrowLeft,
  FaClock,
  FaFire,
  FaDumbbell,
} from "react-icons/fa";

function SavedWorkouts() {
  const [savedWorkouts, setSavedWorkouts] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setIsAuthenticated(true);

    // Load saved workouts from localStorage
    try {
      const workouts = JSON.parse(
        localStorage.getItem("savedWorkouts") || "[]"
      );
      setSavedWorkouts(workouts);
    } catch (error) {
      console.error("Error loading saved workouts:", error);
    }
  }, [navigate]);

  const deleteAllWorkouts = () => {
    if (
      confirm(
        "Are you sure you want to delete ALL saved workout programs? This cannot be undone."
      )
    ) {
      // Clear the workouts from state
      setSavedWorkouts([]);
      // Clear the workouts from localStorage
      localStorage.setItem("savedWorkouts", "[]");
      // Clear the selected workout
      setSelectedWorkout(null);
    }
  };

  const deleteWorkout = (id) => {
    const updatedWorkouts = savedWorkouts.filter(
      (workout) => workout.id !== id
    );
    setSavedWorkouts(updatedWorkouts);
    localStorage.setItem("savedWorkouts", JSON.stringify(updatedWorkouts));

    // If currently viewing the deleted workout, clear it
    if (selectedWorkout && selectedWorkout.id === id) {
      setSelectedWorkout(null);
    }
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <Link to="/" className="mr-4 text-blue-500 hover:text-blue-600">
            <FaArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">
            My Saved Workout Programs
          </h1>
        </div>

        {savedWorkouts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-medium mb-4">No saved workouts yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Generate a workout and save it to see it here
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Create a new program
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-1/3">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
                <h2 className="text-xl font-medium">Your Programs</h2>
                {savedWorkouts.length > 0 && (
                  <button
                    onClick={deleteAllWorkouts}
                    className="text-red-500 hover:text-red-700 text-sm flex items-center"
                  >
                    <FaTrash className="mr-1" size={14} /> Delete All
                  </button>
                )}
                <div className="space-y-3">
                  {savedWorkouts.map((workout) => (
                    <div
                      key={workout.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        selectedWorkout && selectedWorkout.id === workout.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                      }`}
                      onClick={() => setSelectedWorkout(workout)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{workout.title}</h3>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                            <FaClock className="mr-1" size={12} />{" "}
                            {workout.duration} min
                            <span className="mx-2">•</span>
                            <FaDumbbell className="mr-1" size={12} />{" "}
                            {workout.workoutsPerWeek}x/week
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              confirm(
                                "Are you sure you want to delete this workout?"
                              )
                            ) {
                              deleteWorkout(workout.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {workout.targetMuscles &&
                          workout.targetMuscles.slice(0, 3).map((muscle) => (
                            <span
                              key={muscle}
                              className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded-full"
                            >
                              {muscle}
                            </span>
                          ))}
                        {workout.targetMuscles &&
                          workout.targetMuscles.length > 3 && (
                            <span className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-2 py-0.5 rounded-full">
                              +{workout.targetMuscles.length - 3} more
                            </span>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full lg:w-2/3">
              {selectedWorkout ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl md:text-2xl font-bold">
                      {selectedWorkout.title}
                    </h2>
                    <div className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                      ~{selectedWorkout.duration} min
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {selectedWorkout.gender && (
                      <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Gender
                        </div>
                        <div className="font-medium">
                          {selectedWorkout.gender}
                        </div>
                      </div>
                    )}
                    {selectedWorkout.age && (
                      <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Age
                        </div>
                        <div className="font-medium">
                          {selectedWorkout.age} years
                        </div>
                      </div>
                    )}
                    <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-center">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Goal
                      </div>
                      <div className="font-medium">
                        {selectedWorkout.fitnessGoal || "Custom"}
                      </div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-center">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Level
                      </div>
                      <div className="font-medium capitalize">
                        {selectedWorkout.difficulty}
                      </div>
                    </div>
                  </div>

                  {/* Training Schedule Section */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">
                      Weekly Training Schedule
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {selectedWorkout.trainingSchedule &&
                        Object.entries(selectedWorkout.trainingSchedule).map(
                          ([day, muscles]) => (
                            <div
                              key={day}
                              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                            >
                              <h4 className="font-medium text-lg mb-2">
                                {day}
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {muscles.map((muscle) => (
                                  <div
                                    key={muscle}
                                    className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full"
                                  >
                                    {muscle}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <h3 className="text-lg font-medium mb-2">Main Workout</h3>
                    {selectedWorkout.exercises.map((exercise, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-shadow hover:shadow-md"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-lg">
                            {index + 1}. {exercise.name}
                          </h4>
                          <div className="text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                            {exercise.muscle}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                          <div className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
                            <span className="font-bold">Sets:</span>{" "}
                            {exercise.sets}
                          </div>
                          <div className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
                            <span className="font-bold">Reps:</span>{" "}
                            {exercise.reps}
                          </div>
                          <div className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
                            <span className="font-bold">Rest:</span>{" "}
                            {exercise.rest}s
                          </div>
                          <div className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
                            <span className="font-bold">Tempo:</span>{" "}
                            {exercise.tempo}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => window.print()}
                      className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center"
                    >
                      <FaPrint className="mr-2" /> Print Workout
                    </button>
                    <button
                      onClick={() => setSelectedWorkout(null)}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center"
                    >
                      <FaEye className="mr-2" /> View Another Workout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                  <h2 className="text-xl font-medium mb-4">
                    Select a workout to view
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Click on a workout from the list to view its details
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SavedWorkouts;
