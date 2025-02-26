import { useState } from "react";
import { FaDumbbell, FaInfoCircle } from "react-icons/fa";

const exercisesData = {
  Abs: [
    {
      name: "Crunches",
      image: "/api/placeholder/400/300",
      description:
        "Lie on your back with knees bent, feet flat on the floor. Place hands behind your head, then contract your abs to lift your shoulders off the floor.",
    },
    {
      name: "Leg Raises",
      image: "/api/placeholder/400/300",
      description:
        "Lie flat on your back with legs extended. Keep your lower back pressed into the floor as you lift your legs until they're perpendicular to the floor.",
    },
    {
      name: "Plank",
      image: "/api/placeholder/400/300",
      description:
        "Get into a push-up position with your forearms on the ground. Keep your body in a straight line from head to heels.",
    },
  ],
  Back: [
    {
      name: "Pull-ups",
      image: "/api/placeholder/400/300",
      description:
        "Hang from a bar with palms facing away from you. Pull your body up until your chin is above the bar, then lower back down with control.",
    },
    {
      name: "Deadlifts",
      image: "/api/placeholder/400/300",
      description:
        "Stand with feet hip-width apart, barbell over mid-foot. Bend at hips and knees to grip the bar, then stand up straight while keeping your back flat.",
    },
    {
      name: "Bent-over Rows",
      image: "/api/placeholder/400/300",
      description:
        "Bend forward at your hips with a slight bend in your knees, holding weights. Pull the weights up to your chest while keeping your back flat.",
    },
  ],
  Biceps: [
    {
      name: "Bicep Curls",
      image: "/api/placeholder/400/300",
      description:
        "Stand with dumbbells in hand, arms at your sides, palms facing forward. Curl the weights up to your shoulders, then lower back down.",
    },
    {
      name: "Hammer Curls",
      image: "/api/placeholder/400/300",
      description:
        "Similar to bicep curls, but with palms facing each other throughout the movement.",
    },
    {
      name: "Concentration Curls",
      image: "/api/placeholder/400/300",
      description:
        "Sit on a bench, lean forward, and place your elbow against your inner thigh. Curl the weight up to your shoulder with minimal body movement.",
    },
  ],
  Cardio: [
    {
      name: "Running",
      image: "/api/placeholder/400/300",
      description:
        "A high-impact cardio exercise that increases your heart rate and builds endurance.",
    },
    {
      name: "Cycling",
      image: "/api/placeholder/400/300",
      description:
        "A low-impact cardio option that strengthens your legs while improving cardiovascular health.",
    },
    {
      name: "Jump Rope",
      image: "/api/placeholder/400/300",
      description:
        "An effective cardio exercise that improves coordination and burns calories efficiently.",
    },
  ],
  Chest: [
    {
      name: "Bench Press",
      image: "/api/placeholder/400/300",
      description:
        "Lie on a bench, grip a barbell with hands wider than shoulder width. Lower the bar to your chest, then press back up.",
    },
    {
      name: "Push-ups",
      image: "/api/placeholder/400/300",
      description:
        "Start in a plank position with hands slightly wider than shoulders. Lower your body until your chest nearly touches the floor, then push back up.",
    },
    {
      name: "Chest Fly",
      image: "/api/placeholder/400/300",
      description:
        "Lie on a bench with dumbbells extended above your chest. Lower the weights out to the sides in an arc motion, then bring them back together.",
    },
  ],
  Legs: [
    {
      name: "Squats",
      image: "/api/placeholder/400/300",
      description:
        "Stand with feet shoulder-width apart. Bend your knees and hips to lower your body as if sitting in a chair, then return to standing.",
    },
    {
      name: "Lunges",
      image: "/api/placeholder/400/300",
      description:
        "Step forward with one leg and lower your body until both knees are bent at 90-degree angles. Push back to the starting position and alternate legs.",
    },
    {
      name: "Leg Press",
      image: "/api/placeholder/400/300",
      description:
        "Sit on a leg press machine with feet on the platform. Push the platform away by extending your knees, then return to the starting position.",
    },
  ],
  Shoulders: [
    {
      name: "Shoulder Press",
      image: "/api/placeholder/400/300",
      description:
        "Sit or stand with weights at shoulder height, palms facing forward. Press the weights overhead until arms are extended, then lower back down.",
    },
    {
      name: "Lateral Raises",
      image: "/api/placeholder/400/300",
      description:
        "Stand with dumbbells at your sides. Raise your arms out to the sides until they're at shoulder height, then lower back down.",
    },
    {
      name: "Face Pulls",
      image: "/api/placeholder/400/300",
      description:
        "Using a cable machine with rope attachment, pull the rope toward your face while keeping your elbows high and squeezing your shoulder blades together.",
    },
  ],
  Triceps: [
    {
      name: "Dips",
      image: "/api/placeholder/400/300",
      description:
        "Support your weight on parallel bars or bench edges. Lower your body by bending your elbows, then push back up.",
    },
    {
      name: "Tricep Extensions",
      image: "/api/placeholder/400/300",
      description:
        "Hold a weight overhead with both hands. Lower the weight behind your head by bending your elbows, then extend your arms to raise it back up.",
    },
    {
      name: "Close-Grip Bench Press",
      image: "/api/placeholder/400/300",
      description:
        "Perform a bench press with hands placed closer together (about shoulder-width) to target the triceps more.",
    },
  ],
};

