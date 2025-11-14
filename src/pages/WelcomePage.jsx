import React from "react";
import { useNavigate } from "react-router-dom";

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
      <h1 className="text-xl font-bold mb-2">SOLO DINING CONNECT</h1>
      <p className="text-gray-600 mb-6 text-sm">A Safe & Social Dining Experience</p>

      <img
        src="https://illustrations.popsy.co/violet/dining.svg"
        alt="dining illustration"
        className="rounded-xl mb-6 w-64"
      />

      <button
        onClick={() => navigate("/signup")}
        className="w-full bg-blue-500 text-white font-semibold py-3 rounded-full mb-4 hover:bg-blue-600 transition"
      >
        I’m a restaurant owner
      </button>

      <button
        onClick={() => navigate("/signup")}
        className="w-full bg-blue-500 text-white font-semibold py-3 rounded-full hover:bg-blue-600 transition"
      >
        I’m a solo diner
      </button>
    </div>
  );
}
