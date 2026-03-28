"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, User, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "./SearchBar";
import { Product } from "./ProductCard";

interface NavbarProps {
  onSearch: (query: string) => void;
  results: Product[];
  isLoading: boolean;
}

export default function Navbar({ onSearch, results, isLoading }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <motion.div 
            animate={{ scale: isScrolled ? 0.9 : 1 }}
            className="w-10 h-10 bg-accent text-white rounded-xl flex items-center justify-center font-black text-xl group-hover:rotate-6 transition-transform shadow-lg shadow-accent/20"
          >
            G
          </motion.div>
          <motion.span 
            animate={{ scale: isScrolled ? 0.95 : 1 }}
            className="text-2xl font-black tracking-tighter uppercase italic text-primary"
          >
            Garage
          </motion.span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden xl:flex items-center gap-10">
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

        {/* Search Bar - Integrated from current project */}
        <div className="flex-1 hidden md:block max-w-2xl px-4">
          <SearchBar onSearch={onSearch} results={results} isLoading={isLoading} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 lg:gap-6 shrink-0">
          <button className="p-2 text-primary/60 hover:text-accent transition-colors hidden sm:block">
            <User className="w-5 h-5" />
          </button>
          
          <button className="relative p-2 text-primary/60 hover:text-accent transition-colors">
            <ShoppingBag className="w-5 h-5" />
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-0 right-0 w-4 h-4 bg-accent text-[8px] text-white font-bold flex items-center justify-center rounded-full shadow-lg shadow-accent/30"
            >
              2
            </motion.span>
          </button>

          <button 
            className="xl:hidden p-2 text-primary"
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
            className="xl:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl shadow-2xl p-8 border-t border-gray-100 flex flex-col gap-6 overflow-hidden"
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
            <div className="block md:hidden pt-4">
              <SearchBar onSearch={onSearch} results={results} isLoading={isLoading} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
