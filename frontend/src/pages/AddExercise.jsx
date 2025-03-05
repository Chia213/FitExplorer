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

    const isCardio = selectedCategory === "Cardio";

    onSelectExercise({
      name: selectedExercise,
      initialSets: parseInt(initialSets) || 1,
      category: selectedCategory,
      isCardio,
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md mx-auto rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
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
            <h2 className="text-gray-900 dark:text-white font-semibold">
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
                <input
                  type="text"
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 bg-white text-gray-900 rounded-md pl-10 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <div className="space-y-1 mt-3 max-h-64 overflow-y-auto">
                {filteredExercises.length > 0 ? (
                  filteredExercises.map((exercise) => (
                    <div
                      key={exercise}
                      className="flex items-center justify-between border-b border-gray-300 dark:border-gray-700 py-2"
                    >
                      {editingExercise === exercise ? (
                        <div className="flex items-center w-full">
                          <input
                            type="text"
                            value={editExerciseName}
                            onChange={(e) =>
                              setEditExerciseName(e.target.value)
                            }
                            className="flex-1 p-2 bg-white text-gray-900 rounded-md dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                            autoFocus
                          />
                          <div className="flex ml-2">
                            <button
                              onClick={saveExerciseEdit}
                              className="p-2 text-green-500 hover:text-green-400"
                              title="Save"
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={cancelExerciseEdit}
                              className="p-2 text-red-500 hover:text-red-400"
                              title="Cancel"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => setSelectedExercise(exercise)}
                            className="block flex-grow py-2 text-left px-3 text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white rounded"
                          >
                            {exercise}
                          </button>
                          <div className="flex">
                            <button
                              onClick={() => startEditExercise(exercise)}
                              className="p-2 text-blue-500 hover:text-blue-400"
                              title="Edit exercise"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleRemoveExercise(exercise)}
                              className="p-2 text-red-500 hover:text-red-400"
                              title="Remove exercise"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 mt-2 text-center">
                    No results found
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-300 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Can't find your exercise? Add a custom one:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customExercise}
                    onChange={(e) => setCustomExercise(e.target.value)}
                    placeholder="Add custom exercise"
                    className="flex-1 p-2 bg-white text-gray-900 rounded-md dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
                  />
                  <button
                    onClick={handleAddCustomExercise}
                    disabled={!customExercise.trim()}
                    className={`p-2 rounded-md text-white ${
                      !customExercise.trim()
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-teal-500 hover:bg-teal-600"
                    }`}
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
