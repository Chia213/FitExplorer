import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("input"); // "input", "submitting", "success", "error"
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const resetToken = query.get("token");

    if (!resetToken) {
      setStatus("error");
      setError("Invalid reset link. No token provided.");
    } else {
      setToken(resetToken);
    }
  }, [location]);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setStatus("submitting");

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          new_password: password,
        }),
      });

      if (response.ok) {
        setStatus("success");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        const data = await response.json();
        setStatus("error");
        setError(data.detail || "Failed to reset password. Please try again.");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setStatus("error");
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full inline-flex items-center justify-center mb-4">
            <FaLock className="text-blue-500 dark:text-blue-400 text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Reset Your Password
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Enter a new password for your account
          </p>
        </div>

        {status === "input" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                >
                  {showPassword ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition duration-300 ease-in-out"
            >
              Reset Password
            </button>
          </form>
        )}

        {status === "submitting" && (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-700 dark:text-gray-300">
              Resetting your password...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center py-6">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full inline-flex items-center justify-center mb-4">
              <svg
                className="h-8 w-8 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Password Reset Successful
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your password has been reset successfully. You can now log in with
              your new password.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg"
            >
              Go to Login
            </button>
          </div>
        )}

        {status === "error" && error && (
          <div className="text-center py-6">
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full inline-flex items-center justify-center mb-4">
              <svg
                className="h-8 w-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Password Reset Failed
            </h2>
            <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
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

export default ResetPassword;
