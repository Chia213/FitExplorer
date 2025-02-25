import { useState } from "react";

const exercises = {
  Abs: ["Crunches", "Leg Raises", "Plank"],
  Back: ["Pull-ups", "Deadlifts", "Bent-over Rows"],
  Biceps: ["Bicep Curls", "Hammer Curls", "Concentration Curls"],
  Cardio: ["Running", "Cycling", "Jump Rope"],
  Chest: ["Bench Press", "Push-ups", "Chest Fly"],
  Legs: ["Squats", "Lunges", "Leg Press"],
  Shoulders: ["Shoulder Press", "Lateral Raises", "Face Pulls"],
  Triceps: ["Dips", "Tricep Extensions", "Close-Grip Bench Press"],
};

function AddExercise() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [notes, setNotes] = useState("");
  const [log, setLog] = useState([]);

  const addLogEntry = () => {
    if (selectedExercise && weight && reps) {
      const newEntry = {
        category: selectedCategory,
        exercise: selectedExercise,
        weight,
        reps,
        notes,
      };
      setLog([...log, newEntry]);
      setWeight("");
      setReps("");
      setNotes("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Add Exercise</h1>
      {!selectedCategory ? (
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          {Object.keys(exercises).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
            >
              {category}
            </button>
          ))}
        </div>
      ) : !selectedExercise ? (
        <div className="w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">
            {selectedCategory} Exercises
          </h2>
          {exercises[selectedCategory].map((exercise) => (
            <button
              key={exercise}
              onClick={() => setSelectedExercise(exercise)}
              className="w-full p-3 bg-green-500 text-white rounded-md mb-2 hover:bg-green-700"
            >
              {exercise}
            </button>
          ))}
          <button
            onClick={() => setSelectedCategory(null)}
            className="w-full p-2 mt-4 bg-red-500 text-white rounded-md hover:bg-red-700"
          >
            Back
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">{selectedExercise}</h2>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Weight (kg)"
            className="w-full p-2 border rounded-md mb-2"
          />
          <input
            type="number"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder="Reps"
            className="w-full p-2 border rounded-md mb-2"
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes"
            className="w-full p-2 border rounded-md mb-2"
          ></textarea>
          <button
            onClick={addLogEntry}
            className="w-full bg-blue-500 text-white p-2 mt-3 rounded-md hover:bg-blue-700"
          >
            Log Exercise
          </button>
          <button
            onClick={() => setSelectedExercise(null)}
            className="w-full p-2 mt-4 bg-red-500 text-white rounded-md hover:bg-red-700"
          >
            Back
          </button>
        </div>
      )}

      {log.length > 0 && (
        <div className="w-full max-w-md mt-6 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Exercise Log</h2>
          <ul>
            {log.map((entry, index) => (
              <li key={index} className="p-2 border-b">
                <strong>{entry.exercise}</strong> ({entry.category})<br />
                <strong>Weight:</strong> {entry.weight} kg |{" "}
                <strong>Reps:</strong> {entry.reps}
                <br />
                <strong>Notes:</strong> {entry.notes}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AddExercise;
