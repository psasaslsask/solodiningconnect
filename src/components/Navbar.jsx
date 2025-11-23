import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/home" className="text-xl font-bold text-blue-600">
          SoloDiningConnect
        </Link>

        <nav className="flex space-x-6 text-gray-700 font-medium">
          {user ? (
            <>
              <Link to="/home">Home</Link>
              <Link to="/restaurant-dashboard">Restaurant Dashboard</Link>
              <Link to="/profile">Profile</Link>
              <button onClick={logout} className="text-red-500">Logout</button>
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
