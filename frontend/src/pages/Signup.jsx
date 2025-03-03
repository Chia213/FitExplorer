import React, { useState } from "react";
import { registerUser } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    setSuccess(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await registerUser(
        formData.email,
        formData.password,
        formData.username
      );

      if (response.message === "User registered successfully") {
        setSuccess("Account created! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(response.detail || "Failed to register.");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md mx-auto text-gray-900 dark:text-gray-100">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100">
          Sign Up
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mt-2">
          Create your account
        </p>

        {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        {success && (
          <p className="text-green-500 text-center mt-2">{success}</p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              required
              className="w-full px-4 py-2 mt-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 
                         text-gray-900 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
              className="w-full px-4 py-2 mt-2 border border-gray-300 dark:border-gray-600 rounded-lg 
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
              placeholder="Enter password"
              required
              className="w-full px-4 py-2 mt-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 
                         text-gray-900 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>

          <div className="relative">
            <label className="block text-gray-700 dark:text-gray-300 font-medium">
              Confirm Password
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              className="w-full px-4 py-2 mt-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 
                         text-gray-900 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
            >
              {showConfirmPassword ? (
                <FaEyeSlash size={20} />
              ) : (
                <FaEye size={20} />
              )}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 
                       dark:bg-blue-600 dark:hover:bg-blue-700 
                       text-white font-semibold py-2 rounded-lg 
                       transition duration-300 ease-in-out"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-gray-500 dark:text-gray-400 mt-4">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-blue-500 dark:text-blue-400 hover:underline"
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}

export default Signup;
