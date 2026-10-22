import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getDatabase, ref, onValue, set, update, remove, get } from 'firebase/database';

export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBs_rAE7nbKwkVsojk8yaOLModifiatXpo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "playmarketdata-575e2.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://playmarketdata-575e2-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "playmarketdata-575e2",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "playmarketdata-575e2.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "970991872848",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:970991872848:web:d30381d8f8e7d61f091a55"
};

let app: any = null;
let auth: any = null;
let db: any = null;
let isFirebaseInitialized = false;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(DEFAULT_FIREBASE_CONFIG);
  auth = getAuth(app);
  db = getDatabase(app);
  isFirebaseInitialized = true;
} catch (error) {
  console.warn("Firebase initialization warning (fallback to local state active):", error);
}

export { app, auth, db, isFirebaseInitialized };
export { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  ref, 
  onValue, 
  set, 
  update, 
  remove, 
  get 
};
