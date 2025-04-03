import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import {
  FaPlay,
  FaEdit,
  FaTrash,
  FaChevronDown,
  FaChevronUp,
  FaTimes,
  FaPlus,
  FaSave,
  FaBalanceScale,
  FaFolder,
  FaFolderOpen,
  FaArrowUp,
  FaArrowDown,
  FaFolderPlus,
} from "react-icons/fa";
import AddExercise from "./AddExercise";
import FolderModal from "./FolderModal";
import { notifyRoutineCreated } from '../utils/notificationsHelpers';

const backendURL = "http://localhost:8000";

function Routines() {
  const [routines, setRoutines] = useState([]);
  const [folders, setFolders] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRoutines, setExpandedRoutines] = useState({});
  const [expandedFolders, setExpandedFolders] = useState({});
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [editedRoutineName, setEditedRoutineName] = useState("");
  const [editedExercises, setEditedExercises] = useState([]);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [selectedRoutineForFolder, setSelectedRoutineForFolder] =
    useState(null);
  const [activeView, setActiveView] = useState("all"); // "all" or "folders"
  const [weightUnit, setWeightUnit] = useState(() => {
    return localStorage.getItem("weightUnit") || "kg";
  });
  const [showSaveRoutineModal, setShowSaveRoutineModal] = useState(false);
  const [routineName, setRoutineName] = useState("");
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [savingRoutine, setSavingRoutine] = useState(false);

  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchRoutines(token);
    fetchFolders(token);
  }, [navigate]);

  const toggleWeightUnit = () => {
    const newUnit = weightUnit === "kg" ? "lbs" : "kg";
    setWeightUnit(newUnit);
    localStorage.setItem("weightUnit", newUnit);
  };

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
      setError("Failed to load routines. Please try again.");
      setLoading(false);
    }
  };

  const fetchFolders = async (token) => {
    try {
      const response = await fetch(`${backendURL}/routine-folders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch folders");

      const data = await response.json();
      setFolders(data);
    } catch (err) {}
  };

  const toggleFolderExpand = (folderId) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
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
      setError("Failed to delete routine. Please try again.");
    }
  };

  const handleStartEditRoutine = (routine) => {
    setEditingRoutine(routine);
    setEditedRoutineName(routine.name);
    setEditedExercises(routine.workout?.exercises || routine.exercises || []);
  };

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
            weight_unit: weightUnit,
            folder_id: editingRoutine.folder_id,
            exercises: editedExercises.map((exercise) => ({
              name: exercise.name,
              category: exercise.category || "Uncategorized",
              is_cardio: Boolean(exercise.is_cardio),
              initial_sets: exercise.initial_sets || exercise.sets?.length || 1,
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

      const updatedRoutine = await response.json();
      setRoutines((prev) =>
        prev.map((r) => (r.id === editingRoutine.id ? updatedRoutine : r))
      );

      setEditingRoutine(null);
      setEditedRoutineName("");
      setEditedExercises([]);
    } catch (err) {
      alert("Failed to update routine. Please try again.");
    }
  };

  const handleStartWorkout = (routine) => {
    if (
      !routine ||
      !routine.workout ||
      !routine.workout.exercises ||
      routine.workout.exercises.length === 0
    ) {
      alert("This routine doesn't have any exercises to start a workout.");
      return;
    }

    // Create the workout exercises data structure from the routine
    const workoutExercises = routine.workout.exercises.map((exercise) => {
      const isCardio = Boolean(exercise.is_cardio);
      const initialSets = exercise.initial_sets || exercise.sets?.length || 1;

      // If the exercise already has sets, use those
      if (Array.isArray(exercise.sets) && exercise.sets.length > 0) {
        return {
          name: exercise.name,
          category: exercise.category || "Uncategorized",
          is_cardio: isCardio,
          sets: exercise.sets.map((set) => {
            if (isCardio) {
              return {
                distance: set.distance || "",
                duration: set.duration || "",
                intensity: set.intensity || "",
                notes: set.notes || "",
              };
            } else {
              return {
                weight: set.weight || "",
                reps: set.reps || "",
                notes: set.notes || "",
              };
            }
          }),
        };
      }

      // Otherwise create empty sets based on the exercise type
      const sets = isCardio
        ? Array(initialSets)
            .fill()
            .map(() => ({
              distance: "",
              duration: "",
              intensity: "",
              notes: "",
            }))
        : Array(initialSets)
            .fill()
            .map(() => ({
              weight: "",
              reps: "",
              notes: "",
            }));

      return {
        name: exercise.name,
        category: exercise.category || "Uncategorized",
        is_cardio: isCardio,
        sets: sets,
      };
    });

    // Store the exercise data and workout name in localStorage for WorkoutLog to use
    localStorage.setItem(
      "preloadedWorkoutExercises",
      JSON.stringify(workoutExercises)
    );
    localStorage.setItem("preloadedWorkoutName", routine.name);

    // Navigate to the workout log
    navigate("/workout-log", { state: { routineId: routine.id } });
  };

  const handleRemoveExercise = (indexToRemove) => {
    setEditedExercises((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleAddExerciseClick = () => {
    setShowAddExerciseModal(true);
  };

  const handleSelectExercise = (exercise) => {
    // Create empty sets based on exercise type and initialSets
    const initialSets = exercise.initialSets || 1;

    let sets;
    if (exercise.is_cardio) {
      sets = Array(initialSets)
        .fill()
        .map(() => ({
          distance: "",
          duration: "",
          intensity: "",
          notes: "",
        }));
    } else {
      sets = Array(initialSets)
        .fill()
        .map(() => ({
          weight: "",
          reps: "",
          notes: "",
        }));
    }

    // Add the new exercise to edited exercises
    setEditedExercises([
      ...editedExercises,
      {
        name: exercise.name,
        category: exercise.category || "Uncategorized",
        is_cardio: exercise.is_cardio,
        initial_sets: initialSets,
        sets: sets,
      },
    ]);

    // Close the add exercise modal
    setShowAddExerciseModal(false);
  };

  const openFolderModal = (routineId) => {
    setSelectedRoutineForFolder(routineId);
    setShowFolderModal(true);
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleAssignToFolder = async (routineId, folderId) => {
    try {
      const token = localStorage.getItem("token");

      // Make sure folderId is treated as a proper number or null
      const payload = {
        folder_id: folderId === null ? null : Number(folderId),
      };

      const response = await fetch(
        `${backendURL}/routines/${routineId}/move-to-folder`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to assign routine to folder: ${errorData}`);
      }

      const updatedRoutine = await response.json();

      // Update local state with the updated routine
      setRoutines((prevRoutines) =>
        prevRoutines.map((routine) =>
          routine.id === routineId ? updatedRoutine : routine
        )
      );

      // Set success message
      const folderName = updatedRoutine.folder_name || "Unassigned";
      setSuccessMessage(`Routine successfully moved to "${folderName}"!`);
      await notifyRoutineCreated(updatedRoutine.name);
    } catch (error) {
      alert(`Error assigning routine to folder: ${error.message}`);
    }
  };

  // Format weight with the correct unit
  const formatWeight = (weight, routineUnit = "kg") => {
    if (!weight) return "-";

    // If viewing unit matches stored unit, no conversion needed
    if (weightUnit === routineUnit) {
      return `${weight} ${weightUnit}`;
    }

    // Convert between units
    if (weightUnit === "lbs") {
      return `${(parseFloat(weight) * 2.20462).toFixed(1)} lbs`;
    } else {
      return `${(parseFloat(weight) / 2.20462).toFixed(1)} kg`;
    }
  };

  // Group routines by folder
  const getRoutinesByFolder = () => {
    const grouped = {};

    // Add all folders (even empty ones)
    folders.forEach((folder) => {
      grouped[folder.id] = {
        id: folder.id,
        name: folder.name,
        routines: [],
      };
    });

    // Group routines into folders
    routines.forEach((routine) => {
      if (routine.folder_id !== null && grouped[routine.folder_id]) {
        grouped[routine.folder_id].routines.push(routine);
      }
    });

    return grouped;
  };

  // Get routines not in folders
  const getUnassignedRoutines = () => {
    return routines.filter((routine) => routine.folder_id === null);
  };

  const handleSaveRoutine = async () => {
    if (!routineName.trim()) {
      alert("Please enter a routine name.");
      return;
    }

    setSavingRoutine(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to be logged in to save routines.");
        navigate("/login");
        return;
      }

      const routineData = {
        name: routineName,
        weight_unit: selectedWorkout.weight_unit || "kg",
        exercises: selectedWorkout.exercises.map((exercise) => ({
          name: exercise.name,
          category: exercise.category || "Uncategorized",
          is_cardio: Boolean(exercise.is_cardio),
          initial_sets: exercise.sets?.length || 1,
          sets:
            exercise.sets?.map((set) => {
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
            }) || [],
        })),
      };

      const response = await fetch(`${backendURL}/routines`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(routineData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status}`);
      }

      // Successfully created a new routine
      const newRoutine = await response.json();
      setRoutines((prev) => [...prev, newRoutine]);
      setShowSaveRoutineModal(false);
      await notifyRoutineCreated(routineName);
    } catch (error) {
      alert(`Error saving routine: ${error.message}. Please try again.`);
    } finally {
      setSavingRoutine(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-100"
        } flex items-center justify-center ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-100"
      } ${theme === "dark" ? "text-white" : "text-gray-900"}`}
    >
      {successMessage && (
        <div className="bg-green-500 text-white p-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>
      )}

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Routines</h1>
          <div className="flex space-x-3">
            <div
              className={`${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              } rounded-lg overflow-hidden flex shadow`}
            >
              <button
                onClick={() => setActiveView("all")}
                className={`px-4 py-2 ${
                  activeView === "all"
                    ? "bg-teal-500 text-white"
                    : `${
                        theme === "dark"
                          ? "hover:bg-gray-700"
                          : "hover:bg-gray-100"
                      }`
                }`}
              >
                All Routines
              </button>
              <button
                onClick={() => setActiveView("folders")}
                className={`px-4 py-2 ${
                  activeView === "folders"
                    ? "bg-teal-500 text-white"
                    : `${
                        theme === "dark"
                          ? "hover:bg-gray-700"
                          : "hover:bg-gray-100"
                      }`
                }`}
              >
                By Folder
              </button>
            </div>
            <button
              onClick={toggleWeightUnit}
              className={`flex items-center ${
                theme === "dark"
                  ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              } px-3 py-2 rounded-lg transition-colors`}
            >
              <FaBalanceScale className="mr-2" />
              <span>{weightUnit.toUpperCase()}</span>
            </button>
            <button
              onClick={() => navigate("/workout-log")}
              className="bg-teal-500 hover:bg-teal-600 px-4 py-2 text-white rounded"
            >
              Create New Routine
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>
        )}

        {routines.length === 0 ? (
          <div
            className={`${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            } p-6 rounded-lg text-center shadow`}
          >
            <p
              className={`${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              No routines saved yet
            </p>
            <button
              onClick={() => navigate("/workout-log")}
              className="mt-4 bg-teal-500 hover:bg-teal-600 px-4 py-2 text-white rounded"
            >
              Create First Routine
            </button>
          </div>
        ) : activeView === "all" ? (
          // All routines view
          <div className="space-y-4">
            {routines.map((routine) => (
              <div
                key={routine.id}
                className={`${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                } rounded-lg overflow-hidden shadow`}
              >
                <div
                  className={`p-4 flex justify-between items-center cursor-pointer ${
                    theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50"
                  }`}
                  onClick={() => toggleRoutineExpand(routine.id)}
                >
                  <div>
                    <h2 className="text-xl font-semibold">{routine.name}</h2>
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {routine.workout && routine.workout.exercises
                          ? `${routine.workout.exercises.length} Exercise${
                              routine.workout.exercises.length !== 1 ? "s" : ""
                            }`
                          : "0 Exercises"}
                      </p>
                      {routine.folder_id && (
                        <span className="ml-1 flex items-center text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded-full">
                          <FaFolder className="mr-1" />
                          {folders.find((f) => f.id === routine.folder_id)
                            ?.name || "Folder"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartWorkout(routine);
                      }}
                      className="text-teal-500 hover:text-teal-400"
                      title="Start this routine"
                    >
                      <FaPlay />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openFolderModal(routine.id);
                      }}
                      className="text-yellow-500 hover:text-yellow-400"
                      title="Move to folder"
                    >
                      <FaFolder />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEditRoutine(routine);
                      }}
                      className="text-blue-500 hover:text-blue-400"
                      title="Edit routine"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRoutine(routine.id);
                      }}
                      className="text-red-500 hover:text-red-400"
                      title="Delete routine"
                    >
                      <FaTrash />
                    </button>
                    {expandedRoutines[routine.id] ? (
                      <FaChevronUp
                        className={`${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                    ) : (
                      <FaChevronDown
                        className={`${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                    )}
                  </div>
                </div>

                {expandedRoutines[routine.id] &&
                  routine.workout &&
                  routine.workout.exercises && (
                    <div
                      className={`${
                        theme === "dark" ? "bg-gray-700" : "bg-gray-50"
                      } p-4`}
                    >
                      {routine.workout.exercises.map((exercise, index) => (
                        <div key={index} className="mb-4 last:mb-0">
                          <h3
                            className={`text-lg font-medium mb-2 border-b ${
                              theme === "dark"
                                ? "border-gray-600"
                                : "border-gray-300"
                            } pb-2`}
                          >
                            {exercise.name}
                            <span
                              className={`ml-2 text-sm ${
                                theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }`}
                            >
                              {exercise.is_cardio ? "(Cardio)" : "(Strength)"}
                            </span>
                          </h3>

                          <table className="w-full table-fixed mb-4">
                            <thead>
                              <tr
                                className={`text-left border-b ${
                                  theme === "dark"
                                    ? "border-gray-600"
                                    : "border-gray-300"
                                }`}
                              >
                                <th className="pb-2 w-1/12">Set</th>
                                {exercise.is_cardio ? (
                                  <>
                                    <th className="pb-2 w-1/5 text-center">
                                      Distance
                                    </th>
                                    <th className="pb-2 w-1/5 text-center">
                                      Duration
                                    </th>
                                    <th className="pb-2 w-1/5 text-center">
                                      Intensity
                                    </th>
                                    <th className="pb-2 w-2/5 text-center">
                                      Notes
                                    </th>
                                  </>
                                ) : (
                                  <>
                                    <th className="pb-2 w-1/5 text-center">
                                      Weight
                                    </th>
                                    <th className="pb-2 w-1/5 text-center">
                                      Reps
                                    </th>
                                    <th className="pb-2 w-1/5 text-center">
                                      Notes
                                    </th>
                                  </>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {exercise.sets && exercise.sets.length > 0 ? (
                                exercise.sets.map((set, setIndex) => (
                                  <tr
                                    key={setIndex}
                                    className={`border-b ${
                                      theme === "dark"
                                        ? "border-gray-600"
                                        : "border-gray-300"
                                    } last:border-b-0`}
                                  >
                                    <td className="py-2">{setIndex + 1}</td>
                                    {exercise.is_cardio ? (
                                      <>
                                        <td className="py-2 text-center">
                                          {set.distance
                                            ? `${set.distance} km`
                                            : "-"}
                                        </td>
                                        <td className="py-2 text-center">
                                          {set.duration
                                            ? `${set.duration} min`
                                            : "-"}
                                        </td>
                                        <td className="py-2 text-center">
                                          {set.intensity || "-"}
                                        </td>
                                        <td className="py-2 text-center break-words px-2">
                                          {set.notes || "-"}
                                        </td>
                                      </>
                                    ) : (
                                      <>
                                        <td className="py-2 text-center">
                                          {set.weight
                                            ? formatWeight(
                                                set.weight,
                                                routine.weight_unit
                                              )
                                            : "-"}
                                        </td>
                                        <td className="py-2 text-center">
                                          {set.reps || "-"}
                                        </td>
                                        <td className="py-2 text-center break-words px-2">
                                          {set.notes || "-"}
                                        </td>
                                      </>
                                    )}
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={exercise.is_cardio ? 5 : 4}
                                    className={`py-2 text-center ${
                                      theme === "dark"
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {exercise.is_cardio
                                      ? "No cardio data recorded"
                                      : "No sets recorded"}
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
        ) : (
          // Folder view
          <div className="space-y-6">
            {/* Unassigned routines */}
            <div
              className={`${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              } rounded-lg overflow-hidden shadow`}
            >
              <div
                className={`p-4 flex justify-between items-center cursor-pointer ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                }`}
                onClick={() => toggleFolderExpand("unassigned")}
              >
                <div className="flex items-center">
                  <FaFolderOpen className="mr-2 text-yellow-400" />
                  <h2 className="text-xl font-semibold">Unassigned</h2>
                  <span
                    className={`ml-2 text-sm ${
                      theme === "dark"
                        ? "bg-gray-800 text-gray-300"
                        : "bg-gray-200 text-gray-700"
                    } px-2 py-1 rounded-full`}
                  >
                    {getUnassignedRoutines().length}
                  </span>
                </div>
                <div>
                  {expandedFolders["unassigned"] ? (
                    <FaChevronUp
                      className={`${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                  ) : (
                    <FaChevronDown
                      className={`${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                  )}
                </div>
              </div>

              {expandedFolders["unassigned"] && (
                <div className="p-3">
                  {getUnassignedRoutines().length === 0 ? (
                    <p
                      className={`text-center py-3 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      No unassigned routines
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {getUnassignedRoutines().map((routine) => (
                        <div
                          key={routine.id}
                          className={`${
                            theme === "dark" ? "bg-gray-700" : "bg-gray-50"
                          } p-3 rounded-lg`}
                        >
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">{routine.name}</h3>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleStartWorkout(routine)}
                                className="text-teal-500 hover:text-teal-400"
                                title="Start routine"
                              >
                                <FaPlay />
                              </button>
                              <button
                                onClick={() => openFolderModal(routine.id)}
                                className="text-yellow-500 hover:text-yellow-400"
                                title="Move to folder"
                              >
                                <FaFolder />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Folders */}
            {Object.values(getRoutinesByFolder()).map((folder) => (
              <div
                key={folder.id}
                className={`${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                } rounded-lg overflow-hidden shadow`}
              >
                <div
                  className={`p-4 flex justify-between items-center cursor-pointer ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                  }`}
                  onClick={() => toggleFolderExpand(folder.id)}
                >
                  <div className="flex items-center">
                    <FaFolderOpen className="mr-2 text-yellow-400" />
                    <h2 className="text-xl font-semibold">{folder.name}</h2>
                    <span
                      className={`ml-2 text-sm ${
                        theme === "dark"
                          ? "bg-gray-800 text-gray-300"
                          : "bg-gray-200 text-gray-700"
                      } px-2 py-1 rounded-full`}
                    >
                      {folder.routines.length}
                    </span>
                  </div>
                  <div>
                    {expandedFolders[folder.id] ? (
                      <FaChevronUp
                        className={`${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                    ) : (
                      <FaChevronDown
                        className={`${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                    )}
                  </div>
                </div>

                {expandedFolders[folder.id] && (
                  <div className="p-3">
                    {folder.routines.length === 0 ? (
                      <p
                        className={`text-center py-3 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        No routines in this folder
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {folder.routines.map((routine) => (
                          <div
                            key={routine.id}
                            className={`${
                              theme === "dark" ? "bg-gray-700" : "bg-gray-50"
                            } p-3 rounded-lg`}
                          >
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium">{routine.name}</h3>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleStartWorkout(routine)}
                                  className="text-teal-500 hover:text-teal-400"
                                  title="Start routine"
                                >
                                  <FaPlay />
                                </button>
                                <button
                                  onClick={() => openFolderModal(routine.id)}
                                  className="text-yellow-500 hover:text-yellow-400"
                                  title="Move to different folder"
                                >
                                  <FaFolder />
                                </button>
                                <button
                                  onClick={() =>
                                    handleStartEditRoutine(routine)
                                  }
                                  className="text-blue-500 hover:text-blue-400"
                                  title="Edit routine"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteRoutine(routine.id)
                                  }
                                  className="text-red-500 hover:text-red-400"
                                  title="Delete routine"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
          <div
            className={`${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            } rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
          >
            <div
              className={`flex justify-between items-center p-4 border-b ${
                theme === "dark" ? "border-gray-700" : "border-gray-300"
              }`}
            >
              <h2 className="text-xl font-bold">Edit Routine</h2>
              <button
                onClick={() => setEditingRoutine(null)}
                className={`${
                  theme === "dark"
                    ? "text-gray-400 hover:text-gray-300"
                    : "text-gray-500 hover:text-gray-700"
                }`}
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
                  className={`w-full ${
                    theme === "dark"
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-gray-100 text-gray-900 border-gray-300"
                  } rounded p-2 border`}
                  placeholder="Enter routine name"
                />
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Exercises</h3>
                  <button
                    onClick={handleAddExerciseClick}
                    className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded flex items-center"
                  >
                    <FaPlus className="mr-2" /> Add Exercise
                  </button>
                </div>

                {editedExercises.length === 0 ? (
                  <div
                    className={`text-center ${
                      theme === "dark"
                        ? "text-gray-400 bg-gray-700"
                        : "text-gray-500 bg-gray-100"
                    } py-4 rounded`}
                  >
                    No exercises in this routine
                  </div>
                ) : (
                  <div className="space-y-4">
                    {editedExercises.map((exercise, exerciseIndex) => (
                      <div
                        key={exerciseIndex}
                        className={`${
                          theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                        } p-3 rounded`}
                      >
                        <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-600">
                          <div className="flex items-center">
                            <span className="font-medium">{exercise.name}</span>
                            <span
                              className={`ml-2 text-sm ${
                                theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }`}
                            >
                              {exercise.is_cardio ? "Cardio" : "Strength"}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                // Handle move up
                                if (exerciseIndex > 0) {
                                  const newExercises = [...editedExercises];
                                  [
                                    newExercises[exerciseIndex],
                                    newExercises[exerciseIndex - 1],
                                  ] = [
                                    newExercises[exerciseIndex - 1],
                                    newExercises[exerciseIndex],
                                  ];
                                  setEditedExercises(newExercises);
                                }
                              }}
                              disabled={exerciseIndex === 0}
                              className={`${
                                exerciseIndex === 0
                                  ? "text-gray-400"
                                  : "text-teal-500 hover:text-teal-400"
                              }`}
                            >
                              <FaArrowUp />
                            </button>
                            <button
                              onClick={() => {
                                // Handle move down
                                if (
                                  exerciseIndex <
                                  editedExercises.length - 1
                                ) {
                                  const newExercises = [...editedExercises];
                                  [
                                    newExercises[exerciseIndex],
                                    newExercises[exerciseIndex + 1],
                                  ] = [
                                    newExercises[exerciseIndex + 1],
                                    newExercises[exerciseIndex],
                                  ];
                                  setEditedExercises(newExercises);
                                }
                              }}
                              disabled={
                                exerciseIndex === editedExercises.length - 1
                              }
                              className={`${
                                exerciseIndex === editedExercises.length - 1
                                  ? "text-gray-400"
                                  : "text-teal-500 hover:text-teal-400"
                              }`}
                            >
                              <FaArrowDown />
                            </button>
                            <button
                              onClick={() =>
                                handleRemoveExercise(exerciseIndex)
                              }
                              className="text-red-500 hover:text-red-400"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>

                        {/* Sets Table */}
                        <div className="mt-2">
                          <table className="w-full table-fixed">
                            <thead>
                              <tr
                                className={`border-b ${
                                  theme === "dark"
                                    ? "border-gray-600"
                                    : "border-gray-300"
                                }`}
                              >
                                <th className="pb-2 text-left w-1/12">Set</th>
                                {exercise.is_cardio ? (
                                  <>
                                    <th className="pb-2 text-center w-1/5">
                                      Distance
                                    </th>
                                    <th className="pb-2 text-center w-1/5">
                                      Duration
                                    </th>
                                    <th className="pb-2 text-center w-1/5">
                                      Intensity
                                    </th>
                                    <th className="pb-2 text-center w-2/5">
                                      Notes
                                    </th>
                                  </>
                                ) : (
                                  <>
                                    <th className="pb-2 text-center w-1/5">
                                      Weight
                                    </th>
                                    <th className="pb-2 text-center w-1/5">
                                      Reps
                                    </th>
                                    <th className="pb-2 text-center w-2/5">
                                      Notes
                                    </th>
                                  </>
                                )}
                                <th className="pb-2 w-1/12"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {exercise.sets.map((set, setIndex) => (
                                <tr
                                  key={setIndex}
                                  className={`border-b ${
                                    theme === "dark"
                                      ? "border-gray-600"
                                      : "border-gray-300"
                                  } last:border-b-0`}
                                >
                                  <td className="py-2">{setIndex + 1}</td>
                                  {exercise.is_cardio ? (
                                    <>
                                      <td className="py-2 px-1">
                                        <input
                                          type="number"
                                          value={set.distance || ""}
                                          onChange={(e) => {
                                            const newExercises = [
                                              ...editedExercises,
                                            ];
                                            newExercises[exerciseIndex].sets[
                                              setIndex
                                            ].distance = e.target.value;
                                            setEditedExercises(newExercises);
                                          }}
                                          className={`w-full text-center ${
                                            theme === "dark"
                                              ? "bg-gray-600 text-white"
                                              : "bg-white text-gray-800"
                                          } rounded p-1 text-sm`}
                                          placeholder="km"
                                        />
                                      </td>
                                      <td className="py-2 px-1">
                                        <input
                                          type="number"
                                          value={set.duration || ""}
                                          onChange={(e) => {
                                            const newExercises = [
                                              ...editedExercises,
                                            ];
                                            newExercises[exerciseIndex].sets[
                                              setIndex
                                            ].duration = e.target.value;
                                            setEditedExercises(newExercises);
                                          }}
                                          className={`w-full text-center ${
                                            theme === "dark"
                                              ? "bg-gray-600 text-white"
                                              : "bg-white text-gray-800"
                                          } rounded p-1 text-sm`}
                                          placeholder="min"
                                        />
                                      </td>
                                      <td className="py-2 px-1">
                                        <select
                                          value={set.intensity || ""}
                                          onChange={(e) => {
                                            const newExercises = [
                                              ...editedExercises,
                                            ];
                                            newExercises[exerciseIndex].sets[
                                              setIndex
                                            ].intensity = e.target.value;
                                            setEditedExercises(newExercises);
                                          }}
                                          className={`w-full text-center ${
                                            theme === "dark"
                                              ? "bg-gray-600 text-white"
                                              : "bg-white text-gray-800"
                                          } rounded p-1 text-sm`}
                                        >
                                          <option value="">Select</option>
                                          <option value="Low">Low</option>
                                          <option value="Medium">Medium</option>
                                          <option value="High">High</option>
                                          <option value="Very High">
                                            Very High
                                          </option>
                                        </select>
                                      </td>
                                      <td className="py-2 px-1">
                                        <input
                                          type="text"
                                          value={set.notes || ""}
                                          onChange={(e) => {
                                            const newExercises = [
                                              ...editedExercises,
                                            ];
                                            newExercises[exerciseIndex].sets[
                                              setIndex
                                            ].notes = e.target.value;
                                            setEditedExercises(newExercises);
                                          }}
                                          className={`w-full ${
                                            theme === "dark"
                                              ? "bg-gray-600 text-white"
                                              : "bg-white text-gray-800"
                                          } rounded p-1 text-sm`}
                                          placeholder="Notes"
                                        />
                                      </td>
                                    </>
                                  ) : (
                                    <>
                                      <td className="py-2 px-1">
                                        <input
                                          type="number"
                                          value={set.weight || ""}
                                          onChange={(e) => {
                                            const newExercises = [
                                              ...editedExercises,
                                            ];
                                            newExercises[exerciseIndex].sets[
                                              setIndex
                                            ].weight = e.target.value;
                                            setEditedExercises(newExercises);
                                          }}
                                          className={`w-full text-center ${
                                            theme === "dark"
                                              ? "bg-gray-600 text-white"
                                              : "bg-white text-gray-800"
                                          } rounded p-1 text-sm`}
                                          placeholder={weightUnit}
                                        />
                                      </td>
                                      <td className="py-2 px-1">
                                        <input
                                          type="number"
                                          value={set.reps || ""}
                                          onChange={(e) => {
                                            const newExercises = [
                                              ...editedExercises,
                                            ];
                                            newExercises[exerciseIndex].sets[
                                              setIndex
                                            ].reps = e.target.value;
                                            setEditedExercises(newExercises);
                                          }}
                                          className={`w-full text-center ${
                                            theme === "dark"
                                              ? "bg-gray-600 text-white"
                                              : "bg-white text-gray-800"
                                          } rounded p-1 text-sm`}
                                          placeholder="reps"
                                        />
                                      </td>
                                      <td className="py-2 px-1">
                                        <input
                                          type="text"
                                          value={set.notes || ""}
                                          onChange={(e) => {
                                            const newExercises = [
                                              ...editedExercises,
                                            ];
                                            newExercises[exerciseIndex].sets[
                                              setIndex
                                            ].notes = e.target.value;
                                            setEditedExercises(newExercises);
                                          }}
                                          className={`w-full ${
                                            theme === "dark"
                                              ? "bg-gray-600 text-white"
                                              : "bg-white text-gray-800"
                                          } rounded p-1 text-sm`}
                                          placeholder="Notes"
                                        />
                                      </td>
                                    </>
                                  )}
                                  <td className="py-2 text-center">
                                    <button
                                      onClick={() => {
                                        const newExercises = [
                                          ...editedExercises,
                                        ];
                                        newExercises[exerciseIndex].sets.splice(
                                          setIndex,
                                          1
                                        );
                                        setEditedExercises(newExercises);
                                      }}
                                      className="text-red-500 hover:text-red-400"
                                      disabled={exercise.sets.length <= 1}
                                    >
                                      <FaTrash />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {/* Add Set Button */}
                          <button
                            onClick={() => {
                              const newExercises = [...editedExercises];
                              const newSet = exercise.is_cardio
                                ? {
                                    distance: "",
                                    duration: "",
                                    intensity: "",
                                    notes: "",
                                  }
                                : { weight: "", reps: "", notes: "" };
                              newExercises[exerciseIndex].sets.push(newSet);
                              setEditedExercises(newExercises);
                            }}
                            className="mt-2 text-teal-500 hover:text-teal-400 flex items-center text-sm"
                          >
                            <FaPlus className="mr-1" /> Add Set
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleSaveEditedRoutine}
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-2 rounded flex items-center justify-center"
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

      {/* Add Exercise Modal */}
      {showAddExerciseModal && (
        <AddExercise
          onClose={() => setShowAddExerciseModal(false)}
          onSelectExercise={handleSelectExercise}
        />
      )}

      {/* Folder Modal */}
      {showFolderModal && (
        <FolderModal
          isOpen={showFolderModal}
          onClose={() => setShowFolderModal(false)}
          onSelectFolder={handleAssignToFolder}
          selectedRoutineId={selectedRoutineForFolder}
        />
      )}
    </div>
  );
}

export default Routines;
