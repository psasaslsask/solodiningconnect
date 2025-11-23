import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import restaurantsData from "../data/restaurants.json";
import { addDoc, collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function RestaurantHomePage() {
  const { user } = useAuth();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(
    restaurantsData[0]?.id || null
  );
  const [bookings, setBookings] = useState([]);
  const [deals, setDeals] = useState([]);
  const [dealForm, setDealForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });
  const [details, setDetails] = useState({
    headline: "",
    contactEmail: user?.email || "",
    specialNotes: "",
  });

  // Sync bookings stream for selected restaurant
  useEffect(() => {
    if (!selectedRestaurantId) return;

    const ref = collection(
      db,
      "restaurantBookings",
      selectedRestaurantId.toString(),
      "items"
    );

    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const items = snapshot.docs.map((doc) => doc.data());
      items.sort((a, b) => {
        const aDate = new Date(`${a.date}T${a.time || "00:00"}`);
        const bDate = new Date(`${b.date}T${b.time || "00:00"}`);
        return aDate - bDate;
      });
      setBookings(items);
    });

    return unsubscribe;
  }, [selectedRestaurantId]);

  // Sync existing deals
  useEffect(() => {
    if (!selectedRestaurantId) return;

    const dealsRef = collection(
      db,
      "restaurantDeals",
      selectedRestaurantId.toString(),
      "items"
    );

    const unsubscribe = onSnapshot(dealsRef, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => b.createdAt - a.createdAt);
      setDeals(list);
    });

    return unsubscribe;
  }, [selectedRestaurantId]);

  // Sync editable details profile
  useEffect(() => {
    if (!selectedRestaurantId) return;

    const profileRef = doc(
      db,
      "restaurantProfiles",
      selectedRestaurantId.toString()
    );

    const unsubscribe = onSnapshot(profileRef, (snapshot) => {
      if (snapshot.exists()) {
        setDetails((prev) => ({ ...prev, ...snapshot.data() }));
      }
    });

    return unsubscribe;
  }, [selectedRestaurantId]);

  const selectedRestaurant = useMemo(
    () =>
      restaurantsData.find((restaurant) => restaurant.id === selectedRestaurantId),
    [selectedRestaurantId]
  );

  const nextArrival = bookings.find((booking) => booking.date && booking.time);

  const handleDealSubmit = async (e) => {
    e.preventDefault();
    const dealsRef = collection(
      db,
      "restaurantDeals",
      selectedRestaurantId.toString(),
      "items"
    );

    await addDoc(dealsRef, {
      ...dealForm,
      createdAt: Date.now(),
    });

    setDealForm({ title: "", description: "", startDate: "", endDate: "" });
    alert("Deal saved for diners ✅");
  };

  const handleDetailsSave = async (e) => {
    e.preventDefault();
    const profileRef = doc(
      db,
      "restaurantProfiles",
      selectedRestaurantId.toString()
    );

    await setDoc(profileRef, {
      ...details,
      updatedAt: Date.now(),
    });

    alert("Listing details updated ✏️");
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-850 to-slate-900 text-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/30">
                Restaurant Home
              </p>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Manage your solo-dining venue</h1>
                <p className="text-slate-200/80 mt-2">
                  Track reservations, publish deals, and keep your listing fresh for diners who prefer to dine solo.
                </p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 shadow-lg w-full md:w-80">
              <label className="block text-sm font-semibold text-slate-100 mb-1" htmlFor="restaurant-selector">
                Your restaurant
              </label>
              <p className="text-xs text-slate-200/70 mb-2">Switch venues to manage bookings and deals per location.</p>
              <select
                id="restaurant-selector"
                value={selectedRestaurantId || ""}
                onChange={(e) => setSelectedRestaurantId(Number(e.target.value))}
                className="w-full border border-white/10 bg-white/10 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
              >
                {restaurantsData.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id} className="text-gray-900">
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </div>
          </header>

          {selectedRestaurant && (
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-5 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs uppercase tracking-[0.2em] text-emerald-200/80 font-semibold">Overview</div>
                    <h2 className="text-2xl font-semibold text-white">
                      {selectedRestaurant.name}
                    </h2>
                    <p className="text-slate-200/80 text-sm">{selectedRestaurant.location}</p>
                    <p className="text-emerald-200 font-semibold mt-1">Solo Score {selectedRestaurant.soloScore.toFixed(1)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                    <div className="rounded-xl bg-white/10 border border-white/15 p-3 shadow">
                      <p className="text-xs text-slate-200/70">Total bookings</p>
                      <p className="text-3xl font-bold text-white">{bookings.length}</p>
                    </div>
                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/30 p-3 shadow">
                      <p className="text-xs text-emerald-100/80">Next arrival</p>
                      <p className="text-lg font-semibold text-emerald-50">
                        {nextArrival ? `${nextArrival.date} @ ${nextArrival.time}` : "No upcoming"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-5 space-y-2 backdrop-blur-sm">
                <p className="text-sm text-slate-200/80">Logged in as</p>
                <p className="font-semibold text-white break-words">{user?.email}</p>
                <p className="text-xs text-slate-200/70">
                  Owner-only controls keep your listing, availability, and deals aligned for diners.
                </p>
              </div>
            </div>
          )}

          <section className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-5 backdrop-blur-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">Live reservations</h3>
                    <p className="text-sm text-slate-200/70">Real-time sync from diner bookings with guest details.</p>
                  </div>
                  <span className="text-xs text-emerald-200/80 px-3 py-1 rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/30">
                    Auto-refreshing
                  </span>
                </div>

                {bookings.length === 0 ? (
                  <p className="text-slate-200/80">No bookings yet for this restaurant.</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="rounded-xl border border-white/10 bg-white/5 p-4 shadow hover:shadow-emerald-500/20 transition"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-xs text-slate-200/70 uppercase tracking-[0.12em]">Reservation</p>
                            <p className="text-lg font-semibold text-white">
                              {booking.date} @ {booking.time || "Time TBA"}
                            </p>
                          </div>
                          <span className="text-xs bg-white/10 text-slate-100 px-3 py-1 rounded-full border border-white/15">
                            #{booking.id.slice(0, 6)}
                          </span>
                        </div>

                        <div className="space-y-1 text-slate-50">
                          <p className="font-medium">Guest: {booking.dinerName}</p>
                          {booking.dinerEmail && (
                            <p className="text-sm text-slate-200/80">{booking.dinerEmail}</p>
                          )}
                          <p className="text-sm">👥 Party of {booking.guests}</p>
                        </div>
                        <p className="text-xs text-slate-200/60 mt-3">
                          Created {new Date(booking.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-5 backdrop-blur-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">Add a deal</h3>
                    <p className="text-sm text-slate-200/70">Showcase perks for solo diners—appears immediately to diners.</p>
                  </div>
                  <span className="text-xs text-indigo-200/80 px-3 py-1 rounded-full bg-indigo-500/15 ring-1 ring-indigo-400/30">
                    Promoted
                  </span>
                </div>

                <form className="grid md:grid-cols-2 gap-4" onSubmit={handleDealSubmit}>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-sm font-semibold text-slate-100" htmlFor="deal-title">
                      Deal title
                    </label>
                    <input
                      id="deal-title"
                      required
                      type="text"
                      placeholder="e.g., Solo lunch combo, bar seats only"
                      value={dealForm.title}
                      onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
                      className="border border-white/10 rounded-lg px-3 py-2 col-span-2 bg-white/10 text-white placeholder-slate-200/60 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    />
                    <p className="text-xs text-slate-200/70">Keep it concise and action-focused.</p>
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="text-sm font-semibold text-slate-100" htmlFor="deal-description">
                      Description
                    </label>
                    <textarea
                      id="deal-description"
                      required
                      placeholder="Describe the offer, solo seating, or timing preferences"
                      value={dealForm.description}
                      onChange={(e) => setDealForm({ ...dealForm, description: e.target.value })}
                      className="border border-white/10 rounded-lg px-3 py-2 col-span-2 bg-white/10 text-white placeholder-slate-200/60 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                      rows={3}
                    />
                    <p className="text-xs text-slate-200/70">Mention seat type, time windows, or inclusions.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-100" htmlFor="deal-start">
                      Starts on
                    </label>
                    <input
                      id="deal-start"
                      type="date"
                      value={dealForm.startDate}
                      onChange={(e) => setDealForm({ ...dealForm, startDate: e.target.value })}
                      className="border border-white/10 rounded-lg px-3 py-2 w-full bg-white/10 text-white placeholder-slate-200/60 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    />
                    <p className="text-xs text-slate-200/70">Optional start date for the promotion.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-100" htmlFor="deal-end">
                      Ends on
                    </label>
                    <input
                      id="deal-end"
                      type="date"
                      value={dealForm.endDate}
                      onChange={(e) => setDealForm({ ...dealForm, endDate: e.target.value })}
                      className="border border-white/10 rounded-lg px-3 py-2 w-full bg-white/10 text-white placeholder-slate-200/60 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    />
                    <p className="text-xs text-slate-200/70">Optional end date to retire the offer.</p>
                  </div>

                  <button
                    type="submit"
                    className="md:col-span-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition"
                  >
                    Publish deal
                  </button>
                </form>

                {deals.length > 0 && (
                  <div className="mt-5 space-y-3">
                    {deals.map((deal) => (
                      <div
                        key={deal.id}
                        className="border border-white/10 rounded-lg p-3 bg-white/5 flex items-start justify-between shadow"
                      >
                        <div className="space-y-1">
                          <p className="font-semibold text-white">{deal.title}</p>
                          <p className="text-slate-200/80 text-sm">{deal.description}</p>
                          {(deal.startDate || deal.endDate) && (
                            <p className="text-xs text-slate-200/60 mt-1">
                              {deal.startDate ? `From ${deal.startDate}` : ""}
                              {deal.startDate && deal.endDate ? " • " : ""}
                              {deal.endDate ? `Until ${deal.endDate}` : ""}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-slate-200/60">
                          {new Date(deal.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-5 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-white mb-2">Update listing details</h3>
                <p className="text-sm text-slate-200/70 mb-4">
                  Share Wi-Fi info, solo seating notes, or contact details so diners know exactly what to expect.
                </p>

                <form className="space-y-3" onSubmit={handleDetailsSave}>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-100" htmlFor="headline">
                      Headline
                    </label>
                    <input
                      id="headline"
                      type="text"
                      placeholder="e.g., Best solo counter seats in town"
                      value={details.headline}
                      onChange={(e) => setDetails({ ...details, headline: e.target.value })}
                      className="border border-white/10 rounded-lg px-3 py-2 w-full bg-white/10 text-white placeholder-slate-200/60 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                    />
                    <p className="text-xs text-slate-200/70">This headline appears on your listing card.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-100" htmlFor="contact-email">
                      Contact email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      placeholder="owner@restaurant.com"
                      value={details.contactEmail}
                      onChange={(e) => setDetails({ ...details, contactEmail: e.target.value })}
                      className="border border-white/10 rounded-lg px-3 py-2 w-full bg-white/10 text-white placeholder-slate-200/60 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                    />
                    <p className="text-xs text-slate-200/70">Diners see this for questions or special requests.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-100" htmlFor="special-notes">
                      Special notes for solo diners
                    </label>
                    <textarea
                      id="special-notes"
                      placeholder="Wi-Fi password, best seats for laptop work, or quiet hours"
                      value={details.specialNotes}
                      onChange={(e) => setDetails({ ...details, specialNotes: e.target.value })}
                      className="border border-white/10 rounded-lg px-3 py-2 w-full bg-white/10 text-white placeholder-slate-200/60 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                      rows={4}
                    />
                    <p className="text-xs text-slate-200/70">These notes help solo guests feel prepared.</p>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition"
                  >
                    Save listing
                  </button>
                </form>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-5 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-white mb-2">Tips for great solo visits</h3>
                <ul className="list-disc list-inside text-slate-200/80 space-y-2 text-sm">
                  <li>Keep a few counter or window seats open for walk-in solos.</li>
                  <li>Share Wi-Fi and outlet availability in your listing.</li>
                  <li>Highlight quieter hours with deals to attract remote workers.</li>
                  <li>Train staff with friendly greetings and quick seating for solos.</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
