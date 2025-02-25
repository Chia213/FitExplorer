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
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("");
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [bodyweight, setBodyweight] = useState("");
  const [notes, setNotes] = useState("");

  const handleExerciseSelection = (exercise) => {
    setSelectedExercises((prevExercises) =>
      prevExercises.includes(exercise)
        ? prevExercises.filter((ex) => ex !== exercise)
        : [...prevExercises, exercise]
    );
  };

  const addWorkout = (e) => {
    e.preventDefault();
    if (
      selectedMuscleGroup &&
      selectedExercises.length > 0 &&
      startTime &&
      endTime &&
      bodyweight.trim()
    ) {
      const newWorkout = {
        muscleGroup: selectedMuscleGroup,
        exercises: selectedExercises,
        startTime: new Date(startTime).toLocaleString(),
        endTime: new Date(endTime).toLocaleString(),
        bodyweight,
        notes,
      };
      setWorkouts([...workouts, newWorkout]);
      setSelectedMuscleGroup("");
      setSelectedExercises([]);
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
        <form onSubmit={addWorkout}>
          <select
            value={selectedMuscleGroup}
            onChange={(e) => setSelectedMuscleGroup(e.target.value)}
            className="w-full p-2 border rounded-md mb-2"
            required
          >
            <option value="" disabled>
              Select Muscle Group
            </option>
            {Object.keys(muscleGroups).map((muscle) => (
              <option key={muscle} value={muscle}>
                {muscle}
              </option>
            ))}
          </select>

          {selectedMuscleGroup && (
            <div className="mb-2">
              <p className="font-semibold">Select Exercises:</p>
              {muscleGroups[selectedMuscleGroup].map((exercise) => (
                <div key={exercise} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedExercises.includes(exercise)}
                    onChange={() => handleExerciseSelection(exercise)}
                  />
                  <label>{exercise}</label>
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
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes"
            className="w-full p-2 border rounded-md mb-2"
          ></textarea>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 mt-3 rounded-md hover:bg-blue-700"
          >
            Add Workout
          </button>
        </form>
      </div>
      <ul className="mt-4 w-full max-w-md">
        {workouts.map((workout, index) => (
          <li key={index} className="p-2 border-b">
            <strong>Muscle Group:</strong> {workout.muscleGroup} <br />
            <strong>Exercises:</strong> {workout.exercises.join(", ")} <br />
            <strong>Start Time:</strong> {workout.startTime} <br />
            <strong>End Time:</strong> {workout.endTime} <br />
            <strong>Bodyweight:</strong> {workout.bodyweight} kg <br />
            <strong>Notes:</strong> {workout.notes}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default WorkoutLog;
