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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50 relative px-4 py-8">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur border border-slate-100 rounded-3xl shadow-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center space-x-4">
          <img
            src={profile.image}
            alt={profile.name}
            className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
          />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-500 font-semibold">Solo diner</p>
            <h1 className="text-2xl font-black text-slate-900">Welcome, {profile.name}! 👋</h1>
            <p className="text-sm text-slate-600">
              {profile.style} — {profile.location}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="self-start md:self-auto bg-rose-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-rose-600 transition shadow-sm"
        >
          Logout
        </button>
      </div>

      <div className="mb-10">
        <MatchMe currentUserId={profile.id} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-indigo-500 font-semibold">Community</p>
          <h2 className="text-2xl font-bold text-slate-900">Explore other diners 🍽️</h2>
          <p className="text-slate-600 text-sm">Browse profiles and start a chat to coordinate a meal.</p>
        </div>
        <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          {otherDiners.length} diners
        </span>
      </div>

      {/* Diners Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {otherDiners.map((diner) => (
          <div
            key={diner.id}
            className="bg-white rounded-3xl shadow-md hover:shadow-2xl transition overflow-hidden border border-slate-100 flex flex-col"
          >
            <div className="relative">
              <img
                src={diner.image}
                alt={diner.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
              <span className="absolute top-3 left-3 bg-white/90 text-slate-900 text-xs font-semibold px-3 py-1 rounded-full shadow">
                {diner.location}
              </span>
              <span className="absolute top-3 right-3 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                Score {diner.rating.toFixed(1)}
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col gap-2">
              <h2 className="text-xl font-semibold text-slate-900">{diner.name}</h2>
              <p className="text-indigo-600 text-sm font-medium">{diner.style}</p>
              <p className="text-slate-700 text-sm">{diner.bio}</p>
              <p className="text-sm text-slate-600 italic">
                🍽 Favorite Cuisine: {diner.favoriteCuisine}
              </p>
              <div className="mt-auto">
                <button
                  onClick={() => openChat(diner)}
                  className="mt-3 w-full bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-sm"
                >
                  💬 Connect
                </button>
              </div>
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
