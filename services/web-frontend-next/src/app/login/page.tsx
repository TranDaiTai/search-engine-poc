"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, LogIn, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login({ username: email, password });
    if (success) {
      toast.success("Chào mừng bạn quay trở lại!");
      router.push("/");
    } else {
      toast.error("Thông tin đăng nhập không chính xác.");
    }
    setIsLoading(false);
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
            <h1 className="text-3xl font-black text-primary tracking-tighter uppercase">Đăng nhập</h1>
            <p className="text-sm text-muted-foreground font-medium italic">Chào mừng bạn gia nhập cộng đồng EcoMarket.</p>
         </div>

         <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-2">Email của bạn</label>
               <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                  <input 
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-secondary/50 border-none rounded-2xl py-5 pl-16 pr-6 focus:ring-2 focus:ring-accent font-bold outline-none"
                    placeholder="EMAIL@EXAMPLE.COM"
                  />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-2">Mật khẩu</label>
               <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                  <input 
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-secondary/50 border-none rounded-2xl py-5 pl-16 pr-6 focus:ring-2 focus:ring-accent font-bold outline-none"
                    placeholder="••••••••"
                  />
               </div>
            </div>

            <button 
               type="submit" 
               disabled={isLoading}
               className="w-full btn-primary py-5 flex items-center justify-center gap-4 text-sm"
            >
               {isLoading ? "Đang xử lý..." : "Đăng nhập ngay"} <LogIn className="w-5 h-5" />
            </button>
         </form>

         <div className="mt-10 pt-10 border-t border-gray-100 text-center">
            <p className="text-sm font-medium text-muted-foreground">Chưa có tài khoản? <Link href="/register" className="text-accent font-black uppercase tracking-widest hover:underline">Đăng ký ngay</Link></p>
         </div>
      </div>
    </div>
  );
}
