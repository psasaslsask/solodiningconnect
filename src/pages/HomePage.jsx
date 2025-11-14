import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FFF9EC] flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Welcome to SoloDiningConnect 🍽️
        </h1>

        <p className="text-gray-600 text-center max-w-lg mb-10">
          Discover restaurants ideal for solo diners, or connect with like-minded people who enjoy dining alone.  
          Choose what you’d like to explore below 👇
        </p>

        <div className="grid md:grid-cols-3 gap-8 w-full max-w-5xl">
          
          {/* Restaurants Card */}
          <div
            onClick={() => navigate("/restaurants")}
            className="cursor-pointer bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition text-center"
          >
            <img
              src="https://img.freepik.com/free-photo/modern-coffee-shop-interior_23-2148895024.jpg"
              alt="Restaurants"
              className="w-full h-48 object-cover rounded-xl mb-4"
            />
            <h2 className="text-2xl font-semibold text-blue-600 mb-2">
              Explore Restaurants
            </h2>
            <p className="text-gray-500 text-sm">
              Find solo-friendly restaurants based on ambiance, service, and more.
            </p>
          </div>

          {/* Diners Card */}
          <div
            onClick={() => navigate("/diners")}
            className="cursor-pointer bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition text-center"
          >
            <img
              src="https://img.freepik.com/free-photo/friends-having-lunch-together_53876-64987.jpg"
              alt="Diners"
              className="w-full h-48 object-cover rounded-xl mb-4"
            />
            <h2 className="text-2xl font-semibold text-blue-600 mb-2">
              Explore Diners
            </h2>
            <p className="text-gray-500 text-sm">
              Connect with solo diners near you and share your experiences.
            </p>
          </div>

          {/* ⭐ MY BOOKINGS Card */}
          <div
            onClick={() => navigate("/bookings")}
            className="cursor-pointer bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition text-center"
          >
            <img
              src="https://img.freepik.com/free-photo/calendar-composition-with-smartphone_23-2149816058.jpg"
              alt="My Bookings"
              className="w-full h-48 object-cover rounded-xl mb-4"
            />
            <h2 className="text-2xl font-semibold text-purple-600 mb-2">
              My Bookings
            </h2>
            <p className="text-gray-500 text-sm">
              View, modify, or cancel your restaurant reservations.
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
