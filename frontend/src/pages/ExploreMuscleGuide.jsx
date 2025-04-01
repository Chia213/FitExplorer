import { useState } from "react";
import { useTheme } from "../hooks/useTheme";
import BodyTypeToggle from "../components/BodyTypeToggle";

const exerciseAssets = {
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
  "Front Raise": {
    type: "animation",
    src: "/src/assets/exercises/front-raise.gif",
    description:
      "Stand holding dumbbells in front of thighs, raise arms forward and up to shoulder height, then lower and repeat.",
  },
  Shrugs: {
    type: "animation",
    src: "/src/assets/exercises/shrugs.gif",
    description:
      "Stand holding weights at sides, lift shoulders up toward ears, hold briefly, then lower and repeat.",
  },

  "Bench Press": {
    type: "animation",
    src: "/src/assets/exercises/bench-press.gif",
    description:
      "Lie on bench, lower barbell to chest, then press up until arms are extended. Repeat.",
  },
  "Push-ups": {
    type: "animation",
    src: "/src/assets/exercises/pushups.gif",
    description:
      "Start in plank position, lower chest to floor by bending elbows, then push back up. Repeat.",
  },
  "Chest Fly": {
    type: "animation",
    src: "/src/assets/exercises/chest-fly.gif",
    description:
      "Lie on bench with dumbbells extended above chest, lower weights out to sides in arc motion, then bring back together.",
  },
  "Dumbbell Press": {
    type: "animation",
    src: "/src/assets/exercises/dumbbell-press.gif",
    description:
      "Lie on bench, press dumbbells up from shoulder level until arms are extended, then lower and repeat.",
  },

  "Bicep Curl": {
    type: "animation",
    src: "/src/assets/exercises/bicep-curl.gif",
    description:
      "Stand with dumbbells at sides, curl weights up while keeping elbows close to torso, then lower and repeat.",
  },
  "Hammer Curl": {
    type: "animation",
    src: "/src/assets/exercises/hammer-curl.gif",
    description:
      "Similar to bicep curl but with palms facing each other throughout movement.",
  },
  "Chin-ups": {
    type: "animation",
    src: "/src/assets/exercises/chinups.gif",
    description:
      "Hang from bar with palms facing you, pull body up until chin is over bar, then lower and repeat.",
  },
  "Preacher Curl": {
    type: "animation",
    src: "/src/assets/exercises/preacher-curl.gif",
    description:
      "Sit at preacher bench, curl weight up while keeping upper arms on pad, then lower and repeat.",
  },

  Crunches: {
    type: "animation",
    src: "/src/assets/exercises/crunches.gif",
    description:
      "Lie on back with knees bent, contract abs to lift shoulders off floor, then lower and repeat.",
  },
  Planks: {
    type: "animation",
    src: "/src/assets/exercises/planks.gif",
    description:
      "Hold push-up position with weight on forearms, keeping body straight from head to heels.",
  },
  "Leg Raises": {
    type: "animation",
    src: "/src/assets/exercises/leg-raises.gif",
    description:
      "Lie on back, keep legs straight and lift them up toward ceiling, then lower and repeat.",
  },
  "Russian Twists": {
    type: "animation",
    src: "/src/assets/exercises/russian-twists.gif",
    description:
      "Sit with knees bent and torso leaned back, twist torso side to side while holding weight.",
  },

  Squats: {
    type: "animation",
    src: "/src/assets/exercises/squats.gif",
    description:
      "Stand with feet shoulder-width apart, bend knees to lower body as if sitting, then stand back up.",
  },
  Lunges: {
    type: "animation",
    src: "/src/assets/exercises/lunges.gif",
    description:
      "Step forward with one leg, lower body until both knees are bent 90 degrees, then push back up.",
  },
  "Leg Press": {
    type: "animation",
    src: "/src/assets/exercises/leg-press.gif",
    description:
      "Sit in leg press machine, push platform away by extending knees, then return to starting position.",
  },
  "Leg Extensions": {
    type: "animation",
    src: "/src/assets/exercises/leg-extensions.gif",
    description:
      "Sit in machine, extend knees to lift weight, then lower and repeat.",
  },

  "Calf Raises": {
    type: "animation",
    src: "/src/assets/exercises/calf-raises.gif",
    description:
      "Stand with balls of feet on edge of step, raise heels up as high as possible, then lower and repeat.",
  },

  "Pull-ups": {
    type: "animation",
    src: "/src/assets/exercises/pullups.gif",
    description:
      "Hang from bar with palms facing away, pull body up until chin is over bar, then lower and repeat.",
  },
  "Lat Pulldowns": {
    type: "animation",
    src: "/src/assets/exercises/lat-pulldowns.gif",
    description:
      "Sit at machine, pull bar down to upper chest while keeping back straight, then return to start.",
  },

  Dips: {
    type: "animation",
    src: "/src/assets/exercises/dips.gif",
    description:
      "Support body between parallel bars, lower body by bending elbows, then push back up.",
  },
  "Tricep Extensions": {
    type: "animation",
    src: "/src/assets/exercises/tricep-extensions.gif",
    description:
      "Hold weight overhead, lower behind head by bending elbows, then extend arms back up.",
  },

  Deadlifts: {
    type: "animation",
    src: "/src/assets/exercises/deadlifts.gif",
    description:
      "Stand with barbell at feet, bend at hips and knees to grasp bar, then stand up straight lifting the bar.",
  },

  "Hip Thrusts": {
    type: "animation",
    src: "/src/assets/exercises/hip-thrusts.gif",
    description:
      "Sit with upper back against bench, barbell across hips, thrust hips upward, then lower and repeat.",
  },

  "Romanian Deadlifts": {
    type: "animation",
    src: "/src/assets/exercises/romanian-deadlifts.gif",
    description:
      "Stand holding barbell, bend at hips while keeping legs nearly straight, then return to standing.",
  },
  "Leg Curls": {
    type: "animation",
    src: "/src/assets/exercises/leg-curls.gif",
    description:
      "Lie face down on machine, curl legs up by bending knees, then lower and repeat.",
  },
};

