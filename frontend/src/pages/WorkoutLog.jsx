import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTrash,
  FaPlus,
  FaArrowUp,
  FaArrowDown,
  FaListAlt,
  FaChevronUp,
  FaChevronDown,
  FaSave,
} from "react-icons/fa";
import AddExercise from "./AddExercise";

const API_BASE_URL = "http://localhost:8000";

const getIntensityValue = (intensityString) => {
  const intensityMap = {
    "": 0,
    Low: 1,
    Medium: 2,
    High: 3,
    "Very High": 4,
  };
  return intensityMap[intensityString] || 0;
};

function WorkoutLog() {
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
  const navigate = useNavigate();

  const toggleExerciseCollapse = (exerciseIndex) => {
    setCollapsedExercises((prev) => ({
      ...prev,
      [exerciseIndex]: !prev[exerciseIndex],
    }));
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
    console.log("Auth token:", token);
    fetchWorkoutHistory(token);
  }, [navigate]);

  useEffect(() => {
    if (workoutHistory.length > 0 && !bodyweight) {
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
      console.log("Fetched workout history:", data);
      setWorkoutHistory(data);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    }
  }

  const handleFinishWorkout = async () => {
    if (!workoutName.trim()) {
      alert("Please enter a workout name.");
      return;
    }

    if (!workoutExercises.length) {
      alert("Please add at least one exercise before finishing the workout.");
      return;
    }

    let hasInvalidExercises = false;

    workoutExercises.forEach((exercise) => {
      if (exercise.isCardio) {
        if (
          exercise.sets.some(
            (set) => !set.distance || !set.duration || !set.intensity
          )
        ) {
          alert(
            `Please fill in Distance, Duration and Intensity ${exercise.name}.`
          );
          hasInvalidExercises = true;
        }
      } else {
        if (exercise.sets.some((set) => !set.weight || !set.reps)) {
          alert(
            `Please fill in Distance, Duration and Intensity to save exercise ${exercise.name}.`
          );
          hasInvalidExercises = true;
        }
      }
    });

    if (hasInvalidExercises) {
      return;
    }

    const token = localStorage.getItem("token");

    const cleanedExercises = workoutExercises.map((exercise) => ({
      name: exercise.name,
      category: exercise.category || "Uncategorized",
      is_cardio: exercise.isCardio || false,
      sets: exercise.sets.map((set) => {
        if (exercise.isCardio) {
          return {
            distance: set.distance ? parseFloat(set.distance) : null,
            duration: set.duration ? parseFloat(set.duration) : null,
            intensity: getIntensityValue(set.intensity),
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
    }));

    const newWorkout = {
      name: workoutName || `Workout ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      start_time: startTime
        ? new Date(startTime).toISOString()
        : new Date().toISOString(),
      end_time: endTime
        ? new Date(endTime).toISOString()
        : new Date().toISOString(),
      bodyweight: bodyweight ? parseFloat(bodyweight) : null,
      notes,
      exercises: cleanedExercises,
    };

    console.log("Saving workout:", JSON.stringify(newWorkout, null, 2));

    try {
      const response = await fetch(`${API_BASE_URL}/workouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newWorkout),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server rejected workout with error:", errorText);
        try {
          const errorJson = JSON.parse(errorText);
          console.error("Detailed validation errors:", errorJson);
        } catch (e) {}
        throw new Error("Failed to save workout");
      }

      const savedWorkout = await response.json();
      console.log("Server response:", savedWorkout);

      const workoutWithExercises = {
        ...savedWorkout,
        exercises: savedWorkout.exercises || cleanedExercises,
      };

      setWorkoutHistory((prev) => [workoutWithExercises, ...prev]);

      setWorkoutExercises([]);
      setWorkoutName("");
      setBodyweight("");
      setNotes("");
      setStartTime(new Date().toISOString().slice(0, 16));
      setEndTime("");

      alert("Workout saved successfully!");
    } catch (error) {
      console.error("Error saving workout:", error);
      alert("Error saving workout. Please try again.");
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
      alert("Please enter a routine name.");
      return;
    }

    const token = localStorage.getItem("token");

    // Create exercise templates for the routine (without the actual set data)
    const routineExercises = workoutExercises.map((exercise) => ({
      name: exercise.name,
      category: exercise.category || "Uncategorized",
      is_cardio: exercise.isCardio || false,
      initial_sets: exercise.sets.length,
    }));

    const newRoutine = {
      name: routineName,
      exercises: routineExercises,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/routines`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newRoutine),
      });

      if (!response.ok) {
        throw new Error("Failed to save routine");
      }

      alert("Routine saved successfully!");
      setShowSaveRoutineModal(false);
    } catch (error) {
      console.error("Error saving routine:", error);
      alert("Error saving routine. Please try again.");
    }
  };

  const handleAddExercise = (exercise) => {
    const initialSets = exercise.initialSets || 1;

    if (exercise.isCardio) {
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
          isCardio: true,
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
        { ...exercise, sets: emptySets, isCardio: false },
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
          const newSet = exercise.isCardio
            ? { distance: "", duration: "", intensity: "", notes: "" }
            : { weight: "", reps: "", notes: "" };

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

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-lg p-4 flex justify-between items-center">
        <input
          type="text"
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
          placeholder="Enter Workout Name"
          className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold text-lg px-3 py-2 rounded-lg flex-grow mr-2"
        />
        <button
          onClick={() => navigate("/workout-history")}
          className="bg-teal-500 text-white p-2 rounded-lg hover:bg-teal-400"
          title="View Workout History"
        >
          <FaListAlt className="text-xl" />
        </button>
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
          <p className="text-gray-700 dark:text-gray-300">Bodyweight (kg)</p>
          <input
            type="number"
            value={bodyweight}
            onChange={(e) => setBodyweight(e.target.value)}
            className="bg-gray-200 dark:bg-gray-600 p-2 rounded-lg"
          />
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
            <h3 className="text-black dark:text-white font-semibold">
              {exercise.name}
            </h3>
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
            </div>
          </div>

          {!collapsedExercises[exerciseIndex] && (
            <>
              {exercise.sets.map((set, setIndex) => (
                <div
                  key={setIndex}
                  className="mt-4 border-t border-gray-200 dark:border-gray-600 pt-3"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Set {setIndex + 1}
                    </span>
                    <button
                      onClick={() => handleDeleteSet(exerciseIndex, setIndex)}
                      className="text-red-500 hover:text-red-400"
                      disabled={exercise.sets.length === 1}
                    >
                      <FaTrash />
                    </button>
                  </div>

                  {exercise.isCardio ? (
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
                            Weight (kg)
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
    </div>
  );
}

export default WorkoutLog;
