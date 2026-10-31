import { useState, useEffect } from "react";
import { formatPrice } from "../data/products";
import { useCart } from "../context/CartContext";
import { X, Star, ShoppingCart, Plus, Minus, Check, ShieldCheck, Truck } from "lucide-react";

export default function ProductModal({ product, onClose, onNotify }) {
  const { addToCart, cart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const handleAdd = () => {
    addToCart(product, quantity);
    setAdded(true);
    if (onNotify) {
      onNotify(`${quantity} dona "${product.name}" savatchaga qo'shildi!`);
    }
    setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-slate-700 bg-white/80 hover:bg-white rounded-full shadow-md backdrop-blur-xs transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Left Image View */}
        <div className="md:w-1/2 bg-slate-100 relative min-h-[260px] md:min-h-full flex items-center justify-center p-6">
          {product.badge && (
            <span className="absolute top-4 left-4 z-10 px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow-sm">
              {product.badge}
            </span>
          )}
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full max-h-80 object-contain rounded-xl"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80";
            }}
          />
        </div>

        {/* Right Info Details */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            
            {/* Category & Rating */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-xs">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span className="font-bold text-slate-700">{product.rating}</span>
                <span className="text-slate-400">({product.reviewsCount} sharhlar)</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {product.name}
            </h2>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-sm text-slate-400 line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>

            {/* Specifications */}
            {product.specs && (
              <div className="bg-slate-50 rounded-2xl p-3.5 space-y-1.5 border border-slate-100 text-xs">
                <span className="font-bold text-slate-800 block mb-1">Xususiyatlar:</span>
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="flex justify-between py-1 border-b border-slate-200/50 last:border-0">
                    <span className="text-slate-500">{key}:</span>
                    <span className="font-medium text-slate-800 text-right">{val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Advantages */}
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
              <div className="flex items-center gap-1.5">
                <Truck size={14} className="text-indigo-600" />
                <span>Tez yetkazib berish</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>1 yil kafolat</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-6 mt-6 border-t border-slate-100 flex items-center gap-3">
            {/* Quantity Selector */}
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1.5">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 cursor-pointer transition-colors shadow-2xs"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center font-bold text-sm text-slate-800">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 cursor-pointer transition-colors shadow-2xs"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAdd}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md ${
                added
                  ? "bg-emerald-600 text-white shadow-emerald-200"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 active:scale-98"
              }`}
            >
              {added ? (
                <>
                  <Check size={18} />
                  <span>Savatchaga qo'shildi!</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  <span>Savatchaga qo'shish</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
