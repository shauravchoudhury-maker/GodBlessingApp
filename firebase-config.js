// firebase-config.js
// Paste your Firebase project's WEB config below. These values are PUBLIC and
// safe to commit — security is enforced by Firestore rules, not by hiding them.
//
// How to get them:
//   1. https://console.firebase.google.com  →  Add project (free "Spark" plan)
//   2. Build → Firestore Database → Create database → Production mode → (pick a region)
//   3. Project settings (gear) → "Your apps" → Web app (</>) → register → copy the
//      firebaseConfig object → paste its values here.
//   4. Paste the Firestore security rules from FIREBASE_RULES.txt into
//      Firestore → Rules → Publish.
//
// Until real values are pasted, reactions/comments/trending stay gracefully off.

// Google sign-in runs its popup on the authDomain and hands the result back
// to the page through a hidden iframe. When those are different origins,
// Firefox and Safari partition the storage between them and the handshake
// fails ("auth/popup-closed-by-user"). The fix is to serve the handler from
// our own domain via auth-proxy-worker.js — see AUTH_PROXY_SETUP.txt.
//
// Flip this to true ONLY after the Worker is live on eververse.org/__/auth/*.
// Flipping it early breaks sign-in for everyone, because the handler will
// not exist at that address yet. localhost keeps using Firebase's domain
// either way, which is fine — localhost is exempt from the partitioning.
const AUTH_PROXY_LIVE = false;
const AUTH_DOMAIN = (AUTH_PROXY_LIVE && /(^|\.)eververse\.org$/.test(location.hostname))
  ? location.hostname
  : "eververse2117.firebaseapp.com";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCD7IWtNtfyxVHo0GcEiUwAZN2RGB8u8vc",
  authDomain: AUTH_DOMAIN,
  projectId: "eververse2117",
  storageBucket: "eververse2117.firebasestorage.app",
  messagingSenderId: "666579920808",
  appId: "1:666579920808:web:00a1d0a3348f7e3aa2df9d",
};

const FIREBASE_READY = FIREBASE_CONFIG.apiKey.indexOf("PASTE") === -1;
