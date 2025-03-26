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
} from "react-icons/fa";

function SavedWorkouts() {
  const [savedPrograms, setSavedPrograms] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading saved programs:", error);
        setIsLoading(false);
      }
    };

    fetchSavedPrograms();
  }, [navigate]);

  const deleteAllWorkouts = async () => {
    if (
      confirm(
        "Are you sure you want to delete ALL saved workout programs? This cannot be undone."
      )
    ) {
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
    }
  };

  const deleteWorkout = async (id) => {
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
    // Parse the stored JSON data
    const parsedProgramData = JSON.parse(program.program_data);

    navigate("/program-tracker", {
      state: {
        workout: parsedProgramData,
        progress: {
          currentWeek: program.current_week,
          completedWeeks: program.completed_weeks
            ? JSON.parse(program.completed_weeks)
            : [],
        },
      },
    });
  };

  const renderProgramProgress = (program) => {
    return (
      <div className="mt-2 text-sm">
        <div className="flex items-center space-x-2">
          <FaClock className="text-blue-500" />
          <span>Current Week: {program.current_week}</span>
        </div>
        <div className="flex items-center space-x-2 mt-1">
          <FaCheckCircle className="text-green-500" />
          <span>
            Completed Weeks:{" "}
            {program.completed_weeks
              ? JSON.parse(program.completed_weeks).length
              : 0}
          </span>
        </div>
        <button
          onClick={() => startProgram(program)}
          className="mt-2 flex items-center justify-center w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <FaPlay className="mr-2" /> Continue Program
        </button>
      </div>
    );
  };

  if (!isAuthenticated || isLoading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <Link to="/" className="mr-4 text-blue-500 hover:text-blue-600">
            <FaArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">
            My Saved Workout Programs
          </h1>
        </div>

        {savedPrograms.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
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
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-medium">Your Programs</h2>
                  <button
                    onClick={deleteAllWorkouts}
                    className="text-red-500 hover:text-red-700 text-sm flex items-center"
                  >
                    <FaTrash className="mr-1" size={14} /> Delete All
                  </button>
                </div>
                <div className="space-y-3">
                  {savedPrograms.map((program) => {
                    // Parse the program data
                    const programData = JSON.parse(program.program_data);
                    return (
                      <div
                        key={program.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          selectedWorkout?.id === programData.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                            : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                        }`}
                        onClick={() => setSelectedWorkout(programData)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{programData.title}</h3>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                              <FaClock className="mr-1" size={12} />{" "}
                              {programData.duration} min
                              <span className="mx-2">•</span>
                              <FaDumbbell className="mr-1" size={12} />{" "}
                              {programData.workoutsPerWeek}x/week
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                confirm(
                                  "Are you sure you want to delete this workout?"
                                )
                              ) {
                                deleteWorkout(program.id);
                              }
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
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
              </div>
            </div>

            <div className="w-full lg:w-2/3">
              {selectedWorkout ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl md:text-2xl font-bold">
                      {selectedWorkout.title}
                    </h2>
                    <div className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                      ~{selectedWorkout.duration} min
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => window.print()}
                      className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center"
                    >
                      <FaPrint className="mr-2" /> Print Workout
                    </button>
                    <button
                      onClick={() =>
                        startProgram(
                          savedPrograms.find(
                            (p) =>
                              JSON.parse(p.program_data).id ===
                              selectedWorkout.id
                          )
                        )
                      }
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center"
                    >
                      <FaPlay className="mr-2" /> Start 6-Week Program
                    </button>
                    <button
                      onClick={() => setSelectedWorkout(null)}
                      className="flex-1 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center"
                    >
                      <FaEye className="mr-2" /> View Another Program
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                  <h2 className="text-xl font-medium mb-4">
                    Select a workout to view
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Click on a workout from the list to view its details
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SavedWorkouts;
