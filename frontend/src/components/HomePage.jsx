import React from 'react';
import { useAuth } from '../hooks/useAuth';
import LandingPage from '../pages/LandingPage';
import Dashboard from '../pages/Dashboard';
import LoadingSpinner from './LoadingSpinner';

const HomePage = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Show Dashboard for authenticated users, LandingPage for public users
  return isAuthenticated ? <Dashboard /> : <LandingPage />;
};

export default HomePage;
