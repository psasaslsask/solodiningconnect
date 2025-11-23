import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import diners from "../data/diners.json";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Firebase user
  const [profile, setProfile] = useState(null); // Diner profile
  const [loading, setLoading] = useState(true);

  // Watch for Firebase user state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      // Try linking Firebase user to diner profile (by email)
      if (currentUser?.email) {
        const diner = diners.find(
          (d) => d.email && d.email.toLowerCase() === currentUser.email.toLowerCase()
        );
        if (diner) {
          setProfile(diner);
          localStorage.setItem("currentUserId", diner.id);
        } else {
          setProfile(null);
          localStorage.removeItem("currentUserId");
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Auth functions
  const signup = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = () => {
    localStorage.removeItem("currentUserId");
    setProfile(null);
    return signOut(auth);
  };

  const isRestaurantUser = !!user && !profile;

  return (
    <AuthContext.Provider
      value={{ user, profile, signup, login, logout, isRestaurantUser }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
