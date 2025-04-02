import React from "react";
import "../styles/WorkoutPopup.css"; // Optional: for custom styles

const WorkoutPopup = ({ workout, onClose }) => {
  // Check if workout is defined and has the necessary properties
  if (!workout) {
    return null; // If no workout is provided, don't render anything
  }

  return (
    <div className="workout-popup-overlay">
      <div className="workout-popup">
        <h2>{workout.name || "Workout Details"}</h2>{" "}
        {/* Use workout.name or a default title */}
        <div className="workout-details">
          <p>
            <strong>Sets:</strong> {workout.sets || "N/A"}{" "}
            {/* Default to "N/A" if not available */}
          </p>
          <p>
            <strong>Reps:</strong> {workout.reps || "N/A"}{" "}
            {/* Default to "N/A" if not available */}
          </p>
          <p>
            <strong>Rest:</strong> {workout.rest || "N/A"}{" "}
            {/* Default to "N/A" if not available */}
          </p>
        </div>
        <div className="popup-actions">
          <button className="close-button" onClick={onClose}>
            Close
          </button>
          <button className="view-exercises-button">View Exercises</button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutPopup;
