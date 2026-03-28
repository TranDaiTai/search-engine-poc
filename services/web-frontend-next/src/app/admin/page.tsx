"use client";

import { motion } from "framer-motion";
import { TrendingUp, ShoppingCart, Users, Layers, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const stats = [
  { name: "Tổng doanh thu", value: 128500000, icon: TrendingUp, trend: "+12.5%", positive: true },
  { name: "Đơn hàng mới", value: 450, icon: ShoppingCart, trend: "+8.2%", positive: true },
  { name: "Khách hàng", value: 1240, icon: Users, trend: "+5.1%", positive: true },
  { name: "Sản phẩm", value: 85, icon: Layers, trend: "-2.4%", positive: false },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-12">
      <div className="flex items-end justify-between">
         <div className="space-y-4">
            <h1 className="text-5xl font-black text-primary uppercase tracking-tighter">Bảng <br /> <span className="text-accent italic font-serif">Tổng quan</span></h1>
            <p className="text-muted-foreground font-medium italic">Chào mừng trở lại! Dưới đây là hiệu suất hệ thống của bạn hôm nay.</p>
         </div>
         <div className="flex gap-4">
            <div className="px-6 py-3 bg-white border border-gray-100 rounded-xl flex items-center gap-3">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
               <span className="text-[10px] font-black uppercase tracking-widest text-primary">Hệ thống ổn định</span>
            </div>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         {stats.map((stat, i) => (
           <motion.div
             key={stat.name}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             className="premium-card p-8 bg-white space-y-6"
           >
             <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-primary">
                   <stat.icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black ${stat.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                   {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                   {stat.trend}
                </div>
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-1">{stat.name}</p>
                <h3 className="text-3xl font-black text-primary tracking-tighter">
                   {typeof stat.value === 'number' && stat.name.includes("thu") ? formatCurrency(stat.value) : stat.value}
                </h3>
             </div>
           </motion.div>
         ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 premium-card p-10 bg-white">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-10">Biểu đồ doanh thu (Mô phỏng)</h3>
            <div className="h-80 bg-secondary/30 rounded-[3rem] border border-dashed border-gray-200 flex items-center justify-center">
               <p className="text-[10px] font-black uppercase tracking-widest text-primary/20 italic">Biểu đồ sẽ hiển thị tại đây</p>
            </div>
         </div>
         <div className="premium-card p-10 bg-white">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-10">Hoạt động gần đây</h3>
            <div className="space-y-8">
               {[
                 { user: "Anh Quân", action: "vừa đặt đơn hàng mới", time: "2 phút trước" },
                 { user: "Minh Thư", action: "đã đăng ký tài khoản", time: "15 phút trước" },
                 { user: "Hoàng Long", action: "viết đánh giá 5 sao", time: "1 giờ trước" },
                 { user: "Admin", action: "đã thêm sản phẩm mới", time: "2 giờ trước" },
               ].map((item, i) => (
                 <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center font-black text-primary uppercase text-xs">{item.user[0]}</div>
                    <div>
                       <p className="text-[10px] font-bold text-primary italic leading-tight uppercase tracking-tight">
                          <span className="text-accent">{item.user}</span> {item.action}
                       </p>
                       <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-40 mt-1">{item.time}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
