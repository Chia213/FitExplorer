import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaDumbbell,
  FaHourglassHalf,
  FaUserAlt,
  FaWeightHanging,
  FaRunning,
  FaRegSave,
  FaPrint,
  FaRandom,
  FaAngleLeft,
  FaInfoCircle,
  FaVenusMars,
  FaBirthdayCake,
  FaCalendarAlt,
} from "react-icons/fa";

const exerciseAssets = {
  "Shoulder Press": {
    type: "animation",
    src: "/src/assets/exercises/shoulder-press.gif",
    description:
      "Sit with back supported, press dumbbells upward until arms are extended. Lower weights to shoulder level and repeat.",
    muscleWorked: "Shoulders",
    equipment: ["Dumbbells", "Barbell", "Machine"],
    difficulty: "Intermediate",
  },
  "Lateral Raise": {
    type: "animation",
    src: "/src/assets/exercises/lateral-raise.gif",
    description:
      "Stand with dumbbells at sides, raise arms out to sides until parallel with floor, then lower and repeat.",
    muscleWorked: "Shoulders",
    equipment: ["Dumbbells", "Cables"],
    difficulty: "Beginner",
  },
};

const exercisesByMuscle = {
  Chest: [
    "Bench Press",
    "Push-ups",
    "Chest Fly",
    "Dumbbell Press",
    "Incline Press",
    "Decline Push-ups",
    "Cable Crossover",
  ],
  Back: [
    "Pull-ups",
    "Lat Pulldowns",
    "Rows",
    "Face Pulls",
    "Deadlifts",
    "T-Bar Rows",
    "Pullovers",
  ],
  Shoulders: [
    "Shoulder Press",
    "Lateral Raise",
    "Front Raise",
    "Shrugs",
    "Upright Rows",
    "Reverse Fly",
    "Arnold Press",
  ],
  Biceps: [
    "Bicep Curl",
    "Hammer Curl",
    "Preacher Curls",
    "Concentration Curls",
    "Chin-ups",
    "EZ Bar Curls",
    "Incline Dumbbell Curls",
  ],
  Triceps: [
    "Tricep Extensions",
    "Dips",
    "Skull Crushers",
    "Cable Pushdowns",
    "Close-Grip Bench Press",
    "Overhead Tricep Extension",
    "Diamond Push-ups",
  ],
  Abs: [
    "Crunches",
    "Planks",
    "Leg Raises",
    "Russian Twists",
    "Mountain Climbers",
    "Hanging Knee Raises",
    "Ab Rollouts",
  ],
  Quads: [
    "Squats",
    "Leg Press",
    "Leg Extensions",
    "Lunges",
    "Hack Squats",
    "Wall Sits",
    "Step-ups",
  ],
  Hamstrings: [
    "Romanian Deadlifts",
    "Leg Curls",
    "Good Mornings",
    "Glute-Ham Raises",
    "Nordic Curls",
    "Stiff-Legged Deadlifts",
    "Sliding Leg Curls",
  ],
  Glutes: [
    "Hip Thrusts",
    "Glute Bridges",
    "Bulgarian Split Squats",
    "Kickbacks",
    "Donkey Kicks",
    "Sumo Squats",
    "Curtsy Lunges",
  ],
  Calves: [
    "Calf Raises",
    "Seated Calf Press",
    "Jump Rope",
    "Box Jumps",
    "Calf Press on Leg Press Machine",
    "Seated Dumbbell Calf Raise",
    "Standing Barbell Calf Raise",
  ],
};

const getExerciseAsset = (exerciseName) => {
  return (
    exerciseAssets[exerciseName] || {
      type: "image",
      src: "/src/assets/placeholder-exercise.png",
      description: "Demonstration for this exercise will be added soon.",
      muscleWorked: "Multiple",
      equipment: ["Various"],
      difficulty: "Varies",
    }
  );
};

const fitnessLevelInfo = {
  novice:
    "You're new to exercise or returning after a long break. Focus on learning proper form and building basic fitness.",
  beginner:
    "You have some exercise experience but are still developing consistent workout habits and foundational strength.",
  intermediate:
    "You've been exercising regularly for some time and have good technique in most exercises.",
  advanced:
    "You have extensive training experience and are looking to optimize your workouts for specific goals.",
};

