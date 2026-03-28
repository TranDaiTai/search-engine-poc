"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Leaf, Home } from "lucide-react";
import { useEffect, useState } from "react";

// Floating leaf particle
function FloatingLeaf({ delay, x, size }: { delay: number; x: number; size: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none text-emerald-300/40"
      style={{ left: `${x}%`, top: "-5%" }}
      animate={{
        y: ["0vh", "110vh"],
        x: [0, Math.sin(delay) * 60, Math.sin(delay * 2) * -40, 0],
        rotate: [0, 180, 360],
        opacity: [0, 0.6, 0.6, 0],
      }}
      transition={{
        duration: 8 + delay * 2,
        delay: delay * 1.5,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <Leaf style={{ width: size, height: size }} />
    </motion.div>
  );
}

const LEAVES = [
  { delay: 0,   x: 10,  size: 20 },
  { delay: 1.2, x: 25,  size: 14 },
  { delay: 0.5, x: 45,  size: 28 },
  { delay: 2.1, x: 60,  size: 16 },
  { delay: 0.8, x: 75,  size: 22 },
  { delay: 1.7, x: 88,  size: 12 },
  { delay: 3.0, x: 35,  size: 18 },
  { delay: 2.5, x: 55,  size: 24 },
];

// Animated 404 digit
function FourOhFour() {
  return (
    <div className="relative select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.7, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="text-[clamp(120px,22vw,280px)] font-black tracking-tighter leading-none text-primary"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        4
        <motion.span
          animate={{ color: ["#10B981", "#4F6F52", "#059669", "#10B981"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          0
        </motion.span>
        4
      </motion.div>
      {/* Shadow echo */}
      <div
        className="absolute inset-0 text-[clamp(120px,22vw,280px)] font-black tracking-tighter leading-none text-emerald-100 -z-10 translate-y-2 translate-x-2"
        aria-hidden
      >
        404
      </div>
    </div>
  );
}

export default function NotFound() {
  const [glitch, setGlitch] = useState(false);

  // Random glitch trigger every few seconds
  useEffect(() => {
    const schedule = () => {
      const t = setTimeout(() => {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 300);
        schedule();
      }, 3000 + Math.random() * 4000);
      return t;
    };
    const t = schedule();
    return () => clearTimeout(t);
  }, []);

  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 text-center"
      style={{ background: "#FDFCFB" }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-emerald-100/60 rounded-full blur-[120px] -mt-40" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-100/50 rounded-full blur-[80px]" />
      </div>

      {/* Floating leaves */}
      {LEAVES.map((l, i) => <FloatingLeaf key={i} {...l} />)}

      {/* Content */}
      <div className="relative z-10 space-y-8 max-w-xl">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-full shadow-sm text-xs font-bold uppercase tracking-[0.2em] text-primary/50"
        >
          <Leaf className="w-3.5 h-3.5 text-emerald-500" />
          EcoMarket · Lỗi trang
        </motion.div>

        {/* Big 404 */}
        <FourOhFour />

        {/* Glitch heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <h1
            className={`text-2xl md:text-3xl font-bold tracking-tight text-primary transition-all ${
              glitch ? "skew-x-2 text-emerald-600" : ""
            }`}
          >
            {glitch ? "Tr_ng kh&#244;ng t&#7891;n_t&#7841;i" : "Trang không tồn tại"}
          </h1>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="text-primary/50 font-medium text-lg leading-relaxed"
        >
          Trang bạn đang tìm kiếm đã bị xóa, đổi tên hoặc chưa bao giờ tồn tại.<br />
          Nhưng hành trình bền vững vẫn còn tiếp diễn ở đây.
        </motion.p>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <Link
            href="/"
            className="group flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-full font-bold text-sm uppercase tracking-[0.15em] shadow-lg hover:bg-emerald-700 hover:shadow-emerald-200 hover:shadow-xl transition-all duration-300 active:scale-95"
          >
            <Home className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Về trang chủ
          </Link>
          <Link
            href="/shop"
            className="group flex items-center gap-3 px-8 py-4 bg-white border border-gray-200 text-primary rounded-full font-bold text-sm uppercase tracking-[0.15em] shadow-sm hover:border-emerald-400 hover:text-emerald-700 hover:shadow-md transition-all duration-300 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            Khám phá cửa hàng
          </Link>
        </motion.div>

        {/* Divider + suggestion */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="pt-8 border-t border-gray-100"
        >
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary/30 mb-5">
            Có thể bạn đang tìm
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: "Thời trang", href: "/shop?category=fashion" },
              { label: "Phụ kiện", href: "/shop?category=accessories" },
              { label: "Điện tử", href: "/shop?category=electronics" },
              { label: "Về chúng tôi", href: "/about" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-4 py-2 bg-white border border-gray-100 rounded-full text-xs font-bold text-primary/60 hover:border-emerald-400/60 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom brand mark */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-primary/20"
      >
        <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
          <span className="text-white text-xs font-black">E</span>
        </div>
        <span className="text-xs font-black uppercase tracking-[0.3em]">EcoMarket</span>
      </motion.div>
    </main>
  );
}
