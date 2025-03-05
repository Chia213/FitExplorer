import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTrash,
  FaPlus,
  FaArrowUp,
  FaArrowDown,
  FaListAlt,
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
  const [workoutHistory, setWorkoutHistory] = useState([]);
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
    try {
      const response = await fetch(`${API_BASE_URL}/workouts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch workouts");
      const data = await response.json();
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

    // Validate that all sets have weights and reps
    const invalidExercises = workoutExercises.filter((exercise) =>
      exercise.sets.some((set) => !set.weight || !set.reps)
    );

    if (invalidExercises.length > 0) {
      alert("Please fill in weight and reps for all sets.");
      return;
    }

    const token = localStorage.getItem("token");
    const newWorkout = {
      name: workoutName || `Workout ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      start_time: startTime || new Date().toISOString(),
      end_time: endTime || new Date().toISOString(), // Use current time if not provided
      bodyweight: bodyweight || null,
      notes,
      exercises: workoutExercises,
    };

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

      const savedWorkout = await response.json();
      setWorkoutHistory((prev) => [savedWorkout, ...prev]);

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
    setWorkoutExercises([
      ...workoutExercises,
      { ...exercise, sets: [{ weight: "", reps: "", notes: "" }] },
    ]);
    setShowExerciseSelection(false);
  };

  const handleDeleteExercise = (exerciseIndex) => {
    setWorkoutExercises(
      workoutExercises.filter((_, index) => index !== exerciseIndex)
    );
  };

  const handleAddSet = (exerciseIndex) => {
    setWorkoutExercises((prev) =>
      prev.map((exercise, index) =>
        index === exerciseIndex
          ? {
              ...exercise,
              sets: [...exercise.sets, { weight: "", reps: "", notes: "" }],
            }
          : exercise
      )
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

  const handleMoveSet = (exerciseIndex, setIndex, direction) => {
    setWorkoutExercises((prev) =>
      prev.map((exercise, eIndex) => {
        if (eIndex === exerciseIndex) {
          const newSets = [...exercise.sets];
          const setToMove = newSets.splice(setIndex, 1)[0];
          if (direction === "up" && setIndex > 0)
            newSets.splice(setIndex - 1, 0, setToMove);
          if (direction === "down" && setIndex < newSets.length)
            newSets.splice(setIndex + 1, 0, setToMove);
          return { ...exercise, sets: newSets };
        }
        return exercise;
      })
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
            <button
              onClick={() => handleDeleteExercise(exerciseIndex)}
              className="text-red-400 hover:text-red-300"
            >
              <FaTrash />
            </button>
          </div>

          {exercise.sets.map((set, setIndex) => (
            <div
              key={setIndex}
              className="mt-4 border-t border-gray-200 dark:border-gray-600 pt-3"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Set {setIndex + 1}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMoveSet(exerciseIndex, setIndex, "up")}
                    className="text-teal-500 hover:text-teal-400"
                    disabled={setIndex === 0}
                  >
                    <FaArrowUp />
                  </button>
                  <button
                    onClick={() =>
                      handleMoveSet(exerciseIndex, setIndex, "down")
                    }
                    className="text-teal-500 hover:text-teal-400"
                    disabled={setIndex === exercise.sets.length - 1}
                  >
                    <FaArrowDown />
                  </button>
                  <button
                    onClick={() => handleDeleteSet(exerciseIndex, setIndex)}
                    className="text-red-500 hover:text-red-400"
                    disabled={exercise.sets.length === 1}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

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
            </div>
          ))}

          <button
            onClick={() => handleAddSet(exerciseIndex)}
            className="w-full text-teal-500 hover:text-teal-400 mt-4 flex items-center justify-center"
          >
            <FaPlus className="mr-2" /> Add Set
          </button>
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
