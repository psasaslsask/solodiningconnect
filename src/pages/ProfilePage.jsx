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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50 px-4 py-10">
      <div className="max-w-xl mx-auto bg-white/80 backdrop-blur border border-slate-100 rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 via-sky-500 to-cyan-400 h-28" />
        <div className="-mt-14 px-8 pb-8 text-center">
          <img
            src={profile?.image || "/images/default-avatar.png"}
            alt={profile?.name || "User"}
            className="w-28 h-28 mx-auto rounded-full border-4 border-white shadow-xl object-cover"
          />
          <h1 className="text-3xl font-black text-slate-900 mt-4">{profile?.name || user.email}</h1>
          <p className="text-slate-500">{profile?.location || "Location not set"}</p>

          {profile && (
            <div className="mt-4 space-y-1 text-slate-700">
              <p className="text-sm italic">{profile.style}</p>
              <p className="text-sm">Favorite cuisine: {profile.favoriteCuisine}</p>
              <p className="text-sm">Solo style: {profile.soloStyle?.join(", ")}</p>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <button
              onClick={logout}
              className="bg-rose-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-rose-600 transition shadow-md"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
