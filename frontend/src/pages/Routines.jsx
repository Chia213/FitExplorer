import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaPlay,
  FaEllipsisV,
  FaDumbbell,
} from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const backendURL = "http://localhost:8000";

function Routines() {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeRoutine, setActiveRoutine] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedRoutine, setEditedRoutine] = useState(null);

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
      setRoutines(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching routines:", err);
      setError("Failed to load routines. Please try again.");
      setLoading(false);
    }
  };

  const handleViewRoutine = (routine) => {
    setActiveRoutine(routine);
  };

  const handleEditRoutine = (routine) => {
    setEditedRoutine({ ...routine });
    setIsEditMode(true);
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
      if (activeRoutine && activeRoutine.id === routineId) {
        setActiveRoutine(null);
      }
    } catch (err) {
      console.error("Error deleting routine:", err);
      setError("Failed to delete routine. Please try again.");
    }
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${backendURL}/routines/${editedRoutine.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedRoutine),
        }
      );

      if (!response.ok) throw new Error("Failed to update routine");

      const updatedRoutine = await response.json();
      setRoutines(
        routines.map((r) => (r.id === updatedRoutine.id ? updatedRoutine : r))
      );

      if (activeRoutine && activeRoutine.id === updatedRoutine.id) {
        setActiveRoutine(updatedRoutine);
      }

      setIsEditMode(false);
      setEditedRoutine(null);
    } catch (err) {
      console.error("Error updating routine:", err);
      setError("Failed to update routine. Please try again.");
    }
  };

  const handleExerciseReorder = (result) => {
    if (!result.destination) return;

    const reorderedExercises = Array.from(editedRoutine.exercises);
    const [removed] = reorderedExercises.splice(result.source.index, 1);
    reorderedExercises.splice(result.destination.index, 0, removed);

    setEditedRoutine({
      ...editedRoutine,
      exercises: reorderedExercises,
    });
  };

  const handleStartWorkout = (routine) => {
    localStorage.setItem("activeWorkout", JSON.stringify(routine));
    navigate("/workout-log", { state: { routineId: routine.id } });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading routines...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold">My Routines</h1>
          <Link
            to="/workout-log"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FaPlus className="mr-2" /> Create New Routine
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {routines.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
            <FaDumbbell className="text-5xl mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">No Routines Yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Save your favorite workouts as routines to quickly access them
              later.
            </p>
            <Link
              to="/workout-log"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center"
            >
              <FaPlus className="mr-2" /> Create Your First Routine
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routines.map((routine) => (
              <div
                key={routine.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h2 className="text-xl font-semibold">{routine.name}</h2>
                  <div className="relative">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewRoutine(routine)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="View Routine"
                      >
                        <FaPlay />
                      </button>
                      <button
                        onClick={() => handleEditRoutine(routine)}
                        className="text-green-600 hover:text-green-800 p-1"
                        title="Edit Routine"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteRoutine(routine.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete Routine"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {routine.exercises.length} exercise
                    {routine.exercises.length !== 1 ? "s" : ""}
                  </div>
                  <div className="space-y-1 mb-4">
                    {routine.exercises.slice(0, 3).map((exercise, index) => (
                      <div key={index} className="text-sm">
                        • {exercise.name}
                      </div>
                    ))}
                    {routine.exercises.length > 3 && (
                      <div className="text-sm text-gray-500">
                        +{routine.exercises.length - 3} more...
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleStartWorkout(routine)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center"
                  >
                    <FaPlay className="mr-2" /> Start Workout
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View Routine Modal */}
        {activeRoutine && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold">{activeRoutine.name}</h2>
                <button
                  onClick={() => setActiveRoutine(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <div className="p-4">
                <div className="space-y-4 mb-6">
                  {activeRoutine.exercises.map((exercise, index) => (
                    <div
                      key={index}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="font-medium">{exercise.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {exercise.sets} sets × {exercise.reps} reps
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleStartWorkout(activeRoutine)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center"
                  >
                    <FaPlay className="mr-2" /> Start Workout
                  </button>
                  <button
                    onClick={() => {
                      handleEditRoutine(activeRoutine);
                      setActiveRoutine(null);
                    }}
                    className="bg-gray-200 dark:bg-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    <FaEdit />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isEditMode && editedRoutine && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <input
                  type="text"
                  value={editedRoutine.name}
                  onChange={(e) =>
                    setEditedRoutine({ ...editedRoutine, name: e.target.value })
                  }
                  className="text-xl font-bold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => {
                    setIsEditMode(false);
                    setEditedRoutine(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <div className="p-4">
                <DragDropContext onDragEnd={handleExerciseReorder}>
                  <Droppable droppableId="exercises">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4 mb-6"
                      >
                        {editedRoutine.exercises.map((exercise, index) => (
                          <Draggable
                            key={exercise.id || index}
                            draggableId={String(exercise.id || index)}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center"
                              >
                                <div
                                  {...provided.dragHandleProps}
                                  className="mr-3 cursor-move text-gray-500"
                                >
                                  <FaEllipsisV />
                                </div>
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    value={exercise.name}
                                    onChange={(e) => {
                                      const updatedExercises = [
                                        ...editedRoutine.exercises,
                                      ];
                                      updatedExercises[index].name =
                                        e.target.value;
                                      setEditedRoutine({
                                        ...editedRoutine,
                                        exercises: updatedExercises,
                                      });
                                    }}
                                    className="font-medium bg-transparent focus:outline-none focus:border-b border-gray-300 dark:border-gray-600 w-full"
                                  />
                                  <div className="flex space-x-4 mt-2">
                                    <div className="flex items-center">
                                      <span className="text-sm mr-2">
                                        Sets:
                                      </span>
                                      <input
                                        type="number"
                                        min="1"
                                        value={exercise.sets}
                                        onChange={(e) => {
                                          const updatedExercises = [
                                            ...editedRoutine.exercises,
                                          ];
                                          updatedExercises[index].sets =
                                            parseInt(e.target.value) || 1;
                                          setEditedRoutine({
                                            ...editedRoutine,
                                            exercises: updatedExercises,
                                          });
                                        }}
                                        className="w-12 text-center bg-gray-100 dark:bg-gray-700 rounded p-1"
                                      />
                                    </div>
                                    <div className="flex items-center">
                                      <span className="text-sm mr-2">
                                        Reps:
                                      </span>
                                      <input
                                        type="text"
                                        value={exercise.reps}
                                        onChange={(e) => {
                                          const updatedExercises = [
                                            ...editedRoutine.exercises,
                                          ];
                                          updatedExercises[index].reps =
                                            e.target.value;
                                          setEditedRoutine({
                                            ...editedRoutine,
                                            exercises: updatedExercises,
                                          });
                                        }}
                                        className="w-16 text-center bg-gray-100 dark:bg-gray-700 rounded p-1"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    const updatedExercises = [
                                      ...editedRoutine.exercises,
                                    ];
                                    updatedExercises.splice(index, 1);
                                    setEditedRoutine({
                                      ...editedRoutine,
                                      exercises: updatedExercises,
                                    });
                                  }}
                                  className="text-red-500 hover:text-red-700 ml-2"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                <button
                  onClick={() => {
                    setEditedRoutine({
                      ...editedRoutine,
                      exercises: [
                        ...editedRoutine.exercises,
                        { name: "", sets: 3, reps: "10-12" },
                      ],
                    });
                  }}
                  className="mb-6 px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 w-full"
                >
                  + Add Exercise
                </button>

                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditMode(false);
                      setEditedRoutine(null);
                    }}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Routines;
