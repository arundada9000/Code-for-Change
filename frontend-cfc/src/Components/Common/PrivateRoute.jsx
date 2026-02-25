import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

const PrivateRoute = ({ adminOnly = false }) => {
  const { user, isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
