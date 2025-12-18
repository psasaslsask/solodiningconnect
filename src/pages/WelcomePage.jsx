import React from "react";
import { useNavigate } from "react-router-dom";
import diningImg from "../data/dining.jpg";
export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 w-full max-w-3xl overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="p-8 md:p-10 flex flex-col justify-center gap-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500 font-semibold">Solo Dining Connect</p>
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
              Safe & Social Dining Experience
            </h1>
            <p className="text-slate-600 text-sm md:text-base">
              Discover solo-friendly restaurants meet like-minded diners. Owners get a dashboard to manage reservations and publish deals.
            </p>

            <div className="grid gap-3">
              <button
                onClick={() => navigate("/signup")}
                className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl hover:bg-slate-800 transition shadow-sm"
              >
                I’m a restaurant owner
              </button>

              <button
                onClick={() => navigate("/signup")}
                className="w-full bg-white text-slate-900 border border-slate-200 font-semibold py-3 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition"
              >
                I’m a solo diner
              </button>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-8 md:p-10 flex flex-col justify-between">
            <div>
              
              <h2 className="text-2xl font-semibold mt-2">Book, chat, and dine together</h2>
              
            </div>
            <img
              src={diningImg}
              alt="dining illustration"
              className="rounded-2xl shadow-lg mt-8"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
