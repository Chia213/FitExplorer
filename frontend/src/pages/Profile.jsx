import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:8000/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Loading...
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center h-screen p-6 bg-gray-100">
      {error ? (
        <h1 className="text-2xl font-bold text-red-500">{error}</h1>
      ) : user ? (
        <div className="bg-white shadow-lg rounded-lg p-6 w-96">
          <h1 className="text-3xl font-bold mb-4 text-center">
            Welcome, {user?.username}!
          </h1>
          <div className="text-lg">
            <p>
              <span className="font-semibold">Username:</span> {user?.username}
            </p>
            <p>
              <span className="font-semibold">Email:</span>{" "}
              {user?.email || "N/A"}
            </p>
          </div>

          <button
            onClick={() => navigate("/change-password")}
            className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Change Password
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
            className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      ) : (
        <h1 className="text-2xl font-bold text-red-500">User data not found</h1>
      )}
    </div>
  );
}

export default Profile;
