"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSuggestions, Suggestion } from "@/hooks/useSuggestions";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { suggestions, isLoading } = useSuggestions(query);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) {
      router.push(`/shop?search=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    router.push(`/products/${suggestion.slug}`);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div className="w-full bg-white/40 backdrop-blur-md border-b border-gray-100/50 pt-28 pb-12 relative z-40">
      <div className="max-w-5xl mx-auto px-6" ref={containerRef}>
        <div className="relative group">
          {/* Label / Subtitle */}
          <div className="flex items-center gap-2 mb-4 opacity-100 transition-opacity duration-300">
             <Sparkles className="w-3 h-3 text-accent" />
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Tìm kiếm thông minh với AI</span>
          </div>

          <form onSubmit={handleSearch} className="relative">
            <div className={`relative flex items-center transition-all duration-500 rounded-2xl border-2 ${
                isOpen ? 'bg-white border-accent shadow-2xl shadow-accent/10' : 'bg-white/80 border-transparent shadow-sm'
              }`}>
              <div className="pl-6 text-primary/40">
                <Search className={`w-6 h-6 transition-colors ${isOpen ? 'text-accent' : ''}`} />
              </div>
              
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                placeholder="Tìm kiếm sản phẩm, thương hiệu hoặc danh mục..."
                className="w-full py-6 px-6 bg-transparent text-lg font-medium placeholder:text-primary/30 outline-none"
              />

              <div className="pr-6 flex items-center gap-3">
                {isLoading && <Loader2 className="w-5 h-5 animate-spin text-accent" />}
                {query && (
                  <button 
                    type="button" 
                    onClick={() => setQuery("")}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-primary/40" />
                  </button>
                )}
                <button
                  type="submit"
                  className={`px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all ${
                    query.trim() ? 'bg-primary text-white hover:bg-accent shadow-lg' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Tìm kiếm
                </button>
              </div>
            </div>
          </form>

          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {isOpen && query.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                className="absolute top-full left-0 right-0 mt-4 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50 p-2"
              >
                <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50 mx-2 mt-2 rounded-2xl">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Gợi ý sản phẩm ({suggestions.length})</span>
                  {suggestions.length > 0 && (
                     <button onClick={handleSearch} className="text-[10px] font-bold uppercase tracking-widest text-accent flex items-center gap-1 hover:underline">
                        Xem tất cả <ArrowRight className="w-3 h-3" />
                     </button>
                  )}
                </div>

                <div className="max-h-[450px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                  {suggestions.length > 0 ? (
                    suggestions.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleSelectSuggestion(s)}
                        className="w-full p-3 flex items-center gap-4 hover:bg-secondary/30 rounded-2xl transition-all group text-left border border-transparent hover:border-secondary"
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0">
                          {s.image ? (
                            <img src={s.image} alt={s.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary/20 italic text-[10px]">No Image</div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <h4 className="text-sm font-bold text-primary group-hover:text-accent transition-colors line-clamp-1">{s.name}</h4>
                          <p className="text-xs text-primary/50 mt-1 uppercase tracking-wider font-medium">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(s.price * 25000)}</p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                           <ArrowRight className="w-4 h-4 text-accent" />
                        </div>
                      </button>
                    ))
                  ) : !isLoading ? (
                    <div className="py-12 text-center space-y-4">
                       <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                          <Search className="w-6 h-6 text-primary/10" />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-primary">Không tìm thấy sản phẩm nào</p>
                          <p className="text-xs text-primary/40 mt-1">Hãy thử nhập từ khóa khác xem sao!</p>
                       </div>
                    </div>
                  ) : (
                    <div className="py-12 flex justify-center">
                       <Loader2 className="w-8 h-8 animate-spin text-accent/20" />
                    </div>
                  )}
                </div>

                {query && suggestions.length > 0 && (
                  <div className="p-4 bg-accent/5 border-t border-accent/5 flex items-center justify-center gap-2">
                     <Sparkles className="w-3 h-3 text-accent" />
                     <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Bấm Enter để xem đầy đủ kết quả tìm kiếm cho "{query}"</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
