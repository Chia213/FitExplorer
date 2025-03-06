import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaWeight,
  FaClock,
  FaChevronDown,
  FaChevronUp,
  FaArrowLeft,
  FaSave,
} from "react-icons/fa";

const API_BASE_URL = "http://localhost:8000";

const getIntensityName = (intensityValue) => {
  const intensityMap = {
    0: "",
    1: "Low",
    2: "Medium",
    3: "High",
    4: "Very High",
  };
  return intensityMap[intensityValue] || "";
};

const saveRoutineToAPI = async (routineData, token) => {
  if (!routineData || !routineData.name || !routineData.exercises) {
    throw new Error("Invalid routine data");
  }

  if (!token) {
    throw new Error("Authentication token is required");
  }

  const cleanedExercises = routineData.exercises
    .filter((exercise) => exercise && exercise.name)
    .map((exercise) => ({
      name: exercise.name,
      category: exercise.category || "Uncategorized",
      is_cardio: Boolean(exercise.is_cardio),
      initial_sets: Number(exercise.initial_sets || 1),
    }));

  if (cleanedExercises.length === 0) {
    throw new Error("Routine must contain at least one exercise");
  }

  const routinePayload = {
    name: routineData.name.trim(),
    exercises: cleanedExercises,
  };

  console.log("Saving routine:", JSON.stringify(routinePayload, null, 2));

  const response = await fetch(`${API_BASE_URL}/routines`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(routinePayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Server response:", errorText);

    try {
      const errorJson = JSON.parse(errorText);
      console.error("Detailed error:", errorJson);
    } catch (e) {}

    throw new Error(`Server error: ${response.status}`);
  }

  return await response.json();
};

function WorkoutHistory() {
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedWorkouts, setExpandedWorkouts] = useState({});
  const [filterDate, setFilterDate] = useState("");
  const [filterExercise, setFilterExercise] = useState("");
  const [showSaveRoutineModal, setShowSaveRoutineModal] = useState(false);
  const [routineName, setRoutineName] = useState("");
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [savingRoutine, setSavingRoutine] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchWorkoutHistory(token);
  }, [navigate]);

  async function fetchWorkoutHistory(token) {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/workouts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch workouts");

      const data = await response.json();
      console.log("Fetched workout data:", data);

      const processedWorkouts = data.map((workout) => {
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
            exercise.isCardio !== undefined &&
            exercise.is_cardio === undefined
          ) {
            exercise.is_cardio = exercise.isCardio;
            delete exercise.isCardio;
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

  const handleSaveAsRoutine = (workout) => {
    if (!workout || !workout.exercises || workout.exercises.length === 0) {
      alert("Cannot save a workout without exercises as a routine.");
      return;
    }

    setSelectedWorkout(workout);
    setRoutineName(workout.name || "");
    setShowSaveRoutineModal(true);
  };

  const handleSaveRoutine = async () => {
    if (!routineName.trim()) {
      alert("Please enter a routine name.");
      return;
    }

    if (
      !selectedWorkout ||
      !selectedWorkout.exercises ||
      selectedWorkout.exercises.length === 0
    ) {
      alert("Cannot save an empty workout as a routine.");
      return;
    }

    setSavingRoutine(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to be logged in to save routines.");
        navigate("/login");
        return;
      }

      const routineExercises = selectedWorkout.exercises
        .filter((exercise) => exercise && exercise.name)
        .map((exercise) => ({
          name: exercise.name,
          category: exercise.category || "Uncategorized",
          is_cardio: Boolean(exercise.is_cardio),
          initial_sets:
            exercise.sets && Array.isArray(exercise.sets)
              ? exercise.sets.length
              : 1,
        }));

      if (routineExercises.length === 0) {
        throw new Error("No valid exercises found in this workout");
      }

      const routineData = {
        name: routineName,
        exercises: routineExercises,
      };

      const savedRoutine = await saveRoutineToAPI(routineData, token);
      console.log("Routine saved successfully:", savedRoutine);

      alert("Routine saved successfully!");
      setShowSaveRoutineModal(false);
    } catch (error) {
      console.error("Error saving routine:", error);
      alert(`Error saving routine: ${error.message}. Please try again.`);
    } finally {
      setSavingRoutine(false);
    }
  };

  const toggleWorkoutExpand = (workoutId) => {
    setExpandedWorkouts((prev) => ({
      ...prev,
      [workoutId]: !prev[workoutId],
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
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

    return matchesDate && matchesExercise;
  });

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Workout History
          </h1>
          <button
            onClick={() => navigate("/workout-log")}
            className="flex items-center text-teal-500 hover:text-teal-400"
          >
            <FaArrowLeft className="mr-2" /> Back to Workout
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Filter by Date
              </label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full bg-gray-200 dark:bg-gray-700 rounded p-2"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Filter by Exercise
              </label>
              <select
                value={filterExercise}
                onChange={(e) => setFilterExercise(e.target.value)}
                className="w-full bg-gray-200 dark:bg-gray-700 rounded p-2"
              >
                <option value="">All Exercises</option>
                {getAllExerciseNames().map((name, index) => (
                  <option key={index} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setFilterDate("");
                setFilterExercise("");
              }}
              className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading workout history...
            </p>
          </div>
        ) : filteredWorkouts.length === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-600 dark:text-gray-400">
              {workoutHistory.length === 0
                ? "No workouts found in your history. Start logging your workouts!"
                : "No workouts match your filters."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWorkouts.map((workout, index) => (
              <div
                key={workout.id || index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
              >
                <div
                  className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => toggleWorkoutExpand(workout.id || index)}
                >
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {workout.name}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-1" />
                        {formatDate(workout.date || workout.start_time)}
                      </div>
                      {workout.bodyweight && (
                        <div className="flex items-center">
                          <FaWeight className="mr-1" />
                          {workout.bodyweight} kg
                        </div>
                      )}
                      <div className="flex items-center">
                        <FaClock className="mr-1" />
                        {calculateDuration(
                          workout.start_time,
                          workout.end_time
                        )}
                      </div>
                      {calculateTotalDistance(workout) > 0 && (
                        <div className="flex items-center">
                          <span className="font-medium">Distance: </span>&nbsp;
                          {calculateTotalDistance(workout)} km
                        </div>
                      )}
                      {calculateTotalDuration(workout) > 0 && (
                        <div className="flex items-center">
                          <span className="font-medium">Cardio: </span>&nbsp;
                          {calculateTotalDuration(workout)} min
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    {expandedWorkouts[workout.id || index] ? (
                      <FaChevronUp className="text-gray-400" />
                    ) : (
                      <FaChevronDown className="text-gray-400" />
                    )}
                  </div>
                </div>

                {expandedWorkouts[workout.id || index] && (
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
                                              {set.weight || "-"}
                                            </td>
                                            <td className="py-2 pr-4">
                                              {set.reps || "-"}
                                            </td>
                                          </>
                                        )}
                                        <td className="py-2 text-gray-600 dark:text-gray-400">
                                          {set.notes || "-"}
                                        </td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td
                                        colSpan="4"
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
                      <p className="text-gray-500">
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
    </div>
  );
}

export default WorkoutHistory;
