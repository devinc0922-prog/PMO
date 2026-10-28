// Firebase web app settings.
// Get these from the Firebase console: Project settings → General → Your apps → (web app) → SDK setup and configuration → Config.
// Paste only the values into this object. Don't paste Firebase's import/initializeApp lines; app.js does that.
// These values are not secrets. Access is controlled by firestore.rules, not by hiding this file.
export const firebaseConfig = {
  apiKey: "AIzaSyDFDaInm-U01o91HMUR46luCmRKb16HAV4",
  authDomain: "project-management-offic-a2dfb.firebaseapp.com",
  projectId: "project-management-offic-a2dfb",
  storageBucket: "project-management-offic-a2dfb.firebasestorage.app",
  messagingSenderId: "243852710497",
  appId: "1:243852710497:web:880cee2d9749c940599020"
};

export const isConfigured = !Object.values(firebaseConfig).some(v => String(v).includes("PASTE_"));
