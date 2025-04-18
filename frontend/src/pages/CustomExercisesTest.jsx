import React, { useState } from 'react';
import CustomExerciseManager from '../components/CustomExerciseManager';
import '../styles/custom-exercises.css';

const CustomExercisesTest = () => {
  const [viewportWidth, setViewportWidth] = useState(375); // iPhone viewport width

  const handleViewportChange = (e) => {
    setViewportWidth(parseInt(e.target.value));
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
        Custom Exercises Test Page
      </h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">Viewport Control</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm mb-1">Viewport Width: {viewportWidth}px</label>
            <input 
              type="range" 
              min="320" 
              max="1200" 
              value={viewportWidth} 
              onChange={handleViewportChange}
              className="w-64"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setViewportWidth(375)} 
              className="px-2 py-1 text-sm bg-blue-100 hover:bg-blue-200 rounded"
            >
              iPhone (375px)
            </button>
            <button 
              onClick={() => setViewportWidth(414)} 
              className="px-2 py-1 text-sm bg-blue-100 hover:bg-blue-200 rounded"
            >
              iPhone Plus (414px)
            </button>
            <button 
              onClick={() => setViewportWidth(768)} 
              className="px-2 py-1 text-sm bg-blue-100 hover:bg-blue-200 rounded"
            >
              Tablet (768px)
            </button>
            <button 
              onClick={() => setViewportWidth(1024)} 
              className="px-2 py-1 text-sm bg-blue-100 hover:bg-blue-200 rounded"
            >
              Desktop (1024px)
            </button>
          </div>
        </div>
      </div>
      
      <div className="border-4 border-gray-300 rounded-lg mx-auto" style={{ width: `${viewportWidth}px`, maxWidth: '100%' }}>
        <div className="p-2 bg-gray-200 text-center text-sm">
          Preview: {viewportWidth}px
        </div>
        <div className="bg-white dark:bg-gray-800 max-h-[70vh] overflow-y-auto">
          <CustomExerciseManager />
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-600">
        <p>Notes:</p>
        <ul className="list-disc pl-5 mt-2">
          <li>Use the controls above to test different viewport widths</li>
          <li>This test page allows you to preview how the custom exercises interface will appear on different devices</li>
          <li>The iPhone viewport is set to 375px by default</li>
        </ul>
      </div>
    </div>
  );
};

export default CustomExercisesTest; 