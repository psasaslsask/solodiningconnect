import React, { useState, useEffect } from "react";
import restaurantsData from "../data/restaurants.json";
import { useAuth } from "../context/AuthContext";

// Firebase
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

export default function RestaurantList() {
  const { profile } = useAuth(); // needed to save booking under the user

  const [restaurants, setRestaurants] = useState([]);
  const [sortBy, setSortBy] = useState("soloScore");

  // Booking modal state
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: "",
    time: "",
    guests: 1,
  });

  // New restaurant form
  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    location: "",
    image: "",
    summary: "",
    category: {
      ambiance: 0,
      service: 0,
      menu: 0,
      reviews: 0,
      wait_time: 0,
      safety_vibe: 0,
      tech_amenities: 0,
    },
    soloScore: 0,
  });

  const categoryFields = [
    {
      key: "ambiance",
      label: "Ambiance",
      description: "Atmosphere, seating comfort, lighting",
    },
    {
      key: "service",
      label: "Service",
      description: "Friendliness, attentiveness, solo-diner welcome",
    },
    {
      key: "menu",
      label: "Menu",
      description: "Options for solo diners, flexibility, value",
    },
    {
      key: "reviews",
      label: "Reviews",
      description: "Reputation and guest feedback",
    },
    {
      key: "wait_time",
      label: "Wait Time",
      description: "Typical seating and service speed",
    },
    {
      key: "safety_vibe",
      label: "Safety Vibe",
      description: "Comfort dining alone, neighborhood feel",
    },
    {
      key: "tech_amenities",
      label: "Tech Amenities",
      description: "Wi‑Fi, outlets, payment tech",
    },
  ];

  useEffect(() => {
    setRestaurants(restaurantsData);
  }, []);

  const handleSort = (key) => {
    const sorted = [...restaurants].sort(
      (a, b) => (key === "soloScore" ? b.soloScore - a.soloScore : b.category[key] - a.category[key])
    );
    setSortBy(key);
    setRestaurants(sorted);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (Object.keys(newRestaurant.category).includes(name)) {
      setNewRestaurant((prev) => ({
        ...prev,
        category: { ...prev.category, [name]: Number(value) },
      }));
    } else {
      setNewRestaurant((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddRestaurant = () => {
    const soloScore =
      Object.values(newRestaurant.category).reduce((a, b) => a + b, 0) / 7;

    const newEntry = {
      ...newRestaurant,
      id: restaurants.length + 1,
      soloScore: parseFloat(soloScore.toFixed(1)),
      image: newRestaurant.image || "/images/default_restaurant.jpg",
    };

    setRestaurants([...restaurants, newEntry]);

    setNewRestaurant({
      name: "",
      location: "",
      image: "",
      summary: "",
      category: {
        ambiance: 0,
        service: 0,
        menu: 0,
        reviews: 0,
        wait_time: 0,
        safety_vibe: 0,
        tech_amenities: 0,
      },
      soloScore: 0,
    });
  };

  // ---------------------------
  // ⭐ SAVE BOOKING TO FIREBASE
  // ---------------------------
  const handleConfirmBooking = async () => {
    if (!profile) {
      alert("You must be logged in to book a restaurant.");
      return;
    }

    const bookingId = uuidv4();

    const bookingPayload = {
      id: bookingId,
      restaurantId: selectedRestaurant.id,
      restaurantName: selectedRestaurant.name,
      restaurantImage: selectedRestaurant.image,
      date: bookingData.date,
      time: bookingData.time,
      guests: bookingData.guests,
      createdAt: new Date().toISOString(),
      dinerId: profile.id,
      dinerName: profile.name,
      dinerEmail: profile.email,
    };

    await setDoc(
      doc(db, "bookings", profile.id.toString(), "items", bookingId),
      bookingPayload
    );

    await setDoc(
      doc(
        db,
        "restaurantBookings",
        selectedRestaurant.id.toString(),
        "items",
        bookingId
      ),
      bookingPayload
    );

    alert(`🎉 Your reservation at ${selectedRestaurant.name} is confirmed!`);
    setBookingOpen(false);
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">Curated for solo diners</p>
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">Discover your next spot</h1>
            <p className="text-slate-600 mt-1 max-w-2xl">
              Browse restaurants with honest scores for ambiance, service, and tech perks. Tap a card to book instantly—your reservation stays in sync with the restaurant.
            </p>
          </div>
          <div className="bg-neutral-50 text-slate-900 rounded-2xl p-5 shadow-inner border border-slate-200 w-full md:w-64">
            <p className="text-sm text-slate-600">Currently sorting by</p>
            <p className="text-3xl font-semibold leading-tight text-slate-900">{sortBy === "soloScore" ? "Solo Score" : categoryFields.find((c) => c.key === sortBy)?.label}</p>
            <p className="text-sm mt-2 text-slate-600">Highest scores show first.</p>
          </div>
        </div>

        {/* Sort Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          {["ambiance", "service", "menu", "soloScore"].map((key) => (
            <button
              key={key}
              onClick={() => handleSort(key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition border ${
                sortBy === key
                  ? "bg-slate-900 text-white shadow-sm border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
              }`}
            >
              {key === "soloScore"
                ? "Overall Solo Score"
                : key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>

        {/* Add Restaurant Form */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500 font-semibold">Contribute</p>
              <h2 className="text-2xl font-semibold text-slate-900">Add a solo-friendly gem</h2>
              <p className="text-slate-600 mt-2">Share a spot you love—scores help other diners decide with confidence.</p>
            </div>
            <button
              onClick={handleAddRestaurant}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white font-semibold shadow-sm hover:bg-slate-800 transition"
            >
              ➕ Save restaurant
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-slate-700">Restaurant name</span>
              <input
                name="name"
                value={newRestaurant.name}
                onChange={handleInputChange}
                placeholder="e.g., Little Finch Bistro"
                className="border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-slate-700">Location</span>
              <input
                name="location"
                value={newRestaurant.location}
                onChange={handleInputChange}
                placeholder="Neighborhood or city"
                className="border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-slate-700">Image URL</span>
              <input
                name="image"
                value={newRestaurant.image}
                onChange={handleInputChange}
                placeholder="Link to a photo (optional)"
                className="border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </label>
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Short summary</span>
              <textarea
                name="summary"
                value={newRestaurant.summary}
                onChange={handleInputChange}
                placeholder="What makes it welcoming for solo diners?"
                className="border border-slate-200 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </label>

            <div className="bg-neutral-50 border border-slate-200 p-4 rounded-2xl text-sm md:col-span-2">
              <p className="font-semibold text-slate-900 mb-1">How scoring works</p>
              <p className="text-slate-700">
                Rate each category 0–10. The Solo Score averages them for a balanced view of the solo dining experience.
              </p>
              <p className="mt-2 text-slate-700 font-medium">Rate each below:</p>
              <ul className="list-disc ml-6 text-slate-700 space-y-1">
                <li>Ambiance • Service • Menu • Reviews</li>
                <li>Wait Time • Safety Vibe • Tech Amenities</li>
              </ul>
            </div>

            {categoryFields.map(({ key, label, description }) => (
              <label key={key} className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  {label}
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 rounded-full px-2 py-[2px]">0–10</span>
                </span>
                <input
                  name={key}
                  type="number"
                  min="0"
                  max="10"
                  value={newRestaurant.category[key]}
                  onChange={handleInputChange}
                  placeholder={`Score for ${label}`}
                  className="border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
                <span className="text-xs text-slate-500">{description}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Display Restaurants */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((r) => (
            <div
              key={r.id}
              onClick={() => {
                setSelectedRestaurant(r);
                setBookingOpen(true);
              }}
              className="group bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer flex flex-col"
            >
              <div className="relative">
                <img
                  src={r.image}
                  alt={r.name}
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <span className="absolute top-3 left-3 bg-white/90 text-slate-900 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                  Solo Score {r.soloScore.toFixed(1)}
                </span>
                <span className="absolute top-3 right-3 bg-slate-900 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm group-hover:scale-105 transition">
                  Book now
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold text-lg text-slate-900">{r.name}</h2>
                    <p className="text-slate-500 text-sm">{r.location}</p>
                  </div>
                </div>
                <p className="text-slate-600 text-sm mt-2 flex-1">{r.summary}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100">Ambiance {r.category.ambiance}</span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100">Service {r.category.service}</span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100">Tech {r.category.tech_amenities}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {bookingOpen && selectedRestaurant && (
        <div className="fixed inset-0 bg-slate-900/60 flex justify-center items-center z-50 px-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-lg border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">Reservation</p>
                <h2 className="text-2xl font-bold text-slate-900">Book {selectedRestaurant.name}</h2>
              </div>
              <button
                onClick={() => setBookingOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl"
                aria-label="Close booking modal"
              >
                ✖
              </button>
            </div>

            <div className="space-y-3">
              <label className="flex flex-col gap-1 text-sm text-slate-700">
                Date
                <input
                  type="date"
                  value={bookingData.date}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, date: e.target.value })
                  }
                  className="border border-slate-200 rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-slate-700">
                Time
                <input
                  type="time"
                  value={bookingData.time}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, time: e.target.value })
                  }
                  className="border border-slate-200 rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-slate-700">
                Guests
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={bookingData.guests}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, guests: e.target.value })
                  }
                  className="border border-slate-200 rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  placeholder="Guests"
                />
                <span className="text-[11px] text-slate-500">We save your details to keep the restaurant in sync.</span>
              </label>

              <button
                onClick={handleConfirmBooking}
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition shadow-sm"
              >
                Confirm booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
