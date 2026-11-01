import { useState } from "react";
import { formatPrice } from "../data/products";
import { useCart } from "../context/CartContext";
import { Star, ShoppingCart, Plus, Minus, Eye } from "lucide-react";

export default function ProductCard({ product, onSelectProduct, onNotify }) {
  const { cart, addToCart, updateQuantity } = useCart();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const cartItem = cart.find((item) => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
    if (onNotify) {
      onNotify(`"${product.name}" savatchaga qo'shildi!`);
    }
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    updateQuantity(product.id, "increase");
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    updateQuantity(product.id, "decrease");
  };

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xl hover:border-indigo-200 transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* Badge */}
      {product.badge && (
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg uppercase tracking-wider shadow-xs ${
              product.badge === "Chegirma"
                ? "bg-rose-500 text-white"
                : product.badge === "Yangi"
                ? "bg-emerald-500 text-white"
                : "bg-indigo-600 text-white"
            }`}
          >
            {product.badge}
          </span>
        </div>
      )}

      {/* Quick view button on hover */}
      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectProduct(product);
          }}
          className="p-2 bg-white/90 hover:bg-white text-slate-700 hover:text-indigo-600 rounded-xl shadow-md backdrop-blur-xs transition-colors cursor-pointer"
          title="Batafsil ko'rish"
        >
          <Eye size={16} />
        </button>
      </div>

      {/* Image Container */}
      <div className="relative aspect-4/3 sm:aspect-square w-full bg-slate-100 overflow-hidden">
        {!imageError ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-4 text-center">
            <ShoppingCart size={32} className="stroke-[1.5] mb-1 opacity-50" />
            <span className="text-xs font-medium">{product.name}</span>
          </div>
        )}
      </div>

      {/* Body details */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-medium text-indigo-600">{product.category}</span>
            <div className="flex items-center gap-1">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span className="font-semibold text-slate-700">{product.rating}</span>
              <span className="text-slate-400">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-800 text-sm sm:text-base line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Pricing & Cart Action */}
        <div className="pt-2 border-t border-slate-100 flex items-end justify-between gap-2">
          <div>
            {product.oldPrice && (
              <span className="text-xs text-slate-400 line-through block leading-tight">
                {formatPrice(product.oldPrice)}
              </span>
            )}
            <span className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Action Button */}
          {quantity > 0 ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 rounded-xl p-1 shadow-2xs"
            >
              <button
                onClick={handleDecrement}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white cursor-pointer transition-colors shadow-2xs"
                title="Kamaytirish"
              >
                <Minus size={14} />
              </button>
              <span className="w-5 text-center font-bold text-xs text-indigo-900">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer transition-colors shadow-2xs"
                title="Oshirish"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="px-3.5 py-2 bg-slate-900 hover:bg-indigo-600 active:scale-95 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <ShoppingCart size={14} />
              <span>Olish</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
