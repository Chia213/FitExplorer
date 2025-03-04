import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:8000/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    const data = await response.json();
    if (response.ok) {
      setMessage("Password updated successfully!");
      setTimeout(() => navigate("/profile"), 2000);
    } else {
      setMessage(data.error || "Failed to update password");
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center h-screen ${
        theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      <div
        className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-96 ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Change Password</h1>
        {message && <p className="text-center text-red-500">{message}</p>}
        <form onSubmit={handlePasswordChange} className="flex flex-col">
          <label className="font-semibold">Old Password:</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="border p-2 rounded mb-3"
            required
          />

          <label className="font-semibold">New Password:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border p-2 rounded mb-3"
            required
          />

          <button
            type="submit"
            className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Update Password
          </button>
        </form>

        <button
          onClick={() => navigate("/profile")}
          className="mt-4 w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default ChangePassword;
