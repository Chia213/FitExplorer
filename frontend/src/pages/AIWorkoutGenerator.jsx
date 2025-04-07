import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaRobot, FaDumbbell, FaWeightHanging, FaRunning, FaUserAlt, FaCalendarAlt, FaSpinner, FaCheckCircle, FaArrowRight, FaPlay, FaEye, FaChevronLeft, FaChevronRight, FaInfoCircle, FaShare, FaDownload, FaExclamationTriangle, FaLightbulb, FaHeart, FaBolt } from "react-icons/fa";
import { GiWeightLiftingUp, GiJumpingRope, GiMuscleUp } from "react-icons/gi";
import { createSavedProgram } from "../api/savedProgramsApi";
import { toast } from "react-hot-toast";

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
    },
    homeWorkout: {
      fitnessGoal: "general_fitness",
      experienceLevel: "beginner",
      workoutDuration: "30",
      daysPerWeek: "3",
      equipment: "none",
      injuries: "",
      preferences: "Bodyweight exercises only, minimal equipment needed.",
    },
    cardioStrength: {
      fitnessGoal: "general_fitness",
      experienceLevel: "intermediate",
      workoutDuration: "45",
      daysPerWeek: "4",
      equipment: "basic",
      injuries: "",
      preferences: "Mix of cardio and strength training. HIIT focus.",
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
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState('');
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedProgramId, setSavedProgramId] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "list" or "calendar"
  const [previewWeek, setPreviewWeek] = useState(1);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [selectedDayEquipment, setSelectedDayEquipment] = useState(null);
  const [isSharingSupported, setIsSharingSupported] = useState(false);
  const [cardioInfoExercise, setCardioInfoExercise] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [workoutPreview, setWorkoutPreview] = useState(null);
  const navigate = useNavigate();

  // Check if sharing is supported by the browser
  useEffect(() => {
    setIsSharingSupported(!!navigator.share);
    
    // Generate workout preview based on current form settings
    generateWorkoutPreview();
  }, [formData.fitnessGoal, formData.daysPerWeek, formData.experienceLevel]);

  // Generate a preview of the workout based on current settings
  const generateWorkoutPreview = () => {
    const goalFocusMap = {
      'strength': 'strength and power',
      'hypertrophy': 'muscle growth',
      'endurance': 'cardiovascular endurance',
      'weight_loss': 'calorie burning and fat loss',
      'general_fitness': 'overall fitness'
    };
    
    const levelExpectationMap = {
      'beginner': 'foundational exercises with focus on proper form',
      'intermediate': 'moderate intensity and complexity',
      'advanced': 'challenging exercises with high intensity'
    };
    
    const daysStructureMap = {
      '1': 'a full-body routine',
      '2': 'a simple upper/lower split',
      '3': 'a full-body split across 3 days',
      '4': 'an upper/lower body split twice weekly',
      '5': 'a push/pull/legs split with additional focus days',
      '6': 'a 6-day push/pull/legs split',
      '7': 'a specialized split targeting each muscle group'
    };
    
    const expectedExercises = Math.floor(parseInt(formData.workoutDuration) / 7) + 2;
    const primaryFocus = formData.fitnessGoal === 'cardio' ? 'cardiovascular' : 'resistance';
    const equipmentLevel = formData.equipment === 'none' ? 'bodyweight' : formData.equipment === 'basic' ? 'basic equipment' : 'full gym';
    
    const preview = {
      focus: goalFocusMap[formData.fitnessGoal] || 'custom goals',
      level: levelExpectationMap[formData.experienceLevel] || 'appropriate intensity',
      structure: daysStructureMap[formData.daysPerWeek] || 'custom split',
      exercises: expectedExercises,
      primary: primaryFocus,
      equipment: equipmentLevel,
      duration: `${formData.workoutDuration} minutes per session`
    };
    
    setWorkoutPreview(preview);
  };

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
    setLoadingProgress(10);
    setLoadingStage('Preparing workout request...');
    
    try {
      // Check token first
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error("Please log in to generate a workout");
        navigate('/login', { state: { from: '/ai-workout-generator' } });
        return;
      }
      
      setLoadingProgress(20);
      setLoadingStage('Contacting AI fitness model...');
      
      // Call the AI workout generator API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai-workout/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      
      setLoadingProgress(60);
      setLoadingStage('Processing workout data...');
      
      if (!response.ok) {
        // If the AI endpoint fails, try the fallback endpoint
        if (response.status === 500) {
          setLoadingStage('Trying backup workout generator...');
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
          
          setLoadingProgress(80);
          setLoadingStage('Finalizing your workout plan...');
          
          const fallbackData = await fallbackResponse.json();
          setGeneratedWorkout(fallbackData);
          toast.success("Workout generated using backup system");
        } else {
          throw new Error('Failed to generate workout');
        }
      } else {
        setLoadingProgress(80);
        setLoadingStage('Creating your personalized workout...');
        
        const data = await response.json();
        setGeneratedWorkout(data);
        toast.success("Workout successfully generated!");
      }
      
      setLoadingProgress(100);
      setIsLoading(false);
    } catch (error) {
      console.error('Error generating workout:', error);
      setError("Failed to generate workout. Please try again.");
      toast.error("Could not generate workout. Using offline mode instead.");
      
      // Use mock data as a last resort if both API calls fail
      setLoadingStage('Falling back to offline workout template...');
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
        toast.error("Please log in to save your workout");
        navigate('/login', { state: { from: '/ai-workout-generator' } });
        return;
      }
      
      // Count the actual workout days (non-rest days)
      const workoutDaysCount = generatedWorkout.days.filter(day => day.focus !== "Rest").length;
      
      // Make sure this matches the user's selection
      const selectedDaysPerWeek = parseInt(formData.daysPerWeek);
      
      // Filter the days to match the user's selection if necessary
      let adjustedDays = [...generatedWorkout.days];
      if (workoutDaysCount !== selectedDaysPerWeek) {
        console.log(`Adjusting workout days from ${workoutDaysCount} to ${selectedDaysPerWeek}`);
        
        // If we need to reduce days, keep only the selected number of workout days
        if (workoutDaysCount > selectedDaysPerWeek) {
          // Keep only the first N non-rest days, and all rest days
          const keepWorkoutDays = adjustedDays
            .filter(day => day.focus !== "Rest")
            .slice(0, selectedDaysPerWeek);
            
          adjustedDays = adjustedDays.filter(day => 
            day.focus === "Rest" || keepWorkoutDays.includes(day)
          );
        }
        // If we need to add days, add full-body workout days
        else if (workoutDaysCount < selectedDaysPerWeek) {
          // Add the required number of workout days
          const daysToAdd = selectedDaysPerWeek - workoutDaysCount;
          for (let i = 0; i < daysToAdd; i++) {
            // Find a rest day to replace
            const restDayIndex = adjustedDays.findIndex(day => day.focus === "Rest");
            if (restDayIndex !== -1) {
              // Replace a rest day with a workout day
              adjustedDays[restDayIndex] = {
                day: adjustedDays[restDayIndex].day,
                focus: "Full Body",
                exercises: [
                  {
                    name: "Push-ups",
                    sets: 3,
                    reps: "10-15",
                    rest: "60 sec",
                  },
                  {
                    name: "Bodyweight Squats",
                    sets: 3,
                    reps: "15-20",
                    rest: "60 sec",
                  },
                  {
                    name: "Plank",
                    sets: 3,
                    reps: "30-60 seconds",
                    rest: "60 sec",
                  }
                ],
                notes: "Added to match your selected frequency of workouts per week."
              };
            } else {
              // If no rest days left, add a new day
              adjustedDays.push({
                day: `Day ${adjustedDays.length + 1}`,
                focus: "Full Body",
                exercises: [
                  {
                    name: "Push-ups",
                    sets: 3,
                    reps: "10-15",
                    rest: "60 sec",
                  },
                  {
                    name: "Bodyweight Squats",
                    sets: 3,
                    reps: "15-20",
                    rest: "60 sec",
                  },
                  {
                    name: "Plank",
                    sets: 3,
                    reps: "30-60 seconds",
                    rest: "60 sec",
                  }
                ],
                notes: "Added to match your selected frequency of workouts per week."
              });
            }
          }
        }
      }
      
      // Update the generatedWorkout with adjusted days
      const adjustedWorkout = {
        ...generatedWorkout,
        days: adjustedDays
      };
      
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
        } else if (daysCount === 7) {
          programFocus = "Body Part Split";
        }
        
        const focusArea = getMainFocus(adjustedDays) || programFocus;
        const goal = goalMap[formData.fitnessGoal] || 'Custom';
        const level = levelMap[formData.experienceLevel] || '';
        
        // Create a descriptive name format
        let programName = `${level} ${focusArea} ${goal} Program (${daysCount}x/week)`;
        
        return programName;
      };
      
      // Transform the workout to match the saved programs format
      const programData = {
        name: generateProgramName(),
        description: adjustedWorkout.description,
        category: mapGoalToCategory(formData.fitnessGoal),
        focusArea: getMainFocus(adjustedDays),
        duration: formData.workoutDuration,
        difficulty: formData.experienceLevel,
        workoutsPerWeek: formData.daysPerWeek,
        daysPerWeek: parseInt(formData.daysPerWeek), // Adding explicit property
        equipment: formData.equipment,
        targetMuscles: extractTargetMuscles(adjustedDays),
        
        // Use our restructured six-week program data for ProgramTracker
        sixWeekProgram: generateSixWeekProgram(adjustedDays, formData.experienceLevel),
        
        // Add a unique ID for the program
        id: "ai-" + Date.now()
      };
      
      // Use the API function instead of direct fetch
      const response = await createSavedProgram(programData, token);
      console.log('Workout saved successfully:', response);
      
      // Update the generated workout to match the adjusted one
      setGeneratedWorkout(adjustedWorkout);
      
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
    
    // Create a week structure with the correct number of workout days
    // For 1, 2, 3 days: put workouts on first days of the week, rest on others
    // For 4+ days: distribute throughout the week with the last day as rest
    
    // Define what type of split we'll use based on frequency
    let programFocus = "";
    let workoutSchedule = [];
    
    switch(daysCount) {
      case 1:
        programFocus = "Full Body";
        // Just one workout day on Monday, rest on other days
        workoutSchedule = [
          {day: "Day 1", focus: "Full Body", isRest: false},
          {day: "Day 2", focus: "Rest", isRest: true},
          {day: "Day 3", focus: "Rest", isRest: true},
          {day: "Day 4", focus: "Rest", isRest: true},
          {day: "Day 5", focus: "Rest", isRest: true},
          {day: "Day 6", focus: "Rest", isRest: true},
          {day: "Day 7", focus: "Rest", isRest: true}
        ];
        break;
      case 2:
        programFocus = "Upper/Lower Split";
        // Two workout days (upper/lower), rest on other days
        workoutSchedule = [
          {day: "Day 1", focus: "Upper Body", isRest: false},
          {day: "Day 2", focus: "Lower Body", isRest: false},
          {day: "Day 3", focus: "Rest", isRest: true},
          {day: "Day 4", focus: "Rest", isRest: true},
          {day: "Day 5", focus: "Rest", isRest: true},
          {day: "Day 6", focus: "Rest", isRest: true},
          {day: "Day 7", focus: "Rest", isRest: true}
        ];
        break;
      case 3:
        programFocus = "Full Body";
        // Three full body workouts with rest days between
        workoutSchedule = [
          {day: "Day 1", focus: "Full Body", isRest: false},
          {day: "Day 2", focus: "Rest", isRest: true},
          {day: "Day 3", focus: "Full Body", isRest: false},
          {day: "Day 4", focus: "Rest", isRest: true},
          {day: "Day 5", focus: "Full Body", isRest: false},
          {day: "Day 6", focus: "Rest", isRest: true},
          {day: "Day 7", focus: "Rest", isRest: true}
        ];
        break;
      case 4:
      programFocus = "Upper/Lower";
        workoutSchedule = [
          {day: "Day 1", focus: "Upper Body", isRest: false},
          {day: "Day 2", focus: "Lower Body", isRest: false},
          {day: "Day 3", focus: "Rest", isRest: true},
          {day: "Day 4", focus: "Upper Body", isRest: false},
          {day: "Day 5", focus: "Lower Body", isRest: false},
          {day: "Day 6", focus: "Rest", isRest: true},
          {day: "Day 7", focus: "Rest", isRest: true}
        ];
        break;
      case 5:
      programFocus = "PPL + Upper/Lower";
        workoutSchedule = [
          {day: "Day 1", focus: "Push", isRest: false},
          {day: "Day 2", focus: "Pull", isRest: false},
          {day: "Day 3", focus: "Legs", isRest: false},
          {day: "Day 4", focus: "Upper Body", isRest: false},
          {day: "Day 5", focus: "Lower Body", isRest: false},
          {day: "Day 6", focus: "Rest", isRest: true},
          {day: "Day 7", focus: "Rest", isRest: true}
        ];
        break;
      case 6:
      programFocus = "Push/Pull/Legs";
        workoutSchedule = [
          {day: "Day 1", focus: "Push", isRest: false},
          {day: "Day 2", focus: "Pull", isRest: false},
          {day: "Day 3", focus: "Legs", isRest: false},
          {day: "Day 4", focus: "Push", isRest: false},
          {day: "Day 5", focus: "Pull", isRest: false},
          {day: "Day 6", focus: "Legs", isRest: false},
          {day: "Day 7", focus: "Rest", isRest: true}
        ];
        break;
      case 7:
        programFocus = "Body Part Split";
        workoutSchedule = [
          {day: "Day 1", focus: "Chest", isRest: false},
          {day: "Day 2", focus: "Back", isRest: false},
          {day: "Day 3", focus: "Legs", isRest: false},
          {day: "Day 4", focus: "Shoulders", isRest: false},
          {day: "Day 5", focus: "Arms", isRest: false},
          {day: "Day 6", focus: "Core", isRest: false},
          {day: "Day 7", focus: "Cardio", isRest: false}
        ];
        break;
      default:
        programFocus = "Full Body";
        workoutSchedule = [
          {day: "Day 1", focus: "Full Body", isRest: false},
          {day: "Day 2", focus: "Rest", isRest: true},
          {day: "Day 3", focus: "Full Body", isRest: false},
          {day: "Day 4", focus: "Rest", isRest: true},
          {day: "Day 5", focus: "Full Body", isRest: false},
          {day: "Day 6", focus: "Rest", isRest: true},
          {day: "Day 7", focus: "Rest", isRest: true}
        ];
    }
    
    // Now create the actual workout days based on our schedule
    workoutSchedule.forEach((dayPlan, i) => {
      if (dayPlan.isRest) {
        workoutDays.push({
          day: dayPlan.day, 
          focus: "Rest",
          exercises: [],
          notes: "Recovery day. Focus on stretching, mobility, or light cardio if desired."
        });
      } else {
      // Generate exercises based on body part focus
      const exercises = [];
      
        if (dayPlan.focus === "Full Body" || dayPlan.focus === "Upper Body" || dayPlan.focus === "Push" || 
            dayPlan.focus === "Chest" || dayPlan.focus === "Shoulders" || dayPlan.focus === "Arms") {
        exercises.push({
          name: "Bench Press",
          sets: fitnessGoal === "strength" ? 5 : 3,
          reps: fitnessGoal === "strength" ? "5" : "10-12",
          rest: fitnessGoal === "strength" ? "3 min" : "60-90 sec",
            muscle: "Chest"
        });
        exercises.push({
          name: "Shoulder Press",
          sets: fitnessGoal === "strength" ? 4 : 3,
          reps: fitnessGoal === "strength" ? "6-8" : "10-12",
          rest: fitnessGoal === "strength" ? "2-3 min" : "60-90 sec",
            muscle: "Shoulders"
        });
      }
      
        if (dayPlan.focus === "Full Body" || dayPlan.focus === "Upper Body" || dayPlan.focus === "Pull" || 
            dayPlan.focus === "Back" || dayPlan.focus === "Arms") {
        exercises.push({
          name: "Pull-ups",
          sets: 3,
          reps: fitnessGoal === "strength" ? "6-8" : "10-12",
          rest: fitnessGoal === "strength" ? "2-3 min" : "60-90 sec",
            muscle: "Back"
        });
        exercises.push({
          name: "Barbell Rows",
          sets: fitnessGoal === "strength" ? 4 : 3,
          reps: fitnessGoal === "strength" ? "6-8" : "10-12",
          rest: fitnessGoal === "strength" ? "2-3 min" : "60-90 sec",
            muscle: "Back"
        });
      }
      
        if (dayPlan.focus === "Full Body" || dayPlan.focus === "Lower Body" || dayPlan.focus === "Legs") {
        exercises.push({
          name: "Squats",
          sets: fitnessGoal === "strength" ? 5 : 3,
          reps: fitnessGoal === "strength" ? "5" : "10-12",
          rest: fitnessGoal === "strength" ? "3 min" : "60-90 sec",
            muscle: "Quads"
        });
        exercises.push({
          name: "Romanian Deadlifts",
          sets: fitnessGoal === "strength" ? 4 : 3,
          reps: fitnessGoal === "strength" ? "6-8" : "10-12",
          rest: fitnessGoal === "strength" ? "2-3 min" : "60-90 sec",
            muscle: "Hamstrings"
        });
      }
      
        if (dayPlan.focus === "Core") {
        exercises.push({
            name: "Plank",
            sets: 3,
            reps: "30-60 seconds",
            rest: "60 sec",
            muscle: "Abs"
          });
          exercises.push({
            name: "Russian Twists",
            sets: 3,
            reps: "15-20 each side",
            rest: "60 sec",
            muscle: "Abs"
          });
          exercises.push({
            name: "Ab Rollouts",
            sets: 3,
            reps: "10-15",
            rest: "60 sec",
            muscle: "Abs"
          });
        }
      
        // Add cardio if fitness goal is endurance, weight loss, or we're on a cardio day
        if (fitnessGoal === "endurance" || fitnessGoal === "weight_loss" || dayPlan.focus === "Cardio") {
          // Determine appropriate cardio machines based on preferences
          const cardioMachines = ["Treadmill", "Exercise Bike", "Elliptical", "Rowing Machine"];
          
          if (fitnessGoal === "endurance" || dayPlan.focus === "Cardio") {
            // Add multiple steady state cardio options
            const machines = cardioMachines.slice(0, 2); // Just use 2 machines for mock data
            
            machines.forEach(machine => {
              exercises.push({
                name: `${machine} - Steady State Cardio`,
                sets: 1,
                reps: "30 minutes",
                rest: "N/A",
                is_cardio: true,
                target_duration: 30,
                target_distance: 5,
                calories: 300,
                muscle: "Cardio"
              });
            });
          } else {
            // For weight loss, add HIIT cardio
            exercises.push({
              name: "Treadmill - HIIT Cardio",
          sets: 1,
          reps: "20 minutes",
          rest: "N/A",
              is_cardio: true,
              target_duration: 20,
              target_distance: 3,
              calories: 250,
              muscle: "Cardio"
        });
          }
      }
      
      workoutDays.push({
          day: dayPlan.day,
          focus: dayPlan.focus,
        exercises: exercises,
        notes: `Focus on progressive overload. Adjust weights based on your ${experienceLevel} experience level.`
      });
    }
    });
    
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
    
    // Verify the correct number of workout days
    const workoutDayCount = workoutDays.filter(day => day.focus !== "Rest").length;
    console.log(`Generated workout with ${workoutDayCount} workout days, requested ${daysPerWeek}`);
    
    return {
      name: programName,
      description: `Custom ${goal.toLowerCase()} workout program designed with a ${programFocus.toLowerCase()} split for ${level.toLowerCase()} fitness enthusiasts. Features ${daysPerWeek} workouts per week, each approximately ${workoutDuration} minutes in duration.`,
      days: workoutDays,
      workoutsPerWeek: daysPerWeek.toString(),
      daysPerWeek: daysPerWeek.toString()
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
        volume: 1,    // 1 rep increase for certain weeks
        cardio: {
          duration: 2,  // 2 minute increase per week
          distance: 0.5 // 0.5 km increase per week
        }
      },
      intermediate: {
        intensity: 7, // 7% intensity increase per week
        volume: 2,    // 2 rep increase for certain weeks
        cardio: {
          duration: 3,  // 3 minute increase per week
          distance: 0.7 // 0.7 km increase per week
        }
      },
      advanced: {
        intensity: 10, // 10% intensity increase per week
        volume: 2,     // 2 rep increase for certain weeks
        cardio: {
          duration: 5,   // 5 minute increase per week
          distance: 1.0  // 1.0 km increase per week
        }
      }
    };
    
    const progression = progressionFactors[experienceLevel] || progressionFactors.intermediate;
    
    // Create a training schedule that maps day names to muscle groups
    const trainingSchedule = {};
    days.forEach((day) => {
      if (day.focus !== "Rest") {
        // Extract the muscle groups from the exercises
        const muscles = [...new Set(day.exercises.map(ex => {
          // Try to determine the muscle from exercise name/focus 
          const name = ex.name.toLowerCase();
          
          // Map exercises to muscle groups if not explicitly stated
          if (name.includes("bench") || name.includes("push") || name.includes("chest")) {
            return "Chest";
          } else if (name.includes("shoulder") || name.includes("press") || name.includes("delt")) {
            return "Shoulders";
          } else if (name.includes("tricep") || name.includes("dip")) {
            return "Triceps";
          } else if (name.includes("pull") || name.includes("row") || name.includes("lat")) {
            return "Back";
          } else if (name.includes("bicep") || name.includes("curl")) {
            return "Biceps";
          } else if (name.includes("squat") || name.includes("leg press") || name.includes("extension")) {
            return "Quads";
          } else if (name.includes("deadlift") || name.includes("hamstring") || name.includes("leg curl")) {
            return "Hamstrings";
          } else if (name.includes("ab") || name.includes("crunch") || name.includes("plank")) {
            return "Abs";
          } else if (name.includes("glute") || name.includes("hip")) {
            return "Glutes";
          } else if (name.includes("calf") || name.includes("raise")) {
            return "Calves";
          } else if (name.includes("cardio") || name.includes("run") || name.includes("jog") || name.includes("cycle")) {
            return "Cardio";
          } else {
            // Default to the day's focus if we can't determine muscle
            return day.focus;
          }
        }))];
        
        trainingSchedule[day.day] = muscles;
      } else {
        // Also add rest days to the training schedule with empty muscles array
        trainingSchedule[day.day] = ["Rest"];
      }
    });
    
    // Generate 6 weeks with progressive overload
    for (let week = 1; week <= 6; week++) {
      // Process each day and create structured workout days
      const workouts = [];
      
    days.forEach(day => {
        // Handle rest days
        if (day.focus === "Rest") {
          workouts.push({
            day: day.day,
            focus: "Rest",
            exercises: [],
            notes: day.notes || "Recovery day. Focus on stretching, mobility, and proper nutrition."
          });
          return; // Skip the rest of this iteration
        }
        
        if (day.exercises.length > 0) {
          // Deep copy the exercises for this day
          const dayExercises = JSON.parse(JSON.stringify(day.exercises));
          
          // Apply progression for this week to each exercise
          dayExercises.forEach(exercise => {
          // Determine muscle based on day focus
          const muscle = day.focus.includes(" and ") 
            ? day.focus.split(" and ")[0].trim() 
            : day.focus;
            
            // Make sure muscle property is set
            exercise.muscle = muscle;
            
            if (exercise.is_cardio) {
              // Progression for cardio exercises
              const baseDuration = parseInt(exercise.target_duration || 20);
              const baseDistance = parseFloat(exercise.target_distance || 5);
              
              // Increase duration and distance progressively
              exercise.target_duration = Math.round(baseDuration + ((week - 1) * progression.cardio.duration));
              exercise.target_distance = +(baseDistance + ((week - 1) * progression.cardio.distance)).toFixed(1);
              
              // Update calories based on increased duration/distance
              const baseCalories = exercise.calories || 250;
              const calorieMultiplier = (exercise.target_duration / baseDuration) * 0.8 + (exercise.target_distance / baseDistance) * 0.2;
              exercise.calories = Math.round(baseCalories * calorieMultiplier);
              
              // Format display values
              exercise.reps = `${exercise.target_duration} minutes`;
            } else {
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
        }
      });
      
          // Add this day to the workouts
          workouts.push({
            day: day.day,
            focus: day.focus,
            exercises: dayExercises,
            notes: day.notes || ""
          });
        }
      });
      
      // Create a week object with the workouts
      sixWeekProgram.push({
        week: week,
        workouts: workouts,
        exercises: workouts.flatMap(day => day.exercises) // Also include flat exercises for backward compatibility
      });
    }
    
    return sixWeekProgram;
  };

  // Function to handle starting the workout program
  const startWorkoutProgram = () => {
    // Ensure the workout has the proper day structure for the Program Tracker
    if (generatedWorkout) {
      // Create a training schedule that maps day names to muscle groups
      const trainingSchedule = {};
      
      // Count the actual workout days (non-rest days)
      const workoutDaysCount = generatedWorkout.days.filter(day => day.focus !== "Rest").length;
      
      // Make sure this matches the user's selection
      const selectedDaysPerWeek = parseInt(formData.daysPerWeek);
      
      // Filter the days to match the user's selection if necessary
      let adjustedDays = [...generatedWorkout.days];
      
      // Special handling for 1-day, 2-day and 7-day frequencies
      if (selectedDaysPerWeek === 1) {
        // For 1-day programs, create a comprehensive full-body workout
        const allExercises = adjustedDays
          .filter(day => day.focus !== "Rest")
          .flatMap(day => day.exercises);
          
        // Keep a balanced selection of exercises (limited to prevent workout being too long)
        const maxExercisesFor1Day = 8;
        const balancedExercises = [];
        
        // Group exercises by body part to ensure balance
        const exercisesByBodyPart = {};
        allExercises.forEach(exercise => {
          const name = exercise.name.toLowerCase();
          let bodyPart = "Other";
          
          if (name.includes("chest") || name.includes("bench") || name.includes("push")) {
            bodyPart = "Chest";
          } else if (name.includes("back") || name.includes("row") || name.includes("pull")) {
            bodyPart = "Back";
          } else if (name.includes("shoulder") || name.includes("press") || name.includes("delt")) {
            bodyPart = "Shoulders";
          } else if (name.includes("leg") || name.includes("squat") || name.includes("lunge")) {
            bodyPart = "Legs";
          } else if (name.includes("arm") || name.includes("curl") || name.includes("extension")) {
            bodyPart = "Arms";
          } else if (name.includes("core") || name.includes("ab") || name.includes("plank")) {
            bodyPart = "Core";
          } else if (name.includes("cardio") || name.includes("run") || name.includes("bike")) {
            bodyPart = "Cardio";
          }
          
          if (!exercisesByBodyPart[bodyPart]) {
            exercisesByBodyPart[bodyPart] = [];
          }
          exercisesByBodyPart[bodyPart].push(exercise);
        });
        
        // Pick 1-2 exercises from each body part to create a balanced full-body workout
        Object.keys(exercisesByBodyPart).forEach(bodyPart => {
          const exercises = exercisesByBodyPart[bodyPart];
          if (exercises.length > 0) {
            // Take 1-2 exercises per body part, limiting the total to maxExercisesFor1Day
            const numToTake = Math.min(2, exercises.length, 
              Math.max(1, Math.floor(maxExercisesFor1Day / Object.keys(exercisesByBodyPart).length)));
            balancedExercises.push(...exercises.slice(0, numToTake));
          }
        });
        
        // Create a single full-body day with balanced exercises
        adjustedDays = [{
          day: "Day 1",
          focus: "Full Body",
          exercises: balancedExercises.slice(0, maxExercisesFor1Day),
          notes: "Complete full-body workout targeting all major muscle groups."
        }];
        
        // Add rest days to fill the week
        for (let i = 1; i < 7; i++) {
          adjustedDays.push({
            day: `Day ${i+1}`,
            focus: "Rest",
            exercises: [],
            notes: "Recovery day. Focus on stretching, mobility, and proper nutrition."
          });
        }
      } 
      else if (selectedDaysPerWeek === 2) {
        // For 2-day programs, create upper/lower split
        const upperBodyExercises = [];
        const lowerBodyExercises = [];
        
        // Categorize all exercises into upper and lower body
        adjustedDays
          .filter(day => day.focus !== "Rest")
          .forEach(day => {
        day.exercises.forEach(exercise => {
              const name = exercise.name.toLowerCase();
              if (name.includes("leg") || name.includes("squat") || name.includes("lunge") || 
                  name.includes("deadlift") || name.includes("calf") || name.includes("glute")) {
                lowerBodyExercises.push(exercise);
              } else {
                upperBodyExercises.push(exercise);
              }
            });
          });
        
        // Create the 2-day split
        adjustedDays = [
          {
            day: "Day 1",
            focus: "Upper Body",
            exercises: upperBodyExercises.slice(0, 8), // Limit to 8 exercises
            notes: "Focus on all upper body muscle groups."
          },
          {
            day: "Day 2",
            focus: "Lower Body",
            exercises: lowerBodyExercises.slice(0, 8), // Limit to 8 exercises
            notes: "Focus on all lower body muscle groups."
          }
        ];
        
        // Add rest days to fill the week
        for (let i = 2; i < 7; i++) {
          adjustedDays.push({
            day: `Day ${i+1}`,
            focus: "Rest",
            exercises: [],
            notes: "Recovery day. Focus on stretching, mobility, and proper nutrition."
          });
        }
      }
      else if (selectedDaysPerWeek === 7) {
        // For 7-day programs, ensure we have a balanced week with one rest day
        const allExercises = adjustedDays
          .filter(day => day.focus !== "Rest")
          .flatMap(day => day.exercises);
          
        // Group exercises by muscle target for better distribution
        const muscleGroups = [
          "Chest", "Back", "Shoulders", "Arms", "Legs", "Core", "Full Body"
        ];
        
        // Create specialized days for each muscle group
        const newAdjustedDays = [];
        
        // Day 1-6: Dedicated muscle group workouts
        muscleGroups.slice(0, 6).forEach((muscle, index) => {
          // Filter exercises that target this muscle group
          const muscleExercises = allExercises.filter(ex => {
            const name = ex.name.toLowerCase();
            
            if (muscle === "Chest" && (name.includes("chest") || name.includes("bench") || name.includes("push")))
              return true;
            if (muscle === "Back" && (name.includes("back") || name.includes("row") || name.includes("pull")))
              return true;
            if (muscle === "Shoulders" && (name.includes("shoulder") || name.includes("press") || name.includes("delt")))
              return true;
            if (muscle === "Arms" && (name.includes("arm") || name.includes("curl") || name.includes("tricep") || name.includes("bicep")))
              return true;
            if (muscle === "Legs" && (name.includes("leg") || name.includes("squat") || name.includes("lunge") || name.includes("deadlift")))
              return true;
            if (muscle === "Core" && (name.includes("core") || name.includes("ab") || name.includes("plank")))
              return true;
              
            return false;
          });
          
          // If not enough exercises found, add some general ones
          const dayExercises = muscleExercises.length >= 4 
            ? muscleExercises.slice(0, 6) 
            : [...muscleExercises, ...allExercises.filter(ex => !muscleExercises.includes(ex)).slice(0, 6 - muscleExercises.length)];
          
          newAdjustedDays.push({
            day: `Day ${index + 1}`,
            focus: muscle,
            exercises: dayExercises,
            notes: `Focus on ${muscle.toLowerCase()} training.`
          });
        });
        
        // Day 7: Rest day
        newAdjustedDays.push({
          day: "Day 7",
          focus: "Rest",
          exercises: [],
          notes: "Recovery day. Focus on stretching, mobility, and proper nutrition."
        });
        
        adjustedDays = newAdjustedDays;
      }
      // For other days per week (3-6), use the existing logic
      else if (workoutDaysCount !== selectedDaysPerWeek) {
        console.log(`Adjusting workout days from ${workoutDaysCount} to ${selectedDaysPerWeek}`);
        
        // If we need to reduce days, keep only the selected number of workout days
        if (workoutDaysCount > selectedDaysPerWeek) {
          // Keep only the first N non-rest days, and all rest days
          const keepWorkoutDays = adjustedDays
            .filter(day => day.focus !== "Rest")
            .slice(0, selectedDaysPerWeek);
            
          adjustedDays = adjustedDays.filter(day => 
            day.focus === "Rest" || keepWorkoutDays.includes(day)
          );
        }
        // If we need to add days, add full-body workout days
        else if (workoutDaysCount < selectedDaysPerWeek) {
          // Add the required number of workout days
          const daysToAdd = selectedDaysPerWeek - workoutDaysCount;
          for (let i = 0; i < daysToAdd; i++) {
            // Find a rest day to replace
            const restDayIndex = adjustedDays.findIndex(day => day.focus === "Rest");
            if (restDayIndex !== -1) {
              // Replace a rest day with a workout day
              adjustedDays[restDayIndex] = {
                day: adjustedDays[restDayIndex].day,
                focus: "Full Body",
                exercises: [
                  {
                    name: "Push-ups",
                    sets: 3,
                    reps: "10-15",
                    rest: "60 sec",
                  },
                  {
                    name: "Bodyweight Squats",
                    sets: 3,
                    reps: "15-20",
                    rest: "60 sec",
                  },
                  {
                    name: "Plank",
                    sets: 3,
                    reps: "30-60 seconds",
                    rest: "60 sec",
                  }
                ],
                notes: "Added to match your selected frequency of workouts per week."
              };
        } else {
              // If no rest days left, add a new day
              adjustedDays.push({
                day: `Day ${adjustedDays.length + 1}`,
                focus: "Full Body",
                exercises: [
                  {
                    name: "Push-ups",
                    sets: 3,
                    reps: "10-15",
                    rest: "60 sec",
                  },
                  {
                    name: "Bodyweight Squats",
                    sets: 3,
                    reps: "15-20",
                    rest: "60 sec",
                  },
                  {
                    name: "Plank",
                    sets: 3,
                    reps: "30-60 seconds",
                    rest: "60 sec",
                  }
                ],
                notes: "Added to match your selected frequency of workouts per week."
              });
            }
          }
        }
      }
      
      // Update the generatedWorkout with adjusted days
      const adjustedWorkout = {
        ...generatedWorkout,
        days: adjustedDays
      };
      
      // Now build the training schedule with the adjusted days
      adjustedDays.forEach((day, index) => {
        if (day.focus !== "Rest") {
          // Extract the muscle groups from the exercises
          const muscles = [...new Set(day.exercises.map(ex => {
            const name = ex.name.toLowerCase();
            
            // Map exercises to muscle groups based on their names
            if (name.includes("bench") || name.includes("push") || name.includes("chest")) {
              return "Chest";
            } else if (name.includes("shoulder") || name.includes("press") || name.includes("delt")) {
              return "Shoulders";
            } else if (name.includes("tricep") || name.includes("dip")) {
              return "Triceps";
            } else if (name.includes("pull") || name.includes("row") || name.includes("lat")) {
              return "Back";
            } else if (name.includes("bicep") || name.includes("curl")) {
              return "Biceps";
            } else if (name.includes("squat") || name.includes("leg press") || name.includes("extension")) {
              return "Quads";
            } else if (name.includes("deadlift") || name.includes("hamstring") || name.includes("leg curl")) {
              return "Hamstrings";
            } else if (name.includes("ab") || name.includes("crunch") || name.includes("plank")) {
              return "Abs";
            } else if (name.includes("glute") || name.includes("hip")) {
              return "Glutes";
            } else if (name.includes("calf") || name.includes("raise")) {
              return "Calves";
            } else if (name.includes("cardio") || name.includes("run") || name.includes("jog") || name.includes("cycle")) {
              return "Cardio";
        } else {
              // Default to the day's focus if we can't determine muscle
              // For days like "Upper Body" or "Lower Body", use more general categories
              const focus = day.focus.toLowerCase();
              if (focus.includes("upper")) {
                return "Upper Body";
              } else if (focus.includes("lower")) {
                return "Lower Body";
              } else if (focus.includes("full")) {
                return "Full Body";
              } else {
                return day.focus;
              }
            }
          }))];
          
          trainingSchedule[day.day] = muscles;
        } else {
          // Mark rest days in the training schedule
          trainingSchedule[day.day] = ["Rest"];
        }
      });
      
      // Generate a new six week program based on adjusted workout
      const enhancedSixWeekProgram = generateSixWeekProgram(adjustedDays, formData.experienceLevel);
      
      // Include the training schedule and workouts per week in the program data
      const enhancedWorkout = {
        ...adjustedWorkout,
        trainingSchedule: trainingSchedule,
        workoutsPerWeek: selectedDaysPerWeek.toString(),
        daysPerWeek: selectedDaysPerWeek.toString(), // Adding more explicit property
        sixWeekProgram: enhancedSixWeekProgram
      };
      
      console.log("Final workout structure:", {
        daysPerWeek: selectedDaysPerWeek,
        trainingScheduleDayCount: Object.keys(trainingSchedule).length,
        workoutDays: enhancedWorkout.days.length,
        hasTrainingSchedule: !!trainingSchedule,
        firstDay: enhancedWorkout.days[0]?.focus,
        workoutsPerWeek: enhancedWorkout.workoutsPerWeek
      });
      
      // Navigate to program tracker with enhanced workout data
      navigate('/program-tracker', { 
        state: { 
          programId: savedProgramId,
          workout: enhancedWorkout
        } 
      });
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "list" ? "calendar" : "list");
  };
  
  // Function to share workout
  const shareWorkout = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: generatedWorkout.name,
          text: `Check out my new workout program: ${generatedWorkout.name}`,
          url: window.location.href
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share workout');
    }
  };

  // Function to download workout as JSON
  const downloadWorkout = () => {
    const workoutData = JSON.stringify(generatedWorkout, null, 2);
    const blob = new Blob([workoutData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedWorkout.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Workout downloaded successfully');
  };

  // Function to render calendar view of the workout
  const renderCalendarView = () => {
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 gap-0 border-b border-gray-200 dark:border-gray-700">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div key={index} className="p-3 text-center font-medium bg-gray-100 dark:bg-gray-700">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0 auto-rows-fr">
          {generatedWorkout.days.map((day, index) => (
            <div key={index} className="p-3 border-b border-r border-gray-200 dark:border-gray-700 min-h-[120px]">
              <div className="font-medium mb-1">{day.day.replace('Day ', '')}</div>
              {day.focus === "Rest" ? (
                <div className="text-sm text-gray-500 dark:text-gray-400 italic">Rest Day</div>
              ) : (
                <>
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">{day.focus}</div>
                  <ul className="text-xs text-gray-600 dark:text-gray-300 list-disc list-inside">
                    {day.exercises.slice(0, 3).map((ex, exIndex) => (
                      <li key={exIndex} className="truncate">{ex.name}</li>
                    ))}
                    {day.exercises.length > 3 && (
                      <li className="text-gray-500 dark:text-gray-400">+{day.exercises.length - 3} more</li>
                    )}
                  </ul>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Equipment Modal component
  const EquipmentModal = ({ isOpen, onClose, dayEquipment }) => {
    if (!isOpen || !dayEquipment) return null;
    
    // Get unique equipment needed for this day's exercises
    const equipmentList = new Set();
    dayEquipment.exercises.forEach(exercise => {
      const guidance = getExerciseGuidance(exercise.name);
      if (guidance && guidance.equipment) {
        // Split by commas and add each piece of equipment
        guidance.equipment.split(/,|and/).forEach(item => {
          const trimmed = item.trim();
          if (trimmed) equipmentList.add(trimmed);
        });
      }
    });
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold dark:text-white">
              Equipment for {dayEquipment.day} - {dayEquipment.focus}
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-2">
            {Array.from(equipmentList).length > 0 ? (
              <ul className="list-disc list-inside text-gray-800 dark:text-gray-200">
                {Array.from(equipmentList).map((item, index) => (
                  <li key={index}>{item}</li>
              ))}
            </ul>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No specific equipment information available.</p>
          )}
          </div>
          
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

  // Cardio Guidance Modal
  const CardioGuidanceModal = ({ isOpen, onClose, exercise }) => {
    if (!isOpen || !exercise) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold dark:text-white">
              {exercise.name} Guidance
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">RECOMMENDED APPROACH</h4>
              <p className="text-gray-800 dark:text-gray-200">
                Start with a 5-minute warm-up at a comfortable pace. 
                Then follow the main workout as prescribed, adjusting intensity as needed.
                Finish with a 3-5 minute cool-down at a reduced pace.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">TARGET METRICS</h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Duration</div>
                  <div className="font-bold text-blue-600 dark:text-blue-400">{exercise.target_duration || exercise.reps || "20-30"} min</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Distance</div>
                  <div className="font-bold text-green-600 dark:text-green-400">{exercise.target_distance || "5"} km</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Calories</div>
                  <div className="font-bold text-purple-600 dark:text-purple-400">{exercise.calories || "250"}</div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">INTENSITY GUIDANCE</h4>
              <p className="text-gray-800 dark:text-gray-200">
                {exercise.name.toLowerCase().includes('hiit') ? 
                  "Alternate between high-intensity (85-95% max effort) periods of 30-60 seconds and recovery periods (40-50% effort) of 60-120 seconds." :
                  "Maintain a steady pace where you can hold a conversation but feel challenged (60-70% of max effort)."
                }
              </p>
            </div>
          </div>
          
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

  // Function to show equipment for a specific day
  const showEquipmentForDay = (day) => {
    setSelectedDayEquipment(day);
    setShowEquipmentModal(true);
  };

  // Function to get exercise guidance information
  const getExerciseGuidance = (exerciseName) => {
    const lowerName = exerciseName.toLowerCase();
    
    // Chest exercises
    if (lowerName.includes('bench press')) {
      return {
        title: "Bench Press",
        description: "A compound exercise that targets the chest, shoulders, and triceps.",
        equipment: "Barbell or dumbbells, flat bench, and potentially a rack for safety.",
        form: "Lie on a flat bench, retract your shoulder blades, maintain a slight arch in your lower back. Lower the weight to mid-chest and press back up, ensuring your wrists stay straight and elbows don't flare excessively.",
        tips: "Use a spotter for heavier weights. For barbell, grip should be slightly wider than shoulder width. For dumbbells, allow a deeper stretch at the bottom."
      };
    } else if (lowerName.includes('push up') || lowerName.includes('pushup')) {
      return {
        title: "Push-up",
        description: "A bodyweight compound exercise for the chest, shoulders, and triceps.",
        equipment: "No equipment needed, just a flat surface.",
        form: "Start in a plank position with hands slightly wider than shoulder-width. Lower your body until your chest nearly touches the floor, keeping elbows at about 45° from your body. Maintain a straight line from head to heels throughout.",
        tips: "For easier variation, perform on knees. For harder version, elevate feet or use a weighted vest."
      };
    } 
    // ... existing code ...
    
    // Default for unknown exercises
    return {
      title: exerciseName,
      description: "A targeted exercise in your workout program.",
      equipment: "Check with a fitness professional for the specific equipment needed for this exercise.",
      form: "Proper form is crucial for effectiveness and safety. Consider consulting a trainer for guidance on this specific exercise.",
      tips: "Start with lighter weights to master the movement pattern before progressing to heavier loads."
    };
  };

  // Success Modal component
  const SuccessModal = ({ isOpen, onClose, savedProgramId }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-bold dark:text-white">
              Workout Saved Successfully
          </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>
          
          <div className="my-4 text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-3">
              <FaCheckCircle className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Your workout program has been saved to your library!
            </p>
          </div>
          
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => {
                navigate('/saved-programs');
                onClose();
              }}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center justify-center"
            >
              <FaDumbbell className="mr-2" /> View My Programs
            </button>
            
            <button
              onClick={() => {
                startWorkoutProgram();
                onClose();
              }}
              className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors flex items-center justify-center"
            >
              <FaPlay className="mr-2" /> Start This Program Now
            </button>
            
            <button
              onClick={onClose}
              className="w-full py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Exercise Guidance Modal
  const ExerciseGuidanceModal = ({ isOpen, onClose, exercise }) => {
    if (!isOpen || !exercise) return null;
    
    const guidance = getExerciseGuidance(exercise.name);
    if (!guidance) {
      onClose();
      return null;
    }
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold dark:text-white">
              {guidance.title}
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">DESCRIPTION</h4>
              <p className="text-gray-800 dark:text-gray-200">{guidance.description}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">EQUIPMENT</h4>
              <p className="text-gray-800 dark:text-gray-200">{guidance.equipment}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">PROPER FORM</h4>
              <p className="text-gray-800 dark:text-gray-200">{guidance.form || guidance.recommendations}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">TIPS</h4>
              <p className="text-gray-800 dark:text-gray-200">{guidance.tips || guidance.metrics}</p>
            </div>
          </div>
          
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

  // Main component render
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center">
          <FaRobot className="mr-3 text-blue-500" /> AI Workout Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Create personalized workout plans tailored to your fitness goals, experience level, and available equipment.
        </p>
      </header>

      {!generatedWorkout ? (
        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaDumbbell className="mr-2 text-blue-500" /> Create Your Workout
            </h2>
            
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md flex items-start">
                <FaExclamationTriangle className="mr-2 mt-1 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                  Fitness Goal
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-1">
              <button 
                    type="button"
                    onClick={() => setFormData({...formData, fitnessGoal: "strength"})}
                    className={`flex items-center justify-center p-3 border rounded-lg transition-all ${
                      formData.fitnessGoal === "strength" 
                        ? "bg-blue-100 border-blue-500 text-blue-800 dark:bg-blue-900 dark:text-blue-200" 
                        : "bg-white border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-650"
                    }`}
                  >
                    <FaWeightHanging className="mr-2" />
                    <span>Strength</span>
              </button>
              <button 
                    type="button"
                    onClick={() => setFormData({...formData, fitnessGoal: "hypertrophy"})}
                    className={`flex items-center justify-center p-3 border rounded-lg transition-all ${
                      formData.fitnessGoal === "hypertrophy" 
                        ? "bg-blue-100 border-blue-500 text-blue-800 dark:bg-blue-900 dark:text-blue-200" 
                        : "bg-white border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-650"
                    }`}
                  >
                    <GiMuscleUp className="mr-2" />
                    <span>Muscle Growth</span>
              </button>
              <button 
                    type="button"
                    onClick={() => setFormData({...formData, fitnessGoal: "endurance"})}
                    className={`flex items-center justify-center p-3 border rounded-lg transition-all ${
                      formData.fitnessGoal === "endurance" 
                        ? "bg-blue-100 border-blue-500 text-blue-800 dark:bg-blue-900 dark:text-blue-200" 
                        : "bg-white border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-650"
                    }`}
                  >
                    <FaRunning className="mr-2" />
                    <span>Endurance</span>
              </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button 
                    type="button"
                    onClick={() => setFormData({...formData, fitnessGoal: "weight_loss"})}
                    className={`flex items-center justify-center p-3 border rounded-lg transition-all ${
                      formData.fitnessGoal === "weight_loss" 
                        ? "bg-blue-100 border-blue-500 text-blue-800 dark:bg-blue-900 dark:text-blue-200" 
                        : "bg-white border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-650"
                    }`}
                  >
                    <FaBolt className="mr-2" />
                    <span>Weight Loss</span>
              </button>
              <button 
                    type="button"
                    onClick={() => setFormData({...formData, fitnessGoal: "general_fitness"})}
                    className={`flex items-center justify-center p-3 border rounded-lg transition-all ${
                      formData.fitnessGoal === "general_fitness" 
                        ? "bg-blue-100 border-blue-500 text-blue-800 dark:bg-blue-900 dark:text-blue-200" 
                        : "bg-white border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-650"
                    }`}
                  >
                    <FaHeart className="mr-2" />
                    <span>General Fitness</span>
              </button>
            </div>
          </div>
          
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                Experience Level
              </label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                    className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                Workout Duration (minutes)
              </label>
              <select
                name="workoutDuration"
                value={formData.workoutDuration}
                onChange={handleChange}
                    className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                    <option value="20">20 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                    <option value="75">75 minutes</option>
                <option value="90">90 minutes</option>
              </select>
                </div>
            </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                Days Per Week
              </label>
              <select
                name="daysPerWeek"
                value={formData.daysPerWeek}
                onChange={handleChange}
                    className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                    <option value="1">1 day</option>
                    <option value="2">2 days</option>
                <option value="3">3 days</option>
                <option value="4">4 days</option>
                <option value="5">5 days</option>
                <option value="6">6 days</option>
                    <option value="7">7 days</option>
              </select>
            </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                Available Equipment
              </label>
              <select
                name="equipment"
                value={formData.equipment}
                onChange={handleChange}
                    className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                    <option value="none">Bodyweight Only</option>
                    <option value="basic">Basic (Dumbbells, Bands)</option>
                <option value="home_gym">Home Gym</option>
                <option value="full_gym">Full Gym Access</option>
              </select>
                </div>
            </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                  Injuries/Limitations (Optional)
              </label>
                <input
                  type="text"
                name="injuries"
                value={formData.injuries}
                onChange={handleChange}
                  placeholder="e.g., Knee pain, shoulder injury"
                  className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                  Additional Preferences (Optional)
              </label>
              <textarea
                name="preferences"
                value={formData.preferences}
                onChange={handleChange}
                  placeholder="e.g., Include HIIT, focus on core, avoid squats"
                  rows="3"
                  className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>

              <div className="pt-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Quick Presets:</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(presetConfigurations).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormData(presetConfigurations[preset])}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-sm transition-colors"
                    >
                      {preset.charAt(0).toUpperCase() + preset.slice(1)}
                    </button>
                  ))}
              </div>
              </div>

              <div>
            <button
              type="submit"
              disabled={isLoading}
                  className={`w-full py-3 px-6 flex items-center justify-center rounded-lg text-white font-medium transition-all ${
                    isLoading 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                  }`}
            >
              {isLoading ? (
                <>
                      <FaSpinner className="animate-spin mr-2" />
                      Generating Workout...
                </>
              ) : (
                <>
                      <FaRobot className="mr-2" />
                      Generate Workout Plan
                </>
              )}
            </button>
              </div>
          </form>
          </div>
          
          {/* Preview Panel */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaLightbulb className="mr-2 text-yellow-500" /> Workout Preview
              </h2>
              
              {workoutPreview && (
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Based on your selections, we'll generate:
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-3">
                        <FaDumbbell className="text-blue-600 dark:text-blue-300" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">Workout Focus</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          A program focusing on {workoutPreview.focus}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full mr-3">
                        <FaUserAlt className="text-green-600 dark:text-green-300" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">Difficulty Level</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Designed for {formData.experienceLevel}s with {workoutPreview.level}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full mr-3">
                        <FaCalendarAlt className="text-purple-600 dark:text-purple-300" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">Structure</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {formData.daysPerWeek} days per week using {workoutPreview.structure}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full mr-3">
                        <GiWeightLiftingUp className="text-orange-600 dark:text-orange-300" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">Exercises</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Approximately {workoutPreview.exercises} exercises per session using {workoutPreview.equipment}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full mr-3">
                        <FaRunning className="text-red-600 dark:text-red-300" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">Session Length</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {workoutPreview.duration}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {isLoading && (
                <div className="mt-6">
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{loadingStage}</span>
                      <span className="text-gray-700 dark:text-gray-300">{loadingProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                        style={{width: `${loadingProgress}%`}}
                      ></div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    We're using AI to create your personalized workout program. This may take a moment...
                  </p>
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5 border border-blue-100 dark:border-blue-900">
              <h3 className="font-medium text-blue-800 dark:text-blue-300 flex items-center mb-3">
                <FaInfoCircle className="mr-2" /> AI-Powered Workouts
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                Our AI generates personalized workouts based on scientific principles of exercise programming, adapting to your specific needs and goals.
              </p>
              <ul className="text-sm text-blue-700 dark:text-blue-400 list-disc list-inside space-y-1">
                <li>Progressive overload across 6 weeks</li>
                <li>Balanced muscle targeting</li>
                <li>Appropriate volume based on experience</li>
                <li>Cardio recommendations tailored to goals</li>
                <li>Rest days for optimal recovery</li>
              </ul>
            </div>
          </div>
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
                              {day.exercises.some(e => e.is_cardio) && day.exercises.every(e => e.is_cardio) ? (
                                <>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Distance</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Calories</th>
                                </>
                              ) : (
                                <>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reps</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rest</th>
                                  {day.exercises.some(e => e.is_cardio) && <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Notes</th>}
                                </>
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {day.exercises.map((exercise, exIndex) => (
                              <tr key={exIndex}>
                                <td className="px-4 py-3">
                                  {exercise.name}
                                  <div className="mt-2">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedExercise(exercise);
                                      }}
                                      className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                      <FaInfoCircle className="mr-1" /> Exercise Guide
                                    </button>
                                  </div>
                                </td>
                                <td className="px-4 py-3">{exercise.sets}</td>
                                {exercise.is_cardio ? (
                                  <>
                                    {day.exercises.every(e => e.is_cardio) ? (
                                      <>
                                        <td className="px-4 py-3">{exercise.target_duration || exercise.reps || "20-30"} min</td>
                                        <td className="px-4 py-3">{exercise.target_distance || "5"} km</td>
                                        <td className="px-4 py-3">{exercise.calories || "250"} kcal</td>
                                      </>
                                    ) : (
                                      <>
                                        <td className="px-4 py-3">{exercise.target_duration || exercise.reps || "20-30"} min</td>
                                        <td className="px-4 py-3">N/A</td>
                                        <td className="px-4 py-3">Cardio: {exercise.target_distance || "5"} km | {exercise.calories || "250"} kcal</td>
                                      </>
                                    )}
                                  </>
                                ) : (
                                  <>
                                <td className="px-4 py-3">{exercise.reps}</td>
                                <td className="px-4 py-3">{exercise.rest}</td>
                                    {day.exercises.some(e => e.is_cardio) && <td className="px-4 py-3">-</td>}
                                  </>
                                )}
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

      {/* Cardio Guidance Modal */}
      <CardioGuidanceModal
        isOpen={cardioInfoExercise !== null}
        onClose={() => setCardioInfoExercise(null)}
        exercise={cardioInfoExercise}
      />

      {/* Exercise Guidance Modal */}
      <ExerciseGuidanceModal
        isOpen={selectedExercise !== null}
        onClose={() => setSelectedExercise(null)}
        exercise={selectedExercise}
      />

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} savedProgramId={savedProgramId} />
      )}
    </div>
  );
}

export default AIWorkoutGenerator; 