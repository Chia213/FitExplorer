import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";

function ConfirmDeletion() {
  const [status, setStatus] = useState("verifying"); // "verifying", "confirming", "success", "error"
  const [message, setMessage] = useState("Verifying deletion request...");
  const [token, setToken] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const deletionToken = query.get("token");

    if (!deletionToken) {
      setStatus("error");
      setMessage("Invalid deletion link. No token provided.");
    } else {
      setToken(deletionToken);
      setStatus("confirming");
    }
  }, [location]);

  const handleConfirmDeletion = async () => {
    setStatus("verifying");
    setMessage("Processing account deletion...");

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      
      // First try with a special query parameter to handle user_rewards issue
      const response = await fetch(`${API_URL}/auth/confirm-account-deletion?skip_relationships=true`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }), // Make sure token is being sent in the body
      });

      // Try to get a JSON response, but don't fail if it's not JSON
      let errorDetail = "Unknown error";
      let responseData = {};
      try {
        responseData = await response.json();
        errorDetail = responseData.detail || "Failed to delete account. Please try again.";
      } catch (parseError) {
        // If we can't parse JSON, use text content if available
        try {
          errorDetail = await response.text();
        } catch (textError) {
          errorDetail = `Error status: ${response.status}`;
        }
      }

      if (response.ok) {
        // Clear auth data immediately
        localStorage.removeItem("token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("isAdmin");
        
        // No need to dispatch events which would trigger session verification
        // Just set the UI state directly
        setStatus("success");
        setMessage("Your account has been deleted successfully.");
      } else {
        setStatus("error");
        
        if (response.status === 500) {
          // Check for specific database errors
          if (errorDetail.includes("user_rewards") || errorDetail.includes("UndefinedTable")) {
            console.error("Server error with user_rewards table:", errorDetail);
            setMessage("We encountered an issue with your account. Please contact support with error code: DB-REL-001");
          } else {
            console.error("Server error during deletion:", errorDetail);
            setMessage("Internal server error while deleting your account. Our team has been notified.");
          }
        } else if (response.status === 400) {
          setMessage(errorDetail || "The deletion link is invalid or has expired.");
        } else {
          setMessage(errorDetail || "Failed to delete account. Please try again later.");
        }
      }
    } catch (error) {
      console.error("Deletion error:", error);
      setStatus("error");
      setMessage("Connection error. Please check your internet connection and try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md mx-auto text-center">
        {status === "verifying" && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Processing Request
            </h1>
            <p className="text-gray-600 dark:text-gray-300">{message}</p>
          </div>
        )}

        {status === "confirming" && (
          <div className="flex flex-col items-center">
            <FaExclamationTriangle className="text-red-500 text-6xl mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Confirm Account Deletion
            </h1>
            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg mb-6">
              <p className="text-red-700 dark:text-red-300 font-bold">
                Warning:
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                This action is permanent and cannot be undone. All your data
                will be deleted.
              </p>
            </div>
            <div className="flex flex-col space-y-3 w-full">
              <button
                onClick={handleConfirmDeletion}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg"
              >
                Yes, Delete My Account
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-3 px-6 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center">
            <svg
              className="w-16 h-16 text-green-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Account Deleted
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
            <button
              onClick={() => navigate("/")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg"
            >
              Return to Home
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center">
            <FaExclamationTriangle className="text-red-500 text-6xl mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Deletion Failed
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
            <button
              onClick={() => navigate("/profile")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg"
            >
              Back to Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConfirmDeletion;
