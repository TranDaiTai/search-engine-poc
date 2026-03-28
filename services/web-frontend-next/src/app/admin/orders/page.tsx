"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/services/orderService";
import { motion } from "framer-motion";
import { ClipboardList, Filter, MoreHorizontal, Eye, CheckCircle2, Clock, Truck, PackageCheck, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

const statusConfig: any = {
  pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  processing: { icon: Truck, color: "text-blue-600", bg: "bg-blue-50" },
  delivered: { icon: PackageCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
  cancelled: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
};

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["adminOrders"],
    queryFn: () => orderService.getUserOrders(), // In a real app, Admin gets ALL orders
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => orderService.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      toast.success("Trạng thái đơn hàng đã được cập nhật.");
    }
  });

  return (
    <div className="space-y-12">
      <div className="flex items-end justify-between">
         <div className="space-y-4">
            <h1 className="text-5xl font-black text-primary uppercase tracking-tighter">Quản lý <br /> <span className="text-accent italic font-serif">Đơn hàng</span></h1>
            <p className="text-muted-foreground font-medium italic">Theo dõi và cập nhật trạng thái vận chuyển cho khách hàng.</p>
         </div>
         <div className="px-8 py-5 bg-white border border-gray-100 rounded-[2rem] flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary/40">
            <Filter className="w-4 h-4" /> Lọc đơn hàng
         </div>
      </div>

      <div className="premium-card bg-white border border-gray-100 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-gray-50">
                     <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-primary/30">Mã đơn</th>
                     <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-primary/30">Khách hàng</th>
                     <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-primary/30">Tổng tiền</th>
                     <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-primary/30">Trạng thái</th>
                     <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-primary/30 text-right">Quản lý</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    [1,2,3].map(i => <tr key={i}><td colSpan={5} className="px-10 py-8"><div className="h-12 bg-secondary/30 rounded-2xl animate-pulse"></div></td></tr>)
                  ) : orders.map((order: any) => {
                    const config = statusConfig[order.status] || statusConfig.pending;
                    return (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                         <td className="px-10 py-8">
                            <span className="font-black text-primary uppercase tracking-tight">ORD-{order.id}</span>
                         </td>
                         <td className="px-10 py-8">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">{order.user?.username || "Ẩn danh"}</p>
                            <p className="text-[10px] font-medium text-muted-foreground italic uppercase opacity-60">12/03/2026</p>
                         </td>
                         <td className="px-10 py-8">
                            <span className="text-xl font-black text-primary tracking-tighter">{formatCurrency(order.totalAmount)}</span>
                         </td>
                         <td className="px-10 py-8">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${config.bg} ${config.color} text-[10px] font-black uppercase tracking-widest`}>
                               <config.icon className="w-3 h-3" />
                               {order.status}
                            </div>
                         </td>
                         <td className="px-10 py-8 text-right">
                            <div className="flex items-center justify-end gap-3">
                               <select 
                                 onChange={(e) => updateStatusMutation.mutate({ id: order.id, status: e.target.value })}
                                 defaultValue={order.status}
                                 className="bg-secondary/50 border-none rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-accent"
                               >
                                  <option value="pending text-amber-600">PENDING</option>
                                  <option value="processing text-blue-600">PROCESSING</option>
                                  <option value="delivered text-emerald-600">DELIVERED</option>
                                  <option value="cancelled text-red-600">CANCELLED</option>
                               </select>
                               <button className="p-3 bg-secondary rounded-xl text-primary/40 hover:text-primary transition-all"><Eye className="w-5 h-5" /></button>
                            </div>
                         </td>
                      </tr>
                    );
                  })}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
