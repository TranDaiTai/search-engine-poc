"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { promotionService } from "@/services/promotionService";
import { motion } from "framer-motion";
import { Plus, Tag, Calendar, Edit2, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminPromotionsPage() {
  const queryClient = useQueryClient();

  const { data: promotions = [], isLoading } = useQuery({
    queryKey: ["adminPromotions"],
    queryFn: () => promotionService.getAllPromotions(),
  });

  return (
    <div className="space-y-12">
      <div className="flex items-end justify-between">
         <div className="space-y-4">
            <h1 className="text-5xl font-black text-primary uppercase tracking-tighter">Quản lý <br /> <span className="text-accent italic font-serif">Khuyến mãi</span></h1>
            <p className="text-muted-foreground font-medium italic italic">Tạo và quản lý các chương trình ưu đãi, mã giảm giá.</p>
         </div>
         <button className="btn-primary px-8 py-5 flex items-center gap-3">
            <Plus className="w-5 h-5" /> TẠO MÃ GIẢM GIÁ
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {isLoading ? (
           [1,2].map(i => <div key={i} className="h-64 bg-white rounded-[3rem] animate-pulse"></div>)
         ) : promotions.map((promo: any) => (
           <motion.div 
             key={promo.id}
             className="premium-card p-10 bg-white border border-gray-100 flex flex-col sm:flex-row items-center gap-10 group"
           >
              <div className="w-32 h-32 bg-accent/10 rounded-[2.5rem] flex flex-col items-center justify-center text-accent shrink-0 group-hover:bg-accent group-hover:text-white transition-all">
                 <Tag className="w-10 h-10 mb-2" />
                 <span className="text-xs font-black uppercase tracking-tighter">{promo.discountValue}{promo.discountType === 'percentage' ? '%' : 'VND'}</span>
              </div>
              
              <div className="flex-1 space-y-6 text-center sm:text-left">
                 <div>
                    <h3 className="text-2xl font-black text-primary uppercase tracking-tight">{promo.code}</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase italic opacity-60">Hạn dùng: {new Date(promo.endDate).toLocaleDateString('vi-VN')}</p>
                 </div>
                 
                 <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                    <div className="px-4 py-2 bg-secondary rounded-xl text-[8px] font-black uppercase tracking-widest text-primary/40 flex items-center gap-2">
                       <Calendar className="w-3 h-3" /> Bắt đầu: {new Date(promo.startDate).toLocaleDateString('vi-VN')}
                    </div>
                 </div>
              </div>

              <div className="flex sm:flex-col gap-3">
                 <button className="p-4 bg-secondary rounded-2xl text-primary/40 hover:text-accent transition-colors"><Edit2 className="w-5 h-5" /></button>
                 <button className="p-4 bg-secondary rounded-2xl text-primary/40 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
              </div>
           </motion.div>
         ))}
      </div>
    </div>
  );
}
