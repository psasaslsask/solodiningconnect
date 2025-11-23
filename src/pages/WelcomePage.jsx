import React from "react";
import { useNavigate } from "react-router-dom";

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="bg-white/80 backdrop-blur rounded-3xl shadow-2xl border border-slate-100 w-full max-w-3xl overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="p-8 md:p-10 flex flex-col justify-center gap-4">
            <p className="text-xs uppercase tracking-[0.25em] text-indigo-500 font-semibold">Solo Dining Connect</p>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
              Safe, social dining—built for solo explorers.
            </h1>
            <p className="text-slate-600 text-sm md:text-base">
              Discover solo-friendly restaurants, book in seconds, and meet like-minded diners. Owners get a dashboard to manage reservations and publish deals.
            </p>

            <div className="grid gap-3">
              <button
                onClick={() => navigate("/signup")}
                className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
              >
                I’m a restaurant owner
              </button>

              <button
                onClick={() => navigate("/signup")}
                className="w-full bg-white text-indigo-700 border border-indigo-100 font-semibold py-3 rounded-xl hover:border-indigo-200 hover:bg-indigo-50 transition"
              >
                I’m a solo diner
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 via-sky-500 to-cyan-400 text-white p-8 md:p-10 flex flex-col justify-between">
            <div>
              <p className="text-sm font-semibold">Live preview</p>
              <h2 className="text-2xl font-bold mt-2">Book, chat, and dine together</h2>
              <p className="text-indigo-100 mt-3 text-sm">
                Streamlined booking flows, clarity on solo-friendly vibes, and community features for diners who love exploring.
              </p>
            </div>
            <img
              src="https://illustrations.popsy.co/violet/dining.svg"
              alt="dining illustration"
              className="rounded-2xl shadow-lg mt-8"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