function WorkoutGenerator() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return preferences.gender ? true : false;
      case 2:
        return preferences.age >= 13 && preferences.age <= 80 ? true : false;
      case 3:
        return preferences.fitnessGoal ? true : false;
      case 4:
        return preferences.fitnessLevel ? true : false;
      case 5:
        return preferences.workoutsPerWeek >= 1 &&
          preferences.workoutsPerWeek <= 7
          ? true
          : false;
      case 6:
        return preferences.targetMuscles.length > 0 ? true : false;
      case 7:
        return preferences.equipment.length > 0 ? true : false;
      default:
        return true;
    }
  };
  const handleStepValidation = () => {
    switch (currentStep) {
      case 1:
        if (!preferences.gender) {
          alert("Please select your gender");
        }
        break;
      case 2:
        if (preferences.age < 13 || preferences.age > 80) {
          alert("Please enter a valid age between 13 and 80");
        }
        break;
      case 3:
        if (!preferences.fitnessGoal) {
          alert("Please select your fitness goal");
        }
        break;
      case 4:
        if (!preferences.fitnessLevel) {
          alert("Please select your fitness level");
        }
        break;
      case 5:
        if (
          preferences.workoutsPerWeek < 1 ||
          preferences.workoutsPerWeek > 7
        ) {
          alert("Please select between 1 and 7 workouts per week");
        }
        break;
      case 6:
        if (preferences.targetMuscles.length === 0) {
          alert("Please select at least one muscle group to train");
        }
        break;
      case 7:
        if (preferences.equipment.length === 0) {
          alert("Please select at least one type of equipment");
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const [preferences, setPreferences] = useState({
    gender: "",
    age: 30,
    fitnessGoal: "",
    fitnessLevel: "",
    workoutsPerWeek: 3,
    equipment: [],
    targetMuscles: [],
  });

  const [workout, setWorkout] = useState(null);

  const [viewingExercise, setViewingExercise] = useState(null);

  const [viewingLevelInfo, setViewingLevelInfo] = useState(null);

  const [showSuccess, setShowSuccess] = useState(false);

  const getExercisesForEquipment = (muscle, equipmentList) => {
    if (equipmentList.length === 0 || equipmentList.includes("Select all")) {
      return exercisesByMuscle[muscle] || [];
    }

    const allExercises = exercisesByMuscle[muscle] || [];
    return allExercises.filter((exercise) => {
      const exerciseEquipment = exerciseAssets[exercise]?.equipment || [
        "Bodyweight",
      ];
      return exerciseEquipment.some((eq) => equipmentList.includes(eq));
    });
  };

  const generateWorkoutPlan = (prefs) => {
    const setsReps = {
      "Weight Loss": {
        sets: 3,
        reps: "12-15",
        rest: 45,
        tempo: "1-0-1",
        intensity: "60-75%",
      },
      Endurance: {
        sets: 3,
        reps: "15-20",
        rest: 60,
        tempo: "1-0-1",
        intensity: "50-70%",
      },
      "Gain Strength": {
        sets: 5,
        reps: "3-5",
        rest: 180,
        tempo: "2-0-2",
        intensity: "85-95%",
      },
      "Muscle Building": {
        sets: 4,
        reps: "8-12",
        rest: 90,
        tempo: "2-1-2",
        intensity: "70-85%",
      },
    };

    const workoutStructure = {
      novice: {
        warmup: ["Light Cardio (5 min)", "Dynamic Stretching (3 min)"],
        cooldown: ["Static Stretching (5 min)"],
        exerciseDensity: 0.7,
      },
      beginner: {
        warmup: ["Light Cardio (5 min)", "Dynamic Stretching (3 min)"],
        cooldown: ["Static Stretching (5 min)"],
        exerciseDensity: 0.8,
      },
      intermediate: {
        warmup: ["Light Cardio (5 min)", "Dynamic Stretching (5 min)"],
        cooldown: ["Static Stretching (5 min)", "Foam Rolling (3 min)"],
        exerciseDensity: 1.0,
      },
      advanced: {
        warmup: [
          "Light Cardio (5 min)",
          "Dynamic Stretching (5 min)",
          "Activation Exercises (3 min)",
        ],
        cooldown: ["Static Stretching (5 min)", "Foam Rolling (5 min)"],
        exerciseDensity: 1.2,
      },
    };

    let targetMuscles =
      prefs.targetMuscles.length > 0
        ? prefs.targetMuscles
        : [
            "Chest",
            "Back",
            "Shoulders",
            "Biceps",
            "Triceps",
            "Abs",
            "Quads",
            "Hamstrings",
            "Glutes",
            "Calves",
          ];

    let workoutDuration = 60;
    switch (prefs.fitnessLevel) {
      case "novice":
        workoutDuration = 30;
        break;
      case "beginner":
        workoutDuration = 45;
        break;
      case "intermediate":
        workoutDuration = 60;
        break;
      case "advanced":
        workoutDuration = 75;
        break;
      default:
        workoutDuration = 60;
    }

    const exerciseDensity =
      workoutStructure[prefs.fitnessLevel]?.exerciseDensity || 1.0;
    const exercisesPerArea = Math.max(
      1,
      Math.floor(
        ((workoutDuration / 15) * exerciseDensity) / targetMuscles.length
      )
    );

    const selectedExercises = [];

    targetMuscles.forEach((muscle) => {
      let availableExercises = getExercisesForEquipment(
        muscle,
        prefs.equipment
      );

      if (availableExercises.length === 0) {
        availableExercises = getExercisesForEquipment(muscle, ["Bodyweight"]);
      }

      for (let i = 0; i < exercisesPerArea; i++) {
        if (availableExercises.length > 0) {
          const randomIndex = Math.floor(
            Math.random() * availableExercises.length
          );
          const exercise = availableExercises[randomIndex];

          selectedExercises.push({
            name: exercise,
            muscle: muscle,
            sets: setsReps[prefs.fitnessGoal]?.sets || 3,
            reps: setsReps[prefs.fitnessGoal]?.reps || "10-12",
            rest: setsReps[prefs.fitnessGoal]?.rest || 60,
            tempo: setsReps[prefs.fitnessGoal]?.tempo || "2-0-2",
            intensity: setsReps[prefs.fitnessGoal]?.intensity || "70-80%",
          });

          availableExercises.splice(randomIndex, 1);
        }
      }
    });

    let ageAdjustments = [];
    if (prefs.age < 18) {
      ageAdjustments.push("Reduced weights, focus on technique");

      selectedExercises.forEach((ex) => {
        ex.intensity = "60-70%";
      });
    } else if (prefs.age > 65) {
      ageAdjustments.push("Added joint-friendly variations");
      ageAdjustments.push("Extended warm-up recommendation");

      selectedExercises.forEach((ex) => {
        ex.rest += 30;
      });
    }

    const workoutId = Date.now().toString();

    return {
      id: workoutId,
      title: `${
        prefs.fitnessLevel.charAt(0).toUpperCase() + prefs.fitnessLevel.slice(1)
      } ${prefs.fitnessGoal} Workout (${prefs.workoutsPerWeek}x/week)`,
      exercises: selectedExercises,
      duration: workoutDuration,
      difficulty: prefs.fitnessLevel,
      fitnessGoal: prefs.fitnessGoal,
      workoutsPerWeek: prefs.workoutsPerWeek,
      restPeriod: setsReps[prefs.fitnessGoal]?.rest || 60,
      targetMuscles: targetMuscles,
      equipment: prefs.equipment,
      gender: prefs.gender,
      age: prefs.age,
      ageAdjustments: ageAdjustments,
      warmup: workoutStructure[prefs.fitnessLevel]?.warmup || [
        "Light Cardio (5 min)",
        "Dynamic Stretching (5 min)",
      ],
      cooldown: workoutStructure[prefs.fitnessLevel]?.cooldown || [
        "Static Stretching (5 min)",
      ],
      createdAt: new Date().toISOString(),
    };
  };

  const handleNextStep = () => {
    if (!validateCurrentStep()) {
      handleStepValidation();
      return;
    }

    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    } else {
      generateWorkoutHandler();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateWorkoutHandler = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    const workoutPlan = generateWorkoutPlan(preferences);
    setWorkout(workoutPlan);

    try {
      const savedWorkouts = JSON.parse(
        localStorage.getItem("savedWorkouts") || "[]"
      );
      savedWorkouts.push(workoutPlan);
      localStorage.setItem("savedWorkouts", JSON.stringify(savedWorkouts));

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving workout to localStorage:", error);
    }

    setTimeout(() => {
      const workoutResults = document.getElementById("workout-results");
      if (workoutResults) {
        workoutResults.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleEquipmentChange = (equipment) => {
    if (equipment === "Select all") {
      if (preferences.equipment.includes("Select all")) {
        setPreferences({
          ...preferences,
          equipment: [],
        });
      } else {
        setPreferences({
          ...preferences,
          equipment: [
            "Select all",
            "Barbell",
            "Dumbbells",
            "Bodyweight",
            "Machine",
            "Kettlebells",
            "Cables",
          ],
        });
      }
      return;
    }

    if (preferences.equipment.includes("Select all")) {
      setPreferences({
        ...preferences,
        equipment: preferences.equipment
          .filter((e) => e !== "Select all")
          .concat(equipment),
      });
      return;
    }

    if (preferences.equipment.includes(equipment)) {
      setPreferences({
        ...preferences,
        equipment: preferences.equipment.filter((e) => e !== equipment),
      });
    } else {
      setPreferences({
        ...preferences,
        equipment: [...preferences.equipment, equipment],
      });
    }
  };

  const handleMuscleChange = (muscle) => {
    if (preferences.targetMuscles.includes(muscle)) {
      setPreferences({
        ...preferences,
        targetMuscles: preferences.targetMuscles.filter((m) => m !== muscle),
      });
    } else {
      setPreferences({
        ...preferences,
        targetMuscles: [...preferences.targetMuscles, muscle],
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaVenusMars className="mr-2 text-blue-500" /> Select Your Gender
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {["Male", "Female"].map((gender) => (
                <label
                  key={gender}
                  className={`
                    flex items-center justify-center p-6 rounded-lg cursor-pointer transition-all
                    ${
                      preferences.gender === gender
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={gender}
                    checked={preferences.gender === gender}
                    onChange={() => setPreferences({ ...preferences, gender })}
                    className="sr-only"
                  />
                  {gender}
                </label>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaBirthdayCake className="mr-2 text-blue-500" /> Enter Your Age
            </h2>
            <div className="mb-4">
              <input
                type="number"
                min="13"
                max="80"
                value={preferences.age}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    age: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-center text-xl"
              />
              <p className="text-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                Please enter an age between 13 and 80
              </p>
            </div>

            <div className="mt-8">
              <input
                type="range"
                min="13"
                max="80"
                value={preferences.age}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    age: parseInt(e.target.value),
                  })
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>13</span>
                <span>30</span>
                <span>50</span>
                <span>65</span>
                <span>80</span>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaRunning className="mr-2 text-blue-500" /> Select Your Fitness
              Goal
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                "Endurance",
                "Gain Strength",
                "Muscle Building",
                "Weight Loss",
              ].map((goal) => (
                <label
                  key={goal}
                  className={`
                    flex items-center justify-center p-6 rounded-lg cursor-pointer transition-all
                    ${
                      preferences.fitnessGoal === goal
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="fitnessGoal"
                    value={goal}
                    checked={preferences.fitnessGoal === goal}
                    onChange={() =>
                      setPreferences({ ...preferences, fitnessGoal: goal })
                    }
                    className="sr-only"
                  />
                  {goal}
                </label>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaUserAlt className="mr-2 text-blue-500" /> Select Your Fitness
              Level
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {["novice", "beginner", "intermediate", "advanced"].map(
                (level) => (
                  <label
                    key={level}
                    className={`
                    relative flex flex-col items-center justify-center p-6 rounded-lg cursor-pointer transition-all
                    ${
                      preferences.fitnessLevel === level
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }
                  `}
                  >
                    <input
                      type="radio"
                      name="fitnessLevel"
                      value={level}
                      checked={preferences.fitnessLevel === level}
                      onChange={() =>
                        setPreferences({ ...preferences, fitnessLevel: level })
                      }
                      className="sr-only"
                    />
                    <div className="font-medium">
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setViewingLevelInfo(level);
                      }}
                      className={`mt-2 text-xs ${
                        preferences.fitnessLevel === level
                          ? "text-white"
                          : "text-blue-500"
                      }`}
                    >
                      <FaInfoCircle /> More info
                    </button>
                  </label>
                )
              )}
            </div>

            {viewingLevelInfo && (
              <div
                className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
                onClick={() => setViewingLevelInfo(null)}
              >
                <div
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-xl font-bold mb-4 capitalize">
                    {viewingLevelInfo} Level
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {fitnessLevelInfo[viewingLevelInfo]}
                  </p>
                  <button
                    onClick={() => setViewingLevelInfo(null)}
                    className="mt-6 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Got it
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaCalendarAlt className="mr-2 text-blue-500" /> How Many Times Do
              You Want to Workout in a Week?
            </h2>
            <div className="mb-4">
              <div className="flex justify-center mb-6">
                <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center p-1">
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={preferences.workoutsPerWeek}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 1 && value <= 7) {
                        setPreferences({
                          ...preferences,
                          workoutsPerWeek: value,
                        });
                      }
                    }}
                    className="w-16 bg-transparent text-center text-3xl font-bold p-2 focus:outline-none"
                  />
                  <span className="text-gray-500 dark:text-gray-400 ml-2">
                    days / week
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <button
                    key={num}
                    onClick={() =>
                      setPreferences({ ...preferences, workoutsPerWeek: num })
                    }
                    className={`
                      flex items-center justify-center p-3 rounded-lg transition-all
                      ${
                        preferences.workoutsPerWeek === num
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }
                    `}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
                Select between 1 and 7 workouts per week
              </p>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaDumbbell className="mr-2 text-blue-500" /> Select Available
              Equipment
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                "Select all",
                "Barbell",
                "Dumbbells",
                "Bodyweight",
                "Machine",
                "Kettlebells",
                "Cables",
              ].map((equipment) => (
                <label
                  key={equipment}
                  className={`
                    flex items-center justify-center p-4 rounded-lg cursor-pointer transition-all
                    ${
                      preferences.equipment.includes(equipment)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={preferences.equipment.includes(equipment)}
                    onChange={() => handleEquipmentChange(equipment)}
                    className="sr-only"
                  />
                  {equipment}
                </label>
              ))}
            </div>
          </div>
        );

      // Updated layout for step 6 in WorkoutGenerator.jsx
      // This focuses on the specific change to place buttons next to the muscle diagram
      // while maintaining the original size of the muscle diagram

// Updated layout for step 6 in WorkoutGenerator.jsx
// This focuses on the specific change to place buttons next to the muscle diagram
// while maintaining the original size of the muscle diagram

case 6:
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <FaWeightHanging className="mr-2 text-blue-500" /> Select Muscle Groups to Train
      </h2>

      <div className="flex flex-col md:flex-row gap-6 mt-4 items-start">
        {/* Muscle Diagram Container - Keep original size */}
        <div className="relative w-full max-w-md mx-auto md:mx-0 mb-6 mt-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
          <p className="text-center text-sm mb-2">
            Click on the muscle groups you want to train
          </p>
          <div className="relative">
            <img
              src="/src/assets/titan.png"
              alt="Muscle Groups Diagram"
              className="w-full"
            />

            {/* Chest - First Dot */}
            <div
              onClick={() => handleMuscleChange("Chest")}
              className="absolute top-[20%] left-[10%] w-[10%] h-[10%] rounded-full cursor-pointer hover:bg-gray-400 hover:bg-opacity-20"
            >
              {preferences.targetMuscles.includes("Chest") && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
              )}
            </div>

            {/* Chest - Second Dot */}
            <div
              onClick={() => handleMuscleChange("Chest")}
              className="absolute top-[20%] left-[21%] w-[10%] h-[10%] rounded-full cursor-pointer hover:bg-gray-400 hover:bg-opacity-20"
            >
              {preferences.targetMuscles.includes("Chest") && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
              )}
            </div>

            {/* Back - First Dot */}
            <div
              onClick={() => handleMuscleChange("Back")}
              className="absolute top-[29%] left-[68%] w-[10%] h-[10%] rounded-full cursor-pointer hover:bg-gray-400 hover:bg-opacity-20"
            >
              {preferences.targetMuscles.includes("Back") && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
              )}
            </div>

            {/* Back - Second Dot */}
            <div
              onClick={() => handleMuscleChange("Back")}
              className="absolute top-[29%] left-[78%] w-[10%] h-[10%] rounded-full cursor-pointer hover:bg-gray-400 hover:bg-opacity-20"
            >
              {preferences.targetMuscles.includes("Back") && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
              )}
            </div>

            {/* Left Shoulder - First Dot */}
            <div
              onClick={() => handleMuscleChange("Shoulders")}
              className="absolute top-[15%] left-[30%] w-[10%] h-[10%] rounded-full cursor-pointer hover:bg-gray-400 hover:bg-opacity-20"
            >
              {preferences.targetMuscles.includes("Shoulders") && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
              )}
            </div>

            {/* Left Shoulder - Second Dot */}
            <div
              onClick={() => handleMuscleChange("Shoulders")}
              className="absolute top-[15%] left-[2%] w-[10%] h-[10%] rounded-full cursor-pointer hover:bg-gray-400 hover:bg-opacity-20"
            >
              {preferences.targetMuscles.includes("Shoulders") && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
              )}
            </div>

            {/* Right Shoulder - First Dot */}
            <div
              onClick={() => handleMuscleChange("Shoulders")}
              className="absolute top-[15%] left-[60%] w-[10%] h-[10%] rounded-full cursor-pointer hover:bg-gray-400 hover:bg-opacity-20"
            >
              {preferences.targetMuscles.includes("Shoulders") && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
              )}
            </div>

            {/* Right Shoulder - Second Dot */}
            <div
              onClick={() => handleMuscleChange("Shoulders")}
              className="absolute top-[15%] left-[88%] w-[10%] h-[10%] rounded-full cursor-pointer hover:bg-gray-400 hover:bg-opacity-20"
            >
              {preferences.targetMuscles.includes("Shoulders") && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
              )}
            </div>

            {/* Left Bicep - First Dot */}
            <div
              onClick={() => handleMuscleChange("Biceps")}
              className="absolute top-[26%] left-[3%] w-[8%] h-[10%] rounded-full cursor-pointer hover:bg-gray-400 hover:bg-opacity-20"
            >
              {preferences.targetMuscles.includes("Biceps") && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
              )}
            </div>

            {/* Right Bicep - First Dot */}
            <div
              onClick={() => handleMuscleChange("Biceps")}
              className="absolute top-[26%] left-[30%] w-[8%] h-[10%] rounded-full cursor-pointer hover:bg-gray-400 hover:bg-opacity-20"
            >
              {preferences.targetMuscles.includes("Biceps") && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
              )}
            </div>

            {/* Left Triceps - First Dot */}
            <div
              onClick={() => handleMuscleChange("Triceps")}
              className="absolute top-[23%] left-[60%] w-[8%] h-[10%] rounded-full cursor-pointer hover:bg-gray-400 hover:bg-opacity-20"
            >
              {preferences.targetMuscles.includes("Triceps") && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
              )}
            </div>

            {/* Right Triceps - First Dot */}
            <div
              onClick={() => handleMuscleChange("Triceps")}
              className="absolute top-[23%] left-[88%] w-[8%] h-[10%] rounded-full cursor-pointer hover:bg-gray-400 hover:bg-opacity-20"
            >
              {preferences.targetMuscles.includes("Triceps") && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
              )}
            </div>

            {/* Abs Dot */}
            <div
              onClick={() => handleMuscleChange("Abs")}
              className="absolute top-[33%] left-[16%] w-[8%] h-[10%] rounded-full cursor-pointer hover:bg-gray-400 hover:bg-opacity-20"
            >
              {preferences.targetMuscles.includes("Abs") && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
              )}
            </div>

            {/* Left Quads - First Dot */}
            <div
              onClick={() => handleMuscleChange("Quads")}
              className="absolute top-[52%] left-[8%] w-[10%] h-[12%] rounded-full cursor-pointer hover:bg-gray-400 hover:bg-opacity-20"
            >
              {preferences.targetMuscles.includes("Quads") && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
              )}
            </div>

            {/* Right Quads - Second Dot */}
            <div
              onClick={() => handleMuscleChange("Quads")}
              className="absolute top-[52%] left-[23%] w-[10%] h-[12%] rounded-full cursor-pointer hover:bg-gray-400 hover:bg-opacity-20"
            >
              {preferences.targetMuscles.includes("Quads") && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
              )}
            </div>

            {/* Left Hamstrings - First Dot */}
            <div
              onClick={() => handleMuscleChange("Hamstrings")}
              className="absolute top-[56%] left-[67%] w-[10%] h-[12%] rounded-full cursor-pointer hover:bg-gray-400 hover:bg-opacity-20"
            >
              {preferences.targetMuscles.includes("Hamstrings") && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
              )}
            </div>

            {/* Right Hamstrings - Second Dot */}
            <div
              onClick={() => handleMuscleChange("Hamstrings")}
              className="absolute top-[56%] left-[80%] w-[10%] h-[12%] rounded-full cursor-pointer hover:bg-gray-400 hover:bg-opacity-20"
            >
              {preferences.targetMuscles.includes("Hamstrings") && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
              )}
            </div>

            {/* Left Glutes Dot */}
            <div
              onClick={() => handleMuscleChange("Glutes")}
              className="absolute top-[43%] left-[69%] w-[10%] h-[12%] rounded-full cursor-pointer hover:bg-gray-400 hover:bg-opacity-20"
            >
              {preferences.targetMuscles.includes("Glutes") && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
              )}
            </div>

            {/* Right Glutes Dot */}
            <div
              onClick={() => handleMuscleChange("Glutes")}
              className="absolute top-[43%] left-[77%] w-[10%] h-[12%] rounded-full cursor-pointer hover:bg-gray-400 hover:bg-opacity-20"
            >
              {preferences.targetMuscles.includes("Glutes") && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
              )}
            </div>
            {/* Left Calves - First Dot */}
            <div
              onClick={() => handleMuscleChange("Calves")}
              className="absolute top-[75%] left-[68%] w-[8%] h-[10%] rounded-full cursor-pointer hover:bg-gray-400 hover:bg-opacity-20"
            >
              {preferences.targetMuscles.includes("Calves") && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
              )}
            </div>

            {/* Right Calves - Second Dot */}
            <div
              onClick={() => handleMuscleChange("Calves")}
              className="absolute top-[75%] left-[80%] w-[8%] h-[10%] rounded-full cursor-pointer hover:bg-gray-400 hover:bg-opacity-20"
            >
              {preferences.targetMuscles.includes("Calves") && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
              )}
            </div>
          </div>
        </div>

        {/* Muscle Selection Buttons Container */}
        <div className="w-full md:w-auto md:flex-1">
          <p className="font-medium mb-3 text-gray-700 dark:text-gray-300">Select muscle groups:</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              "Chest",
              "Back",
              "Shoulders",
              "Biceps",
              "Triceps",
              "Abs",
              "Quads",
              "Hamstrings",
              "Glutes",
              "Calves",
            ].map((muscle) => (
              <label
                key={muscle}
                className={`
                  flex items-center justify-center p-3 rounded-lg cursor-pointer transition-all text-sm
                  ${
                    preferences.targetMuscles.includes(muscle)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={preferences.targetMuscles.includes(muscle)}
                  onChange={() => handleMuscleChange(muscle)}
                  className="sr-only"
                />
                {muscle}
              </label>
            ))}
          </div>
          
          {/* Select All button at the bottom */}
          <button 
            onClick={() => {
              // Get all muscle names
              const allMuscles = [
                "Chest", "Back", "Shoulders", "Biceps", "Triceps", 
                "Abs", "Quads", "Hamstrings", "Glutes", "Calves"
              ];
              
              // If all muscles are already selected, deselect all
              if (allMuscles.every(muscle => preferences.targetMuscles.includes(muscle))) {
                setPreferences({
                  ...preferences,
                  targetMuscles: []
                });
              } else {
                // Otherwise select all
                setPreferences({
                  ...preferences,
                  targetMuscles: allMuscles
                });
              }
            }}
            className="w-full mt-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            {[
              "Chest", "Back", "Shoulders", "Biceps", "Triceps", 
              "Abs", "Quads", "Hamstrings", "Glutes", "Calves"
            ].every(muscle => preferences.targetMuscles.includes(muscle)) 
              ? "Deselect All Muscles" 
              : "Select All Muscles"}
          </button>
        </div>
      </div>
    </div>
  );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center">
        Personalized Workout Generator
      </h1>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
        Create a custom workout plan tailored to your specific needs and goals
      </p>

      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4, 5, 6, 7].map((step) => (
            <button
              key={step}
              onClick={() => {
                // Only allow navigating to steps that have validation passed
                if (step < currentStep || validateCurrentStep()) {
                  setCurrentStep(step);
                } else {
                  handleStepValidation();
                }
              }}
              className={`text-xs font-medium cursor-pointer transition-all duration-200 px-2 py-1 ${
                currentStep >= step
                  ? "text-blue-500 font-bold"
                  : "text-gray-400 hover:text-gray-500"
              }`}
            >
              Step {step}
            </button>
          ))}
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 7) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        {renderStep()}

        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={handlePrevStep}
            className={`px-6 py-2 rounded-lg transition-colors ${
              currentStep === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-300 hover:bg-gray-400 text-gray-800"
            }`}
            disabled={currentStep === 1}
          >
            Previous
          </button>

          <button
            type="button"
            onClick={handleNextStep}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {currentStep === 7 ? "Generate Workout" : "Next"}
          </button>
        </div>
      </div>

      {showLoginPrompt && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowLoginPrompt(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Login Required</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              You need to be logged in to save your personalized workout. Would
              you like to:
            </p>
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => navigate("/login")}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Create an Account
              </button>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="w-full py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {workout && (
        <div
          id="workout-results"
          className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold">{workout.title}</h2>
            <div className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              ~{workout.duration} min
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {workout.gender && (
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Gender
                </div>
                <div className="font-medium">{workout.gender}</div>
              </div>
            )}
            {workout.age && (
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Age
                </div>
                <div className="font-medium">{workout.age} years</div>
              </div>
            )}
            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Goal
              </div>
              <div className="font-medium">
                {workout.fitnessGoal || "Custom"}
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Level
              </div>
              <div className="font-medium capitalize">{workout.difficulty}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {workout.targetMuscles.map((muscle) => (
              <div
                key={muscle}
                className="text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full"
              >
                {muscle}
              </div>
            ))}
            {workout.ageAdjustments && workout.ageAdjustments.length > 0 && (
              <div className="w-full mt-3">
                <div className="text-sm bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-3 py-2 rounded-lg">
                  <strong>Age-based adjustments:</strong>
                  <ul className="list-disc ml-5 mt-1">
                    {workout.ageAdjustments.map((adj, idx) => (
                      <li key={idx}>{adj}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="mb-6 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Warm-up</h3>
            <ul className="space-y-1">
              {workout.warmup.map((item, idx) => (
                <li
                  key={idx}
                  className="text-gray-700 dark:text-gray-300 flex items-center"
                >
                  <span className="mr-2 text-green-500">•</span> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-medium mb-2">Main Workout</h3>
            {workout.exercises.map((exercise, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-lg">
                    {index + 1}. {exercise.name}
                  </h4>
                  <div className="text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                    {exercise.muscle}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                  <div className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
                    <span className="font-bold">Sets:</span> {exercise.sets}
                  </div>
                  <div className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
                    <span className="font-bold">Reps:</span> {exercise.reps}
                  </div>
                  <div className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
                    <span className="font-bold">Rest:</span> {exercise.rest}s
                  </div>
                  <div className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
                    <span className="font-bold">Tempo:</span> {exercise.tempo}
                  </div>
                </div>

                <button
                  className="mt-3 text-blue-500 hover:text-blue-700 text-sm flex items-center"
                  onClick={() => setViewingExercise(exercise.name)}
                >
                  <span className="mr-1">View Demonstration</span>
                </button>
              </div>
            ))}
          </div>

          <div className="mb-6 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Cool-down</h3>
            <ul className="space-y-1">
              {workout.cooldown.map((item, idx) => (
                <li
                  key={idx}
                  className="text-gray-700 dark:text-gray-300 flex items-center"
                >
                  <span className="mr-2 text-green-500">•</span> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <button
              onClick={() => window.print()}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              <FaPrint className="mr-2" /> Print Workout
            </button>
            {showSuccess && (
              <div className="text-center mt-3 text-sm text-green-600 dark:text-green-500">
                Workout saved successfully to your profile!
              </div>
            )}
          </div>
        </div>
      )}

      {viewingExercise && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
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

            <div className="mb-4">
              <div className="flex gap-2 mb-4">
                <span className="text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                  {getExerciseAsset(viewingExercise).muscleWorked ||
                    "Multiple Muscles"}
                </span>
                <span className="text-sm bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded">
                  {getExerciseAsset(viewingExercise).difficulty || "Varies"}
                </span>
              </div>

              <h4 className="font-bold mb-2">How to perform:</h4>
              <p className="text-gray-700 dark:text-gray-300">
                {getExerciseAsset(viewingExercise).description}
              </p>
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
