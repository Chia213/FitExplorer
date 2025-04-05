import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaRobot, FaDumbbell, FaWeightHanging, FaRunning, FaUserAlt, FaCalendarAlt, FaSpinner, FaCheckCircle, FaArrowRight, FaPlay, FaEye, FaChevronLeft, FaChevronRight, FaInfoCircle, FaShare, FaDownload } from "react-icons/fa";
import { GiWeightLiftingUp, GiJumpingRope, GiMuscleUp } from "react-icons/gi";
import { createSavedProgram } from "../api/savedProgramsApi";

function AIWorkoutGenerator() {
  const presetConfigurations = {
    beginner: {
      fitnessGoal: "general_fitness",
      experienceLevel: "beginner",
      workoutDuration: "30",
      daysPerWeek: "3",
      equipment: "basic",
      injuries: "",
      preferences: "Focus on form and technique. Include detailed instructions.",
    },
    intermediate: {
      fitnessGoal: "hypertrophy",
      experienceLevel: "intermediate",
      workoutDuration: "45",
      daysPerWeek: "4",
      equipment: "full_gym",
      injuries: "",
      preferences: "Include progressive overload strategies.",
    },
    advanced: {
      fitnessGoal: "strength",
      experienceLevel: "advanced",
      workoutDuration: "60",
      daysPerWeek: "5",
      equipment: "full_gym",
      injuries: "",
      preferences: "Include periodization and advanced lifting techniques.",
    },
    weightLoss: {
      fitnessGoal: "weight_loss",
      experienceLevel: "beginner",
      workoutDuration: "45",
      daysPerWeek: "5", 
      equipment: "basic",
      injuries: "",
      preferences: "Include both strength and cardio elements. Higher intensity.",
    },
    cardio: {
      fitnessGoal: "endurance",
      experienceLevel: "intermediate",
      workoutDuration: "45",
      daysPerWeek: "4",
      equipment: "basic",
      injuries: "",
      preferences: "Focus on cardiovascular conditioning and endurance.",
    }
  };

  const [formData, setFormData] = useState({
    fitnessGoal: "strength",
    experienceLevel: "beginner",
    workoutDuration: "30",
    daysPerWeek: "3",
    equipment: "basic",
    injuries: "",
    preferences: "",
  });
  const [generatedWorkout, setGeneratedWorkout] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedProgramId, setSavedProgramId] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "list" or "calendar"
  const [previewWeek, setPreviewWeek] = useState(1);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [selectedDayEquipment, setSelectedDayEquipment] = useState(null);
  const [isSharingSupported, setIsSharingSupported] = useState(false);
  const navigate = useNavigate();

  // Check if sharing is supported by the browser
  useEffect(() => {
    setIsSharingSupported(!!navigator.share);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      // Call the AI workout generator API
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login', { state: { from: '/ai-workout-generator' } });
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai-workout/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        // If the AI endpoint fails, try the fallback endpoint
        if (response.status === 500) {
          const fallbackResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/ai-workout/generate-fallback`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData),
          });
          
          if (!fallbackResponse.ok) {
            throw new Error('Failed to generate workout with fallback');
          }
          
          const fallbackData = await fallbackResponse.json();
          setGeneratedWorkout(fallbackData);
        } else {
          throw new Error('Failed to generate workout');
        }
      } else {
        const data = await response.json();
        setGeneratedWorkout(data);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error generating workout:', error);
      setError("Failed to generate workout. Please try again.");
      setIsLoading(false);
      
      // Use mock data as a last resort if both API calls fail
      setTimeout(() => {
        const mockWorkout = generateMockWorkout(formData);
        setGeneratedWorkout(mockWorkout);
        setError("Used offline mode due to server issues.");
        setIsLoading(false);
      }, 1000);
    }
  };

  const saveWorkout = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login', { state: { from: '/ai-workout-generator' } });
        return;
      }
      
      // Generate a descriptive program name
      const generateProgramName = () => {
        const goalMap = {
          'strength': 'Strength Building',
          'hypertrophy': 'Muscle Growth',
          'endurance': 'Endurance',
          'weight_loss': 'Weight Loss',
          'general_fitness': 'General Fitness'
        };
        
        const levelMap = {
          'beginner': 'Beginner',
          'intermediate': 'Intermediate',
          'advanced': 'Advanced'
        };
        
        // Determine workout split/focus
        let programFocus = "Full Body";
        const daysCount = parseInt(formData.daysPerWeek);
        
        if (daysCount === 4) {
          programFocus = "Upper/Lower";
        } else if (daysCount === 5) {
          programFocus = "PPL + Upper/Lower";
        } else if (daysCount === 6) {
          programFocus = "Push/Pull/Legs";
        }
        
        const focusArea = getMainFocus(generatedWorkout.days) || programFocus;
        const goal = goalMap[formData.fitnessGoal] || 'Custom';
        const level = levelMap[formData.experienceLevel] || '';
        const workoutsPerWeek = formData.daysPerWeek;
        
        // Create a descriptive name format
        let programName = `${level} ${focusArea} ${goal} Program (${workoutsPerWeek}x/week)`;
        
        return programName;
      };
      
      // Transform the workout to match the saved programs format
      const programData = {
        name: generateProgramName(),
        description: generatedWorkout.description,
        category: mapGoalToCategory(formData.fitnessGoal),
        focusArea: getMainFocus(generatedWorkout.days),
        duration: formData.workoutDuration,
        difficulty: formData.experienceLevel,
        workoutsPerWeek: formData.daysPerWeek,
        equipment: formData.equipment,
        targetMuscles: extractTargetMuscles(generatedWorkout.days),
        
        // Use our restructured six-week program data for ProgramTracker
        sixWeekProgram: generateSixWeekProgram(generatedWorkout.days, formData.experienceLevel),
        
        // Add a unique ID for the program
        id: "ai-" + Date.now()
      };
      
      // Use the API function instead of direct fetch
      const response = await createSavedProgram(programData, token);
      console.log('Workout saved successfully:', response);
      
      // Set the saved program ID
      setSavedProgramId(response.id);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving workout:', error);
      alert("Failed to save workout. Please try again.");
    }
  };

  const generateMockWorkout = (preferences) => {
    // This is a simple mock implementation to simulate AI-generated workouts
    const { fitnessGoal, experienceLevel, workoutDuration, daysPerWeek } = preferences;
    
    // Sample workout structure based on user preferences
    const workoutDays = [];
    const daysCount = parseInt(daysPerWeek);
    
    // Simple logic to determine workout split based on days per week
    let split = ["Full Body", "Rest", "Full Body", "Rest", "Full Body", "Rest", "Rest"];
    let programFocus = "Full Body";
    
    if (daysCount === 4) {
      split = ["Upper Body", "Lower Body", "Rest", "Upper Body", "Lower Body", "Rest", "Rest"];
      programFocus = "Upper/Lower";
    } else if (daysCount === 5) {
      split = ["Push", "Pull", "Legs", "Upper Body", "Lower Body", "Rest", "Rest"];
      programFocus = "PPL + Upper/Lower";
    } else if (daysCount === 6) {
      split = ["Push", "Pull", "Legs", "Push", "Pull", "Legs", "Rest"];
      programFocus = "Push/Pull/Legs";
    }
    
    // Create workout days based on the split
    for (let i = 0; i < 7; i++) {
      if (split[i] === "Rest") {
        workoutDays.push({
          day: `Day ${i+1}`,
          focus: "Rest",
          exercises: [],
          notes: "Recovery day. Focus on stretching, mobility, or light cardio if desired."
        });
        continue;
      }
      
      // Generate exercises based on body part focus
      const exercises = [];
      const exercisesCount = fitnessGoal === "strength" ? 4 : 6;
      
      if (split[i] === "Full Body" || split[i] === "Upper Body" || split[i] === "Push") {
        exercises.push({
          name: "Bench Press",
          sets: fitnessGoal === "strength" ? 5 : 3,
          reps: fitnessGoal === "strength" ? "5" : "10-12",
          rest: fitnessGoal === "strength" ? "3 min" : "60-90 sec",
        });
        exercises.push({
          name: "Shoulder Press",
          sets: fitnessGoal === "strength" ? 4 : 3,
          reps: fitnessGoal === "strength" ? "6-8" : "10-12",
          rest: fitnessGoal === "strength" ? "2-3 min" : "60-90 sec",
        });
      }
      
      if (split[i] === "Full Body" || split[i] === "Upper Body" || split[i] === "Pull") {
        exercises.push({
          name: "Pull-ups",
          sets: 3,
          reps: fitnessGoal === "strength" ? "6-8" : "10-12",
          rest: fitnessGoal === "strength" ? "2-3 min" : "60-90 sec",
        });
        exercises.push({
          name: "Barbell Rows",
          sets: fitnessGoal === "strength" ? 4 : 3,
          reps: fitnessGoal === "strength" ? "6-8" : "10-12",
          rest: fitnessGoal === "strength" ? "2-3 min" : "60-90 sec",
        });
      }
      
      if (split[i] === "Full Body" || split[i] === "Lower Body" || split[i] === "Legs") {
        exercises.push({
          name: "Squats",
          sets: fitnessGoal === "strength" ? 5 : 3,
          reps: fitnessGoal === "strength" ? "5" : "10-12",
          rest: fitnessGoal === "strength" ? "3 min" : "60-90 sec",
        });
        exercises.push({
          name: "Romanian Deadlifts",
          sets: fitnessGoal === "strength" ? 4 : 3,
          reps: fitnessGoal === "strength" ? "6-8" : "10-12",
          rest: fitnessGoal === "strength" ? "2-3 min" : "60-90 sec",
        });
      }
      
      // Add cardio if fitness goal is endurance or weight loss
      if (fitnessGoal === "endurance" || fitnessGoal === "weight_loss") {
        exercises.push({
          name: "HIIT Cardio",
          sets: 1,
          reps: "20 minutes",
          rest: "N/A",
        });
      }
      
      workoutDays.push({
        day: `Day ${i+1}`,
        focus: split[i],
        exercises: exercises,
        notes: `Focus on progressive overload. Adjust weights based on your ${experienceLevel} experience level.`
      });
    }
    
    // Generate descriptive name based on preferences
    const goalMap = {
      'strength': 'Strength Building',
      'hypertrophy': 'Muscle Growth',
      'endurance': 'Endurance',
      'weight_loss': 'Weight Loss',
      'general_fitness': 'General Fitness'
    };
    
    const levelMap = {
      'beginner': 'Beginner',
      'intermediate': 'Intermediate',
      'advanced': 'Advanced'
    };
    
    const goal = goalMap[fitnessGoal] || 'Custom';
    const level = levelMap[experienceLevel] || '';
    
    // Create a descriptive name format
    let programName = `${level} ${programFocus} ${goal} Program (${daysPerWeek}x/week)`;
    
    return {
      name: programName,
      description: `Custom ${goal.toLowerCase()} workout program designed with a ${programFocus.toLowerCase()} split for ${level.toLowerCase()} fitness enthusiasts. Features ${daysPerWeek} workouts per week, each approximately ${workoutDuration} minutes in duration.`,
      days: workoutDays,
    };
  };

  // Helper functions for workout data transformation
  
  const mapGoalToCategory = (goal) => {
    const categoryMap = {
      'strength': 'Strength',
      'hypertrophy': 'Hypertrophy',
      'endurance': 'Endurance',
      'weight_loss': 'Weight Loss',
      'general_fitness': 'General Fitness'
    };
    return categoryMap[goal] || 'General Fitness';
  };
  
  const getMainFocus = (days) => {
    // Count the frequency of each focus area
    const focusCount = {};
    days.forEach(day => {
      if (day.focus && day.focus !== "Rest") {
        const focus = day.focus.split(" ")[0]; // Get the first word (main muscle group)
        focusCount[focus] = (focusCount[focus] || 0) + 1;
      }
    });
    
    // Find the most common focus
    let mainFocus = "Full Body";
    let maxCount = 0;
    
    for (const [focus, count] of Object.entries(focusCount)) {
      if (count > maxCount) {
        maxCount = count;
        mainFocus = focus;
      }
    }
    
    return mainFocus;
  };
  
  const extractTargetMuscles = (days) => {
    // Extract unique muscle groups from the workout days
    const muscleGroups = new Set();
    
    days.forEach(day => {
      if (day.focus && day.focus !== "Rest") {
        // Add each part of the focus (e.g., "Chest and Triceps" -> ["Chest", "Triceps"])
        day.focus.split(/\s+and\s+|\s*,\s*|\s+&\s+/)
          .map(muscle => muscle.trim())
          .filter(muscle => muscle !== '')
          .forEach(muscle => muscleGroups.add(muscle));
      }
    });
    
    return Array.from(muscleGroups);
  };
  
  const extractExercises = (days) => {
    // Flatten all exercises from all days into a single array
    const exercises = [];
    
    days.forEach(day => {
      if (day.focus !== "Rest" && day.exercises.length > 0) {
        day.exercises.forEach(exercise => {
          // Determine muscle based on day focus or default to the day's focus
          const muscle = day.focus.includes("and") 
            ? day.focus.split("and")[0].trim() 
            : day.focus;
            
          exercises.push({
            name: exercise.name,
            muscle: muscle,
            sets: exercise.sets,
            reps: exercise.reps,
            rest: exercise.rest.replace("sec", "").trim(),
            intensity: "70%", // Default intensity
            notes: ""
          });
        });
      }
    });
    
    return exercises;
  };
  
  const generateSixWeekProgram = (days, experienceLevel) => {
    // Create a progressive 6-week program based on the initial workout
    const sixWeekProgram = [];
    
    // Define progression factors based on experience level
    const progressionFactors = {
      beginner: {
        intensity: 5, // 5% intensity increase per week
        volume: 1     // 1 rep increase for certain weeks
      },
      intermediate: {
        intensity: 7, // 7% intensity increase per week
        volume: 2     // 2 rep increase for certain weeks
      },
      advanced: {
        intensity: 10, // 10% intensity increase per week
        volume: 2      // 2 rep increase for certain weeks
      }
    };
    
    const progression = progressionFactors[experienceLevel] || progressionFactors.intermediate;
    
    // Extract all exercises from non-rest days in a flat structure
    const allExercises = [];
    days.forEach(day => {
      if (day.focus !== "Rest" && day.exercises.length > 0) {
        day.exercises.forEach(exercise => {
          // Determine muscle based on day focus
          const muscle = day.focus.includes(" and ") 
            ? day.focus.split(" and ")[0].trim() 
            : day.focus;
            
          allExercises.push({
            name: exercise.name,
            muscle: muscle,
            sets: exercise.sets,
            reps: exercise.reps,
            rest: typeof exercise.rest === "string" ? exercise.rest.replace("sec", "").trim() : exercise.rest,
            intensity: "70%", // Start with 70% intensity
            notes: ""
          });
        });
      }
    });
    
    // Generate 6 weeks with progressive overload
    for (let week = 1; week <= 6; week++) {
      // Create a deep copy of the exercises for this week
      const weeklyExercises = JSON.parse(JSON.stringify(allExercises));
      
      // Apply progression for this week
      weeklyExercises.forEach(exercise => {
        // Increase intensity progressively
        const baseIntensity = 70;
        const newIntensity = Math.min(baseIntensity + (week - 1) * progression.intensity, 95);
        exercise.intensity = `${newIntensity}%`;
        
        // For weeks 3 and 5, increase volume for certain exercises
        if ((week === 3 || week === 5) && !exercise.name.includes("Cardio")) {
          const currentReps = exercise.reps;
          if (typeof currentReps === "string" && currentReps.includes("-")) {
            // Handle range reps (e.g., "8-12")
            const [min, max] = currentReps.split("-").map(r => parseInt(r.trim()));
            exercise.reps = `${min}-${max + progression.volume}`;
          } else if (!isNaN(parseInt(currentReps))) {
            // Handle single number reps
            exercise.reps = `${parseInt(currentReps) + progression.volume}`;
          }
        }
      });
      
      sixWeekProgram.push({
        week: week,
        exercises: weeklyExercises
      });
    }
    
    return sixWeekProgram;
  };

  // Function to handle starting the workout program
  const startWorkoutProgram = () => {
    // Navigate to program tracker with the saved program ID
    navigate('/program-tracker', { 
      state: { 
        programId: savedProgramId 
      } 
    });
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "list" ? "calendar" : "list");
  };
  
  // Function to render workout in calendar view
  const renderCalendarView = () => {
    if (!generatedWorkout) return null;
    
    const currentWeekProgram = previewWeek === 1 
      ? generatedWorkout.days 
      : generateWeeklyProgression(generatedWorkout.days, previewWeek, formData.experienceLevel);
      
    const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Weekly Calendar View</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setPreviewWeek(Math.max(1, previewWeek - 1))}
              disabled={previewWeek === 1}
              className={`rounded-full p-2 ${previewWeek === 1 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
            >
              <FaChevronLeft />
            </button>
            <span className="font-medium">Week {previewWeek} of 6</span>
            <button
              onClick={() => setPreviewWeek(Math.min(6, previewWeek + 1))}
              disabled={previewWeek === 6}
              className={`rounded-full p-2 ${previewWeek === 6 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {weekDays.map((day, idx) => {
            const dayData = currentWeekProgram[idx] || { focus: "Rest", exercises: [] };
            return (
              <div key={day} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gray-100 dark:bg-gray-750 py-2 px-4 font-medium text-center border-b border-gray-200 dark:border-gray-700">
                  {day}
                </div>
                <div className="p-3">
                  <div className="mb-2 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                      dayData.focus === "Rest" 
                        ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300" 
                        : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                    }`}>
                      {dayData.focus}
                    </span>
                  </div>
                  
                  {dayData.focus === "Rest" ? (
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 italic">Rest day</p>
                  ) : (
                    <div className="space-y-2">
                      {dayData.exercises.map((exercise, exIndex) => (
                        <div key={exIndex} className="text-sm border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0 last:pb-0">
                          <div className="font-medium">{exercise.name}</div>
                          <div className="text-gray-600 dark:text-gray-400">
                            {exercise.sets} × {exercise.reps} | {exercise.rest}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {dayData.notes && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
                      {dayData.notes}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Function to generate weekly progression for preview
  const generateWeeklyProgression = (days, weekNum, experienceLevel) => {
    // Copy the days array
    const newDays = JSON.parse(JSON.stringify(days));
    
    // Define progression factors based on experience level
    const progressionFactors = {
      beginner: {
        intensity: 5, // 5% intensity increase per week
        volume: 1     // 1 rep increase for certain weeks
      },
      intermediate: {
        intensity: 7, // 7% intensity increase per week
        volume: 2     // 2 rep increase for certain weeks
      },
      advanced: {
        intensity: 10, // 10% intensity increase per week
        volume: 2      // 2 rep increase for certain weeks
      }
    };
    
    const progression = progressionFactors[experienceLevel] || progressionFactors.intermediate;
    
    // Apply progression factors
    newDays.forEach(day => {
      if (day.focus !== "Rest") {
        day.exercises.forEach(exercise => {
          // Modify the exercise based on week number progression
          // Increase weight or intensity progressively
          if (exercise.name.toLowerCase().includes("weight") || 
              exercise.name.toLowerCase().includes("press") ||
              exercise.name.toLowerCase().includes("curl") ||
              exercise.name.toLowerCase().includes("row") ||
              exercise.name.toLowerCase().includes("squat") ||
              exercise.name.toLowerCase().includes("deadlift")) {
            
            // Add a progressive weight note for key exercises
            const baseWeight = exercise.name.toLowerCase().includes("squat") || 
                              exercise.name.toLowerCase().includes("deadlift") ? 
                              100 : 50;
            const weeklyIncrease = progression.intensity / 2;
            const newWeight = Math.round(baseWeight * (1 + ((weekNum - 1) * weeklyIncrease / 100)));
            
            exercise.weight = `${newWeight}kg`;
          }
          
          // For weeks 3 and 5, increase volume for certain exercises
          if ((weekNum === 3 || weekNum === 5) && !exercise.name.includes("Cardio")) {
            const currentReps = exercise.reps;
            if (typeof currentReps === "string" && currentReps.includes("-")) {
              // Handle range reps (e.g., "8-12")
              const [min, max] = currentReps.split("-").map(r => parseInt(r.trim()));
              exercise.reps = `${min + 1}-${max + progression.volume}`;
            } else if (!isNaN(parseInt(currentReps))) {
              // Handle single number reps
              exercise.reps = `${parseInt(currentReps) + progression.volume}`;
            }
          }
        });
      }
    });
    
    return newDays;
  };

  // Function to determine equipment needed for a day's workout
  const getEquipmentForDay = (day) => {
    if (!day || day.focus === "Rest" || !day.exercises || day.exercises.length === 0) {
      return [];
    }
    
    const equipmentNeeded = new Set();
    
    // Map exercise names to likely equipment
    day.exercises.forEach(exercise => {
      const name = exercise.name.toLowerCase();
      
      // Weights and machines
      if (name.includes("bench press") || name.includes("chest press")) {
        equipmentNeeded.add("Bench");
        equipmentNeeded.add("Barbell or Dumbbells");
      } else if (name.includes("squat") && !name.includes("body")) {
        equipmentNeeded.add("Squat Rack");
        equipmentNeeded.add("Barbell");
      } else if (name.includes("deadlift")) {
        equipmentNeeded.add("Barbell");
      } else if (name.includes("row") && !name.includes("body")) {
        if (name.includes("barbell")) {
          equipmentNeeded.add("Barbell");
        } else if (name.includes("dumbbell")) {
          equipmentNeeded.add("Dumbbells");
        } else if (name.includes("cable")) {
          equipmentNeeded.add("Cable Machine");
        } else {
          equipmentNeeded.add("Barbell or Dumbbells");
        }
      } else if (name.includes("press") || name.includes("curl") || name.includes("extension")) {
        if (name.includes("barbell")) {
          equipmentNeeded.add("Barbell");
        } else if (name.includes("dumbbell")) {
          equipmentNeeded.add("Dumbbells");
        } else if (name.includes("cable")) {
          equipmentNeeded.add("Cable Machine");
        } else if (name.includes("machine")) {
          equipmentNeeded.add("Weight Machine");
        } else {
          equipmentNeeded.add("Dumbbells");
        }
      } else if (name.includes("pull up") || name.includes("pull-up") || name.includes("chin up")) {
        equipmentNeeded.add("Pull-up Bar");
      } else if (name.includes("dip")) {
        equipmentNeeded.add("Dip Bars or Bench");
      }
      
      // Cardio equipment
      if (name.includes("treadmill")) {
        equipmentNeeded.add("Treadmill");
      } else if (name.includes("bike") || name.includes("cycling")) {
        equipmentNeeded.add("Exercise Bike");
      } else if (name.includes("elliptical")) {
        equipmentNeeded.add("Elliptical Machine");
      } else if (name.includes("rowing machine")) {
        equipmentNeeded.add("Rowing Machine");
      } else if (name.includes("jump rope")) {
        equipmentNeeded.add("Jump Rope");
      }
      
      // Other equipment
      if (name.includes("kettlebell")) {
        equipmentNeeded.add("Kettlebells");
      } else if (name.includes("medicine ball")) {
        equipmentNeeded.add("Medicine Ball");
      } else if (name.includes("resistance band")) {
        equipmentNeeded.add("Resistance Bands");
      } else if (name.includes("foam roll")) {
        equipmentNeeded.add("Foam Roller");
      }
    });
    
    return Array.from(equipmentNeeded);
  };
  
  // Function to show equipment modal for a day
  const showEquipmentForDay = (day) => {
    setSelectedDayEquipment({
      day: day.day,
      focus: day.focus,
      equipment: getEquipmentForDay(day)
    });
    setShowEquipmentModal(true);
  };
  
  // Equipment Modal Component
  const EquipmentModal = ({ isOpen, onClose, dayEquipment }) => {
    if (!isOpen || !dayEquipment) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold dark:text-white">
              Equipment for {dayEquipment.day}
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>
          
          <div className="mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
            <span className="inline-block px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {dayEquipment.focus}
            </span>
          </div>
          
          {dayEquipment.equipment.length === 0 ? (
            <p className="text-center py-4 text-gray-500 dark:text-gray-400">
              No special equipment needed for this workout day.
            </p>
          ) : (
            <ul className="space-y-2">
              {dayEquipment.equipment.map((item, index) => (
                <li key={index} className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="mr-3 text-blue-500">
                    {item.toLowerCase().includes("barbell") || item.toLowerCase().includes("dumbbell") ? (
                      <FaDumbbell />
                    ) : item.toLowerCase().includes("bench") || item.toLowerCase().includes("rack") ? (
                      <GiWeightLiftingUp />
                    ) : item.toLowerCase().includes("rope") ? (
                      <GiJumpingRope />
                    ) : item.toLowerCase().includes("bar") ? (
                      <GiMuscleUp />
                    ) : (
                      <FaWeightHanging />
                    )}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          )}
          
          <button
            onClick={onClose}
            className="mt-5 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  // Success Modal
  const SuccessModal = ({ isOpen, onClose, savedProgramId }) => {
    const startWorkoutProgram = () => {
      navigate(`/program-tracker?programId=${savedProgramId}`);
      onClose();
    };
    
    const viewInSavedPrograms = () => {
      navigate(`/saved-programs?programId=${savedProgramId}`);
      onClose();
    };
    
    const generateAnotherWorkout = () => {
      setFormData({
        fitnessGoal: "strength",
        experienceLevel: "beginner",
        workoutDuration: "30",
        daysPerWeek: "3",
        equipment: "basic",
        injuries: "",
        preferences: "",
      });
      setGeneratedWorkout(null);
      onClose();
    };

    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
          <div className="flex items-center justify-center mb-4 text-green-500">
            <FaCheckCircle className="text-3xl" />
          </div>
          <h3 className="text-xl font-bold text-center mb-2 dark:text-white">
            Workout Program Saved!
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
            Your workout program has been saved successfully. You can access it anytime from your saved programs.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={startWorkoutProgram}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded transition-colors"
            >
              <FaPlay /> Start This Program Now
            </button>
            <button
              onClick={viewInSavedPrograms}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
            >
              <FaDumbbell /> View in Saved Programs
            </button>
            <button
              onClick={generateAnotherWorkout}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 py-2 px-4 rounded transition-colors dark:text-white"
            >
              <FaRobot /> Generate Another Workout
            </button>
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 py-2 px-4 rounded transition-colors dark:text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add this new function to apply presets
  const applyPreset = (presetName) => {
    if (presetConfigurations[presetName]) {
      setFormData({...presetConfigurations[presetName]});
    }
  };

  // Function to share the workout with others
  const shareWorkout = async () => {
    if (!generatedWorkout) return;
    
    const workoutSummary = `
${generatedWorkout.name}

${generatedWorkout.description}

Workout Schedule:
${generatedWorkout.days.map(day => 
  `• ${day.day} - ${day.focus}: ${day.exercises.length} exercises`
).join('\n')}

Generated with FitDemo AI Workout Generator
`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: generatedWorkout.name,
          text: workoutSummary,
          url: window.location.href
        });
      } else {
        // Fallback for browsers without share API
        navigator.clipboard.writeText(workoutSummary);
        alert('Workout summary copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  // Function to download the workout as a text file
  const downloadWorkout = () => {
    if (!generatedWorkout) return;
    
    let content = `# ${generatedWorkout.name}\n\n`;
    content += `${generatedWorkout.description}\n\n`;
    
    generatedWorkout.days.forEach(day => {
      content += `## ${day.day} - ${day.focus}\n\n`;
      
      if (day.exercises.length === 0) {
        content += `Rest day\n\n`;
      } else {
        content += `| Exercise | Sets | Reps | Rest |\n`;
        content += `|----------|------|------|------|\n`;
        
        day.exercises.forEach(exercise => {
          content += `| ${exercise.name} | ${exercise.sets} | ${exercise.reps} | ${exercise.rest} |\n`;
        });
        
        content += `\n`;
      }
      
      if (day.notes) {
        content += `Notes: ${day.notes}\n\n`;
      }
    });
    
    content += `\nGenerated with FitDemo AI Workout Generator`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedWorkout.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <FaRobot className="text-4xl mr-3 text-blue-500" />
          <h1 className="text-3xl font-bold">AI Workout Generator</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-center max-w-2xl mb-2">
          Use artificial intelligence to create a personalized workout plan tailored to your goals, experience, and preferences.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-2xl">
          Powered by Mistral AI - a state-of-the-art large language model that generates customized workouts based on your specific needs.
        </p>
      </div>

      {!generatedWorkout ? (
        <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Quick Start Presets</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <button 
                onClick={() => applyPreset('beginner')}
                className="py-2 px-3 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors"
              >
                Beginner
              </button>
              <button 
                onClick={() => applyPreset('intermediate')}
                className="py-2 px-3 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-colors"
              >
                Intermediate
              </button>
              <button 
                onClick={() => applyPreset('advanced')}
                className="py-2 px-3 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg transition-colors"
              >
                Advanced
              </button>
              <button 
                onClick={() => applyPreset('weightLoss')}
                className="py-2 px-3 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors"
              >
                Weight Loss
              </button>
              <button 
                onClick={() => applyPreset('cardio')}
                className="py-2 px-3 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg transition-colors"
              >
                Cardio
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                Fitness Goal
              </label>
              <select
                name="fitnessGoal"
                value={formData.fitnessGoal}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                required
              >
                <option value="strength">Strength</option>
                <option value="hypertrophy">Muscle Building</option>
                <option value="endurance">Endurance</option>
                <option value="weight_loss">Weight Loss</option>
                <option value="general_fitness">General Fitness</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                Experience Level
              </label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                required
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                Workout Duration (minutes)
              </label>
              <select
                name="workoutDuration"
                value={formData.workoutDuration}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                required
              >
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                Days Per Week
              </label>
              <select
                name="daysPerWeek"
                value={formData.daysPerWeek}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                required
              >
                <option value="3">3 days</option>
                <option value="4">4 days</option>
                <option value="5">5 days</option>
                <option value="6">6 days</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                Available Equipment
              </label>
              <select
                name="equipment"
                value={formData.equipment}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                required
              >
                <option value="none">None (Bodyweight Only)</option>
                <option value="basic">Basic (Dumbbells, Resistance Bands)</option>
                <option value="home_gym">Home Gym</option>
                <option value="full_gym">Full Gym Access</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                Injuries or Limitations (optional)
              </label>
              <textarea
                name="injuries"
                value={formData.injuries}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                rows="2"
                placeholder="E.g., knee injury, back pain, etc."
              ></textarea>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                Additional Preferences (optional)
              </label>
              <textarea
                name="preferences"
                value={formData.preferences}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                rows="2"
                placeholder="E.g., focus on certain muscle groups, avoid specific exercises, etc."
              ></textarea>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md shadow-sm transition duration-300 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" /> Generating Workout...
                </>
              ) : (
                <>
                  <FaRobot className="mr-2" /> Generate AI Workout Plan
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold">{generatedWorkout.name}</h2>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={saveWorkout}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md shadow-sm transition duration-300 flex items-center"
                >
                  <FaDumbbell className="mr-2" /> Save Program
                </button>
                <button 
                  onClick={toggleViewMode}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm transition duration-300 flex items-center"
                >
                  {viewMode === "list" ? (
                    <><FaCalendarAlt className="mr-2" /> Calendar View</>
                  ) : (
                    <><FaEye className="mr-2" /> List View</>
                  )}
                </button>
                {isSharingSupported && (
                  <button 
                    onClick={shareWorkout}
                    className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-md shadow-sm transition duration-300 flex items-center"
                  >
                    <FaShare className="mr-2" /> Share
                  </button>
                )}
                <button 
                  onClick={downloadWorkout}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-md shadow-sm transition duration-300 flex items-center"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
                <button 
                  onClick={() => setGeneratedWorkout(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md shadow-sm transition duration-300"
                >
                  Start Over
                </button>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{generatedWorkout.description}</p>
            
            {viewMode === "calendar" ? (
              renderCalendarView()
            ) : (
              <div className="space-y-6">
                {generatedWorkout.days.map((day, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-lg">{day.day}</h3>
                      <div className="flex items-center">
                        {day.focus !== "Rest" && (
                          <button 
                            onClick={() => showEquipmentForDay(day)}
                            className="p-1 mr-2 text-blue-500 hover:text-blue-700"
                            title="Show equipment needed"
                          >
                            <FaInfoCircle />
                          </button>
                        )}
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                          {day.focus}
                        </span>
                      </div>
                    </div>
                    
                    {day.exercises.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead>
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Exercise</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sets</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reps</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rest</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {day.exercises.map((exercise, exIndex) => (
                              <tr key={exIndex}>
                                <td className="px-4 py-3">{exercise.name}</td>
                                <td className="px-4 py-3">{exercise.sets}</td>
                                <td className="px-4 py-3">{exercise.reps}</td>
                                <td className="px-4 py-3">{exercise.rest}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-300 italic">Rest day</p>
                    )}
                    
                    {day.notes && (
                      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                        <strong>Notes:</strong> {day.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Equipment Modal */}
      <EquipmentModal 
        isOpen={showEquipmentModal} 
        onClose={() => setShowEquipmentModal(false)} 
        dayEquipment={selectedDayEquipment} 
      />

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} savedProgramId={savedProgramId} />
      )}
    </div>
  );
}

export default AIWorkoutGenerator; 