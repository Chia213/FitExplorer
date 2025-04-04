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
  FaFilter,
  FaSort,
  FaSearch,
  FaExclamationTriangle,
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
  const [filterOptions, setFilterOptions] = useState({
    search: "",
    lastUpdated: "all", // all, today, week, month
    exerciseCount: "all", // all, none, 1-3, 4-6, 7+
    type: "all", // all, cardio, strength, mixed
    sortBy: "updated", // updated, created, name, exercises
    sortOrder: "desc", // asc, desc
  });
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

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

  // Add filter functions
  const filterRoutines = (routines) => {
    return routines.filter(routine => {
      // Search filter
      if (filterOptions.search && !routine.name.toLowerCase().includes(filterOptions.search.toLowerCase())) {
        return false;
      }

      // Last Updated filter
      if (filterOptions.lastUpdated !== "all") {
        const lastUpdated = new Date(routine.updated_at || routine.created_at);
        const now = new Date();
        switch (filterOptions.lastUpdated) {
          case "today":
            if (lastUpdated.toDateString() !== now.toDateString()) return false;
            break;
          case "week":
            const weekAgo = new Date(now.setDate(now.getDate() - 7));
            if (lastUpdated < weekAgo) return false;
            break;
          case "month":
            const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
            if (lastUpdated < monthAgo) return false;
            break;
        }
      }

      // Exercise Count filter
      const exerciseCount = routine.workout?.exercises?.length || 0;
      if (filterOptions.exerciseCount !== "all") {
        switch (filterOptions.exerciseCount) {
          case "none":
            if (exerciseCount !== 0) return false;
            break;
          case "1-3":
            if (exerciseCount < 1 || exerciseCount > 3) return false;
            break;
          case "4-6":
            if (exerciseCount < 4 || exerciseCount > 6) return false;
            break;
          case "7+":
            if (exerciseCount < 7) return false;
            break;
        }
      }

      // Type filter
      if (filterOptions.type !== "all") {
        const hasCardio = routine.workout?.exercises?.some(e => e.is_cardio);
        const hasStrength = routine.workout?.exercises?.some(e => !e.is_cardio);
        switch (filterOptions.type) {
          case "cardio":
            if (!hasCardio || hasStrength) return false;
            break;
          case "strength":
            if (hasCardio || !hasStrength) return false;
            break;
          case "mixed":
            if (!hasCardio || !hasStrength) return false;
            break;
        }
      }

      return true;
    }).sort((a, b) => {
      switch (filterOptions.sortBy) {
        case "updated":
          return filterOptions.sortOrder === "desc"
            ? new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
            : new Date(a.updated_at || a.created_at) - new Date(b.updated_at || b.created_at);
        case "created":
          return filterOptions.sortOrder === "desc"
            ? new Date(b.created_at) - new Date(a.created_at)
            : new Date(a.created_at) - new Date(b.created_at);
        case "name":
          return filterOptions.sortOrder === "desc"
            ? b.name.localeCompare(a.name)
            : a.name.localeCompare(b.name);
        case "exercises":
          const aCount = a.workout?.exercises?.length || 0;
          const bCount = b.workout?.exercises?.length || 0;
          return filterOptions.sortOrder === "desc"
            ? bCount - aCount
            : aCount - bCount;
        default:
          return 0;
      }
    });
  };

  // Add the filter UI right after the header buttons
  const renderFilterBar = () => (
    <div className={`mb-4 p-4 ${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-lg shadow`}>
      <div className="flex flex-wrap gap-4 items-center">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
            <input
              type="text"
              placeholder="Search routines..."
              value={filterOptions.search}
              onChange={(e) => setFilterOptions(prev => ({ ...prev, search: e.target.value }))}
              className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                theme === "dark" 
                  ? "bg-gray-700 text-white border-gray-600" 
                  : "bg-gray-100 text-gray-900 border-gray-300"
              } border`}
            />
          </div>
        </div>

        {/* Last Updated Filter */}
        <select
          value={filterOptions.lastUpdated}
          onChange={(e) => setFilterOptions(prev => ({ ...prev, lastUpdated: e.target.value }))}
          className={`rounded-lg px-3 py-2 ${
            theme === "dark"
              ? "bg-gray-700 text-white border-gray-600"
              : "bg-gray-100 text-gray-900 border-gray-300"
          } border`}
        >
          <option value="all">All Time</option>
          <option value="today">Updated Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
        </select>

        {/* Exercise Count Filter */}
        <select
          value={filterOptions.exerciseCount}
          onChange={(e) => setFilterOptions(prev => ({ ...prev, exerciseCount: e.target.value }))}
          className={`rounded-lg px-3 py-2 ${
            theme === "dark"
              ? "bg-gray-700 text-white border-gray-600"
              : "bg-gray-100 text-gray-900 border-gray-300"
          } border`}
        >
          <option value="all">Any Exercises</option>
          <option value="none">No Exercises</option>
          <option value="1-3">1-3 Exercises</option>
          <option value="4-6">4-6 Exercises</option>
          <option value="7+">7+ Exercises</option>
        </select>

        {/* Type Filter */}
        <select
          value={filterOptions.type}
          onChange={(e) => setFilterOptions(prev => ({ ...prev, type: e.target.value }))}
          className={`rounded-lg px-3 py-2 ${
            theme === "dark"
              ? "bg-gray-700 text-white border-gray-600"
              : "bg-gray-100 text-gray-900 border-gray-300"
          } border`}
        >
          <option value="all">All Types</option>
          <option value="cardio">Cardio Only</option>
          <option value="strength">Strength Only</option>
          <option value="mixed">Mixed</option>
        </select>

        {/* Sort Options */}
        <div className="flex gap-2">
          <select
            value={filterOptions.sortBy}
            onChange={(e) => setFilterOptions(prev => ({ ...prev, sortBy: e.target.value }))}
            className={`rounded-lg px-3 py-2 ${
              theme === "dark"
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-gray-100 text-gray-900 border-gray-300"
            } border`}
          >
            <option value="updated">Sort by Last Updated</option>
            <option value="created">Sort by Created Date</option>
            <option value="name">Sort by Name</option>
            <option value="exercises">Sort by Exercise Count</option>
          </select>

          <button
            onClick={() => setFilterOptions(prev => ({ 
              ...prev, 
              sortOrder: prev.sortOrder === "asc" ? "desc" : "asc" 
            }))}
            className={`px-3 py-2 rounded-lg border ${
              theme === "dark"
                ? "bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
                : "bg-gray-100 text-gray-900 border-gray-300 hover:bg-gray-200"
            }`}
            title={filterOptions.sortOrder === "asc" ? "Ascending" : "Descending"}
          >
            <FaSort className={filterOptions.sortOrder === "asc" ? "transform rotate-180" : ""} />
          </button>
        </div>
      </div>
    </div>
  );

  // Add this function after the other helper functions
  const getExerciseOverview = (routine) => {
    if (!routine.workout?.exercises?.length) return null;
    
    const exercises = routine.workout.exercises;
    const maxExercises = 3; // Show up to 3 exercises in overview
    const remainingCount = exercises.length - maxExercises;
    
    return (
      <div className="mt-2">
        <div className="flex flex-wrap gap-2">
          {exercises.slice(0, maxExercises).map((exercise, index) => (
            <span
              key={index}
              className={`px-2 py-1 rounded-full text-xs ${
                exercise.is_cardio
                  ? "bg-blue-100 text-blue-800"
                  : "bg-purple-100 text-purple-800"
              }`}
            >
              {exercise.name}
            </span>
          ))}
          {remainingCount > 0 && (
            <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
              +{remainingCount} more
            </span>
          )}
        </div>
      </div>
    );
  };

  // Add this function after other handler functions
  const handleDeleteAllRoutines = async () => {
    if (!window.confirm("Are you sure you want to delete ALL routines? This action cannot be undone.")) {
      return;
    }

    setDeletingAll(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendURL}/routines/delete-all`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to delete all routines");
      }

      setRoutines([]);
      setSuccessMessage("All routines have been deleted successfully");
    } catch (error) {
      setError("Failed to delete all routines. Please try again.");
    } finally {
      setDeletingAll(false);
      setShowDeleteAllModal(false);
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
                    : theme === "dark"
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-100"
                }`}
              >
                All Routines
              </button>
              <button
                onClick={() => setActiveView("folders")}
                className={`px-4 py-2 ${
                  activeView === "folders"
                    ? "bg-teal-500 text-white"
                    : theme === "dark"
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-100"
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
            {routines.length > 0 && (
              <button
                onClick={() => setShowDeleteAllModal(true)}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 text-white rounded flex items-center"
                title="Delete all routines"
              >
                <FaTrash className="mr-2" />
                Delete All
              </button>
            )}
          </div>
        </div>

        {/* Add Filter Bar */}
        {renderFilterBar()}

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
          <div className="space-y-4">
            {filterRoutines(routines).map((routine) => (
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
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">{routine.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
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
                          {folders.find((f) => f.id === routine.folder_id)?.name || "Folder"}
                        </span>
                      )}
                      {routine.created_at && (
                        <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          • Created {new Date(routine.created_at).toLocaleDateString()} at {new Date(routine.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      {routine.updated_at && routine.updated_at !== routine.created_at && (
                        <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          • Last modified {new Date(routine.updated_at).toLocaleDateString()} at {new Date(routine.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    {getExerciseOverview(routine)}
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
                  {filterRoutines(getUnassignedRoutines()).map((routine) => (
                    <div
                      key={routine.id}
                      className={`${
                        theme === "dark" ? "bg-gray-700" : "bg-gray-50"
                      } p-3 rounded-lg`}
                    >
                      <div className="flex flex-col gap-2">
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
                            <button
                              onClick={() => handleStartEditRoutine(routine)}
                              className="text-blue-500 hover:text-blue-400"
                              title="Edit routine"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteRoutine(routine.id)}
                              className="text-red-500 hover:text-red-400"
                              title="Delete routine"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            {routine.workout && routine.workout.exercises
                              ? `${routine.workout.exercises.length} Exercise${
                                  routine.workout.exercises.length !== 1 ? "s" : ""
                                }`
                              : "0 Exercises"}
                          </span>
                          {routine.created_at && (
                            <span className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                              • Created {new Date(routine.created_at).toLocaleDateString()} at {new Date(routine.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                          {routine.updated_at && routine.updated_at !== routine.created_at && (
                            <span className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                              • Last modified {new Date(routine.updated_at).toLocaleDateString()} at {new Date(routine.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        {getExerciseOverview(routine)}
                      </div>
                    </div>
                  ))}
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
                    {filterRoutines(folder.routines).map((routine) => (
                      <div
                        key={routine.id}
                        className={`${
                          theme === "dark" ? "bg-gray-700" : "bg-gray-50"
                        } p-3 rounded-lg`}
                      >
                        <div className="flex flex-col gap-2">
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
                                onClick={() => handleStartEditRoutine(routine)}
                                className="text-blue-500 hover:text-blue-400"
                                title="Edit routine"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteRoutine(routine.id)}
                                className="text-red-500 hover:text-red-400"
                                title="Delete routine"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                              {routine.workout && routine.workout.exercises
                                ? `${routine.workout.exercises.length} Exercise${
                                    routine.workout.exercises.length !== 1 ? "s" : ""
                                  }`
                                : "0 Exercises"}
                            </span>
                            {routine.created_at && (
                              <span className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                • Created {new Date(routine.created_at).toLocaleDateString()} at {new Date(routine.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                            {routine.updated_at && routine.updated_at !== routine.created_at && (
                              <span className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                • Last modified {new Date(routine.updated_at).toLocaleDateString()} at {new Date(routine.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                          {getExerciseOverview(routine)}
                        </div>
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

      {/* Add Delete All Confirmation Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-lg p-6 max-w-md w-full mx-4`}>
            <div className="flex items-center mb-4">
              <FaExclamationTriangle className="text-red-500 text-2xl mr-2" />
              <h2 className="text-xl font-bold">Delete All Routines</h2>
            </div>
            <p className="mb-4">
              Are you sure you want to delete all routines? This action cannot be undone.
              All your routines will be permanently deleted.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteAllModal(false)}
                className={`px-4 py-2 rounded ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
                disabled={deletingAll}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllRoutines}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 text-white rounded flex items-center"
                disabled={deletingAll}
              >
                {deletingAll ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash className="mr-2" />
                    Delete All
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Routines;
