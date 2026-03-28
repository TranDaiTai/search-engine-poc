"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, Search, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { getItemCount } = useCartStore();
  const itemCount = getItemCount();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { name: "Trang chủ", href: "/" },
    { name: "Cửa hàng", href: "/shop" },
    { name: "Khuyến mãi", href: "/promotions" },
    { name: "Về chúng tôi", href: "/about" },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out ${
        isScrolled 
          ? "py-3 bg-white/80 backdrop-blur-xl shadow-premium border-b border-gray-100/50" 
          : "py-8 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div 
            animate={{ scale: isScrolled ? 0.9 : 1 }}
            className="w-10 h-10 bg-accent text-white rounded-xl flex items-center justify-center font-black text-xl group-hover:rotate-6 transition-transform shadow-lg shadow-accent/20"
          >
            E
          </motion.div>
          <motion.span 
            animate={{ scale: isScrolled ? 0.95 : 1 }}
            className={`text-2xl font-black tracking-tighter uppercase italic transition-colors ${isScrolled ? 'text-primary' : 'text-primary'}`}
          >
            EcoMarket
          </motion.span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-10">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`text-[10px] font-bold uppercase tracking-widest transition-all relative py-2 ${
                  isActive 
                    ? "text-accent" 
                    : "text-primary/70 hover:text-accent"
                }`}
              >
                {item.name}
                {isActive && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <button className="p-2 text-primary/60 hover:text-accent transition-colors">
            <Search className="w-5 h-5" />
          </button>
          
          <Link href="/cart" className="relative p-2 text-primary/60 hover:text-accent transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-0 right-0 w-4 h-4 bg-accent text-[8px] text-white font-bold flex items-center justify-center rounded-full shadow-lg shadow-accent/30"
              >
                {itemCount}
              </motion.span>
            )}
          </Link>

          <Link 
            href={user ? "/profile" : "/login"} 
            className="hidden md:flex items-center gap-3 pl-6 border-l border-gray-100 group"
          >
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-primary overflow-hidden border border-gray-50 transition-all group-hover:border-accent/40 shadow-sm">
              {user?.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User className="w-5 h-5" />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary group-hover:text-accent transition-colors">
              {user ? user.username : "Tài khoản"}
            </span>
          </Link>

          <button 
            className="md:hidden p-2 text-primary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl shadow-2xl p-8 border-t border-gray-100 flex flex-col gap-6 overflow-hidden"
          >
             {menuItems.map((item) => (
              <Link 
                key={item.name} 
                href={item.href} 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-sm font-black uppercase tracking-widest transition-colors ${pathname === item.href ? 'text-accent' : 'text-primary'}`}
              >
                {item.name}
              </Link>
            ))}
            <Link 
              href={user ? "/profile" : "/login"} 
              onClick={() => setIsMobileMenuOpen(false)}
              className="pt-8 mt-4 border-t border-gray-100 flex items-center gap-4"
            >
               <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-accent">
                  <User className="w-5 h-5" />
               </div>
               <span className="text-sm font-black uppercase tracking-widest text-primary">Hồ sơ cá nhân</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
