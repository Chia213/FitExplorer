import { useState, useEffect, useMemo } from "react";
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
  FaTrophy,
  FaMedal,
  FaCrown,
  FaCalendarAlt,
  FaChartLine,
  FaDumbbell,
  FaRunning,
} from "react-icons/fa";
import AddExercise from "./AddExercise";
import FolderModal from "./FolderModal";
import { notifyRoutineCreated } from '../utils/notificationsHelpers';

const backendURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
  const [showPersonalRecordsModal, setShowPersonalRecordsModal] = useState(false);
  const [personalRecords, setPersonalRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [recordsFilter, setRecordsFilter] = useState({
    category: "all",
    search: "",
    sortBy: "recent",
    recordAge: "all"
  });
  const [showRecordHistory, setShowRecordHistory] = useState(null);

  const navigate = useNavigate();
  const { theme } = useTheme();

  // Extract the fetchRoutines function from the useEffect
  const fetchRoutines = async () => {
    setLoading(true);
    try {
      // Get token from both possible locations
      const token = localStorage.getItem("token");
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

  useEffect(() => {
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

  const refreshFolders = async () => {
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }
      
      // First fetch updated folders
      const folderResponse = await fetch(`${backendURL}/routine-folders`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!folderResponse.ok) {
        throw new Error(`Failed to fetch folders: ${folderResponse.status}`);
      }

      const folderData = await folderResponse.json();
      setFolders(folderData);
      
      // Then fetch updated routines to ensure everything is in sync
      const routineResponse = await fetch(`${backendURL}/routines`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      if (!routineResponse.ok) {
        throw new Error(`Failed to fetch routines: ${routineResponse.status}`);
      }
      
      const routineData = await routineResponse.json();
      setRoutines(routineData);
      
    } catch (err) {
      console.error("Error refreshing folder data:", err);
      setError(`Failed to refresh folders: ${err.message}`);
      // Auto-clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    }
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
                        // Set type flags
                        is_warmup: !!set.is_warmup,
                        is_drop_set: !!set.is_drop_set,
                        is_superset: !!set.is_superset,
                        is_amrap: !!set.is_amrap,
                        is_restpause: !!set.is_restpause,
                        is_pyramid: !!set.is_pyramid,
                        is_giant: !!set.is_giant,
                        // Additional properties for special set types
                        drop_number: set.drop_number || null,
                        original_weight: set.original_weight || null,
                        superset_with: set.is_superset ? set.superset_with : null,
                        rest_pauses: set.is_restpause ? set.rest_pauses : null,
                        pyramid_type: set.is_pyramid ? set.pyramid_type : null,
                        pyramid_step: set.is_pyramid ? set.pyramid_step : null,
                        giant_with: set.giant_with ? set.giant_with.map(item => String(item)) : null
                      };
                    } else {
                      return {
                        weight: set.weight || null,
                        reps: set.reps || null,
                        notes: set.notes || "",
                        // Set type flags
                        is_warmup: !!set.is_warmup,
                        is_drop_set: !!set.is_drop_set,
                        is_superset: !!set.is_superset,
                        is_amrap: !!set.is_amrap,
                        is_restpause: !!set.is_restpause,
                        is_pyramid: !!set.is_pyramid,
                        is_giant: !!set.is_giant,
                        // Additional properties for special set types
                        drop_number: set.drop_number || null,
                        original_weight: set.original_weight || null,
                        superset_with: set.is_superset ? set.superset_with : null,
                        rest_pauses: set.is_restpause ? set.rest_pauses : null,
                        pyramid_type: set.is_pyramid ? set.pyramid_type : null,
                        pyramid_step: set.is_pyramid ? set.pyramid_step : null,
                        giant_with: set.giant_with ? set.giant_with.map(item => String(item)) : null
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
            exercises: routine.exercises.map(exercise => ({
              ...exercise,
              sets: exercise.sets.sort((a, b) => {
                // First, handle warmup sets (should be first)
                if (a.is_warmup && !b.is_warmup) return -1;
                if (!a.is_warmup && b.is_warmup) return 1;
                
                // Then handle drop sets (should be ordered by drop_number)
                if (a.is_drop_set && b.is_drop_set) {
                  return (a.drop_number || 0) - (b.drop_number || 0);
                }
                
                // Keep original order for other sets
                return 0;
              })
            }))
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

    const baseSetProperties = {
      notes: "",
      // Set type flags
      is_warmup: false,
      is_drop_set: false,
      is_superset: false,
      is_amrap: false,
      is_restpause: false,
      is_pyramid: false,
      is_giant: false,
      // Additional properties for special set types
      drop_number: null,
      original_weight: null,
      superset_with: null,
      rest_pauses: null,
      pyramid_type: null,
      pyramid_step: null,
      giant_with: null
    };

    let sets;
    if (exercise.is_cardio) {
      sets = Array(initialSets)
        .fill()
        .map(() => ({
          ...baseSetProperties,
          distance: "",
          duration: "",
          intensity: ""
        }));
    } else {
      sets = Array(initialSets)
        .fill()
        .map(() => ({
          ...baseSetProperties,
          weight: "",
          reps: ""
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

  const handleCreateNewFolder = () => {
    setSelectedRoutineForFolder(null);
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
      if (!token) {
        navigate("/login");
        return;
      }

      // Make sure folderId is treated as a proper number or null
      const payload = {
        folder_id: folderId === null ? null : Number(folderId),
      };

      console.log(`Assigning routine ${routineId} to folder ${folderId}`);
      
      setLoading(true);
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
        console.error("Error response:", errorData);
        throw new Error(`Failed to assign routine to folder: ${errorData}`);
      }

      const result = await response.json();
      
      // Set appropriate success message based on folder action
      let successMsg;
      if (folderId === null) {
        successMsg = "Routine removed from folder";
      } else {
        const folderName = folders.find(f => f.id === folderId)?.name || "folder";
        successMsg = `Routine moved to ${folderName}`;
      }
      
      setSuccessMessage(successMsg);
      
      // Refresh the routines data to ensure UI is up to date
      await fetchRoutines();
      
      // Close the folder modal after a short delay
      setTimeout(() => {
        setShowFolderModal(false);
      }, 500);
    } catch (error) {
      console.error("Error in handleAssignToFolder:", error);
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
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
                  giant_with: set.giant_with ? set.giant_with.map(item => String(item)) : null
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
                  giant_with: set.giant_with ? set.giant_with.map(item => String(item)) : null
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
      
      // Send notification for new routine creation
      try {
        console.log("Creating notification for new routine:", routineName);
        const notificationResult = await notifyRoutineCreated(routineName);
        if (notificationResult) {
          console.log("Notification created successfully:", notificationResult);
        } else {
          console.warn("Notification creation returned null result");
        }
      } catch (notificationError) {
        console.error("Error creating notification:", notificationError);
      }
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

        {/* Create New Folder Button */}
        <button
          onClick={handleCreateNewFolder}
          className={`px-3 py-2 rounded-lg border flex items-center gap-2 ${
            theme === "dark"
              ? "bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
              : "bg-gray-100 text-gray-900 border-gray-300 hover:bg-gray-200"
          }`}
          title="Create New Folder"
        >
          <FaFolderPlus />
          <span className="hidden sm:inline">New Folder</span>
        </button>

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
                                      <div>{set.distance ? `${set.distance} km` : '-'}</div>
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
                                              ? `Drop Set${set.drop_number ? ` #${set.drop_number}` : ""}`
                                              : set.is_superset
                                              ? `Superset${set.superset_with ? ` with ${set.superset_with}` : ""}`
                                              : set.is_amrap
                                              ? "AMRAP"
                                              : set.is_restpause
                                              ? `Rest-Pause${set.rest_pauses ? ` (${set.rest_pauses})` : ""}`
                                              : set.is_pyramid
                                              ? `Pyramid${set.pyramid_type ? ` (${set.pyramid_type})` : ""}${set.pyramid_step ? ` Step ${set.pyramid_step}` : ""}`
                                              : `Giant Set${Array.isArray(set.giant_with) && set.giant_with.length > 0 ? ` with ${set.giant_with.join(", ")}` : ""}`}
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
                                              ? `Drop Set${set.drop_number ? ` #${set.drop_number}` : ""}`
                                              : set.is_superset
                                              ? `Superset${set.superset_with ? ` with ${set.superset_with}` : ""}`
                                              : set.is_amrap
                                              ? "AMRAP"
                                              : set.is_restpause
                                              ? `Rest-Pause${set.rest_pauses ? ` (${set.rest_pauses})` : ""}`
                                              : set.is_pyramid
                                              ? `Pyramid${set.pyramid_type ? ` (${set.pyramid_type})` : ""}${set.pyramid_step ? ` Step ${set.pyramid_step}` : ""}`
                                              : `Giant Set${Array.isArray(set.giant_with) && set.giant_with.length > 0 ? ` with ${set.giant_with.join(", ")}` : ""}`}
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

  const fetchPersonalRecords = async () => {
    setLoadingRecords(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Fetch workouts data from the correct endpoint
      const response = await fetch(`${backendURL}/workouts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch workout data: ${response.status}`);
      }

      const workoutData = await response.json();
      
      // Process workout data to extract personal records
      const processedWorkouts = workoutData.map((workout) => {
        if (!workout.exercises) {
          workout.exercises = [];
          return workout;
        }

        if (typeof workout.exercises === "string") {
          try {
            workout.exercises = JSON.parse(workout.exercises);
          } catch (e) {
            console.error("Error parsing exercises JSON:", e);
            workout.exercises = [];
          }
        }

        if (!Array.isArray(workout.exercises)) {
          workout.exercises = [];
        }

        workout.exercises = workout.exercises.map((exercise) => {
          if (exercise.category === "Cardio") {
            exercise.is_cardio = true;
          }
          return exercise;
        });

        return workout;
      });

      // Calculate personal records from processed workout data
      const records = {};
      
      processedWorkouts.forEach((workout) => {
        workout.exercises?.forEach((exercise) => {
          if (exercise.is_cardio) {
            // For cardio, track fastest pace or longest distance
            const totalDistance =
              exercise.sets?.reduce(
                (sum, set) => sum + (parseFloat(set.distance) || 0),
                0
              ) || 0;
            const totalDuration =
              exercise.sets?.reduce(
                (sum, set) => sum + (parseFloat(set.duration) || 0),
                0
              ) || 0;
            
            if (totalDistance > 0 && totalDuration > 0) {
              const pace = totalDuration / totalDistance; // min/km
              
              const recordKey = `${exercise.name}_pace`;
              if (
                !records[recordKey] ||
                pace < records[recordKey].pace
              ) {
                records[recordKey] = {
                  exercise_name: exercise.name,
                  category: exercise.category || "Cardio",
                  is_cardio: true,
                  record_type: "Pace",
                  distance: totalDistance,
                  duration: totalDuration,
                  pace: pace,
                  achieved_at: workout.date || workout.start_time,
                  notes: `${pace.toFixed(2)} min/km`,
                };
              }
            }

            if (totalDistance > 0) {
              const recordKey = `${exercise.name}_distance`;
              if (
                !records[recordKey] ||
                totalDistance > records[recordKey].distance
              ) {
                records[recordKey] = {
                  exercise_name: exercise.name,
                  category: exercise.category || "Cardio",
                  is_cardio: true,
                  record_type: "Distance",
                  distance: totalDistance,
                  duration: totalDuration,
                  achieved_at: workout.date || workout.start_time,
                  notes: totalDuration > 0 ? `at ${(totalDuration / totalDistance).toFixed(2)} min/km pace` : null,
                };
              }
            }

            if (totalDuration > 0) {
              const recordKey = `${exercise.name}_duration`;
              if (
                !records[recordKey] ||
                totalDuration > records[recordKey].duration
              ) {
                records[recordKey] = {
                  exercise_name: exercise.name,
                  category: exercise.category || "Cardio",
                  is_cardio: true,
                  record_type: "Duration",
                  distance: totalDistance,
                  duration: totalDuration,
                  achieved_at: workout.date || workout.start_time,
                  notes: null,
                };
              }
            }
          } else {
            // For strength, track max weight for different rep ranges
            exercise.sets?.forEach((set) => {
              if (set.weight && set.reps) {
                const key = `${exercise.name}_${set.reps}reps`;
                if (
                  !records[key] ||
                  parseFloat(set.weight) > records[key].weight
                ) {
                  records[key] = {
                    exercise_name: exercise.name,
                    category: exercise.category || "Strength",
                    is_cardio: false,
                    record_type: `${set.reps} Rep Max`,
                    weight: parseFloat(set.weight),
                    reps: parseInt(set.reps),
                    weight_unit: workout.weight_unit || weightUnit,
                    achieved_at: workout.date || workout.start_time,
                    notes: set.notes || null,
                  };
                }
              }
            });
          }
        });
      });
      
      // Convert records object to array
      const personalRecords = Object.values(records);
      
      setPersonalRecords(personalRecords);
    } catch (err) {
      console.error("Error fetching personal records:", err);
      setError("Failed to load personal records. Please try again.");
    } finally {
      setLoadingRecords(false);
    }
  };

  // Filter and sort personal records based on filter settings
  const filteredRecords = useMemo(() => {
    if (!personalRecords || personalRecords.length === 0) return [];
    
    return personalRecords
      .filter(record => {
        // Category filter
        if (recordsFilter.category !== "all") {
          if (recordsFilter.category === "strength" && record.is_cardio) return false;
          if (recordsFilter.category === "cardio" && !record.is_cardio) return false;
        }
        
        // Search filter
        if (recordsFilter.search && !record.exercise_name.toLowerCase().includes(recordsFilter.search.toLowerCase())) {
          return false;
        }
        
        // Record age filter
        if (recordsFilter.recordAge !== "all") {
          const recordDate = new Date(record.achieved_at);
          const now = new Date();
          
          switch (recordsFilter.recordAge) {
            case "week":
              if (now - recordDate > 7 * 24 * 60 * 60 * 1000) return false;
              break;
            case "month":
              if (now - recordDate > 30 * 24 * 60 * 60 * 1000) return false;
              break;
            case "quarter":
              if (now - recordDate > 90 * 24 * 60 * 60 * 1000) return false;
              break;
          }
        }
        
        return true;
      })
      .sort((a, b) => {
        switch (recordsFilter.sortBy) {
          case "recent":
            return new Date(b.achieved_at) - new Date(a.achieved_at);
          case "oldest":
            return new Date(a.achieved_at) - new Date(b.achieved_at);
          case "exercise":
            return a.exercise_name.localeCompare(b.exercise_name);
          default:
            return 0;
        }
      });
  }, [personalRecords, recordsFilter]);

  // Group records by exercise for comparison
  const recordsByExercise = useMemo(() => {
    const grouped = {};
    
    if (personalRecords) {
      personalRecords.forEach(record => {
        const baseName = record.exercise_name;
        if (!grouped[baseName]) {
          grouped[baseName] = [];
        }
        grouped[baseName].push(record);
      });
    }
    
    return grouped;
  }, [personalRecords]);

  // Calculate record age in days, weeks, or months
  const getRecordAge = (dateString) => {
    const recordDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - recordDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) === 1 ? '' : 's'} ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) === 1 ? '' : 's'} ago`;
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) === 1 ? '' : 's'} ago`;
  };

  // Get record age color based on recency
  const getRecordAgeColor = (dateString, isDarkTheme) => {
    const recordDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - recordDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) return isDarkTheme ? "text-green-400" : "text-green-600";
    if (diffDays < 30) return isDarkTheme ? "text-blue-400" : "text-blue-600";
    if (diffDays < 90) return isDarkTheme ? "text-yellow-400" : "text-yellow-600";
    if (diffDays < 180) return isDarkTheme ? "text-orange-400" : "text-orange-600";
    return isDarkTheme ? "text-red-400" : "text-red-600";
  };

  // Get the top N records for an exercise (for history view)
  const getRecordHistory = (exerciseName, isCardio, limit = 5) => {
    if (!personalRecords) return [];
    
    let records = personalRecords.filter(record => 
      record.exercise_name === exerciseName && record.is_cardio === isCardio
    );
    
    if (isCardio) {
      // Group by record type for cardio exercises
      const groupedByType = {};
      records.forEach(record => {
        if (!groupedByType[record.record_type]) groupedByType[record.record_type] = [];
        groupedByType[record.record_type].push(record);
      });
      
      // Sort each group
      Object.keys(groupedByType).forEach(type => {
        if (type === "Pace") {
          // Sort pace by lowest (fastest) time
          groupedByType[type].sort((a, b) => a.pace - b.pace);
        } else {
          // Sort distance and duration by highest
          groupedByType[type].sort((a, b) => {
            if (type === "Distance") return b.distance - a.distance;
            return b.duration - a.duration;
          });
        }
      });
      
      // Take top entries from each group
      let result = [];
      Object.values(groupedByType).forEach(group => {
        result = [...result, ...group.slice(0, limit)];
      });
      
      return result;
    } else {
      // Group by rep range for strength exercises
      const groupedByReps = {};
      records.forEach(record => {
        const reps = record.reps || 0;
        if (!groupedByReps[reps]) groupedByReps[reps] = [];
        groupedByReps[reps].push(record);
      });
      
      // Sort each group by weight (highest first)
      Object.keys(groupedByReps).forEach(reps => {
        groupedByReps[reps].sort((a, b) => b.weight - a.weight);
      });
      
      // Take top entries from each rep group
      let result = [];
      Object.values(groupedByReps).forEach(group => {
        result = [...result, ...group.slice(0, limit)];
      });
      
      return result;
    }
  };

  return (
    <div className={`min-h-screen ${
      theme === "dark" ? "bg-gray-900" : "bg-gray-100"
    } ${theme === "dark" ? "text-white" : "text-gray-900"} routines-container`}>
      {successMessage && (
        <div className="bg-green-500 text-white p-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>
      )}

      <div className="max-w-4xl mx-auto p-6 routines-page">
        <div className="flex flex-wrap justify-between items-center mb-6 routines-header">
          <h1 className="text-2xl font-bold mb-2 sm:mb-0">My Routines</h1>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
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
          </div>
          <div className="flex flex-wrap gap-2 mt-2 w-full sm:w-auto sm:mt-0 routines-action-buttons">
            <button
              onClick={() => navigate("/create-routine")}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 text-white rounded flex-grow sm:flex-grow-0"
            >
              <span className="flex items-center justify-center">
                <FaPlus className="mr-2" />
                Create New
              </span>
            </button>
            {routines.length > 0 && (
              <button
                onClick={() => setShowDeleteAllModal(true)}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 text-white rounded flex items-center justify-center flex-grow sm:flex-grow-0"
                title="Delete all routines"
              >
                <FaTrash className="mr-2" />
                <span className="hidden sm:inline">Delete All</span>
                <span className="sm:hidden">Delete</span>
              </button>
            )}
            {routines.length > 0 && (
              <button
                onClick={() => {
                  setShowPersonalRecordsModal(true);
                  fetchPersonalRecords();
                }}
                className="bg-green-500 hover:bg-green-600 px-4 py-2 text-white rounded flex items-center justify-center flex-grow sm:flex-grow-0"
                title="View personal records"
              >
                <FaTrophy className="mr-2" />
                <span className="hidden sm:inline">Personal Records</span>
                <span className="sm:hidden">PRs</span>
              </button>
            )}
          </div>
        </div>

        {/* Enhanced search with responsive design */}
        <div className={`mb-4 ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        } rounded-lg p-3 shadow-sm routines-filters`}>
          <div className="relative mb-2">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search routines..."
              value={filterOptions.search}
              onChange={(e) =>
                setFilterOptions({ ...filterOptions, search: e.target.value })
              }
              className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                theme === "dark"
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-gray-50 text-gray-900 border-gray-300"
              } border routines-search-input`}
            />
          </div>
          <div className="mt-2 sm:mt-0">
            {renderFilterBar()}
          </div>
        </div>

        {routines.length === 0 && !loading && !filterOptions.search ? (
          <div
            className={`${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            } p-6 rounded-lg text-center shadow routines-card`}
          >
            <p
              className={`${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              No routines saved yet
            </p>
            <button
              onClick={() => navigate("/create-routine")}
              className="mt-4 bg-teal-500 hover:bg-teal-600 px-4 py-2 text-white rounded"
            >
              Create First Routine
            </button>
          </div>
        ) : activeView === "all" ? (
          <div className={loading ? "opacity-50" : ""}>
            {renderAllRoutines()}
          </div>
        ) : (
          <div className={`space-y-4 ${loading ? "opacity-50" : ""}`}>
            {renderFolderView()}
          </div>
        )}
      </div>

      {/* Other modals and components remain unchanged */}

      {/* Show loading indicator */}
      {loading && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      )}
    </div>
  );
}

export default Routines;