function AddExercise() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [notes, setNotes] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [log, setLog] = useState([]);

  const addLogEntry = () => {
    if (selectedExercise && weight && reps) {
      const newEntry = {
        category: selectedCategory,
        exercise: selectedExercise.name,
        weight,
        reps,
        notes,
      };
      setLog([...log, newEntry]);
      setWeight("");
      setReps("");
      setNotes("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Add Exercise</h1>

      {!selectedCategory ? (
        <div className="w-full max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.keys(exercisesData).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col items-center justify-center gap-2"
              >
                <div className="bg-blue-500 text-white p-3 rounded-full">
                  <FaDumbbell size={24} />
                </div>
                <span className="text-lg font-medium">{category}</span>
              </button>
            ))}
          </div>
        </div>
      ) : !selectedExercise ? (
        <div className="w-full max-w-4xl">
          <h2 className="text-2xl font-bold mb-4">
            {selectedCategory} Exercises
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {exercisesData[selectedCategory].map((exercise) => (
              <div
                key={exercise.name}
                onClick={() => setSelectedExercise(exercise)}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              >
                <img
                  src={exercise.image}
                  alt={exercise.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-bold">{exercise.name}</h3>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                    {exercise.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setSelectedCategory(null)}
            className="mt-6 px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Back to Categories
          </button>
        </div>
      ) : (
        <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md">
            <img
              src={selectedExercise.image}
              alt={selectedExercise.name}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
            <h2 className="text-2xl font-bold mb-2">{selectedExercise.name}</h2>
            <div className="flex items-center mb-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {selectedCategory}
              </span>
              <button
                onClick={() => setShowDescription(!showDescription)}
                className="ml-auto flex items-center gap-1 text-blue-500 hover:text-blue-700"
              >
                <FaInfoCircle />
                {showDescription ? "Hide info" : "Show info"}
              </button>
            </div>

            {showDescription && (
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <p>{selectedExercise.description}</p>
              </div>
            )}

            <button
              onClick={() => setSelectedExercise(null)}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Back to Exercises
            </button>
          </div>

          <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Log Your Set</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Enter weight"
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Reps
                </label>
                <input
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  placeholder="Enter reps"
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this set"
                  className="w-full p-3 border rounded-md h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>

              <button
                onClick={addLogEntry}
                disabled={!weight || !reps}
                className={`w-full p-3 rounded-md text-white font-medium flex items-center justify-center gap-2 ${
                  !weight || !reps
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                <FaDumbbell /> Log Exercise
              </button>
            </div>
          </div>
        </div>
      )}

      {log.length > 0 && (
        <div className="w-full max-w-4xl mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Exercise Log</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exercise
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Weight
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reps
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {log.map((entry, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {entry.exercise}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {entry.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {entry.weight} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {entry.reps}
                    </td>
                    <td className="px-6 py-4">{entry.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddExercise;
