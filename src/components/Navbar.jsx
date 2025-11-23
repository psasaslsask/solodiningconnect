import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, isRestaurantUser } = useAuth();

  return (
    <header className="bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/home" className="text-xl font-semibold text-slate-900">
          SoloDiningConnect
        </Link>

        <nav className="flex space-x-6 text-slate-700 font-medium">
          {user ? (
            <>
              <Link to="/home">{isRestaurantUser ? "Restaurant Home" : "Home"}</Link>
              {isRestaurantUser ? (
                <Link to="/restaurant-dashboard">Dashboard</Link>
              ) : (
                <>
                  <Link to="/restaurants">Restaurants</Link>
                  <Link to="/bookings">My Bookings</Link>
                </>
              )}
              <Link to="/profile">Profile</Link>
              <button
                onClick={logout}
                className="text-sm font-semibold text-slate-600 border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-50 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
