const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Create Saved Program
export const createSavedProgram = async (programData, token) => {
  if (!token) {
    throw new Error("Authentication token is required");
  }

  try {
    console.log("Sending program data:", programData);
    
    // Send the program data directly without nesting
    const response = await fetch(`${API_URL}/saved-programs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(programData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error response:", errorText);
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving workout program:", error);
    throw error;
  }
};

// Get Saved Programs
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
      console.error("Server response:", errorText);
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching saved programs:", error);
    throw error;
  }
};

// Update Saved Program
export const updateSavedProgram = async (programId, programData, token) => {
  if (!token) {
    throw new Error("Authentication token is required");
  }

  try {
    console.log("Updating program data:", programData);
    
    const response = await fetch(`${API_URL}/saved-programs/${programId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(programData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error response:", errorText);
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating saved program:", error);
    throw error;
  }
};

// Delete Saved Program
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

// Get a specific saved program by ID
export const getSavedProgramById = async (programId, token) => {
  try {
    const response = await fetch(`${API_URL}/saved-programs/${programId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch saved program');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getSavedProgramById:', error);
    throw error;
  }
};
