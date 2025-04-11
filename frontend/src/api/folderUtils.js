const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const createFolder = async (folderName, token, color = "#808080") => {
  if (!token) {
    throw new Error("Authentication token is required");
  }

  const response = await fetch(`${API_URL}/routine-folders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name: folderName, color }),
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  return await response.json();
};

export const getFolders = async (token) => {
  if (!token) {
    throw new Error("Authentication token is required");
  }

  try {
    console.log('Fetching folders from API...');
    const response = await fetch(`${API_URL}/routine-folders`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      // Try to parse error response
      const errorData = await response.json().catch(() => ({
        detail: `Server error: ${response.status}`
      }));
      
      console.error(`Failed to fetch folders: ${response.status}`, errorData);
      throw new Error(errorData.detail || `Server error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Successfully fetched folders:', data);
    return data;
  } catch (error) {
    console.error('Error in getFolders:', error);
    throw error;
  }
};

export const updateFolder = async (folderId, folderName, token, color) => {
  if (!token) {
    throw new Error("Authentication token is required");
  }

  const response = await fetch(`${API_URL}/routine-folders/${folderId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name: folderName, color }),
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  return await response.json();
};

export const deleteFolder = async (folderId, token) => {
  if (!token) {
    throw new Error("Authentication token is required");
  }

  try {
    const response = await fetch(`${API_URL}/routine-folders/${folderId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      // Try to get the detailed error message from the server
      const errorData = await response.json().catch(() => ({ 
        detail: `Server error: ${response.status}` 
      }));
      
      throw new Error(errorData.detail || `Failed to delete folder: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting folder:", error);
    throw error; // Re-throw to let the calling component handle it
  }
};

export const moveRoutineToFolder = async (routineId, folderId, token) => {
  if (!token) {
    throw new Error("Authentication token is required");
  }

  const response = await fetch(
    `${API_URL}/routines/${routineId}/move-to-folder`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ folder_id: folderId }),
    }
  );

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  return await response.json();
};
