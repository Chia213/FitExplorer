import React, { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash, FaCheckCircle, FaGoogle } from "react-icons/fa";
import { loginUser, checkAdminStatus } from "../api/auth";
import { useWelcome } from "../contexts/WelcomeContext";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState(null);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendStatus, setResendStatus] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get welcome modal trigger function from context
  const { triggerWelcomeModal } = useWelcome();

  // Clear any existing auth tokens when the login page loads
  useEffect(() => {
    // Clear all authentication tokens to prevent state inconsistencies
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    
    // Dispatch events to notify all components
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("auth-change"));
  }, []);

  // Check for success message from location state (e.g., after registration)
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the location state to avoid showing the message multiple times
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await loginUser(formData.email, formData.password);
      if (response.access_token) {
        // Store token
        localStorage.setItem("access_token", response.access_token);
        console.log("Token stored successfully, length:", response.access_token.length);

        // Set just logged in flag to trigger welcome modal
        localStorage.setItem("justLoggedIn", "true");

        // Check if this is the first login and store that information
        const hasLoggedInBefore =
          localStorage.getItem("hasLoggedInBefore") === "true";
        if (!hasLoggedInBefore) {
          localStorage.setItem("isFirstLogin", "true");
          localStorage.setItem("hasLoggedInBefore", "true");
        }

        try {
          // Try to check admin status, but don't let it block login if it fails
          await checkAdminStatus();
        } catch (adminErr) {
          localStorage.setItem("isAdmin", "false");
        }

        // Force auth state refresh before navigation
        window.dispatchEvent(new Event('storage'));

        // Check if the user was redirected from a protected route and redirect back
        const from = location.state?.from?.pathname || "/";
        navigate(from);
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      
      // Display the specific error message from the backend
      if (err.message) {
        // Check for verification issue
        if (err.message.includes("not verified")) {
          setError(err.message);
          // Add resend verification link
          setShowResendVerification(true);
          setResendEmail(formData.email);
        } 
        // Check for user doesn't exist
        else if (err.message.includes("User does not exist")) {
          setError(err.message);
        }
        // Check for incorrect password
        else if (err.message.includes("Incorrect password")) {
          setError(err.message);
        }
        // Any other error message from the backend
        else if (err.message.includes("Login failed")) {
          // For generic login failures, assume user doesn't exist if that's the most likely cause
          setError(`User with email "${formData.email}" does not exist. Please check your email or register a new account.`);
        }
        else {
          setError(err.message);
        }
      } else {
        // Fallback generic error message if we can't get a specific error
        setError("An error occurred during login. Please try again.");
      }
    }
  };

  const handleResendVerification = async () => {
    setResendStatus("submitting");

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resendEmail }),
      });
      if (response.ok) {
        setResendStatus("success");
      } else {
        setResendStatus("error");
      }
    } catch (error) {
      setResendStatus("error");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleGoogleLogin = async (credentialResponse) => {
    if (!credentialResponse || !credentialResponse.credential) {
      setError("Google login failed - no credentials received");
      console.error("No Google credentials received", credentialResponse);
      return;
    }

    try {
      console.log("Google credential received, sending to backend");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      console.log(`Using API URL: ${API_URL}`);
      
      const response = await fetch(`${API_URL}/auth/google-verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const responseText = await response.text();
      console.log(`Response status: ${response.status}, body: ${responseText}`);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse response as JSON:", e);
        setError(`Failed to parse response: ${responseText}`);
        return;
      }

      if (response.ok && data.access_token) {
        console.log("Google login successful, token received");
        localStorage.setItem("access_token", data.access_token);
        // Also store as "token" for compatibility with the rest of the app
        localStorage.setItem("token", data.access_token);

        // Set just logged in flag to trigger welcome modal
        localStorage.setItem("justLoggedIn", "true");

        // Check if this is the first login
        const hasLoggedInBefore =
          localStorage.getItem("hasLoggedInBefore") === "true";
        if (!hasLoggedInBefore) {
          localStorage.setItem("isFirstLogin", "true");
          localStorage.setItem("hasLoggedInBefore", "true");
        }

        // Navigate to home or previous route
        const from = location.state?.from?.pathname || "/";
        navigate(from);
      } else {
        console.error(`Google login failed: Status ${response.status}`, responseText);
        setError(`Google login failed: ${response.status} - ${responseText}`);
      }
    } catch (error) {
      console.error("Error during Google login:", error);
      setError(`Google login error: ${error.message}`);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotStatus("submitting");

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotEmail }),
      });

      if (response.ok) {
        setForgotStatus("success");
      } else {
        setForgotStatus("error");
      }
    } catch (error) {
      setForgotStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md mx-auto text-gray-900 dark:text-gray-100">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
          Login
        </h1>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-start">
            <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
            <p className="text-green-800 dark:text-green-300">
              {successMessage}
            </p>
          </div>
        )}

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {showResendVerification && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
              Need a new verification email?
            </p>
            {resendStatus === "success" ? (
              <p className="text-green-600 dark:text-green-400 text-sm">
                Verification email resent! Please check your inbox.
              </p>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleResendVerification}
                  disabled={resendStatus === "submitting"}
                  className={`text-white bg-blue-500 px-3 py-1 rounded text-sm ${
                    resendStatus === "submitting"
                      ? "opacity-70"
                      : "hover:bg-blue-600"
                  }`}
                >
                  {resendStatus === "submitting"
                    ? "Sending..."
                    : "Resend Email"}
                </button>
                {resendStatus === "error" && (
                  <span className="text-red-500 text-sm">Failed to resend</span>
                )}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 
                         text-gray-900 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <div className="flex justify-between items-center">
              <label className="block text-gray-700 dark:text-gray-300 font-medium">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-blue-500 dark:text-blue-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 
                         text-gray-900 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute top-12 right-3 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 
                       dark:bg-blue-600 dark:hover:bg-blue-700 
                       text-white font-semibold py-2 rounded-lg 
                       transition duration-300 ease-in-out"
          >
            Login
          </button>

          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-blue-500 dark:text-blue-400 hover:underline"
            >
              Sign up
            </a>
          </p>
        </form>

        <div className="mt-6 flex justify-center flex-col items-center">
          {/* Hide the default Google button but keep its functionality */}
          <div style={{ height: 0, overflow: 'hidden', visibility: 'hidden' }}>
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={(error) => {
                console.error("Google login error:", error);
                setError(`Google login failed: ${error.error || error}`);
              }}
              shape="pill"
              type="standard"
              theme="filled_blue"
              text="signin_with"
              locale="en"
              useOneTap={false}
              cookiePolicy={'single_host_origin'}
              width="400"
              ux_mode="popup"
            />
          </div>
          
          {/* Custom English Google sign-in button */}
          <button
            onClick={() => {
              // Calculate window size and position for centered popup
              const width = 450;
              const height = 630;
              const left = Math.max(0, (window.innerWidth - width) / 2 + window.screenX);
              const top = Math.max(0, (window.innerHeight - height) / 2 + window.screenY);
              
              // Create a custom popup window first with our exact specifications
              const popup = window.open(
                'about:blank',
                'Google OAuth2 Login',
                `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
              );
              
              // If popup was blocked, fall back to default behavior
              if (!popup || popup.closed || typeof popup.closed === 'undefined') {
                console.log("Popup was blocked, using default behavior");
                document.querySelector('[aria-labelledby="button-label"]')?.click();
                return;
              }
              
              // Set some styles to show a loading indicator in the popup
              popup.document.write(`
                <html>
                <head>
                  <title>Google Sign In</title>
                  <style>
                    body {
                      font-family: 'Roboto', Arial, sans-serif;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      height: 100vh;
                      margin: 0;
                      background-color: #f5f5f5;
                      flex-direction: column;
                    }
                    .spinner {
                      border: 4px solid rgba(0, 0, 0, 0.1);
                      width: 36px;
                      height: 36px;
                      border-radius: 50%;
                      border-left-color: #4285F4;
                      animation: spin 1s linear infinite;
                      margin-bottom: 16px;
                    }
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                    p {
                      color: #5f6368;
                    }
                  </style>
                </head>
                <body>
                  <div class="spinner"></div>
                  <p>Connecting to Google...</p>
                </body>
                </html>
              `);
              
              // Save the original window.open function
              const originalOpen = window.open;
              
              // Override window.open to redirect Google's popup to our existing window
              window.open = function(url, name, features) {
                if (name === 'Google OAuth2 Login' || url.includes('accounts.google.com')) {
                  // Instead of opening a new window, redirect our existing popup
                  popup.location.href = url;
                  return popup;
                }
                // For any other window.open calls, use the original behavior
                return originalOpen.apply(this, arguments);
              };
              
              // Trigger the GoogleLogin click
              setTimeout(() => {
                document.querySelector('[aria-labelledby="button-label"]')?.click();
                
                // Restore original window.open after a short delay
                setTimeout(() => {
                  window.open = originalOpen;
                }, 2000);
              }, 100);
            }}
            className="flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 rounded-full px-6 py-2 font-medium hover:bg-gray-50 transition-colors"
          >
            <FaGoogle className="text-blue-500" />
            Sign in with Google
          </button>
        </div>

        {showForgotPassword && (
          <div className="mt-6 bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Reset Password</h2>
            {forgotStatus === "success" ? (
              <div className="text-green-600 dark:text-green-400">
                <p>
                  If an account with this email exists, a password reset link
                  has been sent.
                </p>
                <p className="mt-2">
                  Please check your email inbox and follow the instructions.
                </p>
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword}>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={forgotStatus === "submitting"}
                    className={`flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition ${
                      forgotStatus === "submitting"
                        ? "opacity-70 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {forgotStatus === "submitting"
                      ? "Sending..."
                      : "Send Reset Link"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
                {forgotStatus === "error" && (
                  <p className="mt-2 text-red-500">
                    Something went wrong. Please try again.
                  </p>
                )}
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
