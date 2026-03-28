"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Star, ArrowRight, ShoppingCart, Heart, Eye, Check, TrendingUp } from "lucide-react";
import Link from "next/link";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import { useState } from "react";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  sku?: string;
  score?: number;
  image?: string; // Optional image field
}

interface ProductCardProps {
  product: Product;
  onBuy: (product: Product) => void;
  index?: number;
}

export default function ProductCard({ product, onBuy, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBuy(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const rating = "4.9";
  const isOutOfStock = product.stock <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden h-full border border-gray-100"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] bg-secondary/30 overflow-hidden flex-shrink-0">
        <div className="block w-full h-full relative">
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
          />
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <div className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[9px] font-black uppercase tracking-wider text-primary shadow-sm">
            {product.category || "Premium"}
          </div>
          {isOutOfStock && (
            <div className="px-3 py-1 bg-red-500 text-white rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm">
              Hết hàng
            </div>
          )}
        </div>

        {/* Hover Actions Overlay */}
        <AnimatePresence>
          {isHovered && !isOutOfStock && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center gap-3 z-20"
            >
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.05 }}
                onClick={handleAddToCart}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl ${
                  added ? 'bg-accent text-white scale-110' : 'bg-white text-primary hover:bg-accent hover:text-white'
                }`}
                title="Thêm vào giỏ"
              >
                {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
              </motion.button>

              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-xl"
                title="Yêu thích"
              >
                <Heart className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 md:p-5 space-y-2">
        {/* Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-accent">
            <Star className="w-3 h-3 fill-accent" />
            <span className="text-xs font-bold">{rating}</span>
          </div>
          <span className="text-[10px] font-medium text-primary/40 uppercase tracking-widest">#{product.id.substring(0, 8)}</span>
        </div>

        {/* Name */}
        <h3
          className="text-sm md:text-base font-black text-primary tracking-tight uppercase group-hover:text-accent transition-colors leading-snug line-clamp-2"
        >
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-[10px] text-primary/60 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Price Row */}
        <div className="flex items-end justify-between pt-2 mt-auto">
          <div className="space-y-0.5">
            <p className="text-lg md:text-xl font-black text-primary tracking-tighter">
              {formatCurrency(product.price)}
            </p>
          </div>
          <button
            onClick={() => onBuy(product)}
            disabled={isOutOfStock}
            className="text-[10px] font-black uppercase tracking-widest text-primary/50 group-hover:text-accent transition-colors flex items-center gap-1.5 pb-0.5 disabled:opacity-50"
          >
            {isOutOfStock ? "Hết hàng" : "Mua ngay"} <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
