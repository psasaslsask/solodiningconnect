import React from "react";
import HomePage from "./HomePage";
import RestaurantHomePage from "./RestaurantHomePage";
import { useAuth } from "../context/AuthContext";

export default function HomeRouter() {
  const { isRestaurantUser } = useAuth();

  if (isRestaurantUser) {
    return <RestaurantHomePage />;
  }

  return <HomePage />;
}
