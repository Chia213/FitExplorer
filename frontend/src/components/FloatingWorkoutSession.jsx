import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutSession } from '../contexts/WorkoutSessionContext';
import { 
  FaTimes, 
  FaDumbbell, 
  FaListUl,
  FaChevronDown,
  FaChevronUp,
  FaArrowRight
} from 'react-icons/fa';

const FloatingWorkoutSession = () => {
  const navigate = useNavigate();
  const { 
    activeWorkout, 
    isWorkoutActive, 
    finishWorkout
  } = useWorkoutSession();
  
  const [isExpanded, setIsExpanded] = useState(false);

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
              onClick={handleGoToWorkout}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <FaDumbbell className="w-3 h-3" />
              Go to Workout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingWorkoutSession;