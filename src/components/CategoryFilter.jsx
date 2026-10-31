import { CATEGORIES } from "../data/products";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";

export default function CategoryFilter({
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  totalFound,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-slate-200/80 mb-6">
      
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none no-scrollbar">
        {CATEGORIES.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Sort & Count dropdown */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
        <span className="text-xs text-slate-500 font-medium">
          {totalFound} ta mahsulot
        </span>

        <div className="relative flex items-center">
          <ArrowUpDown size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="pl-8 pr-7 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-xl outline-none focus:border-indigo-500 cursor-pointer appearance-none shadow-2xs hover:bg-slate-50"
          >
            <option value="default">Saralash: Tavsiya etilgan</option>
            <option value="price-asc">Narx: Arzondan qimmatga</option>
            <option value="price-desc">Narx: Qimmatdan arzonga</option>
            <option value="rating-desc">Eng yuqori reyting</option>
          </select>
        </div>
      </div>

    </div>
  );
}
