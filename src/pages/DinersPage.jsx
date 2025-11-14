import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import dinersData from "../data/diners.json";
import MatchMe from "../components/MatchMe";

// FIREBASE IMPORTS
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  Timestamp
} from "firebase/firestore";
import { db } from "../firebase";

export default function DinersPage() {
  const { profile, logout } = useAuth();
  const [diners, setDiners] = useState([]);
  const [selectedDiner, setSelectedDiner] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);

  useEffect(() => {
    setDiners(dinersData);
  }, []);

  // 👉 Open chat + create chat doc if needed + load messages
  const openChat = async (diner) => {
    setSelectedDiner(diner);

    const chatKey = [profile.id, diner.id].sort().join("_");
    const ref = doc(db, "chats", chatKey);

    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      await setDoc(ref, { messages: [] });
    }

    setChatOpen(true);
  };

  // 👉 Real-time chat listener
  useEffect(() => {
    if (!chatOpen || !selectedDiner) return;

    const chatKey = [profile.id, selectedDiner.id].sort().join("_");
    const ref = doc(db, "chats", chatKey);

    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const data = snapshot.data();
      setChatLog(data?.messages || []);
    });

    return unsubscribe;
  }, [chatOpen, selectedDiner, profile.id]);

  const closeChat = () => {
    setChatOpen(false);
    setSelectedDiner(null);
    setChatLog([]);
  };

  // 👉 Send message to Firestore
  const sendMessage = async () => {
    if (!message.trim()) return;

    const chatKey = [profile.id, selectedDiner.id].sort().join("_");
    const ref = doc(db, "chats", chatKey);

    await updateDoc(ref, {
      messages: arrayUnion({
        senderId: profile.id,
        senderName: profile.name,
        text: message,
        timestamp: Timestamp.now(),
      }),
    });

    setMessage("");
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600 text-lg">
        Loading your profile...
      </div>
    );
  }

  const otherDiners = diners.filter((d) => d.id !== profile.id);

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <img
            src={profile.image}
            alt={profile.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-blue-400"
          />
          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              Welcome, {profile.name}! 👋
            </h1>
            <p className="text-sm text-gray-500">
              {profile.style} — {profile.location}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      <MatchMe currentUserId={profile.id} />

      <h2 className="text-2xl font-semibold mt-10 mb-4 text-gray-800 text-center">
        Explore Other Diners 🍽️
      </h2>

      {/* Diners Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {otherDiners.map((diner) => (
          <div
            key={diner.id}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden"
          >
            <img
              src={diner.image}
              alt={diner.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-800">{diner.name}</h2>
              <p className="text-gray-500 text-sm">{diner.location}</p>
              <p className="mt-2 text-sm text-blue-600 font-medium">{diner.style}</p>
              <p className="mt-1 text-gray-700 text-sm">{diner.bio}</p>
              <p className="mt-2 text-sm text-gray-600 italic">
                🍽 Favorite Cuisine: {diner.favoriteCuisine}
              </p>
              <p className="mt-2 font-semibold text-yellow-600">
                ⭐ Compatibility Score: {diner.rating.toFixed(1)} / 10
              </p>
              <button
                onClick={() => openChat(diner)}
                className="mt-3 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                💬 Connect
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CHAT POPUP */}
      {chatOpen && selectedDiner && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl w-96 shadow-xl flex flex-col">
            
            {/* Chat Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                Chat with {selectedDiner.name}
              </h2>
              <button
                onClick={closeChat}
                className="text-gray-500 hover:text-gray-800 text-xl"
              >
                ✖
              </button>
            </div>

            {/* Chat Messages */}
            <div className="p-4 flex-1 overflow-y-auto h-72 bg-gray-50">
              {chatLog.length === 0 ? (
                <p className="text-gray-400 text-sm text-center mt-24">
                  Start the conversation 👋
                </p>
              ) : (
                chatLog
                  .sort((a, b) => a.timestamp?.seconds - b.timestamp?.seconds)
                  .map((msg, idx) => (
                    <div
                      key={idx}
                      className={`mb-2 ${
                        msg.senderId === profile.id ? "text-right" : "text-left"
                      }`}
                    >
                      <span
                        className={`inline-block px-3 py-2 rounded-lg ${
                          msg.senderId === profile.id
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {msg.text}
                      </span>
                    </div>
                  ))
              )}
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t flex">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={sendMessage}
                className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Send
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
