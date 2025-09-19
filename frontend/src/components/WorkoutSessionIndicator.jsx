import React from 'react';
import { useLocation } from 'react-router-dom';
import useIsMobile from '../hooks/useIsMobile';
import FloatingWorkoutSession from './FloatingWorkoutSession';
import MobileWorkoutBanner from './MobileWorkoutBanner';

const WorkoutSessionIndicator = () => {
  const isMobile = useIsMobile();
  const location = useLocation();

  // Don't show the workout session indicator if user is on the workout-log page
  // They're already managing their workout there
  if (location.pathname === '/workout-log') {
    return null;
  }

  return isMobile ? <MobileWorkoutBanner /> : <FloatingWorkoutSession />;
};

export default WorkoutSessionIndicator;
