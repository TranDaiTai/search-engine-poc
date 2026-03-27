"use client";

import { Search, ShoppingBag, User, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Navbar({
  onSearch,
}: {
  onSearch?: (query: string) => void;
}) {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/30">
              <span className="font-outfit font-bold text-xl">A</span>
            </div>
            <Link href="/" className="font-outfit font-bold text-2xl text-slate-900 tracking-tight hidden sm:block">
              Astro<span className="text-brand-primary">Shop</span>
            </Link>
          </div>

          {/* Centered Search Bar */}
          <div className="flex-1 max-w-2xl px-8 hidden md:block relative">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={query}
                onChange={handleSearch}
                className="block w-full pl-11 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-full leading-5 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 sm:text-sm transition-all"
                placeholder="Search for iPhone, PlayStation, Sony..."
              />
            </div>
          </div>

          {/* Right Action Menu */}
          <div className="flex items-center gap-6">
            <button className="text-slate-500 hover:text-brand-primary transition-colors relative flex flex-col items-center gap-1 group">
              <User className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </button>
            <button className="text-slate-500 hover:text-brand-primary transition-colors relative flex flex-col items-center gap-1 group">
              <ShoppingBag className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1.5 -right-2 bg-brand-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md">0</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
