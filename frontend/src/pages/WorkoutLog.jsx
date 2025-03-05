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
} from "react-icons/fa";
import AddExercise from "./AddExercise";

const API_BASE_URL = "http://localhost:8000";

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
      return; // Don't move if at the edges
    }

    const newExercises = [...workoutExercises];
    const targetIndex =
      direction === "up" ? exerciseIndex - 1 : exerciseIndex + 1;

    // Swap the exercises
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
  }, [navigate]);

  // Auto-fill bodyweight from recent workout once workout history loads
  useEffect(() => {
    if (workoutHistory.length > 0 && !bodyweight) {
      // Find the most recent workout with a bodyweight value
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
      console.log("Fetched workout history:", data); // Debug log
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

    // Validate that all sets have required fields filled
    let hasInvalidExercises = false;

    workoutExercises.forEach((exercise) => {
      if (exercise.isCardio) {
        // For cardio exercises, check if distance or duration is filled
        if (exercise.sets.some((set) => !set.distance && !set.duration)) {
          alert(
            `Please fill in either distance or duration for all sets in ${exercise.name}.`
          );
          hasInvalidExercises = true;
        }
      } else {
        // For weight training, check if weight and reps are filled
        if (exercise.sets.some((set) => !set.weight || !set.reps)) {
          alert(
            `Please fill in weight and reps for all sets in ${exercise.name}.`
          );
          hasInvalidExercises = true;
        }
      }
    });

    if (hasInvalidExercises) {
      return;
    }

    const token = localStorage.getItem("token");

    // Create a clean version of exercises to ensure all properties are properly set
    const cleanedExercises = workoutExercises.map((exercise) => ({
      name: exercise.name,
      category: exercise.category || "Uncategorized",
      isCardio: exercise.isCardio || false,
      sets: exercise.sets.map((set) => {
        // Ensure we're saving all set data with proper types
        if (exercise.isCardio) {
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
    }));

    const newWorkout = {
      name: workoutName || `Workout ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      start_time: startTime || new Date().toISOString(),
      end_time: endTime || new Date().toISOString(), // Use current time if not provided
      bodyweight: bodyweight || null,
      notes,
      exercises: cleanedExercises,
    };

    console.log("Saving workout:", JSON.stringify(newWorkout, null, 2)); // Debug log

    try {
      const response = await fetch(`${API_BASE_URL}/workouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newWorkout),
      });

      if (!response.ok) throw new Error("Failed to save workout");

      // Parse the saved workout from the response
      const savedWorkout = await response.json();
      console.log("Server response:", savedWorkout); // Debug log

      // Make sure the exercises array is properly included in our UI state
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

  const handleAddExercise = (exercise) => {
    // Create appropriate template based on exercise type
    const initialSets = exercise.initialSets || 1;

    // Different template for cardio exercises
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
      // Regular weight training template
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

    // Also remove from collapsed state
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
          // Create an appropriate empty set based on exercise type
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
              {/* Exercise movement controls */}
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

              {/* Collapse toggle button */}
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

              {/* Delete exercise button */}
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
                    // Cardio exercise fields
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
                          Intensity (1-10)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
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
                          placeholder="Intensity"
                        />
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
                    // Weight training exercise fields
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

      <button
        onClick={handleFinishWorkout}
        className="w-full max-w-lg text-white font-semibold text-lg p-4 mt-6 bg-teal-500 hover:bg-teal-400 rounded-lg"
        disabled={workoutExercises.length === 0}
      >
        Finish Workout
      </button>

      {showExerciseSelection && (
        <AddExercise
          onClose={() => setShowExerciseSelection(false)}
          onSelectExercise={handleAddExercise}
        />
      )}
    </div>
  );
}

export default WorkoutLog;
