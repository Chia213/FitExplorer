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
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';

const FloatingWorkoutSession = () => {
  const navigate = useNavigate();
  const { 
    activeWorkout, 
    isWorkoutActive, 
    finishWorkout, 
    pauseWorkout, 
    resumeWorkout,
    getWorkoutDuration 
  } = useWorkoutSession();
  
  const [isExpanded, setIsExpanded] = useState(false);
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
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-card border border-border rounded-lg shadow-xl backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-card-foreground">
              Active Workout
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              {isExpanded ? (
                <FaChevronDown className="w-3 h-3 text-muted-foreground" />
              ) : (
                <FaChevronUp className="w-3 h-3 text-muted-foreground" />
              )}
            </button>
            <button
              onClick={handleFinishWorkout}
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              <FaTimes className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-card-foreground truncate">
              {activeWorkout.workoutName}
            </h3>
            <span className="text-xs text-muted-foreground">
              {formatDuration(duration)}
            </span>
          </div>

          {isExpanded && (
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FaListUl className="w-3 h-3" />
                <span>{activeWorkout.exercises.length} exercises</span>
              </div>
              {activeWorkout.exercises.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <div className="font-medium mb-1">Recent exercises:</div>
                  <div className="space-y-1">
                    {activeWorkout.exercises.slice(-2).map((exercise, index) => (
                      <div key={index} className="truncate">
                        • {exercise.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingWorkoutSession;
