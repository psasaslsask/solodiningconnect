import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-neutral-100 text-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-10 mb-12 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-500 tracking-[0.2em]">SOLO DINING CONNECT</p>
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900">
                  A calm hub for planning meals out
                </h1>
                <p className="text-slate-600 max-w-3xl text-lg leading-relaxed">
                  Find restaurants that welcome solo diners, connect with locals, and keep your reservations tidy without a lot of extra fuss.
                </p>
              </div>

              <div className="bg-neutral-50 border border-slate-200 rounded-2xl p-5 text-sm text-slate-700 w-full md:w-80 shadow-inner">
                <p className="font-semibold text-slate-900">What you can do</p>
                <ul className="mt-3 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-500">•</span> Browse solo-friendly spots and see how they score
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-500">•</span> Connect with other diners nearby
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-500">•</span> Check and update your bookings in one place
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Restaurants Card */}
            <button
              onClick={() => navigate("/restaurants")}
              className="group relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-6 text-left shadow-sm hover:-translate-y-0.5 hover:shadow-lg transition"
            >
              <div className="absolute inset-x-0 top-0 h-[3px] bg-slate-900" />
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-neutral-100 text-slate-900 flex items-center justify-center text-xl">
                  🗺️
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Browse</span>
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Explore Restaurants</h2>
              <p className="text-slate-600 text-sm leading-relaxed pr-4">
                Find solo-friendly spots by ambiance, seating style, and what regulars love.
              </p>
              <div className="mt-5 inline-flex items-center text-slate-900 font-semibold text-sm">
                View listings
                <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
              </div>
            </button>

            {/* Diners Card */}
            <button
              onClick={() => navigate("/diners")}
              className="group relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-6 text-left shadow-sm hover:-translate-y-0.5 hover:shadow-lg transition"
            >
              <div className="absolute inset-x-0 top-0 h-[3px] bg-slate-700" />
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-neutral-100 text-slate-900 flex items-center justify-center text-xl">
                  🤝
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Connect</span>
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Explore Diners</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Meet fellow solo diners, swap recommendations, and plan your next table.
              </p>
              <div className="mt-5 inline-flex items-center text-slate-900 font-semibold text-sm">
                Browse community
                <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
              </div>
            </button>

            {/* ⭐ MY BOOKINGS Card */}
            <button
              onClick={() => navigate("/bookings")}
              className="group relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-6 text-left shadow-sm hover:-translate-y-0.5 hover:shadow-lg transition"
            >
              <div className="absolute inset-x-0 top-0 h-[3px] bg-amber-600" />
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-neutral-100 text-amber-700 flex items-center justify-center text-xl">
                  📅
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Manage</span>
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">My Bookings</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Review, adjust, or cancel reservations without losing your spot.
              </p>
              <div className="mt-5 inline-flex items-center text-slate-900 font-semibold text-sm">
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
