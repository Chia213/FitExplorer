import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaInfoCircle } from "react-icons/fa";

function VerifyEmail() {
  const [status, setStatus] = useState("verifying"); // "verifying", "success", "error", "already_verified"
  const [message, setMessage] = useState("Verifying your email...");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyEmail = async () => {
      const query = new URLSearchParams(location.search);
      const token = query.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link. No token provided.");
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const response = await fetch(`${API_URL}/auth/verify-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }), // Send token in request body
        });

        if (response.ok) {
          const data = await response.json();
          setStatus("success");
          setMessage(data.message || "Email verified successfully! You can now log in.");
          setTimeout(() => navigate("/login"), 3000);
        } else {
          const error = await response.json();
          
          // Check if this might be an already verified account
          if (error.detail && (
            error.detail.includes("already verified") || 
            error.detail.includes("Invalid verification token")
          )) {
            setStatus("already_verified");
            setMessage("Your account may already be verified. Please try logging in.");
          } else {
            setStatus("error");
            setMessage(error.detail || "Failed to verify email. The link may be expired.");
          }
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred during verification. Please try again.");
      }
    };

    verifyEmail();
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md mx-auto text-center">
        {status === "verifying" && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Verifying Your Email
            </h1>
            <p className="text-gray-600 dark:text-gray-300">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center">
            <FaCheckCircle className="text-green-500 text-6xl mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Email Verified!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg"
            >
              Log In
            </button>
          </div>
        )}
        
        {status === "already_verified" && (
          <div className="flex flex-col items-center">
            <FaInfoCircle className="text-blue-500 text-6xl mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Already Verified
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg"
            >
              Go to Login
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center">
            <FaTimesCircle className="text-red-500 text-6xl mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Verification Failed
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
