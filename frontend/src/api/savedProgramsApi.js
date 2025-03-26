const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const createSavedProgram = async (programData, token) => {
  if (!token) {
    throw new Error("Authentication token is required");
  }

  try {
    const response = await fetch(`${API_URL}/saved-programs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        program_data: programData,
        current_week: 1,
        completed_weeks: [],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving workout program:", error);
    throw error;
  }
};

export const getSavedPrograms = async (token) => {
  if (!token) {
    throw new Error("Authentication token is required");
  }

  try {
    const response = await fetch(`${API_URL}/saved-programs`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching saved programs:", error);
    throw error;
  }
};

export const updateSavedProgram = async (programId, programData, token) => {
  if (!token) {
    throw new Error("Authentication token is required");
  }

  try {
    const response = await fetch(`${API_URL}/saved-programs/${programId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        program_data: programData.program_data,
        current_week: programData.current_week,
        completed_weeks: programData.completed_weeks || [],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating saved program:", error);
    throw error;
  }
};

export const deleteSavedProgram = async (programId, token) => {
  if (!token) {
    throw new Error("Authentication token is required");
  }

  try {
    const response = await fetch(`${API_URL}/saved-programs/${programId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting saved program:", error);
    throw error;
  }
};
