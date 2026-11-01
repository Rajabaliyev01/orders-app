/**
 * FIREBASE SETUP & CONFIGURATION (SDK v9+ Modular)
 * ------------------------------------------------
 * Firebase Auth, Google Auth va Firestore Database initsializatsiyasi.
 * Vite (.env.local: VITE_FIREBASE_*) hamda Next.js (process.env: NEXT_PUBLIC_FIREBASE_*)
 * standartlarini avtomatik aniqlaydi va qo'llab-quvvatlaydi.
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  type Auth,
  type UserCredential,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// Muhit o'zgaruvchilarini Vite yoki Next.js dan xavfsiz o'qish
const getEnvVar = (key: string): string => {
  // 1. Vite muhiti (import.meta.env)
  try {
    if (typeof import.meta !== "undefined" && import.meta.env) {
      const viteVal = (import.meta.env as Record<string, string>)[`VITE_${key}`];
      if (viteVal) return viteVal;
    }
  } catch {
    // import.meta mavjud bo'lmagan muhit
  }

  // 2. Next.js / Node muhiti (process.env)
  try {
    if (typeof process !== "undefined" && process.env) {
      const nextVal = process.env[`NEXT_PUBLIC_${key}`] || process.env[`VITE_${key}`];
      if (nextVal) return nextVal;
    }
  } catch {
    // process mavjud bo'lmagan muhit
  }

  return "";
};

const firebaseConfig = {
  apiKey: getEnvVar("FIREBASE_API_KEY"),
  authDomain: getEnvVar("FIREBASE_AUTH_DOMAIN"),
  projectId: getEnvVar("FIREBASE_PROJECT_ID"),
  storageBucket: getEnvVar("FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnvVar("FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnvVar("FIREBASE_APP_ID"),
};

// Kalitlar haqiqiy kiritilganligini tekshirish
export const isFirebaseConfigured: boolean = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey.trim() !== "" &&
  !firebaseConfig.apiKey.includes("your_api_key") &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId.trim() !== "" &&
  !firebaseConfig.projectId.includes("your_project_id")
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider = new GoogleAuthProvider();

// Google Auth sozlamalari (har doim akkount tanlash oynasini chiqarish)
googleProvider.setCustomParameters({
  prompt: "select_account",
});

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    console.info("🔥 [Firebase] Modular SDK v9+ muvaffaqiyatli initsializatsiya qilindi!");
  } catch (error) {
    console.error("❌ [Firebase] Initsializatsiya xatosi:", error);
  }
} else {
  console.warn(
    "⚠️ [Firebase] Konfiguratsiya kalitlari topilmadi. Ilova lokal/demo rejimida ishlamoqda. " +
    ".env.local faylini to'ldiring."
  );
}

// ----------------------------------------------------
// AUTHENTICATION HELPER SERVICES
// ----------------------------------------------------

/**
 * Email va parol orqali tizimga kirish
 */
export const signInUserWithEmail = async (
  email: string,
  pass: string
): Promise<UserCredential | null> => {
  if (!auth) throw new Error("Firebase Auth ulanmagan");
  return await signInWithEmailAndPassword(auth, email, pass);
};

/**
 * Yangi foydalanuvchini ro'yxatdan o'tkazish
 */
export const registerUserWithEmail = async (
  email: string,
  pass: string,
  displayName?: string
): Promise<UserCredential | null> => {
  if (!auth) throw new Error("Firebase Auth ulanmagan");
  const credential = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName && credential.user) {
    await updateProfile(credential.user, { displayName });
  }
  return credential;
};

/**
 * Google orqali tizimga kirish (Popup)
 */
export const signInUserWithGoogle = async (): Promise<UserCredential | null> => {
  if (!auth) throw new Error("Firebase Auth ulanmagan");
  return await signInWithPopup(auth, googleProvider);
};

/**
 * Tizimdan chiqish
 */
export const logoutUser = async (): Promise<void> => {
  if (auth) {
    await signOut(auth);
  }
};

/**
 * Parolni tiklash pochtasini yuborish
 */
export const resetUserPassword = async (email: string): Promise<void> => {
  if (!auth) throw new Error("Firebase Auth ulanmagan");
  await sendPasswordResetEmail(auth, email);
};

export { app, auth, db, googleProvider };

const firebaseServices = {
  app,
  auth,
  db,
  googleProvider,
  isFirebaseConfigured,
  signInUserWithEmail,
  registerUserWithEmail,
  signInUserWithGoogle,
  logoutUser,
  resetUserPassword,
};

export default firebaseServices;

