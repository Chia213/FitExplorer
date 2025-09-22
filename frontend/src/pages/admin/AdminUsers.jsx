import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaArrowLeft,
  FaStar,
  FaRegStar,
  FaCheck,
  FaTimes,
  FaSearch,
  FaTimesCircle,
  FaGoogle,
  FaApple,
  FaSort,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaEnvelope,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaFileExport,
  FaSync,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useTheme } from "../../hooks/useTheme"; // Assuming you have a theme hook

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function AdminUsers() {
  // Core state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Selection and modals
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Search and filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("username");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterVerified, setFilterVerified] = useState("all");
  const [filterAdmin, setFilterAdmin] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  // Form data for user create/edit
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    is_admin: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { theme } = useTheme || { theme: "light" }; // Fallback if hook isn't available

  // Fetch users data
  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setRefreshing(true);

      const response = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 403) {
          setError("You don't have admin privileges to access this page.");
          setTimeout(() => navigate("/"), 3000);
          return;
        }
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      
      // Debug: Log the first user to see verification status
      if (data.length > 0) {
        console.log("First user data:", data[0]);
        console.log("Verification status type:", typeof data[0].is_verified);
        console.log("Verification status value:", data[0].is_verified);
      }
      
      // Normalize the is_verified field to a boolean for all users
      const normalizedUsers = data.map(user => {
        // Debug the entire user object
        console.log("Complete user object:", user);
        console.log("All user properties:", Object.keys(user));
        
        // Get user email domain and check for Gmail
        const emailDomain = user.email ? user.email.split('@')[1]?.toLowerCase() : '';
        const isGoogleUser = emailDomain === 'gmail.com' || emailDomain === 'googlemail.com';
        
        // Create normalized user object
        return {
          ...user,
          // Add OAuth provider field if it's a Gmail account
          oauth_provider: isGoogleUser ? "google" : null,
          // Add is_verified field (defaults to false if not present in the original data)
          is_verified: user.is_admin || isGoogleUser || Boolean(user.is_verified)
        };
      });
      
      setUsers(normalizedUsers);
      
      // Debug: Log the final normalized users
      if (normalizedUsers.length > 0) {
        console.log("First normalized user:", normalizedUsers[0]);
        console.log("Final is_verified value:", normalizedUsers[0].is_verified);
        console.log("OAuth provider:", normalizedUsers[0].oauth_provider);
      }
      
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message || "An error occurred while fetching users");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  // Initial data load
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Handle search input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle sort change
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Toggle admin status
  const toggleAdminStatus = async (userId, makeAdmin) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const endpoint = makeAdmin
        ? `${API_URL}/admin/users/${userId}/make-admin`
        : `${API_URL}/admin/users/${userId}/remove-admin`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to update admin status");

      // Update the users list with the new admin status
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, is_admin: makeAdmin } : user
        )
      );

      setNotification({
        type: "success",
        message: `User is ${makeAdmin ? "now an admin" : "no longer an admin"}`,
      });
    } catch (err) {
      console.error("Error updating admin status:", err);
      setNotification({
        type: "error",
        message: "Failed to update admin status",
      });
    }
  };

  // Toggle verification status
  const toggleVerificationStatus = async (userId, isVerified) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Find the user to update
      const userToUpdate = users.find(user => user.id === userId);
      if (!userToUpdate) {
        throw new Error("User not found");
      }

      // Call the API endpoint to toggle verification
      const response = await fetch(`${API_URL}/admin/users/${userId}/toggle-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          is_verified: isVerified
        }),
      });

      if (!response.ok) throw new Error("Failed to update verification status");

      // Update the users list with the new verification status
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, is_verified: isVerified } : user
        )
      );

      setNotification({
        type: "success",
        message: `User verification status updated to ${isVerified ? "verified" : "unverified"}`,
      });
    } catch (err) {
      console.error("Error updating verification status:", err);
      setNotification({
        type: "error",
        message: err.message || "Failed to update verification status",
      });
    }
  };

  // Open user edit modal
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      confirmPassword: "",
      is_admin: user.is_admin,
    });
    setShowUserModal(true);
  };

  // Open user delete confirmation
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Open user create modal
  const handleCreateUser = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      is_admin: false,
    });
    setShowCreateModal(true);
  };

  // Handle reset password
  const handleResetPassword = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      confirmPassword: "",
      is_admin: user.is_admin,
    });
    setShowPasswordModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle password update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!formData.password) {
      setNotification({
        type: "error",
        message: "Password is required",
      });
      return;
    }

    // Add validation for password length
    if (formData.password.length < 8) {
      setNotification({
        type: "error",
        message: "Password must be at least 8 characters long",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setNotification({
        type: "error",
        message: "Passwords do not match",
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Use existing admin reset password endpoint
      const response = await fetch(`${API_URL}/admin/users/${selectedUser.id}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === 'string' 
            ? data.detail 
            : 'Failed to reset password'
        );
      }

      setShowPasswordModal(false);
      setFormData({
        ...formData,
        password: "",
        confirmPassword: ""
      });
      
      setNotification({
        type: "success",
        message: "Password reset successfully",
      });
      
      // Refresh the users list
      fetchUsers();
    } catch (err) {
      console.error("Error resetting password:", err);
      setNotification({
        type: "error",
        message: err.message || "Failed to reset password",
      });
    }
  };

  // Save user (create or update)
  const handleSaveUser = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.username || !formData.email) {
      setNotification({
        type: "error",
        message: "Username and email are required",
      });
      return;
    }

    if (showCreateModal && !formData.password) {
      setNotification({
        type: "error",
        message: "Password is required for new users",
      });
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setNotification({
        type: "error",
        message: "Passwords do not match",
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Prepare user data
      const userData = {
        username: formData.username,
        email: formData.email,
        is_admin: formData.is_admin,
      };

      // Only include password if it was provided
      if (formData.password) {
        userData.password = formData.password;
      }

      let response;

      if (showCreateModal) {
        // Create new user
        response = await fetch(`${API_URL}/admin/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userData),
        });
      } else {
        // Update existing user
        response = await fetch(`${API_URL}/admin/users/${selectedUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save user");
      }

      // Refresh user list
      fetchUsers();

      // Close modals
      setShowUserModal(false);
      setShowCreateModal(false);

      // For immediate UI feedback, if we're creating a user, add it to the users list
      // with verified status until the fetchUsers completes
      if (showCreateModal) {
        const responseData = await response.json().catch(() => ({}));
        const newUser = {
          ...responseData,
          // Admin-created users are automatically verified
          is_verified: true,
          oauth_provider: null
        };
        
        // Temporarily add the new user to the list
        setUsers(prevUsers => [...prevUsers, newUser]);
      }

      setNotification({
        type: "success",
        message: showCreateModal
          ? "User created successfully"
          : "User updated successfully",
      });
    } catch (err) {
      console.error("Error saving user:", err);
      setNotification({
        type: "error",
        message: err.message || "Failed to save user",
      });
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `${API_URL}/admin/users/${selectedUser.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete user");
      }

      // Remove user from state
      setUsers(users.filter((user) => user.id !== selectedUser.id));
      setShowDeleteModal(false);
      setNotification({
        type: "success",
        message: "User deleted successfully",
      });
    } catch (err) {
      console.error("Error deleting user:", err);
      setNotification({
        type: "error",
        message: err.message || "Failed to delete user",
      });
    }
  };

  // Export users to CSV
  const handleExportUsers = () => {
    try {
      // Create CSV content
      let csvContent = "ID,Username,Email,Join Date,Workouts,Verified,Admin\n";

      filteredUsers.forEach((user) => {
        const row = [
          user.id,
          `"${user.username}"`,
          user.email,
          user.created_at || "",
          user.workout_count || 0,
          user.is_verified ? "Yes" : "No",
          user.is_admin ? "Yes" : "No",
        ].join(",");
        csvContent += row + "\n";
      });

      // Create download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `users_export_${new Date().toISOString().slice(0, 10)}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setNotification({
        type: "success",
        message: "Users exported successfully",
      });
    } catch (err) {
      console.error("Error exporting users:", err);
      setNotification({
        type: "error",
        message: "Failed to export users",
      });
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  // Filter users based on search query and filters
  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (user) =>
          user.username.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }

    // Apply verification filter
    if (filterVerified !== "all") {
      if (filterVerified === "google") {
        result = result.filter((user) => user.oauth_provider === "google");
      } else if (filterVerified === "apple") {
        result = result.filter((user) => user.oauth_provider === "apple");
      } else if (filterVerified === "google_mobile") {
        result = result.filter((user) => user.signup_method === "google_mobile");
      } else if (filterVerified === "google_desktop") {
        result = result.filter((user) => user.signup_method === "google_desktop");
      } else if (filterVerified === "apple_mobile") {
        result = result.filter((user) => user.signup_method === "apple_mobile");
      } else if (filterVerified === "apple_desktop") {
        result = result.filter((user) => user.signup_method === "apple_desktop");
      } else if (filterVerified === "verified") {
        result = result.filter(
          (user) => user.is_verified === true && !user.oauth_provider
        );
      } else if (filterVerified === "unverified") {
        result = result.filter(
          (user) => user.is_verified === false && !user.oauth_provider
        );
      } else if (filterVerified === "oauth") {
        result = result.filter(
          (user) => user.oauth_provider === "google" || user.oauth_provider === "apple"
        );
      } else if (filterVerified === "mobile") {
        result = result.filter(
          (user) => user.signup_method?.includes('mobile')
        );
      } else if (filterVerified === "desktop") {
        result = result.filter(
          (user) => user.signup_method?.includes('desktop')
        );
      }
    }

    // Apply admin filter
    if (filterAdmin !== "all") {
      result = result.filter((user) => 
        filterAdmin === "admin" ? user.is_admin : !user.is_admin
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let valueA = a[sortField];
      let valueB = b[sortField];

      // Handle special cases for dates and strings
      if (sortField === "created_at" || sortField === "last_login") {
        valueA = new Date(valueA || 0).getTime();
        valueB = new Date(valueB || 0).getTime();
      } else if (typeof valueA === "string") {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      // Apply direction
      return sortDirection === "asc" 
        ? (valueA > valueB ? 1 : -1)
        : (valueA < valueB ? 1 : -1);
    });

    return result;
  }, [users, searchQuery, sortField, sortDirection, filterVerified, filterAdmin]);

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white mb-2"
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold">User Management</h1>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={handleCreateUser}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-3 py-2 rounded-md text-sm sm:text-base"
          >
            <FaUserPlus /> <span className="hidden sm:inline">New User</span>
          </button>

          <button
            onClick={handleExportUsers}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm sm:text-base"
          >
            <FaFileExport /> <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={fetchUsers}
            disabled={refreshing}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-md disabled:opacity-50 text-sm sm:text-base"
          >
            <FaSync className={refreshing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* User Status Legend */}
      <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center">
          <span className="inline-block w-3 h-3 mr-1 bg-green-100 dark:bg-green-900 rounded-full"></span>
          <span className="hidden sm:inline">Email Verified: User has confirmed their email</span>
          <span className="sm:hidden">Verified</span>
        </span>
        <span className="flex items-center">
          <span className="inline-block w-3 h-3 mr-1 bg-red-100 dark:bg-red-900 rounded-full"></span>
          <span className="hidden sm:inline">Not Verified: User has not confirmed their email</span>
          <span className="sm:hidden">Unverified</span>
        </span>
        <span className="flex items-center">
          <span className="inline-block w-3 h-3 mr-1 bg-blue-100 dark:bg-blue-900 rounded-full"></span>
          <span className="hidden sm:inline">Google User (Verified): Authenticated via Google OAuth</span>
          <span className="sm:hidden">Google</span>
        </span>
        <span className="flex items-center">
          <span className="inline-block w-3 h-3 mr-1 bg-green-100 dark:bg-green-900 rounded-full"></span>
          <span className="hidden sm:inline">Admin-Created: Users created by admins are automatically verified</span>
          <span className="sm:hidden">Admin</span>
        </span>
        <span className="flex items-center">
          <FaCheckCircle className="mr-1 text-green-600" />
          <FaTimesCircle className="mr-1 text-red-600" />
          <span className="hidden sm:inline">Verification toggle buttons (demo only - changes lost on refresh)</span>
          <span className="sm:hidden">Toggle</span>
        </span>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`mb-4 p-4 rounded-md flex items-start justify-between ${
            notification.type === "success"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
          }`}
        >
          <div className="flex items-center">
            {notification.type === "success" ? (
              <FaCheckCircle className="mr-2" />
            ) : (
              <FaExclamationTriangle className="mr-2" />
            )}
            <p>{notification.message}</p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 dark:bg-red-900/30 dark:text-red-200 dark:border-red-500 p-4 rounded-md mb-6">
          <div className="flex items-center">
            <FaExclamationTriangle className="mr-2" />
            <p className="font-bold">Error</p>
          </div>
          <p>{error}</p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative sm:col-span-2 lg:col-span-2">
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>

          <div>
            <select
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            >
              <option value="all">All Users</option>
              <option value="verified">Email Verified</option>
              <option value="unverified">Email Unverified</option>
              <option value="google">Google Users</option>
              <option value="apple">Apple Users</option>
              <option value="oauth">All OAuth Users</option>
              <option value="mobile">Mobile Signups</option>
              <option value="desktop">Desktop Signups</option>
              <option value="google_mobile">Google Mobile</option>
              <option value="google_desktop">Google Desktop</option>
              <option value="apple_mobile">Apple Mobile</option>
              <option value="apple_desktop">Apple Desktop</option>
            </select>
          </div>

          <div>
            <select
              value={filterAdmin}
              onChange={(e) => setFilterAdmin(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="regular">Regular Users</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {/* User column with sort */}
                <th
                  scope="col"
                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("username")}
                >
                  <div className="flex items-center">
                    <span>User</span>
                    {sortField === "username" &&
                      (sortDirection === "asc" ? (
                        <FaSortAmountUp className="ml-1" />
                      ) : (
                        <FaSortAmountDown className="ml-1" />
                      ))}
                  </div>
                </th>

                {/* Email column with sort - hidden on mobile */}
                <th
                  scope="col"
                  className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("email")}
                >
                  <div className="flex items-center">
                    <span>Email</span>
                    {sortField === "email" &&
                      (sortDirection === "asc" ? (
                        <FaSortAmountUp className="ml-1" />
                      ) : (
                        <FaSortAmountDown className="ml-1" />
                      ))}
                  </div>
                </th>

                {/* Join Date column with sort - hidden on mobile */}
                <th
                  scope="col"
                  className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("created_at")}
                >
                  <div className="flex items-center">
                    <span>Join Date</span>
                    {sortField === "created_at" &&
                      (sortDirection === "asc" ? (
                        <FaSortAmountUp className="ml-1" />
                      ) : (
                        <FaSortAmountDown className="ml-1" />
                      ))}
                  </div>
                </th>

                {/* Workouts column with sort - hidden on mobile */}
                <th
                  scope="col"
                  className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("workout_count")}
                >
                  <div className="flex items-center">
                    <span>Workouts</span>
                    {sortField === "workout_count" &&
                      (sortDirection === "asc" ? (
                        <FaSortAmountUp className="ml-1" />
                      ) : (
                        <FaSortAmountDown className="ml-1" />
                      ))}
                  </div>
                </th>

                <th
                  scope="col"
                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Status
                </th>

                <th
                  scope="col"
                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {currentUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <FaUser className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm" />
                      </div>
                      <div className="ml-2 sm:ml-4">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                          {user.username}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {user.id}
                        </div>
                        {/* Show email on mobile */}
                        <div className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  {/* Email column - hidden on mobile */}
                  <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {user.email}
                    </div>
                  </td>
                  {/* Join Date column - hidden on mobile */}
                  <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatDate(user.created_at)}
                    </div>
                  </td>
                  {/* Workouts column - hidden on mobile */}
                  <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {user.workout_count}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.oauth_provider === "google"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : user.oauth_provider === "apple"
                            ? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                            : user.is_verified
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {user.oauth_provider === "google" ? (
                          <>
                            <FaGoogle className="mr-1" />
                            <span className="hidden sm:inline">
                              Google {user.signup_method?.includes('mobile') ? '(Mobile)' : '(Desktop)'}
                            </span>
                            <span className="sm:hidden">Google</span>
                          </>
                        ) : user.oauth_provider === "apple" ? (
                          <>
                            <FaApple className="mr-1" />
                            <span className="hidden sm:inline">
                              Apple {user.signup_method?.includes('mobile') ? '(Mobile)' : '(Desktop)'}
                            </span>
                            <span className="sm:hidden">Apple</span>
                          </>
                        ) : user.is_verified ? (
                          <>
                            <FaCheckCircle className="mr-1" />
                            <span className="hidden sm:inline">Email Verified</span>
                            <span className="sm:hidden">Verified</span>
                          </>
                        ) : (
                          <>
                            <FaTimesCircle className="mr-1" />
                            <span className="hidden sm:inline">Not Verified</span>
                            <span className="sm:hidden">Unverified</span>
                          </>
                        )}
                      </span>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.is_admin
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {user.is_admin ? (
                          <FaCheck className="mr-1" />
                        ) : (
                          <FaTimes className="mr-1" />
                        )}
                        {user.is_admin ? "Admin" : "User"}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1 sm:space-x-3">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                        title="Edit user"
                      >
                        <FaEdit className="text-sm sm:text-base" />
                      </button>

                      <button
                        onClick={() => handleResetPassword(user)}
                        className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 p-1"
                        title="Reset password"
                      >
                        <FaKey className="text-sm sm:text-base" />
                      </button>

                      {user.is_admin ? (
                        <button
                          onClick={() => toggleAdminStatus(user.id, false)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                          title="Remove admin privileges"
                        >
                          <FaRegStar className="text-sm sm:text-base" />
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleAdminStatus(user.id, true)}
                          className="text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/80 p-1"
                          title="Make admin"
                        >
                          <FaStar className="text-sm sm:text-base" />
                        </button>
                      )}

                      {user.oauth_provider !== "google" && (
                        user.is_verified ? (
                          <button
                            onClick={() => toggleVerificationStatus(user.id, false)}
                            className="text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/80 flex items-center border border-primary/30 rounded-md px-1 py-0.5 sm:px-2 sm:py-1"
                            title="Mark as unverified"
                          >
                            <FaCheckCircle className="mr-1 text-xs" />
                            <span className="text-xs hidden sm:inline">Verified</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleVerificationStatus(user.id, true)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 flex items-center border border-red-300 rounded-md px-1 py-0.5 sm:px-2 sm:py-1"
                            title="Mark as verified"
                          >
                            <FaTimesCircle className="mr-1 text-xs" />
                            <span className="text-xs hidden sm:inline">Verify</span>
                          </button>
                        )
                      )}

                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                        title="Delete user"
                      >
                        <FaTrash className="text-sm sm:text-base" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {currentUsers.length === 0 && (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            {filteredUsers.length === 0 ? (
              searchQuery ? (
                <>
                  <p className="text-lg mb-2">
                    No users match your search criteria
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <p className="text-lg">No users found in the system</p>
              )
            ) : (
              <p className="text-lg">No users on this page</p>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <div className="flex justify-between items-center bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-md">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{indexOfFirstUser + 1}</span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(indexOfLastUser, filteredUsers.length)}
            </span>{" "}
            of <span className="font-medium">{filteredUsers.length}</span> users
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
            >
              Previous
            </button>

            <div className="hidden md:flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Calculate page numbers to show based on current page
                let pageNum;
                if (totalPages <= 5 || currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return pageNum <= totalPages ? (
                  <button
                    key={i}
                    onClick={() => paginate(pageNum)}
                    className={`px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md ${
                      currentPage === pageNum
                        ? "bg-blue-500 text-white border-blue-500 dark:border-blue-600"
                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {pageNum}
                  </button>
                ) : null;
              })}
            </div>

            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit User</h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSaveUser}>
              <div className="mb-4">
                <label
                  className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                  htmlFor="username"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_admin"
                    checked={formData.is_admin}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300 text-sm font-bold">
                    Admin Privileges
                  </span>
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Delete User</h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FaTimes />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Are you sure you want to delete the user:
              </p>
              <p className="font-bold text-gray-900 dark:text-white">
                {selectedUser.username} ({selectedUser.email})
              </p>
              <p className="text-red-600 dark:text-red-400 mt-4 text-sm">
                This action cannot be undone. All user data will be permanently
                removed.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create New User</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSaveUser}>
              <div className="mb-4">
                <label
                  className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                  htmlFor="create-username"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="create-username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                  htmlFor="create-email"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="create-email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                  htmlFor="create-password"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="create-password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                  htmlFor="create-confirm-password"
                >
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="create-confirm-password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_admin"
                    checked={formData.is_admin}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300 text-sm font-bold">
                    Admin Privileges
                  </span>
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Reset Password</h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleUpdatePassword}>
              <div className="mb-2">
                <p className="text-gray-700 dark:text-gray-300">
                  Reset password for:{" "}
                  <span className="font-bold">{selectedUser.username}</span>
                </p>
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                  htmlFor="reset-password"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="reset-password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline pr-10"
                    required
                    minLength={8}
                    placeholder="Minimum 8 characters"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                  htmlFor="reset-confirm-password"
                >
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="reset-confirm-password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
