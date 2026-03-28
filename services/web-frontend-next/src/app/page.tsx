"use client";

import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Zap, ShoppingBag, ChevronRight, ChevronLeft, Leaf, Star } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import ProductCard from "@/components/product/ProductCard";
import { useRef, useState, useEffect, useCallback } from "react";

const SLIDES = [
  {
    badge: "Bộ sưu tập 2026 • Mới nhất",
    badgeIcon: Sparkles,
    title: ["Nâng Tầm", "Phong Cách", "Bền Vững"],
    titleAccent: 1, // index of the italic accent line
    description: "EcoMarket không chỉ là mua sắm, đó là tuyên ngôn về lối sống hiện đại và trách nhiệm với môi trường.",
    cta: "Khám phá ngay",
    ctaHref: "/shop",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Premium Fashion",
    badge2: "Luxury Eco Fashion",
    badge2Sub: "Sustainably Crafted",
    accent: "#4F6F52",
    stat: { value: "2026", label: "Bộ sưu tập mới" },
  },
  {
    badge: "Phong cách tối giản • Premium",
    badgeIcon: Star,
    title: ["Phụ Kiện", "Tối Giản", "Tinh Tế"],
    titleAccent: 2,
    description: "Những phụ kiện được chắt lọc từ vật liệu tái chế cao cấp, mang vẻ đẹp thuần khiết và bền bỉ theo thời gian.",
    cta: "Khám phá bộ sưu tập",
    ctaHref: "/shop?category=accessories",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Minimal Accessories",
    badge2: "Minimal Collection",
    badge2Sub: "Zero Waste",
    accent: "#4F6F52",
    stat: { value: "100%", label: "Vật liệu tái chế" },
  },
  {
    badge: "Thời trang bền vững • Eco",
    badgeIcon: Leaf,
    title: ["Thời Trang", "Vì", "Trái Đất"],
    titleAccent: 1,
    description: "Mỗi sản phẩm chúng tôi bán đi, một cây xanh được trồng. Thời trang không chỉ đẹp mà còn có ý nghĩa.",
    cta: "Tham gia phong trào",
    ctaHref: "/shop",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Sustainable Fashion",
    badge2: "Green Initiative",
    badge2Sub: "1 Product = 1 Tree",
    accent: "#4F6F52",
    stat: { value: "10K+", label: "Cây đã trồng" },
  },
];

export default function HomePage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback((idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  }, [current]);

  // Autoplay
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent(prev => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const { data: categoriesData = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => productService.getCategories(),
  });

  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const { data: productsData = [] } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => productService.getAllProducts("limit=10"),
  });

  const rawProducts: any = productsData;
  const featuredProducts: any[] = rawProducts?.products ?? (Array.isArray(rawProducts) ? rawProducts : []);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -400, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 400, behavior: "smooth" });
    }
  };
