import { useState } from "react";
import { useTheme } from "../hooks/useTheme";

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

const frontMuscles = [
  {
    name: "Shoulders",
    positions: [
      { top: "20%", left: "8%" },
      { top: "20%", left: "32%" },
    ],
    exercises: ["Shoulder Press", "Lateral Raise", "Front Raise", "Shrugs"],
  },
  {
    name: "Chest",
    positions: [
      { top: "23%", left: "15%" },
      { top: "23%", left: "25%" },
    ],
    exercises: ["Bench Press", "Push-ups", "Chest Fly", "Dumbbell Press"],
  },
  {
    name: "Biceps",
    positions: [
      { top: "30%", left: "6%" },
      { top: "30%", left: "34%" },
    ],
    exercises: ["Bicep Curl", "Hammer Curl", "Chin-ups", "Preacher Curl"],
  },
  {
    name: "Abs",
    positions: [
      { top: "36%", left: "22%" },
      { top: "36%", left: "17%" },
    ],
    exercises: ["Crunches", "Planks", "Leg Raises", "Russian Twists"],
  },
  {
    name: "Quads",
    positions: [
      { top: "58%", left: "13%" },
      { top: "58%", left: "28%" },
    ],
    exercises: ["Squats", "Lunges", "Leg Press", "Leg Extensions"],
  },
  {
    name: "Calves",
    positions: [
      { top: "78%", left: "68%" },
      { top: "78%", left: "87%" },
    ],
    exercises: ["Calf Raises", "Seated Calf Press", "Jump Rope"],
  },
];

