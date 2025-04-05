import React, { useState, useEffect } from "react";
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
  FaEquals
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

const backendURL = import.meta.env.VITE_API_URL;

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
  const [newMeal, setNewMeal] = useState({
    name: "",
    time: new Date().toTimeString().slice(0, 5),
    foods: []
  });
  const [nutritionStats, setNutritionStats] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const [nutritionHistory, setNutritionHistory] = useState([]);
  const [dateRange, setDateRange] = useState("week");
  
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
      
      const response = await axios.get(
        `${backendURL}/nutrition/meals?date=${selectedDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Meals API response:", response.data);
      setMeals(response.data);
      calculateNutritionStats(response.data);
    } catch (err) {
      console.error("Error fetching meals:", err);
      console.error("Error details:", err.response ? {
        status: err.response.status,
        statusText: err.response.statusText,
        data: err.response.data
      } : "No response");
      setError("Failed to load meals. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchNutritionGoals = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${backendURL}/nutrition/goals`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
      const token = localStorage.getItem("token");
      let endpoint = `${backendURL}/nutrition/history?range=${dateRange}`;
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  const handleSearchFood = async () => {
    if (!searchQuery.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${backendURL}/nutrition/search?query=${searchQuery}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSearchResults(response.data);
      setShowFoodSearchModal(true);
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
      const token = localStorage.getItem("token");
      await axios.post(
        `${backendURL}/nutrition/meals`,
        {
          ...newMeal,
          date: selectedDate
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setShowAddMealModal(false);
      setNewMeal({
        name: "",
        time: new Date().toTimeString().slice(0, 5),
        foods: []
      });
      fetchMeals();
    } catch (err) {
      console.error("Error saving meal:", err);
      alert("Failed to save meal. Please try again.");
    }
  };

  const handleDeleteMeal = async (mealId) => {
    if (!confirm("Are you sure you want to delete this meal?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${backendURL}/nutrition/meals/${mealId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchMeals();
    } catch (err) {
      console.error("Error deleting meal:", err);
      alert("Failed to delete meal. Please try again.");
    }
  };

  const handleSaveNutritionGoals = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${backendURL}/nutrition/goals`,
        nutritionGoals,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Nutrition goals saved successfully!");
    } catch (err) {
      console.error("Error saving nutrition goals:", err);
      alert("Failed to save nutrition goals. Please try again.");
    }
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
              onClick={() => setShowAddMealModal(true)}
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
                onClick={() => setShowAddMealModal(true)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Log your first meal
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {meals.map((meal) => (
                <div key={meal.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
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
                        {meal.foods.map((food, index) => (
                          <tr key={index}>
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
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((food, index) => (
                  <div 
                    key={index} 
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleAddFood(food)}
                  >
                    <div className="font-medium">{food.name}</div>
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
                ))}
              </div>
            )}
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
                <div className="flex">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for foods..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md bg-white dark:bg-gray-700"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchFood()}
                  />
                  <button
                    onClick={handleSearchFood}
                    className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 transition-colors flex items-center"
                  >
                    <FaSearch />
                  </button>
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
                      Search for foods using the search box above
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
              onClick={handleSaveMeal}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              disabled={!newMeal.name.trim() || newMeal.foods.length === 0}
            >
              Save Meal
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderMealLog = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <FaCalendarAlt className="mr-2 text-blue-500" /> Meal Log
            </h3>
            <div className="flex items-center">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 mr-2"
              />
              <button
                onClick={() => setShowAddMealModal(true)}
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
              <p>No meals logged for {new Date(selectedDate).toLocaleDateString()}</p>
              <button
                onClick={() => setShowAddMealModal(true)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Log a meal
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {meals.map((meal) => (
                <div key={meal.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
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
                        {meal.foods.map((food, index) => (
                          <tr key={index}>
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

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <h1 className="text-2xl font-bold mb-6">Nutrition Tracker</h1>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
        <button
          className={`px-4 py-2 font-medium whitespace-nowrap ${
            activeTab === "dashboard"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("dashboard")}
        >
          <FaChartPie className="inline mr-2" /> Dashboard
        </button>
        <button
          className={`px-4 py-2 font-medium whitespace-nowrap ${
            activeTab === "meal-log"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("meal-log")}
        >
          <FaListAlt className="inline mr-2" /> Meal Log
        </button>
        <button
          className={`px-4 py-2 font-medium whitespace-nowrap ${
            activeTab === "analysis"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("analysis")}
        >
          <FaChartPie className="inline mr-2" /> Analysis
        </button>
        <button
          className={`px-4 py-2 font-medium whitespace-nowrap ${
            activeTab === "settings"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("settings")}
        >
          <FaInfoCircle className="inline mr-2" /> Settings
        </button>
      </div>
      
      {/* Loading and Error States */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading nutrition data...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-md">
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* Tab Content */}
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "meal-log" && renderMealLog()}
          {activeTab === "analysis" && renderAnalysis()}
          {activeTab === "settings" && renderSettings()}
          
          {/* Modals */}
          {renderFoodSearchModal()}
          {renderAddMealModal()}
        </>
      )}
    </div>
  );
}

export default Nutrition;