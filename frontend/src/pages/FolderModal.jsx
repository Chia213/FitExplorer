import { useState, useEffect } from "react";
import { useTheme } from "../hooks/useTheme";
import {
  FaTimes,
  FaFolder,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function FolderModal({ isOpen, onClose, onSelectFolder, selectedRoutineId, onFoldersChanged }) {
  const [folders, setFolders] = useState([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#808080");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingFolder, setEditingFolder] = useState(null);
  const [editName, setEditName] = useState("");
  const { theme } = useTheme();

  // Determine the mode - create folder only or assign to folder
  const isCreateMode = selectedRoutineId === null || selectedRoutineId === undefined;

  useEffect(() => {
    if (isOpen) {
      loadFolders();
    }
  }, [isOpen]);

  const loadFolders = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      console.log("Attempting to fetch folders...");
      const response = await fetch(`${API_URL}/routine-folders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Try to get a structured error message
        try {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Failed to load folders: ${response.status}`);
        } catch (parseErr) {
          // If we can't parse the JSON, use the status code
          throw new Error(`Failed to load folders: ${response.status}`);
        }
      }

      const folderData = await response.json();
      console.log("Successfully loaded folders:", folderData);
      setFolders(folderData);
    } catch (err) {
      console.error("Error loading folders:", err);
      setError(`${err.message || "Failed to load folders. Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      console.log('Creating folder with data:', {
        name: newFolderName,
        color: newFolderColor
      });

      const response = await fetch(`${API_URL}/routine-folders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          name: newFolderName,
          color: newFolderColor 
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create folder: ${response.status}`);
      }

      const createdFolder = await response.json();
      console.log('Successfully created folder:', createdFolder);

      setNewFolderName("");
      setNewFolderColor("#808080");
      await loadFolders();
      
      // Notify parent component that folders have changed
      if (onFoldersChanged) {
        onFoldersChanged();
      }
    } catch (err) {
      console.error("Error creating folder:", err);
      setError("Failed to create folder. Please try again.");
    }
  };

  const handleDeleteFolder = async (folderId, e) => {
    e.stopPropagation();

    if (
      !window.confirm(
        "Are you sure you want to delete this folder? The routines inside won't be deleted."
      )
    ) {
      return;
    }

    try {
      setError(null); // Reset any previous errors
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`${API_URL}/routine-folders/${folderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || `Failed to delete folder: ${response.status}`;
        throw new Error(errorMessage);
      }

      await loadFolders();
      
      // Notify parent component that folders have changed
      if (onFoldersChanged) {
        onFoldersChanged();
      }
    } catch (err) {
      console.error("Error deleting folder:", err);
      setError(`Failed to delete folder: ${err.message || "Unknown error"}`);
    }
  };

  const handleEditFolder = async () => {
    if (!editName.trim() || !editingFolder) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/routine-folders/${editingFolder.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: editName }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update folder: ${response.status}`);
      }

      setEditingFolder(null);
      setEditName("");
      await loadFolders();
      
      // Notify parent component that folders have changed
      if (onFoldersChanged) {
        onFoldersChanged();
      }
    } catch (err) {
      console.error("Error updating folder:", err);
      setError("Failed to update folder. Please try again.");
    }
  };

  const startEditingFolder = (folder, e) => {
    e.stopPropagation();
    setEditingFolder(folder);
    setEditName(folder.name);
  };

  const handleSelectFolder = (folderId) => {
    // Only handle folder selection if a routine is selected
    if (!isCreateMode) {
      onSelectFolder(selectedRoutineId, folderId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`
          bg-${theme === "dark" ? "gray-800" : "white"} 
          p-6 rounded-lg shadow-xl w-full max-w-md
          ${theme === "dark" ? "text-white" : "text-gray-800"}
        `}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {isCreateMode ? "Manage Folders" : "Choose Folder"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <FaTimes />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-4">Loading folders...</div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  placeholder="New folder name"
                  className={`
                    flex-grow px-3 py-2 border rounded-md
                    ${theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"}
                  `}
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
                <input
                  type="color"
                  value={newFolderColor}
                  onChange={(e) => setNewFolderColor(e.target.value)}
                  className="w-10 h-10 rounded-md border"
                />
                <button
                  onClick={handleCreateFolder}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  <FaPlus />
                </button>
              </div>
            </div>
            
            <div className="mt-4 max-h-80 overflow-y-auto">
              {folders.length === 0 ? (
                <p className="text-center py-4 text-gray-500">No folders yet. Create your first one!</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {folders.map((folder) => (
                    <li 
                      key={folder.id}
                      onClick={() => handleSelectFolder(folder.id)}
                      className={`
                        py-3 px-2 flex items-center justify-between cursor-pointer 
                        ${!isCreateMode ? "hover:bg-gray-100 hover:dark:bg-gray-700" : ""}
                        ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"}
                      `}
                    >
                      {editingFolder && editingFolder.id === folder.id ? (
                        <div className="flex items-center space-x-2 w-full">
                          <input
                            type="text"
                            className={`
                              flex-grow px-2 py-1 border rounded
                              ${theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"}
                            `}
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditFolder();
                            }}
                            className="text-green-500 p-1"
                          >
                            <FaCheck />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center">
                            <FaFolder 
                              style={{ color: folder.color || "#808080" }}
                              className="mr-2" 
                            />
                            <span>{folder.name}</span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => startEditingFolder(folder, e)}
                              className="text-blue-500 p-1"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={(e) => handleDeleteFolder(folder.id, e)}
                              className="text-red-500 p-1"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {!isCreateMode && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 mr-2"
                >
                  Cancel
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default FolderModal;