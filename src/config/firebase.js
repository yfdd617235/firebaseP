// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import {getAuth, GoogleAuthProvider} from 'firebase/auth';
// import {getFirestore} from 'firebase/firestore';
// import { getStorage } from "firebase/storage";

// const firebaseConfig = {
//   apiKey: "AIzaSyC8BPoKjLv2AivYJq_WsB9Qx-oyKYcx2D8",
//   authDomain: "ppi-store.firebaseapp.com",
//   projectId: "ppi-store",
//   storageBucket: "ppi-store.firebasestorage.app",
//   messagingSenderId: "211085153536",
//   appId: "1:211085153536:web:289965851f4f008cc9cfe5"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);


// export const auth = getAuth(app);
// export const googleProvider = new GoogleAuthProvider();
// export const db = getFirestore(app);
// export const storage = getStorage(app); 

// src/config/firebase.js
// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);