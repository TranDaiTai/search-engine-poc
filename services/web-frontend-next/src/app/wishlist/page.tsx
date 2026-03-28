"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistService } from "@/services/wishlistService";
import { useCartStore } from "@/store/useCartStore";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trash2, ShoppingCart, ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const queryClient = useQueryClient();
  const { addToCart } = useCartStore();

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => wishlistService.getWishlist(),
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: (productId: number) => wishlistService.removeFromWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.error("Đã xóa khỏi danh sách yêu thích");
    }
  });

  const handleMoveToCart = (product: any) => {
    addToCart(product);
    removeFromWishlistMutation.mutate(product.id);
  };

  return (
    <main className="min-h-screen bg-gray-50/50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-40 pb-20">
        <Link href="/shop" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/30 hover:text-accent transition-all mb-12">
           <ArrowLeft className="w-4 h-4" /> Tiếp tục mua sắm
        </Link>

        <h1 className="text-6xl font-black text-primary tracking-tighter uppercase mb-16 animate-slideUp">
          Yêu thích <br /> <span className="opacity-20 italic">Sản phẩm của bạn</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-96 w-full bg-white rounded-[3rem] animate-pulse"></div>
              ))
            ) : wishlist.length === 0 ? (
              <div className="col-span-full premium-card p-20 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center text-primary/20">
                   <Heart className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-primary uppercase">Chưa có sản phẩm yêu thích</h3>
                <Link href="/shop" className="btn-primary px-10 py-5">Khám phá bộ sưu tập</Link>
              </div>
            ) : (
              wishlist.map((item: any, idx: number) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.1 }}
                  className="premium-card group bg-white border border-gray-100 overflow-hidden"
                >
                  <div className="aspect-[4/5] relative overflow-hidden">
                    <img 
                      src={getImageUrl(item.product?.images?.[0]?.imageUrl || item.product?.image)} 
                      alt={item.product?.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <button 
                      onClick={() => removeFromWishlistMutation.mutate(item.productId)}
                      className="absolute top-6 right-6 p-4 bg-white/90 backdrop-blur-md rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="p-8 space-y-6">
                    <div className="space-y-2">
                       <h3 className="text-xl font-black text-primary uppercase tracking-tight truncate">{item.product?.name}</h3>
                       <p className="text-2xl font-black text-accent tracking-tighter italic">{formatCurrency(item.product?.price || 0)}</p>
                    </div>

                    <button 
                      onClick={() => handleMoveToCart(item.product)}
                      className="w-full py-5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-4 hover:bg-accent transition-all group/btn"
                    >
                      Thêm vào giỏ <ShoppingCart className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </main>
  );
}
