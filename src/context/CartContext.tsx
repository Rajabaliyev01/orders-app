/**
 * CART CONTEXT & STATE MANAGEMENT (Context API)
 * ----------------------------------------------------
 * Savat holatini boshqarish va localStorage bilan sinxronizatsiya.
 * Funksiyalar: addToCart, removeFromCart, updateQuantity ('increase' | 'decrease'), clearCart,
 * avtomatik totalPrice va totalItems hisob-kitobi.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import type {
  Product,
  CartItem,
  CartContextValue,
  QuantityActionType,
} from "../types";

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_STORAGE_KEY = "orders_app_cart_v2";
const SHIPPING_THRESHOLD = 500000; // 500 000 so'm dan oshsa yetkazib berish bepul
const STANDARD_SHIPPING_PRICE = 30000;

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  // localStorage dan dastlabki holatni xavfsiz o'qish
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      if (typeof window === "undefined") return [];
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch (error) {
      console.warn("⚠️ localStorage dan savatni yuklashda xatolik:", error);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Savat har o'zgarganda localStorage ga saqlash
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      }
    } catch (error) {
      console.error("❌ Savatni localStorage ga saqlashda xatolik:", error);
    }
  }, [cart]);

  // Tablararo sinxronizatsiya (boshqa tabda savat o'zgarganda yangilash)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY && e.newValue) {
        try {
          setCart(JSON.parse(e.newValue));
        } catch {
          // parse error
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  /**
   * Savatchaga mahsulot qo'shish
   * Agar mahsulot allaqachon mavjud bo'lsa, sonini (quantity) oshiradi.
   */
  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    if (!product || !product.id) return;
    const addQty = Math.max(1, quantity);

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        return prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + addQty }
            : item
        );
      }
      return [...prev, { ...product, quantity: addQty }];
    });
  }, []);

  /**
   * Mahsulotni savatdan butunlay o'chirish
   */
  const removeFromCart = useCallback((productId: string) => {
    if (!productId) return;
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  /**
   * Mahsulot sonini o'zgartirish
   * type: 'increase' | 'decrease' (shuningdek delta raqamni ham qo'llaydi)
   */
  const updateQuantity = useCallback(
    (productId: string, type: QuantityActionType | number) => {
      if (!productId) return;

      setCart((prev) =>
        prev
          .map((item) => {
            if (item.id !== productId) return item;

            let newQty = item.quantity;
            if (type === "increase") {
              newQty += 1;
            } else if (type === "decrease") {
              newQty -= 1;
            } else if (typeof type === "number") {
              newQty += type;
            }

            // Agar soni 0 yoki undan kam bo'lsa, ro'yxatdan o'chiriladi
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          })
          .filter((item): item is CartItem => item !== null)
      );
    },
    []
  );

  /**
   * Savatni butunlay tozalash
   */
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Avtomatik jami soni (totalItems) va jami narx (totalPrice / subtotal) hisobi
  const { totalItems, subtotal } = useMemo(() => {
    return cart.reduce(
      (acc, item) => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        return {
          totalItems: acc.totalItems + qty,
          subtotal: acc.subtotal + price * qty,
        };
      },
      { totalItems: 0, subtotal: 0 }
    );
  }, [cart]);

  // Yetkazib berish hisob-kitobi
  const shippingPrice =
    subtotal > 0 && subtotal < SHIPPING_THRESHOLD ? STANDARD_SHIPPING_PRICE : 0;
  const totalAmount = subtotal + shippingPrice;
  const totalPrice = totalAmount; // User talabidagi totalPrice

  const contextValue: CartContextValue = useMemo(
    () => ({
      cart,
      items: cart,
      totalPrice,
      totalItems,
      subtotal,
      shippingPrice,
      shippingThreshold: SHIPPING_THRESHOLD,
      totalAmount,
      isCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      setIsCartOpen,
    }),
    [
      cart,
      totalPrice,
      totalItems,
      subtotal,
      shippingPrice,
      totalAmount,
      isCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

/**
 * useCart Custom Hook
 */
export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("❌ useCart hooki CartProvider ichida ishlatilishi shart!");
  }
  return context;
};
