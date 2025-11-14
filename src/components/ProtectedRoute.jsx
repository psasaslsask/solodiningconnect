import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  // If not logged in, send to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise render the protected component
  return children;
}
