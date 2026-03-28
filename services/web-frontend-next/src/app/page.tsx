"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Sparkles, ShoppingBag, ChevronRight, ChevronLeft, 
  Leaf, Star, Clock, LayoutGrid, List, TrendingUp 
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard, { Product } from "@/components/ProductCard";
import ProductSkeleton from "@/components/ProductSkeleton";
import OrderModal from "@/components/OrderModal";
import ToastNotification from "@/components/ToastNotification";

const SLIDES = [
  {
    badge: "Bộ sưu tập 2026 • Mới nhất",
    badgeIcon: Sparkles,
    title: ["Nâng Tầm", "Phong Cách", "Bền Vững"],
    titleAccent: 1,
    description: "Garage không chỉ là mua sắm, đó là tuyên ngôn về lối sống hiện đại và trách nhiệm với môi trường.",
    cta: "Khám phá ngay",
    ctaHref: "/shop",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Premium Fashion",
    accent: "#4F6F52",
    stat: { value: "2026", label: "Bộ sưu tập mới" },
  },
  {
    badge: "Phong cách tối giản • Premium",
    badgeIcon: Star,
    title: ["Phụ Kiện", "Tối Giản", "Tinh Tế"],
    titleAccent: 2,
    description: "Những phụ kiện được chắt lọc từ vật liệu tái chế cao cấp, mang vẻ đẹp thuần khiết và bền bỉ theo thời gian.",
    cta: "Khám phá ngay",
    ctaHref: "/shop",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Minimal Accessories",
    accent: "#4F6F52",
    stat: { value: "100%", label: "Vật liệu tái chế" },
  },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" as "success" | "error", visible: false });
  
  // Carousel State
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Autoplay
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  // Search Data
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: async () => {
      const qParam = searchQuery.trim() ? encodeURIComponent(searchQuery.trim()) : "*";
      const response = await fetch(`/api/search?q=${qParam}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    placeholderData: (previousData) => previousData,
  });

  const featuredProducts = useMemo(() => data?.results || [], [data?.results]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const handleConfirmOrder = async () => {
    if (!selectedProduct) return;
    setIsProcessingOrder(true);
    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selectedProduct.id, quantity: 1 })
      });
      if (response.ok) {
        showToast('Đặt hàng thành công! Sản phẩm sẽ sớm đến với bạn.', 'success');
        setSelectedProduct(null); 
      } else {
        const err = await response.json();
        showToast('Lỗi: ' + (err.error || 'Không thể xử lý đơn hàng'), 'error');
      }
    } catch (error) {
      showToast('Lỗi kết nối mạng', 'error');
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -400, behavior: "smooth" });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 400, behavior: "smooth" });

  const fadeUp: any = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  return (
    <div className="min-h-screen bg-white">
      <ToastNotification {...toast} />
      
      <Navbar 
        onSearch={setSearchQuery} 
        results={featuredProducts} 
        isLoading={isLoading} 
      />

      <main className="flex flex-col">
        {/* Hero Carousel */}
        <section
          className="relative min-h-[90vh] flex items-center overflow-hidden bg-gray-50/30 pt-24"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[800px] h-[820px] bg-accent/5 rounded-full blur-[150px] -mr-96 -mt-96" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -ml-64 -mb-64" />
          </div>

          <div className="max-w-7xl mx-auto px-6 w-full z-10">
            <div className="grid md:grid-cols-2 gap-16 items-center min-h-[75vh]">
              <div className="relative overflow-hidden py-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current}
                    initial={{ opacity: 0, x: -60 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 60 }}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-8"
                  >
                    <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white rounded-full border border-gray-100 shadow-sm">
                      {(() => { const Icon = SLIDES[current].badgeIcon; return <Icon className="w-4 h-4 text-accent" />; })()}
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/60">{SLIDES[current].badge}</span>
                    </div>

                    <h1 className="text-7xl md:text-8xl font-black text-primary tracking-tight leading-[1.05] uppercase">
                      {SLIDES[current].title.map((line, i) =>
                        i === SLIDES[current].titleAccent
                          ? <span key={i} className="block text-accent italic font-serif font-medium lowercase">{line}</span>
                          : <span key={i} className="block">{line}</span>
                      )}
                    </h1>

                    <p className="text-xl text-primary/60 font-medium italic max-w-lg leading-relaxed">
                      "{SLIDES[current].description}"
                    </p>

                    <div className="flex items-center gap-8 pt-2">
                      <button className="btn-primary px-10 py-5 flex items-center gap-4 group">
                        {SLIDES[current].cta}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                      {SLIDES.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrent(i)}
                          className={`h-2 rounded-full transition-all duration-500 ${i === current ? 'w-10 bg-accent' : 'w-2 bg-primary/20 hover:bg-primary/40'}`}
                        />
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="hidden md:block relative w-full aspect-[4/5]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current}
                    initial={{ opacity: 0, x: 60, scale: 0.97 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -60, scale: 0.97 }}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full h-full"
                  >
                    <div className="w-full h-full bg-gradient-to-tr from-secondary/30 to-white rounded-3xl border border-white shadow-2xl relative overflow-hidden group">
                      <img src={SLIDES[current].image} alt={SLIDES[current].imageAlt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                    </div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="absolute -bottom-6 -right-6 glass-effect p-6 rounded-2xl shadow-2xl z-20 border-white/50"
                    >
                      <p className="text-2xl font-black text-primary">{SLIDES[current].stat.value}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-accent mt-0.5">{SLIDES[current].stat.label}</p>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <motion.section {...fadeUp} className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-16">
              <div className="space-y-3">
                <h2 className="text-5xl font-black text-primary tracking-tight leading-none uppercase">
                  Sản phẩm <br /> <span className="text-accent italic font-serif font-medium lowercase text-4xl">nổi bật</span>
                </h2>
                <div className="flex items-center gap-3">
                   <Clock className="w-4 h-4 text-accent" />
                   <p className="text-primary/60 font-bold text-xs uppercase tracking-widest">Cập nhật theo thời gian thực</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={scrollLeft} className="w-14 h-14 rounded-full border border-primary/5 bg-white flex items-center justify-center text-primary shadow-sm hover:bg-primary hover:text-white transition-all active:scale-90">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button onClick={scrollRight} className="w-14 h-14 rounded-full border border-primary/5 bg-white flex items-center justify-center text-primary shadow-sm hover:bg-primary hover:text-white transition-all active:scale-90">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div 
              ref={scrollRef}
              className="flex gap-8 overflow-x-auto pb-12 no-scrollbar snap-x snap-mandatory px-4"
            >
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="min-w-[320px] bg-gray-50 animate-pulse rounded-3xl h-[450px]" />
                ))
              ) : featuredProducts.length > 0 ? (
                featuredProducts.map((product: Product, index: number) => (
                  <div key={product.id} className="min-w-[320px] md:min-w-[380px] snap-start">
                    <ProductCard product={product} onBuy={setSelectedProduct} index={index} />
                  </div>
                ))
              ) : (
                <div className="w-full py-20 text-center glass-effect rounded-[3rem]">
                  <Sparkles className="w-12 h-12 text-accent mx-auto mb-4" />
                  <p className="text-primary/40 font-black uppercase tracking-widest text-sm">Không tìm thấy sản phẩm nào</p>
                </div>
              )}
            </div>
          </div>
        </motion.section>
      </main>

      <Footer />

      <AnimatePresence>
        {selectedProduct && (
          <OrderModal 
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onConfirm={handleConfirmOrder}
            isProcessing={isProcessingOrder}
          />
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
