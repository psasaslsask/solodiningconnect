import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import restaurantsData from "../data/restaurants.json";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function RestaurantDashboard() {
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(
    restaurantsData[0]?.id || null
  );
  const [bookings, setBookings] = useState([]);
  const [now, setNow] = useState(new Date());

  // Subscribe to bookings for the selected restaurant
  useEffect(() => {
    if (!selectedRestaurantId) return;

    const ref = collection(
      db,
      "restaurantBookings",
      selectedRestaurantId.toString(),
      "items"
    );

    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const items = snapshot.docs.map((d) => d.data());
      setBookings(items);
    });

    return unsubscribe;
  }, [selectedRestaurantId]);

  // Tick time so past bookings drop away without data churn
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

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

  const selectedRestaurant = useMemo(
    () =>
      restaurantsData.find((restaurant) => restaurant.id === selectedRestaurantId),
    [selectedRestaurantId]
  );

  const upcomingBooking = upcomingBookings.find((booking) => booking.date && booking.time);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Restaurant Dashboard 🍽️
              </h1>
              <p className="text-gray-600 mt-1">
                Review upcoming reservations and diner details in one place.
              </p>
            </div>

            <div className="mt-4 md:mt-0">
              <label className="block text-sm text-gray-600 mb-1">
                Select a restaurant
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
          </div>

          {selectedRestaurant && (
            <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedRestaurant.name}
                </h2>
                <p className="text-gray-600 text-sm">{selectedRestaurant.location}</p>
                <p className="text-blue-600 font-medium mt-1">
                  Solo Score: {selectedRestaurant.soloScore.toFixed(1)}
                </p>
              </div>

              <div className="flex space-x-4 mt-4 md:mt-0">
                <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                  <p className="text-sm text-gray-500">Total bookings</p>
                  <p className="text-2xl font-bold text-blue-700">{upcomingBookings.length}</p>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-3">
                  <p className="text-sm text-gray-500">Next arrival</p>
                  <p className="text-lg font-semibold text-green-700">
                    {upcomingBooking
                      ? `${upcomingBooking.date} @ ${upcomingBooking.time}`
                      : "No upcoming"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Reservations</h3>
            {upcomingBookings.length === 0 ? (
              <p className="text-gray-600">No bookings yet for this restaurant.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {upcomingBookings.map((booking) => (
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
                      <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                        #{booking.id.slice(0, 6)}
                      </span>
                    </div>

                    <p className="text-gray-700 font-medium">Guest: {booking.dinerName}</p>
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
        </div>
      </div>
    </>
  );
}
