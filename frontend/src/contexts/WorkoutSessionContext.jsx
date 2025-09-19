import React, { createContext, useContext, useState, useEffect } from 'react';

const WorkoutSessionContext = createContext();

export const useWorkoutSession = () => {
  const context = useContext(WorkoutSessionContext);
  if (!context) {
    throw new Error('useWorkoutSession must be used within a WorkoutSessionProvider');
  }
  return context;
};

export const WorkoutSessionProvider = ({ children }) => {
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);

  // Load active workout from localStorage on mount
  useEffect(() => {
    const savedWorkout = localStorage.getItem('activeWorkout');
    if (savedWorkout) {
      try {
        const workoutData = JSON.parse(savedWorkout);
        setActiveWorkout(workoutData);
        setIsWorkoutActive(true);
      } catch (error) {
        console.error('Error loading active workout:', error);
        localStorage.removeItem('activeWorkout');
      }
    }
  }, []);

  // Save workout to localStorage whenever it changes
  useEffect(() => {
    if (activeWorkout) {
      localStorage.setItem('activeWorkout', JSON.stringify(activeWorkout));
    } else {
      localStorage.removeItem('activeWorkout');
    }
  }, [activeWorkout]);

  const startWorkout = (workoutData) => {
    const workout = {
      id: Date.now(),
      startTime: new Date().toISOString(),
      exercises: workoutData.exercises || [],
      notes: workoutData.notes || '',
      workoutName: workoutData.workoutName || 'Custom Workout',
      ...workoutData
    };
    setActiveWorkout(workout);
    setIsWorkoutActive(true);
  };

  const updateWorkout = (updates) => {
    if (activeWorkout) {
      setActiveWorkout(prev => ({
        ...prev,
        ...updates,
        lastUpdated: new Date().toISOString()
      }));
    }
  };

  const addExercise = (exercise) => {
    if (activeWorkout) {
      setActiveWorkout(prev => ({
        ...prev,
        exercises: [...prev.exercises, exercise],
        lastUpdated: new Date().toISOString()
      }));
    }
  };

  const updateExercise = (exerciseIndex, updates) => {
    if (activeWorkout) {
      setActiveWorkout(prev => ({
        ...prev,
        exercises: prev.exercises.map((exercise, index) => 
          index === exerciseIndex ? { ...exercise, ...updates } : exercise
        ),
        lastUpdated: new Date().toISOString()
      }));
    }
  };

  const removeExercise = (exerciseIndex) => {
    if (activeWorkout) {
      setActiveWorkout(prev => ({
        ...prev,
        exercises: prev.exercises.filter((_, index) => index !== exerciseIndex),
        lastUpdated: new Date().toISOString()
      }));
    }
  };

  const finishWorkout = () => {
    setActiveWorkout(null);
    setIsWorkoutActive(false);
  };

  const pauseWorkout = () => {
    if (activeWorkout) {
      setActiveWorkout(prev => ({
        ...prev,
        pausedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }));
    }
  };

  const resumeWorkout = () => {
    if (activeWorkout) {
      setActiveWorkout(prev => {
        const { pausedAt, ...rest } = prev;
        return {
          ...rest,
          lastUpdated: new Date().toISOString()
        };
      });
    }
  };

  const getWorkoutDuration = () => {
    if (!activeWorkout) return 0;
    
    const startTime = new Date(activeWorkout.startTime);
    const currentTime = new Date();
    const pausedTime = activeWorkout.pausedAt ? new Date(activeWorkout.pausedAt) : null;
    
    if (pausedTime) {
      return pausedTime - startTime;
    }
    
    return currentTime - startTime;
  };

  const value = {
    activeWorkout,
    isWorkoutActive,
    startWorkout,
    updateWorkout,
    addExercise,
    updateExercise,
    removeExercise,
    finishWorkout,
    pauseWorkout,
    resumeWorkout,
    getWorkoutDuration
  };

  return (
    <WorkoutSessionContext.Provider value={value}>
      {children}
    </WorkoutSessionContext.Provider>
  );
};
