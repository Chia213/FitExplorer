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
  const [selectedMuscleIndex, setSelectedMuscleIndex] = useState(null);

  const allMuscles = [...frontMuscles, ...backMuscles];

  const handleDotClick = (muscle, muscleIndex, posIndex) => {
    if (
      selectedMuscle &&
      selectedMuscle.name === muscle.name &&
      selectedMuscleIndex === muscleIndex &&
      selectedDotIndex === posIndex
    ) {
      // If clicking the same dot, close the popup
      setSelectedMuscle(null);
      setSelectedDotIndex(null);
      setSelectedMuscleIndex(null);
    } else {
      // Otherwise, show the popup for this dot
      setSelectedMuscle(muscle);
      setSelectedDotIndex(posIndex);
      setSelectedMuscleIndex(muscleIndex);
    }
  };

  // Function to determine popup position based on dot location
  const getPopupPosition = (position) => {
    const left = parseInt(position.left);

    // For dots on the left side of the body (front view)
    if (left < 40) {
      return {
        left: "100%",
        top: "0",
        marginLeft: "10px",
      };
    }
    // For dots on the right side (back view)
    else if (left > 60) {
      return {
        right: "100%",
        top: "0",
        marginRight: "10px",
      };
    }
    // For centered dots
    else {
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
        Click on any muscle dot to see recommended exercises
      </p>

      <div className="relative w-full max-w-4xl">
        <img
          src="/src/assets/titan.png"
          alt="Muscle Groups - Front and Back View"
          className="w-full"
        />

        {allMuscles.map((muscle, muscleIndex) => (
          <div key={muscleIndex}>
            {muscle.positions.map((position, posIndex) => (
              <div
                key={`${muscleIndex}-${posIndex}`}
                style={{
                  position: "absolute",
                  top: position.top,
                  left: position.left,
                }}
                className="group"
              >
                {/* Dot */}
                <div
                  className="cursor-pointer relative z-10"
                  onClick={() => handleDotClick(muscle, muscleIndex, posIndex)}
                  onMouseEnter={() => setHoveredMuscle(muscle.name)}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  aria-label={`${muscle.name} muscle group`}
                  style={{
                    width: "20px",
                    height: "20px",
                    backgroundColor:
                      selectedMuscle && selectedMuscle.name === muscle.name
                        ? "#ff6600" // Orange for selected
                        : hoveredMuscle === muscle.name
                        ? "#ff0000" // Red for hovered
                        : "#cc0000", // Dark red for normal
                    borderRadius: "50%",
                    border: "2px solid white",
                    boxShadow: "0 0 4px rgba(0,0,0,0.4)",
                    transition: "all 0.2s ease",
                    transform:
                      selectedMuscle && selectedMuscle.name === muscle.name
                        ? "scale(1.3)"
                        : hoveredMuscle === muscle.name
                        ? "scale(1.2)"
                        : "scale(1)",
                  }}
                ></div>

                {/* Muscle name label (appears on hover) */}
                <div
                  className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full 
                              bg-black bg-opacity-80 text-white px-2 py-1 rounded text-sm whitespace-nowrap
                              transition-opacity duration-200 z-20 ${
                                hoveredMuscle === muscle.name ||
                                (selectedMuscle &&
                                  selectedMuscle.name === muscle.name)
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                  style={{
                    marginTop: "-8px",
                  }}
                >
                  {muscle.name}
                </div>

                {/* Popup exercises window */}
                {selectedMuscle &&
                  selectedMuscle.name === muscle.name &&
                  selectedMuscleIndex === muscleIndex &&
                  selectedDotIndex === posIndex && (
                    <div
                      className="absolute bg-white dark:bg-gray-800 text-black dark:text-white p-3 rounded-lg shadow-lg z-30 min-w-48"
                      style={getPopupPosition(position)}
                    >
                      <div className="relative">
                        <h3 className="text-lg font-bold mb-2 pr-6">
                          {muscle.name} Exercises
                        </h3>
                        <button
                          onClick={() => {
                            setSelectedMuscle(null);
                            setSelectedDotIndex(null);
                            setSelectedMuscleIndex(null);
                          }}
                          className="absolute top-0 right-0 w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-700"
                        >
                          ×
                        </button>
                        <ul className="space-y-1 text-sm">
                          {muscle.exercises.map((exercise, idx) => (
                            <li key={idx} className="flex items-center">
                              <span className="mr-1 text-green-500">✓</span>{" "}
                              {exercise}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
