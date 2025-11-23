import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="bg-white shadow-sm border border-slate-200 rounded-3xl p-8 md:p-10 mb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-blue-700">SoloDiningConnect</p>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                  Welcome to better solo dining
                </h1>
                <p className="text-slate-600 max-w-3xl text-lg leading-relaxed">
                  Discover restaurants suited for one, connect with other diners, and keep every reservation organized in one familiar place.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-sm text-slate-700 w-full md:w-80">
                <p className="font-semibold text-blue-800">Quick actions</p>
                <ul className="mt-3 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">•</span> Browse solo-friendly spots
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">•</span> Meet diners nearby
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">•</span> Check and edit bookings
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Restaurants Card */}
            <button
              onClick={() => navigate("/restaurants")}
              className="group relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-6 text-left shadow-md hover:-translate-y-1 hover:shadow-lg transition"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400" />
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-xl">
                  🍱
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Browse</span>
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Explore Restaurants</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Find solo-friendly spots by ambiance, seating style, and chef-loved menus.
              </p>
              <div className="mt-5 inline-flex items-center text-blue-700 font-semibold text-sm">
                View listings
                <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
              </div>
            </button>

            {/* Diners Card */}
            <button
              onClick={() => navigate("/diners")}
              className="group relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-6 text-left shadow-md hover:-translate-y-1 hover:shadow-lg transition"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-700 to-slate-500" />
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center text-xl">
                  🧑‍🍳
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">Connect</span>
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Explore Diners</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Meet fellow solo diners, swap recommendations, and plan your next table.
              </p>
              <div className="mt-5 inline-flex items-center text-slate-800 font-semibold text-sm">
                Browse community
                <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
              </div>
            </button>

            {/* ⭐ MY BOOKINGS Card */}
            <button
              onClick={() => navigate("/bookings")}
              className="group relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-6 text-left shadow-md hover:-translate-y-1 hover:shadow-lg transition"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 to-amber-400" />
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl">
                  📅
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Manage</span>
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">My Bookings</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Review, adjust, or cancel reservations without losing your spot.
              </p>
              <div className="mt-5 inline-flex items-center text-amber-700 font-semibold text-sm">
                Manage visits
                <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
