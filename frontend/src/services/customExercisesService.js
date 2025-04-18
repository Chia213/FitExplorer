// Custom Exercises API Service
import axios from "axios";
import { API_URL } from "../config";
import { getToken } from "./authService";

/**
 * Get all custom exercises for the authenticated user
 * Returns empty array if user is not authenticated
 * @returns {Promise<Array>} Array of custom exercises
 */
export const getUserCustomExercises = async () => {
  const token = getToken();
  
  // If no token, return empty array
  if (!token) {
    return [];
  }

  try {
    // Fetch from server
    const response = await axios.get(`${API_URL}/custom-exercises`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching custom exercises:", error);
    return [];
  }
};

/**
 * Create a new custom exercise
 * @param {Object} exerciseData - Data for the new exercise
 * @returns {Promise<Object>} Created exercise data
 */
export const createCustomExercise = async (exerciseData) => {
  const token = getToken();
  
  // If no token, return error
  if (!token) {
    throw new Error("Authentication required to create custom exercises");
  }
  
  try {
    // Save to server
    const response = await axios.post(
      `${API_URL}/custom-exercises`,
      exerciseData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error("Error creating custom exercise:", error);
    throw error;
  }
};

/**
 * Update an existing custom exercise
 * @param {string} id - ID of the exercise to update
 * @param {Object} exerciseData - Updated exercise data
 * @returns {Promise<Object>} Updated exercise data
 */
export const updateCustomExercise = async (id, exerciseData) => {
  const token = getToken();
  
  // If no token, return error
  if (!token) {
    throw new Error("Authentication required to update custom exercises");
  }
  
  try {
    // Update on server
    const response = await axios.put(
      `${API_URL}/custom-exercises/${id}`,
      exerciseData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error("Error updating custom exercise:", error);
    throw error;
  }
};

/**
 * Delete a custom exercise
 * @param {string} id - ID of the exercise to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteCustomExercise = async (id) => {
  const token = getToken();
  
  // If no token, return error
  if (!token) {
    throw new Error("Authentication required to delete custom exercises");
  }
  
  try {
    // Delete on server
    await axios.delete(`${API_URL}/custom-exercises/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return true;
  } catch (error) {
    console.error("Error deleting custom exercise:", error);
    throw error;
  }
};

export default {
  getUserCustomExercises,
  createCustomExercise,
  updateCustomExercise,
  deleteCustomExercise
}; 