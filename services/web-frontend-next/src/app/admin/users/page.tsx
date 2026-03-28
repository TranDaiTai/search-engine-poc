"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, Trash2, ShieldCheck, User as UserIcon, Mail, Calendar } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => userService.getAllUsers(),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success("Người dùng đã được xóa.");
    }
  });

  const filteredUsers = users.filter((u: any) => 
    (u.username || u.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      deleteUserMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex items-end justify-between">
         <div className="space-y-4">
            <h1 className="text-5xl font-black text-primary uppercase tracking-tighter">Quản lý <br /> <span className="text-accent italic font-serif">Người dùng</span></h1>
            <p className="text-muted-foreground font-medium italic">Danh sách hội viên và quản trị viên trong hệ thống.</p>
         </div>
      </div>

      <div className="relative group">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20 group-focus-within:text-accent transition-colors" />
         <input 
           type="text" 
           placeholder="Tìm theo tên, email hoặc username..."
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[2rem] outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-bold text-sm"
         />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
         {isLoading ? (
           [1,2,3].map(i => <div key={i} className="h-64 bg-white rounded-[3rem] animate-pulse"></div>)
         ) : filteredUsers.length === 0 ? (
           <div className="col-span-full py-20 text-center uppercase text-[10px] font-black opacity-20 tracking-widest italic">Không tìm thấy người dùng</div>
         ) : (
           filteredUsers.map((user: any) => (
             <motion.div 
               key={user.id}
               layout
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="premium-card p-10 bg-white border border-gray-100 space-y-8 group"
             >
                <div className="flex items-start justify-between">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-secondary flex items-center justify-center text-primary/20 group-hover:bg-accent group-hover:text-white transition-all overflow-hidden border border-gray-50">
                         {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <UserIcon className="w-8 h-8" />}
                      </div>
                      <div>
                         <h3 className="text-xl font-black text-primary uppercase tracking-tight">{user.username}</h3>
                         <div className={`inline-flex items-center gap-2 px-3 py-1 mt-1 rounded-full text-[8px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-accent/10 text-accent' : 'bg-secondary text-primary/40'}`}>
                            {user.role === 'admin' && <ShieldCheck className="w-3 h-3" />}
                            {user.role}
                         </div>
                      </div>
                   </div>
                   {user.role !== 'admin' && (
                     <button 
                       onClick={() => handleDelete(user.id)}
                       className="p-3 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 rounded-xl"
                     >
                        <Trash2 className="w-4 h-4" />
                     </button>
                   )}
                </div>

                <div className="space-y-4 pt-6 border-t border-gray-50">
                   <div className="flex items-center gap-4 text-xs font-medium text-primary/60 italic overflow-hidden">
                      <Mail className="w-4 h-4 shrink-0" />
                      <span className="truncate">{user.email}</span>
                   </div>
                   <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary/30 italic">
                      <Calendar className="w-4 h-4" />
                      Ngày tham gia: {new Date(user.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                   </div>
                </div>
             </motion.div>
           ))
         )}
      </div>
    </div>
  );
}
