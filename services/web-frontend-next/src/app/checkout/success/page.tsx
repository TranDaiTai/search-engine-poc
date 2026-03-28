"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Package, ArrowRight, ShoppingBag, Heart } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-40 pb-20 text-center space-y-12">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-200"
        >
          <CheckCircle2 className="w-16 h-16" />
        </motion.div>

        <div className="space-y-4">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-black text-primary tracking-tighter uppercase"
          >
            Đặt hàng <br /> <span className="text-accent italic font-serif lowercase">thành công!</span>
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground font-medium italic text-lg"
          >
            Cảm ơn bạn đã tin tưởng EcoMarket. Đơn hàng của bạn đang được chuẩn bị.
          </motion.p>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6 pt-8"
        >
           <div className="p-8 bg-gray-50 rounded-[2.5rem] space-y-4">
              <Package className="w-8 h-8 text-primary/30 mx-auto" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Đơn hàng sẽ được <br /> giao trong 2-4 ngày</p>
           </div>
           <div className="p-8 bg-gray-50 rounded-[2.5rem] space-y-4">
              <ShoppingBag className="w-8 h-8 text-primary/30 mx-auto" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Thông tin đơn hàng <br /> đã gửi vào Email của bạn</p>
           </div>
           <div className="p-8 bg-gray-50 rounded-[2.5rem] space-y-4">
              <Heart className="w-8 h-8 text-primary/30 mx-auto" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Tích lũy điểm hội viên <br /> cho đơn hàng này</p>
           </div>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-10"
        >
          <Link href="/profile" className="btn-primary px-12 py-5 flex items-center gap-3 w-full sm:w-auto">
             KIỂM TRA ĐƠN HÀNG <Package className="w-5 h-5" />
          </Link>
          <Link href="/shop" className="px-12 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 hover:text-primary transition-colors flex items-center gap-2 group w-full sm:w-auto">
             TIẾP TỤC MUA SẮM <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </Link>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
