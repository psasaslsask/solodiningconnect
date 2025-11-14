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

    await setDoc(
      doc(db, "bookings", profile.id.toString(), "items", bookingId),
      {
        id: bookingId,
        restaurantId: selectedRestaurant.id,
        restaurantName: selectedRestaurant.name,
        restaurantImage: selectedRestaurant.image,
        date: bookingData.date,
        time: bookingData.time,
        guests: bookingData.guests,
        createdAt: new Date().toISOString(),
      }
    );

    alert(`🎉 Your reservation at ${selectedRestaurant.name} is confirmed!`);
    setBookingOpen(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Solo-Friendly Restaurants 🍽️
      </h1>

      {/* Sort Buttons */}
      <div className="flex justify-center space-x-3 mb-6 flex-wrap">
        {["ambiance", "service", "menu", "soloScore"].map((key) => (
          <button
            key={key}
            onClick={() => handleSort(key)}
            className={`px-3 py-1 rounded-md ${
              sortBy === key ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {key === "soloScore"
              ? "Overall Score"
              : key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>

      {/* Add Restaurant Form */}
      <div className="bg-white shadow-lg rounded-lg p-5 mb-8">
        <h2 className="font-semibold text-lg mb-3">Add a New Restaurant</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <input
            name="name"
            value={newRestaurant.name}
            onChange={handleInputChange}
            placeholder="Restaurant Name"
            className="border rounded p-2"
          />
          <input
            name="location"
            value={newRestaurant.location}
            onChange={handleInputChange}
            placeholder="Location"
            className="border rounded p-2"
          />
          <input
            name="image"
            value={newRestaurant.image}
            onChange={handleInputChange}
            placeholder="Image URL (optional)"
            className="border rounded p-2"
          />
          <textarea
            name="summary"
            value={newRestaurant.summary}
            onChange={handleInputChange}
            placeholder="Short Summary"
            className="border rounded p-2 md:col-span-2"
          />

          <div className="bg-blue-50 border border-blue-200 p-3 rounded mb-4 text-sm md:col-span-2">
            <p className="font-semibold mb-1">How Scoring Works ⭐</p>
            <p>
              <strong>Each category is rated 0–10.</strong>
            </p>
            <p>The final <strong>Solo Score</strong> is the average of:</p>
            <ul className="list-disc ml-6">
              <li>Ambiance</li>
              <li>Service</li>
              <li>Menu</li>
              <li>Reviews</li>
              <li>Wait Time</li>
              <li>Safety Vibe</li>
              <li>Tech Amenities</li>
            </ul>
          </div>

          {Object.keys(newRestaurant.category).map((cat) => (
            <input
              key={cat}
              name={cat}
              type="number"
              min="0"
              max="10"
              value={newRestaurant.category[cat]}
              onChange={handleInputChange}
              placeholder={`${cat} (0–10)`}
              className="border rounded p-2"
            />
          ))}
        </div>

        <button
          onClick={handleAddRestaurant}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          ➕ Add Restaurant
        </button>
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
            className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer"
          >
            <img
              src={r.image}
              alt={r.name}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h2 className="font-semibold text-lg">{r.name}</h2>
              <p className="text-gray-500 text-sm mb-1">{r.location}</p>
              <p className="text-sm text-gray-700 mb-2">{r.summary}</p>
              <p className="font-semibold text-blue-600">
                ⭐ Solo Score: {r.soloScore.toFixed(1)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {bookingOpen && selectedRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl w-96 shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Book {selectedRestaurant.name}
              </h2>
              <button
                onClick={() => setBookingOpen(false)}
                className="text-gray-500 hover:text-gray-800 text-xl"
              >
                ✖
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="date"
                value={bookingData.date}
                onChange={(e) =>
                  setBookingData({ ...bookingData, date: e.target.value })
                }
                className="border rounded w-full p-2"
              />

              <input
                type="time"
                value={bookingData.time}
                onChange={(e) =>
                  setBookingData({ ...bookingData, time: e.target.value })
                }
                className="border rounded w-full p-2"
              />

              <input
                type="number"
                min="1"
                max="10"
                value={bookingData.guests}
                onChange={(e) =>
                  setBookingData({ ...bookingData, guests: e.target.value })
                }
                className="border rounded w-full p-2"
                placeholder="Guests"
              />

              <button
                onClick={handleConfirmBooking}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
