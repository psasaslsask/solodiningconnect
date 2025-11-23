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
      lastUpdated: Date.now(),
    });

    alert("Restaurant details updated ✏️");
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8FAFC] p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <p className="uppercase text-xs tracking-widest text-blue-500 font-semibold">
                Restaurant Home
              </p>
              <h1 className="text-3xl font-bold text-gray-900 mt-1">
                Manage your solo-dining venue
              </h1>
              <p className="text-gray-600 mt-2">
                Track reservations, share deals, and keep your listing fresh for diners.
              </p>
            </div>

            <div className="mt-4 md:mt-0">
              <label className="block text-sm text-gray-600 mb-1">
                Your restaurant
              </label>
              <select
                value={selectedRestaurantId || ""}
                onChange={(e) => setSelectedRestaurantId(Number(e.target.value))}
                className="border rounded-lg px-3 py-2 bg-white shadow-sm"
              >
                {restaurantsData.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </div>
          </header>

          {selectedRestaurant && (
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-white rounded-xl shadow p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedRestaurant.name}
                  </h2>
                  <p className="text-gray-600 text-sm">{selectedRestaurant.location}</p>
                  <p className="text-blue-600 font-semibold mt-1">
                    Solo Score {selectedRestaurant.soloScore.toFixed(1)}
                  </p>
                </div>
                <div className="flex space-x-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-center">
                    <p className="text-xs text-gray-500">Total bookings</p>
                    <p className="text-2xl font-bold text-blue-700">{bookings.length}</p>
                  </div>
                  <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-3 text-center">
                    <p className="text-xs text-gray-500">Next arrival</p>
                    <p className="text-lg font-semibold text-green-700">
                      {nextArrival
                        ? `${nextArrival.date} @ ${nextArrival.time}`
                        : "No upcoming"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-4 space-y-2">
                <p className="text-sm text-gray-500">Logged in as</p>
                <p className="font-semibold text-gray-800 break-words">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-500">
                  Use this owner account to keep your listing and offers updated.
                </p>
              </div>
            </div>
          )}

          <section className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Live reservations
                  </h3>
                  <span className="text-sm text-gray-500">
                    Auto-refreshes from diner bookings
                  </span>
                </div>

                {bookings.length === 0 ? (
                  <p className="text-gray-600">No bookings yet for this restaurant.</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="border rounded-xl p-4 hover:shadow transition bg-gray-50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-sm text-gray-500">Reservation</p>
                            <p className="text-lg font-semibold text-gray-800">
                              {booking.date} @ {booking.time || "Time TBA"}
                            </p>
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                            #{booking.id.slice(0, 6)}
                          </span>
                        </div>

                        <p className="text-gray-700 font-medium">
                          Guest: {booking.dinerName}
                        </p>
                        {booking.dinerEmail && (
                          <p className="text-gray-500 text-sm">{booking.dinerEmail}</p>
                        )}
                        <p className="text-gray-700 mt-2">👥 Party of {booking.guests}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Created {new Date(booking.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Add a deal</h3>
                  <span className="text-sm text-gray-500">Appears to diners</span>
                </div>

                <form className="grid md:grid-cols-2 gap-3" onSubmit={handleDealSubmit}>
                  <input
                    required
                    type="text"
                    placeholder="Deal title (e.g., Solo lunch combo)"
                    value={dealForm.title}
                    onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
                    className="border rounded-lg px-3 py-2 col-span-2"
                  />
                  <textarea
                    required
                    placeholder="Describe the offer, seating, or perks"
                    value={dealForm.description}
                    onChange={(e) =>
                      setDealForm({ ...dealForm, description: e.target.value })
                    }
                    className="border rounded-lg px-3 py-2 col-span-2"
                    rows={3}
                  />
                  <input
                    type="date"
                    value={dealForm.startDate}
                    onChange={(e) =>
                      setDealForm({ ...dealForm, startDate: e.target.value })
                    }
                    className="border rounded-lg px-3 py-2"
                  />
                  <input
                    type="date"
                    value={dealForm.endDate}
                    onChange={(e) => setDealForm({ ...dealForm, endDate: e.target.value })}
                    className="border rounded-lg px-3 py-2"
                  />
                  <button
                    type="submit"
                    className="col-span-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Publish deal
                  </button>
                </form>

                {deals.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {deals.map((deal) => (
                      <div
                        key={deal.id}
                        className="border rounded-lg p-3 bg-gray-50 flex items-start justify-between"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">{deal.title}</p>
                          <p className="text-gray-600 text-sm">{deal.description}</p>
                          {(deal.startDate || deal.endDate) && (
                            <p className="text-xs text-gray-500 mt-1">
                              {deal.startDate ? `From ${deal.startDate}` : ""}
                              {deal.startDate && deal.endDate ? " • " : ""}
                              {deal.endDate ? `Until ${deal.endDate}` : ""}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(deal.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Update listing details
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  Share Wi-Fi info, solo seating notes, or contact details so diners know what to expect.
                </p>

                <form className="space-y-3" onSubmit={handleDetailsSave}>
                  <input
                    type="text"
                    placeholder="Headline (e.g., Best solo counter seats)"
                    value={details.headline}
                    onChange={(e) => setDetails({ ...details, headline: e.target.value })}
                    className="border rounded-lg px-3 py-2 w-full"
                  />
                  <input
                    type="email"
                    placeholder="Contact email"
                    value={details.contactEmail}
                    onChange={(e) =>
                      setDetails({ ...details, contactEmail: e.target.value })
                    }
                    className="border rounded-lg px-3 py-2 w-full"
                  />
                  <textarea
                    placeholder="Special notes for solo diners"
                    value={details.specialNotes}
                    onChange={(e) =>
                      setDetails({ ...details, specialNotes: e.target.value })
                    }
                    className="border rounded-lg px-3 py-2 w-full"
                    rows={4}
                  />
                  <button
                    type="submit"
                    className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-black transition"
                  >
                    Save listing
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-xl shadow p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Tips for great solo visits
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2 text-sm">
                  <li>Keep a few counter or window seats open for walk-in solos.</li>
                  <li>Share Wi-Fi and outlet availability in your listing.</li>
                  <li>Highlight quieter hours with deals to attract remote workers.</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
