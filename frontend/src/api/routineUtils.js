// Utility function for saving routines to ensure consistent behavior across components
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const saveRoutineToAPI = async (routineData, token) => {
  if (!routineData || !routineData.name || !routineData.exercises) {
    throw new Error("Invalid routine data");
  }

  if (!token) {
    throw new Error("Authentication token is required");
  }

  // Ensure the exercises are properly formatted
  const cleanedExercises = routineData.exercises
    .filter((exercise) => exercise && exercise.name) // Only keep valid exercises
    .map((exercise) => ({
      name: exercise.name,
      category: exercise.category || "Uncategorized",
      is_cardio: Boolean(exercise.is_cardio), // Ensure boolean type
      initial_sets: Number(exercise.initial_sets || 1), // Ensure number type
    }));

  if (cleanedExercises.length === 0) {
    throw new Error("Routine must contain at least one exercise");
  }

  const routinePayload = {
    name: routineData.name.trim(),
    exercises: cleanedExercises,
  };

  // Log the request for debugging
  console.log("Saving routine:", JSON.stringify(routinePayload, null, 2));

  const response = await fetch(`${API_URL}/routines`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(routinePayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Server response:", errorText);

    // Try to parse the error for more details
    try {
      const errorJson = JSON.parse(errorText);
      console.error("Detailed error:", errorJson);
    } catch (e) {
      // If it's not JSON, just log the raw text
    }

    throw new Error(`Server error: ${response.status}`);
  }

  // Return the saved routine
  return await response.json();
};
