"use client";

import { X, Zap, Clock, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchInput from "@/components/ui/SearchInput";

// ─── AccordionSection is TOP-LEVEL component ──────────────────────────────────
// CRITICAL: Must NOT be defined inside FilterSidebar. If it were, React would
// treat it as a new component type on every render, unmounting/remounting all
// children (causing the sidebar to scroll reset).
interface AccordionProps {
  id: string;
  title: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}
function AccordionSection({ id, title, isOpen, onToggle, children }: AccordionProps) {
  return (
    <div className="border-b border-gray-100/60 py-5 last:border-none">
      <button
        onClick={() => onToggle(id)}
        className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-widest text-primary/70 hover:text-primary transition-colors mb-3"
      >
        <span>{title}</span>
        {isOpen
          ? <ChevronUp className="w-3.5 h-3.5 text-accent" />
          : <ChevronDown className="w-3.5 h-3.5" />
        }
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
// ──────────────────────────────────────────────────────────────────────────────

const QUICK_PRICE_RANGES = [
  { label: "Dưới 500k", min: 0, max: 500000 },
  { label: "500k – 2tr", min: 500000, max: 2000000 },
  { label: "2tr – 5tr", min: 2000000, max: 5000000 },
  { label: "Trên 5tr", min: 5000000, max: 10000000 },
];

interface FilterSidebarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (val: string | null) => void;
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
  status: string | null;
  onStatusChange: (val: string | null) => void;
  categories: any[];
  productCount: number;
  handleClearAll: () => void;
  setPage: (page: number) => void;
}

export default function FilterSidebar({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  minPrice,
  maxPrice,
  onPriceChange,
  status,
  onStatusChange,
  categories,
  productCount,
  handleClearAll,
  setPage,
}: FilterSidebarProps) {
  const [openSections, setOpenSections] = useState<string[]>(["categories", "price"]);
  const [minInput, setMinInput] = useState(minPrice.toString());
  const [maxInput, setMaxInput] = useState(maxPrice.toString());

  // Refs for imperative slider updates (no React re-render during drag)
  const trackFillRef = useRef<HTMLDivElement>(null);
  const priceLabelRef = useRef<HTMLSpanElement>(null);
  const minSliderRef = useRef<HTMLInputElement>(null);
  const maxSliderRef = useRef<HTMLInputElement>(null);
  const draftMinRef = useRef(minPrice);
  const draftMaxRef = useRef(maxPrice);

  // Sync when external price state changes (clear all, quick preset)
  useEffect(() => {
    draftMinRef.current = minPrice;
    setMinInput(minPrice.toString());
    if (minSliderRef.current) minSliderRef.current.value = minPrice.toString();
    updateTrackFill(minPrice, draftMaxRef.current);
    updatePriceLabel(minPrice, draftMaxRef.current);
  }, [minPrice]);

  useEffect(() => {
    draftMaxRef.current = maxPrice;
    setMaxInput(maxPrice.toString());
    if (maxSliderRef.current) maxSliderRef.current.value = maxPrice.toString();
    updateTrackFill(draftMinRef.current, maxPrice);
    updatePriceLabel(draftMinRef.current, maxPrice);
  }, [maxPrice]);

  // Imperative DOM update — bypasses React render cycle entirely
  const updateTrackFill = (min: number, max: number) => {
    if (trackFillRef.current) {
      trackFillRef.current.style.left = `${(min / 10000000) * 100}%`;
      trackFillRef.current.style.right = `${100 - (max / 10000000) * 100}%`;
    }
  };
  const updatePriceLabel = (min: number, max: number) => {
    if (priceLabelRef.current) {
      priceLabelRef.current.textContent = `${formatCurrency(min)} – ${formatCurrency(max)}`;
    }
  };

  const toggleSection = useCallback((section: string) => {
    setOpenSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  }, []);

  const applyQuickRange = (min: number, max: number) => {
    onPriceChange(min, max);
    setPage(1);
  };

  const handleMinInputBlur = () => {
    const val = Math.min(Number(minInput) || 0, maxPrice - 500000);
    onPriceChange(val, maxPrice);
    setMinInput(val.toString());
    setPage(1);
  };

  const handleMaxInputBlur = () => {
    const val = Math.max(Number(maxInput) || 10000000, minPrice + 500000);
    onPriceChange(minPrice, Math.min(val, 10000000));
    setMaxInput(Math.min(val, 10000000).toString());
    setPage(1);
  };

  const hasActiveFilters = searchTerm !== "" || selectedCategory !== null || minPrice > 0 || maxPrice < 10000000 || status !== null;
  const activeQuickRange = QUICK_PRICE_RANGES.find(r => r.min === minPrice && r.max === maxPrice);

  return (
    <div className="space-y-0">
      {/* Categories */}
      <AccordionSection id="categories" title="Danh mục" isOpen={openSections.includes("categories")} onToggle={toggleSection}>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => { onCategoryChange(null); setPage(1); }}
            className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${
              selectedCategory === null
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-gray-50 text-primary/70 hover:bg-gray-100 hover:text-primary'
            }`}
          >
            <span>Tất cả</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${selectedCategory === null ? 'bg-white/20' : 'bg-gray-200'}`}>
              {productCount}
            </span>
          </button>
          {categories.map((cat: any) => (
            <div key={cat.id} className="space-y-1">
              <button
                onClick={() => { onCategoryChange(cat.id.toString()); setPage(1); }}
                className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${
                  selectedCategory === cat.id.toString()
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-gray-50 text-primary/70 hover:bg-gray-100 hover:text-primary'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${selectedCategory === cat.id.toString() ? 'bg-white/20' : 'bg-gray-200'}`}>
                  {cat._count?.products || 0}
                </span>
              </button>
              
              {/* Nested children (Subcategories) — Always show if product counts exist in aggregations */}
              {cat.children && cat.children.length > 0 && (
                <div className="pl-4 space-y-1 mt-1">
                  {cat.children.map((sub: any) => (
                    <button
                      key={sub.id}
                      onClick={() => { onCategoryChange(sub.id.toString()); setPage(1); }}
                      className={`flex items-center justify-between w-full px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
                        selectedCategory === sub.id.toString()
                          ? 'bg-accent text-white shadow-md shadow-accent/20'
                          : 'bg-transparent text-primary/50 hover:bg-gray-50 hover:text-primary'
                      }`}
                    >
                      <span className="truncate pr-2">{sub.name}</span>
                      <span className="opacity-60 whitespace-nowrap">{sub._count?.products || 0}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </AccordionSection>

      {/* Price Range */}
      <AccordionSection id="price" title="Khoảng giá" isOpen={openSections.includes("price")} onToggle={toggleSection}>
        <div className="space-y-5">
          {/* Quick price presets */}
          <div className="grid grid-cols-2 gap-2">
            {QUICK_PRICE_RANGES.map((range) => (
              <button
                key={range.label}
                onClick={() => applyQuickRange(range.min, range.max)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                  activeQuickRange?.label === range.label
                    ? 'bg-accent text-white border-accent shadow-md shadow-accent/20'
                    : 'bg-gray-50 text-primary/70 border-gray-100 hover:border-accent/40 hover:text-accent'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Dual text inputs */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-xs text-primary/50 font-medium mb-1 block">Từ</label>
              <input
                type="number"
                value={minInput}
                onChange={(e) => setMinInput(e.target.value)}
                onBlur={handleMinInputBlur}
                onKeyDown={(e) => e.key === "Enter" && handleMinInputBlur()}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-primary outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                placeholder="0"
              />
            </div>
            <span className="text-primary/40 mt-5 font-bold">–</span>
            <div className="flex-1">
              <label className="text-xs text-primary/50 font-medium mb-1 block">Đến</label>
              <input
                type="number"
                value={maxInput}
                onChange={(e) => setMaxInput(e.target.value)}
                onBlur={handleMaxInputBlur}
                onKeyDown={(e) => e.key === "Enter" && handleMaxInputBlur()}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-primary outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                placeholder="10000000"
              />
            </div>
          </div>

          {/* Dual range slider — imperative updates, zero re-renders during drag */}
          <div className="space-y-3">
            <div className="relative h-10 flex items-center select-none">
              {/* Background track */}
              <div className="absolute w-full h-1.5 bg-gray-100 rounded-full" />
              {/* Active fill — updated via ref, not state */}
              <div
                ref={trackFillRef}
                className="absolute h-1.5 bg-accent rounded-full pointer-events-none"
                style={{
                  left: `${(minPrice / 10000000) * 100}%`,
                  right: `${100 - (maxPrice / 10000000) * 100}%`,
                }}
              />
              {/* Min thumb */}
              <input
                ref={minSliderRef}
                type="range"
                min={0}
                max={10000000}
                step={100000}
                defaultValue={minPrice}
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), draftMaxRef.current - 500000);
                  draftMinRef.current = val;
                  // Update DOM directly — no state, no re-render
                  updateTrackFill(val, draftMaxRef.current);
                  updatePriceLabel(val, draftMaxRef.current);
                  setMinInput(val.toString());
                }}
                onPointerUp={(e) => {
                  const val = Math.min(Number((e.target as HTMLInputElement).value), draftMaxRef.current - 500000);
                  onPriceChange(val, draftMaxRef.current);
                  setPage(1);
                }}
                style={{ zIndex: minPrice >= maxPrice - 500000 ? 5 : 3 }}
                className="range-slider"
              />
              {/* Max thumb */}
              <input
                ref={maxSliderRef}
                type="range"
                min={0}
                max={10000000}
                step={100000}
                defaultValue={maxPrice}
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), draftMinRef.current + 500000);
                  draftMaxRef.current = val;
                  updateTrackFill(draftMinRef.current, val);
                  updatePriceLabel(draftMinRef.current, val);
                  setMaxInput(val.toString());
                }}
                onPointerUp={(e) => {
                  const val = Math.max(Number((e.target as HTMLInputElement).value), draftMinRef.current + 500000);
                  onPriceChange(draftMinRef.current, val);
                  setPage(1);
                }}
                style={{ zIndex: maxPrice <= minPrice + 500000 ? 5 : 4 }}
                className="range-slider"
              />
            </div>
            <div className="flex justify-between text-xs text-primary/50 font-medium">
              <span>0đ</span>
              <span ref={priceLabelRef} className="text-accent font-bold">
                {formatCurrency(minPrice)} – {formatCurrency(maxPrice)}
              </span>
              <span>10Tr+</span>
            </div>
          </div>
        </div>

        <style jsx>{`
          .range-slider {
            position: absolute;
            width: 100%;
            height: 1.5px;
            appearance: none;
            -webkit-appearance: none;
            background: transparent;
            pointer-events: none;
            outline: none;
          }
          .range-slider::-webkit-slider-thumb {
            pointer-events: auto;
            -webkit-appearance: none;
            appearance: none;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: white;
            border: 2.5px solid #4F6F52;
            cursor: grab;
            box-shadow: 0 2px 10px rgba(0,0,0,0.15);
            transition: transform 0.1s, background 0.1s;
          }
          .range-slider::-webkit-slider-thumb:hover {
            transform: scale(1.15);
            background: #4F6F52;
          }
          .range-slider::-webkit-slider-thumb:active {
            cursor: grabbing;
            transform: scale(1.2);
            background: #4F6F52;
            box-shadow: 0 0 0 6px rgba(79,111,82,0.15);
          }
          .range-slider::-moz-range-thumb {
            pointer-events: auto;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: white;
            border: 2.5px solid #4F6F52;
            cursor: grab;
            box-shadow: 0 2px 10px rgba(0,0,0,0.15);
          }
        `}</style>
      </AccordionSection>

      {/* Status */}
      <AccordionSection id="status" title="Trạng thái" isOpen={openSections.includes("status")} onToggle={toggleSection}>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'hot', label: 'Bán chạy', icon: Zap },
            { id: 'new', label: 'Mới về', icon: Clock },
            { id: 'on-sale', label: 'Giảm giá', icon: Tag },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => { onStatusChange(status === s.id ? null : s.id); setPage(1); }}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-1.5 ${
                status === s.id
                  ? 'border-accent bg-accent/5 text-accent shadow-md'
                  : 'border-gray-100 bg-white text-primary/60 hover:border-accent/30 hover:text-accent'
              }`}
            >
              <s.icon className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">{s.label}</span>
            </button>
          ))}
        </div>
      </AccordionSection>

      {/* Clear All */}
      {hasActiveFilters && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleClearAll}
          className="w-full mt-6 py-4 border-2 border-dashed border-red-400/30 rounded-2xl text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 hover:border-red-400/60 transition-all flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" /> Xóa tất cả bộ lọc
        </motion.button>
      )}
    </div>
  );
}
