import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaExclamationCircle,
  FaCheckCircle,
} from "react-icons/fa";
import { useWelcome } from "../contexts/WelcomeContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("idle"); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Import the welcome context to trigger the welcome modal for new users
  const { triggerWelcomeModal } = useWelcome();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Password validation
    if (name === "password") {
      validatePassword(value);
    }

    // Match passwords
    if (
      name === "confirmPassword" ||
      (name === "password" && formData.confirmPassword)
    ) {
      const otherField =
        name === "confirmPassword" ? "password" : "confirmPassword";
      const otherValue =
        name === "confirmPassword"
          ? formData.password
          : formData.confirmPassword;

      if (value !== otherValue) {
        setFormErrors((prev) => ({
          ...prev,
          [otherField]: "Passwords do not match",
        }));
      } else {
        setFormErrors((prev) => ({ ...prev, [otherField]: "" }));
      }
    }
  };

  const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    setFormErrors((prev) => ({
      ...prev,
      password: errors.length > 0 ? errors : "",
    }));
    return errors.length === 0;
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else {
      const passwordValid = validatePassword(formData.password);
      if (!passwordValid) {
        errors.password = formErrors.password;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to register");
      }

      setSubmitStatus("success");

      // Set first login flag and trigger welcome modal on login
      localStorage.setItem("isFirstLogin", "true");

      // Redirect to verification message page or login
      setTimeout(() => {
        navigate("/login", {
          state: {
            message:
              "Registration successful! Please check your email to verify your account before logging in.",
            type: "success",
          },
        });
      }, 2000);
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(
        error.message || "Registration failed. Please try again."
      );
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === "password") {
      setShowPassword((prev) => !prev);
    } else {
      setShowConfirmPassword((prev) => !prev);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 rounded-xl shadow-lg w-full max-w-md mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-4 sm:mb-6">
          Create Account
        </h1>

        {submitStatus === "error" && (
          <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 px-3 sm:px-4 py-2.5 sm:py-3 rounded mb-3 sm:mb-4">
            <p className="flex items-center text-sm sm:text-base">
              <FaExclamationCircle className="mr-2 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> {errorMessage}
            </p>
          </div>
        )}

        {submitStatus === "success" && (
          <div className="bg-green-100 border border-green-400 text-green-700 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 px-3 sm:px-4 py-2.5 sm:py-3 rounded mb-3 sm:mb-4">
            <p className="flex items-center text-sm sm:text-base">
              <FaCheckCircle className="mr-2 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> Registration successful!
              Redirecting you to login...
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1 text-sm sm:text-base">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={
                submitStatus === "loading" || submitStatus === "success"
              }
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
              placeholder="Choose a username"
            />
            {formErrors.username && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">{formErrors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1 text-sm sm:text-base">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={
                submitStatus === "loading" || submitStatus === "success"
              }
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
              placeholder="Enter your email"
            />
            {formErrors.email && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">{formErrors.email}</p>
            )}
          </div>

          <div className="relative">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1 text-sm sm:text-base">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={
                  submitStatus === "loading" || submitStatus === "success"
                }
                className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("password")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
              >
                {showPassword ? <FaEyeSlash size={16} className="sm:w-5 sm:h-5" /> : <FaEye size={16} className="sm:w-5 sm:h-5" />}
              </button>
            </div>
            {formErrors.password && Array.isArray(formErrors.password) ? (
              <ul className="text-red-500 text-xs sm:text-sm mt-1 list-disc pl-4 sm:pl-5">
                {formErrors.password.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            ) : formErrors.password ? (
              <p className="text-red-500 text-xs sm:text-sm mt-1">{formErrors.password}</p>
            ) : null}
          </div>

          <div className="relative">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1 text-sm sm:text-base">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={
                  submitStatus === "loading" || submitStatus === "success"
                }
                className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
              >
                {showConfirmPassword ? <FaEyeSlash size={16} className="sm:w-5 sm:h-5" /> : <FaEye size={16} className="sm:w-5 sm:h-5" />}
              </button>
            </div>
            {formErrors.confirmPassword && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {formErrors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitStatus === "loading" || submitStatus === "success"}
            className={`w-full py-2.5 sm:py-2 text-white font-medium rounded-lg text-sm sm:text-base ${
              submitStatus === "loading" || submitStatus === "success"
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            } transition duration-300`}
          >
            {submitStatus === "loading" ? "Signing Up..." : "Sign Up"}
          </button>

          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-blue-500 dark:text-blue-400 hover:underline"
            >
              Log in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;
