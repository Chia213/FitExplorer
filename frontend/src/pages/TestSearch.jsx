import React, { useState } from 'react';
import axios from '../utils/axiosConfig';

function TestSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // First try the test endpoint
      console.log(`Searching test endpoint for: ${query}`);
      const testResponse = await axios.get(
        `/test/search?query=${encodeURIComponent(query)}`
      );
      console.log("Test search results:", testResponse.data);
      
      // Then try the actual nutrition endpoint
      console.log(`Searching nutrition endpoint for: ${query}`);
      const nutritionResponse = await axios.get(
        `/nutrition/search?query=${encodeURIComponent(query)}`
      );
      console.log("Nutrition search results:", nutritionResponse.data);
      
      setResults(nutritionResponse.data);
    } catch (err) {
      console.error("Error searching:", err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Food Search Test</h1>
      
      <div className="mb-6">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for foods..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        {error && (
          <div className="text-red-500 mt-2">
            Error: {error}
          </div>
        )}
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-3">Results ({results.length})</h2>
        
        {results.length === 0 ? (
          <div className="text-gray-500">No results found</div>
        ) : (
          <div className="space-y-3">
            {results.map((food, index) => (
              <div 
                key={index} 
                className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div className="font-medium">{food.name}</div>
                  {food.source && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      {food.source}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-4 text-sm text-gray-500 mt-1">
                  <div>
                    <span className="font-medium text-gray-700">{food.calories}</span> kcal
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">{food.protein}g</span> protein
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">{food.carbs}g</span> carbs
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">{food.fat}g</span> fat
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {food.serving_size || "1 serving"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TestSearch; 