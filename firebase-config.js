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

const FIREBASE_CONFIG = {
  apiKey: "PASTE_API_KEY",
  authDomain: "PASTE_PROJECT.firebaseapp.com",
  projectId: "PASTE_PROJECT_ID",
  storageBucket: "PASTE_PROJECT.appspot.com",
  messagingSenderId: "PASTE_SENDER_ID",
  appId: "PASTE_APP_ID",
};

const FIREBASE_READY = FIREBASE_CONFIG.apiKey.indexOf("PASTE") === -1;
