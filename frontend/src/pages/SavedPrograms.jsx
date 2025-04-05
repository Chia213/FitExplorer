import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getSavedPrograms, deleteSavedProgram } from "../api/savedProgramsApi";
import {
  FaTrash,
  FaPrint,
  FaEye,
  FaArrowLeft,
  FaClock,
  FaDumbbell,
  FaPlay,
  FaCheckCircle,
  FaSpinner,
  FaFilter,
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
  FaCalendarAlt,
} from "react-icons/fa";

function SavedPrograms() {
  const [savedPrograms, setSavedPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOptions, setFilterOptions] = useState({
    status: "all", // all, not-started, in-progress, completed
    duration: "all", // all, short, medium, long
    muscleGroup: "all", // all, or specific muscle group
  });
  const [sortOption, setSortOption] = useState("date-desc"); // date-desc, date-asc, name-asc, name-desc
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setIsAuthenticated(true);

    const fetchSavedPrograms = async () => {
      try {
        const programs = await getSavedPrograms(token);
        setSavedPrograms(programs);
        setFilteredPrograms(programs);
        
        // Check if there's a programId in the URL query params
        const params = new URLSearchParams(window.location.search);
        const programId = params.get('programId');
        
        if (programId) {
          const selectedProgram = programs.find(p => p.id === programId);
          if (selectedProgram) {
            setSelectedWorkout(selectedProgram);
            // Optionally scroll to the program card
            setTimeout(() => {
              const programElement = document.getElementById(`program-${programId}`);
              if (programElement) {
                programElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 100);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading saved programs:", error);
        setIsLoading(false);
      }
    };

    fetchSavedPrograms();
  }, [navigate]);

  useEffect(() => {
    // Apply filters and search whenever they change
    let result = [...savedPrograms];

    // Apply search
    if (searchTerm.trim() !== "") {
      result = result.filter((program) => {
        const programData =
          typeof program.program_data === "string"
            ? JSON.parse(program.program_data)
            : program.program_data;

        return (
          programData.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (programData.targetMuscles &&
            programData.targetMuscles.some((muscle) =>
              muscle.toLowerCase().includes(searchTerm.toLowerCase())
            ))
        );
      });
    }

    // Apply filters
    if (filterOptions.status !== "all") {
      result = result.filter((program) => {
        const isNotStarted =
          program.current_week === 1 &&
          (!program.completed_weeks || program.completed_weeks.length === 0);
        const isCompleted =
          program.completed_weeks && program.completed_weeks.length >= 6;
        const isInProgress = !isNotStarted && !isCompleted;

        if (filterOptions.status === "not-started") return isNotStarted;
        if (filterOptions.status === "in-progress") return isInProgress;
        if (filterOptions.status === "completed") return isCompleted;
        return true;
      });
    }

    if (filterOptions.duration !== "all") {
      result = result.filter((program) => {
        const programData =
          typeof program.program_data === "string"
            ? JSON.parse(program.program_data)
            : program.program_data;
        const duration = parseInt(programData.duration) || 0;

        if (filterOptions.duration === "short") return duration <= 30;
        if (filterOptions.duration === "medium")
          return duration > 30 && duration <= 60;
        if (filterOptions.duration === "long") return duration > 60;
        return true;
      });
    }

    if (filterOptions.muscleGroup !== "all") {
      result = result.filter((program) => {
        const programData =
          typeof program.program_data === "string"
            ? JSON.parse(program.program_data)
            : program.program_data;

        return (
          programData.targetMuscles &&
          programData.targetMuscles.some(
            (muscle) =>
              muscle.toLowerCase() === filterOptions.muscleGroup.toLowerCase()
          )
        );
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      const programDataA =
        typeof a.program_data === "string"
          ? JSON.parse(a.program_data)
          : a.program_data;

      const programDataB =
        typeof b.program_data === "string"
          ? JSON.parse(b.program_data)
          : b.program_data;

      if (sortOption === "date-desc")
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      if (sortOption === "date-asc")
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      if (sortOption === "name-asc")
        return programDataA.title.localeCompare(programDataB.title);
      if (sortOption === "name-desc")
        return programDataB.title.localeCompare(programDataA.title);
      return 0;
    });

    setFilteredPrograms(result);
  }, [savedPrograms, searchTerm, filterOptions, sortOption]);

  const deleteAllWorkouts = async () => {
    setDeleteModalOpen(false);
    try {
      const token = localStorage.getItem("token");
      // Delete each program individually
      await Promise.all(
        savedPrograms.map((program) => deleteSavedProgram(program.id, token))
      );

      setSavedPrograms([]);
      setSelectedWorkout(null);
    } catch (error) {
      console.error("Error deleting saved programs:", error);
      alert("Failed to delete saved programs. Please try again.");
    }
  };

  const deleteWorkout = async (id) => {
    setDeleteModalOpen(false);
    setProgramToDelete(null);

    try {
      const token = localStorage.getItem("token");
      await deleteSavedProgram(id, token);

      const updatedPrograms = savedPrograms.filter(
        (program) => program.id !== id
      );
      setSavedPrograms(updatedPrograms);

      // If currently viewing the deleted workout, clear it
      if (selectedWorkout && selectedWorkout.id === id) {
        setSelectedWorkout(null);
      }
    } catch (error) {
      console.error("Error deleting saved program:", error);
      alert("Failed to delete workout program. Please try again.");
    }
  };

  const startProgram = (program) => {
    // Parse the stored program data if needed
    let programData = program.program_data;
    if (typeof programData === "string") {
      try {
        programData = JSON.parse(programData);
      } catch (error) {
        console.error("Failed to parse program_data:", error);
        programData = {}; // fallback to empty object if parsing fails
      }
    }

    // Check if sixWeekProgram exists - if not, try to create it
    if (!programData.sixWeekProgram && programData.exercises) {
      // Create a sixWeekProgram array from the available data
      const sixWeeks = [];

      for (let week = 1; week <= 6; week++) {
        sixWeeks.push({
          week: week,
          exercises: programData.exercises.map((ex) => ({
            ...ex,
            // Optionally increase intensity or weight for progressive weeks
            intensity: `${Math.min(
              parseInt(ex.intensity || 70) + (week - 1) * 5,
              95
            )}%`,
          })),
        });
      }

      programData.sixWeekProgram = sixWeeks;
    }

    // Check if the program has been started before
    const initialProgress =
      program.current_week === 1 &&
      (!program.completed_weeks || program.completed_weeks.length === 0)
        ? {
            currentWeek: 1,
            completedWeeks: [],
          }
        : {
            currentWeek: program.current_week || 1,
            completedWeeks: program.completed_weeks || [],
          };

    navigate("/program-tracker", {
      state: {
        workout: programData,
        progress: initialProgress,
      },
    });
  };

  const renderProgramProgress = (program) => {
    // Parse program data
    let programData = program.program_data;
    if (typeof programData === "string") {
      try {
        programData = JSON.parse(programData);
      } catch (error) {
        console.error("Failed to parse program_data:", error);
        return null;
      }
    }

    // Determine if the program is ready to start or in progress
    const isNotStarted =
      program.current_week === 1 &&
      (!program.completed_weeks || program.completed_weeks.length === 0);

    const completedWeeks = program.completed_weeks
      ? program.completed_weeks.length
      : 0;
    const isCompleted = completedWeeks >= 6;

    return (
      <div className="mt-2 text-sm">
        {isNotStarted ? (
          <button
            onClick={() => startProgram(program)}
            className="mt-2 flex items-center justify-center w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <FaPlay className="mr-2" /> Start 6-Week Program
          </button>
        ) : isCompleted ? (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <FaCheckCircle className="text-green-500" />
              <span className="text-green-600 font-medium">
                Program Completed!
              </span>
            </div>
            <button
              onClick={() => startProgram(program)}
              className="mt-2 flex items-center justify-center w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <FaPlay className="mr-2" /> Review Program
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FaClock className="text-blue-500" />
                <span>Week {program.current_week}/6</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaCheckCircle className="text-green-500" />
                <span>{completedWeeks}/6 completed</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2 mb-3">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${(completedWeeks / 6) * 100}%` }}
              ></div>
            </div>
            <button
              onClick={() => startProgram(program)}
              className="mt-1 flex items-center justify-center w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <FaPlay className="mr-2" /> Continue Program
            </button>
          </>
        )}
      </div>
    );
  };

  const getCategoryBadge = (category) => {
    const categories = {
      Strength: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      Hypertrophy:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      Endurance:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      Cardio:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Mobility: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Flexibility:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    };

    return (
      categories[category] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    );
  };

  // Get a list of all unique muscle groups for filtering
  const allMuscleGroups = [
    ...new Set(
      savedPrograms
        .flatMap((program) => {
          const programData =
            typeof program.program_data === "string"
              ? JSON.parse(program.program_data)
              : program.program_data;
          return programData.targetMuscles || [];
        })
        .filter(Boolean)
    ),
  ];

  // Add a helper function at the top of the component to safely parse program data
  function parseProgramData(program) {
    if (!program) return {};
    
    let programData = program.program_data;
    if (typeof programData === "string") {
      try {
        programData = JSON.parse(programData);
      } catch (error) {
        console.error("Failed to parse program_data:", error);
        programData = {}; // fallback
      }
    }
    
    // If program has name/description at the top level, prioritize those
    programData.name = program.name || programData.name || "Workout Program";
    programData.description = program.description || programData.description;
    
    return programData;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading your workout programs...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen p-4 md:p-6 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <Link to="/" className="mr-4 text-blue-500 hover:text-blue-600">
              <FaArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold">
              My Saved Workout Programs
            </h1>
          </div>

          <Link
            to="/"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-flex items-center"
          >
            <FaDumbbell className="mr-2" /> Create New Program
          </Link>
        </div>

        {savedPrograms.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <FaDumbbell className="text-3xl text-blue-500" />
            </div>
            <h2 className="text-xl font-medium mb-4">No saved workouts yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Generate a workout and save it to see it here
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Create a new program
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-1/3">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-medium">Your Programs</h2>
                  <button
                    onClick={() => {
                      setDeleteModalOpen(true);
                      setProgramToDelete("all");
                    }}
                    className="text-red-500 hover:text-red-700 text-sm flex items-center"
                    disabled={savedPrograms.length === 0}
                  >
                    <FaTrash className="mr-1" size={14} /> Delete All
                  </button>
                </div>

                {/* Search and Filter Controls */}
                <div className="mb-4 space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search programs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                    />
                    <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="w-full appearance-none pl-8 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                      >
                        <option value="date-desc">Newest First</option>
                        <option value="date-asc">Oldest First</option>
                        <option value="name-asc">Name A-Z</option>
                        <option value="name-desc">Name Z-A</option>
                      </select>
                      <div className="absolute left-2 top-2.5 text-gray-400">
                        {sortOption.includes("date") ? (
                          <FaCalendarAlt />
                        ) : sortOption.includes("asc") ? (
                          <FaSortAmountUp />
                        ) : (
                          <FaSortAmountDown />
                        )}
                      </div>
                      <div className="absolute right-2 top-2.5 text-gray-400 pointer-events-none">
                        ▼
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        document
                          .getElementById("filterPanel")
                          .classList.toggle("hidden")
                      }
                      className="px-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center"
                    >
                      <FaFilter className="text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>

                  <div
                    id="filterPanel"
                    className="hidden bg-gray-50 dark:bg-gray-750 p-3 rounded-lg space-y-2"
                  >
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Program Status
                      </label>
                      <select
                        value={filterOptions.status}
                        onChange={(e) =>
                          setFilterOptions({
                            ...filterOptions,
                            status: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                      >
                        <option value="all">All Programs</option>
                        <option value="not-started">Not Started</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Workout Duration
                      </label>
                      <select
                        value={filterOptions.duration}
                        onChange={(e) =>
                          setFilterOptions({
                            ...filterOptions,
                            duration: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                      >
                        <option value="all">Any Duration</option>
                        <option value="short">Short (≤ 30 min)</option>
                        <option value="medium">Medium (31-60 min)</option>
                        <option value="long">Long ({">"} 60 min)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Muscle Group
                      </label>
                      <select
                        value={filterOptions.muscleGroup}
                        onChange={(e) =>
                          setFilterOptions({
                            ...filterOptions,
                            muscleGroup: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                      >
                        <option value="all">All Muscle Groups</option>
                        {allMuscleGroups.map((muscle) => (
                          <option key={muscle} value={muscle}>
                            {muscle}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        setFilterOptions({
                          status: "all",
                          duration: "all",
                          muscleGroup: "all",
                        });
                      }}
                      className="w-full py-1 mt-1 text-sm text-blue-500 hover:text-blue-700"
                    >
                      Reset All Filters
                    </button>
                  </div>
                </div>

                {/* List of Programs */}
                {filteredPrograms.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No programs match your filters</p>
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setFilterOptions({
                          status: "all",
                          duration: "all",
                          muscleGroup: "all",
                        });
                      }}
                      className="mt-2 text-blue-500 hover:text-blue-600"
                    >
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                    {filteredPrograms.map((program) => {
                      const programData = parseProgramData(program);

                      // Get program status
                      const isNotStarted =
                        program.current_week === 1 &&
                        (!program.completed_weeks ||
                          program.completed_weeks.length === 0);
                      const isCompleted =
                        program.completed_weeks &&
                        program.completed_weeks.length >= 6;
                      const statusClass = isCompleted
                        ? "border-green-300 dark:border-green-700"
                        : isNotStarted
                        ? "border-gray-200 dark:border-gray-700"
                        : "border-blue-300 dark:border-blue-700";

                      return (
                        <div
                          key={program.id}
                          id={`program-${program.id}`}
                          className={`border ${statusClass} rounded-lg p-3 cursor-pointer transition-all ${
                            selectedWorkout?.id === program.id
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                              : "hover:border-blue-300 dark:hover:border-blue-700"
                          }`}
                          onClick={() => setSelectedWorkout(program)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">
                                {programData.name || "Workout Program"}
                              </h3>
                              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                                <FaClock className="mr-1" size={12} />{" "}
                                {programData.duration || "45"} min
                                <span className="mx-2">•</span>
                                <FaDumbbell className="mr-1" size={12} />{" "}
                                {programData.workoutsPerWeek || "3"}x/week
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteModalOpen(true);
                                setProgramToDelete(program.id);
                              }}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <FaTrash size={16} />
                            </button>
                          </div>

                          {/* Category badge, if available */}
                          {programData.category && (
                            <div className="mt-2 mb-1">
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${getCategoryBadge(
                                  programData.category
                                )}`}
                              >
                                {programData.category}
                              </span>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-1 mt-2">
                            {programData.targetMuscles
                              ?.slice(0, 3)
                              .map((muscle) => (
                                <span
                                  key={muscle}
                                  className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded-full"
                                >
                                  {muscle}
                                </span>
                              ))}
                            {programData.targetMuscles?.length > 3 && (
                              <span className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-2 py-0.5 rounded-full">
                                +{programData.targetMuscles.length - 3} more
                              </span>
                            )}
                          </div>
                          {renderProgramProgress(program)}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="w-full lg:w-2/3">
              {selectedWorkout ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                    <div>
                      {(() => {
                        const workoutData = parseProgramData(selectedWorkout);
                        return (
                          <>
                            <h2 className="text-xl md:text-2xl font-bold">
                              {workoutData.name}
                            </h2>
                            {workoutData.description && (
                              <p className="text-gray-600 dark:text-gray-400 mt-2">
                                {workoutData.description}
                              </p>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    <div className="flex items-center mt-3 md:mt-0">
                      <div className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full flex items-center">
                        <FaClock className="mr-1 text-gray-500" size={12} />~
                        {(() => {
                          const workoutData = parseProgramData(selectedWorkout);
                          return workoutData.duration || "45";
                        })()} min
                      </div>
                      {(() => {
                        const workoutData = parseProgramData(selectedWorkout);
                        return workoutData.category ? (
                          <div className={`text-sm ml-2 px-3 py-1 rounded-full ${getCategoryBadge(workoutData.category)}`}>
                            {workoutData.category}
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                    {(() => {
                      const workoutData = parseProgramData(selectedWorkout);
                      return (
                        <>
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Focus
                            </div>
                            <div className="font-medium">
                              {workoutData.focusArea || "Full Body"}
                            </div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Sessions/Week
                            </div>
                            <div className="font-medium">
                              {workoutData.workoutsPerWeek || "3"}x
                            </div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Difficulty
                            </div>
                            <div className="font-medium">
                              {workoutData.difficulty || "Intermediate"}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {selectedWorkout.exercises &&
                    selectedWorkout.exercises.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-medium mb-3">
                          Preview Exercises
                        </h3>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                          {selectedWorkout.exercises
                            .slice(0, 5)
                            .map((exercise, index) => (
                              <div
                                key={`${exercise.name}-${index}`}
                                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                              >
                                <div className="flex justify-between">
                                  <div>
                                    <h4 className="font-medium">
                                      {exercise.name}
                                    </h4>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {exercise.muscle}
                                    </div>
                                  </div>
                                  <div className="text-sm">
                                    {exercise.sets}×{exercise.reps} |{" "}
                                    {exercise.rest}s rest
                                  </div>
                                </div>
                              </div>
                            ))}
                          {selectedWorkout.exercises.length > 5 && (
                            <div className="text-center text-gray-500 dark:text-gray-400 text-sm pt-2">
                              + {selectedWorkout.exercises.length - 5} more
                              exercises
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-6">
                    <button
                      onClick={() => window.print()}
                      className="py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center"
                    >
                      <FaPrint className="mr-2" /> Print Workout
                    </button>
                    <button
                      onClick={() =>
                        startProgram(
                          savedPrograms.find((p) => {
                            let programData = p.program_data;
                            if (typeof programData === "string") {
                              try {
                                programData = JSON.parse(programData);
                              } catch (error) {
                                console.error(
                                  "Failed to parse program_data:",
                                  error
                                );
                                return false;
                              }
                            }
                            return programData.id === selectedWorkout.id;
                          })
                        )
                      }
                      className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center"
                    >
                      <FaPlay className="mr-2" /> Start 6-Week Program
                    </button>
                    <button
                      onClick={() => setSelectedWorkout(null)}
                      className="py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center"
                    >
                      <FaEye className="mr-2" /> View Another Program
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <FaEye className="text-3xl text-blue-500" />
                  </div>
                  <h2 className="text-xl font-medium mb-4">
                    Select a workout to view
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Click on a workout from the list to view its details and
                    track your progress
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Delete */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4">
              {programToDelete === "all"
                ? "Delete All Programs"
                : "Delete Program"}
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              {programToDelete === "all"
                ? "Are you sure you want to delete ALL saved workout programs? This cannot be undone."
                : "Are you sure you want to delete this workout program? This cannot be undone."}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  programToDelete === "all"
                    ? deleteAllWorkouts()
                    : deleteWorkout(programToDelete);
                }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setProgramToDelete(null);
                }}
                className="flex-1 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SavedPrograms;
