// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage'
import { getFirestore } from "@firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDqOTsKf-rfYEoQ0FZHukAoBxD6LkTHLxQ",
  authDomain: "tomta-tech-rewards.firebaseapp.com",
  projectId: "tomta-tech-rewards",
  storageBucket: "tomta-tech-rewards.appspot.com",
  messagingSenderId: "413171331299",
  appId: "1:413171331299:web:2b4bb00bb2a707c0ba95d6",
  measurementId: "G-CP1Z96PJN5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const imgDB = getStorage(app)
const db = getFirestore(app);
const auth = getAuth();
export {imgDB,db,auth};
