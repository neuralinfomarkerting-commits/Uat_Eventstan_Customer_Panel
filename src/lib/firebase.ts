import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCurqodmaSicZ8PFT_4W6qKCEYmjETmpV4",
  authDomain: "eventstan-6c5e6.firebaseapp.com",
  projectId: "eventstan-6c5e6",
  storageBucket: "eventstan-6c5e6.firebasestorage.app",
  messagingSenderId: "286620476841",
  appId: "1:286620476841:web:ae5a9c8ecd1b3336ce50b8",
  measurementId: "G-LWSKPMB89Y",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export async function getGoogleIdToken() {
  const credential = await signInWithPopup(getAuth(app), new GoogleAuthProvider());
  return credential.user.getIdToken(true);
}
