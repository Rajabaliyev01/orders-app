/**
 * CART STORE (Zustand Implementation with Persist Middleware)
 * -------------------------------------------------------------
 * Zustand yordamida yaratilgan global savat do'koni.
 * localStorage bilan avtomatik sinxronlanadi.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product, CartItem, QuantityActionType } from "../types";

export interface CartStoreState {
  cart: CartItem[];
  isCartOpen: boolean;
  totalPrice: number;
  totalItems: number;
  subtotal: number;
  shippingPrice: number;

  // Actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, type: QuantityActionType | number) => void;
  clearCart: () => void;
  setIsCartOpen: (open: boolean) => void;
}

const SHIPPING_THRESHOLD = 500000;
const STANDARD_SHIPPING_PRICE = 30000;

const calculateTotals = (cart: CartItem[]) => {
  const { totalItems, subtotal } = cart.reduce(
    (acc, item) => {
      const q = Number(item.quantity) || 0;
      const p = Number(item.price) || 0;
      return {
        totalItems: acc.totalItems + q,
        subtotal: acc.subtotal + p * q,
      };
    },
    { totalItems: 0, subtotal: 0 }
  );

  const shippingPrice =
    subtotal > 0 && subtotal < SHIPPING_THRESHOLD ? STANDARD_SHIPPING_PRICE : 0;
  const totalPrice = subtotal + shippingPrice;

  return { totalItems, subtotal, shippingPrice, totalPrice };
};

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      isCartOpen: false,
      totalPrice: 0,
      totalItems: 0,
      subtotal: 0,
      shippingPrice: 0,

      addToCart: (product: Product, quantity: number = 1) => {
        if (!product || !product.id) return;
        const addQty = Math.max(1, quantity);
        const { cart } = get();

        const existing = cart.find((item) => item.id === product.id);
        let updatedCart: CartItem[];

        if (existing) {
          updatedCart = cart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + addQty }
              : item
          );
        } else {
          updatedCart = [...cart, { ...product, quantity: addQty }];
        }

        const totals = calculateTotals(updatedCart);
        set({ cart: updatedCart, ...totals });
      },

      removeFromCart: (productId: string) => {
        if (!productId) return;
        const { cart } = get();
        const updatedCart = cart.filter((item) => item.id !== productId);
        const totals = calculateTotals(updatedCart);
        set({ cart: updatedCart, ...totals });
      },

      updateQuantity: (productId: string, type: QuantityActionType | number) => {
        if (!productId) return;
        const { cart } = get();

        const updatedCart = cart
          .map((item) => {
            if (item.id !== productId) return item;

            let newQty = item.quantity;
            if (type === "increase") newQty += 1;
            else if (type === "decrease") newQty -= 1;
            else if (typeof type === "number") newQty += type;

            return newQty > 0 ? { ...item, quantity: newQty } : null;
          })
          .filter((item): item is CartItem => item !== null);

        const totals = calculateTotals(updatedCart);
        set({ cart: updatedCart, ...totals });
      },

      clearCart: () => {
        set({
          cart: [],
          totalPrice: 0,
          totalItems: 0,
          subtotal: 0,
          shippingPrice: 0,
        });
      },

      setIsCartOpen: (open: boolean) => set({ isCartOpen: open }),
    }),
    {
      name: "orders_app_cart_zustand",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
