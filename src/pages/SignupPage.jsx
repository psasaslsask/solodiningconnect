import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { updateProfile, reload } from "firebase/auth"; // 👈 reload added
import restaurantsData from "../data/restaurants.json";

export default function SignupPage() {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("diner");
  const [location, setLocation] = useState("");
  const [vibe, setVibe] = useState("");
  const [restaurantId, setRestaurantId] = useState(restaurantsData[0]?.id || "");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1️⃣ Create the user in Firebase Authentication
      await signup(email, password);

      // 2️⃣ Update their Firebase profile with display name
      await updateProfile(auth.currentUser, {
        displayName: name,
      });

      // 3️⃣ Force refresh so Firebase Auth updates the name immediately
      await reload(auth.currentUser);

      // 4️⃣ Save the same data in Firestore (for profile info later)
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        name,
        email,
        role,
        createdAt: new Date(),
        restaurantId: role === "restaurant" ? restaurantId : null,
      });

      if (role === "diner") {
        const dinerProfile = {
          name,
          email,
          location: location || "Unknown",
          style: vibe || "Solo diner",
          favoriteCuisine: "TBD",
          rating: 8,
          bio: "New to SoloDiningConnect!",
          cuisines: [],
          availability: [],
          soloStyle: [],
          budget: "$$",
          image: "https://placehold.co/400x400?text=Diner",
          createdAt: new Date(),
        };

        await setDoc(doc(db, "diners", auth.currentUser.uid), dinerProfile);
        navigate("/home");
      } else {
        navigate("/restaurant-dashboard");
      }
    } catch (err) {
      alert(err.message);
      console.error("Signup error:", err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex justify-center items-center min-h-[80vh] bg-gray-50">
        <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
            Create Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full border rounded-md p-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full border rounded-md p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full border rounded-md p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">Account type</p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    value="diner"
                    checked={role === "diner"}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  I'm a diner
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    value="restaurant"
                    checked={role === "restaurant"}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  I'm a restaurant owner
                </label>
              </div>
            </div>

            {role === "diner" && (
              <>
                <input
                  type="text"
                  placeholder="Your city (optional)"
                  className="w-full border rounded-md p-2"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Your solo dining vibe (optional)"
                  className="w-full border rounded-md p-2"
                  value={vibe}
                  onChange={(e) => setVibe(e.target.value)}
                />
              </>
            )}

            {role === "restaurant" && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 block">Select your restaurant</label>
                <select
                  value={restaurantId}
                  onChange={(e) => setRestaurantId(Number(e.target.value))}
                  className="w-full border rounded-md p-2"
                >
                  {restaurantsData.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">You’ll only manage this restaurant’s bookings and details.</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
