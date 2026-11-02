/**
 * USE PRODUCTS CUSTOM HOOK (Firestore & Multi-Vendor Sync)
 * -----------------------------------------------------------
 * Firestore 'products' kolleksiyasidan real-vaqtda (onSnapshot)
 * mahsulotlarni tinglaydi va umumiy katalog uchun birlashtiradi.
 * 
 * Barcha sotuvchilar qo'shgan mahsulotlar hamda boshlang'ich katalog 
 * to'liq birlashtirilib, xaridorlarga umumiy katalogda ko'rsatiladi.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  collection,
  onSnapshot,
  getDocs,
  query,
  orderBy,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { INITIAL_PRODUCTS } from "../data/products";
import type { Product, UseProductsResult } from "../types";

const LOCAL_CUSTOM_PRODUCTS_KEY = "orders_app_custom_products";

/**
 * Mahalliy saqlangan mahsulotlarni olish
 */
export const getLocalCustomProducts = (): Product[] => {
  try {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(LOCAL_CUSTOM_PRODUCTS_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * Mahsulotni lokal xotiraga saqlash
 */
export const saveProductLocally = (product: Product): void => {
  try {
    const current = getLocalCustomProducts();
    const existingIndex = current.findIndex((p) => p.id === product.id);
    let updated: Product[];
    if (existingIndex > -1) {
      updated = [...current];
      updated[existingIndex] = product;
    } else {
      updated = [product, ...current];
    }
    localStorage.setItem(LOCAL_CUSTOM_PRODUCTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Lokal mahsulotni saqlash xatosi:", err);
  }
};

/**
 * Mahsulotni lokal xotiradan o'chirish
 */
export const deleteProductLocally = (productId: string): void => {
  try {
    const current = getLocalCustomProducts();
    const updated = current.filter((p) => p.id !== productId);
    localStorage.setItem(LOCAL_CUSTOM_PRODUCTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Lokal mahsulotni o'chirish xatosi:", err);
  }
};

/**
 * Firestore, Lokal va Boshlang'ich mahsulotlarni birlashtirish
 */
const mergeAllProducts = (firestoreItems: Product[] = []): Product[] => {
  const localItems = getLocalCustomProducts();
  const initialItems = (INITIAL_PRODUCTS as unknown as Product[]) || [];

  const seenIds = new Set<string>();
  const merged: Product[] = [];

  // 1. Firestore mahsulotlari (eng yangi bulut ma'lumotlari birinchi o'rinda)
  for (const item of firestoreItems) {
    if (item && item.id && !seenIds.has(item.id)) {
      seenIds.add(item.id);
      merged.push(item);
    }
  }

  // 2. Lokal saqlangan mahsulotlar (Firestore bilan sinxronlashmagan bo'lsa ham yo'qolmaydi)
  for (const item of localItems) {
    if (item && item.id && !seenIds.has(item.id)) {
      seenIds.add(item.id);
      merged.push(item);
    }
  }

  // 3. Boshlang'ich katalog mahsulotlari (namuna tovarlar)
  for (const item of initialItems) {
    if (item && item.id && !seenIds.has(item.id)) {
      seenIds.add(item.id);
      merged.push(item);
    }
  }

  return merged;
};

export const useProducts = (realtime: boolean = true): UseProductsResult => {
  const [products, setProducts] = useState<Product[]>(() => mergeAllProducts([]));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Firestore Snapshot ma'lumotlarini Product obyektlariga aylantirish
   */
  const mapSnapshotToProducts = useCallback(
    (snapshot: QuerySnapshot<DocumentData>): Product[] => {
      const items: Product[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          name: data.name || "Nomsiz mahsulot",
          category: data.category || "Boshqa",
          price: Number(data.price) || 0,
          oldPrice: data.oldPrice ? Number(data.oldPrice) : undefined,
          rating: Number(data.rating) || 5.0,
          reviewsCount: Number(data.reviewsCount) || 0,
          image: data.image || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80",
          badge: data.badge || "",
          inStock: data.inStock !== false,
          description: data.description || "",
          specs: data.specs || {},
          sellerId: data.sellerId,
          sellerEmail: data.sellerEmail,
          sellerName: data.sellerName,
          createdAt: data.createdAt,
        });
      });
      return items;
    },
    []
  );

  /**
   * Firestore'dan ma'lumotlarni qo'lda qayta yuklash (Manual Refetch)
   */
  const refetch = useCallback(async (): Promise<void> => {
    if (!isFirebaseConfigured || !db) {
      setProducts(mergeAllProducts([]));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const productsRef = collection(db, "products");
      let snapshot: QuerySnapshot<DocumentData>;

      try {
        const q = query(productsRef, orderBy("createdAt", "desc"));
        snapshot = await getDocs(q);
      } catch {
        // Agar createdAt indeksi bo'lmasa oddiy getDocs
        snapshot = await getDocs(productsRef);
      }

      const fetched = mapSnapshotToProducts(snapshot);
      setProducts(mergeAllProducts(fetched));
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Mahsulotlarni yuklashda xatolik yuz berdi";
      console.error("❌ [useProducts] Firestore getDocs xatosi:", err);
      setError(errorMessage);
      setProducts(mergeAllProducts([]));
    } finally {
      setLoading(false);
    }
  }, [mapSnapshotToProducts]);

  // Real-time (onSnapshot) orqali avtomatik tinglash
  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      // Firebase sozlanmagan bo'lsa mahalliy bazadan birlashtirib yuklaymiz
      setProducts(mergeAllProducts([]));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const productsRef = collection(db, "products");

      if (realtime) {
        // Real-time rejim (onSnapshot)
        const unsubscribe = onSnapshot(
          productsRef,
          (snapshot) => {
            try {
              const fetched = mapSnapshotToProducts(snapshot);
              setProducts(mergeAllProducts(fetched));
            } catch (mapErr) {
              console.warn("Snapshot mapping xatosi:", mapErr);
              setProducts(mergeAllProducts([]));
            }
            setLoading(false);
          },
          (err) => {
            console.warn("⚠️ [useProducts] onSnapshot ogohlantirishi:", err.message);
            setError(err.message);
            setProducts(mergeAllProducts([]));
            setLoading(false);
          }
        );

        return () => {
          try {
            unsubscribe();
          } catch {
            // ignore
          }
        };
      } else {
        // Bir martalik yuklash
        refetch();
      }
    } catch (collErr: unknown) {
      console.warn("Firestore collection xatosi:", collErr);
      setProducts(mergeAllProducts([]));
      setLoading(false);
    }
  }, [realtime, mapSnapshotToProducts, refetch]);

  /**
   * Kategoriya bo'yicha filtrlash funksiyasi
   */
  const filterByCategory = useCallback(
    (category: string): Product[] => {
      const list = Array.isArray(products) ? products : [];
      if (!category || category === "Barchasi") {
        return list;
      }
      return list.filter(
        (p) => p && p.category && String(p.category).toLowerCase() === category.toLowerCase()
      );
    },
    [products]
  );

  return useMemo(
    () => ({
      products,
      loading,
      error,
      filterByCategory,
      refetch,
    }),
    [products, loading, error, filterByCategory, refetch]
  );
};
