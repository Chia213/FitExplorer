import React from 'react';
import useIsMobile from '../hooks/useIsMobile';
import FloatingWorkoutSession from './FloatingWorkoutSession';
import MobileWorkoutBanner from './MobileWorkoutBanner';

const WorkoutSessionIndicator = () => {
  const isMobile = useIsMobile();

  return isMobile ? <MobileWorkoutBanner /> : <FloatingWorkoutSession />;
};

export default WorkoutSessionIndicator;
