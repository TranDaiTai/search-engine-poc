"use client";

import { Monitor, Headphones, Gamepad, Car } from "lucide-react";

export default function Sidebar({
  activeCategory,
  onCategoryChange
}: {
  activeCategory: string | null;
  onCategoryChange: (cat: string | null) => void;
}) {
  const categories = [
    { id: '11111111-1111-1111-1111-111111111111', name: "Electronics", icon: Monitor },
    { id: '22222222-2222-2222-2222-222222222222', name: "Accessories", icon: Headphones },
    { id: 'gaming-id', name: "Gaming", icon: Gamepad },
    { id: 'toys-id', name: "Toys", icon: Car },
  ];

  return (
    <aside className="w-full md:w-64 shrink-0 h-fit bg-white border border-slate-200 rounded-3xl p-6 sticky top-28 hidden md:block shadow-sm">
      <h3 className="text-slate-900 font-extrabold mb-6 tracking-wide uppercase text-sm">Categories</h3>
      
      <div className="space-y-2">
        <button
          onClick={() => onCategoryChange(null)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            activeCategory === null
              ? "bg-brand-primary/10 text-brand-primary font-bold"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <div className="w-5" />
          All Products
        </button>

        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.name;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-brand-primary/10 text-brand-primary font-bold"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-5 w-5" />
              {cat.name}
            </button>
          );
        })}
      </div>

      <div className="mt-8 pt-8 border-t border-slate-200">
        <h3 className="text-slate-900 font-extrabold mb-4 tracking-wide uppercase text-sm">Availability</h3>
        <label className="flex items-center gap-3 text-slate-600 hover:text-slate-900 cursor-pointer group transition-colors">
          <input type="checkbox" className="form-checkbox bg-slate-50 border-slate-300 rounded accent-brand-primary w-4 h-4" />
          <span className="font-medium">In Stock Only</span>
        </label>
      </div>
    </aside>
  );
}
