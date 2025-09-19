import React from 'react';
import CustomExerciseManager from '../components/CustomExerciseManager';
import '../styles/custom-exercises.css';

const CustomExercises = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground">
        Custom Exercises
      </h1>
      
      <div className="bg-card rounded-lg shadow-md">
        <CustomExerciseManager />
      </div>
    </div>
  );
};

export default CustomExercises; 