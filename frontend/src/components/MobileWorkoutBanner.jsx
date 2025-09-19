import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutSession } from '../contexts/WorkoutSessionContext';
import { 
  FaPlay, 
  FaPause, 
  FaStop, 
  FaTimes, 
  FaDumbbell, 
  FaClock,
  FaListUl,
  FaChevronRight
} from 'react-icons/fa';

const MobileWorkoutBanner = () => {
  const navigate = useNavigate();
  const { 
    activeWorkout, 
    isWorkoutActive, 
    finishWorkout, 
    pauseWorkout, 
    resumeWorkout,
    getWorkoutDuration 
  } = useWorkoutSession();
  
  const [duration, setDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Update duration every second
  useEffect(() => {
    if (!isWorkoutActive) return;

    const interval = setInterval(() => {
      setDuration(getWorkoutDuration());
    }, 1000);

    return () => clearInterval(interval);
  }, [isWorkoutActive, getWorkoutDuration]);

  // Check if workout is paused
  useEffect(() => {
    if (activeWorkout?.pausedAt) {
      setIsPaused(true);
    } else {
      setIsPaused(false);
    }
  }, [activeWorkout]);

  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${minutes % 60 < 10 ? '0' : ''}${minutes % 60}:${seconds % 60 < 10 ? '0' : ''}${seconds % 60}`;
    }
    return `${minutes}:${seconds % 60 < 10 ? '0' : ''}${seconds % 60}`;
  };

  const handleResumeWorkout = () => {
    if (isPaused) {
      resumeWorkout();
    } else {
      pauseWorkout();
    }
  };

  const handleFinishWorkout = () => {
    if (window.confirm('Are you sure you want to finish this workout? This action cannot be undone.')) {
      finishWorkout();
    }
  };

  const handleGoToWorkout = () => {
    navigate('/workout-log');
  };

  if (!isWorkoutActive || !activeWorkout) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-lg">
      <div className="p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-card-foreground">
              Active Workout
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDuration(duration)}
            </span>
          </div>
          <button
            onClick={handleFinishWorkout}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <FaTimes className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Workout Info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-card-foreground truncate">
              {activeWorkout.workoutName}
            </h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <FaListUl className="w-3 h-3" />
                <span>{activeWorkout.exercises.length} exercises</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleResumeWorkout}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {isPaused ? (
              <>
                <FaPlay className="w-3 h-3" />
                Resume
              </>
            ) : (
              <>
                <FaPause className="w-3 h-3" />
                Pause
              </>
            )}
          </button>
          <button
            onClick={handleGoToWorkout}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-muted text-muted-foreground rounded-md text-sm font-medium hover:bg-muted/80 transition-colors"
          >
            <FaDumbbell className="w-3 h-3" />
            Continue
            <FaChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileWorkoutBanner;
