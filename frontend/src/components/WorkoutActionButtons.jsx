import React, { useEffect, useState } from 'react';
import { FaCheck, FaSave } from 'react-icons/fa';
import { isPwaMode } from '../utils/deviceDetection';

/**
 * Fixed action buttons for the workout log
 * Ensures proper display on mobile and PWA mode
 */
const WorkoutActionButtons = ({ onFinishWorkout, onSaveRoutine }) => {
  const [isPwa, setIsPwa] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  
  useEffect(() => {
    // Check if in PWA mode on component mount
    setIsPwa(isPwaMode());
    
    // Check if mobile device and iOS
    const checkDevice = () => {
      const iOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      setIsIOS(iOS);
      setIsMobile(window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e) => {
      setIsPwa(e.matches || window.navigator.standalone === true);
    };
    
    mediaQuery.addEventListener('change', handleDisplayModeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
      window.removeEventListener('resize', checkDevice);
    };
  }, []);
  
  // Force a re-render after component mount to ensure visibility
  useEffect(() => {
    // Force re-render after a delay
    const timer = setTimeout(() => {
      setIsMobile((prev) => prev);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div 
      id="workout-action-buttons"
      className="workout-bottom-buttons fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-3 flex justify-center space-x-3 shadow-lg"
      style={{
        paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
        zIndex: 9999, // Very high z-index to ensure it appears above everything
        position: 'fixed',
        bottom: isMobile ? '64px' : '0', // Position above bottom navbar on mobile
        left: 0,
        right: 0,
        boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
        transform: 'translateZ(0)', // Force hardware acceleration
        opacity: 1,
        visibility: 'visible',
        marginBottom: isIOS ? '0' : (isPwa ? '0' : '0'), // Adjusted for iOS
        backgroundColor: 'white',
        borderTop: '1px solid #f0f0f0'
      }}
    >
      <button
        onClick={onFinishWorkout}
        className="workout-finish-btn flex-1 bg-teal-500 hover:bg-teal-400 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center"
        style={{
          minHeight: isMobile ? '44px' : '48px',
          fontSize: isMobile ? '0.875rem' : '1rem',
          maxWidth: isMobile ? '45%' : 'xs',
          margin: 0,
          fontWeight: 500,
          backgroundColor: 'rgb(20, 184, 166)' // Ensure color is set explicitly
        }}
      >
        <FaCheck className="mr-1" style={{ width: isMobile ? '0.875rem' : '1rem', height: isMobile ? '0.875rem' : '1rem' }} />
        <span style={{ color: 'white', fontWeight: 500, whiteSpace: 'nowrap' }}>Finish Workout</span>
      </button>
      <button
        onClick={onSaveRoutine}
        className="workout-save-btn flex-1 bg-blue-500 hover:bg-blue-400 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center"
        style={{
          minHeight: isMobile ? '44px' : '48px',
          fontSize: isMobile ? '0.875rem' : '1rem',
          maxWidth: isMobile ? '45%' : 'xs',
          margin: 0,
          fontWeight: 500,
          backgroundColor: 'rgb(59, 130, 246)' // Ensure color is set explicitly
        }}
      >
        <FaSave className="mr-1" style={{ width: isMobile ? '0.875rem' : '1rem', height: isMobile ? '0.875rem' : '1rem' }} />
        <span style={{ color: 'white', fontWeight: 500, whiteSpace: 'nowrap' }}>Save as Routine</span>
      </button>
    </div>
  );
};

export default WorkoutActionButtons; 