"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Star, ArrowRight, ShoppingCart, Heart, Eye, Check, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ProductCard({ product, index }: { product: any; index: number }) {
  const { addToCart } = useCartStore();
  const [isHovered, setIsHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`, {
      icon: '💚',
      style: { background: '#4F6F52', color: '#fff', borderRadius: '16px', fontWeight: 'bold' },
      duration: 2000,
    });
    setTimeout(() => setAdded(false), 2000);
  };

  const soldCount = product.soldCount || 0;
  const rating = product.rating ? Number(product.rating).toFixed(1) : "5.0";
  const hasDiscount = product.originalPrice && Number(product.originalPrice) > Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden"
    >
      {/* Image Container - fixed aspect ratio */}
      <div className="relative aspect-[4/5] bg-secondary/30 overflow-hidden flex-shrink-0">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <Image
            src={getImageUrl(product.images?.[0]?.imageUrl || product.image)}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-1000"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <div className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[9px] font-black uppercase tracking-wider text-primary shadow-sm">
            {product.category?.name || "Premium"}
          </div>
          {hasDiscount && (
            <div className="px-3 py-1 bg-red-500 text-white rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm">
              -{discountPercent}%
            </div>
          )}
        </div>

        {/* Sold count badge */}
        {soldCount > 0 && (
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white rounded-full">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span className="text-[9px] font-black uppercase tracking-wide">
              {soldCount >= 1000 ? `${(soldCount / 1000).toFixed(1)}k` : soldCount} đã bán
            </span>
          </div>
        )}

        {/* Hover Actions Overlay */}
        <AnimatePresence>
          {isHovered && (
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

              <Link href={`/products/${product.slug}`}>
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-xl"
                  title="Xem chi tiết"
                >
                  <Eye className="w-5 h-5" />
                </motion.button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content - flex-grow to fill remaining space uniformly */}
      <div className="flex flex-col flex-1 p-4 md:p-5 space-y-2">
        {/* Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-accent">
            <Star className="w-3 h-3 fill-accent" />
            <span className="text-xs font-bold">{rating}</span>
            {product.reviewsCount > 0 && (
              <span className="text-[10px] text-primary/40 font-medium">({product.reviewsCount})</span>
            )}
          </div>
          <span className="text-[10px] font-medium text-primary/40">#{product.id}</span>
        </div>

        {/* Name - clamp to 2 lines so cards remain same height */}
        <Link href={`/products/${product.slug}`} className="flex-1">
          <h3
            title={product.name}
            className="text-sm md:text-base font-black text-primary tracking-tight uppercase group-hover:text-accent transition-colors leading-snug truncate"
          >
            {product.name}
          </h3>
        </Link>

        {/* Sold count text row */}
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3 h-3 text-emerald-500" />
          <span className="text-[10px] font-bold text-primary/50 uppercase tracking-wide">
            {soldCount > 0
              ? `${soldCount >= 1000 ? `${(soldCount / 1000).toFixed(1)}k` : soldCount} đã bán`
              : "Mới ra mắt"}
          </span>
        </div>

        {/* Price Row */}
        <div className="flex items-end justify-between pt-1 mt-auto">
          <div className="space-y-0.5">
            <p className="text-lg md:text-xl font-black text-primary tracking-tighter">
              {formatCurrency(Number(product.price))}
            </p>
            {hasDiscount && (
              <p className="text-xs text-primary/30 line-through font-medium">
                {formatCurrency(Number(product.originalPrice))}
              </p>
            )}
          </div>
          <Link
            href={`/products/${product.slug}`}
            className="text-[10px] font-black uppercase tracking-widest text-primary/50 group-hover:text-accent transition-colors flex items-center gap-1.5 pb-0.5"
          >
            Xem <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
