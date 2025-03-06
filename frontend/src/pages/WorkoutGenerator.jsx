import { useState } from "react";
import { Link } from "react-router-dom";

// Use the same exercise assets mapping from your Home.jsx
const exerciseAssets = {
  // Shoulders
  "Shoulder Press": {
    type: "animation",
    src: "/src/assets/exercises/shoulder-press.gif",
    description:
      "Sit with back supported, press dumbbells upward until arms are extended. Lower weights to shoulder level and repeat.",
  },
  "Lateral Raise": {
    type: "animation",
    src: "/src/assets/exercises/lateral-raise.gif",
    description:
      "Stand with dumbbells at sides, raise arms out to sides until parallel with floor, then lower and repeat.",
  },
  // Add more exercises as in your Home.jsx
};

// Helper function for exercises without specific assets
const getExerciseAsset = (exerciseName) => {
  return (
    exerciseAssets[exerciseName] || {
      type: "image",
      src: "/src/assets/placeholder-exercise.png",
      description: "Demonstration for this exercise will be added soon.",
    }
  );
};

function WorkoutGenerator() {
  // State for user preferences
  const [preferences, setPreferences] = useState({
    fitnessLevel: "beginner",
    equipment: "basic",
    duration: 30,
    focusAreas: [],
    goal: "strength",
  });

  // State for generated workout
  const [workout, setWorkout] = useState(null);

  // State for viewing exercise demonstrations
  const [viewingExercise, setViewingExercise] = useState(null);

  // Function to generate a workout based on preferences
  const generateWorkoutPlan = (prefs) => {
    // Map from focus area to exercises
    const exercisesByMuscle = {
      Chest: ["Bench Press", "Push-ups", "Chest Fly", "Dumbbell Press"],
      Back: ["Pull-ups", "Lat Pulldowns", "Rows", "Face Pulls"],
      Shoulders: ["Shoulder Press", "Lateral Raise", "Front Raise", "Shrugs"],
      Arms: ["Bicep Curl", "Hammer Curl", "Tricep Extensions", "Dips"],
      Abs: ["Crunches", "Planks", "Leg Raises", "Russian Twists"],
      Legs: ["Squats", "Lunges", "Leg Press", "Calf Raises"],
    };

    // Equipment filters
    const equipmentFilters = {
      none: ["Push-ups", "Pull-ups", "Dips", "Planks", "Squats", "Lunges"],
      basic: [
        "Dumbbell Press",
        "Bicep Curl",
        "Lateral Raise",
        "Russian Twists",
      ],
      full: ["Bench Press", "Lat Pulldowns", "Leg Press", "Cable Fly"],
    };

    // Determine sets/reps based on goal
    const setsReps = {
      strength: { sets: 5, reps: "5", rest: 180 },
      hypertrophy: { sets: 4, reps: "8-12", rest: 90 },
      endurance: { sets: 3, reps: "15-20", rest: 60 },
      weightloss: { sets: 3, reps: "12-15", rest: 45 },
    };

    // Choose focus areas or default to full body
    let focusAreas =
      prefs.focusAreas.length > 0
        ? prefs.focusAreas
        : ["Chest", "Back", "Shoulders", "Arms", "Abs", "Legs"];

    // For shorter workouts, limit the focus areas
    if (prefs.duration <= 30 && focusAreas.length > 3) {
      focusAreas = focusAreas.slice(0, 3);
    }

    // Determine exercises per focus area based on duration
    const exercisesPerArea = Math.max(1, Math.floor(prefs.duration / 15));

    // Select exercises for each focus area
    const selectedExercises = [];

    focusAreas.forEach((area) => {
      // Get exercises for this muscle group
      let availableExercises = exercisesByMuscle[area] || [];

      // Filter by equipment if needed
      if (prefs.equipment !== "full") {
        availableExercises = availableExercises.filter(
          (ex) =>
            equipmentFilters[prefs.equipment].includes(ex) ||
            !equipmentFilters.full.includes(ex)
        );
      }

      // Randomly select exercises
      for (let i = 0; i < exercisesPerArea; i++) {
        if (availableExercises.length > 0) {
          const randomIndex = Math.floor(
            Math.random() * availableExercises.length
          );
          const exercise = availableExercises[randomIndex];

          selectedExercises.push({
            name: exercise,
            muscle: area,
            sets: setsReps[prefs.goal].sets,
            reps: setsReps[prefs.goal].reps,
            rest: setsReps[prefs.goal].rest,
          });

          // Remove to avoid duplicates
          availableExercises.splice(randomIndex, 1);
        }
      }
    });

    return {
      title: `${
        prefs.fitnessLevel.charAt(0).toUpperCase() + prefs.fitnessLevel.slice(1)
      } ${prefs.goal.charAt(0).toUpperCase() + prefs.goal.slice(1)} Workout`,
      exercises: selectedExercises,
      duration: prefs.duration,
      difficulty: prefs.fitnessLevel,
      restPeriod: setsReps[prefs.goal].rest,
    };
  };

  // Handle form submission
  const generateWorkout = (e) => {
    e.preventDefault();
    const workoutPlan = generateWorkoutPlan(preferences);
    setWorkout(workoutPlan);
  };

  // Handle checkbox changes for focus areas
  const handleFocusAreaChange = (area) => {
    if (preferences.focusAreas.includes(area)) {
      setPreferences({
        ...preferences,
        focusAreas: preferences.focusAreas.filter((a) => a !== area),
      });
    } else {
      setPreferences({
        ...preferences,
        focusAreas: [...preferences.focusAreas, area],
      });
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">
        Workout Generator
      </h1>

      {/* User preferences form */}
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Customize Your Workout</h2>

        <form onSubmit={generateWorkout}>
          {/* Fitness Level */}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              Fitness Level
            </label>
            <select
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-white"
              value={preferences.fitnessLevel}
              onChange={(e) =>
                setPreferences({ ...preferences, fitnessLevel: e.target.value })
              }
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Available Equipment */}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              Available Equipment
            </label>
            <select
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-white"
              value={preferences.equipment}
              onChange={(e) =>
                setPreferences({ ...preferences, equipment: e.target.value })
              }
            >
              <option value="none">Bodyweight Only</option>
              <option value="basic">Basic (Dumbbells, Resistance Bands)</option>
              <option value="full">Full Gym</option>
            </select>
          </div>

          {/* Workout Duration */}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              Workout Duration (minutes)
            </label>
            <select
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-white"
              value={preferences.duration}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  duration: parseInt(e.target.value),
                })
              }
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </div>

          {/* Focus Areas (Multiple Select) */}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              Focus Areas
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["Chest", "Back", "Shoulders", "Arms", "Abs", "Legs"].map(
                (area) => (
                  <label
                    key={area}
                    className="flex items-center text-gray-700 dark:text-gray-300"
                  >
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={preferences.focusAreas.includes(area)}
                      onChange={() => handleFocusAreaChange(area)}
                    />
                    {area}
                  </label>
                )
              )}
            </div>
          </div>

          {/* Workout Goal */}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              Workout Goal
            </label>
            <select
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-white"
              value={preferences.goal}
              onChange={(e) =>
                setPreferences({ ...preferences, goal: e.target.value })
              }
            >
              <option value="strength">Strength</option>
              <option value="hypertrophy">Muscle Building</option>
              <option value="endurance">Endurance</option>
              <option value="weightloss">Weight Loss</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2 mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Generate Workout
          </button>
        </form>
      </div>

      {/* Generated workout display */}
      {workout && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{workout.title}</h2>
            <div className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              {workout.duration} min
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <div className="text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full">
              {workout.difficulty}
            </div>
            <div className="text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded-full">
              Rest: {workout.restPeriod}s
            </div>
          </div>

          {/* Workout exercises */}
          <div className="space-y-4">
            {workout.exercises.map((exercise, index) => (
              <div key={index} className="border-b pb-4 last:border-0">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">
                    {index + 1}. {exercise.name}
                  </h3>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {exercise.muscle}
                  </div>
                </div>

                <div className="flex gap-4 mt-2">
                  <div className="text-sm">
                    <span className="font-bold">Sets:</span> {exercise.sets}
                  </div>
                  <div className="text-sm">
                    <span className="font-bold">Reps:</span> {exercise.reps}
                  </div>
                  <div className="text-sm">
                    <span className="font-bold">Rest:</span> {exercise.rest}s
                  </div>
                </div>

                <button
                  className="mt-2 text-blue-500 hover:text-blue-700 text-sm"
                  onClick={() => setViewingExercise(exercise.name)}
                >
                  View Demonstration
                </button>
              </div>
            ))}
          </div>

          {/* Save/Print buttons */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => window.print()}
              className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white rounded-lg transition-colors"
            >
              Print Workout
            </button>
            <button
              onClick={() => {
                // This would be enhanced with actual save functionality
                alert("Workout saved! (Feature to be implemented)");
              }}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Save Workout
            </button>
          </div>
        </div>
      )}

      {/* Link back to muscle guide */}
      <div className="text-center mt-8">
        <Link to="/" className="text-blue-500 hover:text-blue-700">
          Return to Muscle Guide
        </Link>
      </div>

      {/* Exercise demonstration modal */}
      {viewingExercise && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // Close modal when clicking outside the content
            if (e.target === e.currentTarget) {
              setViewingExercise(null);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{viewingExercise}</h3>
              <button
                onClick={() => setViewingExercise(null)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              {getExerciseAsset(viewingExercise).type === "animation" ? (
                <img
                  src={getExerciseAsset(viewingExercise).src}
                  alt={`${viewingExercise} demonstration`}
                  className="w-full object-contain max-h-80"
                />
              ) : (
                <img
                  src={getExerciseAsset(viewingExercise).src}
                  alt={`${viewingExercise} demonstration`}
                  className="w-full object-contain max-h-80"
                />
              )}
            </div>

            <div className="text-gray-700 dark:text-gray-300">
              <h4 className="font-bold mb-2">How to perform:</h4>
              <p>{getExerciseAsset(viewingExercise).description}</p>
            </div>

            <button
              onClick={() => setViewingExercise(null)}
              className="mt-6 w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkoutGenerator;
