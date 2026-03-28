"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Mail, Lock, UserPlus, ArrowLeft } from "lucide-react";
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    full_name: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await authService.register(formData);
      if (success) {
        toast.success("Đăng ký thành công! Hãy đăng nhập nhé.");
        router.push("/login");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra. Tên đăng nhập hoặc email có thể đã tồn tại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex items-center justify-center p-6">
      <div className="absolute top-0 left-0 p-10">
         <Link href="/" className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-primary/70 hover:text-accent transition-colors">
            <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
         </Link>
      </div>

      <div className="w-full max-w-md premium-card p-12 bg-white/80 animate-slideUp">
         <div className="text-center mb-10 space-y-4">
            <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center font-black text-3xl mx-auto shadow-lg">E</div>
            <h1 className="text-3xl font-black text-primary tracking-tighter uppercase">Tham gia ngay</h1>
            <p className="text-sm text-muted-foreground font-medium italic">Trở thành một phần của lối sống bền vững.</p>
         </div>

         <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
               <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-2">Họ và tên</label>
               <div className="relative">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                  <input 
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full bg-secondary/50 border-none rounded-2xl py-5 pl-16 pr-6 focus:ring-2 focus:ring-accent font-bold outline-none"
                    placeholder="NGUYỄN VĂN A"
                  />
               </div>
            </div>

            <div className="space-y-1">
               <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-2">Tên đăng nhập / Email</label>
               <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                  <input 
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value, email: e.target.value})}
                    className="w-full bg-secondary/50 border-none rounded-2xl py-5 pl-16 pr-6 focus:ring-2 focus:ring-accent font-bold outline-none"
                    placeholder="USERNAME"
                  />
               </div>
            </div>

            <div className="space-y-1">
               <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-2">Mật khẩu bảo mật</label>
               <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                  <input 
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-secondary/50 border-none rounded-2xl py-5 pl-16 pr-6 focus:ring-2 focus:ring-accent font-bold outline-none"
                    placeholder="••••••••"
                  />
               </div>
            </div>

            <button 
               type="submit" 
               disabled={isLoading}
               className="w-full btn-primary py-5 flex items-center justify-center gap-4 text-sm mt-4"
            >
               {isLoading ? "Đang xử lý..." : "Tạo tài khoản ngay"} <UserPlus className="w-5 h-5" />
            </button>
         </form>

         <div className="mt-10 pt-10 border-t border-gray-100 text-center">
            <p className="text-sm font-medium text-muted-foreground">Đã có tài khoản? <Link href="/login" className="text-accent font-black uppercase tracking-widest hover:underline">Đăng nhập ngay</Link></p>
         </div>
      </div>
    </div>
  );
}
