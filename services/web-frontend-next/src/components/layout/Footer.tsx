"use client";

import { Globe, Send, CircleCheck, CircleAlert } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setMessage("Email không đúng định dạng.");
      return;
    }

    setStatus("loading");
    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setMessage("Cảm ơn bạn đã đăng ký!");
      setEmail("");
    }, 1500);
  };

  return (
    <footer className="bg-primary text-white py-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white text-primary rounded-xl flex items-center justify-center font-black text-xl">E</div>
             <span className="text-2xl font-black tracking-tighter uppercase italic">EcoMarket</span>
          </div>
          <p className="text-white/70 text-sm font-medium italic leading-relaxed">
            "Sứ mệnh của chúng tôi là mang đến những sản phẩm bền vững và phong cách cho mọi người dùng hiện đại."
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-accent hover:text-white transition-all">
              <Globe className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-accent hover:text-white transition-all">
              <Globe className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-white">Khám phá</h4>
          <ul className="space-y-4">
             {["Tất cả sản phẩm", "Xu hướng", "Bộ sưu tập mới"].map(item => (
                <li key={item}><a href="/shop" className="text-sm text-white/70 hover:text-accent transition-colors">{item}</a></li>
             ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-white">Hỗ trợ</h4>
          <ul className="space-y-4">
             {["Giao hàng & Đổi trả", "Chính sách bảo hành", "Câu hỏi thường gặp"].map(item => (
                <li key={item}><a href="#" className="text-sm text-white/70 hover:text-accent transition-colors">{item}</a></li>
             ))}
          </ul>
        </div>

        <div className="space-y-8">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-white">Nhận tin mới</h4>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10 focus-within:border-accent/50 transition-colors">
                <input 
                    type="email" 
                    placeholder="Email của bạn" 
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if(status !== 'idle') setStatus('idle'); }}
                    className="bg-transparent border-none outline-none flex-1 px-4 text-sm font-bold placeholder:text-white/50"
                />
                <button 
                  disabled={status === 'loading'}
                  className="bg-white text-primary px-6 py-3 rounded-xl font-black uppercase text-[10px] hover:bg-accent hover:text-white transition-all disabled:opacity-50"
                >
                  {status === 'loading' ? '...' : 'Gửi'}
                </button>
              </div>
              
              <AnimatePresence mode="wait">
                {status === "success" && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] font-bold text-accent flex items-center gap-2"
                  >
                    <CircleCheck className="w-3 h-3" /> {message}
                  </motion.p>
                )}
                {status === "error" && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] font-bold text-red-400 flex items-center gap-2"
                  >
                    <CircleAlert className="w-3 h-3" /> {message}
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </div>
          <p className="text-xs font-medium text-white/60 italic">
            * Nhận thông báo về các bộ sưu tập mới nhất và ưu đãi đặc quyền.
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 mt-20 pt-10 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-bold uppercase tracking-widest text-white/60">
         <p>© 2026 EcoMarket. All rights reserved.</p>
         <div className="flex gap-10">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
         </div>
      </div>
    </footer>
  );
}
