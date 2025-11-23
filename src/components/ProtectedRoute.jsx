import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, restaurantOnly = false }) {
  const { user, isRestaurantUser } = useAuth();

  // If not logged in, send to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (restaurantOnly && !isRestaurantUser) {
    return <Navigate to="/home" replace />;
  }

  // Otherwise render the protected component
  return children;
}
