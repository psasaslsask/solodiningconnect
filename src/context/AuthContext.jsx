import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import diners from "../data/diners.json";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Watch Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      const loadProfile = async () => {
        if (!currentUser) {
          setProfile(null);
          setRole(null);
          setRestaurantId(null);
          localStorage.removeItem("currentUserId");
          setLoading(false);
          return;
        }

        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnapshot = await getDoc(userRef);
          const userData = userSnapshot.exists() ? userSnapshot.data() : null;
          const resolvedRole = userData?.role || null;
          const resolvedRestaurantId = userData?.restaurantId ?? null;

          setRole(resolvedRole);
          setRestaurantId(resolvedRestaurantId);

          if (resolvedRole === "restaurant") {
            setProfile(null);
            localStorage.removeItem("currentUserId");
            setLoading(false);
            return;
          }

          const dinerRef = doc(db, "diners", currentUser.uid);
          const dinerSnapshot = await getDoc(dinerRef);

          if (dinerSnapshot.exists()) {
            const dinerProfile = { id: currentUser.uid, ...dinerSnapshot.data() };
            setProfile(dinerProfile);
            localStorage.setItem("currentUserId", dinerProfile.id);
          } else if (currentUser.email) {
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
            localStorage.removeItem("currentUserId");
          }
        } catch (error) {
          console.error("Error loading user profile", error);
          setProfile(null);
          setRole(null);
          setRestaurantId(null);
          localStorage.removeItem("currentUserId");
        }

        setLoading(false);
      };

      loadProfile();
    });
  
    return () => unsubscribe();
  }, []);

  // Keep diner profile in sync after login/signup
  useEffect(() => {
    if (!user || role === "restaurant") return;

    const dinerRef = doc(db, "diners", user.uid);
    const unsubscribe = onSnapshot(dinerRef, (snapshot) => {
      if (snapshot.exists()) {
        const dinerProfile = { id: user.uid, ...snapshot.data() };
        setProfile(dinerProfile);
        localStorage.setItem("currentUserId", dinerProfile.id);
      }
    });

    return () => unsubscribe();
  }, [user, role]);

  // Auth functions
  const signup = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = () => {
    localStorage.removeItem("currentUserId");
    setProfile(null);
    setRole(null);
    setRestaurantId(null);
    setRole(null);
    setRestaurantId(null);
    return signOut(auth);
  };

  const isRestaurantUser = role === "restaurant" || (!!user && !profile && role !== "diner");
  const isRestaurantUser =
    role === "restaurant" || (!!user && !profile && role !== "diner");

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        signup,
        login,
        logout,
        isRestaurantUser,
        role,
        restaurantId,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
