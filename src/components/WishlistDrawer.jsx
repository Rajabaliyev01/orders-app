import { useState, useEffect } from "react";
import { formatPrice } from "../data/products";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import {
  X,
  Heart,
  Trash2,
  ShoppingCart,
  ArrowRight,
  Sparkles,
  Check,
  PackageOpen,
} from "lucide-react";

export default function WishlistDrawer({ onNotify, onSelectProduct }) {
  const {
    wishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    removeFromWishlist,
    clearWishlist,
    totalWishlistItems,
  } = useWishlist();

  const { addToCart } = useCart();
  const [addedMap, setAddedMap] = useState({});

  // ESC klavishi bilan yopish
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsWishlistOpen(false);
    };
    if (isWishlistOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isWishlistOpen, setIsWishlistOpen]);

  if (!isWishlistOpen) return null;

  // Bitta mahsulotni savatchaga qo'shish
  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    addToCart(product, 1);
    setAddedMap((prev) => ({ ...prev, [product.id]: true }));
    if (onNotify) {
      onNotify(`"${product.name}" savatchaga qo'shildi!`);
    }
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  // Barcha sevimlilarni savatchaga qo'shish
  const handleAddAllToCart = () => {
    wishlist.forEach((p) => addToCart(p, 1));
    if (onNotify) {
      onNotify(`Barcha (${wishlist.length}) mahsulotlar savatchaga qo'shildi!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={() => setIsWishlistOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                <Heart size={20} className="fill-rose-500 text-rose-500" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Sevimlilar Ro'yxati
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {totalWishlistItems > 0
                    ? `${totalWishlistItems} ta saqlangan mahsulot`
                    : "Hozircha bo'sh"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
              title="Yopish"
            >
              <X size={20} />
            </button>
          </div>

          {/* List or Empty State */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {wishlist.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 rounded-3xl bg-rose-50 flex items-center justify-center text-rose-400 mb-4 shadow-inner">
                  <Heart size={36} className="animate-pulse text-rose-400" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  Sevimlilar ro'yxatingiz bo'sh
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mb-6 leading-relaxed">
                  O'zingizga yoqqan mahsulotlarni yurakcha (❤️) tugmasi orqali alohida saqlab qo'yishingiz mumkin.
                </p>
                <button
                  onClick={() => setIsWishlistOpen(false)}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-md shadow-slate-200"
                >
                  Katalogni ko'rish
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {wishlist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (onSelectProduct) {
                        onSelectProduct(item);
                        setIsWishlistOpen(false);
                      }
                    }}
                    className="group relative flex gap-3.5 p-3.5 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl transition-all cursor-pointer shadow-2xs hover:shadow-md hover:border-indigo-200"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-slate-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&auto=format&fit=crop&q=80";
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide truncate">
                            {item.category}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromWishlist(item.id);
                              if (onNotify) onNotify(`"${item.name}" sevimlilardan o'chirildi`);
                            }}
                            className="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="O'chirish"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 truncate mt-0.5 group-hover:text-indigo-600 transition-colors">
                          {item.name}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-2">
                        <div>
                          <span className="text-xs sm:text-sm font-black text-slate-900">
                            {formatPrice(item.price)}
                          </span>
                          {item.oldPrice && (
                            <span className="text-[10px] text-slate-400 line-through ml-1.5">
                              {formatPrice(item.oldPrice)}
                            </span>
                          )}
                        </div>

                        {/* Add to Cart button */}
                        <button
                          onClick={(e) => handleAddToCart(item, e)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                            addedMap[item.id]
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                          }`}
                        >
                          {addedMap[item.id] ? (
                            <>
                              <Check size={13} />
                              <span>Qo'shildi</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart size={13} />
                              <span>Savatchaga</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {wishlist.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-slate-50/60 space-y-2.5">
              <button
                onClick={handleAddAllToCart}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-indigo-200"
              >
                <ShoppingCart size={16} />
                <span>Barchasini savatchaga qo'shish</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm("Haqiqatan ham barcha sevimlilarni o'chirmoqchimisiz?")) {
                    clearWishlist();
                    if (onNotify) onNotify("Sevimlilar ro'yxati tozalandi");
                  }
                }}
                className="w-full py-2 text-xs text-slate-400 hover:text-rose-600 font-semibold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 size={13} />
                <span>Sevimlilar ro'yxatini tozalash</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
