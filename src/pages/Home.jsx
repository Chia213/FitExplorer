import { useState } from "react";
import { useTheme } from "../hooks/useTheme";
import muscleImage from "../assets/titan.png";

const muscles = [
  {
    name: "Chest",
    position: { top: "19%", left: "10%", width: "10%", height: "10%" },
    exercises: ["Bench Press", "Push-ups", "Chest Fly"],
  },
  {
    name: "Biceps",
    position: { top: "26%", left: "33%", width: "4%", height: "10%" },
    exercises: ["Bicep Curl", "Hammer Curl", "Chin-ups"],
  },
  {
    name: "Triceps",
    position: { top: "23%", left: "63%", width: "4%", height: "10%" },
    exercises: ["Dips", "Tricep Extensions", "Close-Grip Bench Press"],
  },
  {
    name: "Abs",
    position: { top: "30%", left: "15%", width: "11%", height: "15%" },
    exercises: ["Crunches", "Planks", "Leg Raises"],
  },
  {
    name: "Quads",
    position: { top: "73%", left: "67%", width: "8%", height: "12%" },
    exercises: ["Squats", "Lunges", "Leg Press"],
  },
];

function Home() {
  const { theme } = useTheme();
  const [selectedMuscle, setSelectedMuscle] = useState(null);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6">
      <h1 className="text-3xl font-bold mb-6">Select a Muscle Group</h1>

      <div className="relative w-[1024px]">
        <img src={muscleImage} alt="Muscle Groups" className="w-full" />

        {muscles.map((muscle, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              top: muscle.position.top,
              left: muscle.position.left,
              width: muscle.position.width,
              height: muscle.position.height,
              backgroundColor: "rgba(255, 0, 0, 0.4)",
              borderRadius: "10%",
            }}
            className="cursor-pointer hover:opacity-80"
            onClick={() => setSelectedMuscle(muscle)}
          ></div>
        ))}
      </div>

      {selectedMuscle && (
        <div className="mt-6 bg-white text-black p-5 rounded-lg shadow-lg w-80 text-center">
          <h2 className="text-xl font-bold">{selectedMuscle.name} Exercises</h2>
          <ul className="mt-3 space-y-2">
            {selectedMuscle.exercises.map((exercise, idx) => (
              <li key={idx} className="text-lg">
                ✅ {exercise}
              </li>
            ))}
          </ul>
          <button
            onClick={() => setSelectedMuscle(null)}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default Home;
