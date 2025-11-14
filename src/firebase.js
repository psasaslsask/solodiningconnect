// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAPi7Ybu5OYRrsQzXu-qgpxb2y6NCYAotw",
  authDomain: "solodiningconnect.firebaseapp.com",
  projectId: "solodiningconnect",
  storageBucket: "solodiningconnect.firebasestorage.app",
  messagingSenderId: "984661232221",
  appId: "1:984661232221:web:ac5cb0aeaf284398291bb4",
  measurementId: "G-YCJDTNGH62"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
