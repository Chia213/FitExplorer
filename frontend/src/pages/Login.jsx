import { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash, FaCheckCircle, FaGoogle } from "react-icons/fa";
import { loginUser, checkAdminStatus } from "../api/auth";
import { useWelcome } from "../contexts/WelcomeContext";
import { useTheme } from "../hooks/useTheme";

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
  const { theme } = useTheme();

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

  // Initialize Apple Sign-In
  useEffect(() => {
    const initializeAppleSignIn = () => {
      if (window.AppleID && window.AppleID.auth) {
        try {
          window.AppleID.auth.init({
            clientId: 'com.fitexplorer.webapp', // Your Service ID from Apple Developer Console
            scope: 'name email',
            redirectURI: window.location.origin,
            usePopup: true
          });
          console.log('Apple Sign-In initialized successfully');
        } catch (error) {
          console.error('Apple Sign-In initialization failed:', error);
        }
      } else {
        console.log('Apple Sign-In SDK not loaded yet, retrying...');
        // Retry after a short delay
        setTimeout(initializeAppleSignIn, 1000);
      }
    };

    // Wait for Apple SDK to load
    const checkAppleSDK = () => {
      if (document.readyState === 'complete') {
        initializeAppleSignIn();
      } else {
        window.addEventListener('load', initializeAppleSignIn);
      }
    };

    checkAppleSDK();
  }, []);

  // Detect if we're in a mobile WebView (like Expo Go)
  useEffect(() => {
    const isMobileWebView = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && 
                           (window.ReactNativeWebView || window.webkit?.messageHandlers);
    
    if (isMobileWebView) {
      console.log('Detected mobile WebView environment');
      // Add mobile-specific styling or behavior
      document.body.classList.add('mobile-webview');
      
      // Show mobile-specific Google login button
      const mobileButton = document.querySelector('.mobile-webview-only');
      if (mobileButton) {
        mobileButton.style.display = 'flex';
      }
      
      // Hide the regular Google login button if it's not working
      const regularButton = document.querySelector('[aria-labelledby="button-label"]');
      if (regularButton) {
        regularButton.style.display = 'none';
      }
    }
  }, []);

  // Check for success message from location state (e.g., after registration)
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the location state to avoid showing the message multiple times
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Handle OAuth callback from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    
    if (code) {
      console.log('OAuth code received:', code);
      // Handle the OAuth code here
      handleOAuthCallback(code);
    } else if (error) {
      console.error('OAuth error:', error);
      setError(`OAuth error: ${error}`);
    }
  }, []);

  const handleOAuthCallback = async (code) => {
    try {
      setError("Processing Google login...");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      
      const response = await fetch(`${API_URL}/auth/google-oauth-callback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          code: code,
          redirect_uri: window.location.origin,
          source: 'mobile'
        }),
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        console.log("Google OAuth callback successful");
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("justLoggedIn", "true");

        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Navigate to home
        navigate("/");
      } else {
        setError(`OAuth callback failed: ${data.detail || 'Please try again'}`);
      }
    } catch (error) {
      console.error("OAuth callback error:", error);
      setError(`OAuth callback error: ${error.message}`);
    }
  };

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

  const handleAppleLogin = async () => {
    try {
      setError("Processing Apple Sign-In...");
      
      // Check if Apple Sign-In is available and initialized
      if (!window.AppleID || !window.AppleID.auth) {
        setError("Apple Sign-In is not available. Please use Google Sign-In or create an account.");
        return;
      }

      // Use Apple's real Sign-In with popup
      const response = await window.AppleID.auth.signIn();
      
      if (response && response.authorization) {
        const { authorization } = response;
        
        // Send Apple authorization to backend
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
        
        const backendResponse = await fetch(`${API_URL}/auth/apple-verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            authorization: authorization,
            source: 'mobile'
          }),
          signal: AbortSignal.timeout(15000)
        });

        const data = await backendResponse.json();

        if (backendResponse.ok && data.access_token) {
          console.log("Apple Sign-In successful");
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("token", data.access_token);
          localStorage.setItem("justLoggedIn", "true");
          
          // Clear any previous errors
          setError(null);
          
          // Navigate to home
          navigate("/");
        } else {
          setError(`Apple Sign-In failed: ${data.detail || 'Please try again'}`);
        }
      } else {
        setError("Apple Sign-In was cancelled or failed");
      }
    } catch (error) {
      console.error("Apple Sign-In error:", error);
      setError(`Apple Sign-In error: ${error.message}`);
    }
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
      
      // Show loading state while processing
      setError("Processing Google login...");
      
      const response = await fetch(`${API_URL}/auth/google-verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          token: credentialResponse.credential,
          source: 'mobile', // Add source information to help backend identify mobile logins
        }),
        // Add timeouts to prevent hanging on mobile networks
        signal: AbortSignal.timeout(15000)
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

        // Clear any previous errors
        setError(null);

        // Check if this is the first login
        const hasLoggedInBefore =
          localStorage.getItem("hasLoggedInBefore") === "true";
        if (!hasLoggedInBefore) {
          localStorage.setItem("isFirstLogin", "true");
          localStorage.setItem("hasLoggedInBefore", "true");
        }

        // Force auth state refresh before navigation
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('auth-change'));

        // Navigate to home or previous route
        const from = location.state?.from?.pathname || "/";
        navigate(from);
      } else {
        console.error(`Google login failed: Status ${response.status}`, responseText);
        setError(`Google login failed: ${data.detail || 'Please try again'}`);
      }
    } catch (error) {
      console.error("Error during Google login:", error);
      if (error.name === "AbortError") {
        setError("Google login request timed out. Please check your connection and try again.");
      } else {
        setError(`Google login error: ${error.message}`);
      }
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 rounded-xl shadow-lg w-full max-w-md mx-auto text-gray-900 dark:text-gray-100">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-4 sm:mb-6">
          Login
        </h1>

        {successMessage && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-start">
            <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
            <p className="text-green-800 dark:text-green-300 text-sm sm:text-base">
              {successMessage}
            </p>
          </div>
        )}

        {error && <p className="text-red-500 text-center mb-3 sm:mb-4 text-sm sm:text-base px-2">{error}</p>}

        {showResendVerification && (
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 mb-2">
              Need a new verification email?
            </p>
            {resendStatus === "success" ? (
              <p className="text-green-600 dark:text-green-400 text-xs sm:text-sm">
                Verification email resent! Please check your inbox.
              </p>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={handleResendVerification}
                  disabled={resendStatus === "submitting"}
                  className={`text-white bg-blue-500 px-3 py-1.5 rounded text-xs sm:text-sm ${
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
                  <span className="text-red-500 text-xs sm:text-sm">Failed to resend</span>
                )}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 
                         text-gray-900 dark:text-gray-100 text-sm sm:text-base
                         focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <div className="flex justify-between items-center">
              <label className="block text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-xs sm:text-sm text-blue-500 dark:text-blue-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 
                           text-gray-900 dark:text-gray-100 text-sm sm:text-base
                           focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
              >
                {showPassword ? <FaEyeSlash size={16} className="sm:w-5 sm:h-5" /> : <FaEye size={16} className="sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 
                       dark:bg-blue-600 dark:hover:bg-blue-700 
                       text-white font-semibold py-2.5 sm:py-2 rounded-lg 
                       transition duration-300 ease-in-out text-sm sm:text-base"
          >
            Login
          </button>

          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-blue-500 dark:text-blue-400 hover:underline"
            >
              Sign up
            </a>
          </p>
        </form>

        <div className="mt-4 sm:mt-6 relative">
          <div className="relative flex justify-center items-center">
            <hr className="w-full border-gray-300 dark:border-gray-600" />
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs sm:text-sm absolute">
              or
            </span>
          </div>

          {/* Sign in with Apple Button */}
          <div className="mt-4 sm:mt-6 flex justify-center">
            <button
              type="button"
              onClick={handleAppleLogin}
              className="bg-black hover:bg-gray-800 text-white font-semibold py-2.5 sm:py-3 px-6 sm:px-8 rounded-lg flex items-center gap-3 transition-colors text-sm sm:text-base w-full max-w-[280px] justify-center"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.96-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.03-3.11z"/>
              </svg>
              Sign in with Apple
            </button>
          </div>

          {/* Fixed Google Login Button */}
          <div className="mt-3 sm:mt-4 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                console.error("Google Login Failed");
                setError("Could not initiate Google login. Please try again.");
              }}
              useOneTap
              theme={theme === "dark" ? "filled_black" : "filled_blue"}
              shape="circle"
              text="signin_with"
              width={280}
              locale="en"
              context="signin"
            />
          </div>

          {/* Mobile WebView Google Login Button */}
          <div className="mt-3 sm:mt-4 flex justify-center mobile-webview-only" style={{ display: 'none' }}>
            <button
              type="button"
              onClick={() => {
                // For mobile WebView, try to open Google OAuth directly
                const clientId = "917960701094-3448boe93v2n4bru03t0t71n6016lbao.apps.googleusercontent.com";
                const redirectUri = window.location.origin;
                const googleOAuthUrl = `https://accounts.google.com/oauth/authorize?` +
                  `client_id=${clientId}&` +
                  `redirect_uri=${encodeURIComponent(redirectUri)}&` +
                  `response_type=code&` +
                  `scope=openid%20email%20profile&` +
                  `access_type=offline&` +
                  `prompt=consent`;
                
                console.log('Opening Google OAuth for mobile WebView:', googleOAuthUrl);
                window.location.href = googleOAuthUrl;
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg flex items-center gap-2 transition-colors text-sm sm:text-base"
            >
              <FaGoogle className="w-4 h-4 sm:w-5 sm:h-5" />
              Sign in with Google (Mobile)
            </button>
          </div>
          
          {/* Fallback for mobile devices */}
          <div className="mt-3 sm:mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                // Manually trigger Google login UI
                try {
                  const googleButton = document.querySelector('[aria-labelledby="button-label"]');
                  if (googleButton) {
                    googleButton.click();
                  } else {
                    console.error("Google button not found");
                    setError("Please try email login instead");
                  }
                } catch (err) {
                  console.error("Error clicking Google button:", err);
                }
              }}
              className="text-blue-500 text-xs sm:text-sm hover:underline"
            >
              Having trouble? Try tapping here
            </button>
          </div>
        </div>

        {showForgotPassword && (
          <div className="mt-4 sm:mt-6 bg-gray-50 dark:bg-gray-700 p-4 sm:p-6 rounded-lg">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Reset Password</h2>
            {forgotStatus === "success" ? (
              <div className="text-green-600 dark:text-green-400">
                <p className="text-sm sm:text-base">
                  If an account with this email exists, a password reset link
                  has been sent.
                </p>
                <p className="mt-2 text-sm sm:text-base">
                  Please check your email inbox and follow the instructions.
                </p>
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="mt-3 sm:mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 sm:py-2 rounded text-sm sm:text-base"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword}>
                <div className="mb-3 sm:mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1 text-sm sm:text-base">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    type="submit"
                    disabled={forgotStatus === "submitting"}
                    className={`flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 sm:py-2 rounded-lg transition text-sm sm:text-base ${
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
                    className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white py-2.5 sm:py-2 rounded-lg text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
                {forgotStatus === "error" && (
                  <p className="mt-2 text-red-500 text-sm sm:text-base">
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
