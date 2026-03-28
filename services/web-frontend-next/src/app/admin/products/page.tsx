"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Search, Filter, MoreVertical, X, Check, Package, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const rawData: any = useQuery({
    queryKey: ["adminProducts"],
    queryFn: () => productService.getAllProducts(),
  });
  const adminProductsRaw: any[] = rawData.data?.products ?? (Array.isArray(rawData.data) ? rawData.data : []);
  const isLoading = rawData.isLoading;

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      toast.success("Sản phẩm đã được xóa.");
    }
  });

  const filteredProducts = adminProductsRaw.filter((p: any) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product: any) => {
     setEditingProduct(product);
     setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
     if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
        deleteProductMutation.mutate(id);
     }
  };

  return (
    <div className="space-y-12">
      <div className="flex items-end justify-between">
         <div className="space-y-4">
            <h1 className="text-5xl font-black text-primary uppercase tracking-tighter">Quản lý <br /> <span className="text-accent italic font-serif">Sản phẩm</span></h1>
            <p className="text-muted-foreground font-medium italic italic">Danh sách và công cụ quản trị kho hàng của bạn.</p>
         </div>
         <button 
           onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
           className="btn-primary px-8 py-5 flex items-center gap-3"
         >
            <Plus className="w-5 h-5" /> THÊM SẢN PHẨM MỚI
         </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-6">
         <div className="relative group flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20 group-focus-within:text-accent transition-colors" />
            <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[2rem] outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-bold text-sm"
            />
         </div>
         <div className="px-8 py-5 bg-white border border-gray-100 rounded-[2rem] flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary/40">
            <Filter className="w-4 h-4" /> Lọc theo loại
         </div>
      </div>

      {/* Table */}
      <div className="premium-card bg-white overflow-hidden border border-gray-100">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-gray-50">
                     <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-primary/30">Sản phẩm</th>
                     <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-primary/30">Giá Niêm Yết</th>
                     <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-primary/30">Tồn kho</th>
                     <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-primary/30 text-right">Thao tác</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    [1,2,3,4,5].map(i => (
                       <tr key={i} className="animate-pulse">
                          <td colSpan={4} className="px-10 py-10"><div className="h-12 bg-secondary/30 rounded-2xl w-full"></div></td>
                       </tr>
                    ))
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                       <td colSpan={4} className="px-10 py-20 text-center italic text-muted-foreground uppercase text-[10px] font-black opacity-30 tracking-widest">Không có dữ liệu phù hợp</td>
                    </tr>
                  ) : (
                    filteredProducts.map((p: any) => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                         <td className="px-10 py-8">
                            <div className="flex items-center gap-6">
                               <div className="w-16 h-16 rounded-2xl overflow-hidden bg-secondary/30 border border-gray-100 shrink-0">
                                  <img 
                                    src={getImageUrl(p.images?.[0]?.imageUrl || p.image)} 
                                    className="w-full h-full object-cover" 
                                    alt={p.name} 
                                  />
                               </div>
                               <div>
                                  <p className="text-sm font-black text-primary uppercase tracking-tight">{p.name}</p>
                                  <p className="text-[10px] font-bold text-accent uppercase italic opacity-60">ID: PRODUCT-{p.id}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-10 py-8">
                            <span className="text-xl font-black text-primary tracking-tighter italic">{formatCurrency(p.price)}</span>
                         </td>
                         <td className="px-10 py-8">
                            <div className="flex items-center gap-3">
                               <div className={`w-2 h-2 rounded-full ${p.stock > 10 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                               <span className="text-[10px] font-black uppercase tracking-widest text-primary">{p.stock} <span className="opacity-40 ml-1">đơn vị</span></span>
                            </div>
                         </td>
                         <td className="px-10 py-8 text-right">
                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                               <button 
                                 onClick={() => handleEdit(p)}
                                 className="p-4 bg-white border border-gray-100 rounded-xl text-primary/40 hover:text-accent hover:border-accent hover:shadow-xl transition-all"
                               >
                                  <Edit2 className="w-4 h-4" />
                               </button>
                               <button 
                                 onClick={() => handleDelete(p.id)}
                                 className="p-4 bg-white border border-gray-100 rounded-xl text-primary/40 hover:text-red-500 hover:border-red-50 hover:shadow-xl transition-all"
                               >
                                  <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                         </td>
                      </tr>
                    ))
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Simple Modal logic would go here - for brevity, focusing on list first */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-primary/40 backdrop-blur-md"
          >
             <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.9, y: 20 }}
               className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl overflow-hidden p-12 space-y-10 relative"
             >
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-10 right-10 p-4 bg-secondary rounded-2xl hover:bg-gray-100 transition-colors"
                >
                   <X className="w-5 h-5 text-primary" />
                </button>

                <div className="space-y-4 text-center">
                   <h2 className="text-4xl font-black text-primary uppercase tracking-tighter">
                      {editingProduct ? "Cập nhật" : "Thêm mới"} <br /> <span className="text-accent italic font-serif">Sản phẩm</span>
                   </h2>
                </div>

                {/* Form Simulation */}
                <div className="grid md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-2">Tên sản phẩm</label>
                      <input type="text" defaultValue={editingProduct?.name} className="w-full bg-secondary/30 border-none rounded-2xl py-5 px-6 font-bold outline-none border-2 border-transparent focus:border-accent transition-all" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-2">Giá niêm yết</label>
                      <input type="number" defaultValue={editingProduct?.price} className="w-full bg-secondary/30 border-none rounded-2xl py-5 px-6 font-bold outline-none border-2 border-transparent focus:border-accent transition-all" />
                   </div>
                   {/* Add more fields as needed */}
                </div>

                <div className="pt-10 flex gap-4">
                   <button className="flex-1 btn-primary py-6 flex items-center justify-center gap-4 group">
                      LƯU THÔNG TIN <Check className="w-6 h-6 group-hover:scale-110 transition-transform" />
                   </button>
                   <button onClick={() => setIsModalOpen(false)} className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-primary/30 hover:text-primary transition-colors">
                      Hủy bỏ
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
