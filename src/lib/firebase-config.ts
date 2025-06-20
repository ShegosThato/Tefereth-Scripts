// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyBpXDCmZXNF9SLGao7cgOZpfGR-WaAFW10",
  authDomain: "storyspark-ai-video-producer.firebaseapp.com",
  projectId: "storyspark-ai-video-producer",
  storageBucket: "storyspark-ai-video-producer.firebasestorage.app",
  messagingSenderId: "605691304344",
  appId: "1:605691304344:web:c04845af935e919a9d73ed"
};

// Validate Firebase config
const allConfigValuesPresent = Object.values(firebaseConfig).every(value => value);

let app;
let db;

if (allConfigValuesPresent) {
  // Initialize Firebase
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
} else {
  console.error("Firebase configuration is missing. The app will run without database functionality.");
  // Set app and db to null or mock objects if you want the app to run without firebase
  app = null;
  db = null;
}


export { app, db };
