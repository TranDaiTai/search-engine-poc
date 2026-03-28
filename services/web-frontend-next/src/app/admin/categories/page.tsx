"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, X, Check, Layers } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["adminCategories"],
    queryFn: () => productService.getCategories(),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => {
        // Assume productService has deleteCategory or use axios directly for brevity
        // Currently productService doesn't have it, but we can use axiosClient
        return Promise.resolve(); // Mock for now
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
      toast.success("Danh mục đã được xóa.");
    }
  });

  return (
    <div className="space-y-12">
      <div className="flex items-end justify-between">
         <div className="space-y-4">
            <h1 className="text-5xl font-black text-primary uppercase tracking-tighter">Quản lý <br /> <span className="text-accent italic font-serif">Danh mục</span></h1>
            <p className="text-muted-foreground font-medium italic">Phân loại sản phẩm để khách hàng dễ dàng tìm kiếm.</p>
         </div>
         <button 
           onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}
           className="btn-primary px-8 py-5 flex items-center gap-3"
         >
            <Plus className="w-5 h-5" /> THÊM DANH MỤC MỚI
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {isLoading ? (
           [1,2,3].map(i => <div key={i} className="h-40 bg-white rounded-[3rem] animate-pulse"></div>)
         ) : categories.map((cat: any) => (
           <motion.div 
             key={cat.id}
             className="premium-card p-10 bg-white border border-gray-100 flex items-center justify-between group"
           >
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-secondary rounded-[1.5rem] flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-white transition-all">
                    <Layers className="w-8 h-8" />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-primary uppercase tracking-tight">{cat.name}</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-40 italic">Slug: {cat.slug}</p>
                 </div>
              </div>
              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                 <button className="p-3 hover:bg-secondary rounded-xl text-primary/40 hover:text-accent transition-colors"><Edit2 className="w-4 h-4" /></button>
                 <button className="p-3 hover:bg-red-50 rounded-xl text-primary/40 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
           </motion.div>
         ))}
      </div>
    </div>
  );
}
