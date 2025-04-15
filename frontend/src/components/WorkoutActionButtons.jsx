import React, { useEffect, useState } from 'react';
import { FaCheck, FaSave } from 'react-icons/fa';
import { isPwaMode } from '../utils/deviceDetection';

/**
 * Fixed action buttons for the workout log
 * Ensures proper display on mobile and PWA mode
 */
const WorkoutActionButtons = ({ onFinishWorkout, onSaveRoutine }) => {
  const [isPwa, setIsPwa] = useState(false);
  
  useEffect(() => {
    // Check if in PWA mode on component mount
    setIsPwa(isPwaMode());
    
    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e) => {
      setIsPwa(e.matches || window.navigator.standalone === true);
    };
    
    mediaQuery.addEventListener('change', handleDisplayModeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-3 flex justify-center space-x-3 shadow-lg"
      style={{
        paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
        zIndex: 40, // Higher z-index to ensure it appears above other elements
        marginBottom: isPwa ? '5rem' : '0'
      }}>
      <button
        onClick={onFinishWorkout}
        className="flex-1 max-w-xs bg-teal-500 hover:bg-teal-400 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center"
      >
        <FaCheck className="mr-2" />
        Finish Workout
      </button>
      <button
        onClick={onSaveRoutine}
        className="flex-1 max-w-xs bg-blue-500 hover:bg-blue-400 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center"
      >
        <FaSave className="mr-2" />
        Save as Routine
      </button>
    </div>
  );
};

export default WorkoutActionButtons; 