import React from "react";
import "../styles/loading-spinner.css";

const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner-circle"></div>
        <div className="spinner-dumbbell-left"></div>
        <div className="spinner-dumbbell-right"></div>
      </div>
      <p className="loading-text">Loading your fitness journey...</p>
    </div>
  );
};

export default LoadingSpinner;
