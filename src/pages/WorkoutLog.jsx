import { useState } from "react";

const muscleGroups = {
  Back: ["Pull-ups", "Deadlifts", "Bent-over Rows"],
  Chest: ["Bench Press", "Push-ups", "Chest Fly"],
  Legs: ["Squats", "Lunges", "Leg Press"],
  Shoulders: ["Shoulder Press", "Lateral Raises", "Face Pulls"],
  Biceps: ["Bicep Curls", "Hammer Curls", "Concentration Curls"],
  Triceps: ["Dips", "Tricep Extensions", "Close-Grip Bench Press"],
};

function WorkoutLog() {
  const [workoutExercises, setWorkoutExercises] = useState([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("");
  const [selectedExercise, setSelectedExercise] = useState("");
  const [exerciseDetails, setExerciseDetails] = useState({
    weight: "",
    reps: "",
    sets: "",
    notes: "",
  });
  const [bodyweight, setBodyweight] = useState("");
  const [notes, setNotes] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [restTimer, setRestTimer] = useState(null);
  const [history, setHistory] = useState([]);
  const [showExerciseSelection, setShowExerciseSelection] = useState(false);
  const [timerOptions] = useState([15, 30, 45, 60]);

  const startRestTimer = (time) => {
    setRestTimer(time);
    setTimeout(() => setRestTimer(null), time * 1000);
  };

  const handleAddExercise = () => {
    if (selectedExercise) {
      setWorkoutExercises((prev) => [
        ...prev,
        { name: selectedExercise, ...exerciseDetails },
      ]);
      setSelectedExercise("");
      setExerciseDetails({ weight: "", reps: "", sets: "", notes: "" });
    }
  };

  const finishWorkout = () => {
    if (workoutExercises.length === 0 || !bodyweight.trim()) {
      alert(
        "Please add at least one exercise and enter bodyweight before finishing the workout."
      );
      return;
    }

    const newWorkoutSession = {
      name: "My Workout",
      startTime: startTime ? new Date(startTime).toLocaleString() : "Not Set",
      endTime: endTime ? new Date(endTime).toLocaleString() : "Not Set",
      bodyweight,
      notes,
      exercises: workoutExercises,
    };

    setHistory((prev) => [newWorkoutSession, ...prev]);
    setWorkoutExercises([]);
    setSelectedMuscleGroup("");
    setSelectedExercise("");
    setExerciseDetails({ weight: "", reps: "", sets: "", notes: "" });
    setBodyweight("");
    setNotes("");
    setStartTime("");
    setEndTime("");
    setShowExerciseSelection(false);
    setRestTimer(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Workout Log</h1>
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        {!showExerciseSelection ? (
          <button
            onClick={() => setShowExerciseSelection(true)}
            className="w-full bg-green-500 text-white p-2 mt-3 rounded-md hover:bg-green-700"
          >
            Add Exercises
          </button>
        ) : (
          <>
            <p className="font-semibold">Select Muscle Group:</p>
            <select
              value={selectedMuscleGroup}
              onChange={(e) => setSelectedMuscleGroup(e.target.value)}
              className="w-full p-2 border rounded-md mt-2"
            >
              <option value="">-- Select Muscle Group --</option>
              {Object.keys(muscleGroups).map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
            {selectedMuscleGroup && (
              <>
                <p className="font-semibold mt-3">Select Exercise:</p>
                <select
                  value={selectedExercise}
                  onChange={(e) => setSelectedExercise(e.target.value)}
                  className="w-full p-2 border rounded-md mt-2"
                >
                  <option value="">-- Select Exercise --</option>
                  {muscleGroups[selectedMuscleGroup].map((exercise) => (
                    <option key={exercise} value={exercise}>
                      {exercise}
                    </option>
                  ))}
                </select>
                {selectedExercise && (
                  <>
                    <input
                      type="number"
                      placeholder="Weight (kg)"
                      value={exerciseDetails.weight}
                      onChange={(e) =>
                        setExerciseDetails({
                          ...exerciseDetails,
                          weight: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-md mt-2"
                    />
                    <input
                      type="number"
                      placeholder="Reps"
                      value={exerciseDetails.reps}
                      onChange={(e) =>
                        setExerciseDetails({
                          ...exerciseDetails,
                          reps: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-md mt-2"
                    />
                    <input
                      type="number"
                      placeholder="Sets"
                      value={exerciseDetails.sets}
                      onChange={(e) =>
                        setExerciseDetails({
                          ...exerciseDetails,
                          sets: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-md mt-2"
                    />
                    <textarea
                      placeholder="Notes"
                      value={exerciseDetails.notes}
                      onChange={(e) =>
                        setExerciseDetails({
                          ...exerciseDetails,
                          notes: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-md mt-2"
                    ></textarea>
                    <button
                      onClick={handleAddExercise}
                      className="w-full bg-blue-500 text-white p-2 mt-3 rounded-md hover:bg-blue-700"
                    >
                      Add Exercise
                    </button>
                  </>
                )}
              </>
            )}
            <p className="font-semibold mt-3">
              Rest Timer: {restTimer ? `${restTimer}s` : "Not started"}
            </p>
            <div className="flex gap-2">
              {timerOptions.map((time) => (
                <button
                  key={time}
                  onClick={() => startRestTimer(time)}
                  className="p-2 bg-gray-300 rounded-md hover:bg-gray-400"
                >
                  {time}s
                </button>
              ))}
            </div>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2 border rounded-md mb-2"
            />
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2 border rounded-md mb-2"
            />
            <input
              type="number"
              value={bodyweight}
              onChange={(e) => setBodyweight(e.target.value)}
              placeholder="Bodyweight (kg)"
              className="w-full p-2 border rounded-md mb-2"
              required
            />
            <textarea
              placeholder="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border rounded-md mt-2"
            ></textarea>
            <button
              onClick={finishWorkout}
              className="w-full bg-blue-500 text-white p-2 mt-3 rounded-md hover:bg-blue-700"
            >
              Finish Workout
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default WorkoutLog;
