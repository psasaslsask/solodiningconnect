import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

export default function ProfilePage() {
  const { profile, user, logout, isRestaurantUser } = useAuth();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [style, setStyle] = useState("");
  const [favoriteCuisine, setFavoriteCuisine] = useState("");
  const [soloStyle, setSoloStyle] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const isDiner = !!profile && !isRestaurantUser;

  useEffect(() => {
    if (!profile) return;
    setName(profile.name || "");
    setLocation(profile.location || "");
    setStyle(profile.style || "");
    setFavoriteCuisine(profile.favoriteCuisine || "");
    setSoloStyle(profile.soloStyle?.join(", ") || "");
    setBio(profile.bio || "");
  }, [profile]);

  const avatar = useMemo(() => profile?.image || "/images/default-avatar.png", [profile]);
  const displayName = name || profile?.name || user?.email;
  const displayLocation = location || profile?.location || "Location not set";

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user || !profile) return;
    setSaving(true);
    setSavedAt(null);

    const soloStyleArr = soloStyle
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const dinerDocId = user.uid || String(profile.id);

    try {
      await setDoc(
        doc(db, "diners", dinerDocId),
        {
          name,
          location,
          style,
          favoriteCuisine,
          soloStyle: soloStyleArr,
          bio,
          email: profile.email || user.email,
          image: avatar,
          budget: profile.budget || "$$",
          createdAt: profile.createdAt || new Date(),
        },
        { merge: true }
      );
      setSavedAt(new Date());
    } catch (error) {
      alert("Could not save profile. Please try again.");
      console.error("Profile save error", error);
    } finally {
      setSaving(false);
    }
  };

  // Handle cases where Firebase is still loading the user
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Loading profile...
      </div>
    );
  }

  if (isRestaurantUser) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Restaurant accounts do not have editable diner profiles.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="bg-slate-900 h-28" />
        <div className="-mt-14 px-8 pb-8 text-center">
          <img
            src={avatar}
            alt={displayName}
            className="w-28 h-28 mx-auto rounded-full border-4 border-white shadow-xl object-cover"
          />
          <h1 className="text-3xl font-black text-slate-900 mt-4">{displayName}</h1>
          <p className="text-slate-500">{displayLocation}</p>

          {isDiner && (
            <div className="mt-4 space-y-1 text-slate-700">
              <p className="text-sm italic">{style || "Solo dining vibe not set"}</p>
              <p className="text-sm">Favorite cuisine: {favoriteCuisine || "Not set"}</p>
              <p className="text-sm">Solo style: {soloStyle || "Not set"}</p>
            </div>
          )}

          {isDiner && (
            <form onSubmit={handleSave} className="mt-8 text-left space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Solo dining vibe</label>
                <input
                  type="text"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Favorite cuisine</label>
                <input
                  type="text"
                  value={favoriteCuisine}
                  onChange={(e) => setFavoriteCuisine(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Solo style tags (comma separated)</label>
                <input
                  type="text"
                  value={soloStyle}
                  onChange={(e) => setSoloStyle(e.target.value)}
                  placeholder="Quiet, Window-seat, Work-friendly"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-slate-500">
                  {savedAt ? `Saved at ${savedAt.toLocaleTimeString()}` : ""}
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition shadow-md disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save profile"}
                </button>
              </div>
            </form>
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
