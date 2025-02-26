import { useState } from "react";
import {
  FaStopwatch,
  FaDumbbell,
  FaTrash,
  FaEdit,
  FaCheck,
} from "react-icons/fa";

const muscleGroups = {
  Back: ["Pull-ups", "Deadlifts", "Bent-over Rows"],
  Chest: ["Bench Press", "Push-ups", "Chest Fly"],
  Legs: ["Squats", "Lunges", "Leg Press"],
  Shoulders: ["Shoulder Press", "Lateral Raises", "Face Pulls"],
  Biceps: ["Bicep Curls", "Hammer Curls", "Concentration Curls"],
  Triceps: ["Dips", "Tricep Extensions", "Close-Grip Bench Press"],
};

function WorkoutLog() {
  const [workoutExercises, setWorkoutExercises] = useState([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("");
  const [selectedExercise, setSelectedExercise] = useState("");
  const [exerciseDetails, setExerciseDetails] = useState({
    weight: "",
    reps: "",
    sets: "",
    notes: "",
  });
  const [bodyweight, setBodyweight] = useState("");
  const [notes, setNotes] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [restTimer, setRestTimer] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);
  const [timerOptions] = useState([30, 60, 90, 120]);

  const [history, setHistory] = useState([]);

  const [activeTab, setActiveTab] = useState("current"); // "current" or "history"
  const [editingExerciseIndex, setEditingExerciseIndex] = useState(null);
  const [errors, setErrors] = useState({});

  const startRestTimer = (time) => {
    if (timerRunning) {
      clearInterval(timerInterval);
    }

    setRestTimer(time);
    setTimerRunning(true);

    const interval = setInterval(() => {
      setRestTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerRunning(false);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    setTimerInterval(interval);
  };

  const stopRestTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerRunning(false);
      setRestTimer(null);
    }
  };

  const validateExerciseDetails = () => {
    const newErrors = {};

    if (!selectedExercise) {
      newErrors.exercise = "Please select an exercise";
    }
    if (!exerciseDetails.weight) {
      newErrors.weight = "Weight is required";
    }
    if (!exerciseDetails.reps) {
      newErrors.reps = "Reps are required";
    }
    if (!exerciseDetails.sets) {
      newErrors.sets = "Sets are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddExercise = () => {
    if (validateExerciseDetails()) {
      if (editingExerciseIndex !== null) {
        const updatedExercises = [...workoutExercises];
        updatedExercises[editingExerciseIndex] = {
          name: selectedExercise,
          muscleGroup: selectedMuscleGroup,
          ...exerciseDetails,
        };
        setWorkoutExercises(updatedExercises);
        setEditingExerciseIndex(null);
      } else {
        setWorkoutExercises((prev) => [
          ...prev,
          {
            name: selectedExercise,
            muscleGroup: selectedMuscleGroup,
            ...exerciseDetails,
          },
        ]);
      }

      setSelectedExercise("");
      setExerciseDetails({ weight: "", reps: "", sets: "", notes: "" });
    }
  };

  const editExercise = (index) => {
    const exercise = workoutExercises[index];
    setSelectedMuscleGroup(exercise.muscleGroup);
    setSelectedExercise(exercise.name);
    setExerciseDetails({
      weight: exercise.weight,
      reps: exercise.reps,
      sets: exercise.sets,
      notes: exercise.notes || "",
    });
    setEditingExerciseIndex(index);
  };

  const removeExercise = (index) => {
    setWorkoutExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const validateWorkout = () => {
    const newErrors = {};

    if (workoutExercises.length === 0) {
      newErrors.exercises = "Please add at least one exercise";
    }
    if (!bodyweight) {
      newErrors.bodyweight = "Please enter your bodyweight";
    }
    if (!startTime) {
      newErrors.startTime = "Please set the start time";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const finishWorkout = () => {
    if (validateWorkout()) {
      const newWorkoutSession = {
        id: Date.now(),
        name: "Workout " + (history.length + 1),
        date: new Date().toLocaleDateString(),
        startTime: startTime ? new Date(startTime).toLocaleString() : "Not Set",
        endTime: endTime ? new Date(endTime).toLocaleString() : "Not Set",
        bodyweight,
        notes,
        exercises: workoutExercises,
      };

      setHistory((prev) => [newWorkoutSession, ...prev]);

      setWorkoutExercises([]);
      setSelectedMuscleGroup("");
      setSelectedExercise("");
      setExerciseDetails({ weight: "", reps: "", sets: "", notes: "" });
      setBodyweight("");
      setNotes("");
      setStartTime("");
      setEndTime("");
      setRestTimer(null);
      stopRestTimer();

      setActiveTab("history");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Workout Log</h1>

      <div className="flex w-full max-w-4xl mb-6">
        <button
          onClick={() => setActiveTab("current")}
          className={`flex-1 py-2 px-4 ${
            activeTab === "current"
              ? "bg-blue-500 text-white"
              : "bg-gray-300 text-gray-700"
          } rounded-l-md font-medium transition-colors`}
        >
          Current Workout
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2 px-4 ${
            activeTab === "history"
              ? "bg-blue-500 text-white"
              : "bg-gray-300 text-gray-700"
          } rounded-r-md font-medium transition-colors`}
        >
          Workout History
        </button>
      </div>

      {activeTab === "current" ? (
        <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Add Exercise</h2>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Muscle Group
              </label>
              <select
                value={selectedMuscleGroup}
                onChange={(e) => {
                  setSelectedMuscleGroup(e.target.value);
                  setSelectedExercise("");
                }}
                className={`w-full p-2 border rounded-md ${
                  errors.muscleGroup ? "border-red-500" : ""
                }`}
              >
                <option value="">-- Select Muscle Group --</option>
                {Object.keys(muscleGroups).map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
              {errors.muscleGroup && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.muscleGroup}
                </p>
              )}
            </div>

            {selectedMuscleGroup && (
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Exercise
                </label>
                <select
                  value={selectedExercise}
                  onChange={(e) => setSelectedExercise(e.target.value)}
                  className={`w-full p-2 border rounded-md ${
                    errors.exercise ? "border-red-500" : ""
                  }`}
                >
                  <option value="">-- Select Exercise --</option>
                  {muscleGroups[selectedMuscleGroup].map((exercise) => (
                    <option key={exercise} value={exercise}>
                      {exercise}
                    </option>
                  ))}
                </select>
                {errors.exercise && (
                  <p className="text-red-500 text-sm mt-1">{errors.exercise}</p>
                )}
              </div>
            )}

            {selectedExercise && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={exerciseDetails.weight}
                      onChange={(e) =>
                        setExerciseDetails({
                          ...exerciseDetails,
                          weight: e.target.value,
                        })
                      }
                      placeholder="Enter weight"
                      className={`w-full p-2 border rounded-md ${
                        errors.weight ? "border-red-500" : ""
                      }`}
                    />
                    {errors.weight && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.weight}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Reps
                    </label>
                    <input
                      type="number"
                      value={exerciseDetails.reps}
                      onChange={(e) =>
                        setExerciseDetails({
                          ...exerciseDetails,
                          reps: e.target.value,
                        })
                      }
                      placeholder="Enter reps"
                      className={`w-full p-2 border rounded-md ${
                        errors.reps ? "border-red-500" : ""
                      }`}
                    />
                    {errors.reps && (
                      <p className="text-red-500 text-sm mt-1">{errors.reps}</p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Sets
                  </label>
                  <input
                    type="number"
                    value={exerciseDetails.sets}
                    onChange={(e) =>
                      setExerciseDetails({
                        ...exerciseDetails,
                        sets: e.target.value,
                      })
                    }
                    placeholder="Enter sets"
                    className={`w-full p-2 border rounded-md ${
                      errors.sets ? "border-red-500" : ""
                    }`}
                  />
                  {errors.sets && (
                    <p className="text-red-500 text-sm mt-1">{errors.sets}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={exerciseDetails.notes}
                    onChange={(e) =>
                      setExerciseDetails({
                        ...exerciseDetails,
                        notes: e.target.value,
                      })
                    }
                    placeholder="Any additional notes"
                    className="w-full p-2 border rounded-md h-20"
                  ></textarea>
                </div>

                <button
                  onClick={handleAddExercise}
                  className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <FaDumbbell />
                  {editingExerciseIndex !== null
                    ? "Update Exercise"
                    : "Add Exercise"}
                </button>
              </>
            )}

            <div className="mt-6 p-4 bg-gray-100 rounded-md">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <FaStopwatch />
                Rest Timer
              </h3>

              {restTimer ? (
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{restTimer}s</div>
                  <button
                    onClick={stopRestTimer}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    Stop Timer
                  </button>
                </div>
              ) : (
                <div>
                  <p className="mb-2">Select timer duration:</p>
                  <div className="flex gap-2 flex-wrap">
                    {timerOptions.map((time) => (
                      <button
                        key={time}
                        onClick={() => startRestTimer(time)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      >
                        {time}s
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Current Workout</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={`w-full p-2 border rounded-md ${
                    errors.startTime ? "border-red-500" : ""
                  }`}
                />
                {errors.startTime && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.startTime}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Bodyweight (kg)
              </label>
              <input
                type="number"
                value={bodyweight}
                onChange={(e) => setBodyweight(e.target.value)}
                placeholder="Enter your bodyweight"
                className={`w-full p-2 border rounded-md ${
                  errors.bodyweight ? "border-red-500" : ""
                }`}
              />
              {errors.bodyweight && (
                <p className="text-red-500 text-sm mt-1">{errors.bodyweight}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Workout Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How was your workout?"
                className="w-full p-2 border rounded-md h-20"
              ></textarea>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-lg mb-2">Exercises</h3>
              {workoutExercises.length === 0 ? (
                <p className="text-gray-500 italic">No exercises added yet</p>
              ) : (
                <ul className="divide-y">
                  {workoutExercises.map((exercise, index) => (
                    <li key={index} className="py-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold">{exercise.name}</h4>
                          <p className="text-sm text-gray-600">
                            {exercise.muscleGroup}
                          </p>
                          <p>
                            {exercise.sets} sets × {exercise.reps} reps ×{" "}
                            {exercise.weight} kg
                          </p>
                          {exercise.notes && (
                            <p className="text-sm text-gray-500 mt-1">
                              {exercise.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => editExercise(index)}
                            className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition-colors"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => removeExercise(index)}
                            className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {errors.exercises && (
                <p className="text-red-500 text-sm mt-1">{errors.exercises}</p>
              )}
            </div>

            <button
              onClick={finishWorkout}
              className="w-full bg-green-500 text-white p-3 rounded-md hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <FaCheck />
              Finish Workout
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Workout History</h2>

          {history.length === 0 ? (
            <p className="text-gray-500 italic">No completed workouts yet</p>
          ) : (
            <div className="divide-y">
              {history.map((workout) => (
                <div key={workout.id} className="py-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold">{workout.name}</h3>
                    <span className="text-gray-600">{workout.date}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-2 text-sm">
                    <div>
                      <span className="font-medium">Start:</span>{" "}
                      {workout.startTime}
                    </div>
                    <div>
                      <span className="font-medium">End:</span>{" "}
                      {workout.endTime}
                    </div>
                    <div>
                      <span className="font-medium">Bodyweight:</span>{" "}
                      {workout.bodyweight} kg
                    </div>
                  </div>

                  {workout.notes && (
                    <div className="mb-2 text-gray-700">
                      <span className="font-medium">Notes:</span>{" "}
                      {workout.notes}
                    </div>
                  )}

                  <h4 className="font-bold mt-3 mb-2">Exercises:</h4>
                  <ul className="pl-5 space-y-2">
                    {workout.exercises.map((exercise, idx) => (
                      <li key={idx} className="list-disc">
                        <span className="font-medium">{exercise.name}</span> (
                        {exercise.muscleGroup}): {exercise.sets} sets ×{" "}
                        {exercise.reps} reps × {exercise.weight} kg
                        {exercise.notes && (
                          <span className="block text-sm text-gray-500">
                            {exercise.notes}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WorkoutLog;
