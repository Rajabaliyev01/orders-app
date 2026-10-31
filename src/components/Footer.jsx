import { ShoppingBag, Heart, ShieldCheck, Truck, Headphones, RotateCcw } from "lucide-react";

export default function Footer({ onCategoryClick }) {
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

        {/* Col 3: Customer Service */}
        <div className="space-y-2">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">
            Mijozlarga xizmat
          </h4>
          <ul className="space-y-1.5">
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
          <p className="text-white font-bold text-sm">+998 71 200 00 00</p>
          <p className="text-[11px]">info@ordersapp.uz</p>
          <p className="text-[11px] text-slate-500">Toshkent shahri, Amir Temur ko'chasi, 10-uy</p>
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
