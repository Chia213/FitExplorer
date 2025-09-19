import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutSession } from '../contexts/WorkoutSessionContext';
import { 
  FaTimes, 
  FaDumbbell, 
  FaListUl,
  FaChevronRight
} from 'react-icons/fa';

const MobileWorkoutBanner = () => {
  const navigate = useNavigate();
  const { 
    activeWorkout, 
    isWorkoutActive, 
    finishWorkout
  } = useWorkoutSession();

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
            onClick={handleGoToWorkout}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <FaDumbbell className="w-3 h-3" />
            Go to Workout
            <FaChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileWorkoutBanner;