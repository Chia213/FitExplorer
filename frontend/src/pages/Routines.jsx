import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlay,
  FaEdit,
  FaTrash,
  FaChevronDown,
  FaChevronUp,
  FaTimes,
  FaPlus,
  FaSave,
} from "react-icons/fa";

const backendURL = "http://localhost:8000";

function Routines() {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRoutines, setExpandedRoutines] = useState({});
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [editedRoutineName, setEditedRoutineName] = useState("");
  const [editedExercises, setEditedExercises] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchRoutines(token);
  }, [navigate]);

  const fetchRoutines = async (token) => {
    try {
      const response = await fetch(`${backendURL}/routines`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch routines");

      const data = await response.json();
      console.log("Fetched Routines:", data);
      setRoutines(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching routines:", err);
      setError("Failed to load routines. Please try again.");
      setLoading(false);
    }
  };

  const toggleRoutineExpand = (routineId) => {
    setExpandedRoutines((prev) => ({
      ...prev,
      [routineId]: !prev[routineId],
    }));
  };

  const handleDeleteRoutine = async (routineId) => {
    if (!window.confirm("Are you sure you want to delete this routine?"))
      return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendURL}/routines/${routineId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete routine");

      setRoutines(routines.filter((r) => r.id !== routineId));
    } catch (err) {
      console.error("Error deleting routine:", err);
      setError("Failed to delete routine. Please try again.");
    }
  };

  const handleStartEditRoutine = (routine) => {
    setEditingRoutine(routine);
    setEditedRoutineName(routine.name);
    setEditedExercises(routine.workout?.exercises || routine.exercises || []);
  };

  // In Routines.jsx, update the handleSaveEditedRoutine function to include set details

  const handleSaveEditedRoutine = async () => {
    // Basic validation
    if (!editedRoutineName.trim()) {
      alert("Routine name cannot be empty");
      return;
    }
  
    if (editedExercises.length === 0) {
      alert("Routine must have at least one exercise");
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${backendURL}/routines/${editingRoutine.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editedRoutineName,
            exercises: editedExercises.map((exercise) => ({
              name: exercise.name,
              category: exercise.category || "Uncategorized",
              is_cardio: Boolean(exercise.is_cardio),
              initial_sets: exercise.initial_sets || exercise.sets?.length || 1,
              // Add this to include set information
              sets: Array.isArray(exercise.sets)
                ? exercise.sets.map((set) => {
                    if (exercise.is_cardio) {
                      return {
                        distance: set.distance || null,
                        duration: set.duration || null,
                        intensity: set.intensity || "",
                        notes: set.notes || "",
                      };
                    } else {
                      return {
                        weight: set.weight || null,
                        reps: set.reps || null,
                        notes: set.notes || "",
                      };
                    }
                  })
                : [],
            })),
          }),
        }
      );
  
      if (!response.ok) throw new Error("Failed to update routine");
  
      // Update the routine in the list
      const updatedRoutine = await response.json();
      setRoutines((prev) =>
        prev.map((r) => (r.id === editingRoutine.id ? updatedRoutine : r))
      );
  
      // Close the editing modal
      setEditingRoutine(null);
      setEditedRoutineName("");
      setEditedExercises([]);
    } catch (err) {
      console.error("Error updating routine:", err);
      alert("Failed to update routine. Please try again.");
    }
  };
  const handleStartWorkout = (routine) => {
    localStorage.setItem("activeWorkout", JSON.stringify(routine));
    navigate("/workout-log", { state: { routineId: routine.id } });
  };

  const handleRemoveExercise = (indexToRemove) => {
    setEditedExercises((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleAddExercise = () => {
    navigate("/workout-log", {
      state: {
        editingRoutineId: editingRoutine.id,
        routineName: editedRoutineName,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1E293B] flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E293B] text-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Routines</h1>
          <button
            onClick={() => navigate("/workout-log")}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
          >
            Create New Routine
          </button>
        </div>

        {error && (
          <div className="bg-red-600 text-white p-3 rounded mb-4">{error}</div>
        )}

        {routines.length === 0 ? (
          <div className="bg-[#334155] p-6 rounded-lg text-center">
            <p className="text-gray-400">No routines saved yet</p>
            <button
              onClick={() => navigate("/workout-log")}
              className="mt-4 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
            >
              Create First Routine
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {routines.map((routine) => (
              <div
                key={routine.id}
                className="bg-[#334155] rounded-lg overflow-hidden"
              >
                <div
                  className="p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleRoutineExpand(routine.id)}
                >
                  <div>
                    <h2 className="text-xl font-semibold">{routine.name}</h2>
                    <p className="text-sm text-gray-400">
                      {routine.workout && routine.workout.exercises
                        ? `${routine.workout.exercises.length} Exercise${
                            routine.workout.exercises.length !== 1 ? "s" : ""
                          }`
                        : "0 Exercises"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartWorkout(routine);
                      }}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <FaPlay />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEditRoutine(routine);
                      }}
                      className="text-green-400 hover:text-green-300"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRoutine(routine.id);
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <FaTrash />
                    </button>
                    {expandedRoutines[routine.id] ? (
                      <FaChevronUp className="text-gray-400" />
                    ) : (
                      <FaChevronDown className="text-gray-400" />
                    )}
                  </div>
                </div>

                {expandedRoutines[routine.id] &&
  routine.workout &&
  routine.workout.exercises && (
    <div className="bg-[#2C3E50] p-4">
      {routine.workout.exercises.map((exercise, index) => (
        <div key={index} className="mb-4 last:mb-0">
          <h3 className="text-lg font-medium text-white mb-2 border-b border-gray-700 pb-2">
            {exercise.name}
            <span className="ml-2 text-sm text-gray-400">
              {exercise.is_cardio ? "(Cardio)" : "(Strength)"}
            </span>
          </h3>
          
          <table className="w-full table-fixed mb-4">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-2 w-1/8">Set</th>
                {exercise.is_cardio ? (
                  <>
                    <th className="pb-2 w-1/4 text-center">Distance</th>
                    <th className="pb-2 w-1/4 text-center">Duration</th>
                    <th className="pb-2 w-1/4 text-center">Intensity</th>
                  </>
                ) : (
                  <>
                    <th className="pb-2 w-3/8 text-center">Weight</th>
                    <th className="pb-2 w-3/8 text-center">Reps</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {exercise.sets && exercise.sets.length > 0 ? (
                exercise.sets.map((set, setIndex) => (
                  <tr
                    key={setIndex}
                    className="border-b border-gray-700 last:border-b-0"
                  >
                    <td className="py-2">{setIndex + 1}</td>
                    {exercise.is_cardio ? (
                      <>
                        <td className="py-2 text-center">
                          {set.distance ? `${set.distance} km` : "-"}
                        </td>
                        <td className="py-2 text-center">
                          {set.duration ? `${set.duration} min` : "-"}
                        </td>
                        <td className="py-2 text-center">
                          {set.intensity || "-"}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 text-center">
                          {set.weight ? `${set.weight} kg` : "-"}
                        </td>
                        <td className="py-2 text-center">
                          {set.reps || "-"}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={exercise.is_cardio ? 4 : 3} className="py-2 text-center text-gray-400">
                    {exercise.is_cardio ? 
                      "No cardio data recorded" : 
                      "No sets recorded"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Routine Modal */}
      {editingRoutine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#334155] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold">Edit Routine</h2>
              <button
                onClick={() => setEditingRoutine(null)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm mb-2">Routine Name</label>
                <input
                  type="text"
                  value={editedRoutineName}
                  onChange={(e) => setEditedRoutineName(e.target.value)}
                  className="w-full bg-[#2C3E50] rounded p-2 text-white"
                  placeholder="Enter routine name"
                />
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Exercises</h3>
                  <button
                    onClick={handleAddExercise}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center"
                  >
                    <FaPlus className="mr-2" /> Add Exercise
                  </button>
                </div>

                {editedExercises.length === 0 ? (
                  <div className="text-center text-gray-400 py-4">
                    No exercises in this routine
                  </div>
                ) : (
                  <div className="space-y-2">
                    {editedExercises.map((exercise, index) => (
                      <div
                        key={index}
                        className="bg-[#2C3E50] p-3 rounded flex justify-between items-center"
                      >
                        <div>
                          <span className="font-medium">{exercise.name}</span>
                          <span className="ml-2 text-sm text-gray-400">
                            {exercise.is_cardio ? "Cardio" : "Strength"}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveExercise(index)}
                          className="text-red-400 hover:text-red-500"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleSaveEditedRoutine}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded flex items-center justify-center"
                >
                  <FaSave className="mr-2" /> Save Routine
                </button>
                <button
                  onClick={() => setEditingRoutine(null)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Routines;
