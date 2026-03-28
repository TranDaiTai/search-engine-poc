"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, X, ArrowRight } from "lucide-react";
import { useDebounce } from "use-debounce";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "./ProductCard";
import clsx from "clsx";

interface SearchBarProps {
  onSearch: (query: string) => void;
  results: Product[];
  isLoading: boolean;
}

export default function SearchBar({ onSearch, results, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clearSearch = () => {
    setQuery("");
    setIsFocused(false);
  };

  const showDropdown = isFocused && (query.length > 0 || isLoading);

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto z-50">
      <div className={clsx(
        "relative flex items-center bg-white border transition-all duration-300 shadow-sm",
        isFocused ? "border-indigo-500 ring-4 ring-indigo-500/10 rounded-2xl" : "border-slate-200 rounded-2xl hover:border-slate-300"
      )}>
        <div className="pl-5 pr-3 text-slate-400">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
          ) : (
            <Search className={clsx("h-5 w-5 transition-colors", isFocused ? "text-indigo-500" : "text-slate-400")} />
          )}
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search products, brands, or tech..."
          className="w-full py-4 bg-transparent outline-none text-slate-900 font-medium placeholder:text-slate-400"
        />

        {query && (
          <button 
            onClick={clearSearch}
            className="p-2 mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden min-h-[100px]"
          >
            {isLoading && query.length > 0 && results.length === 0 && (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                <span className="text-sm font-medium">Searching our tech vault...</span>
              </div>
            )}

            {!isLoading && results.length === 0 && query.length > 0 && (
              <div className="p-8 text-center text-slate-500">
                <p className="text-sm font-medium">No results found for "{query}"</p>
                <p className="text-xs mt-1">Try check for typos or use different keywords.</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="py-2">
                <div className="px-5 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Top Results
                </div>
                {results.slice(0, 5).map((product) => (
                  <button
                    key={product.id}
                    className="w-full px-5 py-3 text-left hover:bg-slate-50 flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-white border border-transparent group-hover:border-slate-200 transition-all">
                        <Search className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                          {product.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {product.category} • ${product.price}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
                
                <div className="p-3 bg-slate-50 border-t border-slate-100">
                  <button className="w-full py-2.5 text-xs font-bold text-indigo-600 bg-white border border-indigo-100 rounded-xl shadow-sm hover:bg-indigo-50 transition-colors">
                    View All {results.length} results
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
