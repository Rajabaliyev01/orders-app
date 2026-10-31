import { createContext, useContext, useState, useEffect } from "react";
import {
  auth,
  db,
  googleProvider,
  isFirebaseConfigured,
} from "../firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";

const AuthContext = createContext();

const LOCAL_USER_KEY = "orders_app_demo_user";
const LOCAL_ORDERS_KEY = "orders_app_orders_history";

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // 'login' or 'signup'
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);

  // Auth holatini tekshirish
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split("@")[0],
            photoURL: user.photoURL || null,
          });
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Demo rejim (Firebase ulanmagan paytda)
      try {
        const savedUser = localStorage.getItem(LOCAL_USER_KEY);
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        }
      } catch (e) {
        console.warn("Demo user load error:", e);
      }
      setLoading(false);
    }
  }, []);

  // Buyurtmalarni yuklash
  useEffect(() => {
    loadOrders();
  }, [currentUser]);

  const loadOrders = async () => {
    if (!currentUser) {
      // Tizimga kirmagan bo'lsa faqat mahalliy buyurtmalarni olish
      try {
        const local = localStorage.getItem(LOCAL_ORDERS_KEY);
        setOrders(local ? JSON.parse(local) : []);
      } catch {
        setOrders([]);
      }
      return;
    }

    if (isFirebaseConfigured && db) {
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const fetchedOrders = [];
        querySnapshot.forEach((doc) => {
          fetchedOrders.push({ id: doc.id, ...doc.data() });
        });
        setOrders(fetchedOrders);
      } catch (err) {
        console.warn("Firestore'dan buyurtmalarni olishda xatolik:", err);
        // Fallback to local
        loadLocalOrders();
      }
    } else {
      loadLocalOrders();
    }
  };

  const loadLocalOrders = () => {
    try {
      const local = localStorage.getItem(LOCAL_ORDERS_KEY);
      const allOrders = local ? JSON.parse(local) : [];
      if (currentUser) {
        setOrders(allOrders.filter((o) => o.userId === currentUser.uid || !o.userId));
      } else {
        setOrders(allOrders);
      }
    } catch {
      setOrders([]);
    }
  };

  // Login
  const login = async (email, password) => {
    if (isFirebaseConfigured && auth) {
      const res = await signInWithEmailAndPassword(auth, email, password);
      return res.user;
    } else {
      // Demo login
      const demoUser = {
        uid: "demo-user-" + Date.now(),
        email: email,
        displayName: email.split("@")[0],
        photoURL: null,
      };
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(demoUser));
      setCurrentUser(demoUser);
      return demoUser;
    }
  };

  // Sign up
  const signup = async (email, password, displayName) => {
    if (isFirebaseConfigured && auth) {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(res.user, { displayName });
      }
      return res.user;
    } else {
      // Demo signup
      const demoUser = {
        uid: "demo-user-" + Date.now(),
        email: email,
        displayName: displayName || email.split("@")[0],
        photoURL: null,
      };
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(demoUser));
      setCurrentUser(demoUser);
      return demoUser;
    }
  };

  // Google bilan kirish
  const loginWithGoogle = async () => {
    if (isFirebaseConfigured && auth && googleProvider) {
      const res = await signInWithPopup(auth, googleProvider);
      return res.user;
    } else {
      // Demo Google login
      const demoUser = {
        uid: "demo-google-" + Date.now(),
        email: "demo.user@gmail.com",
        displayName: "Demo Foydalanuvchi",
        photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      };
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(demoUser));
      setCurrentUser(demoUser);
      return demoUser;
    }
  };

  // Chiqish
  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    localStorage.removeItem(LOCAL_USER_KEY);
    setCurrentUser(null);
  };

  // Yangi buyurtma yaratish
  const createOrder = async (orderData) => {
    const newOrder = {
      ...orderData,
      id: "ORD-" + Math.floor(100000 + Math.random() * 900000),
      userId: currentUser ? currentUser.uid : "guest",
      userEmail: currentUser ? currentUser.email : orderData.customer.phone,
      status: "Kutilmoqda", // Kutilmoqda, Yetkazilmoqda, Yetkazildi
      createdAt: new Date().toISOString(),
    };

    // Firebase Firestore'ga saqlash
    if (isFirebaseConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, "orders"), {
          ...newOrder,
          serverTimestamp: serverTimestamp(),
        });
        newOrder.firebaseDocId = docRef.id;
      } catch (err) {
        console.warn("Buyurtmani Firestore'ga saqlashda xato, lokal saqlanadi:", err);
      }
    }

    // Har doim mahalliy xotirada ham saqlaymiz (offline xavfsizlik)
    try {
      const local = localStorage.getItem(LOCAL_ORDERS_KEY);
      const allOrders = local ? JSON.parse(local) : [];
      const updated = [newOrder, ...allOrders];
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
      setOrders((prev) => [newOrder, ...prev]);
    } catch (e) {
      console.warn("Lokal buyurtma saqlash xatosi:", e);
    }

    return newOrder;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        orders,
        login,
        signup,
        loginWithGoogle,
        logout,
        createOrder,
        loadOrders,
        isFirebaseConfigured,
        authModalOpen,
        setAuthModalOpen,
        authMode,
        setAuthMode,
        ordersModalOpen,
        setOrdersModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
