import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { loginUser } from "../api/auth";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const state = params.get('state');
    
    if (code && state) {
      const processGoogleCallback = async () => {
        try {
          console.log('Callback URL:', `${import.meta.env.VITE_API_URL}/auth/callback?code=${code}&state=${state}`);
          
          const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/callback?code=${code}&state=${state}`);
  
          console.log('Response status:', res.status);
          
          if (res.ok) {
            const data = await res.json();
            console.log('Received data:', data);
            localStorage.setItem("token", data.access_token);
            navigate("/profile");
          } else {
            const errorData = await res.text();
            console.error("Google login failed:", res.status, errorData);
            setError(`Google login failed: ${errorData}`);
          }
        } catch (error) {
          console.error("Authentication error:", error);
          setError(`Something went wrong: ${error.message}`);
        }
      };
      
      processGoogleCallback();
    }
  }, [location, navigate]);

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
        localStorage.setItem("token", response.access_token);
        navigate("/");
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
      console.error("Login error:", err);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/login/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md mx-auto text-gray-900 dark:text-gray-100">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
          Login
        </h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

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
            <label className="block text-gray-700 dark:text-gray-300 font-medium">
              Password
            </label>
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
            <a href="/signup"
              className="text-blue-500 dark:text-blue-400 hover:underline"
            >
              Sign up
            </a>
          </p>
        </form>

        <div className="mt-6">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-700 
                     border border-gray-300 dark:border-gray-600 rounded-lg 
                     py-2 px-4 text-gray-700 dark:text-gray-200 
                     hover:bg-gray-100 dark:hover:bg-gray-600 
                     transition duration-300 ease-in-out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Login with Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;