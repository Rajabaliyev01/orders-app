import { formatPrice } from "../data/products";
import { useCart } from "../context/CartContext";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Truck,
  CheckCircle2,
} from "lucide-react";

export default function CartDrawer({ onCheckout }) {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal,
    shippingPrice,
    shippingThreshold,
    totalAmount,
  } = useCart();

  if (!isCartOpen) return null;

  const progressPercent = Math.min(
    100,
    Math.round((subtotal / shippingThreshold) * 100)
  );
  const remainingForFree = Math.max(0, shippingThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ShoppingBag size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Savatcha</h2>
                <p className="text-xs text-slate-500 font-medium">
                  {totalItems > 0 ? `${totalItems} ta mahsulot` : "Hozircha bo'sh"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-500 hover:text-rose-600 font-medium px-2 py-1 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors"
                >
                  Tozalash
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Free Shipping Tracker */}
          {cart.length > 0 && (
            <div className="bg-indigo-50/70 border-b border-indigo-100/60 px-6 py-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 font-semibold text-indigo-950">
                  <Truck size={14} className="text-indigo-600" />
                  {remainingForFree === 0 ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 size={13} /> Bepul yetkazib berish faollashtirildi!
                    </span>
                  ) : (
                    <span>
                      Bepul yetkazish uchun yana <strong>{formatPrice(remainingForFree)}</strong>
                    </span>
                  )}
                </span>
                <span className="font-bold text-indigo-700">{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-indigo-200/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-4">
                  <ShoppingBag size={40} className="stroke-[1.5]" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  Savatchangiz bo'sh
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mb-6">
                  Katalogdagi ajoyib mahsulotlarni ko'rib chiqing va o'zingizga yoqqanini tanlang.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-md shadow-indigo-200"
                >
                  Xarid qilishni boshlash
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3.5 p-3 rounded-2xl border border-slate-100 hover:border-slate-200 bg-white transition-all shadow-2xs"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-18 h-18 rounded-xl object-cover bg-slate-100 shrink-0"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&auto=format&fit=crop&q=80";
                    }}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1 mb-0.5">
                      {item.name}
                    </h4>
                    <p className="text-xs text-slate-500 mb-2">
                      {formatPrice(item.price)}
                    </p>

                    {/* Quantity & Delete */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-5 h-5 flex items-center justify-center rounded bg-white text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-5 h-5 flex items-center justify-center rounded bg-white text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span className="text-xs font-extrabold text-slate-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="O'chirish"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer / Summary */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Mahsulotlar summasi:</span>
                  <span className="font-semibold text-slate-800">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Yetkazib berish:</span>
                  <span className="font-semibold">
                    {shippingPrice === 0 ? (
                      <span className="text-emerald-600 font-bold">Bepul</span>
                    ) : (
                      formatPrice(shippingPrice)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200/80">
                  <span>Jami to'lov:</span>
                  <span className="text-indigo-600">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onCheckout();
                }}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-indigo-200"
              >
                <span>Buyurtma berish</span>
                <ArrowRight size={17} />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
