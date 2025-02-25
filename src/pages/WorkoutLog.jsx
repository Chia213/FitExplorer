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
  const [workouts, setWorkouts] = useState([]);
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [exerciseDetails, setExerciseDetails] = useState({});
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [bodyweight, setBodyweight] = useState("");
  const [notes, setNotes] = useState("");

  const handleMuscleGroupSelection = (muscle) => {
    setSelectedMuscleGroups((prev) =>
      prev.includes(muscle)
        ? prev.filter((m) => m !== muscle)
        : [...prev, muscle]
    );
  };

  const handleExerciseSelection = (exercise) => {
    setSelectedExercises((prevExercises) =>
      prevExercises.includes(exercise)
        ? prevExercises.filter((ex) => ex !== exercise)
        : [...prevExercises, exercise]
    );
    setExerciseDetails((prevDetails) => ({
      ...prevDetails,
      [exercise]: prevDetails[exercise] || { weight: "", reps: "", notes: "" },
    }));
  };

  const handleExerciseDetailChange = (exercise, field, value) => {
    setExerciseDetails((prevDetails) => ({
      ...prevDetails,
      [exercise]: { ...prevDetails[exercise], [field]: value },
    }));
  };

  const finishWorkout = () => {
    if (
      selectedMuscleGroups.length > 0 &&
      selectedExercises.length > 0 &&
      startTime &&
      endTime &&
      bodyweight.trim()
    ) {
      const newWorkout = {
        muscleGroups: selectedMuscleGroups,
        exercises: selectedExercises.map((exercise) => ({
          name: exercise,
          weight: exerciseDetails[exercise]?.weight || "",
          reps: exerciseDetails[exercise]?.reps || "",
          notes: exerciseDetails[exercise]?.notes || "",
        })),
        startTime: new Date(startTime).toLocaleString(),
        endTime: new Date(endTime).toLocaleString(),
        bodyweight,
        notes,
      };
      setWorkouts([...workouts, newWorkout]);
      setSelectedMuscleGroups([]);
      setSelectedExercises([]);
      setExerciseDetails({});
      setStartTime("");
      setEndTime("");
      setBodyweight("");
      setNotes("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">What are we Training today?</h1>
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <p className="font-semibold">Select Muscle Groups:</p>
        {Object.keys(muscleGroups).map((muscle) => (
          <div key={muscle} className="mb-2">
            <input
              type="checkbox"
              checked={selectedMuscleGroups.includes(muscle)}
              onChange={() => handleMuscleGroupSelection(muscle)}
            />
            <label className="ml-2 font-semibold">{muscle}</label>
          </div>
        ))}

        {selectedMuscleGroups.length > 0 && (
          <div className="mb-2">
            <p className="font-semibold">Select Exercises:</p>
            {selectedMuscleGroups
              .flatMap((group) => muscleGroups[group])
              .map((exercise) => (
                <div key={exercise} className="mb-2">
                  <input
                    type="checkbox"
                    checked={selectedExercises.includes(exercise)}
                    onChange={() => handleExerciseSelection(exercise)}
                  />
                  <label className="ml-2 font-semibold">{exercise}</label>
                  {selectedExercises.includes(exercise) && (
                    <div className="ml-4">
                      <input
                        type="number"
                        placeholder="Weight (kg)"
                        value={exerciseDetails[exercise]?.weight || ""}
                        onChange={(e) =>
                          handleExerciseDetailChange(
                            exercise,
                            "weight",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border rounded-md mt-1"
                      />
                      <input
                        type="number"
                        placeholder="Reps"
                        value={exerciseDetails[exercise]?.reps || ""}
                        onChange={(e) =>
                          handleExerciseDetailChange(
                            exercise,
                            "reps",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border rounded-md mt-1"
                      />
                      <textarea
                        placeholder="Notes"
                        value={exerciseDetails[exercise]?.notes || ""}
                        onChange={(e) =>
                          handleExerciseDetailChange(
                            exercise,
                            "notes",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border rounded-md mt-1"
                      ></textarea>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="w-full p-2 border rounded-md mb-2"
          required
        />
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="w-full p-2 border rounded-md mb-2"
          required
        />
        <input
          type="number"
          value={bodyweight}
          onChange={(e) => setBodyweight(e.target.value)}
          placeholder="Bodyweight (kg)"
          className="w-full p-2 border rounded-md mb-2"
          required
        />
        <button
          onClick={finishWorkout}
          className="w-full bg-blue-500 text-white p-2 mt-3 rounded-md hover:bg-blue-700"
        >
          Finish Workout
        </button>
      </div>
    </div>
  );
}

export default WorkoutLog;
