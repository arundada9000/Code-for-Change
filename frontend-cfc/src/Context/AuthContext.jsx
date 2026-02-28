import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../Services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      localStorage.removeItem("user");
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await API.get("/auth/me");
        if (response.data.success) {
          setUser(response.data.data);
          localStorage.setItem("user", JSON.stringify(response.data.data));
        }
      } catch (error) {
        // If 401, user is not logged in or cookie expired
        setUser(null);
        localStorage.removeItem("user");
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await API.post("/auth/login", { email, password });
      const { user: userData } = response.data.data;

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed. Please check your credentials."
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  const updateUserData = (newData) => {
    setUser(newData);
    localStorage.setItem("user", JSON.stringify(newData));
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    const userRole = user.role?.toLowerCase();

    // Admin, Super Admin have all permissions
    if (userRole === "admin" || userRole === "superadmin") {
      return true;
    }

    // EB tech-lead gets admin-level access
    if (userRole === "eb" && user.executiveDetails?.position === "tech-lead") {
      return true;
    }

    // Check for specific permission override in user object
    if (user.permissions?.includes(permission)) {
      return true;
    }

    // Basic role-based permission check (if available in frontend)
    // For now, we mainly rely on the backend for enforcement, 
    // but this helper allows UI-level hiding of buttons.
    return false;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUserData,
    hasPermission,
    isAuthenticated: !!user,
    isAdmin: ["admin", "superadmin"].includes(user?.role?.toLowerCase()) ||
      (user?.role?.toLowerCase() === "eb" && user?.executiveDetails?.position === "tech-lead"),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