const getExerciseAsset = (exerciseName) => {
  return (
    exerciseAssets[exerciseName] || {
      type: "image",
      src: "/src/assets/placeholder-exercise.png",
      description: "Demonstration for this exercise will be added soon.",
    }
  );
};

const maleFrontMuscles = [
  {
    name: "Shoulders",
    positions: [
      { top: "19%", left: "16%" },
      { top: "19%", left: "35%" },
    ],
    exercises: ["Shoulder Press", "Lateral Raise", "Front Raise", "Shrugs"],
  },
  {
    name: "Chest",
    positions: [
      { top: "23%", left: "22%" },
      { top: "23%", left: "29%" },
    ],
    exercises: ["Bench Press", "Push-ups", "Chest Fly", "Dumbbell Press"],
  },
  {
    name: "Biceps",
    positions: [
      { top: "29%", left: "14%" },
      { top: "29%", left: "37%" },
    ],
    exercises: ["Bicep Curl", "Hammer Curl", "Chin-ups", "Preacher Curl"],
  },
  {
    name: "Abs",
    positions: [
      { top: "35.5%", left: "27.5%" },
      { top: "35.5%", left: "23.5%" },
    ],
    exercises: ["Crunches", "Planks", "Leg Raises", "Russian Twists"],
  },
  {
    name: "Quads",
    positions: [
      { top: "58%", left: "20%" },
      { top: "58%", left: "31%" },
    ],
    exercises: ["Squats", "Lunges", "Leg Press", "Leg Extensions"],
  },
  {
    name: "Calves",
    positions: [
      { top: "78%", left: "67%" },
      { top: "78%", left: "75%" },
    ],
    exercises: ["Calf Raises", "Seated Calf Press", "Jump Rope"],
  },
];

const maleBackMuscles = [
  {
    name: "Upper Back",
    positions: [
      { top: "15%", left: "67.5%" },
      { top: "15%", left: "74%" },
    ],
    exercises: ["Pull-ups", "Lat Pulldowns", "Rows", "Face Pulls"],
  },
  {
    name: "Triceps",
    positions: [
      { top: "26%", left: "60%" },
      { top: "26%", left: "81.5%" },
    ],
    exercises: [
      "Dips",
      "Tricep Extensions",
      "Close-Grip Bench Press",
      "Skull Crushers",
    ],
  },
  {
    name: "Lower Back",
    positions: [
      { top: "31%", left: "66.5%" },
      { top: "31%", left: "75%" },
    ],
    exercises: ["Deadlifts", "Back Extensions", "Good Mornings", "Superman"],
  },
  {
    name: "Glutes",
    positions: [
      { top: "47%", left: "67%" },
      { top: "47%", left: "74%" },
    ],
    exercises: [
      "Hip Thrusts",
      "Glute Bridges",
      "Kickbacks",
      "Bulgarian Split Squats",
    ],
  },
  {
    name: "Hamstrings",
    positions: [
      { top: "62%", left: "65.5%" },
      { top: "62%", left: "75.5%" },
    ],
    exercises: [
      "Romanian Deadlifts",
      "Leg Curls",
      "Good Mornings",
      "Glute-Ham Raises",
    ],
  },
];

