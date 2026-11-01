/**
 * AUTHENTICATION & ORDERS CONTEXT (Firebase SDK v9+ Modular)
 * -------------------------------------------------------------
 * Foydalanuvchi hisobi, kirish/ro'yxatdan o'tish (Email & Google Auth),
 * hamda Firestore buyurtmalar tarixi bilan integratsiya.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  auth,
  db,
  googleProvider,
  isFirebaseConfigured,
} from "../lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import type { AppUser, Order, CustomerDetails, CartItem, OrderPricing, PaymentMethod } from "../types";

export interface CreateOrderParams {
  customer: CustomerDetails;
  items: CartItem[];
  pricing: OrderPricing;
  paymentMethod: PaymentMethod;
}

export interface AuthContextValue {
  currentUser: AppUser | null;
  loading: boolean;
  orders: Order[];
  authModalOpen: boolean;
  authMode: "login" | "signup";
  ordersModalOpen: boolean;
  isFirebaseConfigured: boolean;
  setAuthModalOpen: (open: boolean) => void;
  setAuthMode: (mode: "login" | "signup") => void;
  setOrdersModalOpen: (open: boolean) => void;
  login: (email: string, pass: string) => Promise<unknown>;
  signup: (email: string, pass: string, displayName?: string) => Promise<unknown>;
  loginWithGoogle: () => Promise<unknown>;
  logout: () => Promise<void>;
  createOrder: (orderData: CreateOrderParams) => Promise<Order>;
  loadOrders: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const LOCAL_USER_KEY = "orders_app_demo_user";
const LOCAL_ORDERS_KEY = "orders_app_orders_history";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [ordersModalOpen, setOrdersModalOpen] = useState<boolean>(false);

  // Auth holatini tinglash (Modular SDK onAuthStateChanged)
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
        if (user) {
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || (user.email ? user.email.split("@")[0] : "Foydalanuvchi"),
            photoURL: user.photoURL || null,
          });
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Demo fallback (Firebase kalitlari bo'lmasa)
      try {
        const saved = localStorage.getItem(LOCAL_USER_KEY);
        if (saved) {
          setCurrentUser(JSON.parse(saved));
        }
      } catch (err) {
        console.warn("Demo foydalanuvchini yuklashda xatolik:", err);
      }
      setLoading(false);
    }
  }, []);

  /**
   * Mahalliy xotiradan buyurtmalarni yuklash
   */
  const loadLocalOrders = useCallback(() => {
    try {
      const local = localStorage.getItem(LOCAL_ORDERS_KEY);
      const allOrders: Order[] = local ? JSON.parse(local) : [];
      if (currentUser) {
        setOrders(allOrders.filter((o) => o.userId === currentUser.uid || o.userId === "guest"));
      } else {
        setOrders(allOrders);
      }
    } catch {
      setOrders([]);
    }
  }, [currentUser]);

  /**
   * Buyurtmalarni yuklash (Firestore yoki LocalStorage)
   */
  const loadOrders = useCallback(async () => {
    if (!currentUser) {
      loadLocalOrders();
      return;
    }

    if (isFirebaseConfigured && db) {
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
        const fetchedOrders: Order[] = [];
        querySnapshot.forEach((doc) => {
          fetchedOrders.push({ id: doc.id, ...(doc.data() as Omit<Order, "id">) });
        });
        setOrders(fetchedOrders);
      } catch (err) {
        console.warn("⚠️ Firestore'dan buyurtmalarni olishda ogohlantirish (lokal ishlatiladi):", err);
        loadLocalOrders();
      }
    } else {
      loadLocalOrders();
    }
  }, [currentUser, loadLocalOrders]);

  useEffect(() => {
    loadOrders();
  }, [currentUser, loadOrders]);

  /**
   * Email va parol orqali tizimga kirish
   */
  const login = async (email: string, pass: string) => {
    if (isFirebaseConfigured && auth) {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      return res.user;
    } else {
      // Demo rejim
      const demoUser: AppUser = {
        uid: "demo-" + Date.now(),
        email,
        displayName: email.split("@")[0],
        photoURL: null,
      };
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(demoUser));
      setCurrentUser(demoUser);
      return demoUser;
    }
  };

  /**
   * Yangi hisob yaratish (Sign Up)
   */
  const signup = async (email: string, pass: string, displayName?: string) => {
    if (isFirebaseConfigured && auth) {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (displayName && res.user) {
        await updateProfile(res.user, { displayName });
      }
      return res.user;
    } else {
      const demoUser: AppUser = {
        uid: "demo-" + Date.now(),
        email,
        displayName: displayName || email.split("@")[0],
        photoURL: null,
      };
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(demoUser));
      setCurrentUser(demoUser);
      return demoUser;
    }
  };

  /**
   * Google hisobi orqali kirish
   */
  const loginWithGoogle = async () => {
    if (isFirebaseConfigured && auth && googleProvider) {
      const res = await signInWithPopup(auth, googleProvider);
      return res.user;
    } else {
      const demoUser: AppUser = {
        uid: "demo-google-" + Date.now(),
        email: "foydalanuvchi@gmail.com",
        displayName: "Demo Foydalanuvchi",
        photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      };
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(demoUser));
      setCurrentUser(demoUser);
      return demoUser;
    }
  };

  /**
   * Tizimdan chiqish
   */
  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    localStorage.removeItem(LOCAL_USER_KEY);
    setCurrentUser(null);
  };

  /**
   * Yangi buyurtma yaratish va Firestore ga yozish
   */
  const createOrder = async (orderData: CreateOrderParams): Promise<Order> => {
    const newOrder: Order = {
      ...orderData,
      id: "ORD-" + Math.floor(100000 + Math.random() * 900000),
      userId: currentUser ? currentUser.uid : "guest",
      userEmail: currentUser?.email || orderData.customer.phone,
      status: "Kutilmoqda",
      createdAt: new Date().toISOString(),
    };

    // 1. Firebase Firestore'ga saqlash
    if (isFirebaseConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, "orders"), {
          ...newOrder,
          serverTimestamp: serverTimestamp(),
        });
        newOrder.firebaseDocId = docRef.id;
        console.info("✅ [Firestore] Buyurtma muvaffaqiyatli saqlandi! Doc ID:", docRef.id);
      } catch (err) {
        console.warn("⚠️ Firestore'ga yozishda ogohlantirish, buyurtma lokal saqlandi:", err);
      }
    }

    // 2. Har doim lokal xotirada saqlash
    try {
      const local = localStorage.getItem(LOCAL_ORDERS_KEY);
      const allOrders: Order[] = local ? JSON.parse(local) : [];
      const updated = [newOrder, ...allOrders];
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
      setOrders((prev) => [newOrder, ...prev]);
    } catch (e) {
      console.error("Lokal buyurtma saqlash xatosi:", e);
    }

    return newOrder;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        orders,
        authModalOpen,
        authMode,
        ordersModalOpen,
        isFirebaseConfigured,
        setAuthModalOpen,
        setAuthMode,
        setOrdersModalOpen,
        login,
        signup,
        loginWithGoogle,
        logout,
        createOrder,
        loadOrders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("❌ useAuth hooki AuthProvider ichida ishlatilishi shart!");
  }
  return context;
};
