import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export default function MyBookings() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [editBooking, setEditBooking] = useState(null);

  // Fetch bookings in real time
  useEffect(() => {
    if (!profile) return;

    const ref = collection(db, "bookings", profile.id.toString(), "items");

    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const items = snapshot.docs.map((doc) => doc.data());
      setBookings(items);
    });

    return unsubscribe;
  }, [profile]);

  // Cancel booking
  const handleCancel = async (booking) => {
    await deleteDoc(
      doc(db, "bookings", profile.id.toString(), "items", booking.id)
    );

    if (booking.restaurantId) {
      await deleteDoc(
        doc(
          db,
          "restaurantBookings",
          booking.restaurantId.toString(),
          "items",
          booking.id
        )
      );
    }
    alert("Booking canceled ❌");
  };

  // Save booking updates
  const handleEditSave = async () => {
    const ref = doc(
      db,
      "bookings",
      profile.id.toString(),
      "items",
      editBooking.id
    );

    await updateDoc(ref, {
      date: editBooking.date,
      time: editBooking.time,
      guests: editBooking.guests,
    });

    if (editBooking.restaurantId) {
      const restaurantRef = doc(
        db,
        "restaurantBookings",
        editBooking.restaurantId.toString(),
        "items",
        editBooking.id
      );

      await updateDoc(restaurantRef, {
        date: editBooking.date,
        time: editBooking.time,
        guests: editBooking.guests,
      });
    }

    alert("Booking updated! 🎉");
    setEditBooking(null);
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading your bookings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">Your plans</p>
            <h1 className="text-3xl font-semibold text-slate-900">My Bookings</h1>
            <p className="text-slate-600">Track upcoming reservations, tweak times, or cancel if plans change.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-4 py-3 text-right">
            <p className="text-sm text-slate-500">Total bookings</p>
            <p className="text-3xl font-semibold text-slate-900">{bookings.length}</p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-800">No bookings yet</p>
            <p className="text-slate-600 mt-2">Browse restaurants and tap “Book now” to see your plans here.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition"
              >
                <div className="relative">
                  <img
                    src={booking.restaurantImage}
                    alt={booking.restaurantName}
                    className="w-full h-44 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <span className="absolute top-3 left-3 bg-white/90 text-slate-900 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                    Upcoming
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <h2 className="text-xl font-semibold text-slate-900">{booking.restaurantName}</h2>
                  <p className="text-slate-700">{booking.date} at {booking.time}</p>
                  <p className="text-slate-700 font-medium">Guests: {booking.guests}</p>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleCancel(booking)}
                      className="bg-white border border-slate-300 text-slate-800 px-3 py-2 rounded-xl font-semibold hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={() => setEditBooking(booking)}
                      className="bg-slate-900 text-white px-3 py-2 rounded-xl font-semibold hover:bg-slate-800 transition shadow-sm"
                    >
                      Modify
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ⭐ Edit Booking Modal */}
        {editBooking && (
          <div className="fixed inset-0 bg-slate-900/60 flex justify-center items-center z-50 px-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-lg border border-slate-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">Adjust reservation</p>
                  <h2 className="text-2xl font-bold text-slate-900">{editBooking.restaurantName}</h2>
                </div>
                <button
                  onClick={() => setEditBooking(null)}
                  className="text-slate-400 hover:text-slate-700 text-xl"
                  aria-label="Close edit booking modal"
                >
                  ✖
                </button>
              </div>

              <div className="space-y-3">
                <label className="flex flex-col gap-1 text-sm text-slate-700">
                  Date
                  <input
                    type="date"
                    className="border border-slate-200 rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    value={editBooking.date}
                    onChange={(e) =>
                      setEditBooking({ ...editBooking, date: e.target.value })
                    }
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-slate-700">
                  Time
                  <input
                    type="time"
                    className="border border-slate-200 rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    value={editBooking.time}
                    onChange={(e) =>
                      setEditBooking({ ...editBooking, time: e.target.value })
                    }
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-slate-700">
                  Guests
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="border border-slate-200 rounded-lg w-full p-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    value={editBooking.guests}
                    onChange={(e) =>
                      setEditBooking({ ...editBooking, guests: e.target.value })
                    }
                  />
                </label>

                <button
                  onClick={handleEditSave}
                  className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition shadow-sm"
                >
                  Save changes
                </button>

                <button
                  onClick={() => setEditBooking(null)}
                  className="w-full text-slate-500 text-sm underline mt-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