const femaleFrontMuscles = [
  {
    name: "Shoulders",
    positions: [
      { top: "19%", left: "21%" },
      { top: "19%", left: "37%" },
    ],
    exercises: ["Shoulder Press", "Lateral Raise", "Front Raise", "Shrugs"],
  },
  {
    name: "Chest",
    positions: [
      { top: "23%", left: "25%" },
      { top: "23%", left: "32%" },
    ],
    exercises: ["Bench Press", "Push-ups", "Chest Fly", "Dumbbell Press"],
  },
  {
    name: "Biceps",
    positions: [
      { top: "27%", left: "20%" },
      { top: "27%", left: "37.5%" },
    ],
    exercises: ["Bicep Curl", "Hammer Curl", "Chin-ups", "Preacher Curl"],
  },
  {
    name: "Abs",
    positions: [
      { top: "31.5%", left: "30.5%" },
      { top: "31.5%", left: "27.3%" },
    ],
    exercises: ["Crunches", "Planks", "Leg Raises", "Russian Twists"],
  },
  {
    name: "Quads",
    positions: [
      { top: "53%", left: "23.5%" },
      { top: "53%", left: "33.5%" },
    ],
    exercises: ["Squats", "Lunges", "Leg Press", "Leg Extensions"],
  },
  {
    name: "Calves",
    positions: [
      { top: "75%", left: "60.5%" },
      { top: "75%", left: "73.5%" },
    ],
    exercises: ["Calf Raises", "Seated Calf Press", "Jump Rope"],
  },
];

const femaleBackMuscles = [
  {
    name: "Upper Back",
    positions: [
      { top: "16%", left: "65.5%" },
      { top: "16%", left: "70%" },
    ],
    exercises: ["Pull-ups", "Lat Pulldowns", "Rows", "Face Pulls"],
  },
  {
    name: "Triceps",
    positions: [
      { top: "26%", left: "58.5%" },
      { top: "26%", left: "76.5%" },
    ],
    exercises: [
      "Dips",
      "Tricep Extensions",
      "Close-Grip Bench Press",
      "Skull Crushers",
    ],
  },
  {
    name: "Lower Back",
    positions: [
      { top: "30%", left: "64%" },
      { top: "30%", left: "70.9%" },
    ],
    exercises: ["Deadlifts", "Back Extensions", "Good Mornings", "Superman"],
  },
  {
    name: "Glutes",
    positions: [
      { top: "45%", left: "64%" },
      { top: "45%", left: "71%" },
    ],
    exercises: [
      "Hip Thrusts",
      "Glute Bridges",
      "Kickbacks",
      "Bulgarian Split Squats",
    ],
  },
  {
    name: "Hamstrings",
    positions: [
      { top: "59%", left: "62%" },
      { top: "59%", left: "72%" },
    ],
    exercises: [
      "Romanian Deadlifts",
      "Leg Curls",
      "Good Mornings",
      "Glute-Ham Raises",
    ],
  },
];

