import { useState } from "react";
import { Link } from "react-router-dom";

function WorkoutLog() {
  const [workouts, setWorkouts] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [bodyweight, setBodyweight] = useState("");
  const [notes, setNotes] = useState("");

  const addWorkout = (e) => {
    e.preventDefault();
    if (startTime && endTime && bodyweight.trim()) {
      const newWorkout = {
        startTime: new Date(startTime).toLocaleString(),
        endTime: new Date(endTime).toLocaleString(),
        bodyweight,
        notes,
      };
      setWorkouts([...workouts, newWorkout]);
      setStartTime("");
      setEndTime("");
      setBodyweight("");
      setNotes("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Workout Log</h1>
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={addWorkout}>
          <Link
            to="/add-exercise"
            className="w-full block text-center bg-green-500 text-white p-2 mb-3 rounded-md hover:bg-green-700"
          >
            Add Exercise
          </Link>
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
