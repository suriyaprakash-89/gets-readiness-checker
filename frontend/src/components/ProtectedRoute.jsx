import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext";

const ProtectedRoute = () => {
  const { session } = useAuth();

  if (!session) {
    // If not logged in, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  // If logged in, render the child routes (the main app)
  return <Outlet />;
};

export default ProtectedRoute;