function ExploreMuscleGuide() {
  const { theme } = useTheme();
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [hoveredMuscle, setHoveredMuscle] = useState(null);
  const [selectedDotIndex, setSelectedDotIndex] = useState(null);
  const [activeMuscleIndex, setActiveMuscleIndex] = useState(null);
  const [viewingExercise, setViewingExercise] = useState(null);
  const [highlightedAreas, setHighlightedAreas] = useState({});
  // New state for body type
  const [bodyType, setBodyType] = useState("male");

  // Body images for different body types
  const bodyImages = {
    male: "/src/assets/titan.png",
    female: "/src/assets/female-titan.png", // You'll need to add this image
  };

  // Determine which muscle data to use based on body type
  const frontMuscles =
    bodyType === "male" ? maleFrontMuscles : femaleFrontMuscles;
  const backMuscles = bodyType === "male" ? maleBackMuscles : femaleBackMuscles;
  const allMuscles = [...frontMuscles, ...backMuscles];

  const getCurrentMuscleName = () => {
    if (activeMuscleIndex !== null) {
      return allMuscles[activeMuscleIndex].name;
    }
    return null;
  };

  const handleDotClick = (muscle, muscleIndex, posIndex) => {
    // Instead of showing a popup, just set the active muscle directly
    if (activeMuscleIndex === muscleIndex) {
      // Toggle off if clicking the same muscle
      setSelectedMuscle(null);
      setSelectedDotIndex(null);
      setActiveMuscleIndex(null);
    } else {
      // Set the new active muscle
      setSelectedMuscle(null);
      setSelectedDotIndex(null);
      setActiveMuscleIndex(muscleIndex);
      setHoveredMuscle(muscle.name);
    }
  };

  const handleImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    let closestMuscle = null;
    let closestIndex = null;
    let minDistance = Infinity;

    allMuscles.forEach((muscle, muscleIndex) => {
      muscle.positions.forEach((position) => {
        const posLeft = parseInt(position.left);
        const posTop = parseInt(position.top);

        const distance = Math.sqrt(
          Math.pow(x - posLeft, 2) + Math.pow(y - posTop, 2)
        );

        if (distance < minDistance && distance < 15) {
          minDistance = distance;
          closestMuscle = muscle;
          closestIndex = muscleIndex;
        }
      });
    });

    if (closestMuscle) {
      // If clicking the same muscle that's already active, deactivate it
      if (activeMuscleIndex === closestIndex) {
        setSelectedMuscle(null);
        setSelectedDotIndex(null);
        setActiveMuscleIndex(null);
      } else {
        // Otherwise, activate the new muscle
        setSelectedMuscle(null);
        setSelectedDotIndex(null);
        setActiveMuscleIndex(closestIndex);
        setHoveredMuscle(closestMuscle.name);
      }
    }
  };

  const handleMouseMove = (e) => {
    // Always process hover effects, even if a muscle is already active
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    let closestMuscle = null;
    let minDistance = Infinity;

    // We'll only highlight one muscle at a time to avoid lagginess
    for (let i = 0; i < allMuscles.length; i++) {
      const muscle = allMuscles[i];

      for (let j = 0; j < muscle.positions.length; j++) {
        const position = muscle.positions[j];
        const posLeft = parseInt(position.left);
        const posTop = parseInt(position.top);

        const distance = Math.sqrt(
          Math.pow(x - posLeft, 2) + Math.pow(y - posTop, 2)
        );

        // Use a slightly larger detection area but only pick the closest one
        if (distance < 15 && distance < minDistance) {
          minDistance = distance;
          closestMuscle = muscle;
          // Break early once we found a very close match
          if (distance < 8) break;
        }
      }

      // If we found a very close match, no need to check other muscles
      if (minDistance < 8) break;
    }

    // Only update state if there's a change to avoid unnecessary re-renders
    if (
      (closestMuscle && closestMuscle.name !== hoveredMuscle) ||
      (!closestMuscle && hoveredMuscle !== null)
    ) {
      const newHighlightedAreas = closestMuscle
        ? { [closestMuscle.name]: true }
        : {};

      setHighlightedAreas(newHighlightedAreas);
      setHoveredMuscle(closestMuscle ? closestMuscle.name : null);
    }
  };

  const handleMouseLeave = () => {
    if (activeMuscleIndex === null) {
      setHoveredMuscle(null);
      setHighlightedAreas({});
    }
  };

  // Toggle body type method
  const toggleBodyType = () => {
    setBodyType((prevType) => (prevType === "male" ? "female" : "male"));
    // Reset selection when switching body types
    setSelectedMuscle(null);
    setSelectedDotIndex(null);
    setActiveMuscleIndex(null);
    setHoveredMuscle(null);
    setHighlightedAreas({});
  };

  return (
    <div className="min-h-screen py-4 px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center">
        Interactive Muscle Guide
      </h1>

      {/* Body Type Toggle */}
      <div className="flex justify-center mb-4">
        <BodyTypeToggle bodyType={bodyType} onToggle={toggleBodyType} />
      </div>

      <div className="mb-4 bg-transparent dark:bg-transparent px-4 py-2 rounded-lg w-full max-w-4xl mx-auto text-center">
        {activeMuscleIndex !== null ? (
          <p className="font-medium">
            Currently Exploring:{" "}
            <span className="text-red-600 font-bold">
              {getCurrentMuscleName()}
            </span>
          </p>
        ) : (
          <p className="text-black dark:text-gray-300 opacity-80">
            Hover over or click on any muscle area to explore exercises
          </p>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6 max-w-5xl mx-auto">
        <div className="md:w-3/5 relative">
          <div className="relative max-h-[500px] overflow-hidden mx-auto">
            <div
              className="absolute inset-0 z-20 cursor-pointer"
              onClick={handleImageClick}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            ></div>

            <img
              key={bodyType}
              src={bodyImages[bodyType]}
              alt={`${
                bodyType.charAt(0).toUpperCase() + bodyType.slice(1)
              } Muscle Anatomy`}
              className="w-full max-h-[500px] object-contain"
            />

            {hoveredMuscle && activeMuscleIndex === null && (
              <div
                className="absolute bg-black bg-opacity-80 text-white px-2 py-1 rounded text-sm whitespace-nowrap
                          transition-opacity duration-200 z-20 pointer-events-none"
                style={{
                  top: "10px",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                {hoveredMuscle}
              </div>
            )}

            {/* Active muscle group dots - always visible when a muscle is selected */}
            {activeMuscleIndex !== null && (
              <div key={`active-dots-${activeMuscleIndex}`}>
                {allMuscles[activeMuscleIndex].positions.map(
                  (position, posIndex) => (
                    <div
                      key={`active-${activeMuscleIndex}-${posIndex}`}
                      style={{
                        position: "absolute",
                        top: position.top,
                        left: position.left,
                        transition: "transform 0.2s ease",
                        zIndex: 10,
                        pointerEvents: "none",
                      }}
                    >
                      <div
                        className="relative"
                        style={{
                          width: "16px",
                          height: "16px",
                          backgroundColor: "#ff6600",
                          borderRadius: "50%",
                          border: "2px solid white",
                          boxShadow: "0 0 4px rgba(0,0,0,0.4)",
                          transform: "scale(1.3)",
                        }}
                      ></div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Hovered muscle group dots - only show when hovering and no active selection */}
            {activeMuscleIndex === null &&
              hoveredMuscle &&
              allMuscles
                .filter((muscle) => muscle.name === hoveredMuscle)
                .map((muscle, idx) => (
                  <div key={`hover-dots-${idx}`}>
                    {muscle.positions.map((position, posIndex) => (
                      <div
                        key={`hover-${idx}-${posIndex}`}
                        style={{
                          position: "absolute",
                          top: position.top,
                          left: position.left,
                          transition: "transform 0.2s ease",
                          zIndex: 10,
                          pointerEvents: "none",
                        }}
                      >
                        <div
                          className="relative"
                          style={{
                            width: "16px",
                            height: "16px",
                            backgroundColor: "#ff0000",
                            borderRadius: "50%",
                            border: "2px solid white",
                            boxShadow: "0 0 4px rgba(0,0,0,0.4)",
                            transform: "scale(1.2)",
                          }}
                        ></div>
                      </div>
                    ))}
                  </div>
                ))}
          </div>
        </div>

        {/* Exercise Details Panel */}
        <div className="md:w-2/5">
          {activeMuscleIndex !== null ? (
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h2 className="text-xl font-bold mb-4">
                {allMuscles[activeMuscleIndex].name} Exercises
              </h2>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {allMuscles[activeMuscleIndex].exercises.map(
                  (exercise, idx) => (
                    <li key={idx} className="py-3">
                      <button
                        onClick={() => setViewingExercise(exercise)}
                        className="flex items-center w-full text-left hover:text-blue-500"
                      >
                        <span className="font-medium">{exercise}</span>
                      </button>
                    </li>
                  )
                )}
              </ul>
              <button
                onClick={() => {
                  setSelectedMuscle(null);
                  setSelectedDotIndex(null);
                  setActiveMuscleIndex(null);
                  setHoveredMuscle(null);
                  setHighlightedAreas({});
                }}
                className="mt-4 w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Reset View
              </button>
            </div>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Select a Muscle Group</h2>

              {/* Fixed height container for hover text to prevent layout shifts */}
              <div className="h-16 mb-4">
                {hoveredMuscle && (
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Hovering over: </span>
                    <span className="text-red-600">{hoveredMuscle}</span>
                    <br />
                    <span className="text-sm">
                      Click to select this muscle group
                    </span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {allMuscles.map((muscle, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveMuscleIndex(idx);
                      setHoveredMuscle(muscle.name);
                    }}
                    onMouseEnter={() => {
                      if (activeMuscleIndex === null) {
                        setHighlightedAreas({ [muscle.name]: true });
                        setHoveredMuscle(muscle.name);
                      }
                    }}
                    onMouseLeave={() => {
                      if (activeMuscleIndex === null) {
                        setHighlightedAreas({});
                        setHoveredMuscle(null);
                      }
                    }}
                    className="text-left p-2 bg-white dark:bg-gray-700 rounded-md hover:bg-blue-50 dark:hover:bg-gray-600"
                  >
                    {muscle.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Exercise Modal */}
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

export default ExploreMuscleGuide;
