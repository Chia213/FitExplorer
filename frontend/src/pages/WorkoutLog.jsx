import { useState, useEffect } from "react";
import { FaTrash, FaPlus, FaArrowUp, FaArrowDown } from "react-icons/fa";
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

  useEffect(() => {
    fetchWorkoutHistory();
  }, []);

  async function fetchWorkoutHistory() {
    try {
      const response = await fetch(`${API_BASE_URL}/workouts`);
      if (!response.ok) throw new Error("Failed to fetch workouts");
      const data = await response.json();
      setWorkoutHistory(data);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    }
  }

  const handleFinishWorkout = async () => {
    if (!workoutExercises.length) {
      alert("Please add at least one exercise before finishing the workout.");
      return;
    }

    const newWorkout = {
      name: workoutName || `Workout ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      start_time: startTime || new Date().toISOString(),
      end_time: endTime || null,
      bodyweight,
      notes,
      exercises: workoutExercises,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/workouts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    } catch (error) {
      console.error("Error saving workout:", error);
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
    const updatedExercises = [...workoutExercises];
    updatedExercises.splice(exerciseIndex, 1);
    setWorkoutExercises(updatedExercises);
  };

  const handleAddSet = (exerciseIndex) => {
    const updatedExercises = [...workoutExercises];
    updatedExercises[exerciseIndex].sets.push({
      weight: "",
      reps: "",
      notes: "",
    });
    setWorkoutExercises(updatedExercises);
  };

  const handleEditSet = (exerciseIndex, setIndex, field, value) => {
    const updatedExercises = [...workoutExercises];
    updatedExercises[exerciseIndex].sets[setIndex][field] = value;
    setWorkoutExercises(updatedExercises);
  };

  const handleDeleteSet = (exerciseIndex, setIndex) => {
    const updatedExercises = [...workoutExercises];
    updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
    setWorkoutExercises(updatedExercises);
  };

  const handleMoveSet = (exerciseIndex, setIndex, direction) => {
    const updatedExercises = [...workoutExercises];
    const setToMove = updatedExercises[exerciseIndex].sets.splice(
      setIndex,
      1
    )[0];
    if (direction === "up" && setIndex > 0) {
      updatedExercises[exerciseIndex].sets.splice(setIndex - 1, 0, setToMove);
    } else if (
      direction === "down" &&
      setIndex < updatedExercises[exerciseIndex].sets.length
    ) {
      updatedExercises[exerciseIndex].sets.splice(setIndex + 1, 0, setToMove);
    }
    setWorkoutExercises(updatedExercises);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-lg p-4">
        <input
          type="text"
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
          placeholder="Enter Workout Name"
          className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold text-lg px-3 py-2 rounded-lg w-full"
        />
      </div>

      <div className="w-full max-w-lg bg-white dark:bg-gray-800 p-4 rounded-lg mt-4">
        <div className="flex justify-between items-center py-2 border-b border-gray-300 dark:border-gray-600">
          <p className="text-gray-700 dark:text-gray-300">Start Time</p>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-600 p-2 rounded-lg"
          />
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-300 dark:border-gray-600">
          <p className="text-gray-700 dark:text-gray-300">End Time</p>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-600 p-2 rounded-lg"
          />
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-300 dark:border-gray-600">
          <p className="text-gray-700 dark:text-gray-300">Bodyweight (kg)</p>
          <input
            type="number"
            value={bodyweight}
            onChange={(e) => setBodyweight(e.target.value)}
            className="text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-600 p-2 rounded-lg"
          />
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-300 dark:border-gray-600">
          <p className="text-gray-700 dark:text-gray-300">Notes</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-600 p-2 rounded-lg w-full"
            placeholder="Add any notes..."
          />
        </div>
      </div>

      <button
        onClick={() => setShowExerciseSelection(true)}
        className="w-full max-w-lg text-teal-500 hover:text-teal-400 font-semibold text-lg p-4 mt-6 bg-white dark:bg-gray-700 rounded-lg"
      >
        Add Exercise
      </button>

      {workoutExercises.length > 0 && (
        <div className="w-full max-w-lg mt-6 space-y-4">
          {workoutExercises.map((exercise, exerciseIndex) => (
            <div
              key={exerciseIndex}
              className="bg-white dark:bg-gray-700 p-4 rounded-lg relative"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-black dark:text-white font-semibold text-lg">
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
                  className="bg-white dark:bg-gray-600 p-3 rounded-lg mt-2"
                >
                  <div className="flex justify-between">
                    <div className="flex-1 space-y-2">
                      <label className="text-gray-400 text-xs">Kg</label>
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
                        placeholder="Kg"
                        className="bg-white dark:bg-gray-800 text-black dark:text-white p-2 rounded-md w-20"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-gray-400 text-xs">Reps</label>
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
                        placeholder="Reps"
                        className="bg-white dark:bg-gray-800 text-black dark:text-white p-2 rounded-md w-20"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-gray-400 text-xs">Notes</label>
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
                        placeholder="Notes"
                        className="bg-white dark:bg-gray-800 text-black dark:text-white p-2 rounded-md w-20"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() =>
                        handleMoveSet(exerciseIndex, setIndex, "up")
                      }
                      className="text-teal-400"
                    >
                      <FaArrowUp />
                    </button>
                    <button
                      onClick={() =>
                        handleMoveSet(exerciseIndex, setIndex, "down")
                      }
                      className="text-teal-400"
                    >
                      <FaArrowDown />
                    </button>
                    <button
                      onClick={() => handleDeleteSet(exerciseIndex, setIndex)}
                      className="text-red-400"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={() => handleAddSet(exerciseIndex)}
                className="text-teal-400 hover:text-teal-300 mt-3"
              >
                Add Set
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleFinishWorkout}
        className="w-full max-w-lg text-teal-500 hover:text-teal-400 font-semibold text-lg p-4 mt-6 bg-white dark:bg-gray-700 rounded-lg"
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
