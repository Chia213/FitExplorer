import { useState } from "react";
import { useTheme } from "../hooks/useTheme";

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

function Home() {
  const { theme } = useTheme();
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [hoveredMuscle, setHoveredMuscle] = useState(null);
  const [selectedDotIndex, setSelectedDotIndex] = useState(null);
  const [activeMuscleIndex, setActiveMuscleIndex] = useState(null);

  const allMuscles = [...frontMuscles, ...backMuscles];

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
      <p className="text-center mb-4 max-w-lg">
        Click on any muscle area to explore exercises
      </p>

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
                                {exercise}
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
    </div>
  );
}

export default Home;
