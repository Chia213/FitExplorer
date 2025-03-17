import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlay,
  FaEdit,
  FaTrash,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

const backendURL = "http://localhost:8000";

function Routines() {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRoutines, setExpandedRoutines] = useState({});

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

  const handleStartWorkout = (routine) => {
    if (!routine || !routine.workout || !routine.workout.exercises) {
      alert("This routine doesn't have any exercises.");
      return;
    }

    // Convert routine exercises to a format compatible with workout log
    const workoutExercises = routine.workout.exercises.map(exercise => {
      const initialSets = exercise.initial_sets || 1;
      
      if (exercise.is_cardio) {
        const cardioSets = Array(initialSets).fill().map(() => ({
          distance: "",
          duration: "",
          intensity: "",
          notes: ""
        }));
        
        return {
          name: exercise.name,
          category: exercise.category || "Uncategorized",
          is_cardio: true,
          sets: cardioSets
        };
      } else {
        const sets = Array(initialSets).fill().map(() => ({
          weight: "",
          reps: "",
          notes: ""
        }));
        
        return {
          name: exercise.name,
          category: exercise.category || "Uncategorized",
          is_cardio: false,
          sets: sets
        };
      }
    });

    // Store the exercises in localStorage for the workout log to pick up
    localStorage.setItem("preloadedWorkoutExercises", JSON.stringify(workoutExercises));
    localStorage.setItem("preloadedWorkoutName", routine.name);

    navigate("/workout-log");
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
                        // Implement edit functionality
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
                      <table className="w-full">
                        <thead>
                          <tr className="text-left border-b border-gray-700">
                            <th className="pb-2">Exercise</th>
                            <th className="pb-2">Sets</th>
                            <th className="pb-2">Reps/Weight</th>
                          </tr>
                        </thead>
                        <tbody>
                          {routine.workout.exercises.map((exercise, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-700 last:border-b-0"
                            >
                              <td className="py-2">{exercise.name}</td>
                              <td className="py-2">
                                {exercise.sets.length} Sets
                              </td>
                              <td className="py-2">
                                {exercise.sets.map((set, setIndex) => (
                                  <div key={setIndex}>
                                    {set.weight ? `${set.weight} kg` : ""}
                                    {set.reps ? `${set.reps} reps` : ""}
                                  </div>
                                ))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Routines;
