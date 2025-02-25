import { useState } from "react";
import { Link } from "react-router-dom";

function WorkoutLog() {
  const [workouts, setWorkouts] = useState([]);
  const [exercise, setExercise] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [bodyweight, setBodyweight] = useState("");
  const [notes, setNotes] = useState("");

  const addWorkout = (e) => {
    e.preventDefault();
    if (exercise.trim() && startTime && endTime && bodyweight.trim()) {
      const newWorkout = {
        exercise,
        startTime: new Date(startTime).toLocaleString(),
        endTime: new Date(endTime).toLocaleString(),
        bodyweight,
        notes,
      };
      setWorkouts([...workouts, newWorkout]);
      setExercise("");
      setStartTime("");
      setEndTime("");
      setBodyweight("");
      setNotes("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Workout Log</h1>
      <Link
        to="/add-exercise"
        className="bg-green-500 text-white p-2 rounded-md hover:bg-green-700 mb-4"
      >
        Add Exercise
      </Link>
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={addWorkout}>
          <input
            type="text"
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
            placeholder="Exercise Name"
            className="w-full p-2 border rounded-md mb-2"
            required
          />
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-2 border rounded-md mb-2"
            required
          />
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full p-2 border rounded-md mb-2"
            required
          />
          <input
            type="number"
            value={bodyweight}
            onChange={(e) => setBodyweight(e.target.value)}
            placeholder="Bodyweight (kg)"
            className="w-full p-2 border rounded-md mb-2"
            required
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes"
            className="w-full p-2 border rounded-md mb-2"
          ></textarea>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 mt-3 rounded-md hover:bg-blue-700"
          >
            Add Workout
          </button>
        </form>
        <ul className="mt-4">
          {workouts.map((workout, index) => (
            <li key={index} className="p-2 border-b">
              <strong>Exercise:</strong> {workout.exercise} <br />
              <strong>Start Time:</strong> {workout.startTime} <br />
              <strong>End Time:</strong> {workout.endTime} <br />
              <strong>Bodyweight:</strong> {workout.bodyweight} kg <br />
              <strong>Notes:</strong> {workout.notes}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default WorkoutLog;
