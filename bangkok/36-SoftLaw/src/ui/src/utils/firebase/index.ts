// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: "softlaw-6b047.firebaseapp.com",
  projectId: "softlaw-6b047",
  storageBucket: "softlaw-6b047.firebasestorage.app",
  messagingSenderId: "709897548983",
  appId: "1:709897548983:web:f5fc87cf74085d86348932",
  measurementId: "G-BBNJ3G2RLQ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


