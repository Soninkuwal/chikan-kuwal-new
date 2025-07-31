import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBkOqX7TXrt9mVKXqsORxPPH4C-mJFxT2I",
  authDomain: "tast-c4ef5.firebaseapp.com",
  databaseURL: "https://tast-c4ef5-default-rtdb.firebaseio.com",
  projectId: "tast-c4ef5",
  storageBucket: "tast-c4ef5.firebasestorage.app",
  messagingSenderId: "1058727093229",
  appId: "1:1058727093229:web:2af8b17d3472857b687de4",
  measurementId: "G-GL596W4NJE"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const database = getDatabase(app);

export { app, database };
