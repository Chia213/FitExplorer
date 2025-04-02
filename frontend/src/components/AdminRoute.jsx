import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const AdminRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdminStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_URL}/admin/stats/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          setIsAdmin(true);
          localStorage.setItem("isAdmin", "true");
        } else if (response.status === 403) {
          setIsAdmin(false);
          localStorage.setItem("isAdmin", "false");
          navigate("/");
        } else {
          setIsAdmin(false);
          localStorage.setItem("isAdmin", "false");
          navigate("/");
        }
      } catch (error) {
        setIsAdmin(false);
        localStorage.setItem("isAdmin", "false");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    verifyAdminStatus();
  }, [navigate]);
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
