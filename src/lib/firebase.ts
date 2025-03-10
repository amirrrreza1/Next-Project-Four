// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// تنظیمات Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA0nyFNX1yZACI-0PjGdtpxtDAHPLpz98k",
  authDomain: "product-log-f98ae.firebaseapp.com",
  projectId: "product-log-f98ae",
  storageBucket: "product-log-f98ae.firebasestorage.app",
  messagingSenderId: "42097558573",
  appId: "1:42097558573:web:7dff4ee4f495d5387464a4",
  measurementId: "G-64BHWYVC4H",
};

// مقداردهی اولیه Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export { db, analytics };
