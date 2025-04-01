import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
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

        try {
          // Try to check admin status, but don't let it block login if it fails
          await checkAdminStatus();
        } catch (adminErr) {
          console.error(
            "Error checking admin status, continuing as regular user:",
            adminErr
          );
          localStorage.setItem("isAdmin", "false");
        }

        navigate("/");
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
      console.error("Login error:", err);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleGoogleLogin = async (credentialResponse) => {
    if (!credentialResponse || !credentialResponse.credential) {
      setError("Google login failed - no credentials received");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/auth/google-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        navigate("/");
      } else {
        const errorData = await response.text();
        console.error("Google login failed:", response.status, errorData);
        setError(`Google login failed: ${response.status}`);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setError("Network error during authentication");
    }
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
            <a
              href="/signup"
              className="text-blue-500 dark:text-blue-400 hover:underline"
            >
              Sign up
            </a>
          </p>
        </form>

        <div className="mt-6 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => setError("Google login failed.")}
          />
        </div>
      </div>
    </div>
  );
}

export default Login;
