import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axiosConfig";
import { 
  FaAppleAlt, 
  FaPlus, 
  FaSearch, 
  FaChartPie, 
  FaListAlt, 
  FaCalendarAlt, 
  FaHistory,
  FaInfoCircle,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaRobot,
  FaUtensils,
  FaDumbbell,
  FaRunning
} from "react-icons/fa";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

function Nutrition() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [nutritionGoals, setNutritionGoals] = useState({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65
  });
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [showFoodSearchModal, setShowFoodSearchModal] = useState(false);
  const [showAddCustomFoodModal, setShowAddCustomFoodModal] = useState(false);
  const [newMeal, setNewMeal] = useState({
    name: "",
    time: new Date().toTimeString().slice(0, 5),
    foods: []
  });
  const [newCustomFood, setNewCustomFood] = useState({
    name: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    serving_size: "1 serving"
  });
  const [nutritionStats, setNutritionStats] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const [nutritionHistory, setNutritionHistory] = useState([]);
  const [dateRange, setDateRange] = useState("week");
  const [apiStatus, setApiStatus] = useState(null);
  const [generatedMealPlan, setGeneratedMealPlan] = useState(null);
  const [generatingMealPlan, setGeneratingMealPlan] = useState(false);
  const [mealPlanPreferences, setMealPlanPreferences] = useState({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65,
    meals: 3,
    restrictions: "",
    preferences: "",
    adjust_for_workouts: false
  });
  
  // Chat-related state
  const [chatMessages, setChatMessages] = useState([
    { 
      type: "system", 
      content: "Hello! I'm your AI Nutrition Guide. Ask me anything about nutrition, diet planning, or how to optimize your meals for your workouts." 
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchMeals();
    fetchNutritionGoals();
    fetchNutritionHistory();
  }, [navigate, selectedDate]);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      console.log("Using token:", token ? "Token exists" : "No token found");
      console.log("Fetching meals for date:", selectedDate);
      
      const response = await axios.get(
        `/nutrition/meals?date=${selectedDate}`
      );
      console.log("Meals API response:", response.data);
      
      // Check if the response is an array
      if (Array.isArray(response.data)) {
        console.log(`Retrieved ${response.data.length} meals`);
      setMeals(response.data);
      calculateNutritionStats(response.data);
      } else {
        console.error("Unexpected response format from meals API:", response.data);
        setMeals([]);
        calculateNutritionStats([]);
        setError("Received invalid data format from server.");
      }
    } catch (err) {
      console.error("Error fetching meals:", err);
      console.error("Error details:", err.response ? {
        status: err.response.status,
        statusText: err.response.statusText,
        data: err.response.data
      } : "No response");
      setMeals([]);
      calculateNutritionStats([]);
      setError("Failed to load meals. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchNutritionGoals = async () => {
    try {
      const response = await axios.get(
        `/nutrition/goals`
      );
      if (response.data) {
        setNutritionGoals(response.data);
      }
    } catch (err) {
      console.error("Error fetching nutrition goals:", err);
    }
  };

  const fetchNutritionHistory = async () => {
    try {
      let endpoint = `/nutrition/history?range=${dateRange}`;
      const response = await axios.get(endpoint);
      setNutritionHistory(response.data);
    } catch (err) {
      console.error("Error fetching nutrition history:", err);
    }
  };

  const calculateNutritionStats = (mealData) => {
    const stats = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };

    mealData.forEach(meal => {
      meal.foods.forEach(food => {
        stats.calories += food.calories * (food.quantity || 1) || 0;
        stats.protein += food.protein * (food.quantity || 1) || 0;
        stats.carbs += food.carbs * (food.quantity || 1) || 0;
        stats.fat += food.fat * (food.quantity || 1) || 0;
      });
    });

    setNutritionStats(stats);
  };

  const handleSearchFood = async (searchTerm = "") => {
    try {
      console.log(`Searching for: ${searchTerm || 'all foods'}`);
      const response = await axios.get(
        `/nutrition/search${searchTerm ? `?query=${encodeURIComponent(searchTerm)}` : ''}`
      );
      console.log("Search results:", response.data);
      setSearchResults(response.data);
    } catch (err) {
      console.error("Error searching foods:", err);
      // Show error to user
      alert(`Error searching for foods: ${err.response?.data?.detail || err.message}`);
    }
  };

  // Load all available foods when opening the Add Meal modal
  const handleOpenAddMealModal = async () => {
    setShowAddMealModal(true);
    // Reset the new meal form
    setNewMeal({
      name: "",
      time: new Date().toTimeString().slice(0, 5),
      foods: []
    });
    
    try {
      // Load all available foods automatically
      console.log("Loading all available foods");
      const response = await axios.get(`/nutrition/search`);
      console.log("All foods loaded:", response.data);
      setSearchResults(response.data);
    } catch (err) {
      console.error("Error loading available foods:", err);
    }
  };

  // Update the search when typing in the search box
  const handleSearchInputChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    try {
      // Filter foods based on search query
      const response = await axios.get(
        `/nutrition/search${query ? `?query=${encodeURIComponent(query)}` : ''}`
      );
      console.log(`Search results for "${query}":`, response.data);
      setSearchResults(response.data);
    } catch (err) {
      console.error("Error searching foods:", err);
    }
  };

  const handleAddFood = (food) => {
    const updatedFoods = [...newMeal.foods, {
      ...food,
      quantity: 1,
      serving_size: food.serving_size || "1 serving"
    }];
    setNewMeal({...newMeal, foods: updatedFoods});
    setShowFoodSearchModal(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemoveFood = (index) => {
    const updatedFoods = newMeal.foods.filter((_, i) => i !== index);
    setNewMeal({...newMeal, foods: updatedFoods});
  };

  const handleUpdateFoodQuantity = (index, quantity) => {
    const updatedFoods = [...newMeal.foods];
    updatedFoods[index].quantity = quantity;
    setNewMeal({...newMeal, foods: updatedFoods});
  };

  const handleSaveMeal = async () => {
    if (!newMeal.name.trim() || newMeal.foods.length === 0) {
      alert("Please add a meal name and at least one food item");
      return;
    }

    try {
      console.log("Attempting to save meal:", {
        ...newMeal,
        date: selectedDate
      });
      
      const token = localStorage.getItem("token");
      console.log("Using auth token:", token ? "Token exists" : "No token");
      
      const response = await axios.post(
        `/nutrition/meals`,
        {
          ...newMeal,
          date: selectedDate
        }
      );
      
      console.log("Save meal response:", response.data);
      alert("Meal saved successfully!");
      
      setShowAddMealModal(false);
      setNewMeal({
        name: "",
        time: new Date().toTimeString().slice(0, 5),
        foods: []
      });
      fetchMeals();
    } catch (err) {
      console.error("Error saving meal:", err);
      console.error("Error details:", err.response ? {
        status: err.response.status,
        statusText: err.response.statusText,
        data: err.response.data
      } : "No response data");
      
      alert(`Failed to save meal: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleDeleteMeal = async (mealId) => {
    if (!confirm("Are you sure you want to delete this meal?")) return;

    try {
      await axios.delete(
        `/nutrition/meals/${mealId}`
      );
      fetchMeals();
    } catch (err) {
      console.error("Error deleting meal:", err);
      alert("Failed to delete meal. Please try again.");
    }
  };

  const handleSaveNutritionGoals = async () => {
    try {
      await axios.post(
        `/nutrition/goals`,
        nutritionGoals
      );
      alert("Nutrition goals saved successfully!");
    } catch (err) {
      console.error("Error saving nutrition goals:", err);
      alert("Failed to save nutrition goals. Please try again.");
    }
  };

  const checkApiConnection = async () => {
    try {
      setApiStatus("checking");
      // Try to get nutrition goals as a simple API test
      const response = await axios.get(`/nutrition/goals`);
      console.log("API test response:", response.data);
      setApiStatus("connected");
      setTimeout(() => setApiStatus(null), 3000);
    } catch (err) {
      console.error("API connection test failed:", err);
      setApiStatus("failed");
      setTimeout(() => setApiStatus(null), 3000);
    }
  };

  // Handle creating a custom food
  const handleCreateCustomFood = async () => {
    // Validate inputs
    if (!newCustomFood.name.trim()) {
      alert("Please enter a name for the food");
      return;
    }
    
    if (newCustomFood.calories <= 0) {
      alert("Calories must be greater than 0");
      return;
    }
    
    try {
      console.log("Creating custom food:", newCustomFood);
      const response = await axios.post('/nutrition/foods', newCustomFood);
      console.log("Custom food created:", response.data);
      
      // Add the new food to search results and select it
      const createdFood = {
        ...response.data,
        source: "custom"
      };
      
      // Add new food to search results at the top
      setSearchResults(prev => [createdFood, ...prev]);
      
      // Optionally add it directly to the meal
      handleAddFood(createdFood);
      
      // Reset form and close modal
      setNewCustomFood({
        name: "",
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        serving_size: "1 serving"
      });
      setShowAddCustomFoodModal(false);
      
      // Show success message
      alert("Custom food created successfully!");
    } catch (err) {
      console.error("Error creating custom food:", err);
      alert(`Failed to create custom food: ${err.response?.data?.detail || err.message}`);
    }
  };

  // Generate meal plan function
  const handleGenerateMealPlan = async () => {
    try {
      setGeneratingMealPlan(true);
      setGeneratedMealPlan(null);
      
      console.log("Generating meal plan with preferences:", mealPlanPreferences);
      
      // Call the backend API to generate a meal plan
      const response = await axios.post('/nutrition/generate-meal-plan', mealPlanPreferences);
      
      // Set the generated meal plan
      setGeneratedMealPlan(response.data);
      console.log("Generated meal plan:", response.data);
      
    } catch (err) {
      console.error("Error generating meal plan:", err);
      alert("Failed to generate meal plan: " + (err.response?.data?.detail || err.message));
    } finally {
      setGeneratingMealPlan(false);
    }
  };

  // Save meal plan to user's meals
  const handleSaveMealPlanToDay = async (date, mealPlan) => {
    try {
      if (!mealPlan || !mealPlan.meals || mealPlan.meals.length === 0) {
        alert("No meal plan to save!");
        return;
      }
      
      // Set the selected date to the one we're saving to
      setSelectedDate(date);
      
      // First, delete all existing meals for this date
      try {
        console.log(`Deleting existing meals for date ${date}`);
        
        // Use the new bulk delete endpoint instead of individual deletions
        const deleteResponse = await axios.delete(`/nutrition/meals/by-date/${date}`);
        console.log(`Delete response:`, deleteResponse.data);
        
        if (deleteResponse.data.deleted_count > 0) {
          console.log(`Successfully deleted ${deleteResponse.data.deleted_count} existing meals`);
        } else {
          console.log('No existing meals found for this date');
        }
        
        // Verify all meals were deleted
        const verifyDeletion = await axios.get(`/nutrition/meals?date=${date}`);
        if (verifyDeletion.data.length > 0) {
          console.warn(`Warning: ${verifyDeletion.data.length} meals still exist after deletion attempt`);
        } else {
          console.log('All existing meals successfully deleted');
        }
      } catch (err) {
        console.error("Error clearing existing meals:", err);
        alert("Failed to clear existing meals. The new meal plan may be added to existing meals.");
      }
      
      // Create a map to categorize meals by their primary type
      const mealCategories = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: [],
        other: []
      };
      
      // Categorize each meal
      mealPlan.meals.forEach(meal => {
        // Log each meal to see what's happening
        console.log(`Processing meal: ${meal.name}`, meal);
        
        const nameLower = meal.name.toLowerCase();
        
        // More explicit matching to catch variations
        if (nameLower.includes("breakfast")) {
          console.log(`Categorizing ${meal.name} as breakfast`);
          mealCategories.breakfast.push(meal);
        } else if (nameLower.includes("lunch")) {
          console.log(`Categorizing ${meal.name} as lunch`);
          mealCategories.lunch.push(meal);
        } else if (nameLower.includes("dinner")) {
          console.log(`Categorizing ${meal.name} as dinner`);
          mealCategories.dinner.push(meal);
        } else if (nameLower.includes("snack")) {
          console.log(`Categorizing ${meal.name} as snack`);
          mealCategories.snack.push(meal);
        } else {
          console.log(`Categorizing ${meal.name} as other`);
          mealCategories.other.push(meal);
        }
      });
      
      // After categorizing, log the counts
      console.log("MEAL CATEGORY COUNTS:", {
        breakfast: mealCategories.breakfast.length,
        lunch: mealCategories.lunch.length, 
        dinner: mealCategories.dinner.length,
        snack: mealCategories.snack.length,
        other: mealCategories.other.length
      });
      
      // For each category, combine all foods into a single meal
      const consolidatedMeals = [];
      
      // Process breakfast
      if (mealCategories.breakfast.length > 0) {
        const allBreakfastFoods = [];
        let breakfastTime = "08:00";
        
        mealCategories.breakfast.forEach(meal => {
          if (meal.foods) allBreakfastFoods.push(...meal.foods);
          if (meal.time) breakfastTime = meal.time;
        });
        
        // Create consolidated breakfast
        consolidatedMeals.push({
          name: "Breakfast",
          time: breakfastTime,
          foods: allBreakfastFoods
        });
      }
      
      // Process lunch
      if (mealCategories.lunch.length > 0) {
        const allLunchFoods = [];
        let lunchTime = "12:00";
        
        mealCategories.lunch.forEach(meal => {
          if (meal.foods) allLunchFoods.push(...meal.foods);
          if (meal.time) lunchTime = meal.time;
        });
        
        // Create consolidated lunch
        consolidatedMeals.push({
          name: "Lunch",
          time: lunchTime,
          foods: allLunchFoods
        });
      }
      
      // Process dinner
      if (mealCategories.dinner.length > 0) {
        const allDinnerFoods = [];
        let dinnerTime = "18:00";
        
        mealCategories.dinner.forEach(meal => {
          if (meal.foods) allDinnerFoods.push(...meal.foods);
          if (meal.time) dinnerTime = meal.time;
        });
        
        // Create consolidated dinner
        consolidatedMeals.push({
          name: "Dinner",
          time: dinnerTime,
          foods: allDinnerFoods
        });
      }
      
      // Process snacks - keep them separate by time if possible
      mealCategories.snack.forEach((snack, index) => {
        const snackTypes = ["Morning Snack", "Afternoon Snack", "Evening Snack"];
        const snackTimes = ["10:00", "15:00", "20:00"];
        
        let snackName = snack.name;
        // If the snack doesn't have a specific type, assign one based on order
        if (snackName.toLowerCase() === "snack") {
          snackName = snackTypes[Math.min(index, snackTypes.length - 1)];
        }
        
        consolidatedMeals.push({
          name: snackName,
          time: snack.time || snackTimes[Math.min(index, snackTimes.length - 1)],
          foods: snack.foods || []
        });
      });
      
      // Add any other meal types
      mealCategories.other.forEach(meal => {
        consolidatedMeals.push({
          name: meal.name,
          time: meal.time,
          foods: meal.foods || []
        });
      });
      
      // Sort consolidated meals by time
      consolidatedMeals.sort((a, b) => {
        const timeA = a.time.split(':').map(Number);
        const timeB = b.time.split(':').map(Number);
        return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
      });
      
      console.log("Consolidated meals:", consolidatedMeals);
      
      // After consolidation but before saving:
      console.log("FINAL CONSOLIDATED MEALS:", consolidatedMeals.map(m => ({
        name: m.name,
        time: m.time,
        foodCount: m.foods?.length || 0
      })));
      
      // Track which meal types we've already saved to prevent duplicates
      const savedMealTypes = new Set();
      
      // For each unique meal in the plan, save it to the user's meals
      for (const meal of consolidatedMeals) {
        // Skip meals with no foods
        if (!meal.foods || meal.foods.length === 0) {
          console.log(`Skipping empty meal: ${meal.name}`);
          continue;
        }
        
        // Skip duplicate meal types (e.g., multiple breakfasts)
        const mealTypeLower = meal.name.toLowerCase();
        if (savedMealTypes.has(mealTypeLower)) {
          console.log(`Skipping duplicate meal type: ${meal.name}`);
          continue;
        }
        
        // Mark this meal type as saved
        savedMealTypes.add(mealTypeLower);
        
        const mealData = {
          name: meal.name,
          time: meal.time,
          date: date,
          foods: meal.foods
        };
        
        console.log(`Saving ${meal.name} to date ${date}:`, mealData);
        
        try {
          await axios.post(`/nutrition/meals`, mealData);
          console.log(`Successfully saved ${meal.name}`);
        } catch (saveErr) {
          console.error(`Error saving ${meal.name}:`, saveErr);
          // Continue with other meals
        }
      }
      
      // Final verification after saving
      try {
        const finalCheck = await axios.get(`/nutrition/meals?date=${date}`);
        console.log(`Final verification: ${finalCheck.data.length} meals saved for date ${date}`);
        
        if (finalCheck.data.length !== savedMealTypes.size) {
          console.warn(`Warning: Expected ${savedMealTypes.size} meals but found ${finalCheck.data.length}`);
        }
      } catch (err) {
        console.error("Error during final verification:", err);
      }
      
      alert("Meal plan saved successfully!");
      
      // Refresh meals after saving
      fetchMeals();
      
      // Switch to meal log tab to see the saved meals
      setActiveTab("meal-log");
    } catch (err) {
      console.error("Error saving meal plan:", err);
      alert(`Failed to save meal plan: ${err.response?.data?.detail || err.message}`);
    }
  };

  // Add the formatting function
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Meal Log tab
  const renderMealLog = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <FaCalendarAlt className="mr-2 text-blue-500" /> Meal Log
            </h3>
            <div className="flex items-center">
              <div className="relative mr-2">
                <input
                  type="text"
                  value={selectedDate ? formatDateForDisplay(selectedDate) : ""}
                  readOnly
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 cursor-pointer pr-10"
                  onClick={() => document.getElementById('meal-date-picker').showPicker()}
                />
                <input
                  id="meal-date-picker"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="absolute opacity-0 w-0 h-0"
                />
                <button 
                  onClick={() => document.getElementById('meal-date-picker').showPicker()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  <FaCalendarAlt />
                </button>
              </div>
              <button
                onClick={() => handleOpenAddMealModal()}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
              >
                <FaPlus className="mr-1" /> Add Meal
              </button>
            </div>
          </div>
          
          {/* Render meals similar to dashboard but with date selection */}
          {meals.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FaAppleAlt className="mx-auto text-4xl mb-2 opacity-30" />
              <p>No meals logged for {formatDateForDisplay(selectedDate)}</p>
              <button
                onClick={() => handleOpenAddMealModal()}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Log a meal
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {meals.map((meal, index) => (
                <div key={`meal-${meal.id}-${index}`} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  {/* Same meal rendering as in dashboard */}
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{meal.name}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{meal.time}</span>
                      <button
                        onClick={() => handleDeleteMeal(meal.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Food</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Serving</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Calories</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Protein</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Carbs</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {meal.foods.map((food, foodIndex) => (
                          <tr key={`food-${food.id || foodIndex}-${foodIndex}`}>
                            <td className="px-3 py-2 whitespace-nowrap text-sm">{food.name}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm">{food.quantity || 1} {food.serving_size}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm">{food.calories * (food.quantity || 1)} kcal</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm">{food.protein * (food.quantity || 1)}g</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm">{food.carbs * (food.quantity || 1)}g</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm">{food.fat * (food.quantity || 1)}g</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDashboard = () => {
    const caloriesPercentage = (nutritionStats.calories / nutritionGoals.calories) * 100;
    const proteinPercentage = (nutritionStats.protein / nutritionGoals.protein) * 100;
    const carbsPercentage = (nutritionStats.carbs / nutritionGoals.carbs) * 100;
    const fatPercentage = (nutritionStats.fat / nutritionGoals.fat) * 100;

    const macroData = [
      { name: "Protein", value: nutritionStats.protein, goal: nutritionGoals.protein, color: "#4F46E5" },
      { name: "Carbs", value: nutritionStats.carbs, goal: nutritionGoals.carbs, color: "#10B981" },
      { name: "Fat", value: nutritionStats.fat, goal: nutritionGoals.fat, color: "#F59E0B" }
    ];

    const COLORS = ["#4F46E5", "#10B981", "#F59E0B"];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calories Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FaAppleAlt className="mr-2 text-red-500" /> Calories
            </h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl font-bold">{nutritionStats.calories}</span>
              <span className="text-gray-500 dark:text-gray-400">/ {nutritionGoals.calories} kcal</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
              <div 
                className={`h-2.5 rounded-full ${caloriesPercentage > 100 ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(caloriesPercentage, 100)}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {caloriesPercentage > 100 ? (
                <span className="text-red-500 flex items-center">
                  <FaArrowUp className="mr-1" /> {Math.round(caloriesPercentage - 100)}% over your goal
                </span>
              ) : caloriesPercentage === 100 ? (
                <span className="text-green-500 flex items-center">
                  <FaEquals className="mr-1" /> Exactly at your goal
                </span>
              ) : (
                <span className="text-blue-500 flex items-center">
                  <FaArrowDown className="mr-1" /> {Math.round(100 - caloriesPercentage)}% under your goal
                </span>
              )}
            </div>
          </div>

          {/* Macros Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FaChartPie className="mr-2 text-blue-500" /> Macronutrients
            </h3>
            <div className="flex items-center">
              <div className="w-1/2">
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={macroData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}g`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-2">
                {macroData.map((macro, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: macro.color }}
                      ></div>
                      <span className="text-sm">{macro.name}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {macro.value}g / {macro.goal}g
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Today's Meals */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <FaListAlt className="mr-2 text-green-500" /> Today's Meals
            </h3>
            <button
              onClick={() => handleOpenAddMealModal()}
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
            >
              <FaPlus className="mr-1" /> Add Meal
            </button>
          </div>
          
          {meals.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FaAppleAlt className="mx-auto text-4xl mb-2 opacity-30" />
              <p>No meals logged for today</p>
              <button
                onClick={() => handleOpenAddMealModal()}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Log your first meal
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {meals.map((meal, index) => (
                <div key={`meal-${meal.id}-${index}`} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{meal.name}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{meal.time}</span>
                      <button
                        onClick={() => handleDeleteMeal(meal.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Food</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Serving</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Calories</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Protein</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Carbs</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {meal.foods.map((food, foodIndex) => (
                          <tr key={`food-${food.id || foodIndex}-${foodIndex}`}>
                            <td className="px-3 py-2 whitespace-nowrap text-sm">{food.name}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm">{food.quantity || 1} {food.serving_size}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm">{food.calories * (food.quantity || 1)} kcal</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm">{food.protein * (food.quantity || 1)}g</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm">{food.carbs * (food.quantity || 1)}g</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm">{food.fat * (food.quantity || 1)}g</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAnalysis = () => {
    // Prepare data for bar chart
    const dailyData = [
      { name: "Calories", consumed: nutritionStats.calories, target: nutritionGoals.calories },
      { name: "Protein", consumed: nutritionStats.protein, target: nutritionGoals.protein },
      { name: "Carbs", consumed: nutritionStats.carbs, target: nutritionGoals.carbs },
      { name: "Fat", consumed: nutritionStats.fat, target: nutritionGoals.fat }
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Nutrition Analysis</h3>
          
          <div className="mb-8">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={dailyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="consumed" name="Consumed" fill="#4F46E5" />
                <Bar dataKey="target" name="Target" fill="#D1D5DB" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Calorie Distribution</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Protein</div>
                  <div className="font-medium">{Math.round(nutritionStats.protein * 4 / nutritionStats.calories * 100) || 0}%</div>
                  <div className="text-xs text-gray-500">{nutritionStats.protein * 4} kcal</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Carbs</div>
                  <div className="font-medium">{Math.round(nutritionStats.carbs * 4 / nutritionStats.calories * 100) || 0}%</div>
                  <div className="text-xs text-gray-500">{nutritionStats.carbs * 4} kcal</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Fat</div>
                  <div className="font-medium">{Math.round(nutritionStats.fat * 9 / nutritionStats.calories * 100) || 0}%</div>
                  <div className="text-xs text-gray-500">{nutritionStats.fat * 9} kcal</div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Macronutrient Ratios</h4>
              <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                <div className="grid grid-cols-3 gap-4 mb-2">
                  <div className="text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Protein</div>
                    <div className="font-medium">{(nutritionStats.protein / (nutritionStats.protein + nutritionStats.carbs + nutritionStats.fat) * 100).toFixed(1) || 0}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Carbs</div>
                    <div className="font-medium">{(nutritionStats.carbs / (nutritionStats.protein + nutritionStats.carbs + nutritionStats.fat) * 100).toFixed(1) || 0}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Fat</div>
                    <div className="font-medium">{(nutritionStats.fat / (nutritionStats.protein + nutritionStats.carbs + nutritionStats.fat) * 100).toFixed(1) || 0}%</div>
                  </div>
                </div>
                <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-indigo-500" 
                    style={{ width: `${(nutritionStats.protein / (nutritionStats.protein + nutritionStats.carbs + nutritionStats.fat) * 100) || 0}%` }}
                  ></div>
                  <div 
                    className="h-full bg-green-500" 
                    style={{ width: `${(nutritionStats.carbs / (nutritionStats.protein + nutritionStats.carbs + nutritionStats.fat) * 100) || 0}%` }}
                  ></div>
                  <div 
                    className="h-full bg-yellow-500" 
                    style={{ width: `${(nutritionStats.fat / (nutritionStats.protein + nutritionStats.carbs + nutritionStats.fat) * 100) || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Nutrition Goals</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Daily Calories (kcal)
              </label>
              <input
                type="number"
                value={nutritionGoals.calories}
                onChange={(e) => setNutritionGoals({...nutritionGoals, calories: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Daily Protein (g)
              </label>
              <input
                type="number"
                value={nutritionGoals.protein}
                onChange={(e) => setNutritionGoals({...nutritionGoals, protein: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Daily Carbohydrates (g)
              </label>
              <input
                type="number"
                value={nutritionGoals.carbs}
                onChange={(e) => setNutritionGoals({...nutritionGoals, carbs: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Daily Fat (g)
              </label>
              <input
                type="number"
                value={nutritionGoals.fat}
                onChange={(e) => setNutritionGoals({...nutritionGoals, fat: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              />
            </div>
            
            <button
              onClick={handleSaveNutritionGoals}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Save Goals
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Food Search Modal
  const renderFoodSearchModal = () => {
    if (!showFoodSearchModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl mx-auto">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium">Search Results</h3>
            <button 
              onClick={() => setShowFoodSearchModal(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div className="p-4 max-h-96 overflow-y-auto">
            {searchResults.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No results found</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Try a different search term or be more specific</p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((food, index) => (
                  <div 
                    key={index} 
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleAddFood(food)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-medium flex items-center">
                        {food.name}
                        {food.source === "custom" && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 px-2 py-0.5 rounded-full">
                            Custom
                          </span>
                        )}
                        {food.source === "database" && food.food_group === "User Custom" && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 px-2 py-0.5 rounded-full">
                            Custom
                          </span>
                        )}
                        {food.source === "database" && food.food_group !== "User Custom" && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 px-2 py-0.5 rounded-full">
                            Database
                          </span>
                        )}
                      </div>
                    <div className="grid grid-cols-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{food.calories}</span> kcal
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{food.protein}g</span> protein
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{food.carbs}g</span> carbs
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{food.fat}g</span> fat
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {food.serving_size || "1 serving"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Type to filter foods or click a food below to add it to your meal
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Add Meal Modal
  const renderAddMealModal = () => {
    if (!showAddMealModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl mx-auto">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium">Add New Meal</h3>
            <button 
              onClick={() => setShowAddMealModal(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div className="p-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Meal Name
                  </label>
                  <input
                    type="text"
                    value={newMeal.name}
                    onChange={(e) => setNewMeal({...newMeal, name: e.target.value})}
                    placeholder="Breakfast, Lunch, Dinner, etc."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={newMeal.time}
                    onChange={(e) => setNewMeal({...newMeal, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search Foods
                </label>
                <div className="flex flex-col">
                <div className="flex">
                  <input
                    type="text"
                    value={searchQuery}
                      onChange={handleSearchInputChange}
                    placeholder="Search for foods..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md bg-white dark:bg-gray-700"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchFood(searchQuery)}
                  />
                  <button
                      onClick={() => handleSearchFood(searchQuery)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 transition-colors flex items-center"
                  >
                    <FaSearch />
                  </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Type to filter foods or click a food below to add it to your meal
                  </p>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Added Foods
                  </label>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {newMeal.foods.length} {newMeal.foods.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                
                {newMeal.foods.length === 0 ? (
                  <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-md p-6 text-center">
                    <p className="text-gray-500 dark:text-gray-400 mb-2">No foods added yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Search for foods using the search box above or select from available foods below
                    </p>
                  </div>
                ) : (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-md divide-y divide-gray-200 dark:divide-gray-700">
                    {newMeal.foods.map((food, index) => (
                      <div key={index} className="p-3 flex justify-between items-center">
                        <div>
                          <div className="font-medium">{food.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {food.calories * (food.quantity || 1)} kcal,&nbsp;
                            {food.protein * (food.quantity || 1)}g protein,&nbsp;
                            {food.carbs * (food.quantity || 1)}g carbs,&nbsp;
                            {food.fat * (food.quantity || 1)}g fat
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <input
                              type="number"
                              min="0.25"
                              step="0.25"
                              value={food.quantity || 1}
                              onChange={(e) => handleUpdateFoodQuantity(index, parseFloat(e.target.value) || 1)}
                              className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-center"
                            />
                            <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                              {food.serving_size}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveFood(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Available Foods Section */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Available Foods
                  </h4>
                  <button
                    onClick={() => setShowAddCustomFoodModal(true)}
                    className="text-xs px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center"
                  >
                    <FaPlus className="mr-1" /> Add Custom Food
                  </button>
                </div>
                
                <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No foods available. Try searching for foods.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {searchResults.map((food, index) => (
                        <div 
                          key={index} 
                          className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                          onClick={() => handleAddFood(food)}
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm flex items-center">
                              {food.name}
                              {food.source === "custom" && (
                                <span className="ml-2 text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 px-2 py-0.5 rounded-full">
                                  Custom
                                </span>
                              )}
                              {food.source === "database" && food.food_group === "User Custom" && (
                                <span className="ml-2 text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 px-2 py-0.5 rounded-full">
                                  Custom
                                </span>
                              )}
                              {food.source === "database" && food.food_group !== "User Custom" && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                  Database
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {food.calories} kcal, {food.protein}g protein, {food.carbs}g carbs, {food.fat}g fat
                            </div>
                          </div>
                          <button className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button
              onClick={() => setShowAddMealModal(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                console.log("Save Meal button clicked");
                console.log("Meal name:", newMeal.name);
                console.log("Foods count:", newMeal.foods.length);
                console.log("Button disabled:", !newMeal.name.trim() || newMeal.foods.length === 0);
                handleSaveMeal();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!newMeal.name.trim() || newMeal.foods.length === 0}
            >
              Save Meal
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add Custom Food Modal
  const renderAddCustomFoodModal = () => {
    if (!showAddCustomFoodModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-auto">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium">Add Custom Food</h3>
            <button 
              onClick={() => setShowAddCustomFoodModal(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Food Name
                </label>
                <input
                  type="text"
                  value={newCustomFood.name}
                  onChange={(e) => setNewCustomFood({...newCustomFood, name: e.target.value})}
                  placeholder="e.g., Homemade Granola"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Serving Size
                </label>
                <input
                  type="text"
                  value={newCustomFood.serving_size}
                  onChange={(e) => setNewCustomFood({...newCustomFood, serving_size: e.target.value})}
                  placeholder="e.g., 1 cup, 100g"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Calories
                  </label>
                  <input
                    type="number"
                    value={newCustomFood.calories}
                    onChange={(e) => setNewCustomFood({...newCustomFood, calories: parseFloat(e.target.value) || 0})}
                    min="0"
                    step="1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    value={newCustomFood.protein}
                    onChange={(e) => setNewCustomFood({...newCustomFood, protein: parseFloat(e.target.value) || 0})}
                    min="0"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    value={newCustomFood.carbs}
                    onChange={(e) => setNewCustomFood({...newCustomFood, carbs: parseFloat(e.target.value) || 0})}
                    min="0"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    value={newCustomFood.fat}
                    onChange={(e) => setNewCustomFood({...newCustomFood, fat: parseFloat(e.target.value) || 0})}
                    min="0"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  />
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-medium mb-1">Nutrition Summary</p>
                  <p>Total calories: {newCustomFood.calories} kcal</p>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div>Protein: {newCustomFood.protein}g</div>
                    <div>Carbs: {newCustomFood.carbs}g</div>
                    <div>Fat: {newCustomFood.fat}g</div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                <button 
              onClick={() => setShowAddCustomFoodModal(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
              Cancel
                </button>
              <button
              onClick={handleCreateCustomFood}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              disabled={!newCustomFood.name.trim() || newCustomFood.calories <= 0}
              >
              Create Food
              </button>
            </div>
          </div>
      </div>
    );
  };

  // Render Meal Plan Generator tab
  const renderMealPlanGenerator = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FaRobot className="mr-2 text-purple-500" /> Meal Plan Generator
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Calories
                </label>
                <input
                  type="number"
                  value={mealPlanPreferences.calories}
                  onChange={(e) => setMealPlanPreferences({...mealPlanPreferences, calories: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    value={mealPlanPreferences.protein}
                    onChange={(e) => setMealPlanPreferences({...mealPlanPreferences, protein: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    value={mealPlanPreferences.carbs}
                    onChange={(e) => setMealPlanPreferences({...mealPlanPreferences, carbs: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    value={mealPlanPreferences.fat}
                    onChange={(e) => setMealPlanPreferences({...mealPlanPreferences, fat: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Number of Meals
                </label>
                <select
                  value={mealPlanPreferences.meals}
                  onChange={(e) => setMealPlanPreferences({...mealPlanPreferences, meals: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                >
                  <option value={3}>3 (Breakfast, Lunch, Dinner)</option>
                  <option value={4}>4 (Breakfast, Lunch, Snack, Dinner)</option>
                  <option value={5}>5 (Breakfast, Morning Snack, Lunch, Afternoon Snack, Dinner)</option>
                  <option value={6}>6 (Including Evening Snack)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dietary Restrictions
                </label>
                <select
                  value={mealPlanPreferences.restrictions}
                  onChange={(e) => setMealPlanPreferences({...mealPlanPreferences, restrictions: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                >
                  <option value="">None</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="gluten-free">Gluten-Free</option>
                  <option value="dairy-free">Dairy-Free</option>
                  <option value="vegetarian,gluten-free">Vegetarian & Gluten-Free</option>
                  <option value="vegetarian,dairy-free">Vegetarian & Dairy-Free</option>
                  <option value="vegan,gluten-free">Vegan & Gluten-Free</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Food Preferences
                </label>
                <textarea
                  value={mealPlanPreferences.preferences}
                  onChange={(e) => setMealPlanPreferences({...mealPlanPreferences, preferences: e.target.value})}
                  placeholder="e.g., high protein, low carb, Mediterranean"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 h-20"
                ></textarea>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="adjust-for-workouts"
                    checked={mealPlanPreferences.adjust_for_workouts}
                    onChange={(e) => setMealPlanPreferences({...mealPlanPreferences, adjust_for_workouts: e.target.checked})}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="adjust-for-workouts" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <FaDumbbell className="mr-1 text-blue-500" /> Adjust for recent workouts
                  </label>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  When enabled, meal plans will be adjusted based on your recent workout history to better support your recovery and fitness goals.
                </p>
              </div>
              
              <button
                onClick={handleGenerateMealPlan}
                disabled={generatingMealPlan}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-4"
              >
                {generatingMealPlan ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating Plan...
                  </>
                ) : (
                  <>
                    <FaRobot className="mr-2" /> Generate Meal Plan
                  </>
                )}
              </button>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                The AI will generate a meal plan based on your preferences and nutrition goals.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center">
                <FaInfoCircle className="mr-2 text-blue-500" /> How It Works
              </h4>
              <div className="space-y-3 text-sm">
                <p>
                  Our AI Meal Plan Generator creates personalized meal plans based on your:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Nutrition goals (calories, protein, etc.)</li>
                  <li>Dietary restrictions</li>
                  <li>Food preferences</li>
                  <li>Number of meals per day</li>
                  {mealPlanPreferences.adjust_for_workouts && (
                    <li className="text-blue-600 dark:text-blue-400 font-medium">Recent workout history</li>
                  )}
                </ul>
                <p>
                  You can customize your meal plan preferences and generate multiple options
                  until you find one you like.
                </p>
                {mealPlanPreferences.adjust_for_workouts && (
                  <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-900/40 rounded">
                    <p className="flex items-center">
                      <FaRunning className="mr-1 text-blue-600" /> 
                      <span className="font-medium">Workout Adjustments:</span>
                    </p>
                    <ul className="list-disc pl-5 text-xs mt-1">
                      <li>Increased calories and protein after strength training</li>
                      <li>Adjusted macros to support recovery</li>
                      <li>More carbs after cardio sessions</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Generated Meal Plan */}
          {generatedMealPlan && (
            <div className="mt-8 border border-green-200 dark:border-green-900 rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-green-800 dark:text-green-300 flex items-center">
                  <FaUtensils className="mr-2" /> Generated Meal Plan
                </h4>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <input
                      id="meal-plan-date-picker"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                    />
                  </div>
                  <button
                    onClick={() => handleSaveMealPlanToDay(selectedDate, generatedMealPlan)}
                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                  >
                    <FaPlus className="mr-1" /> Save to Selected Date
                  </button>
                </div>
              </div>
                  
              {/* Workout Adjustment Info */}
              {mealPlanPreferences.adjust_for_workouts && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h5 className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center mb-2">
                    <FaDumbbell className="mr-2" /> Workout-Adjusted Nutrition
                  </h5>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    This meal plan has been optimized based on your recent workout history to support your recovery and performance.
                  </p>
                  
                  {/* Show original vs. adjusted values */}
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Base calories:</span> {mealPlanPreferences.calories}
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Base protein:</span> {mealPlanPreferences.protein}g
                    </div>
                    <div>
                      <span className="font-medium text-blue-800 dark:text-blue-300">Adjusted calories:</span> {generatedMealPlan.totalNutrition.calories}
                    </div>
                    <div>
                      <span className="font-medium text-blue-800 dark:text-blue-300">Adjusted protein:</span> {generatedMealPlan.totalNutrition.protein}g
                    </div>
                  </div>
                </div>
              )}
              
              {/* Rest of the meal plan display */}
              <div className="space-y-4">
                {/* Nutrition Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                  <h5 className="font-medium mb-2">Nutrition Summary</h5>
                  <div className="grid grid-cols-4 gap-3 text-sm">
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Calories</div>
                      <div className="font-medium">{generatedMealPlan.totalNutrition.calories} kcal</div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Protein</div>
                      <div className="font-medium">{generatedMealPlan.totalNutrition.protein}g</div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Carbs</div>
                      <div className="font-medium">{generatedMealPlan.totalNutrition.carbs}g</div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Fat</div>
                      <div className="font-medium">{generatedMealPlan.totalNutrition.fat}g</div>
                    </div>
                  </div>
                </div>
                
                {/* Individual Meals - With uniqueness filter */}
                {(() => {
                  // Create a map to store unique meal types
                  const mealTypeMap = {};
                  
                  // Group meals by their name (Breakfast, Lunch, Dinner, Snack, etc.)
                  generatedMealPlan.meals.forEach(meal => {
                    const mealType = meal.name.split(' ')[0]; // Get base meal type (Breakfast, Lunch, Dinner)
                    if (!mealTypeMap[mealType]) {
                      mealTypeMap[mealType] = meal;
                    } else {
                      // If this meal type already exists, combine the foods
                      mealTypeMap[mealType].foods = [...mealTypeMap[mealType].foods, ...meal.foods];
                    }
                  });
                  
                  // Convert the map back to an array and sort by time
                  return Object.values(mealTypeMap)
                    .sort((a, b) => {
                      // Convert time strings to comparable values
                      const timeA = a.time.split(':').map(Number);
                      const timeB = b.time.split(':').map(Number);
                      return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
                    })
                    .map((meal, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium">{meal.name}</h5>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{meal.time}</span>
                        </div>
                        
                        <div className="space-y-2 mt-2">
                          {meal.foods.map((food, foodIndex) => (
                            <div key={`food-${food.id || foodIndex}-${foodIndex}`}>
                              <div className="flex justify-between items-center text-sm py-1 border-b last:border-b-0 border-gray-100 dark:border-gray-700">
                                <div className="font-medium">{food.name}</div>
                                <div className="text-gray-500 dark:text-gray-400">
                                  {food.calories} kcal | {food.protein}g P | {food.carbs}g C | {food.fat}g F
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ));
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderApiStatus = () => {
    if (!apiStatus) return null;
    
    return (
      <div className={`fixed bottom-4 right-4 p-3 rounded-md shadow-lg ${
        apiStatus === "checking" ? "bg-yellow-100 text-yellow-800" :
        apiStatus === "connected" ? "bg-green-100 text-green-800" :
        "bg-red-100 text-red-800"
      }`}>
        {apiStatus === "checking" ? "Checking API connection..." :
         apiStatus === "connected" ? "API connected successfully!" :
         "API connection failed!"}
      </div>
    );
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    
    if (!chatInput.trim()) return;
    
    // Add user message to chat
    const userMessage = { type: "user", content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    
    // Clear input
    setChatInput("");
    
    // Set loading state
    setIsChatLoading(true);
    
    try {
      // Call the nutrition chat API
      const response = await axios.post('/nutrition/chat', {
        question: userMessage.content
      });
      
      // Add AI response to chat
      setChatMessages(prev => [
        ...prev, 
        { type: "assistant", content: response.data.answer }
      ]);
    } catch (err) {
      console.error("Error getting chat response:", err);
      setChatMessages(prev => [
        ...prev, 
        { 
          type: "error", 
          content: "Sorry, I couldn't process your question. Please try again or check if you have workout data available." 
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const renderChatInterface = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
        <div className="flex flex-col h-[70vh]">
          <div className="flex-grow overflow-y-auto mb-4 space-y-4 p-2" id="chat-messages">
            {chatMessages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.type === 'user' 
                      ? 'bg-blue-500 text-white rounded-br-none' 
                      : message.type === 'system' 
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200' 
                        : message.type === 'error'
                          ? 'bg-red-500 text-white'
                          : 'bg-green-100 dark:bg-green-900 text-gray-800 dark:text-gray-200 rounded-bl-none'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-4 py-3 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce" style={{ animationDelay: "600ms" }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <form onSubmit={handleChatSubmit} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about nutrition, meal planning, macros..."
              className="flex-grow rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              disabled={isChatLoading}
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-md px-4 py-2 transition duration-150 ease-in-out flex items-center"
              disabled={isChatLoading}
            >
              <FaRobot className="mr-2" />
              {isChatLoading ? "Thinking..." : "Ask"}
            </button>
          </form>
          
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            <p>The AI Nutrition Guide provides personalized advice based on your workout program and nutrition history.</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Nutrition Tracker</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex flex-wrap -mb-px">
            <button
              className={`mr-4 py-2 px-1 font-medium text-sm leading-5 focus:outline-none ${
                activeTab === "dashboard"
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("dashboard")}
            >
              <div className="flex items-center">
                <FaChartPie className="mr-2" />
                Dashboard
              </div>
            </button>
            
            <button
              className={`mr-4 py-2 px-1 font-medium text-sm leading-5 focus:outline-none ${
                activeTab === "mealLog"
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("mealLog")}
            >
              <div className="flex items-center">
                <FaListAlt className="mr-2" />
                Meal Log
              </div>
            </button>
            
            <button
              className={`mr-4 py-2 px-1 font-medium text-sm leading-5 focus:outline-none ${
                activeTab === "analysis"
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("analysis")}
            >
              <div className="flex items-center">
                <FaHistory className="mr-2" />
                Analysis
              </div>
            </button>
            
            <button
              className={`mr-4 py-2 px-1 font-medium text-sm leading-5 focus:outline-none ${
                activeTab === "mealPlan"
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("mealPlan")}
            >
              <div className="flex items-center">
                <FaUtensils className="mr-2" />
                Meal Plan
              </div>
            </button>
            
            <button
              className={`mr-4 py-2 px-1 font-medium text-sm leading-5 focus:outline-none ${
                activeTab === "chat"
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("chat")}
            >
              <div className="flex items-center">
                <FaRobot className="mr-2" />
                AI Chat
              </div>
            </button>
            
            <button
              className={`mr-4 py-2 px-1 font-medium text-sm leading-5 focus:outline-none ${
                activeTab === "settings"
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("settings")}
            >
              <div className="flex items-center">
                <FaInfoCircle className="mr-2" />
                Settings
              </div>
            </button>
          </nav>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {activeTab === "dashboard" && renderDashboard()}
      {activeTab === "mealLog" && renderMealLog()}
      {activeTab === "analysis" && renderAnalysis()}
      {activeTab === "mealPlan" && renderMealPlanGenerator()}
      {activeTab === "settings" && renderSettings()} 
      {activeTab === "chat" && renderChatInterface()}

      {renderFoodSearchModal()}
      {renderAddMealModal()}
      {renderAddCustomFoodModal()}
      {renderApiStatus()}
    </div>
  );
}

export default Nutrition;
