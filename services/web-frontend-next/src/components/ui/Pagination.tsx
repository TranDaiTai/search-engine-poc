"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages = [];
    const showMax = 5;

    if (totalPages <= showMax) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-8 mt-20 pt-10 border-t border-gray-100">
      {/* Legend */}
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary/40 italic">
        Hiển thị <span className="text-primary">{startItem}-{endItem}</span> trên <span className="text-primary">{totalItems}</span> sản phẩm
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-100 bg-white hover:bg-secondary disabled:opacity-20 transition-all shadow-sm group"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <div className="flex items-center gap-1.5">
          {getPageNumbers().map((p, idx) => (
            <div key={idx} className="flex items-center">
              {p === "..." ? (
                <span className="w-10 h-10 flex items-center justify-center text-primary/30 font-bold">
                  &bull;&bull;&bull;
                </span>
              ) : (
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onPageChange(p as number)}
                  className={`w-12 h-12 flex items-center justify-center rounded-2xl text-[10px] font-black uppercase transition-all ${
                    currentPage === p
                      ? "bg-primary text-white shadow-xl shadow-primary/20 scale-110"
                      : "bg-white border border-gray-100 text-primary/60 hover:border-primary/20 hover:text-primary hover:bg-secondary/50"
                  }`}
                >
                  {p}
                </motion.button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-100 bg-white hover:bg-secondary disabled:opacity-20 transition-all shadow-sm group"
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
