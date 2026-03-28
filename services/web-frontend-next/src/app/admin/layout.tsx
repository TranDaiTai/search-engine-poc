"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, Layers, ClipboardList, Tag, Users, LogOut, ChevronRight, Home } from "lucide-react";
import { motion } from "framer-motion";

const sidebarLinks = [
  { name: "Tổng quan", icon: LayoutDashboard, href: "/admin" },
  { name: "Sản phẩm", icon: ShoppingBag, href: "/admin/products" },
  { name: "Danh mục", icon: Layers, href: "/admin/categories" },
  { name: "Đơn hàng", icon: ClipboardList, href: "/admin/orders" },
  { name: "Khuyến mãi", icon: Tag, href: "/admin/promotions" },
  { name: "Người dùng", icon: Users, href: "/admin/users" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "admin") {
    return <div className="min-h-screen bg-primary flex items-center justify-center text-white">XÁC THỰC QUYỀN TRUY CẬP...</div>;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-gray-100 flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="p-10">
          <Link href="/" className="flex items-center gap-3 group">
             <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-black text-xl group-hover:bg-accent transition-colors">E</div>
             <span className="text-xl font-black text-primary tracking-tighter uppercase">EcoMarket <span className="text-accent italic">Pro</span></span>
          </Link>
        </div>

        <nav className="flex-1 px-6 space-y-2">
           <p className="text-xs font-bold uppercase tracking-widest text-primary/60 px-4 mb-4">Quản trị hệ thống</p>
           {sidebarLinks.map((link) => {
             const isActive = pathname === link.href;
             return (
               <Link 
                 key={link.name}
                 href={link.href}
                 className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${isActive ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-primary/60 hover:bg-secondary hover:text-primary'}`}
               >
                 <div className="flex items-center gap-4">
                    <link.icon className={`w-5 h-5 ${isActive ? 'text-accent' : ''}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{link.name}</span>
                 </div>
                 {isActive && <ChevronRight className="w-4 h-4 text-accent" />}
               </Link>
             );
           })}
        </nav>

        <div className="p-8 border-t border-gray-50 flex flex-col gap-4">
           <Link href="/" className="flex items-center gap-4 p-4 text-xs font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-all">
              <Home className="w-5 h-5" /> Về trang chủ
           </Link>
           <button 
             onClick={() => { logout(); router.push("/"); }}
             className="flex items-center gap-4 p-4 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-2xl transition-all text-left"
           >
              <LogOut className="w-5 h-5" /> Đăng xuất Admin
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-80 min-h-screen">
         <header className="h-24 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 px-10 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary/70">
               {sidebarLinks.find(l => l.href === pathname)?.name || "Bảng điều khiển"}
            </h2>
            <div className="flex items-center gap-6">
               <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">{user.username}</p>
                  <p className="text-[8px] font-bold text-accent uppercase italic">Quản trị viên</p>
               </div>
               <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center font-black text-primary">
                  {user.username[0].toUpperCase()}
               </div>
            </div>
         </header>
         
         <div className="p-10">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
         </div>
      </main>
    </div>
  );
}
