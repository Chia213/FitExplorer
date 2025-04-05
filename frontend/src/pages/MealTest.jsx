import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';

function MealTest() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Fetch meals when component mounts
  useEffect(() => {
    fetchMeals();
  }, []);
  
  const fetchMeals = async () => {
    setLoading(true);
    try {
      console.log("Fetching meals...");
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(`/nutrition/meals?date=${today}`);
      console.log("Meals response:", response.data);
      setMeals(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching meals:", err);
      setError("Failed to load meals");
    } finally {
      setLoading(false);
    }
  };
  
  const handleTestSaveMeal = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      console.log("Testing meal save...");
      
      // Create a simple test meal
      const testMeal = {
        name: "Test Meal",
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        foods: [
          {
            name: "Apple",
            calories: 95,
            protein: 0.5,
            carbs: 25,
            fat: 0.3,
            serving_size: "1 medium",
            quantity: 1
          }
        ]
      };
      
      console.log("Sending meal data:", testMeal);
      
      // Check if we have an auth token
      const token = localStorage.getItem('token');
      if (!token) {
        setError("No authentication token found. Please log in first.");
        return;
      }
      
      console.log("Using auth token:", token.substring(0, 15) + "...");
      
      // Attempt to save the meal
      const response = await axios.post('/nutrition/meals', testMeal);
      
      console.log("Save meal response:", response.data);
      setSuccessMessage("Meal saved successfully!");
      
      // Refresh the meals list
      fetchMeals();
    } catch (err) {
      console.error("Error in test save meal:", err);
      console.error("Error details:", err.response ? {
        status: err.response.status,
        statusText: err.response.statusText,
        data: err.response.data
      } : "No response data");
      
      setError(`Failed to save meal: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Meal Save Test</h1>
      
      <div className="mb-6">
        <p className="mb-4">This page tests the meal saving functionality.</p>
        <button
          onClick={handleTestSaveMeal}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Processing..." : "Test Save Meal"}
        </button>
      </div>
      
      {successMessage && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Current Meals</h2>
        {loading ? (
          <p>Loading meals...</p>
        ) : meals.length > 0 ? (
          <div className="border rounded divide-y">
            {meals.map(meal => (
              <div key={meal.id} className="p-4">
                <h3 className="font-semibold">{meal.name} ({meal.time})</h3>
                <p className="text-gray-500 text-sm mb-2">ID: {meal.id}</p>
                <div className="pl-4">
                  <p className="font-medium mt-2">Foods:</p>
                  <ul className="list-disc pl-4">
                    {meal.foods?.map((food, i) => (
                      <li key={i} className="text-sm">
                        {food.name} - {food.calories} calories
                        ({food.protein}g protein, {food.carbs}g carbs, {food.fat}g fat)
                      </li>
                    )) || <li>No foods</li>}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No meals found for today.</p>
        )}
        
        <button
          onClick={fetchMeals}
          className="mt-4 px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
        >
          Refresh Meals
        </button>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-bold mb-2">Debug Information</h2>
        <p className="text-sm">Check browser console for detailed logs.</p>
        <p className="text-sm mt-1">
          Auth Token: {localStorage.getItem('token') ? 'Present' : 'Missing'} 
          {localStorage.getItem('token') && ` (${localStorage.getItem('token').substring(0, 15)}...)`}
        </p>
      </div>
    </div>
  );
}

export default MealTest; 