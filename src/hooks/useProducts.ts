/**
 * USE PRODUCTS CUSTOM HOOK (Firestore Database Integration)
 * -----------------------------------------------------------
 * Firestore 'products' kolleksiyasidan real-vaqtda (onSnapshot)
 * mahsulotlarni tinglaydi va yuklab oladi.
 *
 * Qaytaradi:
 * - products: Product[]
 * - loading: boolean
 * - error: string | null
 * - filterByCategory: (category: string) => Product[]
 * - refetch: () => Promise<void>
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

export const useProducts = (realtime: boolean = true): UseProductsResult => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS as unknown as Product[]);
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
      setProducts(INITIAL_PRODUCTS as unknown as Product[]);
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
        // Agar createdAt indeksi bo'lmasa oddiy getDocs qilamiz
        snapshot = await getDocs(productsRef);
      }

      if (!snapshot.empty) {
        const fetched = mapSnapshotToProducts(snapshot);
        setProducts(fetched);
      } else {
        // Firestore hali bo'sh bo'lsa mahalliy boshlang'ich ma'lumotlar ishlatiladi
        setProducts(INITIAL_PRODUCTS as unknown as Product[]);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Mahsulotlarni yuklashda xatolik yuz berdi";
      console.error("❌ [useProducts] Firestore getDocs xatosi:", err);
      setError(errorMessage);
      // Xatolikda ham sayt to'xtab qolmasligi uchun fallback ma'lumot beramiz
      setProducts(INITIAL_PRODUCTS as unknown as Product[]);
    } finally {
      setLoading(false);
    }
  }, [mapSnapshotToProducts]);

  // Real-time (onSnapshot) orqali avtomatik tinglash
  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      // Firebase sozlanmagan bo'lsa mahalliy bazadan yuklaymiz
      setProducts(INITIAL_PRODUCTS as unknown as Product[]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const productsRef = collection(db, "products");

    if (realtime) {
      // Real-time rejim (onSnapshot)
      const unsubscribe = onSnapshot(
        productsRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched = mapSnapshotToProducts(snapshot);
            setProducts(fetched);
          } else {
            setProducts(INITIAL_PRODUCTS as unknown as Product[]);
          }
          setLoading(false);
        },
        (err) => {
          console.warn("⚠️ [useProducts] onSnapshot ogohlantirishi:", err.message);
          setError(err.message);
          setProducts(INITIAL_PRODUCTS as unknown as Product[]);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      // Bir martalik yuklash
      refetch();
    }
  }, [realtime, mapSnapshotToProducts, refetch]);

  /**
   * Kategoriya bo'yicha filtrlash funksiyasi
   */
  const filterByCategory = useCallback(
    (category: string): Product[] => {
      if (!category || category === "Barchasi") {
        return products;
      }
      return products.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
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
