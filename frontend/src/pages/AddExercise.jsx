import React, { useState, useEffect, useRef } from "react";
import {
  FaArrowLeft,
  FaPlus,
  FaSearch,
  FaTrash,
  FaEdit,
  FaCheck,
  FaTimes,
  FaSync,
  FaDumbbell,
  FaRunning,
  FaHeart,
  FaExclamationTriangle,
  FaSignInAlt
} from "react-icons/fa";
import { getUserCustomExercises, createCustomExercise, updateCustomExercise, deleteCustomExercise } from "../services/customExercisesService";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import authService from '../services/authService';
import customExercisesService from '../services/customExercisesService';

function AddExercise({ onClose, onSelectExercise }) {
  const defaultExercisesData = {
    Abs: ["Crunches", "Leg Raises", "Plank", "Sit-ups", "Russian Twists", "Mountain Climbers"],
    Back: ["Pull-ups", "Deadlifts", "Bent-over Rows", "Lat Pulldowns", "T-Bar Rows", "Seated Rows"],
    Biceps: ["Bicep Curls", "Hammer Curls", "Concentration Curls", "Preacher Curls", "Cable Curls"],
    Cardio: ["Running", "Cycling", "Jump Rope", "Stair Climber", "Elliptical", "Rowing", "Swimming"],
    Chest: ["Bench Press", "Push-ups", "Chest Fly", "Incline Press", "Decline Press", "Cable Crossover"],
    Legs: ["Squats", "Lunges", "Leg Press", "Leg Extensions", "Hamstring Curls", "Calf Raises"],
    Shoulders: ["Shoulder Press", "Lateral Raises", "Face Pulls", "Upright Rows", "Front Raises", "Shrugs"],
    Triceps: ["Dips", "Tricep Extensions", "Close-Grip Bench Press", "Skull Crushers", "Pushdowns"],
    Custom: [] // Empty array for custom exercises
  };

  // State for exercise selection
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exercises, setExercises] = useState(defaultExercisesData);
  const [customExercises, setCustomExercises] = useState([]);
  
  // State for search and filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // State for custom exercise creation
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseCategory, setNewExerciseCategory] = useState("Strength"); // Only Strength and Cardio options available
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [createError, setCreateError] = useState("");
  
  // State for editing custom exercises
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [editExerciseId, setEditExerciseId] = useState(null);
  const [editExerciseName, setEditExerciseName] = useState("");
  const [editExerciseCategory, setEditExerciseCategory] = useState(""); // Will be set to either Strength or Cardio
  const [editError, setEditError] = useState("");
  
  // State for UI management
  const [initialSets, setInitialSets] = useState(3);
  const [isMobile, setIsMobile] = useState(false);
  const [isIPhone, setIsIPhone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("categories");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Refs
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const [authStatus, setAuthStatus] = useState({
    isAuthenticated: false,
    isValidated: false,
    isChecking: true
  });

  // Device detection
  useEffect(() => {
    const checkDevice = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipod|ipad/.test(userAgent);
      const isMobileDevice = window.innerWidth <= 640 || isIOS;
      
      setIsIPhone(isIOS);
      setIsMobile(isMobileDevice);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const hasToken = authService.isAuthenticated();
        if (!hasToken) {
          setIsAuthenticated(false);
          setAuthStatus({
            isAuthenticated: false,
            isValidated: true,
            isChecking: false
          });
          return;
        }

        const isValid = await authService.validateToken();
        setIsAuthenticated(hasToken && isValid);
        setAuthStatus({
          isAuthenticated: hasToken && isValid,
          isValidated: true,
          isChecking: false
        });
      } catch (error) {
        console.error("Error checking auth status:", error);
        setIsAuthenticated(false);
        setAuthStatus({
          isAuthenticated: false,
          isValidated: true,
          isChecking: false
        });
      }
    };
    
    checkAuthStatus();
  }, []);

  // Load exercises from API on mount
  useEffect(() => {
    const loadExercises = async () => {
      setIsLoading(true);
      try {
        // Load custom exercises from API - will return empty array if auth fails
        const apiExercises = await getUserCustomExercises();
        setCustomExercises(apiExercises);
        
        if (apiExercises && apiExercises.length > 0) {
          // If we successfully loaded exercises, we must be authenticated
          setAuthStatus(prev => ({ 
            ...prev, 
            isAuthenticated: true,
            isValidated: true
          }));
          setIsAuthenticated(true);
        }
        
        // Load category-based exercises from localStorage (default exercises remain unchanged)
        const savedExercises = localStorage.getItem("exercises");
    if (savedExercises) {
          const parsedExercises = JSON.parse(savedExercises);
          
          // Create a final exercise structure with defaults plus any categorized custom exercises
          // that exist in the user's custom exercises
          const finalExercises = {...defaultExercisesData};
          
          Object.keys(parsedExercises).forEach(category => {
            if (category !== "Custom") {
              // For built-in categories, keep default exercises plus any custom ones that exist
              // in the user's custom exercises from the API
              finalExercises[category] = [
                ...defaultExercisesData[category], 
                ...parsedExercises[category].filter(name => 
                  !defaultExercisesData[category].includes(name) && // Not a default exercise
                  apiExercises.some(ex => ex.name === name) // Exists in API custom exercises
                )
              ];
            }
          });
          
          // Set the state with cleaned up data
          setExercises(finalExercises);
        }
      } catch (error) {
        console.error("Failed to load exercises:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadExercises();
  }, []);

  // Add a useEffect to handle search results
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }

    // Case-insensitive search
    const term = searchTerm.toLowerCase();
    const results = [];

    // Search through each category
    Object.entries(exercises).forEach(([category, exerciseList]) => {
      exerciseList.forEach((exercise) => {
        const exerciseName = typeof exercise === "string" ? exercise : exercise.name;
        
        // Skip if we've already added this exercise to results
        if (results.some(r => r.name === exerciseName)) {
          return;
        }
        
        // Check if this exercise exists in customExercises (might have been deleted)
        const isCustomExercise = customExercises.some(ce => ce.name === exerciseName);
        const isDeletedCustom = exerciseName.startsWith("local-") && !isCustomExercise;
        
        // Skip if it's a deleted custom exercise
        if (isDeletedCustom) {
          return;
        }
        
        if (exerciseName.toLowerCase().includes(term)) {
          // Check if this is a custom exercise
          const isCustom = customExercises.some(ce => ce.name === exerciseName);
          
          results.push({
            name: exerciseName,
            category: category,
            isCustom: isCustom
          });
        }
      });
    });

    // Also search in custom exercises directly to ensure we catch any that might
    // not be in the exercises categories yet
    customExercises.forEach(exercise => {
      if (exercise.name.toLowerCase().includes(term) && 
          !results.some(r => r.name === exercise.name)) {
        results.push({
          name: exercise.name,
          category: exercise.category === "Cardio" ? "Cardio" : "Strength",
          isCustom: true
        });
      }
    });

    // Sort results: put exact matches first, then sort alphabetically
    results.sort((a, b) => {
      const aExact = a.name.toLowerCase() === term;
      const bExact = b.name.toLowerCase() === term;
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return a.name.localeCompare(b.name);
    });

    setSearchResults(results);
  }, [searchTerm, exercises, customExercises]);

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setActiveTab("exercises");
    setSelectedExercise(null);
    setSearchTerm("");
    
    // When selecting Custom category, ensure we have the latest custom exercises
    if (category === "Custom") {
      // Check authentication first
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      if (!token && isMobile) {
        // Show message for mobile users without authentication
        toast.error("You're working offline. Custom exercises will be saved locally only.", 
          { duration: 4000 }
        );
      }
      
      getUserCustomExercises()
        .then(data => {
          setCustomExercises(data || []);
        })
        .catch(error => {
          console.error("Failed to refresh custom exercises:", error);
          // Don't show error toast, just silently continue with local exercises
        });
    }
  };

  const handleSelectExercise = (exercise) => {
    // Make sure we get the name if exercise is a string or an object
    const exerciseName = typeof exercise === 'string' ? exercise : exercise.name;
    setSelectedExercise(exerciseName);
    
    // Determine the category for the selected exercise
    if (typeof exercise === 'object' && exercise.isCustom) {
      // For custom exercises, use the category from the exercise object
      setSelectedCategory(exercise.category);
    } else if (typeof exercise === 'object') {
      setSelectedCategory(exercise.category);
    }
    
    setActiveTab("sets");
  };

  const handleAddCustomExercise = async () => {
    if (!newExerciseName.trim()) {
      setCreateError("Exercise name is required");
      return;
    }

    setIsCreating(true);
    setCreateError("");

    try {
      // Check if the exercise name already exists in custom exercises
      const duplicateExercise = customExercises.find(
        (ex) => ex.name.toLowerCase() === newExerciseName.toLowerCase()
      );

      // Also check if the exercise name exists in any of the default categories
      let existsInDefaultCategories = false;
      Object.entries(exercises).forEach(([category, exerciseList]) => {
        if (exerciseList.includes(newExerciseName) || 
            exerciseList.some(e => e.toLowerCase() === newExerciseName.toLowerCase())) {
          existsInDefaultCategories = true;
        }
      });

      if (duplicateExercise || existsInDefaultCategories) {
        setCreateError("An exercise with this name already exists");
        setIsCreating(false);
        return;
      }

      // Check if user is authenticated
      if (!isAuthenticated) {
        setCreateError("You must be logged in to create custom exercises");
        toast.error("Authentication required to create custom exercises");
        setIsCreating(false);
        return;
      }

      // Create exercise on server
      const response = await createCustomExercise({
        name: newExerciseName,
        category: newExerciseCategory,
      });
      
      const newExercise = response;

      // Update state with new exercise
      setCustomExercises(prev => [...prev, newExercise]);

      // Add the exercise to the appropriate exercise category as well
      // Determine which category to add the exercise to based on form selection
      const targetCategory = 
        // For cardio exercises, always add to the Cardio category
        newExerciseCategory === "Cardio" ? "Cardio" : 
        // For strength exercises, add to the selected muscle group (or Custom if none selected)
        selectedCategory && 
        ["Abs", "Back", "Biceps", "Chest", "Legs", "Shoulders", "Triceps"].includes(selectedCategory) 
        ? selectedCategory 
        : "Custom";
      
      // Only add the exercise to a single specific category (uniqueness)
      setExercises(prevExercises => {
        const updatedCategoryExercises = { ...prevExercises };
        
        // First, ensure the exercise is not in any other category
        Object.keys(updatedCategoryExercises).forEach(category => {
          if (category !== targetCategory) {
            updatedCategoryExercises[category] = updatedCategoryExercises[category].filter(
              name => name !== newExerciseName
            );
          }
        });
        
        // Then add it to the target category
        if (updatedCategoryExercises[targetCategory]) {
          // Add the exercise to the category if it doesn't already exist
          if (!updatedCategoryExercises[targetCategory].includes(newExerciseName)) {
            updatedCategoryExercises[targetCategory] = [
              ...updatedCategoryExercises[targetCategory],
              newExerciseName
            ];
          }
        }
        
        // Save category assignments to localStorage
        localStorage.setItem("exercises", JSON.stringify(updatedCategoryExercises));
        return updatedCategoryExercises;
      });

      // Reset form
      setNewExerciseName("");
      setIsAddingCustom(false);
      
      // Show success message
      toast.success(`Exercise "${newExerciseName}" created successfully!`);
      
      // Select the new exercise - pass the complete exercise object with isCustom flag
      handleSelectExercise({
        name: newExercise.name,
        category: newExercise.category,
        isCustom: true,
        id: newExercise.id
      });
    } catch (error) {
      console.error("Error creating custom exercise:", error);
      const errorMessage = error?.response?.status === 401
        ? "Your session has expired. Please log in again."
        : error?.response?.data?.detail || "An unexpected error occurred. Please try again.";
      
      setCreateError(errorMessage);
      toast.error("Failed to create custom exercise");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRemoveExercise = async (exerciseName) => {
    if (window.confirm(`Are you sure you want to remove "${exerciseName}" from your exercises?`)) {
      try {
        setIsLoading(true);
        
        // Find the custom exercise object
        const customExerciseObj = customExercises.find(ex => ex.name === exerciseName);
        
        if (!customExerciseObj) {
          toast.error("Exercise not found");
          setIsLoading(false);
          return;
        }
        
        // Check if user is authenticated
        if (!isAuthenticated) {
          toast.error("You must be logged in to delete custom exercises");
          setIsLoading(false);
          return;
        }
        
        // Delete from server
        await deleteCustomExercise(customExerciseObj.id);
        
        // Update state to remove the exercise
        setCustomExercises(prev => prev.filter(ex => ex.id !== customExerciseObj.id));
        toast.success("Custom exercise deleted");
        
        // Remove from all categories in exercises localStorage
      setExercises((prevExercises) => {
        const updatedExercises = { ...prevExercises };

          // Remove from all categories
          Object.keys(updatedExercises).forEach(category => {
            if (updatedExercises[category].includes(exerciseName)) {
              updatedExercises[category] = updatedExercises[category].filter(name => name !== exerciseName);
            }
          });

        localStorage.setItem("exercises", JSON.stringify(updatedExercises));
        return updatedExercises;
      });

      if (selectedExercise === exerciseName) {
        setSelectedExercise(null);
          setActiveTab("exercises");
        }
      } catch (error) {
        console.error("Failed to remove exercise:", error);
        toast.error("Failed to remove exercise");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Function to open edit mode for a custom exercise
  const handleEditExercise = (exercise) => {
    setEditExerciseId(exercise.id);
    setEditExerciseName(exercise.name);
    // Convert any old categories (Flexibility, Balance) to Strength
    const normalizedCategory = exercise.category === "Cardio" ? "Cardio" : "Strength";
    setEditExerciseCategory(normalizedCategory);
    setEditError("");
    setIsEditingCustom(true);
  };

  // Function to save updated exercise
  const handleUpdateExercise = async () => {
    if (!editExerciseName.trim()) {
      setEditError("Exercise name is required");
      return;
    }

    try {
      // Check if the updated name conflicts with an existing exercise (excluding the current one)
      const duplicateExercise = customExercises.find(
        (ex) => ex.id !== editExerciseId && 
                ex.name.toLowerCase() === editExerciseName.toLowerCase()
      );

      // Check if the name exists in default categories
      let existsInDefaultCategories = false;
      Object.entries(exercises).forEach(([category, exerciseList]) => {
        if (exerciseList.some(e => 
          typeof e === 'string' && 
          e.toLowerCase() === editExerciseName.toLowerCase())
        ) {
          existsInDefaultCategories = true;
        }
      });

      if (duplicateExercise || existsInDefaultCategories) {
        setEditError("An exercise with this name already exists");
        return;
      }

      // Check if user is authenticated
      if (!isAuthenticated) {
        setEditError("You must be logged in to update custom exercises");
        toast.error("Authentication required to update custom exercises");
        return;
      }

      // Find the exercise to update
      const exerciseToUpdate = customExercises.find(ex => ex.id === editExerciseId);
      if (!exerciseToUpdate) {
        setEditError("Exercise not found");
        return;
      }

      // Get the original name to update in category lists later
      const originalName = exerciseToUpdate.name;
      
      // Update the exercise on server
      const updatedExercise = await updateCustomExercise(editExerciseId, {
        name: editExerciseName,
        category: editExerciseCategory
      });

      // Update the exercise in the customExercises state
      setCustomExercises(prevExercises => 
        prevExercises.map(ex => 
          ex.id === editExerciseId ? updatedExercise : ex
        )
      );

      // Update any references in the exercises categories
      setExercises(prevExercises => {
        const updatedExercises = { ...prevExercises };

        // Remove the exercise from all categories (original name and edited name)
        Object.keys(updatedExercises).forEach(category => {
          updatedExercises[category] = updatedExercises[category].filter(
            name => name !== originalName && name !== editExerciseName
          );
        });
        
        // Add to the appropriate category
        const targetCategory = 
          // For cardio exercises, always add to the Cardio category
          editExerciseCategory === "Cardio" ? "Cardio" : 
          // For strength exercises, add to the selected muscle group (or Custom if none selected)
          selectedCategory && 
          ["Abs", "Back", "Biceps", "Chest", "Legs", "Shoulders", "Triceps"].includes(selectedCategory) 
          ? selectedCategory 
          : "Custom";
        
        // Add the exercise to the target category
        if (targetCategory !== "Custom" && updatedExercises[targetCategory]) {
          updatedExercises[targetCategory].push(editExerciseName);
        }
        
        // Save to localStorage
        localStorage.setItem("exercises", JSON.stringify(updatedExercises));
        return updatedExercises;
      });

      // If this is the currently selected exercise, update the selection
      if (selectedExercise === originalName) {
        setSelectedExercise(editExerciseName);
      }

      // Close the edit modal
      setIsEditingCustom(false);
      toast.success(`Exercise "${editExerciseName}" updated successfully!`);
    } catch (error) {
      console.error("Error updating custom exercise:", error);
      const errorMessage = error?.response?.status === 401
        ? "Your session has expired. Please log in again."
        : error?.response?.data?.detail || "Failed to update exercise. Please try again.";
      
      setEditError(errorMessage);
      toast.error("Failed to update custom exercise");
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Abs":
        return "💪";
      case "Back":
        return "🔙";
      case "Biceps":
        return "💪";
      case "Cardio":
        return "🏃";
      case "Chest":
        return "👕";
      case "Legs":
        return "🦵";
      case "Shoulders":
        return "🙌";
      case "Triceps":
        return "💪";
      case "Custom":
        return "⭐";
      default:
        return "🏋️";
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Abs":
        return "from-yellow-400 to-yellow-300";
      case "Back":
        return "from-blue-500 to-blue-400";
      case "Biceps":
        return "from-green-500 to-green-400";
      case "Cardio":
        return "from-red-500 to-red-400";
      case "Chest":
        return "from-indigo-500 to-indigo-400";
      case "Legs":
        return "from-purple-500 to-purple-400";
      case "Shoulders":
        return "from-orange-500 to-orange-400";
      case "Triceps":
        return "from-teal-500 to-teal-400";
      case "Custom":
        return "from-pink-500 to-pink-400";
      default:
        return "from-gray-500 to-gray-400";
    }
  };

  const handleAddExerciseClick = () => {
    // Create a proper exercise object to pass to WorkoutLog
    if (selectedExercise) {
      // Find if this is a custom exercise
      const customExerciseObj = customExercises.find(ex => ex.name === selectedExercise);
      
      // Determine if it's a cardio exercise (either by selected category or by the exercise's saved category)
      const isCardio = selectedCategory === "Cardio" || 
                      (customExerciseObj && customExerciseObj.category === "Cardio");
      
      const exerciseObject = {
        name: selectedExercise,
        category: selectedCategory,
        is_cardio: isCardio,
        is_custom: !!customExerciseObj,
        initialSets: initialSets
      };
      
      // Add any additional properties from the custom exercise if available
      if (customExerciseObj) {
        exerciseObject.id = customExerciseObj.id;
        // Ensure we use the correct category from the custom exercise
        exerciseObject.category = customExerciseObj.category;
      }
      
      onSelectExercise(exerciseObject, initialSets);
    }
  };

  // Add login redirect function
  const redirectToLogin = () => {
    // Close the modal and navigate to login
    onClose();
    navigate('/login', { state: { from: window.location.pathname } });
  };

  const renderCategoriesTab = () => (
    <>
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <h3 className={`${isIPhone ? "text-sm" : "text-base"} font-semibold`}>Select Category</h3>
              <button
            onClick={() => setActiveTab("search")}
            className="text-blue-500 flex items-center text-xs font-medium"
          >
            <FaSearch className={`${isIPhone ? "text-xs" : ""} mr-0.5`} /> Search
              </button>
        </div>
        
        {!isAuthenticated && (
          <div className={`bg-yellow-50 border border-yellow-200 rounded-lg ${isIPhone ? "p-1.5 mb-1.5 text-2xs" : "p-2 mb-2 text-xs"} text-yellow-800`}>
            <div className="flex items-center">
              <FaExclamationTriangle className={`mr-1 text-yellow-600 flex-shrink-0 ${isIPhone ? "text-2xs" : "text-xs"}`} />
              <span className="font-medium">Login required for custom exercises</span>
            </div>
            <button 
              onClick={redirectToLogin}
              className="w-full bg-blue-500 text-white py-1 mt-1 rounded-md text-2xs flex items-center justify-center"
            >
              <FaSignInAlt className="mr-0.5" /> Login
            </button>
          </div>
        )}
        
        <div className={`grid ${isIPhone ? "grid-cols-4 gap-1" : isMobile ? "grid-cols-3 gap-1.5" : "grid-cols-3 gap-3"}`}>
          {Object.keys(exercises).map((category) => (
            <button
              key={category}
              onClick={() => handleSelectCategory(category)}
              className={`
                flex flex-col items-center justify-center rounded-lg border
                transition-all duration-200 overflow-hidden
                ${isIPhone ? "p-1 h-[55px]" : isMobile ? "p-2 h-[60px]" : "p-4 h-24"}
                ${isIPhone ? "text-2xs" : isMobile ? "text-xs" : "text-sm"}
                ${selectedCategory === category 
                  ? `bg-gradient-to-br ${getCategoryColor(category)} border-transparent text-white shadow-md transform scale-105`
                  : "bg-white border-gray-300 hover:bg-gray-100 text-gray-700"}
              `}
            >
              <span className={`${isIPhone ? "text-base mb-0.5" : isMobile ? "text-lg mb-1" : "text-2xl mb-2"}`}>{getCategoryIcon(category)}</span>
              <span className="font-medium truncate w-full text-center">{category}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-2">
              <button
                onClick={() => {
            if (!isAuthenticated) {
              toast.error("You must be logged in to create custom exercises");
              return;
            }
            setIsAddingCustom(true);
          }}
          className={`w-full ${isIPhone ? "py-1.5 text-xs" : isMobile ? "py-2 text-sm" : "py-3"} rounded-md ${isAuthenticated ? "bg-green-500 hover:bg-green-600" : "bg-gray-400"} text-white font-semibold flex items-center justify-center`}
        >
          <FaPlus className="mr-1" /> {isIPhone ? "Create Custom" : "Create Custom Exercise"}
              </button>
      </div>
    </>
  );
  
  const renderExercisesTab = () => {
    // Get custom exercises for the current category if not in the Custom category
    const categoryCustomExercises = selectedCategory !== "Custom" 
      ? customExercises.filter(ex => {
          // For exercises that are explicitly assigned to this category
          const exerciseAddedToThisCategory = exercises[selectedCategory]?.includes(ex.name);
          
          // For cardio category, check if exercise category is Cardio
          if (selectedCategory === "Cardio") {
            return ex.category === "Cardio" || exerciseAddedToThisCategory;
          }
          
          // For muscle group categories, show exercises that are assigned to this category 
          // OR if the custom exercise has a matching category
          return exerciseAddedToThisCategory || 
                 (selectedCategory === ex.category && ex.category !== "Cardio");
        })
      : [];

    return (
      <>
        <div className="mb-3">
          <div className="flex items-center mb-2">
              <button
              onClick={() => setActiveTab("categories")}
              className="mr-2 text-blue-500"
              >
              <FaArrowLeft size={isIPhone ? 16 : 18} />
              </button>
            <h3 className={`${isIPhone ? "text-base" : "text-lg"} font-semibold flex-1`}>
              {selectedCategory} Exercises
            </h3>
            <button
              onClick={() => setActiveTab("search")}
              className="text-blue-500"
            >
              <FaSearch size={isIPhone ? 16 : 18} />
            </button>
          </div>
          
          <div className={`${isIPhone ? "max-h-[350px]" : "max-h-[400px]"} overflow-y-auto pr-1 mb-3`}>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <FaSync className="animate-spin text-blue-500 text-xl" />
              </div>
            ) : selectedCategory === "Custom" ? (
              <>
                <div className="mb-2">
                  <button
                    onClick={() => setIsAddingCustom(true)}
                    className={`w-full ${isIPhone ? "py-1.5 text-sm" : "py-2"} rounded-lg bg-green-500 text-white font-medium flex items-center justify-center`}
                  >
                    <FaPlus className="mr-1" /> Create New Custom Exercise
                  </button>
                </div>
                {customExercises.length > 0 ? (
                  <ul className={`space-y-2 ${isIPhone ? "px-0.5" : ""}`}>
                    {customExercises.map((exercise) => {
                      // Find which category this exercise is assigned to
                      let assignedCategory = "Custom";
                      Object.entries(exercises).forEach(([category, exerciseList]) => {
                        if (category !== "Custom" && exerciseList.includes(exercise.name)) {
                          assignedCategory = category;
                        }
                      });
                      
                      return (
                        <li
                          key={exercise.id}
                          className={`
                            flex items-center justify-between p-3 rounded-lg
                            ${isIPhone ? "min-h-[54px]" : ""}
                            ${
                              selectedExercise === exercise.name
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                            }
                          `}
                        >
                          <button
                            className="flex-1 text-left flex flex-col min-h-[40px]"
                            onClick={() => handleSelectExercise({
                              name: exercise.name,
                              category: exercise.category,
                              isCustom: true,
                              id: exercise.id
                            })}
                          >
                            <span className="flex items-center">
                              <span className="mr-2">⭐</span>
                              <span className={`${isIPhone ? "text-base" : ""}`}>{exercise.name}</span>
                            </span>
                            {selectedCategory === "Custom" && assignedCategory !== "Custom" && (
                              <span className="text-xs text-gray-500 ml-6">
                                {assignedCategory} {exercise.category === "Cardio" ? "(Cardio)" : "(Strength)"}
                              </span>
                            )}
                          </button>
                          <div className="flex">
                            <button
                              onClick={() => handleEditExercise(exercise)}
                              className="text-blue-500 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                              title="Edit Exercise"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleRemoveExercise(exercise.name)}
                              className="text-red-500 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                              title="Delete Exercise"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-4">No custom exercises found</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Show button to add custom exercise for this category */}
                <div className="mb-2">
                  <button
                    onClick={() => {
                      setNewExerciseCategory(selectedCategory === "Cardio" ? "Cardio" : "Strength");
                      setIsAddingCustom(true);
                    }}
                    className={`w-full ${isIPhone ? "py-1.5 text-sm" : "py-2"} rounded-lg bg-green-500 text-white font-medium flex items-center justify-center`}
                  >
                    <FaPlus className="mr-1" /> Create New {selectedCategory} Exercise
                  </button>
          </div>

                {/* Default category exercises */}
                {exercises[selectedCategory].length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 text-gray-500">Default Exercises</h4>
                    <ul className={`space-y-2 ${isIPhone ? "px-0.5" : ""}`}>
                      {exercises[selectedCategory].map((exercise, index) => (
                        <li
                          key={`${exercise}-${index}`}
                          className={`
                            flex items-center justify-between p-3 rounded-lg
                            ${isIPhone ? "min-h-[54px]" : ""}
                            ${
                              selectedExercise === exercise
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }
                          `}
                        >
                          <button
                            className="flex-1 text-left min-h-[40px] flex items-center"
                            onClick={() => handleSelectExercise({
                              name: exercise,
                              category: selectedCategory,
                              isCustom: false
                            })}
                          >
                            <span className={`${isIPhone ? "text-base" : ""}`}>{exercise}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Custom exercises for this category */}
                {categoryCustomExercises.length > 0 && (
            <div>
                    <h4 className="text-sm font-semibold mb-2 text-gray-500 dark:text-gray-400">Your Custom {selectedCategory} Exercises</h4>
                    <ul className={`space-y-2 ${isIPhone ? "px-0.5" : ""}`}>
                      {categoryCustomExercises.map((exercise) => (
                        <li
                          key={exercise.id}
                          className={`
                            flex items-center justify-between p-3 rounded-lg
                            ${isIPhone ? "min-h-[54px]" : ""}
                            ${
                              selectedExercise === exercise.name
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                            }
                          `}
                        >
                          <button
                            className="flex-1 text-left flex items-center min-h-[40px]"
                            onClick={() => handleSelectExercise(exercise)}
                          >
                            <span className="mr-2">⭐</span>
                            <span className={`${isIPhone ? "text-base" : ""}`}>{exercise.name}</span>
                          </button>
                          <div className="flex">
                            <button
                              onClick={() => handleEditExercise(exercise)}
                              className="text-blue-500 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                              title="Edit Exercise"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleRemoveExercise(exercise.name)}
                              className="text-red-500 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                              title="Delete Exercise"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {exercises[selectedCategory].length === 0 && categoryCustomExercises.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-4">No exercises found in this category</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {selectedExercise && (
          <div className="mt-3">
            <button
              onClick={() => setActiveTab("sets")}
              className={`w-full ${isIPhone ? "py-2 text-sm" : "py-3"} rounded-lg bg-blue-500 text-white font-semibold min-h-[40px]`}
            >
              Continue with {selectedExercise}
            </button>
          </div>
        )}
      </>
    );
  };
  
  const renderSearchTab = () => (
    <>
      <div className="mb-4">
        <div className="flex items-center mb-3">
          <button
            onClick={() => {
              setActiveTab(selectedCategory ? "exercises" : "categories");
              setSearchTerm("");
            }}
            className="mr-2 text-blue-500"
          >
            <FaArrowLeft />
          </button>
          <h3 className="text-lg font-semibold flex-1">
            Search Exercises
          </h3>
        </div>
        
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search for exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pr-10 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ fontSize: isMobile ? '16px' : 'inherit' }}
            ref={searchInputRef}
          />
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              <FaTimes />
            </button>
          ) : (
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          )}
        </div>

        {searchTerm.trim() !== "" && (
          <div className="max-h-[400px] overflow-y-auto pr-1">
            {searchResults.length > 0 ? (
              <div className="overflow-y-auto max-h-60 p-2">
                {Object.entries(searchResults.reduce((acc, exercise) => {
                  if (!acc[exercise.category]) {
                    acc[exercise.category] = [];
                  }
                  acc[exercise.category].push(exercise);
                  return acc;
                }, {})).map(([category, exercises]) => (
                  <div key={category} className="mb-4">
                    <h3 className="font-semibold text-sm text-gray-600 mb-2">{category}</h3>
                    {exercises.map((exercise, index) => (
                      <div
                        key={`${exercise.name}-${index}`}
                        className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                        onClick={() => handleSelectExercise(exercise)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{exercise.name}</span>
                          {exercise.isCustom && (
                            <span className="text-xs text-blue-500">Custom Exercise</span>
                          )}
                        </div>
                        <button
                          className="p-1 text-blue-500 hover:text-blue-700 focus:outline-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectExercise(exercise);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-gray-500">No exercises found. Would you like to create a custom exercise?</p>
                <button
                  onClick={() => {
                    setActiveTab("addCustom");
                    setNewExerciseName(searchTerm);
                  }}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Create Custom Exercise
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
  
  const renderSetsTab = () => (
    <>
      <div className="mb-3">
        <div className="flex items-center mb-2">
                          <button
            onClick={() => setActiveTab("exercises")}
            className="mr-2 text-blue-500"
                          >
            <FaArrowLeft size={isIPhone ? 16 : 18} />
                          </button>
          <h3 className={`${isIPhone ? "text-base" : "text-lg"} font-semibold flex-1`}>
            Set Configuration
          </h3>
        </div>
        
        <div className={`bg-blue-50 ${isIPhone ? "p-3" : "p-4"} rounded-lg mb-3`}>
          <h4 className="font-semibold text-blue-800 mb-1 text-center">
            {selectedExercise || "No exercise selected"}
          </h4>
          <p className={`text-blue-600 ${isIPhone ? "text-xs" : "text-sm"} text-center`}>
            {selectedCategory || ""}
          </p>
        </div>
        
        <div className="mb-4">
          <label className={`block ${isIPhone ? "text-xs" : "text-sm"} font-medium text-gray-700 mb-2`}>
            How many sets would you like to add?
          </label>
          <div className="flex items-center justify-between bg-gray-100 rounded-lg p-2">
                            <button
              onClick={() => setInitialSets(Math.max(1, initialSets - 1))}
              className={`${isIPhone ? "w-8 h-8" : "w-10 h-10"} flex items-center justify-center text-blue-600 bg-white rounded-lg shadow`}
                            >
              -
                            </button>
            <span className="text-2xl font-bold">{initialSets}</span>
                            <button
              onClick={() => setInitialSets(initialSets + 1)}
              className={`${isIPhone ? "w-8 h-8" : "w-10 h-10"} flex items-center justify-center text-blue-600 bg-white rounded-lg shadow`}
                            >
              +
                            </button>
                          </div>
                        </div>
                    </div>
      
      <button
        onClick={handleAddExerciseClick}
        className={`w-full ${isIPhone ? "py-2 text-sm" : "py-3"} rounded-lg ${selectedExercise ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-300"} text-white font-semibold`}
        disabled={!selectedExercise}
      >
        {selectedExercise ? `Add ${initialSets} ${initialSets === 1 ? 'Set' : 'Sets'} of ${selectedExercise}` : 'Select an exercise first'}
      </button>
    </>
  );

  const renderAddCustomForm = () => (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-3">
      <div className={`bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg w-full ${isIPhone ? "max-w-[300px]" : isMobile ? "max-w-[330px]" : "max-w-md"} p-4 max-h-[85vh] overflow-y-auto shadow-xl`}>
        <div className="flex justify-between items-center mb-3 border-b pb-2">
          <h3 className={`${isIPhone ? "text-sm" : "text-base"} font-bold flex items-center`}>
            <FaPlus className="mr-2 text-blue-500" /> Create Custom Exercise
          </h3>
          <button
            onClick={() => {
              setIsAddingCustom(false);
              setNewExerciseName("");
              setCreateError("");
            }}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <FaTimes size={isIPhone ? 14 : 16} />
          </button>
                  </div>
        
        {!isAuthenticated && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3 text-xs text-red-800">
            <div className="flex items-center mb-1">
              <FaExclamationTriangle className="mr-1 text-red-500 flex-shrink-0" />
              <span className="font-medium">Authentication Required</span>
              </div>
            <p className={`${isIPhone ? "text-2xs" : "text-xs"} mb-1`}>
              You must be logged in to create custom exercises. Custom exercises are only saved on the server.
            </p>
            <button 
              onClick={redirectToLogin}
              className="w-full bg-blue-500 text-white py-1 px-2 rounded-md text-xs flex items-center justify-center min-h-[36px] hover:bg-blue-600 transition-colors"
            >
              <FaSignInAlt className="mr-1" /> Log in to create custom exercises
            </button>
          </div>
        )}
        
        <div className="space-y-3">
          <div>
            <label htmlFor="custom-exercise-name" className={`block ${isIPhone ? "text-xs" : "text-sm"} font-medium mb-1 text-gray-700 dark:text-gray-300`}>
              Exercise Name
            </label>
                  <input
              id="custom-exercise-name"
                    type="text"
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              className={`w-full ${isIPhone ? "p-2 text-sm" : "p-3 text-base"} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              placeholder="Enter exercise name"
              style={{ fontSize: '16px' }} 
              autoFocus={!isMobile}
              disabled={!isAuthenticated}
            />
          </div>
          
          <div>
            <label htmlFor="custom-exercise-category" className={`block ${isIPhone ? "text-xs" : "text-sm"} font-medium mb-1 text-gray-700 dark:text-gray-300`}>
              Category
            </label>
            <select
              id="custom-exercise-category"
              value={newExerciseCategory}
              onChange={(e) => setNewExerciseCategory(e.target.value)}
              className={`w-full ${isIPhone ? "p-2 text-sm" : "p-3 text-base"} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              style={{ fontSize: '16px' }}
              disabled={!isAuthenticated}
            >
              <option value="Strength">Strength</option>
              <option value="Cardio">Cardio</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="custom-exercise-muscle-group" className={`block ${isIPhone ? "text-xs" : "text-sm"} font-medium mb-1 text-gray-700 dark:text-gray-300`}>
              Target Muscle Group
            </label>
            <select
              id="custom-exercise-muscle-group"
              value={selectedCategory && ["Abs", "Back", "Biceps", "Cardio", "Chest", "Legs", "Shoulders", "Triceps"].includes(selectedCategory) ? selectedCategory : "Custom"}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`w-full ${isIPhone ? "p-2 text-sm" : "p-3 text-base"} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              style={{ fontSize: '16px' }}
              disabled={newExerciseCategory === "Cardio" || !isAuthenticated}
            >
              <option value="Abs">Abs</option>
              <option value="Back">Back</option>
              <option value="Biceps">Biceps</option>
              <option value="Chest">Chest</option>
              <option value="Legs">Legs</option>
              <option value="Shoulders">Shoulders</option>
              <option value="Triceps">Triceps</option>
              <option value="Custom">Other/Misc</option>
              {newExerciseCategory === "Cardio" && <option value="Cardio">Cardio</option>}
            </select>
            {newExerciseCategory === "Cardio" && (
              <p className={`${isIPhone ? "text-2xs" : "text-xs"} text-gray-500 dark:text-gray-400 mt-1`}>Cardio exercises will be added to the Cardio category.</p>
            )}
          </div>
        </div>
        
        {createError && (
          <div className="mt-3 p-2 bg-red-100 text-red-800 rounded-lg text-xs font-medium">
            {createError}
          </div>
        )}
        
        <div className="flex justify-end space-x-2 mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              setIsAddingCustom(false);
              setNewExerciseName("");
              setCreateError("");
            }}
            className={`px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-white min-h-[36px] min-w-[70px] ${isIPhone ? "text-xs" : "text-sm"} hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors`}
          >
            Cancel
          </button>
                  <button
                    onClick={handleAddCustomExercise}
            disabled={isCreating || !newExerciseName.trim() || !isAuthenticated}
            className={`px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium min-h-[36px] min-w-[90px] ${isCreating || !newExerciseName.trim() || !isAuthenticated ? "opacity-70" : "hover:bg-blue-700"} transition-colors`}
                  >
            {isCreating ? "Creating..." : "Create"}
                  </button>
                </div>
              </div>
            </div>
  );

  const renderEditCustomForm = () => (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4">
      <div className={`bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg w-full ${isIPhone ? "max-w-[350px]" : "max-w-md"} p-5 max-h-[90vh] overflow-y-auto shadow-xl`}>
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-lg font-bold flex items-center">
            <FaEdit className="mr-2 text-blue-500" /> Edit Custom Exercise
          </h3>
          <button
            onClick={() => {
              setIsEditingCustom(false);
              setEditExerciseId(null);
              setEditExerciseName("");
              setEditExerciseCategory("");
              setEditError("");
            }}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="space-y-3">
          <div>
            <label htmlFor="edit-exercise-name" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Exercise Name
                </label>
                <input
              id="edit-exercise-name"
              type="text"
              value={editExerciseName}
              onChange={(e) => setEditExerciseName(e.target.value)}
              className="w-full p-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter exercise name"
              style={{ fontSize: '16px' }}
              autoFocus={!isMobile}
                />
              </div>

          <div>
            <label htmlFor="edit-exercise-category" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Category
            </label>
            <select
              id="edit-exercise-category"
              value={editExerciseCategory}
              onChange={(e) => setEditExerciseCategory(e.target.value)}
              className="w-full p-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              style={{ fontSize: '16px' }}
            >
              <option value="Strength">Strength</option>
              <option value="Cardio">Cardio</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="edit-exercise-muscle-group" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Target Muscle Group
            </label>
            <select
              id="edit-exercise-muscle-group"
              value={selectedCategory && ["Abs", "Back", "Biceps", "Cardio", "Chest", "Legs", "Shoulders", "Triceps"].includes(selectedCategory) ? selectedCategory : "Custom"}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              style={{ fontSize: '16px' }}
              disabled={editExerciseCategory === "Cardio"}
            >
              <option value="Abs">Abs</option>
              <option value="Back">Back</option>
              <option value="Biceps">Biceps</option>
              <option value="Chest">Chest</option>
              <option value="Legs">Legs</option>
              <option value="Shoulders">Shoulders</option>
              <option value="Triceps">Triceps</option>
              <option value="Custom">Other/Misc</option>
              {editExerciseCategory === "Cardio" && <option value="Cardio">Cardio</option>}
            </select>
            {editExerciseCategory === "Cardio" && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cardio exercises will be added to the Cardio category.</p>
            )}
          </div>
        </div>
        
        {editError && (
          <div className="mt-3 p-3 bg-red-100 text-red-800 rounded-lg text-sm font-medium">
            {editError}
          </div>
        )}
        
        <div className="flex justify-end space-x-3 mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
            onClick={() => {
              setIsEditingCustom(false);
              setEditExerciseId(null);
              setEditExerciseName("");
              setEditExerciseCategory("");
              setEditError("");
            }}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-white min-h-[44px] min-w-[80px] hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateExercise}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium min-h-[44px] min-w-[120px] hover:bg-blue-700 transition-colors"
          >
            Update Exercise
              </button>
            </div>
        </div>
      </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-3">
      <div className={`bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg w-full 
        ${isIPhone ? "max-w-[310px]" : isMobile ? "max-w-[330px]" : "max-w-md"} 
        max-h-[85vh] flex flex-col shadow-xl
        ${isIPhone ? "scale-[0.95]" : ""}`}>
        <div className="p-2 border-b bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className={`${isIPhone ? "text-sm" : isMobile ? "text-base" : "text-lg"} font-bold text-white flex items-center`}>
              <FaDumbbell className="mr-2" /> Add Exercise
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <FaTimes size={isIPhone ? 14 : isMobile ? 16 : 20} />
            </button>
          </div>
        </div>
        
        <div className={`flex-1 overflow-y-auto ${isIPhone ? "p-2" : isMobile ? "p-3" : "p-4"}`}>
          {activeTab === "categories" && renderCategoriesTab()}
          {activeTab === "exercises" && renderExercisesTab()}
          {activeTab === "search" && renderSearchTab()}
          {activeTab === "sets" && renderSetsTab()}
        </div>
        
        {activeTab === "categories" && (
          <div className={`${isIPhone ? "p-2" : isMobile ? "p-3" : "p-4"} border-t bg-gray-50 dark:bg-gray-800 rounded-b-lg`}>
            <button
              onClick={onClose}
              className={`w-full ${isIPhone ? "py-1.5 text-xs" : "py-2"} bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 border-none rounded-md text-gray-700 dark:text-white min-h-[36px] transition-colors`}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      
      {isAddingCustom && renderAddCustomForm()}
      {isEditingCustom && renderEditCustomForm()}
    </div>
  );
}

export default AddExercise;
