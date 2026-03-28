"use client";

import { Monitor, Headphones, Gamepad, Car, Filter, ChevronRight, Check } from "lucide-react";
import clsx from "clsx";

interface SidebarProps {
  activeCategory: string | null;
  onCategoryChange: (cat: string | null) => void;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  showInStockOnly: boolean;
  onStockToggle: (val: boolean) => void;
}

export default function Sidebar({
  activeCategory,
  onCategoryChange,
  priceRange,
  onPriceChange,
  showInStockOnly,
  onStockToggle
}: SidebarProps) {
  const categories = [
    { id: '11111111-1111-1111-1111-111111111111', name: "Electronics", icon: Monitor },
    { id: '22222222-2222-2222-2222-222222222222', name: "Accessories", icon: Headphones },
  ];

  return (
    <aside className="w-full md:w-72 shrink-0 h-fit bg-white border border-slate-200 rounded-[2.5rem] p-8 sticky top-28 hidden md:block shadow-sm overflow-hidden group">
      <div className="flex items-center gap-2 mb-8 px-2 text-indigo-600">
        <Filter className="h-5 w-5" />
        <h3 className="text-slate-900 font-black tracking-tight uppercase text-xs">Filter Engine</h3>
      </div>
      
      {/* Category Section */}
      <div className="mb-10">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Collections</h4>
        <div className="space-y-1">
          <button
            onClick={() => onCategoryChange(null)}
            className={clsx(
              "w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300",
              activeCategory === null
                ? "bg-slate-900 text-white shadow-lg shadow-slate-200 font-bold"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium"
            )}
          >
            All Products
            {activeCategory === null && <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_10px_#818cf8]" />}
          </button>

          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.name)}
                className={clsx(
                  "w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300 group/item",
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 font-bold"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={clsx("h-4 w-4", isActive ? "text-indigo-200" : "text-slate-400 group-hover/item:text-indigo-500")} />
                  {cat.name}
                </div>
                {isActive ? (
                  <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse shadow-[0_0_10px_#fff]" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Section */}
      <div className="mb-10 p-5 bg-slate-50 rounded-3xl border border-slate-100">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Price Threshold</h4>
        <div className="flex items-center gap-2 mb-4">
          <input 
            type="number" 
            value={priceRange[0]}
            onChange={(e) => onPriceChange([Number(e.target.value), priceRange[1]])}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-indigo-400 transition-colors"
          />
          <div className="h-px w-3 bg-slate-300 shrink-0" />
          <input 
            type="number" 
            value={priceRange[1]}
            onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value)])}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-indigo-400 transition-colors"
          />
        </div>
        <div className="relative h-1 w-full bg-slate-200 rounded-full mt-2 overflow-hidden">
          <div className="absolute inset-y-0 bg-indigo-500 w-full opacity-30" />
        </div>
      </div>

      {/* Availability */}
      <div>
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Inventory</h4>
        <button
          onClick={() => onStockToggle(!showInStockOnly)}
          className="w-full flex items-center gap-3 px-2 py-1 cursor-pointer group hover:opacity-80 transition-opacity"
        >
          <div className={clsx(
            "h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all",
            showInStockOnly ? "bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-100" : "bg-white border-slate-200 group-hover:border-slate-300"
          )}>
            {showInStockOnly && <Check className="h-4 w-4 text-white" strokeWidth={4} />}
          </div>
          <span className={clsx("text-sm font-bold transition-colors", showInStockOnly ? "text-indigo-600" : "text-slate-600")}>
            In Stock Only
          </span>
        </button>
      </div>

      {/* Bottom Ad / Info */}
      <div className="mt-12 p-6 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-indigo-400 h-16 w-16 rounded-full opacity-20 blur-2xl" />
        <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-2">Pro Tip</p>
        <p className="text-xs font-bold leading-relaxed opacity-90">
          Use the Smart Search bar for instantaneous tech discovery.
        </p>
      </div>
    </aside>
  );
}
