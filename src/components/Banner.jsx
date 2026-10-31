import { Truck, ShieldCheck, CreditCard, Sparkles, ArrowRight } from "lucide-react";

export default function Banner({ onExploreClick }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 text-white shadow-xl shadow-indigo-950/20 my-6">
      {/* Decorative gradient glow circles */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 px-6 py-10 sm:px-12 sm:py-14 flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Left text column */}
        <div className="max-w-xl text-center md:text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-indigo-300">
            <Sparkles size={14} className="text-amber-400" />
            <span>Kuzgi Katta Chegirmalar Mavsumi</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]">
            Sifatli mahsulotlar, <br />
            <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              Tezkor va Qulay
            </span>{" "}
            yetkazib berish!
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg">
            Eng so'nggi gadjetlar, zamonaviy kiyimlar va kundalik ehtiyoj mollari. 
            500,000 so'mdan ortiq xaridlarga yetkazib berish butunlay bepul!
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button
              onClick={onExploreClick}
              className="px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 active:scale-95 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg cursor-pointer transition-all"
            >
              <span>Mahsulotlarni ko'rish</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Right Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-3 w-full md:w-72 shrink-0">
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <p className="font-bold text-sm text-white">Tezkor yetkazish</p>
              <p className="text-xs text-slate-400">1 kunda eshikkacha</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="font-bold text-sm text-white">100% Asl Sifat</p>
              <p className="text-xs text-slate-400">Rasmiy kafolat bilan</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
              <CreditCard size={20} />
            </div>
            <div>
              <p className="font-bold text-sm text-white">Qulay to'lov</p>
              <p className="text-xs text-slate-400">Naqd yoki karta orqali</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
