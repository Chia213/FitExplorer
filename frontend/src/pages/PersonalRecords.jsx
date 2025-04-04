import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaTrophy,
  FaFilter,
  FaSearch,
  FaDumbbell,
  FaRunning,
  FaCalendarAlt,
  FaChartLine,
  FaFire,
  FaRegCalendarAlt,
} from "react-icons/fa";
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement);

const API_BASE_URL = "http://localhost:8000";

function PersonalRecords() {
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all"); // "all", "strength", "cardio"
  const [searchQuery, setSearchQuery] = useState("");
  const [weightUnit, setWeightUnit] = useState(() => {
    return localStorage.getItem("weightUnit") || "kg";
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchWorkoutHistory(token);
  }, [navigate]);

  async function fetchWorkoutHistory(token) {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/workouts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch workouts");

      const data = await response.json();
      
      // Process workout data similar to WorkoutHistory.jsx
      const processedWorkouts = data.map((workout) => {
        if (!workout.exercises) {
          workout.exercises = [];
          return workout;
        }

        if (typeof workout.exercises === "string") {
          try {
            workout.exercises = JSON.parse(workout.exercises);
          } catch (e) {
            console.error("Error parsing exercises JSON:", e);
            workout.exercises = [];
          }
        }

        if (!Array.isArray(workout.exercises)) {
          workout.exercises = [];
        }

        workout.exercises = workout.exercises.map((exercise) => {
          if (exercise.category === "Cardio") {
            exercise.is_cardio = true;
          }
          return exercise;
        });

        return workout;
      });

      setWorkoutHistory(processedWorkouts);
      setError(null);
    } catch (error) {
      console.error("Error fetching workouts:", error);
      setError("Failed to load workout history. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  const personalRecords = useMemo(() => {
    const records = {};
    
    workoutHistory.forEach(workout => {
      workout.exercises?.forEach(exercise => {
        if (exercise.is_cardio) {
          // For cardio, track fastest pace or longest distance
          const totalDistance = exercise.sets?.reduce((sum, set) => sum + (parseFloat(set.distance) || 0), 0) || 0;
          const totalDuration = exercise.sets?.reduce((sum, set) => sum + (parseFloat(set.duration) || 0), 0) || 0;
          
          if (totalDistance > 0 && totalDuration > 0) {
            const pace = totalDuration / totalDistance; // min/km
            
            if (!records[exercise.name] || 
                (records[exercise.name].type === 'pace' && pace < records[exercise.name].value)) {
              records[exercise.name] = {
                type: 'pace',
                value: pace,
                display: `${pace.toFixed(2)} min/km`,
                date: workout.date || workout.start_time,
                category: 'cardio'
              };
            }
            
            if (!records[`${exercise.name}_distance`] || 
                totalDistance > records[`${exercise.name}_distance`].value) {
              records[`${exercise.name}_distance`] = {
                type: 'distance',
                value: totalDistance,
                display: `${totalDistance.toFixed(2)} km`,
                date: workout.date || workout.start_time,
                category: 'cardio'
              };
            }
          }
        } else {
          // For strength, track max weight for different rep ranges
          exercise.sets?.forEach(set => {
            if (set.weight && set.reps) {
              const key = `${exercise.name}_${set.reps}reps`;
              if (!records[key] || parseFloat(set.weight) > records[key].value) {
                records[key] = {
                  type: 'weight',
                  value: parseFloat(set.weight),
                  display: `${set.weight}${workout.weight_unit || 'kg'} × ${set.reps}`,
                  date: workout.date || workout.start_time,
                  category: 'strength',
                  reps: set.reps
                };
              }
            }
          });
        }
      });
    });
    
    return Object.entries(records)
      .map(([key, record]) => ({
        name: key.split('_')[0],
        ...record
      }));
  }, [workoutHistory]);

  const filteredRecords = useMemo(() => {
    return personalRecords.filter(record => {
      // Filter by category
      if (filterCategory !== 'all' && record.category !== filterCategory) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery && !record.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [personalRecords, filterCategory, searchQuery]);

  // Group records by exercise name
  const groupedRecords = useMemo(() => {
    const groups = {};
    
    filteredRecords.forEach(record => {
      if (!groups[record.name]) {
        groups[record.name] = [];
      }
      groups[record.name].push(record);
    });
    
    return Object.entries(groups).map(([name, records]) => ({
      name,
      records: records.sort((a, b) => {
        // For strength records, sort by reps
        if (a.category === 'strength' && b.category === 'strength') {
          return a.reps - b.reps;
        }
        return 0;
      })
    }));
  }, [filteredRecords]);

  const generateProgressChart = (exerciseName, recordType) => {
    // Filter workouts that contain this exercise
    const relevantWorkouts = workoutHistory
      .filter(workout => 
        workout.exercises?.some(ex => ex.name === exerciseName)
      )
      .sort((a, b) => new Date(a.date || a.start_time) - new Date(b.date || b.start_time));
      
    if (relevantWorkouts.length < 2) return null;
    
    const data = relevantWorkouts.map(workout => {
      const exercise = workout.exercises.find(ex => ex.name === exerciseName);
      
      if (recordType === 'weight') {
        // For strength, find max weight for any set
        const maxWeight = Math.max(...exercise.sets.map(set => parseFloat(set.weight) || 0));
        return {
          date: new Date(workout.date || workout.start_time),
          value: maxWeight
        };
      } else if (recordType === 'pace') {
        // For cardio pace
        const totalDistance = exercise.sets?.reduce((sum, set) => sum + (parseFloat(set.distance) || 0), 0) || 0;
        const totalDuration = exercise.sets?.reduce((sum, set) => sum + (parseFloat(set.duration) || 0), 0) || 0;
        
        if (totalDistance > 0 && totalDuration > 0) {
          return {
            date: new Date(workout.date || workout.start_time),
            value: totalDuration / totalDistance // min/km
          };
        }
        return null;
      } else if (recordType === 'distance') {
        // For cardio distance
        const totalDistance = exercise.sets?.reduce((sum, set) => sum + (parseFloat(set.distance) || 0), 0) || 0;
        return {
          date: new Date(workout.date || workout.start_time),
          value: totalDistance
        };
      }
      return null;
    }).filter(Boolean);
    
    if (data.length < 2) return null;
    
    return {
      labels: data.map(d => d.date.toLocaleDateString()),
      datasets: [{
        label: recordType === 'weight' ? 'Max Weight' : recordType === 'pace' ? 'Pace (min/km)' : 'Distance (km)',
        data: data.map(d => d.value),
        borderColor: recordType === 'weight' ? '#4F46E5' : recordType === 'pace' ? '#10B981' : '#F59E0B',
        backgroundColor: recordType === 'weight' ? 'rgba(79, 70, 229, 0.1)' : recordType === 'pace' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
        tension: 0.1,
        fill: true
      }]
    };
  };

  const [selectedRecordForChart, setSelectedRecordForChart] = useState(null);

  // Add this function to get record history
  const getRecordHistory = (exerciseName, recordType) => {
    const history = [];
    
    workoutHistory.forEach(workout => {
      workout.exercises?.forEach(exercise => {
        if (exercise.name !== exerciseName) return;
        
        if (recordType === 'weight') {
          // For strength exercises
          exercise.sets?.forEach(set => {
            if (set.weight && set.reps) {
              history.push({
                date: workout.date || workout.start_time,
                value: parseFloat(set.weight),
                reps: set.reps,
                display: `${set.weight}${workout.weight_unit || 'kg'} × ${set.reps}`,
                workoutName: workout.name
              });
            }
          });
        } else if (recordType === 'pace' || recordType === 'distance') {
          // For cardio exercises
          const totalDistance = exercise.sets?.reduce((sum, set) => sum + (parseFloat(set.distance) || 0), 0) || 0;
          const totalDuration = exercise.sets?.reduce((sum, set) => sum + (parseFloat(set.duration) || 0), 0) || 0;
          
          if (totalDistance > 0 && totalDuration > 0) {
            history.push({
              date: workout.date || workout.start_time,
              distance: totalDistance,
              duration: totalDuration,
              pace: totalDuration / totalDistance,
              display: recordType === 'pace' 
                ? `${(totalDuration / totalDistance).toFixed(2)} min/km` 
                : `${totalDistance.toFixed(2)} km`,
              workoutName: workout.name
            });
          }
        }
      });
    });
    
    return history.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Add state for viewing history
  const [viewingHistory, setViewingHistory] = useState(null);

  // Add these states
  const [goals, setGoals] = useState(() => {
    const savedGoals = localStorage.getItem('fitness_goals');
    return savedGoals ? JSON.parse(savedGoals) : {};
  });
  const [settingGoal, setSettingGoal] = useState(null);
  const [goalValue, setGoalValue] = useState('');

  // Add this function to save goals
  const saveGoal = () => {
    if (!settingGoal || !goalValue) return;
    
    const newGoals = {
      ...goals,
      [`${settingGoal.name}_${settingGoal.type}`]: {
        value: parseFloat(goalValue),
        date: new Date().toISOString(),
        achieved: false
      }
    };
    
    setGoals(newGoals);
    localStorage.setItem('fitness_goals', JSON.stringify(newGoals));
    setSettingGoal(null);
    setGoalValue('');
  };

  // Add new state for frequency analysis
  const [showFrequencyAnalysis, setShowFrequencyAnalysis] = useState(false);

  // Add this function to calculate exercise frequency
  const calculateExerciseFrequency = useMemo(() => {
    const frequencyData = {};
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    
    // Initialize with all exercises that have records
    personalRecords.forEach(record => {
      if (!frequencyData[record.name]) {
        frequencyData[record.name] = {
          name: record.name,
          category: record.category,
          last30Days: 0,
          allTime: 0,
          lastPerformed: null,
          workouts: []
        };
      }
    });
    
    // Count occurrences in workout history
    workoutHistory.forEach(workout => {
      const workoutDate = new Date(workout.date || workout.start_time);
      
      workout.exercises?.forEach(exercise => {
        if (!frequencyData[exercise.name]) {
          frequencyData[exercise.name] = {
            name: exercise.name,
            category: exercise.is_cardio ? 'cardio' : 'strength',
            last30Days: 0,
            allTime: 0,
            lastPerformed: null,
            workouts: []
          };
        }
        
        // Update frequency data
        frequencyData[exercise.name].allTime += 1;
        
        if (workoutDate >= thirtyDaysAgo) {
          frequencyData[exercise.name].last30Days += 1;
        }
        
        // Track last performed date
        if (!frequencyData[exercise.name].lastPerformed || 
            workoutDate > new Date(frequencyData[exercise.name].lastPerformed)) {
          frequencyData[exercise.name].lastPerformed = workoutDate.toISOString();
        }
        
        // Add to workouts list
        frequencyData[exercise.name].workouts.push({
          date: workoutDate.toISOString(),
          workoutName: workout.name || 'Unnamed Workout'
        });
      });
    });
    
    // Convert to array and sort by frequency
    return Object.values(frequencyData)
      .sort((a, b) => b.last30Days - a.last30Days);
  }, [workoutHistory, personalRecords]);
  
  // Add these new state variables after your existing ones
  const [progressView, setProgressView] = useState('frequency'); // 'frequency', 'charts', 'insights'
  const [dateRange, setDateRange] = useState(30); // days
  const [sortBy, setSortBy] = useState('frequency'); // 'frequency', 'name', 'lastPerformed'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc', 'desc'
  
  // Modify your existing filteredFrequencyData to include sorting
  const filteredFrequencyData = useMemo(() => {
    let filtered = calculateExerciseFrequency.filter(item => {
      // Filter by category
      if (filterCategory !== 'all' && item.category !== filterCategory) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    });
    
    // Sort data
    filtered.sort((a, b) => {
      if (sortBy === 'frequency') {
        return sortDirection === 'desc' ? b.last30Days - a.last30Days : a.last30Days - b.last30Days;
      } else if (sortBy === 'name') {
        return sortDirection === 'desc' 
          ? b.name.localeCompare(a.name) 
          : a.name.localeCompare(b.name);
      } else if (sortBy === 'lastPerformed') {
        if (!a.lastPerformed) return sortDirection === 'desc' ? 1 : -1;
        if (!b.lastPerformed) return sortDirection === 'desc' ? -1 : 1;
        return sortDirection === 'desc'
          ? new Date(b.lastPerformed) - new Date(a.lastPerformed)
          : new Date(a.lastPerformed) - new Date(b.lastPerformed);
      }
      return 0;
    });
    
    return filtered;
  }, [calculateExerciseFrequency, filterCategory, searchQuery, sortBy, sortDirection]);
  
  // Add this function to generate monthly workout frequency chart
  const generateMonthlyFrequencyChart = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    // Count workouts by month
    const monthlyWorkouts = Array(12).fill(0);
    
    workoutHistory.forEach(workout => {
      const date = new Date(workout.date || workout.start_time);
      if (date.getFullYear() === currentYear) {
        monthlyWorkouts[date.getMonth()]++;
      }
    });
    
    const chartData = {
      labels: months,
      datasets: [
        {
          label: `Workouts in ${currentYear}`,
          data: monthlyWorkouts,
          backgroundColor: 'rgba(79, 70, 229, 0.6)',
          borderColor: '#4F46E5',
          borderWidth: 1
        }
      ]
    };
    
    return (
      <div>
        <h4 className="text-lg font-medium mb-2">Monthly Workout Frequency</h4>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
          <Bar 
            data={chartData} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: `Workout Frequency by Month (${currentYear})`
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Number of Workouts'
                  }
                }
              }
            }}
          />
        </div>
      </div>
    );
  };

  // Add this after your generateMonthlyFrequencyChart function
  const generateExerciseDistributionChart = () => {
    // Count exercises by category
    const strengthCount = filteredFrequencyData.filter(item => item.category === 'strength').length;
    const cardioCount = filteredFrequencyData.filter(item => item.category === 'cardio').length;
    
    const chartData = {
      labels: ['Strength', 'Cardio'],
      datasets: [
        {
          label: 'Exercise Distribution',
          data: [strengthCount, cardioCount],
          backgroundColor: ['rgba(79, 70, 229, 0.6)', 'rgba(16, 185, 129, 0.6)'],
          borderColor: ['#4F46E5', '#10B981'],
          borderWidth: 1
        }
      ]
    };
    
    return (
      <div>
        <h4 className="text-lg font-medium mb-2">Exercise Type Distribution</h4>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
          <Bar 
            data={chartData} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Exercise Type Distribution'
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Number of Exercises'
                  }
                }
              }
            }}
          />
        </div>
      </div>
    );
  };

  // Add this function to calculate consistency metrics
  const calculateConsistencyMetrics = () => {
    if (workoutHistory.length === 0) return null;
    
    // Get unique workout dates
    const workoutDates = [...new Set(workoutHistory.map(workout => 
      new Date(workout.date || workout.start_time).toISOString().split('T')[0]
    ))].sort();
    
    // Calculate current streak
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // Check if worked out today or yesterday to maintain streak
    if (workoutDates.includes(today) || workoutDates.includes(yesterday)) {
      currentStreak = 1;
      
      // Count backwards from yesterday
      let checkDate = new Date(Date.now() - 86400000);
      
      while (true) {
        const dateString = checkDate.toISOString().split('T')[0];
        if (workoutDates.includes(dateString)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }
    
    // Calculate longest streak
    let longestStreak = 0;
    let currentCount = 1;
    
    for (let i = 1; i < workoutDates.length; i++) {
      const prevDate = new Date(workoutDates[i-1]);
      const currDate = new Date(workoutDates[i]);
      
      // Check if dates are consecutive
      const diffTime = Math.abs(currDate - prevDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentCount++;
      } else {
        longestStreak = Math.max(longestStreak, currentCount);
        currentCount = 1;
      }
    }
    
    longestStreak = Math.max(longestStreak, currentCount);
    
    // Calculate workouts per week
    const totalWeeks = Math.ceil(workoutHistory.length / 7);
    const workoutsPerWeek = (workoutDates.length / totalWeeks).toFixed(1);
    
    return {
      currentStreak,
      longestStreak,
      workoutsPerWeek,
      totalWorkouts: workoutDates.length
    };
  };

  // Add this function to find most improved exercises
  const findMostImprovedExercises = () => {
    const improvements = [];
    
    // For each exercise with records
    personalRecords.forEach(record => {
      const exerciseName = record.name;
      const exerciseData = calculateExerciseFrequency.find(item => item.name === exerciseName);
      
      if (!exerciseData || exerciseData.workouts.length < 2) return;
      
      if (record.category === 'strength') {
        // For strength exercises, calculate weight improvement
        const workouts = [...exerciseData.workouts].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        if (workouts[0].maxWeight && workouts[workouts.length - 1].maxWeight) {
          const firstWeight = workouts[0].maxWeight;
          const lastWeight = workouts[workouts.length - 1].maxWeight;
          const improvement = ((lastWeight - firstWeight) / firstWeight) * 100;
          
          if (improvement > 0) {
            improvements.push({
              name: exerciseName,
              category: 'strength',
              improvement,
              firstValue: `${firstWeight}${weightUnit}`,
              currentValue: `${lastWeight}${weightUnit}`,
              metric: 'weight'
            });
          }
        }
      } else if (record.category === 'cardio') {
        // For cardio exercises, calculate pace improvement
        const workouts = [...exerciseData.workouts]
          .filter(w => w.pace && w.pace > 0)
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        if (workouts.length >= 2) {
          const firstPace = workouts[0].pace;
          const lastPace = workouts[workouts.length - 1].pace;
          // For pace, lower is better
          const improvement = ((firstPace - lastPace) / firstPace) * 100;
          
          if (improvement > 0) {
            improvements.push({
              name: exerciseName,
              category: 'cardio',
              improvement,
              firstValue: `${firstPace.toFixed(2)} min/km`,
              currentValue: `${lastPace.toFixed(2)} min/km`,
              metric: 'pace'
            });
          }
        }
      }
    });
    
    return improvements.sort((a, b) => b.improvement - a.improvement).slice(0, 5);
  };

  // Add this function to generate a strength progress view
  const generateStrengthProgressView = () => {
    // Filter only strength exercises
    const strengthExercises = filteredFrequencyData.filter(item => 
      item.category === 'strength'
    );
    
    if (strengthExercises.length === 0) {
      return (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          No strength exercises found. Start logging your strength workouts to track progress!
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {strengthExercises.map((exercise, index) => {
          // Find personal records for this exercise
          const records = personalRecords.filter(record => 
            record.name === exercise.name && record.category === 'strength'
          );
          
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <FaDumbbell className="text-blue-500 mr-2" />
                {exercise.name}
              </h3>
              
              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Frequency stats */}
                <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded">
                  <p className="text-sm text-blue-800 dark:text-blue-300">Frequency</p>
                  <p className="text-xl font-bold">{exercise.last30Days} times</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">in last {dateRange} days</p>
                </div>
                
                {/* Personal records */}
                <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded">
                  <p className="text-sm text-purple-800 dark:text-purple-300">Max Weight</p>
                  {records.length > 0 ? (
                    <>
                      <p className="text-xl font-bold">
                        {Math.max(...records.map(r => r.value))}{weightUnit}
                      </p>
                      <p className="text-xs text-purple-600 dark:text-purple-400">
                        personal record
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No records yet</p>
                  )}
                </div>
                
                {/* Last performed */}
                <div className="bg-teal-50 dark:bg-teal-900/30 p-3 rounded">
                  <p className="text-sm text-teal-800 dark:text-teal-300">Last Performed</p>
                  <p className="text-xl font-bold">
                    {exercise.lastPerformed ? 
                      new Date(exercise.lastPerformed).toLocaleDateString() : 
                      'Never'}
                  </p>
                  <p className="text-xs text-teal-600 dark:text-teal-400">
                    {exercise.lastPerformed ? 
                      `${Math.round((new Date() - new Date(exercise.lastPerformed)) / (1000 * 60 * 60 * 24))} days ago` : 
                      ''}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <FaTrophy className="text-yellow-500 mr-2" />
            {showFrequencyAnalysis ? 'Progress Tracker' : 'Personal Records'}
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowFrequencyAnalysis(!showFrequencyAnalysis)}
              className={`flex items-center px-4 py-2 rounded-lg ${
                showFrequencyAnalysis 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              {showFrequencyAnalysis ? (
                <><FaTrophy className="mr-2" /> View Records</>
              ) : (
                <><FaChartLine className="mr-2" /> View Progress</>
              )}
            </button>
            <button
              onClick={() => navigate("/workout-history")}
              className="flex items-center text-teal-500 hover:text-teal-400"
            >
              <FaArrowLeft className="mr-2" /> Back to History
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">Filter by:</span>
              <div className="flex space-x-1">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filterCategory === 'all' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterCategory('strength')}
                  className={`px-3 py-1 rounded-full text-sm flex items-center ${
                    filterCategory === 'strength' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <FaDumbbell className="mr-1" /> Strength
                </button>
                <button
                  onClick={() => setFilterCategory('cardio')}
                  className={`px-3 py-1 rounded-full text-sm flex items-center ${
                    filterCategory === 'cardio' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <FaRunning className="mr-1" /> Cardio
                </button>
              </div>
            </div>
            
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exercises..."
                className="w-full md:w-64 bg-gray-200 dark:bg-gray-700 rounded p-2 pl-10"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-500 dark:text-gray-400" />
            </div>
          </div>
          
          {/* Add toggle for frequency analysis */}
          <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setProgressView('frequency')}
                className={`px-3 py-1 rounded-full text-sm flex items-center ${
                  progressView === 'frequency' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                <FaCalendarAlt className="mr-1" /> Exercise History
              </button>
              <button
                onClick={() => setProgressView('strength')}
                className={`px-3 py-1 rounded-full text-sm flex items-center ${
                  progressView === 'strength' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                <FaDumbbell className="mr-1" /> Strength Progress
              </button>
              <button
                onClick={() => setProgressView('charts')}
                className={`px-3 py-1 rounded-full text-sm flex items-center ${
                  progressView === 'charts' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                <FaChartLine className="mr-1" /> Charts
              </button>
              <button
                onClick={() => setProgressView('insights')}
                className={`px-3 py-1 rounded-full text-sm flex items-center ${
                  progressView === 'insights' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                <FaFire className="mr-1" /> Insights
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading your data...
            </p>
          </div>
        ) : showFrequencyAnalysis ? (
          <>
            {/* Progress Tracker Views */}
            {progressView === 'frequency' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                      <FaCalendarAlt className="text-purple-500 mr-2" />
                      Exercise History Tracker
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      See how often you've performed each exercise
                    </p>
                  </div>
                  
                  {filteredFrequencyData.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                      No exercise data found matching your filters.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                              onClick={() => {
                                if (sortBy === 'name') {
                                  setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                                } else {
                                  setSortBy('name');
                                  setSortDirection('asc');
                                }
                              }}
                            >
                              Exercise {sortBy === 'name' && (
                                sortDirection === 'asc' ? '↑' : '↓'
                              )}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Category
                            </th>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                              onClick={() => {
                                if (sortBy === 'frequency') {
                                  setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                                } else {
                                  setSortBy('frequency');
                                  setSortDirection('desc');
                                }
                              }}
                            >
                              Times Performed {sortBy === 'frequency' && (
                                sortDirection === 'asc' ? '↑' : '↓'
                              )}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              All Time
                            </th>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                              onClick={() => {
                                if (sortBy === 'lastPerformed') {
                                  setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                                } else {
                                  setSortBy('lastPerformed');
                                  setSortDirection('desc');
                                }
                              }}
                            >
                              Last Performed {sortBy === 'lastPerformed' && (
                                sortDirection === 'asc' ? '↑' : '↓'
                              )}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {filteredFrequencyData.map((item, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50'}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {item.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  item.category === 'strength' 
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
                                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                }`}>
                                  {item.category === 'strength' ? (
                                    <><FaDumbbell className="mr-1" /> Strength</>
                                  ) : (
                                    <><FaRunning className="mr-1" /> Cardio</>
                                  )}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center">
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2 max-w-[100px]">
                                    <div 
                                      className="bg-purple-600 h-2.5 rounded-full" 
                                      style={{ width: `${Math.min(100, (item.last30Days / 10) * 100)}%` }}
                                    ></div>
                                  </div>
                                  <span>{item.last30Days} times</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {item.allTime} times
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {item.lastPerformed ? new Date(item.lastPerformed).toLocaleDateString() : 'Never'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {progressView === 'strength' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                      <FaDumbbell className="text-purple-500 mr-2" />
                      Strength Progress
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Track your progress on all strength exercises
                    </p>
                  </div>
                  
                  <div className="p-4">
                    {generateStrengthProgressView()}
                  </div>
                </div>
              </div>
            )}

            {progressView === 'charts' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                      <FaChartLine className="text-purple-500 mr-2" />
                      Workout Progress Charts
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Visualize your workout frequency and progress
                    </p>
                  </div>
                  
                  <div className="p-4 space-y-8">
                    {generateMonthlyFrequencyChart()}
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                      {generateExerciseDistributionChart()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {progressView === 'insights' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                      <FaFire className="text-purple-500 mr-2" />
                      Workout Insights
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Discover patterns and opportunities in your training
                    </p>
                  </div>
                  
                  <div className="p-4 space-y-6">
                    {/* Consistency Stats */}
                    {calculateConsistencyMetrics() && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg text-center">
                          <p className="text-sm text-indigo-600 dark:text-indigo-300">Current Streak</p>
                          <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-200">
                            {calculateConsistencyMetrics().currentStreak}
                          </p>
                          <p className="text-xs text-indigo-500 dark:text-indigo-400">days</p>
                        </div>
                        
                        <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg text-center">
                          <p className="text-sm text-purple-600 dark:text-purple-300">Longest Streak</p>
                          <p className="text-3xl font-bold text-purple-700 dark:text-purple-200">
                            {calculateConsistencyMetrics().longestStreak}
                          </p>
                          <p className="text-xs text-purple-500 dark:text-purple-400">days</p>
                        </div>
                        
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg text-center">
                          <p className="text-sm text-blue-600 dark:text-blue-300">Workouts/Week</p>
                          <p className="text-3xl font-bold text-blue-700 dark:text-blue-200">
                            {calculateConsistencyMetrics().workoutsPerWeek}
                          </p>
                          <p className="text-xs text-blue-500 dark:text-blue-400">average</p>
                        </div>
                        
                        <div className="bg-teal-50 dark:bg-teal-900/30 p-4 rounded-lg text-center">
                          <p className="text-sm text-teal-600 dark:text-teal-300">Total Workouts</p>
                          <p className="text-3xl font-bold text-teal-700 dark:text-teal-200">
                            {calculateConsistencyMetrics().totalWorkouts}
                          </p>
                          <p className="text-xs text-teal-500 dark:text-teal-400">all time</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Most Performed Exercises */}
                      <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Most Performed Exercises</h4>
                        <ul className="space-y-2">
                          {filteredFrequencyData.slice(0, 5).map((item, i) => (
                            <li key={i} className="flex justify-between">
                              <span>{item.name}</span>
                              <span className="font-medium">{item.last30Days} times in {dateRange} days</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Neglected Exercises */}
                      <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
                        <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">Neglected Exercises</h4>
                        <ul className="space-y-2">
                          {filteredFrequencyData
                            .filter(item => item.lastPerformed)
                            .sort((a, b) => new Date(a.lastPerformed) - new Date(b.lastPerformed))
                            .slice(0, 5)
                            .map((item, i) => (
                              <li key={i} className="flex justify-between">
                                <span>{item.name}</span>
                                <span className="font-medium">Last: {new Date(item.lastPerformed).toLocaleDateString()}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                      
                      {/* Most Improved Exercises */}
                      <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg col-span-1 md:col-span-2">
                        <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Most Improved Exercises</h4>
                        {findMostImprovedExercises().length > 0 ? (
                          <ul className="space-y-2">
                            {findMostImprovedExercises().map((item, i) => (
                              <li key={i} className="flex justify-between items-center">
                                <span>{item.name}</span>
                                <div className="text-right">
                                  <span className="font-medium text-green-600 dark:text-green-400">
                                    +{item.improvement.toFixed(1)}%
                                  </span>
                                  <span className="text-sm block text-gray-500 dark:text-gray-400">
                                    {item.firstValue} → {item.currentValue}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400">
                            Not enough data to calculate improvements yet.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            {groupedRecords.map((group, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {group.name}
                  </h2>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.records.map((record, rIndex) => (
                      <div 
                        key={rIndex} 
                        className={`p-4 rounded-lg ${
                          record.category === 'strength' 
                            ? 'bg-blue-50 dark:bg-blue-900/30' 
                            : 'bg-green-50 dark:bg-green-900/30'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {record.category === 'strength' 
                                ? `${record.reps} Rep Max` 
                                : record.type === 'pace' ? 'Best Pace' : 'Longest Distance'}
                            </p>
                            <p className="text-2xl font-bold">{record.display}</p>
                          </div>
                          <div className={`p-2 rounded-full ${
                            record.category === 'strength' 
                              ? 'bg-blue-100 dark:bg-blue-800' 
                              : 'bg-green-100 dark:bg-green-800'
                          }`}>
                            {record.category === 'strength' 
                              ? <FaDumbbell className="text-blue-500 dark:text-blue-300" /> 
                              : <FaRunning className="text-green-500 dark:text-green-300" />}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <FaCalendarAlt className="mr-1" />
                          {new Date(record.date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PersonalRecords; 