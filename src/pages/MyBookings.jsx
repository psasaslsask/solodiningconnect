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
  const handleCancel = async (bookingId) => {
    await deleteDoc(
      doc(db, "bookings", profile.id.toString(), "items", bookingId)
    );
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">My Bookings 📅</h1>

      {bookings.length === 0 ? (
        <p className="text-gray-600 text-center">You have no bookings yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white shadow-md rounded-xl overflow-hidden"
            >
              <img
                src={booking.restaurantImage}
                alt={booking.restaurantName}
                className="w-full h-40 object-cover"
              />

              <div className="p-4">
                <h2 className="text-lg font-semibold">
                  {booking.restaurantName}
                </h2>
                <p className="text-gray-600">
                  📅 {booking.date} at {booking.time}
                </p>
                <p className="text-gray-700">👥 Guests: {booking.guests}</p>

                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => handleCancel(booking.id)}
                    className="flex-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => setEditBooking(booking)}
                    className="flex-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl w-96 p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Edit Booking</h2>

            <input
              type="date"
              className="border rounded w-full p-2 mb-3"
              value={editBooking.date}
              onChange={(e) =>
                setEditBooking({ ...editBooking, date: e.target.value })
              }
            />

            <input
              type="time"
              className="border rounded w-full p-2 mb-3"
              value={editBooking.time}
              onChange={(e) =>
                setEditBooking({ ...editBooking, time: e.target.value })
              }
            />

            <input
              type="number"
              min="1"
              max="10"
              className="border rounded w-full p-2 mb-4"
              value={editBooking.guests}
              onChange={(e) =>
                setEditBooking({ ...editBooking, guests: e.target.value })
              }
            />

            <button
              onClick={handleEditSave}
              className="w-full bg-blue-500 text-white py-2 rounded mb-2 hover:bg-blue-600"
            >
              Save Changes
            </button>

            <button
              onClick={() => setEditBooking(null)}
              className="w-full text-gray-500 text-sm underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
