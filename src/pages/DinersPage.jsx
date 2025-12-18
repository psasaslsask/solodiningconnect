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
  Timestamp,
  collection
} from "firebase/firestore";
import { db } from "../firebase";

export default function DinersPage() {
  const { profile, logout } = useAuth();
  const [diners, setDiners] = useState([]);
  const [selectedDiner, setSelectedDiner] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [blockedDiners, setBlockedDiners] = useState([]);

  useEffect(() => {
    const baseDiners = dinersData;
    setDiners(baseDiners);

    const dinersRef = collection(db, "diners");
    const unsubscribe = onSnapshot(dinersRef, (snapshot) => {
      const firebaseDiners = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const merged = [...baseDiners];

      firebaseDiners.forEach((diner) => {
        const matchIndex = merged.findIndex(
          (d) =>
            d.id === diner.id ||
            (d.email && diner.email && d.email.toLowerCase() === diner.email.toLowerCase())
        );

        if (matchIndex !== -1) {
          merged[matchIndex] = { ...merged[matchIndex], ...diner };
        } else {
          merged.push(diner);
        }
      });

      setDiners(merged);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const storedBlocked = localStorage.getItem("blockedDiners");
    if (storedBlocked) {
      setBlockedDiners(JSON.parse(storedBlocked));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("blockedDiners", JSON.stringify(blockedDiners));
  }, [blockedDiners]);

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
    if (!chatOpen || !selectedDiner || !profile) return;
    if (!chatOpen || !selectedDiner || !profile) return;

    const chatKey = [profile.id, selectedDiner.id].sort().join("_");
    const ref = doc(db, "chats", chatKey);

    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const data = snapshot.data();
      setChatLog(data?.messages || []);
    });

    return unsubscribe;
  }, [chatOpen, selectedDiner, profile?.id]);

  const closeChat = () => {
    setChatOpen(false);
    setSelectedDiner(null);
    setChatLog([]);
  };

  const blockDiner = (diner) => {
    const confirmBlock = window.confirm(
      `Block ${diner.name}? They will be hidden from your list and won't be able to chat with you.\nYou can unblock them by clearing your blocked list later.`
    );

    if (!confirmBlock) return;

    setBlockedDiners((prev) => {
      if (prev.includes(diner.id)) return prev;
      return [...prev, diner.id];
    });

    if (selectedDiner?.id === diner.id) {
      closeChat();
    }
  };

  const unblockDiner = (dinerId) => {
    setBlockedDiners((prev) => prev.filter((id) => id !== dinerId));
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

  const otherDiners = diners.filter(
    (d) => d.id !== profile.id && !blockedDiners.includes(d.id)
  );

  const blockedProfiles = diners.filter((d) => blockedDiners.includes(d.id));

  return (
    <div className="min-h-screen bg-neutral-100 relative px-4 py-8">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center space-x-4">
          <img
            src={profile.image}
            alt={profile.name}
            className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
          />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">Solo diner</p>
            <h1 className="text-2xl font-semibold text-slate-900">Welcome, {profile.name}!</h1>
            <p className="text-sm text-slate-600">
              {profile.style} — {profile.location}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="self-start md:self-auto bg-white border border-slate-300 text-slate-800 px-4 py-2 rounded-xl font-semibold hover:bg-slate-50 transition"
        >
          Logout
        </button>
      </div>

      <div className="mb-10">
        <MatchMe currentUserId={profile.id} currentUser={profile} dinersList={diners} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500 font-semibold">Community</p>
          <h2 className="text-2xl font-semibold text-slate-900">Explore other diners</h2>
          <p className="text-slate-600 text-sm">Browse profiles and start a chat to coordinate a meal.</p>
        </div>
        <span className="text-sm font-semibold text-slate-700 bg-neutral-100 px-3 py-1 rounded-full border border-slate-200">
          {otherDiners.length} diners
        </span>
      </div>

      {blockedProfiles.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 mb-6 text-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">You have blocked {blockedProfiles.length} diner{blockedProfiles.length > 1 ? "s" : ""}.</p>
              <p className="text-amber-800 text-xs mt-1">They are hidden from your list. You can unblock them anytime below.</p>
              <ul className="mt-3 space-y-2">
                {blockedProfiles.map((diner) => (
                  <li
                    key={diner.id}
                    className="flex items-center justify-between bg-white/70 border border-amber-200 rounded-xl px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={diner.image}
                        alt={diner.name}
                        className="w-8 h-8 rounded-full object-cover border border-amber-100"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{diner.name}</p>
                        <p className="text-xs text-amber-800">{diner.location}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => unblockDiner(diner.id)}
                      className="text-xs font-semibold text-amber-900 border border-amber-300 rounded-lg px-3 py-1 hover:bg-amber-100 transition"
                    >
                      Unblock
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Diners Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {otherDiners.map((diner) => (
          <div
            key={diner.id}
            className="bg-white rounded-3xl shadow-sm hover:shadow-lg transition overflow-hidden border border-slate-200 flex flex-col"
          >
            <div className="relative">
              <img
                src={diner.image}
                alt={diner.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <span className="absolute top-3 left-3 bg-white/90 text-slate-900 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                {diner.location}
              </span>
              <span className="absolute top-3 right-3 bg-slate-900 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                Score {diner.rating.toFixed(1)}
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col gap-2">
              <h2 className="text-xl font-semibold text-slate-900">{diner.name}</h2>
              <p className="text-slate-700 text-sm font-medium">{diner.style}</p>
              <p className="text-slate-700 text-sm">{diner.bio}</p>
              <p className="text-sm text-slate-600 italic">
                Favorite Cuisine: {diner.favoriteCuisine}
              </p>
              <div className="mt-auto">
                <button
                  onClick={() => openChat(diner)}
                  className="mt-3 w-full bg-slate-900 text-white px-4 py-2 rounded-xl font-semibold hover:bg-slate-800 transition shadow-sm"
                >
                  Start chat
                </button>
                <button
                  onClick={() => blockDiner(diner)}
                  className="mt-2 w-full border border-red-200 text-red-700 px-4 py-2 rounded-xl font-semibold hover:bg-red-50 transition"
                >
                  Block diner
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CHAT POPUP */}
      {chatOpen && selectedDiner && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl w-96 shadow-lg border border-slate-200 flex flex-col">

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
            <div className="p-4 flex-1 overflow-y-auto h-72 bg-neutral-50">
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
                            ? "bg-slate-900 text-white"
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
                className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
              <button
                onClick={sendMessage}
                className="ml-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition"
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
