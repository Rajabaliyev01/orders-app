import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  Headphones,
  RotateCcw,
  Send,
  Phone,
  Mail,
  MapPin,
  Store,
  ArrowRight,
} from "lucide-react";

export default function Footer({ onCategoryClick, onOpenSeller }) {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs mt-20 border-t border-slate-800">
      
      {/* Advantage Strip */}
      <div className="border-b border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">Tezkor yetkazish</h4>
              <p className="text-[11px] text-slate-500">1 kunda butun O'zbekistonga</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">Kafolatlangan sifat</h4>
              <p className="text-[11px] text-slate-500">Faqat original mahsulotlar</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <RotateCcw size={20} />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">Qulay qaytarish</h4>
              <p className="text-[11px] text-slate-500">14 kun ichida almashtirish</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Headphones size={20} />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">Mijozlarni qo'llash</h4>
              <p className="text-[11px] text-slate-500">24/7 aloqa markazi</p>
            </div>
          </div>
        </div>
      </div>

      {/* SOTUVCHILAR UCHUN BANNER STRIP */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900/60 border-b border-indigo-900/50 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
              <Store size={22} />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm sm:text-base">
                Do'koningiz bormi? Mahsulotlaringizni biz bilan soting!
              </h4>
              <p className="text-[11px] text-indigo-200">
                Sotuvchilar kabineti orqali o'z mahsulotlaringizni qo'shing va buyurtmalarni boshqaring.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenSeller}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md shrink-0"
          >
            <span>Sotuvchilar bo'limi</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Main Footer links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Col 1: Brand */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <ShoppingBag size={18} />
            </div>
            <span className="text-base font-extrabold text-white">OrdersApp</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Kichik va qulay internet do'kon. Barcha kerakli mahsulotlarni bir joyda toping va oson buyurtma bering.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <span className="px-2 py-1 bg-slate-800 rounded-md text-[10px] font-bold text-slate-300">Uzcard</span>
            <span className="px-2 py-1 bg-slate-800 rounded-md text-[10px] font-bold text-slate-300">Humo</span>
            <span className="px-2 py-1 bg-slate-800 rounded-md text-[10px] font-bold text-slate-300">Payme</span>
            <span className="px-2 py-1 bg-slate-800 rounded-md text-[10px] font-bold text-slate-300">Click</span>
          </div>
        </div>

        {/* Col 2: Categories */}
        <div className="space-y-2">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">
            Ommabop Toifalar
          </h4>
          <ul className="space-y-1.5">
            {["Smartfonlar", "Elektronika", "Aksessuarlar", "Kiyim-kechak", "Uy-ro'zg'or"].map((c) => (
              <li key={c}>
                <button
                  onClick={() => onCategoryClick(c)}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {c}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Customer Service & Seller */}
        <div className="space-y-2">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">
            Hamkorlik & Xizmatlar
          </h4>
          <ul className="space-y-1.5">
            <li>
              <button
                onClick={onOpenSeller}
                className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Store size={13} />
                <span>Sotuvchilar bo'limi (Mahsulot qo'shish)</span>
              </button>
            </li>
            <li>Yetkazib berish shartlari</li>
            <li>To'lov usullari</li>
            <li>Kafolat va qaytarish</li>
            <li>Ko'p beriladigan savollar</li>
            <li>Ommaviy oferta</li>
          </ul>
        </div>

        {/* Col 4: Contact */}
        <div className="space-y-2">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">
            Bog'lanish
          </h4>
          <p className="flex items-center gap-2">
            <Phone size={16} className="text-slate-400" />
            <a href="tel:+998330073007" className="text-white font-bold text-sm hover:underline">
              +998 33 007 30 07
            </a>
          </p>
          <p className="flex items-center gap-2">
            <Send size={16} className="text-slate-400" />
            <a href="https://t.me/Rajabaliyev_01" target="_blank" rel="noopener noreferrer" className="text-white font-bold text-sm hover:underline">
              Telegram
            </a>
          </p>
          <p className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <a href="https://instagram.com/Rajabaliyev_01" target="_blank" rel="noopener noreferrer" className="text-white font-bold text-sm hover:underline">
              Instagram
            </a>
          </p>
          <p className="flex items-center gap-2">
            <Mail size={16} className="text-slate-400" />
            <span>info@ordersapp.uz</span>
          </p>
          <p className="flex items-center gap-2 text-[11px] text-slate-500">
            <MapPin size={16} className="text-slate-400 flex-shrink-0" />
            <span>Jizzax shahri, Amir Temur ko'chasi, 18-uy</span>
          </p>

        </div>

      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800 py-6 text-center text-[11px] text-slate-500">
        <p className="flex items-center justify-center gap-1">
          © {new Date().getFullYear()} OrdersApp. Barcha huquqlar himoyalangan.
        </p>
      </div>

    </footer>
  );
}
