import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { updateProfile, reload } from "firebase/auth"; // 👈 reload added

export default function SignupPage() {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        createdAt: new Date(),
      });      

      // 5️⃣ Redirect to Home Page
      navigate("/home");
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
