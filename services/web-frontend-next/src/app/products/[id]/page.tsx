"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, 
  Heart, 
  ShieldCheck, 
  Zap, 
  ArrowLeft, 
  Star, 
  Plus, 
  Minus, 
  MessageSquare, 
  Send,
  Share2,
  Check,
  ChevronRight,
  ChevronLeft,
  Truck,
  RotateCcw,
  X
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import ProductCard, { Product } from "@/components/ProductCard";
import ToastNotification from "@/components/ToastNotification";
import OrderModal from "@/components/OrderModal";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  
  // Order & Toast State
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" as "success" | "error", visible: false });

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
       const res = await fetch(`/api/search?q=id:${id}`); // Mocking detail via search
       const data = await res.json();
       return data.results?.[0] || null;
    },
    enabled: !!id,
  });

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ["related-products", product?.category],
    queryFn: async () => {
       if (!product?.category) return [];
       const res = await fetch(`/api/search?q=category:${encodeURIComponent(product.category)}&limit=4`);
       const data = await res.json();
       return data.results || [];
    },
    enabled: !!product?.category,
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const handleConfirmOrder = async () => {
    if (!product) return;
    setIsProcessingOrder(true);
    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity })
      });
      if (response.ok) {
        showToast('Đặt hàng thành công!', 'success');
        setIsOrderModalOpen(false); 
      } else {
        showToast('Lỗi đặt hàng', 'error');
      }
    } catch (error) {
      showToast('Lỗi kết nối', 'error');
    } finally {
      setIsProcessingOrder(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-white" />;
  if (!product) return <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-widest text-primary/20">Sản phẩm không tồn tại</div>;

  const originalPrice = product.price * 1.2;
  const discountPercent = 20;
  const galleryImages = [getImageUrl(product.image)];

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <ToastNotification {...toast} />
      <Navbar onSearch={() => {}} results={[]} isLoading={false} />

      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-xl p-4 px-6"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img src={getImageUrl(product.image)} alt={product.name} className="w-12 h-12 rounded-lg object-cover hidden md:block" />
                <div className="hidden md:block">
                  <p className="text-sm font-black text-primary truncate max-w-[200px] uppercase tracking-tight">{product.name}</p>
                  <p className="text-xs font-bold text-accent">{formatCurrency(product.price)}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOrderModalOpen(true)}
                className="flex-1 md:flex-none btn-primary px-8 py-3 text-[10px]"
              >
                Mua ngay {formatCurrency(product.price * quantity)}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-10">
            <Link href="/" className="hover:text-primary">Trang chủ</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/shop" className="hover:text-primary">Cửa hàng</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-primary truncate">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start mb-24 bg-white p-8 md:p-12 rounded-[3.5rem] shadow-sm border border-gray-50">
          <div className="lg:col-span-5 space-y-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-[4/5] bg-secondary/20 rounded-3xl overflow-hidden relative group"
            >
              <img src={galleryImages[activeImgIdx]} alt={product.name} className="w-full h-full object-cover" />
              <div className="absolute top-6 left-6">
                 <span className="px-4 py-1.5 bg-accent text-white rounded-full text-[9px] font-black uppercase tracking-widest">Premium Choice</span>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-4">
               <div className="flex items-center gap-6 divide-x divide-gray-100">
                   <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5 text-accent">
                         {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-accent" />)}
                      </div>
                      <span className="text-xs font-black text-accent">5.0</span>
                   </div>
                   <div className="px-6">
                      <span className="text-xs font-bold text-primary/40 uppercase tracking-widest">Trong kho: {product.stock}</span>
                   </div>
               </div>
               
               <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tighter uppercase leading-[1.05]">{product.name}</h1>
               
               <div className="bg-gray-50/50 p-6 rounded-2xl flex items-center gap-6">
                  <span className="text-sm text-primary/40 line-through font-bold">{formatCurrency(originalPrice)}</span>
                  <span className="text-4xl font-black text-accent tracking-tighter italic">{formatCurrency(product.price)}</span>
                  <span className="bg-red-50 text-red-500 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">-{discountPercent}%</span>
               </div> 
            </div>

            <p className="text-lg text-primary/60 font-medium leading-relaxed italic pr-12">
              "{product.description}"
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-4">
              <div className="flex items-center bg-gray-50 rounded-2xl p-1.5 border border-gray-100">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all"><Minus className="w-4 h-4" /></button>
                <span className="w-14 text-center font-black text-primary">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all"><Plus className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
               <button 
                onClick={() => setIsOrderModalOpen(true)}
                className="w-full bg-primary text-white py-5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-primary/10"
               >
                  Đặt hàng ngay
               </button>
               <button className="hidden sm:flex w-16 h-16 rounded-2xl border-2 border-gray-100 items-center justify-center text-primary/30 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0">
                  <Heart className="w-6 h-6" />
               </button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-100">
                {[
                  { icon: Truck, label: "Giao nhanh", color: "emerald" },
                  { icon: ShieldCheck, label: "Bảo mật", color: "blue" },
                  { icon: RotateCcw, label: "Đổi trả", color: "orange" },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center text-center gap-3 opacity-60">
                    <div className={`w-10 h-10 bg-${item.color}-50 text-${item.color}-600 rounded-full flex items-center justify-center`}><item.icon className="w-5 h-5" /></div>
                    <p className="text-[9px] font-black uppercase tracking-widest">{item.label}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <section className="space-y-12">
           <h2 className="text-3xl font-black text-primary uppercase tracking-tighter">Sản phẩm <span className="text-accent italic font-serif lowercase font-medium">tương tự</span></h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((p: Product, idx: number) => (
                <ProductCard key={p.id} product={p} index={idx} onBuy={() => router.push(`/products/${p.id}`)} />
              ))}
           </div>
        </section>
      </div>

      <Footer />

      <AnimatePresence>
        {isOrderModalOpen && product && (
          <OrderModal 
            product={product}
            onClose={() => setIsOrderModalOpen(false)}
            onConfirm={handleConfirmOrder}
            isProcessing={isProcessingOrder}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
