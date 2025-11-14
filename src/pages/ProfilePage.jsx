import React from "react";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { profile, user, logout } = useAuth();

  // Handle cases where Firebase is still loading the user
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-2xl shadow-md max-w-md mx-auto text-center">
        <img
          src={profile?.image || "/images/default-avatar.png"}
          alt={profile?.name || "User"}
          className="w-24 h-24 mx-auto rounded-full mb-4 object-cover"
        />
        <h1 className="text-2xl font-bold text-blue-600">
          {profile?.name || user.email}
        </h1>
        <p className="text-gray-500 mb-4">
          {profile?.location || "Location not set"}
        </p>

        {profile && (
          <>
            <p className="text-gray-600 text-sm italic mb-1">{profile.style}</p>
            <p className="text-gray-600 text-sm mb-1">
              Favorite Cuisine: {profile.favoriteCuisine}
            </p>
            <p className="text-gray-600 text-sm">
              Solo Style: {profile.soloStyle?.join(", ")}
            </p>
          </>
        )}

        <button
          onClick={logout}
          className="mt-6 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
