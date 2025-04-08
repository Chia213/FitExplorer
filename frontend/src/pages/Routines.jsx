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
    const fetchRoutines = async () => {
      setLoading(true);
      try {
        // Get token from both possible locations
        const token = localStorage.getItem("access_token") || localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

        // Fetch routines using the /routines endpoint instead of /user/routines
        const response = await fetch(`${backendURL}/routines`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to fetch routines: ${response.status} ${response.statusText}`, errorText);
          throw new Error("Failed to fetch routines");
        }

      const data = await response.json();
        console.log(`Successfully fetched ${data.length} routines`);
        setRoutines(data);
        
        // Also fetch folders after successful routines fetch
        fetchFolders(token);
      } catch (error) {
        console.error("Error fetching routines:", error);
        setError("Failed to load routines. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoutines();
  }, [navigate]);

  const toggleWeightUnit = () => {
    const newUnit = weightUnit === "kg" ? "lbs" : "kg";
    setWeightUnit(newUnit);
    localStorage.setItem("weightUnit", newUnit);
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
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      
      const response = await fetch(`${backendURL}/routines/${routineId}`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to delete routine: ${response.status}`, errorText);
        throw new Error("Failed to delete routine");
      }

      setRoutines(routines.filter((r) => r.id !== routineId));
      setSuccessMessage("Routine deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error deleting routine:", err);
      setError("Failed to delete routine. Please try again.");
    }
  };

  const handleStartEditRoutine = (routine) => {
    console.log("Starting to edit routine:", routine);
    setEditingRoutine(routine);
    setEditedRoutineName(routine.name);
    
    // Determine where to find exercises based on the routine structure
    let exercisesToEdit = [];
    if (routine.workout?.exercises?.length > 0) {
      exercisesToEdit = routine.workout.exercises;
    } else if (routine.exercises?.length > 0) {
      exercisesToEdit = routine.exercises;
    }
    
    console.log("Found exercises for editing:", exercisesToEdit.length);
    setEditedExercises(exercisesToEdit);
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
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      
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
                        is_warmup: !!set.is_warmup,
                        is_drop_set: !!set.is_drop_set,
                        is_superset: !!set.is_superset,
                        superset_with: set.is_superset ? set.superset_with : null
                      };
                    } else {
                      return {
                        weight: set.weight || null,
                        reps: set.reps || null,
                        notes: set.notes || "",
                        is_warmup: !!set.is_warmup,
                        is_drop_set: !!set.is_drop_set,
                        is_superset: !!set.is_superset,
                        superset_with: set.is_superset ? set.superset_with : null
                      };
                    }
                  })
                : []
            })),
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to update routine: ${response.status}`, errorText);
        throw new Error("Failed to update routine");
      }

      // Fetch updated routines
      const updatedResponse = await fetch(`${backendURL}/routines`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
      });
      
      if (updatedResponse.ok) {
        const data = await updatedResponse.json();
        setRoutines(data);
      }

      setEditingRoutine(null);
      setSuccessMessage("Routine updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error updating routine:", err);
      setError("Failed to update routine. Please try again.");
    }
  };

  const handleStartWorkout = (routine) => {
    if (!routine.exercises || routine.exercises.length === 0) {
      alert("This routine doesn't have any exercises");
      return;
    }

    // Create the correct structure for workout-log page
    navigate("/workout-log", {
      state: {
        routineId: routine.id,
        routineName: routine.name,
        routine: {
          id: routine.id,
          name: routine.name,
          weight_unit: routine.weight_unit || "kg",
          workout: {
            exercises: routine.exercises
          }
        }
      }
    });
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
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Make sure folderId is treated as a proper number or null
      const payload = {
        folder_id: folderId === null ? null : Number(folderId),
      };

      const response = await fetch(
        `${backendURL}/routines/${routineId}/folder`,
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

      // Set success message
      const folderName = updatedRoutine.message || "Unknown action";
      setSuccessMessage(`${folderName}`);
      
      // Refresh the routines data to ensure UI is up to date
      const refreshResponse = await fetch(`${backendURL}/routines`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      if (refreshResponse.ok) {
        const refreshedData = await refreshResponse.json();
        setRoutines(refreshedData);
      }
      
      // Close the folder modal
      setTimeout(() => {
        setShowFolderModal(false);
      }, 500);
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
                  is_warmup: !!set.is_warmup,
                  is_drop_set: !!set.is_drop_set,
                  is_superset: !!set.is_superset,
                  is_amrap: !!set.is_amrap,
                  is_restpause: !!set.is_restpause,
                  is_pyramid: !!set.is_pyramid,
                  is_giant: !!set.is_giant,
                  drop_number: set.drop_number || null,
                  superset_with: set.superset_with || null,
                  rest_pauses: set.rest_pauses || null,
                  pyramid_type: set.pyramid_type || null,
                  pyramid_step: set.pyramid_step || null,
                  giant_with: set.giant_with || null
                };
              } else {
                return {
                  weight: set.weight || null,
                  reps: set.reps || null,
                  notes: set.notes || "",
                  is_warmup: !!set.is_warmup,
                  is_drop_set: !!set.is_drop_set,
                  is_superset: !!set.is_superset,
                  is_amrap: !!set.is_amrap,
                  is_restpause: !!set.is_restpause,
                  is_pyramid: !!set.is_pyramid,
                  is_giant: !!set.is_giant,
                  drop_number: set.drop_number || null,
                  superset_with: set.superset_with || null,
                  rest_pauses: set.rest_pauses || null,
                  pyramid_type: set.pyramid_type || null,
                  pyramid_step: set.pyramid_step || null,
                  giant_with: set.giant_with || null
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
      setRoutines((prev) => [newRoutine, ...prev]);
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
    // Get exercises directly from the routine
    const exercises = routine.exercises || [];
    
    if (exercises.length === 0) {
      return (
        <div className="mt-2">
          <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
            No exercises found
          </span>
        </div>
      );
    }
    
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
    try {
      setDeletingAll(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("You must be logged in to delete all routines");
        return;
      }
      
      const response = await fetch(`${backendURL}/routines-delete-all`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to delete all routines: ${errorData}`);
      }

      const result = await response.json();
      setRoutines([]);
      setSuccessMessage(result.message || "All routines have been deleted successfully");
    } catch (error) {
      console.error("Error deleting all routines:", error);
      setError(`Failed to delete all routines: ${error.message}`);
    } finally {
      setDeletingAll(false);
      setShowDeleteAllModal(false);
    }
  };

  // Add after other helper functions
  const getSetType = (set) => {
    if (set.is_warmup) return "warmup";
    if (set.is_drop_set) return "drop";
    if (set.is_superset) return "superset";
    if (set.is_amrap) return "amrap";
    if (set.is_restpause) return "restpause";
    if (set.is_pyramid) return "pyramid";
    if (set.is_giant) return "giant";
    return "normal";
  };

  // Render all routines regardless of folder
  const renderAllRoutines = () => {
    const filteredRoutines = filterRoutines(routines);
    
    return (
      <div className="space-y-4">
        {filteredRoutines.length === 0 ? (
          <div
            className={`text-center p-6 rounded-lg ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <FaExclamationTriangle 
              className="mx-auto mb-4 text-4xl text-yellow-500"
            />
            <p className="mb-2 font-semibold">No routines found</p>
            <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              {filterOptions.search ? 
                "Try adjusting your search or filters" : 
                "You haven't created any routines yet"}
            </p>
          </div>
        ) : (
          filteredRoutines.map((routine) => (
            <div
              key={routine.id}
              className={`${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              } rounded-lg overflow-hidden shadow`}
            >
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">{routine.name}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStartWorkout(routine)}
                      className="bg-teal-500 hover:bg-teal-600 text-white p-2 rounded-full"
                      title="Start routine"
                    >
                      <FaPlay />
                    </button>
                    <button
                      onClick={() => openFolderModal(routine.id)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full"
                      title="Move to folder"
                    >
                      <FaFolder />
                    </button>
                    <button
                      onClick={() => handleStartEditRoutine(routine)}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full"
                      title="Edit routine"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteRoutine(routine.id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
                      title="Delete routine"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <span className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    {routine.exercises?.length 
                      ? `${routine.exercises.length} Exercise${
                          routine.exercises.length !== 1 ? "s" : ""
                        }`
                      : "0 Exercises"}
                  </span>
                  {routine.created_at && (
                    <span className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                      • Created {new Date(routine.created_at).toLocaleDateString('en-GB')} at {new Date(routine.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  {routine.updated_at && routine.updated_at !== routine.created_at && (
                    <span className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                      • Last modified {new Date(routine.updated_at).toLocaleDateString('en-GB')}
                    </span>
                  )}
                </div>
                {getExerciseOverview(routine)}
                {routine.folder_id && (
                  <div className="mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      theme === "dark" ? "bg-yellow-800 text-yellow-200" : "bg-yellow-100 text-yellow-800"
                    } flex items-center w-fit`}>
                      <FaFolder className="mr-1" />
                      {folders.find(f => f.id === routine.folder_id)?.name || "Folder"}
                    </span>
                  </div>
                )}
                {expandedRoutines[routine.id] && (
                  <div className="mt-3 border-t pt-3 border-gray-600">
                    <h4 className="font-semibold mb-2">Exercises</h4>
                    <div className="space-y-3">
                      {routine.exercises?.map((exercise, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded ${
                            theme === "dark" ? "bg-gray-800" : "bg-white"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <h5 className="font-medium">{exercise.name}</h5>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                exercise.is_cardio
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {exercise.category || "Uncategorized"}
                            </span>
                          </div>
                          <div className="mt-2">
                            <h6 className="text-sm mb-1">Sets:</h6>
                            
                            {/* Table Header Based on Exercise Type */}
                            <div className="grid gap-2 mb-2 text-xs font-semibold">
                              {exercise.is_cardio ? (
                                <div className="grid grid-cols-6 gap-2">
                                  <div>Set</div>
                                  <div>Duration</div>
                                  <div>Distance</div>
                                  <div>Intensity</div>
                                  <div>Set Type</div>
                                  <div>Notes</div>
                                </div>
                              ) : (
                                <div className="grid grid-cols-5 gap-2">
                                  <div>Set</div>
                                  <div>Weight</div>
                                  <div>Reps</div>
                                  <div>Set Type</div>
                                  <div>Notes</div>
                                </div>
                              )}
                            </div>
                            
                            <div className="space-y-1">
                              {exercise.sets?.map((set, setIndex) => (
                                <div
                                  key={setIndex}
                                  className={`text-sm p-1 rounded ${
                                    set.is_warmup 
                                      ? theme === "dark" ? "bg-blue-900/30" : "bg-blue-100"
                                      : set.is_drop_set
                                      ? theme === "dark" ? "bg-red-900/30" : "bg-red-100" 
                                      : set.is_superset
                                      ? theme === "dark" ? "bg-purple-900/30" : "bg-purple-100"
                                      : set.is_amrap
                                      ? theme === "dark" ? "bg-green-900/30" : "bg-green-100"
                                      : set.is_restpause
                                      ? theme === "dark" ? "bg-yellow-900/30" : "bg-yellow-100"
                                      : theme === "dark"
                                      ? "bg-gray-700/50"
                                      : "bg-gray-50"
                                  }`}
                                >
                                  {exercise.is_cardio ? (
                                    <div className="grid grid-cols-6 gap-2 items-center">
                                      <div className="font-medium">Set {setIndex + 1}</div>
                                      <div>{set.duration ? `${set.duration} min` : '-'}</div>
                                      <div>{set.distance ? `${set.distance} m` : '-'}</div>
                                      <div>{set.intensity || 'Medium'}</div>
                                      <div>
                                        {(set.is_warmup || set.is_drop_set || set.is_superset || 
                                         set.is_amrap || set.is_restpause || set.is_pyramid || set.is_giant) ? (
                                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                            set.is_warmup 
                                              ? "bg-blue-500 text-white" 
                                              : set.is_drop_set 
                                              ? "bg-red-500 text-white"
                                              : set.is_superset
                                              ? "bg-purple-500 text-white"
                                              : set.is_amrap
                                              ? "bg-green-500 text-white"
                                              : set.is_restpause
                                              ? "bg-yellow-500 text-black"
                                              : set.is_pyramid
                                              ? "bg-orange-500 text-white"
                                              : "bg-pink-500 text-white"
                                          }`}>
                                            {set.is_warmup 
                                              ? "Warm-up" 
                                              : set.is_drop_set 
                                              ? "Drop Set"
                                              : set.is_superset
                                              ? "Superset"
                                              : set.is_amrap
                                              ? "AMRAP"
                                              : set.is_restpause
                                              ? "Rest-Pause"
                                              : set.is_pyramid
                                              ? "Pyramid"
                                              : "Giant Set"}
                                          </span>
                                        ) : (
                                          <span>Normal</span>
                                        )}
                                      </div>
                                      <div className="italic text-gray-500">{set.notes || '-'}</div>
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-5 gap-2 items-center">
                                      <div className="font-medium">Set {setIndex + 1}</div>
                                      <div>{set.weight ? `${set.weight} ${routine.weight_unit || 'kg'}` : '-'}</div>
                                      <div>{set.reps ? `${set.reps}` : '-'}</div>
                                      <div>
                                        {(set.is_warmup || set.is_drop_set || set.is_superset || 
                                         set.is_amrap || set.is_restpause || set.is_pyramid || set.is_giant) ? (
                                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                            set.is_warmup 
                                              ? "bg-blue-500 text-white" 
                                              : set.is_drop_set 
                                              ? "bg-red-500 text-white"
                                              : set.is_superset
                                              ? "bg-purple-500 text-white"
                                              : set.is_amrap
                                              ? "bg-green-500 text-white"
                                              : set.is_restpause
                                              ? "bg-yellow-500 text-black"
                                              : set.is_pyramid
                                              ? "bg-orange-500 text-white"
                                              : "bg-pink-500 text-white"
                                          }`}>
                                            {set.is_warmup 
                                              ? "Warm-up" 
                                              : set.is_drop_set 
                                              ? "Drop Set"
                                              : set.is_superset
                                              ? "Superset"
                                              : set.is_amrap
                                              ? "AMRAP"
                                              : set.is_restpause
                                              ? "Rest-Pause"
                                              : set.is_pyramid
                                              ? "Pyramid"
                                              : "Giant Set"}
                                          </span>
                                        ) : (
                                          <span>Normal</span>
                                        )}
                                      </div>
                                      <div className="italic text-gray-500">{set.notes || '-'}</div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => toggleRoutineExpand(routine.id)}
                  className={`mt-2 flex items-center text-sm ${
                    theme === "dark"
                      ? "text-gray-400 hover:text-gray-300"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {expandedRoutines[routine.id] ? (
                    <>
                      <FaChevronUp className="mr-1" /> Show Less
                    </>
                  ) : (
                    <>
                      <FaChevronDown className="mr-1" /> Show More
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    );
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
          renderAllRoutines()
        ) : (
          <div className="space-y-6">
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
                    <FaFolderOpen className="mr-2 text-yellow-500" />
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
                        } p-3 rounded-lg mb-3`}
                      >
                        {/* Routine content */}
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
                        {getExerciseOverview(routine)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
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
                  <FaFolderOpen className="mr-2 text-yellow-500" />
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
                      } p-3 rounded-lg mb-3`}
                    >
                      {/* Routine content */}
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
                      {getExerciseOverview(routine)}
                    </div>
                  ))}
                </div>
              )}
            </div>
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
                                    <th className="pb-2 text-center w-1/5">
                                      Set Type
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
                                    <th className="pb-2 text-center w-1/5">
                                      Set Type
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
                                        <select
                                          value={getSetType(set)}
                                          onChange={(e) => {
                                            const newExercises = [
                                              ...editedExercises,
                                            ];
                                            const setType = e.target.value;
                                            // Reset all set type flags
                                            newExercises[exerciseIndex].sets[
                                              setIndex
                                            ].is_warmup = false;
                                            newExercises[exerciseIndex].sets[
                                              setIndex
                                            ].is_drop_set = false;
                                            newExercises[exerciseIndex].sets[
                                              setIndex
                                            ].is_superset = false;
                                            newExercises[exerciseIndex].sets[
                                              setIndex
                                            ].is_amrap = false;
                                            newExercises[exerciseIndex].sets[
                                              setIndex
                                            ].is_restpause = false;
                                            newExercises[exerciseIndex].sets[
                                              setIndex
                                            ].is_pyramid = false;
                                            newExercises[exerciseIndex].sets[
                                              setIndex
                                            ].is_giant = false;
                                            
                                            // Set the selected type
                                            if (setType === "warmup") {
                                              newExercises[exerciseIndex].sets[
                                                setIndex
                                              ].is_warmup = true;
                                            } else if (setType === "drop") {
                                              newExercises[exerciseIndex].sets[
                                                setIndex
                                              ].is_drop_set = true;
                                            } else if (setType === "superset") {
                                              newExercises[exerciseIndex].sets[
                                                setIndex
                                              ].is_superset = true;
                                            } else if (setType === "amrap") {
                                              newExercises[exerciseIndex].sets[
                                                setIndex
                                              ].is_amrap = true;
                                            } else if (setType === "restpause") {
                                              newExercises[exerciseIndex].sets[
                                                setIndex
                                              ].is_restpause = true;
                                            } else if (setType === "pyramid") {
                                              newExercises[exerciseIndex].sets[
                                                setIndex
                                              ].is_pyramid = true;
                                            } else if (setType === "giant") {
                                              newExercises[exerciseIndex].sets[
                                                setIndex
                                              ].is_giant = true;
                                            }
                                            
                                            setEditedExercises(newExercises);
                                          }}
                                          className={`w-full text-center ${
                                            theme === "dark"
                                              ? "bg-gray-600 text-white"
                                              : "bg-white text-gray-800"
                                          } rounded p-1 text-sm`}
                                        >
                                          <option value="normal">Normal Set</option>
                                          <option value="warmup">Warm-up</option>
                                          <option value="drop">Drop Set</option>
                                          <option value="superset">Superset</option>
                                          <option value="amrap">AMRAP</option>
                                          <option value="restpause">Rest-Pause</option>
                                          <option value="pyramid">Pyramid</option>
                                          <option value="giant">Giant Set</option>
                                        </select>
                                      </td>
                                      <td className="py-2 text-center">
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
                                        <select
                                          value={getSetType(set)}
                                          onChange={(e) => {
                                            const newExercises = [
                                              ...editedExercises,
                                            ];
                                            const setType = e.target.value;
                                            // Reset all set type flags
                                            newExercises[exerciseIndex].sets[
                                              setIndex
                                            ].is_warmup = false;
                                            newExercises[exerciseIndex].sets[
                                              setIndex
                                            ].is_drop_set = false;
                                            newExercises[exerciseIndex].sets[
                                              setIndex
                                            ].is_superset = false;
                                            newExercises[exerciseIndex].sets[
                                              setIndex
                                            ].is_amrap = false;
                                            newExercises[exerciseIndex].sets[
                                              setIndex
                                            ].is_restpause = false;
                                            newExercises[exerciseIndex].sets[
                                              setIndex
                                            ].is_pyramid = false;
                                            newExercises[exerciseIndex].sets[
                                              setIndex
                                            ].is_giant = false;
                                            
                                            // Set the selected type
                                            if (setType === "warmup") {
                                              newExercises[exerciseIndex].sets[
                                                setIndex
                                              ].is_warmup = true;
                                            } else if (setType === "drop") {
                                              newExercises[exerciseIndex].sets[
                                                setIndex
                                              ].is_drop_set = true;
                                            } else if (setType === "superset") {
                                              newExercises[exerciseIndex].sets[
                                                setIndex
                                              ].is_superset = true;
                                            } else if (setType === "amrap") {
                                              newExercises[exerciseIndex].sets[
                                                setIndex
                                              ].is_amrap = true;
                                            } else if (setType === "restpause") {
                                              newExercises[exerciseIndex].sets[
                                                setIndex
                                              ].is_restpause = true;
                                            } else if (setType === "pyramid") {
                                              newExercises[exerciseIndex].sets[
                                                setIndex
                                              ].is_pyramid = true;
                                            } else if (setType === "giant") {
                                              newExercises[exerciseIndex].sets[
                                                setIndex
                                              ].is_giant = true;
                                            }
                                            
                                            setEditedExercises(newExercises);
                                          }}
                                          className={`w-full text-center ${
                                            theme === "dark"
                                              ? "bg-gray-600 text-white"
                                              : "bg-white text-gray-800"
                                          } rounded p-1 text-sm`}
                                        >
                                          <option value="normal">Normal Set</option>
                                          <option value="warmup">Warm-up</option>
                                          <option value="drop">Drop Set</option>
                                          <option value="superset">Superset</option>
                                          <option value="amrap">AMRAP</option>
                                          <option value="restpause">Rest-Pause</option>
                                          <option value="pyramid">Pyramid</option>
                                          <option value="giant">Giant Set</option>
                                        </select>
                                      </td>
                                      <td className="py-2 text-center">
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