const backMuscles = [
  {
    name: "Upper Back",
    positions: [
      { top: "16%", left: "73%" },
      { top: "16%", left: "80.5%" },
    ],
    exercises: ["Pull-ups", "Lat Pulldowns", "Rows", "Face Pulls"],
  },
  {
    name: "Triceps",
    positions: [
      { top: "26%", left: "63.5%" },
      { top: "26%", left: "91%" },
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
      { top: "32%", left: "72%" },
      { top: "32%", left: "82%" },
    ],
    exercises: ["Deadlifts", "Back Extensions", "Good Mornings", "Superman"],
  },
  {
    name: "Glutes",
    positions: [
      { top: "47%", left: "72%" },
      { top: "47%", left: "81%" },
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
      { top: "62%", left: "70%" },
      { top: "62%", left: "84%" },
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

  const allMuscles = [...frontMuscles, ...backMuscles];

  const getCurrentMuscleName = () => {
    if (activeMuscleIndex !== null) {
      return allMuscles[activeMuscleIndex].name;
    }
    return null;
  };

  const handleDotClick = (muscle, muscleIndex, posIndex) => {
    if (
      selectedMuscle &&
      selectedMuscle.name === muscle.name &&
      activeMuscleIndex === muscleIndex &&
      selectedDotIndex === posIndex
    ) {
      setSelectedMuscle(null);
      setSelectedDotIndex(null);
      setActiveMuscleIndex(null);
    } else {
      setSelectedMuscle(muscle);
      setSelectedDotIndex(posIndex);
      setActiveMuscleIndex(muscleIndex);
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
      setSelectedMuscle(null);
      setSelectedDotIndex(null);
      setActiveMuscleIndex(closestIndex);
      setHoveredMuscle(closestMuscle.name);
    }
  };

  const getPopupPosition = (position) => {
    const left = parseInt(position.left);

    if (left < 40) {
      return {
        left: "100%",
        top: "0",
        marginLeft: "10px",
      };
    } else if (left > 60) {
      return {
        right: "100%",
        top: "0",
        marginRight: "10px",
      };
    } else {
      return {
        left: "50%",
        top: "100%",
        transform: "translateX(-50%)",
        marginTop: "10px",
      };
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
        Interactive Muscle Guide
      </h1>

      <div className="mb-4 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg w-full max-w-4xl text-center">
        {activeMuscleIndex !== null ? (
          <p className="font-medium">
            Currently Exploring:{" "}
            <span className="text-red-600 font-bold">
              {getCurrentMuscleName()}
            </span>
          </p>
        ) : (
          <p>Click on any muscle area to explore exercises</p>
        )}
      </div>

      <div className="relative w-full max-w-4xl">
        <img
          src="/src/assets/titan.png"
          alt="Muscle Groups - Front and Back View"
          className="w-full cursor-pointer"
          onClick={handleImageClick}
          onMouseMove={(e) => {
            if (activeMuscleIndex === null) {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;

              let closestMuscle = null;
              let minDistance = Infinity;

              allMuscles.forEach((muscle) => {
                muscle.positions.forEach((position) => {
                  const posLeft = parseInt(position.left);
                  const posTop = parseInt(position.top);

                  const distance = Math.sqrt(
                    Math.pow(x - posLeft, 2) + Math.pow(y - posTop, 2)
                  );

                  if (distance < minDistance && distance < 10) {
                    minDistance = distance;
                    closestMuscle = muscle;
                  }
                });
              });

              setHoveredMuscle(closestMuscle ? closestMuscle.name : null);
            }
          }}
          onMouseLeave={() => {
            if (activeMuscleIndex === null) {
              setHoveredMuscle(null);
            }
          }}
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

        {activeMuscleIndex !== null && (
          <div key={`dots-${activeMuscleIndex}`}>
            {allMuscles[activeMuscleIndex].positions.map(
              (position, posIndex) => (
                <div
                  key={`${activeMuscleIndex}-${posIndex}`}
                  style={{
                    position: "absolute",
                    top: position.top,
                    left: position.left,
                    transition: "opacity 0.3s ease, transform 0.2s ease",
                  }}
                  className="group"
                >
                  <div
                    className="cursor-pointer relative z-10"
                    onClick={() =>
                      handleDotClick(
                        allMuscles[activeMuscleIndex],
                        activeMuscleIndex,
                        posIndex
                      )
                    }
                    onMouseEnter={() =>
                      setHoveredMuscle(allMuscles[activeMuscleIndex].name)
                    }
                    onMouseLeave={() => setHoveredMuscle(null)}
                    aria-label={`${allMuscles[activeMuscleIndex].name} muscle group`}
                    style={{
                      width: "20px",
                      height: "20px",
                      backgroundColor:
                        selectedMuscle && selectedDotIndex === posIndex
                          ? "#ff6600"
                          : hoveredMuscle === allMuscles[activeMuscleIndex].name
                          ? "#ff0000"
                          : "#cc0000",
                      borderRadius: "50%",
                      border: "2px solid white",
                      boxShadow: "0 0 4px rgba(0,0,0,0.4)",
                      transition: "all 0.2s ease",
                      transform:
                        selectedMuscle && selectedDotIndex === posIndex
                          ? "scale(1.3)"
                          : hoveredMuscle === allMuscles[activeMuscleIndex].name
                          ? "scale(1.2)"
                          : "scale(1)",
                    }}
                  ></div>

                  {selectedMuscle && selectedDotIndex === posIndex && (
                    <div
                      className="absolute bg-white dark:bg-gray-800 text-black dark:text-white p-3 rounded-lg shadow-lg z-30 min-w-48"
                      style={getPopupPosition(position)}
                    >
                      <div className="relative">
                        <h3 className="text-lg font-bold mb-2 pr-6">
                          {allMuscles[activeMuscleIndex].name} Exercises
                        </h3>
                        <button
                          onClick={() => {
                            setSelectedMuscle(null);
                            setSelectedDotIndex(null);
                            setActiveMuscleIndex(null);
                            setHoveredMuscle(null);
                          }}
                          className="absolute top-0 right-0 w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-700"
                        >
                          ×
                        </button>
                        <ul className="space-y-1 text-sm">
                          {allMuscles[activeMuscleIndex].exercises.map(
                            (exercise, idx) => (
                              <li key={idx} className="flex items-center">
                                <span className="mr-1 text-green-500">✓</span>{" "}
                                <button
                                  onClick={() => setViewingExercise(exercise)}
                                  className="text-left hover:text-blue-500 hover:underline focus:outline-none"
                                >
                                  {exercise}
                                </button>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </div>

      {activeMuscleIndex !== null && (
        <button
          onClick={() => {
            setSelectedMuscle(null);
            setSelectedDotIndex(null);
            setActiveMuscleIndex(null);
            setHoveredMuscle(null);
          }}
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Reset View
        </button>
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
