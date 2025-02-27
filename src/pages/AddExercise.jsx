import { useState } from "react";
import { FaArrowLeft, FaPlus, FaSearch } from "react-icons/fa";

function AddExercise({ onClose, onSelectExercise }) {
  const exercisesData = {
    Abs: ["Crunches", "Leg Raises", "Plank"],
    Back: ["Pull-ups", "Deadlifts", "Bent-over Rows"],
    Biceps: ["Bicep Curls", "Hammer Curls", "Concentration Curls"],
    Cardio: ["Running", "Cycling", "Jump Rope"],
    Chest: ["Bench Press", "Push-ups", "Chest Fly"],
    Legs: ["Squats", "Lunges", "Leg Press"],
    Shoulders: ["Shoulder Press", "Lateral Raises", "Face Pulls"],
    Triceps: ["Dips", "Tricep Extensions", "Close-Grip Bench Press"],
  };

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [sets, setSets] = useState("");

  const handleAddExercise = () => {
    if (!selectedExercise || !weight || !reps || !sets) return;

    onSelectExercise({ name: selectedExercise, weight, reps, sets });
    onClose();
  };

  const filteredExercises =
    selectedCategory && searchTerm
      ? exercisesData[selectedCategory].filter((exercise) =>
          exercise.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : exercisesData[selectedCategory] || [];

  return (
    <div className="absolute top-0 left-0 w-full h-full bg-white p-6 flex flex-col dark:bg-gray-900">
      <div className="flex justify-between items-center mb-4">
        {selectedCategory && !selectedExercise ? (
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSearchTerm("");
            }}
            className="text-teal-500 hover:text-teal-400 flex items-center gap-2"
          >
            <FaArrowLeft /> Back
          </button>
        ) : (
          <button
            onClick={onClose}
            className="text-teal-500 hover:text-teal-400"
          >
            Cancel
          </button>
        )}
        <h2 className="text-gray-900 dark:text-white font-semibold">
          {selectedCategory ? selectedCategory : "Select Exercise"}
        </h2>
      </div>

      {!selectedCategory ? (
        <div className="space-y-2">
          {Object.keys(exercisesData).map((group) => (
            <button
              key={group}
              onClick={() => setSelectedCategory(group)}
              className="block w-full py-3 text-left text-gray-900 dark:text-gray-300 border-b border-gray-300 dark:border-gray-700 hover:text-black dark:hover:text-white"
            >
              {group}
            </button>
          ))}
        </div>
      ) : !selectedExercise ? (
        <div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 bg-white text-gray-900 rounded-md pl-10 dark:bg-gray-700 dark:text-white"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <div className="space-y-2 mt-3">
            {filteredExercises.length > 0 ? (
              filteredExercises.map((exercise) => (
                <button
                  key={exercise}
                  onClick={() => setSelectedExercise(exercise)}
                  className="block w-full py-3 text-left text-gray-900 dark:text-gray-300 border-b border-gray-300 dark:border-gray-700 hover:text-black dark:hover:text-white"
                >
                  {exercise}
                </button>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                No results found
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <h3 className="text-gray-900 dark:text-white">{selectedExercise}</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <label className="text-gray-400 text-xs">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full p-2 bg-white text-gray-900 rounded-md text-center dark:bg-gray-700 dark:text-white"
                placeholder="Kg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-gray-400 text-xs">Reps</label>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="w-full p-2 bg-white text-gray-900 rounded-md text-center dark:bg-gray-700 dark:text-white"
                placeholder="Reps"
              />
            </div>
            <div className="space-y-2">
              <label className="text-gray-400 text-xs">Sets</label>
              <input
                type="number"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                className="w-full p-2 bg-white text-gray-900 rounded-md text-center dark:bg-gray-700 dark:text-white"
                placeholder="Sets"
              />
            </div>
          </div>
          <button
            onClick={handleAddExercise}
            disabled={!weight || !reps || !sets}
            className={`w-full p-3 rounded-md text-white font-medium flex items-center justify-center gap-2 ${
              !weight || !reps || !sets
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-teal-500 hover:bg-teal-600"
            }`}
          >
            <FaPlus /> Add Exercise
          </button>
        </div>
      )}
    </div>
  );
}

export default AddExercise;
