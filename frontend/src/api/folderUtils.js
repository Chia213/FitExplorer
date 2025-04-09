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

  const response = await fetch(`${API_URL}/routine-folders`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  return await response.json();
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

  const response = await fetch(`${API_URL}/routine-folders/${folderId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  return await response.json();
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
