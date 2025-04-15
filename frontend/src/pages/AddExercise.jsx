import { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaPlus,
  FaSearch,
  FaTrash,
  FaEdit,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

function AddExercise({ onClose, onSelectExercise }) {
  const defaultExercisesData = {
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
  const [customExercise, setCustomExercise] = useState("");
  const [exercises, setExercises] = useState(defaultExercisesData);
  const [initialSets, setInitialSets] = useState(1);
  const [editingExercise, setEditingExercise] = useState(null);
  const [editExerciseName, setEditExerciseName] = useState("");

  useEffect(() => {
    const savedExercises = JSON.parse(localStorage.getItem("exercises"));
    if (savedExercises) {
      setExercises(savedExercises);
    }
  }, []);

  useEffect(() => {
    if (JSON.stringify(exercises) !== JSON.stringify(defaultExercisesData)) {
      localStorage.setItem("exercises", JSON.stringify(exercises));
    }
  }, [exercises]);

  const handleAddExercise = () => {
    if (!selectedExercise) return;

    const is_cardio = selectedCategory === "Cardio";

    onSelectExercise({
      name: selectedExercise,
      initialSets: parseInt(initialSets) || 1,
      category: selectedCategory,
      is_cardio,
    });
    onClose();
  };

  const handleAddCustomExercise = () => {
    if (customExercise.trim()) {
      setExercises((prevExercises) => {
        const updatedExercises = { ...prevExercises };
        updatedExercises[selectedCategory] = [
          ...updatedExercises[selectedCategory],
          customExercise,
        ];

        localStorage.setItem("exercises", JSON.stringify(updatedExercises));

        return updatedExercises;
      });

      setSelectedExercise(customExercise);
      setCustomExercise("");
    }
  };

  const handleRemoveExercise = (exerciseName) => {
    if (
      window.confirm(
        `Are you sure you want to remove "${exerciseName}" from your exercise catalog?`
      )
    ) {
      setExercises((prevExercises) => {
        const updatedExercises = { ...prevExercises };

        updatedExercises[selectedCategory] = updatedExercises[
          selectedCategory
        ].filter((name) => name !== exerciseName);

        localStorage.setItem("exercises", JSON.stringify(updatedExercises));

        return updatedExercises;
      });

      if (editingExercise === exerciseName) {
        setEditingExercise(null);
      }
      if (selectedExercise === exerciseName) {
        setSelectedExercise(null);
      }
    }
  };

  const startEditExercise = (exerciseName) => {
    setEditingExercise(exerciseName);
    setEditExerciseName(exerciseName);
  };

  const saveExerciseEdit = () => {
    if (editExerciseName.trim() && editingExercise !== editExerciseName) {
      setExercises((prevExercises) => {
        const updatedExercises = { ...prevExercises };

        updatedExercises[selectedCategory] = updatedExercises[
          selectedCategory
        ].map((name) => (name === editingExercise ? editExerciseName : name));

        localStorage.setItem("exercises", JSON.stringify(updatedExercises));

        return updatedExercises;
      });

      if (selectedExercise === editingExercise) {
        setSelectedExercise(editExerciseName);
      }
    }

    setEditingExercise(null);
  };

  const cancelExerciseEdit = () => {
    setEditingExercise(null);
  };

  const filteredExercises =
    selectedCategory && searchTerm
      ? exercises[selectedCategory].filter((exercise) =>
          exercise.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : exercises[selectedCategory] || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-0">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md mx-auto rounded-lg shadow-lg overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
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
            ) : selectedExercise ? (
              <button
                onClick={() => {
                  setSelectedExercise(null);
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
            <h2 className="text-gray-900 dark:text-white font-semibold truncate max-w-[200px]">
              {selectedExercise
                ? selectedExercise
                : selectedCategory
                ? selectedCategory
                : "Select Exercise Category"}
            </h2>
            <div className="w-16"></div>
          </div>

          {!selectedCategory ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {Object.keys(exercises).map((group) => (
                <button
                  key={group}
                  onClick={() => setSelectedCategory(group)}
                  className="block w-full py-3 text-left px-3 text-gray-900 dark:text-gray-300 border-b border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white rounded"
                >
                  {group}
                </button>
              ))}
            </div>
          ) : !selectedExercise ? (
            <div>
              <div className="relative mb-4">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="max-h-60 md:max-h-72 overflow-y-auto mb-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                {filteredExercises.length > 0 ? (
                  filteredExercises.map((exercise) => (
                    <div
                      key={exercise}
                      className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 relative"
                    >
                      {editingExercise === exercise ? (
                        <div className="flex items-center p-3">
                          <input
                            type="text"
                            value={editExerciseName}
                            onChange={(e) => setEditExerciseName(e.target.value)}
                            className="flex-1 p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            autoFocus
                          />
                          <button
                            onClick={saveExerciseEdit}
                            className="ml-2 text-teal-500 hover:text-teal-400"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={cancelExerciseEdit}
                            className="ml-2 text-red-500 hover:text-red-400"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => setSelectedExercise(exercise)}
                            className="block w-full text-left p-3 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                          >
                            {exercise}
                          </button>
                          <div className="flex space-x-1 p-1 pr-2">
                            <button
                              onClick={() => startEditExercise(exercise)}
                              className="text-blue-500 hover:text-blue-400 p-1"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleRemoveExercise(exercise)}
                              className="text-red-500 hover:text-red-400 p-1"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-600 dark:text-gray-400">
                    No exercises found. Add a custom exercise below.
                  </div>
                )}
              </div>

              <div className="mt-4">
                <h3 className="text-gray-800 dark:text-gray-200 font-medium mb-2">
                  Add Custom Exercise
                </h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Exercise name"
                    value={customExercise}
                    onChange={(e) => setCustomExercise(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={handleAddCustomExercise}
                    className="bg-teal-500 hover:bg-teal-400 text-white p-2 rounded-lg flex-shrink-0"
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                How many sets would you like to add for this exercise?
              </p>

              <div className="space-y-2">
                <label className="text-gray-700 dark:text-gray-300 text-sm">
                  Number of Sets
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={initialSets}
                  onChange={(e) => setInitialSets(e.target.value)}
                  className="w-full p-2 bg-white text-gray-900 rounded-md text-center dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                />
              </div>

              <button
                onClick={handleAddExercise}
                className="w-full p-3 rounded-md text-white font-medium flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600"
              >
                <FaPlus /> Add Exercise
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddExercise;
