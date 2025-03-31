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

function FolderModal({ isOpen, onClose, onSelectFolder, selectedRoutineId }) {
  const [folders, setFolders] = useState([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingFolder, setEditingFolder] = useState(null);
  const [editName, setEditName] = useState("");
  const { theme } = useTheme();

  useEffect(() => {
    if (isOpen) {
      loadFolders();
    }
  }, [isOpen]);

  const loadFolders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`${API_URL}/routine-folders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load folders: ${response.status}`);
      }

      const folderData = await response.json();
      setFolders(folderData);
      setError(null);
    } catch (err) {
      console.error("Error loading folders:", err);
      setError("Failed to load folders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`${API_URL}/routine-folders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newFolderName }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create folder: ${response.status}`);
      }

      setNewFolderName("");
      await loadFolders();
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
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/routine-folders/${folderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete folder: ${response.status}`);
      }

      await loadFolders();
    } catch (err) {
      console.error("Error deleting folder:", err);
      setError("Failed to delete folder. Please try again.");
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
    onSelectFolder(selectedRoutineId, folderId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`${
          theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        } rounded-lg shadow-xl max-w-md w-full p-6`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Select Folder</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <p
            className={`${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Move this routine to a folder or create a new one.
          </p>
        </div>

        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="New folder name"
              className={`flex-1 p-2 border rounded ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
            <button
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim()}
              className={`p-2 rounded text-white ${
                !newFolderName.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-teal-500 hover:bg-teal-600"
              }`}
            >
              <FaPlus />
            </button>
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto mb-4">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
            </div>
          ) : folders.length === 0 ? (
            <p
              className={`text-center py-4 ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              No folders yet. Create your first folder above.
            </p>
          ) : (
            <div className="space-y-2">
              <div
                className={`p-3 rounded-lg ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-100 hover:bg-gray-200"
                } cursor-pointer flex justify-between items-center`}
                onClick={() => handleSelectFolder(null)}
              >
                <div className="flex items-center">
                  <FaFolder className="mr-2 text-yellow-500" />
                  <span>None (Unassigned)</span>
                </div>
              </div>

              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className={`p-3 rounded-lg ${
                    theme === "dark"
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-100 hover:bg-gray-200"
                  } cursor-pointer`}
                  onClick={() => handleSelectFolder(folder.id)}
                >
                  {editingFolder && editingFolder.id === folder.id ? (
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className={`flex-1 p-1 border rounded ${
                          theme === "dark"
                            ? "bg-gray-800 border-gray-500 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditFolder();
                        }}
                        className="ml-2 p-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        <FaCheck />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingFolder(null);
                        }}
                        className="ml-1 p-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <FaFolder className="mr-2 text-yellow-500" />
                        <span>{folder.name}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => startEditingFolder(folder, e)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={(e) => handleDeleteFolder(folder.id, e)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className={`${
              theme === "dark"
                ? "bg-gray-600 text-white hover:bg-gray-500"
                : "bg-gray-300 text-gray-800 hover:bg-gray-400"
            } px-4 py-2 rounded`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default FolderModal;
