import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import restaurantsData from "../data/restaurants.json";
import { addDoc, collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function RestaurantHomePage() {
  const { user, restaurantId } = useAuth();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
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
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (restaurantId) {
      setSelectedRestaurantId(restaurantId);
    }
  }, [restaurantId]);

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
      setBookings(items);
    });

    return unsubscribe;
  }, [selectedRestaurantId]);

  // Tick time so past bookings drop away without data churn
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

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

  const upcomingBookings = useMemo(() => {
    return bookings
      .filter((booking) => {
        if (!booking.date) return true;
        const dateTime = new Date(`${booking.date}T${booking.time || "00:00"}`);
        return dateTime >= now;
      })
      .sort((a, b) => {
        const aDate = new Date(`${a.date}T${a.time || "00:00"}`);
        const bDate = new Date(`${b.date}T${b.time || "00:00"}`);
        return aDate - bDate;
      });
  }, [bookings, now]);

  const nextArrival = upcomingBookings.find((booking) => booking.date && booking.time);

  const handleDealSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRestaurantId) {
      alert("No restaurant assigned to this account.");
      return;
    }
    const dealsRef = collection(
      db,
      "restaurantDeals",
      selectedRestaurantId.toString(),
      "items"
    );

    await addDoc(dealsRef, {
      ...dealForm,
      restaurantId: selectedRestaurantId,
      restaurantName: selectedRestaurant?.name,
      createdAt: Date.now(),
    });

    setDealForm({ title: "", description: "", startDate: "", endDate: "" });
    alert("Deal saved for diners ✅");
  };

  const handleDetailsSave = async (e) => {
    e.preventDefault();
    if (!selectedRestaurantId) {
      alert("No restaurant assigned to this account.");
      return;
    }
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
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                Restaurant Home
              </p>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Manage your solo-dining venue</h1>
                <p className="text-slate-600 mt-2">
                  Track reservations, publish deals, and keep your listing fresh for diners who prefer to dine solo.
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm w-full md:w-80">
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Your restaurant
              </label>
              {selectedRestaurantId ? (
                <>
                  <p className="text-base font-semibold text-slate-900">
                    {restaurantsData.find((r) => r.id === selectedRestaurantId)?.name || "Assigned restaurant"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">You’re limited to managing your assigned restaurant.</p>
                </>
              ) : (
                <p className="text-sm text-slate-500">No restaurant assigned to this account.</p>
              )}
            </div>
          </header>

          {!selectedRestaurant && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 text-slate-700">
              <p className="font-semibold">No restaurant assigned</p>
              <p className="text-sm text-slate-600">This account doesn’t have an assigned restaurant to manage.</p>
            </div>
          )}

          {selectedRestaurant && (
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs uppercase tracking-[0.16em] text-blue-700 font-semibold">Overview</div>
                    <h2 className="text-2xl font-semibold text-slate-900">
                      {selectedRestaurant.name}
                    </h2>
                    <p className="text-slate-600 text-sm">{selectedRestaurant.location}</p>
                    <p className="text-blue-700 font-semibold mt-1">Solo Score {selectedRestaurant.soloScore.toFixed(1)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 shadow-sm">
                      <p className="text-xs text-slate-500">Total bookings</p>
                      <p className="text-3xl font-bold text-slate-900">{upcomingBookings.length}</p>
                    </div>
                    <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 shadow-sm">
                      <p className="text-xs text-blue-800/80">Next arrival</p>
                      <p className="text-lg font-semibold text-blue-800">
                        {nextArrival ? `${nextArrival.date} @ ${nextArrival.time}` : "No upcoming"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-2">
                <p className="text-sm text-slate-600">Logged in as</p>
                <p className="font-semibold text-slate-900 break-words">{user?.email}</p>
                <p className="text-xs text-slate-500">
                  Owner-only controls keep your listing, availability, and deals aligned for diners.
                </p>
              </div>
            </div>
          )}

          <section className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Live reservations</h3>
                    <p className="text-sm text-slate-600">Real-time sync from diner bookings with guest details.</p>
                  </div>
                  <span className="text-xs text-blue-700 px-3 py-1 rounded-full bg-blue-50 border border-blue-100">
                    Auto-refreshing
                  </span>
                </div>

                {upcomingBookings.length === 0 ? (
                  <p className="text-slate-600">No bookings yet for this restaurant.</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {upcomingBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-[0.12em]">Reservation</p>
                            <p className="text-lg font-semibold text-slate-900">
                              {booking.date} @ {booking.time || "Time TBA"}
                            </p>
                          </div>
                          <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
                            #{booking.id.slice(0, 6)}
                          </span>
                        </div>

                        <div className="space-y-1 text-slate-800">
                          <p className="font-medium">Guest: {booking.dinerName}</p>
                          {booking.dinerEmail && (
                            <p className="text-sm text-slate-600">{booking.dinerEmail}</p>
                          )}
                          <p className="text-sm">👥 Party of {booking.guests}</p>
                        </div>
                        <p className="text-xs text-slate-500 mt-3">
                          Created {new Date(booking.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Add a deal</h3>
                    <p className="text-sm text-slate-600">Showcase perks for solo diners—appears immediately to diners.</p>
                  </div>
                  <span className="text-xs text-amber-700 px-3 py-1 rounded-full bg-amber-50 border border-amber-100">
                    Promoted
                  </span>
                </div>

                <form className="grid md:grid-cols-2 gap-4" onSubmit={handleDealSubmit}>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-sm font-semibold text-slate-800" htmlFor="deal-title">
                      Deal title
                    </label>
                    <input
                      id="deal-title"
                      required
                      type="text"
                      placeholder="e.g., Solo lunch combo, bar seats only"
                      value={dealForm.title}
                      onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
                      className="border border-slate-300 rounded-lg px-3 py-2 col-span-2 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <p className="text-xs text-slate-500">Keep it concise and action-focused.</p>
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="text-sm font-semibold text-slate-800" htmlFor="deal-description">
                      Description
                    </label>
                    <textarea
                      id="deal-description"
                      required
                      placeholder="Describe the offer, solo seating, or timing preferences"
                      value={dealForm.description}
                      onChange={(e) => setDealForm({ ...dealForm, description: e.target.value })}
                      className="border border-slate-300 rounded-lg px-3 py-2 col-span-2 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      rows={3}
                    />
                    <p className="text-xs text-slate-500">Mention seat type, time windows, or inclusions.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-800" htmlFor="deal-start">
                      Starts on
                    </label>
                    <input
                      id="deal-start"
                      type="date"
                      value={dealForm.startDate}
                      onChange={(e) => setDealForm({ ...dealForm, startDate: e.target.value })}
                      className="border border-slate-300 rounded-lg px-3 py-2 w-full bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <p className="text-xs text-slate-500">Optional start date for the promotion.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-800" htmlFor="deal-end">
                      Ends on
                    </label>
                    <input
                      id="deal-end"
                      type="date"
                      value={dealForm.endDate}
                      onChange={(e) => setDealForm({ ...dealForm, endDate: e.target.value })}
                      className="border border-slate-300 rounded-lg px-3 py-2 w-full bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <p className="text-xs text-slate-500">Optional end date to retire the offer.</p>
                  </div>

                  <button
                    type="submit"
                    className="md:col-span-2 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Publish deal
                  </button>
                </form>

                {deals.length > 0 && (
                  <div className="mt-5 space-y-3">
                    {deals.map((deal) => (
                      <div
                        key={deal.id}
                        className="border border-slate-200 rounded-lg p-3 bg-white flex items-start justify-between shadow-sm"
                      >
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-900">{deal.title}</p>
                          <p className="text-slate-700 text-sm">{deal.description}</p>
                          {(deal.startDate || deal.endDate) && (
                            <p className="text-xs text-slate-500 mt-1">
                              {deal.startDate ? `From ${deal.startDate}` : ""}
                              {deal.startDate && deal.endDate ? " • " : ""}
                              {deal.endDate ? `Until ${deal.endDate}` : ""}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(deal.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Update listing details</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Share Wi-Fi info, solo seating notes, or contact details so diners know exactly what to expect.
                </p>

                <form className="space-y-3" onSubmit={handleDetailsSave}>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-800" htmlFor="headline">
                      Headline
                    </label>
                    <input
                      id="headline"
                      type="text"
                      placeholder="e.g., Best solo counter seats in town"
                      value={details.headline}
                      onChange={(e) => setDetails({ ...details, headline: e.target.value })}
                      className="border border-slate-300 rounded-lg px-3 py-2 w-full bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <p className="text-xs text-slate-500">This headline appears on your listing card.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-800" htmlFor="contact-email">
                      Contact email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      placeholder="owner@restaurant.com"
                      value={details.contactEmail}
                      onChange={(e) => setDetails({ ...details, contactEmail: e.target.value })}
                      className="border border-slate-300 rounded-lg px-3 py-2 w-full bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <p className="text-xs text-slate-500">Diners see this for questions or special requests.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-800" htmlFor="special-notes">
                      Special notes for solo diners
                    </label>
                    <textarea
                      id="special-notes"
                      placeholder="Wi-Fi password, best seats for laptop work, or quiet hours"
                      value={details.specialNotes}
                      onChange={(e) => setDetails({ ...details, specialNotes: e.target.value })}
                      className="border border-slate-300 rounded-lg px-3 py-2 w-full bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      rows={4}
                    />
                    <p className="text-xs text-slate-500">These notes help solo guests feel prepared.</p>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition"
                  >
                    Save listing
                  </button>
                </form>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Tips for great solo visits</h3>
                <ul className="list-disc list-inside text-slate-700 space-y-2 text-sm">
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
