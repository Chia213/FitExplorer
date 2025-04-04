import React, { createContext, useContext, useState, useEffect } from 'react';

const FitnessContext = createContext();

export const FitnessProvider = ({ children }) => {
  const [personalRecords, setPersonalRecords] = useState({});
  const [progressData, setProgressData] = useState({});
  const [goals, setGoals] = useState({});
  
  // Load data from localStorage on mount
  useEffect(() => {
    const savedRecords = localStorage.getItem('personal_records');
    const savedProgress = localStorage.getItem('progress_data');
    const savedGoals = localStorage.getItem('fitness_goals');
    
    if (savedRecords) setPersonalRecords(JSON.parse(savedRecords));
    if (savedProgress) setProgressData(JSON.parse(savedProgress));
    if (savedGoals) setGoals(JSON.parse(savedGoals));
  }, []);
  
  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('personal_records', JSON.stringify(personalRecords));
  }, [personalRecords]);
  
  useEffect(() => {
    localStorage.setItem('progress_data', JSON.stringify(progressData));
  }, [progressData]);
  
  useEffect(() => {
    localStorage.setItem('fitness_goals', JSON.stringify(goals));
  }, [goals]);
  
  const updatePersonalRecord = (exerciseName, recordType, value, date) => {
    setPersonalRecords(prev => ({
      ...prev,
      [`${exerciseName}_${recordType}`]: { value, date }
    }));
  };
  
  const updateProgressData = (metric, value, date) => {
    setProgressData(prev => {
      const newData = { ...prev };
      if (!newData[metric]) newData[metric] = [];
      newData[metric].push({ value, date });
      return newData;
    });
  };
  
  const setGoal = (metric, value) => {
    setGoals(prev => ({
      ...prev,
      [metric]: { value, date: new Date().toISOString(), achieved: false }
    }));
  };
  
  const checkGoalAchievement = () => {
    setGoals(prev => {
      const newGoals = { ...prev };
      
      // Check each goal against personal records
      Object.keys(newGoals).forEach(goalKey => {
        if (personalRecords[goalKey]) {
          const goalValue = newGoals[goalKey].value;
          const recordValue = personalRecords[goalKey].value;
          
          // For pace, lower is better; for everything else, higher is better
          if (goalKey.includes('pace')) {
            newGoals[goalKey].achieved = recordValue <= goalValue;
          } else {
            newGoals[goalKey].achieved = recordValue >= goalValue;
          }
        }
      });
      
      return newGoals;
    });
  };
  
  return (
    <FitnessContext.Provider value={{
      personalRecords,
      progressData,
      goals,
      updatePersonalRecord,
      updateProgressData,
      setGoal,
      checkGoalAchievement
    }}>
      {children}
    </FitnessContext.Provider>
  );
};

export const useFitness = () => useContext(FitnessContext); 