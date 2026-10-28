// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDFDaInm-U01o91HMUR46luCmRKb16HAV4",
  authDomain: "project-management-offic-a2dfb.firebaseapp.com",
  projectId: "project-management-offic-a2dfb",
  storageBucket: "project-management-offic-a2dfb.firebasestorage.app",
  messagingSenderId: "243852710497",
  appId: "1:243852710497:web:880cee2d9749c940599020",
  measurementId: "G-1LJT9TTZYE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
