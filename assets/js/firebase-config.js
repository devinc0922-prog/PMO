// Firebase web app settings.
// Get these from the Firebase console: Project settings → General → Your apps → (web app) → SDK setup and configuration → Config.
// These values are not secrets. Access is controlled by firestore.rules, not by hiding this file.
export const firebaseConfig = {
  apiKey: "PASTE_API_KEY",
  authDomain: "PASTE_PROJECT_ID.firebaseapp.com",
  projectId: "PASTE_PROJECT_ID",
  storageBucket: "PASTE_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "PASTE_SENDER_ID",
  appId: "PASTE_APP_ID"
};

export const isConfigured = !Object.values(firebaseConfig).some(v => String(v).includes("PASTE_"));
