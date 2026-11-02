import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import {
  ShoppingBag,
  ShoppingCart,
  Search,
  User,
  LogOut,
  Package,
  X,
  Menu,
  Heart,
} from "lucide-react";

export default function Navbar({ searchQuery, setSearchQuery, selectedCategory, setSelectedCategory }) {
  const { totalItems, setIsCartOpen, subtotal } = useCart();
  const { currentUser, logout, setAuthModalOpen, setAuthMode, setOrdersModalOpen, orders } = useAuth();
  const { totalWishlistItems, setIsWishlistOpen } = useWishlist();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setSelectedCategory("Barchasi");
                setSearchQuery("");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <ShoppingBag size={22} className="stroke-[2.2]" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 bg-clip-text text-transparent block leading-tight">
                  OrdersApp
                </span>
                <span className="text-[11px] text-slate-600 font-medium tracking-wide">
                  Internet Do'kon
                </span>
              </div>
            </button>
          </div>

          {/* Search bar (Desktop & Tablet) */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Mahsulotlar, brendlar yoki toifalarni qidiring..."
                className="w-full pl-10 pr-9 py-2.5 text-sm bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-slate-800 placeholder-slate-400 rounded-xl border border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Orders History Button */}
            <button
              onClick={() => setOrdersModalOpen(true)}
              className="relative p-2.5 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              title="Buyurtmalarim"
            >
              <Package size={20} />
              <span className="hidden lg:inline text-xs font-semibold">Buyurtmalar</span>
              {orders.length > 0 && (
                <span className="flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold">
                  {orders.length}
                </span>
              )}
            </button>

            {/* Wishlist (Sevimlilar) Button */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2.5 text-slate-700 hover:text-rose-600 hover:bg-rose-50/70 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              title="Sevimlilar ro'yxati"
            >
              <Heart
                size={20}
                className={totalWishlistItems > 0 ? "fill-rose-500 text-rose-500" : ""}
              />
              <span className="hidden lg:inline text-xs font-semibold">Sevimlilar</span>
              {totalWishlistItems > 0 && (
                <span className="flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-rose-500 text-white text-[11px] font-bold shadow-xs">
                  {totalWishlistItems}
                </span>
              )}
            </button>

            {/* Profile / Auth Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl text-slate-700 hover:bg-slate-100 cursor-pointer transition-all border border-slate-200/60"
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : "U"}
                    </div>
                  )}
                  <span className="hidden sm:inline text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                    {currentUser.displayName}
                  </span>
                </button>

                {profileDropdownOpen && (
                  <div
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in text-sm"
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-800 truncate">
                        {currentUser.displayName}
                      </p>
                      <p className="text-xs text-slate-600 truncate">{currentUser.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setIsWishlistOpen(true);
                      }}
                      className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Heart size={16} className="text-rose-500 fill-rose-500" /> Sevimlilar ro'yxati ({totalWishlistItems})
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setOrdersModalOpen(true);
                      }}
                      className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Package size={16} className="text-indigo-600" /> Mening buyurtmalarim ({orders.length})
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full px-4 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <LogOut size={16} /> Tizimdan chiqish
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setAuthMode("login");
                    setAuthModalOpen(true);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <User size={16} />
                  <span>Kirish</span>
                </button>
                <button
                  onClick={() => {
                    setAuthMode("signup");
                    setAuthModalOpen(true);
                  }}
                  className="hidden sm:inline-flex px-3.5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl cursor-pointer transition-all shadow-xs"
                >
                  Ro'yxatdan o'tish
                </button>
              </div>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl shadow-md shadow-indigo-200 cursor-pointer transition-all"
            >
              <ShoppingCart size={19} />
              <div className="text-left hidden sm:block">
                <span className="text-[10px] block text-indigo-200 font-medium uppercase leading-none">
                  Savatcha
                </span>
                <span className="text-xs font-bold leading-tight">
                  {totalItems > 0 ? `${totalItems} dona` : "Bo'sh"}
                </span>
              </div>
              {totalItems > 0 && (
                <span className="sm:hidden absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-rose-500 text-white text-[11px] font-black shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Row */}
        <div className="md:hidden pb-3 pt-1">
          <div className="relative w-full">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Mahsulotlarni qidiring..."
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-100 text-slate-800 placeholder-slate-400 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
