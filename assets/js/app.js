// Shared Firebase helpers: Google sign-in, the team allowlist, and intake storage.
// Firestore layout:
//   members/{email}   { name, role: "admin" | "pm" | "submitter" }   (doc id = lowercase Google email)
//   intakes/{id}      { type, status, core: {...}, details: {...}, submittedBy, submittedByName,
//                       submittedAt (ISO text), updatedAt (server time), updatedBy }
import { firebaseConfig, isConfigured } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc, collection, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

export { isConfigured };
export const ROLES = { admin: "Admin", pm: "Project manager", submitter: "Submitter" };

let app, auth, db;
function init() {
  if (!isConfigured) throw new Error("Firebase is not configured yet. Fill in assets/js/firebase-config.js.");
  if (!app) { app = initializeApp(firebaseConfig); auth = getAuth(app); db = getFirestore(app); }
}

/* ---------- auth ---------- */
// cb({ user, email, member, lookupError }) — member is null when signed in but not on the team list; user is null when signed out.
// lookupError is set when the team-list check itself failed (offline, blocked, misconfigured), as opposed to "not on the list".
export function watchSession(cb) {
  init();
  return onAuthStateChanged(auth, async user => {
    if (!user) return cb({ user: null, email: null, member: null, lookupError: null });
    const email = (user.email || "").toLowerCase();
    let member = null, lookupError = null;
    try { const snap = await getDoc(doc(db, "members", email)); if (snap.exists()) member = snap.data(); }
    catch (e) {
      // Not on the list: the rules deny the read. Anything else is a real failure worth showing.
      if (!/permission-denied/i.test(String(e && (e.code || e.message)))) { lookupError = e; console.error("Team list lookup failed", e); }
    }
    cb({ user, email, member, lookupError });
  });
}
export async function signIn() { init(); await signInWithPopup(auth, new GoogleAuthProvider()); }
export async function signOut() { init(); await fbSignOut(auth); }

/* ---------- team (admins change it) ---------- */
export function watchMembers(cb, onError) {
  init();
  return onSnapshot(collection(db, "members"), s => cb(s.docs.map(d => ({ email: d.id, ...d.data() }))), onError);
}
export function addMember(email, name, role = "submitter") {
  init();
  return setDoc(doc(db, "members", email.trim().toLowerCase()), { name: name.trim(), role });
}
export function removeMember(email) { init(); return deleteDoc(doc(db, "members", email)); }

/* ---------- intakes ---------- */
export function watchIntakes(cb, onError) {
  init();
  return onSnapshot(collection(db, "intakes"), s => cb(s.docs.map(d => ({ ...d.data(), _id: d.id }))), onError);
}
export async function createIntake(me, data) {
  init();
  const ref = await addDoc(collection(db, "intakes"), {
    ...data, status: "New", submittedBy: me.email, submittedByName: me.name,
    submittedAt: new Date().toISOString(), updatedAt: serverTimestamp(), updatedBy: me.email
  });
  return ref.id;
}
// Replaces the form fields; keeps who submitted it, when, and its status.
export function saveIntake(me, id, data) {
  init();
  return updateDoc(doc(db, "intakes", id), { type: data.type, core: data.core, details: data.details, updatedAt: serverTimestamp(), updatedBy: me.email });
}
export function setIntakeStatus(me, id, status) {
  init();
  return updateDoc(doc(db, "intakes", id), { status, updatedAt: serverTimestamp(), updatedBy: me.email });
}
export function deleteIntake(id) { init(); return deleteDoc(doc(db, "intakes", id)); }

/* ---------- small helpers ---------- */
export const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export function friendlyError(e) {
  const m = String((e && (e.code || e.message)) || e);
  if (/permission-denied|insufficient permissions/i.test(m)) return "You don't have access to do that. Ask an admin to check your role on the Team page.";
  if (/popup-closed|cancelled-popup/i.test(m)) return "Sign-in was closed before it finished.";
  if (/unauthorized-domain/i.test(m)) return "This site's address isn't on Firebase's authorized domains list yet (see SETUP.md, step 4).";
  if (/popup-blocked/i.test(m)) return "Your browser blocked the sign-in popup. Allow popups for this site and try again.";
  if (/offline|unavailable|network/i.test(m)) return "Couldn't reach the database. A browser extension (ad or tracker blocker) may be blocking firestore.googleapis.com, or the connection dropped. Try another browser or disable the blocker for this site.";
  if (/failed-precondition|not-found|NOT_FOUND/i.test(m)) return "The Firestore database wasn't found. Check that it exists and is named (default).";
  return m;
}
