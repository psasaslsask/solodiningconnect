import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center space-y-4 mb-14">
            <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/30">
              Solo-friendly dining
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Welcome to SoloDiningConnect 🍽️
            </h1>
            <p className="text-slate-200/80 max-w-3xl mx-auto text-lg leading-relaxed">
              Discover restaurants tailored for solo diners, connect with like-minded food lovers, and manage your reservations with ease.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Restaurants Card */}
            <button
              onClick={() => navigate("/restaurants")}
              className="group relative overflow-hidden bg-white/5 border border-white/10 rounded-2xl p-6 text-left shadow-2xl hover:-translate-y-1 hover:shadow-emerald-500/20 transition transform"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-indigo-500/10 opacity-0 group-hover:opacity-100 transition" />
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/20 text-emerald-200 flex items-center justify-center text-xl">
                  🍱
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/80">
                  Browse
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                Explore Restaurants
              </h2>
              <p className="text-slate-200/80 text-sm leading-relaxed">
                Find solo-friendly spots by ambiance, seating style, and chef-loved menus.
              </p>
              <div className="mt-5 inline-flex items-center text-emerald-200 font-semibold text-sm">
                View listings
                <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
              </div>
            </button>

            {/* Diners Card */}
            <button
              onClick={() => navigate("/diners")}
              className="group relative overflow-hidden bg-white/5 border border-white/10 rounded-2xl p-6 text-left shadow-2xl hover:-translate-y-1 hover:shadow-indigo-500/20 transition transform"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition" />
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-indigo-500/20 text-indigo-200 flex items-center justify-center text-xl">
                  🧑‍🍳
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200/80">
                  Connect
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                Explore Diners
              </h2>
              <p className="text-slate-200/80 text-sm leading-relaxed">
                Meet fellow solo diners, swap recommendations, and plan your next table.
              </p>
              <div className="mt-5 inline-flex items-center text-indigo-200 font-semibold text-sm">
                Browse community
                <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
              </div>
            </button>

            {/* ⭐ MY BOOKINGS Card */}
            <button
              onClick={() => navigate("/bookings")}
              className="group relative overflow-hidden bg-white/5 border border-white/10 rounded-2xl p-6 text-left shadow-2xl hover:-translate-y-1 hover:shadow-purple-500/20 transition transform"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition" />
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-purple-500/20 text-purple-200 flex items-center justify-center text-xl">
                  📅
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-200/80">
                  Manage
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                My Bookings
              </h2>
              <p className="text-slate-200/80 text-sm leading-relaxed">
                Review, adjust, or cancel reservations without losing your spot.
              </p>
              <div className="mt-5 inline-flex items-center text-purple-200 font-semibold text-sm">
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
