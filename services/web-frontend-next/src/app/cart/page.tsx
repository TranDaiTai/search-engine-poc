"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCartStore } from "@/store/useCartStore";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getTotalPrice } = useCartStore();
  const totalPrice = getTotalPrice();

  return (
    <main className="min-h-screen bg-gray-50/50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-40 pb-20">
        <h1 className="text-6xl font-black text-primary tracking-tighter uppercase mb-16 animate-slideUp">
          Giỏ hàng <br /> <span className="opacity-20 italic">Của bạn</span>
        </h1>

        <div className="grid lg:grid-cols-3 gap-16 items-start">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="popLayout">
              {items.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="premium-card p-20 flex flex-col items-center justify-center text-center space-y-6"
                >
                  <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center text-primary/20">
                     <ShoppingBag className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-primary uppercase">Giỏ hàng đang trống</h3>
                  <Link href="/shop" className="btn-primary px-10 py-5">Bắt đầu mua sắm ngay</Link>
                </motion.div>
              ) : (
                items.map((item) => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="premium-card p-8 bg-white flex flex-col md:flex-row items-center gap-10"
                  >
                    <div className="w-32 h-32 bg-secondary/30 rounded-3xl overflow-hidden shrink-0">
                       <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 space-y-4">
                       <div className="flex items-start justify-between gap-4">
                          <h3 className="text-xl font-black text-primary tracking-tight uppercase leading-tight line-clamp-1">{item.name}</h3>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-primary/20 hover:text-red-500 transition-colors"
                          >
                             <Trash2 className="w-5 h-5" />
                          </button>
                       </div>
                       
                       <p className="text-2xl font-black text-accent tracking-tighter uppercase italic">{formatCurrency(item.price)}</p>

                       <div className="flex items-center gap-6">
                          <div className="flex items-center gap-4 p-1 bg-secondary rounded-xl border border-gray-100">
                             <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center text-primary/40 hover:text-primary transition-colors"
                             >
                                <Minus className="w-4 h-4" />
                             </button>
                             <span className="text-sm font-black w-4 text-center">{item.quantity}</span>
                             <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center text-primary/40 hover:text-primary transition-colors"
                             >
                                <Plus className="w-4 h-4" />
                             </button>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary/20">Số lượng</span>
                       </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Summary Sidebar */}
          {items.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="premium-card p-10 bg-white border border-gray-100 space-y-10 lg:sticky lg:top-40"
            >
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Tổng cộng giỏ hàng</h3>
              
              <div className="space-y-6">
                 <div className="flex justify-between items-center text-sm font-medium italic text-muted-foreground">
                    <span>Tạm tính</span>
                    <span>{formatCurrency(totalPrice)}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm font-medium italic text-muted-foreground">
                    <span>Vận chuyển</span>
                    <span className="text-accent uppercase font-black text-[10px]">Miễn phí</span>
                 </div>
                 <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-lg font-black uppercase tracking-tight text-primary">Tổng tiền</span>
                    <span className="text-3xl font-black text-primary tracking-tighter">{formatCurrency(totalPrice)}</span>
                 </div>
              </div>

              <Link href="/checkout" className="w-full btn-primary py-6 flex items-center justify-center gap-4 text-sm group">
                 Tiến hành thanh toán <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
