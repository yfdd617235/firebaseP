// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8BPoKjLv2AivYJq_WsB9Qx-oyKYcx2D8",
  authDomain: "ppi-store.firebaseapp.com",
  projectId: "ppi-store",
  storageBucket: "ppi-store.firebasestorage.app",
  messagingSenderId: "211085153536",
  appId: "1:211085153536:web:289965851f4f008cc9cfe5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);