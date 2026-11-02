/**
 * FIREBASE SETUP & CONFIGURATION (SDK v9+ Modular)
 * ------------------------------------------------
 * Firebase Auth, Google Auth, Firestore Database hamda Analytics initsializatsiyasi.
 * ordersapp-01 loyihasi uchun to'liq sozlangan.
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
  sendEmailVerification,
  type Auth,
  type UserCredential,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import type { Product } from "../types";

// Muhit o'zgaruvchilarini Vite yoki Next.js dan xavfsiz o'qish
const getEnvVar = (key: string): string => {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env) {
      const viteVal = (import.meta.env as Record<string, string>)[`VITE_${key}`];
      if (viteVal) return viteVal;
    }
  } catch {
    // import.meta mavjud bo'lmagan muhit
  }

  try {
    if (typeof process !== "undefined" && process?.env) {
      const nextVal = process.env[`NEXT_PUBLIC_${key}`] || process.env[`VITE_${key}`];
      if (nextVal) return nextVal;
    }
  } catch {
    // process mavjud bo'lmagan muhit
  }

  return "";
};

const firebaseConfig = {
  apiKey: getEnvVar("FIREBASE_API_KEY") || "AIzaSyD6Ujl5ANXe35vSWsSXHExBJ9nGCdwwNgI",
  authDomain: getEnvVar("FIREBASE_AUTH_DOMAIN") || "ordersapp-01.firebaseapp.com",
  projectId: getEnvVar("FIREBASE_PROJECT_ID") || "ordersapp-01",
  storageBucket: getEnvVar("FIREBASE_STORAGE_BUCKET") || "ordersapp-01.firebasestorage.app",
  messagingSenderId: getEnvVar("FIREBASE_MESSAGING_SENDER_ID") || "657504068261",
  appId: getEnvVar("FIREBASE_APP_ID") || "1:657504068261:web:af924599c083d963c9e34c",
  measurementId: getEnvVar("FIREBASE_MEASUREMENT_ID") || "G-QC1YG3CHZ9",
};

// Kalitlar mavjudligini tekshirish
export const isFirebaseConfigured: boolean = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes("your_api_key")
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let analytics: Analytics | null = null;
let googleProvider: GoogleAuthProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);

    // Analytics brauzerda qo'llab-quvvatlansa ishga tushirish
    if (typeof window !== "undefined") {
      isSupported().then((supported) => {
        if (supported && app) {
          analytics = getAnalytics(app);
          console.info("📊 [Firebase Analytics] Faollashtirildi");
        }
      }).catch(() => {
        // Analytics xatosi ilovaga xalaqit bermaydi
      });
    }

    console.info("🔥 [Firebase] ordersapp-01 loyihasi muvaffaqiyatli ulandi!");
  } catch (error) {
    console.error("❌ [Firebase] Initsializatsiya xatosi:", error);
  }
} else {
  console.warn("⚠️ [Firebase] Konfiguratsiya kalitlari topilmadi.");
}

// ----------------------------------------------------
// AUTHENTICATION HELPER SERVICES
// ----------------------------------------------------

export const signInUserWithEmail = async (
  email: string,
  pass: string
): Promise<UserCredential | null> => {
  if (!auth) throw new Error("Firebase Auth ulanmagan");
  return await signInWithEmailAndPassword(auth, email, pass);
};

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

export const signInUserWithGoogle = async (): Promise<UserCredential | null> => {
  if (!auth) throw new Error("Firebase Auth ulanmagan");
  return await signInWithPopup(auth, googleProvider);
};

export const logoutUser = async (): Promise<void> => {
  if (auth) {
    await signOut(auth);
  }
};

export const resetUserPassword = async (email: string): Promise<void> => {
  if (!auth) throw new Error("Firebase Auth ulanmagan");
  await sendPasswordResetEmail(auth, email);
};

// ----------------------------------------------------
// FIRESTORE PRODUCTS SERVICES (Sotuvchilar uchun)
// ----------------------------------------------------

/**
 * Yangi mahsulotni Firestore 'products' kolleksiyasiga qo'shish
 */
export const addProductToFirestore = async (
  productData: Omit<Product, "id">
): Promise<string> => {
  if (!db) throw new Error("Firestore ulanmagan");
  const docRef = await addDoc(collection(db, "products"), {
    ...productData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Firestore'dagi mahsulotni yangilash
 */
export const updateProductInFirestore = async (
  productId: string,
  productData: Partial<Product>
): Promise<void> => {
  if (!db) throw new Error("Firestore ulanmagan");
  const docRef = doc(db, "products", productId);
  await updateDoc(docRef, {
    ...productData,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Firestore'dan mahsulotni o'chirish
 */
export const deleteProductFromFirestore = async (
  productId: string
): Promise<void> => {
  if (!db) throw new Error("Firestore ulanmagan");
  const docRef = doc(db, "products", productId);
  await deleteDoc(docRef);
};

/**
 * Foydalanuvchiga email tasdiqlash xatini yuborish (Firebase Templates orqali)
 */
export const sendVerificationEmail = async (user?: FirebaseUser | null): Promise<void> => {
  const targetUser = user || auth?.currentUser;
  if (!targetUser) throw new Error("Foydalanuvchi tizimga kirmagan");
  await sendEmailVerification(targetUser);
};

/**
 * Foydalanuvchi ma'lumotlarini qayta yuklab, email tasdiqlanganligini tekshirish
 */
export const reloadCurrentUser = async (): Promise<boolean> => {
  if (!auth?.currentUser) return false;
  await auth.currentUser.reload();
  return Boolean(auth.currentUser.emailVerified);
};

export { app, auth, db, analytics, googleProvider };

const firebaseServices = {
  app,
  auth,
  db,
  analytics,
  googleProvider,
  isFirebaseConfigured,
  signInUserWithEmail,
  registerUserWithEmail,
  signInUserWithGoogle,
  logoutUser,
  resetUserPassword,
  sendVerificationEmail,
  reloadCurrentUser,
  addProductToFirestore,
  updateProductInFirestore,
  deleteProductFromFirestore,
};

export default firebaseServices;
