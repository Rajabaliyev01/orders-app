/**
 * ORDERS APP - TYPESCRIPT DEFINITIONS
 * Dunyo standartlaridagi tip tavsiflari (Domain Models)
 */

export type ProductSpecs = Record<string, string | number | boolean | undefined>;

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  badge?: string;
  inStock: boolean;
  description: string;
  specs?: ProductSpecs;
  sellerId?: string;
  sellerEmail?: string;
  sellerName?: string;
  createdAt?: string | number | Date | Record<string, unknown>;
}

export interface CartItem extends Product {
  quantity: number;
}

export type QuantityActionType = 'increase' | 'decrease';

export interface CartContextValue {
  cart: CartItem[];
  items: CartItem[]; // Qo'shimcha qulaylik uchun alias
  totalPrice: number;
  totalItems: number;
  subtotal: number;
  shippingPrice: number;
  shippingThreshold: number;
  totalAmount: number;
  isCartOpen: boolean;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, type: QuantityActionType | number) => void;
  clearCart: () => void;
  setIsCartOpen: (open: boolean) => void;
}

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified?: boolean;
}

export interface CustomerDetails {
  fullName: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
}

export interface OrderPricing {
  subtotal: number;
  shippingPrice: number;
  totalAmount: number;
}

export type PaymentMethod = 'cash' | 'card' | 'payme';

export type OrderStatus = 'Kutilmoqda' | 'Yetkazilmoqda' | 'Yetkazildi' | 'Bekor qilindi';

export interface Order {
  id: string;
  userId: string;
  userEmail?: string;
  customer: CustomerDetails;
  items: CartItem[];
  pricing: OrderPricing;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  firebaseDocId?: string;
}

export interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  filterByCategory: (category: string) => Product[];
  refetch: () => Promise<void>;
}