const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};


  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Carousel */}
      <section
        className="relative min-h-[90vh] flex items-center overflow-hidden bg-gray-50/30 pt-24"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Background glow */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[820px] bg-accent/5 rounded-full blur-[150px] -mr-96 -mt-96" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -ml-64 -mb-64" />
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center min-h-[75vh]">

            {/* Left — Text content */}
            <div className="relative overflow-hidden py-8">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={current}
                  custom={direction}
                  initial={{ opacity: 0, x: -60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 60 }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-8"
                >
                  {/* Badge */}
                  <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white rounded-full border border-gray-100 shadow-sm">
                    {(() => { const Icon = SLIDES[current].badgeIcon; return <Icon className="w-4 h-4 text-accent" />; })()}
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/60">{SLIDES[current].badge}</span>
                  </div>

                  {/* Title */}
                  <h1 className="text-7xl md:text-8xl font-bold text-primary tracking-tight leading-[1.05]">
                    {SLIDES[current].title.map((line, i) =>
                      i === SLIDES[current].titleAccent
                        ? <span key={i} className="block text-accent italic font-serif font-medium">{line}</span>
                        : <span key={i} className="block">{line}</span>
                    )}
                  </h1>

                  {/* Description */}
                  <p className="text-xl text-muted-foreground font-medium italic max-w-lg leading-relaxed opacity-80">
                    "{SLIDES[current].description}"
                  </p>

                  {/* CTA */}
                  <div className="flex items-center gap-8 pt-2">
                    <Link
                      href={SLIDES[current].ctaHref}
                      className="btn-primary px-10 py-5 flex items-center gap-4 group"
                    >
                      {SLIDES[current].cta}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      href="/about"
                      className="relative text-xs font-bold uppercase tracking-[0.2em] text-primary group/cta py-2"
                    >
                      Tìm hiểu thêm
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-accent scale-x-0 group-hover/cta:scale-x-100 transition-transform duration-500 origin-left" />
                    </Link>
                  </div>

                  {/* Nav Dots */}
                  <div className="flex items-center gap-2 pt-4">
                    {SLIDES.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => goTo(i)}
                        aria-label={`Slide ${i + 1}`}
                        className={`h-2 rounded-full transition-all duration-500 ${
                          i === current
                            ? 'w-10 bg-accent'
                            : 'w-2 bg-primary/20 hover:bg-primary/40'
                        }`}
                      />
                    ))}
                    <span className="ml-3 text-xs font-bold text-primary/30 uppercase tracking-widest">
                      {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right — Product image */}
            <div className="hidden md:block relative w-full aspect-[4/5]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={current}
                  custom={direction}
                  initial={{ opacity: 0, x: 60, scale: 0.97 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -60, scale: 0.97 }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full"
                >
                  <div className="w-full h-full bg-gradient-to-tr from-secondary/30 to-white rounded-3xl border border-white shadow-2xl relative overflow-hidden group">
                    <img
                      src={SLIDES[current].image}
                      alt={SLIDES[current].imageAlt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-95"
                    />
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-3xl" />
                  </div>

                  {/* Floating stat badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="absolute -bottom-6 -right-6 glass-effect p-6 rounded-2xl shadow-2xl z-20 border-white/50"
                  >
                    <p className="text-2xl font-black text-primary">{SLIDES[current].stat.value}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-accent mt-0.5">{SLIDES[current].stat.label}</p>
                  </motion.div>

                  {/* Slide indicator on image */}
                  <div className="absolute top-6 left-6 flex gap-1.5">
                    {SLIDES.map((_, i) => (
                      <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === current ? 'w-8 bg-white' : 'w-1 bg-white/40'}`} />
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Categories Section */}
      <motion.section {...(fadeUp as any)} className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-baseline justify-between mb-16 gap-4">
            <div className="space-y-3">
              <h2 className="text-5xl font-bold text-primary tracking-tight leading-none uppercase">
                Danh mục <br /> <span className="text-accent italic font-serif font-medium lowercase">xu hướng</span>
              </h2>
              <p className="text-muted-foreground font-medium text-lg italic opacity-75 leading-relaxed">Khám phá phong cách qua các bộ sưu tập đặc sắc</p>
            </div>
            <Link href="/shop" className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 hover:text-accent transition-colors flex items-center gap-3 group">
              Xem tất cả danh mục <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-[700px]">
            {categories.slice(0, 5).map((category: any, i: number) => {
              const bentoClasses = [
                "md:col-span-2 md:row-span-2", // 0
                "md:col-span-2 md:row-span-1", // 1
                "md:col-span-1 md:row-span-1", // 2
                "md:col-span-1 md:row-span-1", // 3
                "md:col-span-2 md:row-span-1", // 4
              ][i] || "col-span-1 row-span-1";

              return (
                <Link 
                  key={category.id}
                  href={`/shop?category=${category.id}`}
                  className={`${bentoClasses} group relative rounded-2xl overflow-hidden bg-secondary shadow-sm hover:shadow-2xl transition-all duration-700`}
                >
                  <img 
                    src={category.imageUrl 
                      ? (category.imageUrl.startsWith('http') ? category.imageUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api','') || 'http://localhost:5000'}${category.imageUrl}`)
                      : `https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80`}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity" />
                  <div className="absolute bottom-10 left-10 text-white space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">Shop collection</p>
                    <h3 className="text-2xl font-bold tracking-tight uppercase">{category.name}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Featured Products Carousel */}
      <motion.section {...(fadeUp as any)} className="py-24 bg-secondary/20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-16">
            <div className="space-y-3">
              <h2 className="text-5xl font-bold text-primary tracking-tight leading-none uppercase">
                Sản phẩm <br /> <span className="text-accent italic font-serif font-medium lowercase">nổi bật</span>
              </h2>
              <p className="text-muted-foreground font-medium text-lg italic opacity-75">Những thiết kế được yêu thích nhất mùa này</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={scrollLeft}
                className="w-14 h-14 rounded-full border border-primary/5 bg-white flex items-center justify-center text-primary shadow-sm hover:bg-primary hover:text-white transition-all active:scale-90"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={scrollRight}
                className="w-14 h-14 rounded-full border border-primary/5 bg-white flex items-center justify-center text-primary shadow-sm hover:bg-primary hover:text-white transition-all active:scale-90"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div 
            ref={scrollRef}
            className="flex gap-8 overflow-x-auto pb-12 no-scrollbar snap-x snap-mandatory"
          >
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product: any, index: number) => (
                <div key={product.id} className="min-w-[320px] md:min-w-[380px] snap-start">
                  <ProductCard product={product} index={index} />
                </div>
              ))
            ) : (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="min-w-[320px] bg-white/50 animate-pulse rounded-3xl h-[450px]" />
              ))
            )}
          </div>

          <div className="flex justify-center mt-12">
            <Link 
              href="/shop" 
              className="group relative inline-flex items-center gap-12 px-12 py-6 bg-primary text-white rounded-full shadow-2xl hover:scale-105 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] relative z-10">
                Khám phá toàn bộ cửa hàng
              </span>
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center relative z-10 group-hover:bg-white group-hover:text-primary transition-all duration-500">
                <ArrowRight className="w-5 h-5" />
              </div>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Social Trust */}
     

      <Footer />
      
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .shadow-premium {
          box-shadow: 0 20px 50px -20px rgba(0, 0, 0, 0.08);
        }
      `}</style>
    </main>
  );
}
