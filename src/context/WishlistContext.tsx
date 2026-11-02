/**
 * WISHLIST CONTEXT (Sevimlilar Ro'yxati)
 * --------------------------------------
 * Firebase Firestore (users/{uid}/wishlist) va LocalStorage sinxronizatsiyasi.
 * Har bir foydalanuvchining o'z uid si ostida saqlanadi.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  db,
  isFirebaseConfigured,
  addToWishlistFirestore,
  removeFromWishlistFirestore,
} from "../lib/firebase";
import { collection, onSnapshot, doc, writeBatch } from "firebase/firestore";
import type { Product, WishlistContextValue } from "../types";

const LOCAL_WISHLIST_KEY = "orders_app_wishlist";

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);

  // Lokal xotiradan o'qish yordamchisi
  const loadLocalWishlist = useCallback((): Product[] => {
    try {
      const data = localStorage.getItem(LOCAL_WISHLIST_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Lokal wishlist o'qishda xatolik:", e);
    }
    return [];
  }, []);

  // Lokal xotiraga saqlash yordamchisi
  const saveLocalWishlist = useCallback((items: Product[]) => {
    try {
      localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Lokal wishlist saqlashda xatolik:", e);
    }
  }, []);

  // 1. Firebase Firestore & LocalStorage sinxronizatsiyasi
  useEffect(() => {
    // Agar foydalanuvchi tizimga kirgan bo'lsa va Firebase sozlangan bo'lsa
    if (currentUser && isFirebaseConfigured && db) {
      setLoading(true);
      const colRef = collection(db, "users", currentUser.uid, "wishlist");

      // Lokal elementlarni Firestore'ga birlashtirish (merge)
      const localItems = loadLocalWishlist();
      if (localItems.length > 0) {
        (async () => {
          try {
            for (const item of localItems) {
              await addToWishlistFirestore(currentUser.uid, item);
            }
            // Muvaffaqiyatli yuklangach lokal keshni tozalash
            localStorage.removeItem(LOCAL_WISHLIST_KEY);
          } catch (err) {
            console.warn("Lokal wishlistni Firestore'ga yuklashda ogohlantirish:", err);
          }
        })();
      }

      // Realtime Firestore tinglovchi (listener)
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          const items: Product[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            if (data && data.name) {
              items.push({
                id: d.id,
                name: data.name,
                price: Number(data.price) || 0,
                oldPrice: data.oldPrice ? Number(data.oldPrice) : undefined,
                category: data.category || "Barchasi",
                image: data.image || "",
                rating: Number(data.rating) || 5,
                reviewsCount: Number(data.reviewsCount) || 0,
                badge: data.badge || undefined,
                inStock: Boolean(data.inStock),
                description: data.description || "",
                sellerId: data.sellerId || undefined,
                sellerName: data.sellerName || undefined,
              });
            }
          });
          setWishlist(items);
          saveLocalWishlist(items);
          setLoading(false);
        },
        (error) => {
          console.warn("Firestore wishlist onSnapshot xatosi:", error);
          // Xatolikda lokal nusxasini yuklaymiz
          setWishlist(loadLocalWishlist());
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      // Foydalanuvchi tizimga kirmagan bo'lsa — lokal xotiradan yuklash
      setWishlist(loadLocalWishlist());
      setLoading(false);
    }
  }, [currentUser, loadLocalWishlist, saveLocalWishlist]);

  // Mahsulot sevimlilarda bormi-yo'qligini tekshirish
  const isInWishlist = useCallback(
    (productId: string): boolean => {
      return wishlist.some((item) => String(item.id) === String(productId));
    },
    [wishlist]
  );

  // Sevimlilarga qo'shish
  const addToWishlist = useCallback(
    async (product: Product): Promise<void> => {
      const exists = wishlist.some((item) => String(item.id) === String(product.id));
      if (exists) return;

      const updated = [product, ...wishlist];
      setWishlist(updated);
      saveLocalWishlist(updated);

      if (currentUser && isFirebaseConfigured && db) {
        try {
          await addToWishlistFirestore(currentUser.uid, product);
        } catch (err) {
          console.warn("Firestore'ga sevimlini saqlashda xatolik:", err);
        }
      }
    },
    [wishlist, currentUser, saveLocalWishlist]
  );

  // Sevimlilardan o'chirish
  const removeFromWishlist = useCallback(
    async (productId: string): Promise<void> => {
      const updated = wishlist.filter((item) => String(item.id) !== String(productId));
      setWishlist(updated);
      saveLocalWishlist(updated);

      if (currentUser && isFirebaseConfigured && db) {
        try {
          await removeFromWishlistFirestore(currentUser.uid, String(productId));
        } catch (err) {
          console.warn("Firestore'dan sevimlini o'chirishda xatolik:", err);
        }
      }
    },
    [wishlist, currentUser, saveLocalWishlist]
  );

  // Toggle (agar bo'lsa o'chirish, bo'lmasa qo'shish) -> yangi holatni qaytaradi (true = qo'shildi)
  const toggleWishlist = useCallback(
    async (product: Product): Promise<boolean> => {
      const exists = wishlist.some((item) => String(item.id) === String(product.id));
      if (exists) {
        await removeFromWishlist(String(product.id));
        return false;
      } else {
        await addToWishlist(product);
        return true;
      }
    },
    [wishlist, addToWishlist, removeFromWishlist]
  );

  // Butun sevimlilar ro'yxatini tozalash
  const clearWishlist = useCallback(async (): Promise<void> => {
    const previous = [...wishlist];
    setWishlist([]);
    saveLocalWishlist([]);

    if (currentUser && isFirebaseConfigured && db) {
      const firestore = db;
      try {
        const batch = writeBatch(firestore);
        previous.forEach((item) => {
          const docRef = doc(firestore, "users", currentUser.uid, "wishlist", String(item.id));
          batch.delete(docRef);
        });
        await batch.commit();
      } catch (err) {
        console.warn("Firestore wishlistni tozalashda xatolik:", err);
      }
    }
  }, [wishlist, currentUser, saveLocalWishlist]);

  const totalWishlistItems = useMemo(() => wishlist.length, [wishlist]);

  const value: WishlistContextValue = {
    wishlist,
    totalWishlistItems,
    isWishlistOpen,
    isInWishlist,
    toggleWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    setIsWishlistOpen,
    loading,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = (): WishlistContextValue => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("❌ useWishlist hooki WishlistProvider ichida ishlatilishi shart!");
  }
  return context;
};
