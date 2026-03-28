"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { productService } from "@/services/productService";
import { reviewService } from "@/services/reviewService";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
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
  RotateCcw
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import toast from "react-hot-toast";
import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { wishlistService } from "@/services/wishlistService";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { addToCart } = useCartStore();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("Xanh");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [reviewFilter, setReviewFilter] = useState("Tất cả");
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => productService.getProductDetails(slug as string),
    enabled: !!slug,
  });

  const productId = product?.id;

  const { data: reviewsData } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => reviewService.getReviewsByProductId(productId),
    enabled: !!productId,
  });

  const { data: relatedData } = useQuery({
    queryKey: ["related-products", product?.categoryId],
    queryFn: () => productService.getAllProducts(`category=${product?.categoryId}&limit=6`),
    enabled: !!product?.categoryId,
  });
  const relatedProducts: any[] = (relatedData as any)?.products ?? (Array.isArray(relatedData) ? relatedData : []);

  // Scroll detection for sticky bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 600) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAddToCart = (showToast = true) => {
    if (product) {
      // Find matching variant
      const matchingVariant = product.variants?.find((v: any) => 
        (v.size === selectedSize || !selectedSize) && 
        (v.color === selectedColor || !selectedColor)
      );

      addToCart({
        ...product,
        variantId: matchingVariant?.id
      }, quantity);

      if (showToast) {
        toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
      }
      return true;
    }
    return false;
  };

  const handleBuyNow = () => {
    if (handleAddToCart(false)) {
      router.push("/checkout");
    }
  };

  const addToWishlistMutation = useMutation({
    mutationFn: () => wishlistService.addToWishlist(productId),
    onSuccess: () => toast.success("Đã thêm vào yêu thích!"),
  });

  const createReviewMutation = useMutation({
    mutationFn: (data: any) => reviewService.createReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      setComment("");
      toast.success("Cảm ơn bạn đã đánh giá!");
    },
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;
    createReviewMutation.mutate({
      productId,
      rating,
      content: comment,
    });
  };

  const [showReviewForm, setShowReviewForm] = useState(false);

  // Initialize selections based on available variants — hook must be before any early return
  useEffect(() => {
    if (product?.variants?.length > 0) {
      if (product.variants[0].size) setSelectedSize(product.variants[0].size);
      if (product.variants[0].color) setSelectedColor(product.variants[0].color);
    }
  }, [product]);

  // useCallback hooks — must also be before any early return
  // Use a safe galleryLength derived via optional chaining for the deps
  const galleryLength = product?.images?.length ?? 1;

  const nextImg = useCallback(() => {
    setLightboxIdx((prev) => (prev + 1) % Math.max(galleryLength, 1));
  }, [galleryLength]);

  const prevImg = useCallback(() => {
    setLightboxIdx((prev) => (prev - 1 + Math.max(galleryLength, 1)) % Math.max(galleryLength, 1));
  }, [galleryLength]);

  // Keyboard navigation for lightbox — hook before early return
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextImg();
      if (e.key === "ArrowLeft") prevImg();
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, nextImg, prevImg]);

  // ---- Early return guards (AFTER all hooks) ----
  if (isLoading) return <div className="min-h-screen bg-white" />;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Sản phẩm không tồn tại</div>;

  // ---- Derived data (after guards, product is guaranteed non-null) ----
  const soldCount = product.soldCount ?? 0;
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : Number(product.price ?? 0) * 1.25;
  const discountPercent = originalPrice > Number(product.price ?? 0)
    ? Math.round((1 - Number(product.price ?? 0) / originalPrice) * 100)
    : 0;

  const sizes = (product.variants
    ? Array.from(new Set(product.variants.map((v: any) => v.size).filter(Boolean)))
    : ["S", "M", "L", "XL"]) as string[];
  const colors = (product.variants
    ? Array.from(new Set(product.variants.map((v: any) => v.color).filter(Boolean)))
    : ["Trắng", "Đen", "Xanh", "Be"]) as string[];

  const galleryImages = (product.images && product.images.length > 0)
    ? product.images.map((img: any) => getImageUrl(img.imageUrl))
    : [getImageUrl(product.image)];

  const openLightbox = (index: number) => {
    setLightboxIdx(index);
    setLightboxOpen(true);
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <Navbar />

      {/* Sticky Bottom Order Bar */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] p-4 md:py-4 px-6"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img 
                  src={getImageUrl(product.images?.[0]?.imageUrl || product.image)} 
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover hidden md:block"
                />
                <div className="hidden md:block">
                  <p className="text-sm font-black text-primary truncate max-w-[200px]">{product.name}</p>
                  <p className="text-xs font-bold text-accent">{formatCurrency(product.price)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-1 md:flex-none justify-end">
                 <div className="hidden sm:flex items-center bg-gray-50 rounded-xl p-1 border">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-white rounded-lg"><Minus className="w-3 h-3" /></button>
                    <span className="w-10 text-center font-bold text-sm">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-white rounded-lg"><Plus className="w-3 h-3" /></button>
                 </div>
                 <button 
                  onClick={() => handleAddToCart()}
                  className="flex-1 md:flex-none bg-primary text-white px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-all"
                 >
                    Thêm vào giỏ
                 </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-8 overflow-x-auto whitespace-nowrap pb-2">
            <Link href="/" className="hover:text-primary">Trang chủ</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/shop" className="hover:text-primary">Cửa hàng</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-primary truncate">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start mb-24 bg-white p-8 rounded-[3rem] shadow-sm border border-gray-50">
          {/* Gallery - 5 cols */}
          <div className="lg:col-span-5 space-y-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-[4/5] bg-secondary/20 rounded-3xl overflow-hidden relative group cursor-zoom-in"
              onClick={() => openLightbox(activeImgIdx)}
            >
              <AnimatePresence mode="wait">
                <motion.img 
                  key={activeImgIdx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  src={galleryImages[activeImgIdx]} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </AnimatePresence>
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                 <span className="px-4 py-1.5 bg-accent text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">New Arrival</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); /* share logic */ }}
                className="absolute bottom-6 right-6 w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-primary shadow-lg hover:bg-white transition-transform active:scale-90"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </motion.div>
            
            <div className="grid grid-cols-4 gap-4">
               {galleryImages.map((img: string, i: number) => (
                 <div 
                  key={i} 
                  onClick={() => setActiveImgIdx(i)}
                  className={`aspect-square rounded-2xl border-2 overflow-hidden cursor-pointer transition-all ${i === activeImgIdx ? 'border-accent shadow-md scale-[0.98]' : 'border-transparent hover:border-gray-200'}`}
                 >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                 </div>
               ))}
            </div>
          </div>

          {/* Info - 7 cols */}
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-4">
               <div className="flex flex-wrap items-center gap-y-2 divide-x divide-gray-200">
                   <div className="flex items-center gap-1.5 pr-4">
                      <div className="flex items-center gap-0.5 text-accent">
                         {[1,2,3,4,5].map(i => <Star key={i} className={`w-3 h-3 ${i <= Math.round(Number(reviewsData?.stats?.averageRating || product?.rating || 5)) ? 'fill-accent' : 'text-gray-200'}`} />)}
                      </div>
                      <span className="text-xs font-black text-accent border-b border-accent">{Number(reviewsData?.stats?.averageRating || product?.rating || 5).toFixed(1)}</span>
                   </div>
                   <div className="px-4">
                      <span className="text-xs font-black text-primary border-b border-primary">{reviewsData?.stats?.total ?? product?.reviewsCount ?? 0}</span>
                      <span className="text-xs font-bold text-primary/40 ml-1 uppercase">Đánh giá</span>
                   </div>
                   <div className="px-4">
                      <span className="text-xs font-black text-primary">{soldCount.toLocaleString()}</span>
                      <span className="text-xs font-bold text-primary/40 ml-1 uppercase">Đã bán</span>
                   </div>
               </div>
               
               <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight uppercase leading-[1.1]">{product.name}</h1>
               
               <div className="bg-gray-50/50 p-6 rounded-2xl flex items-center gap-6">
                  <span className="text-sm text-primary/40 line-through font-bold">{formatCurrency(originalPrice)}</span>
                  <span className="text-4xl font-black text-accent tracking-tighter uppercase italic">{formatCurrency(product.price)}</span>
                  <span className="bg-red-50 text-red-500 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">Giảm {discountPercent}%</span>
               </div> 
            </div>

            {/* variants swatches */}
            <div className="space-y-8">
               <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-center pr-4">
                    <p className="font-bold uppercase tracking-widest text-primary/70">Màu sắc: <span className="text-primary font-black ml-1 uppercase">{selectedColor}</span></p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                     {colors.map(color => (
                        <button 
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-6 py-3 rounded-xl border-2 font-black transition-all ${selectedColor === color ? 'border-primary bg-primary text-white shadow-lg' : 'border-gray-100 bg-white hover:border-gray-300'}`}
                        >
                          {color}
                        </button>
                     ))}
                  </div>
               </div>

               <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-center pr-4">
                    <p className="font-bold uppercase tracking-widest text-primary/70">Kích thước: <span className="text-primary font-black ml-1 uppercase">{selectedSize}</span></p>
                    <button className="text-[10px] font-bold text-accent underline uppercase">Bảng size</button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                     {sizes.map(size => (
                        <button 
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center font-black transition-all ${selectedSize === size ? 'border-primary bg-primary text-white shadow-lg' : 'border-gray-100 bg-white hover:border-gray-300'}`}
                        >
                          {size}
                        </button>
                     ))}
                  </div>
               </div>
            </div>

            {/* Quantity */}
            <div className="flex flex-wrap items-center gap-6 pt-4">
              <div className="flex items-center bg-gray-50 rounded-2xl p-1.5 border border-gray-100">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all"><Minus className="w-4 h-4" /></button>
                <span className="w-14 text-center font-black text-primary">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all"><Plus className="w-4 h-4" /></button>
              </div>
              <p className="text-[10px] font-bold text-muted-foreground italic uppercase">Còn lại: {product.stock || 50} sản phẩm</p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
               <button 
                onClick={() => handleAddToCart()}
                className="w-full sm:flex-1 bg-white border-2 border-primary text-primary py-5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all group"
               >
                  <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" /> Thêm vào giỏ
               </button>
               <button 
                onClick={handleBuyNow}
                className="w-full sm:flex-1 bg-primary text-white py-5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-primary/10"
               >
                  Mua ngay
               </button>
               <button 
                onClick={() => addToWishlistMutation.mutate()}
                className="hidden sm:flex w-16 h-16 rounded-2xl border-2 border-gray-100 items-center justify-center text-primary/30 hover:text-red-500 hover:border-red-50 hover:bg-red-50 transition-all flex-shrink-0"
               >
                  <Heart className="w-6 h-6" />
               </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-100">
                <div className="flex flex-col items-center text-center gap-3">
                   <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center"><Truck className="w-5 h-5" /></div>
                   <p className="text-[9px] font-black uppercase tracking-widest leading-tight">Giao hàng miễn phí <br /> từ 500k</p>
                </div>
                <div className="flex flex-col items-center text-center gap-3">
                   <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></div>
                   <p className="text-[9px] font-black uppercase tracking-widest leading-tight">Sản phẩm <br /> chính hãng 100%</p>
                </div>
                <div className="flex flex-col items-center text-center gap-3">
                   <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center"><RotateCcw className="w-5 h-5" /></div>
                   <p className="text-[9px] font-black uppercase tracking-widest leading-tight">Đổi trả <br /> trong 7 ngày</p>
                </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <section className="mb-24">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-50">
             <div className="flex items-center gap-4 mb-10">
                <div className="w-1.5 h-8 bg-accent rounded-full" />
                <h2 className="text-2xl font-black uppercase tracking-tighter text-primary">Thông tin chi tiết</h2>
             </div>
             
             <div className="grid md:grid-cols-5 gap-16">
                <div className="md:col-span-3 space-y-8">
                   <div className="prose prose-emerald max-w-none">
                      <p className="text-lg text-primary/70 leading-relaxed font-medium">
                         {product.description || "Đây là mẫu thiết kế mang đậm tính biểu tượng của EcoMarket. Được chế tác từ những vật liệu hữu cơ cao cấp, sản phẩm không chỉ mang lại sự thoải mái tối đa mà còn đảm bảo độ bền vượt thời gian."}
                      </p>
                      <p className="text-lg text-primary/70 leading-relaxed font-medium">
                        Chúng tôi cam kết mang đến những giá trị tốt nhất cho cộng đồng và môi trường thông qua từng sản phẩm. Mọi chi tiết từ đường kim mũi chỉ đến bao bì đều được tính toán kỹ lưỡng để giảm thiểu dấu chân carbon.
                      </p>
                   </div>
                   
                   {/* Specs from DB (product.specifications JSON) */}
                    {product.specifications && Object.keys(product.specifications).length > 0 ? (
                      <div className="pt-6 grid grid-cols-2 gap-y-4 gap-x-12 border-t border-gray-100 italic">
                        {Object.entries(product.specifications as Record<string, string>).map(([label, value]) => (
                          <div key={label} className="flex justify-between items-center text-sm">
                            <span className="text-primary/40 font-bold uppercase tracking-widest text-[10px]">{label}</span>
                            <span className="text-primary font-black">{value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="pt-6 grid grid-cols-2 gap-y-4 gap-x-12 border-t border-gray-100 italic">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-primary/40 font-bold uppercase tracking-widest text-[10px]">Thương hiệu</span>
                          <span className="text-primary font-black">EcoMarket</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-primary/40 font-bold uppercase tracking-widest text-[10px]">SKU</span>
                          <span className="text-primary font-black">ECO-{product.id?.toString().padStart(4,'0')}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-primary/40 font-bold uppercase tracking-widest text-[10px]">Danh mục</span>
                          <span className="text-primary font-black">{product.category?.name || "Khác"}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-primary/40 font-bold uppercase tracking-widest text-[10px]">Trạng thái</span>
                          <span className="text-primary font-black">Còn hàng</span>
                        </div>
                      </div>
                    )}
                </div>

                {/* Features from DB (product.features JSON array) */}
                <div className="md:col-span-2 bg-emerald-50/50 rounded-[2rem] p-8 space-y-6">
                   <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">Đặc điểm nổi bật</p>
                   <ul className="space-y-4">
                      {((product.features as string[]) ?? [
                        "Chất liệu thân thiện môi trường",
                        "Thiết kế thông minh, đa năng",
                        "Không chứa hóa chất độc hại",
                        "Bền bỉ theo thời gian"
                      ]).map((feat: string, fi: number) => (
                         <li key={fi} className="flex gap-4">
                            <div className="mt-1 w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center shrink-0">
                               <Check className="w-3 h-3" />
                            </div>
                            <p className="text-sm font-medium text-primary/70 leading-relaxed">{feat}</p>
                         </li>
                      ))}
                   </ul>
                </div>
             </div>
          </div>
        </section>

        {/* Advanced Reviews System */}
        <section className="mb-32">
          <h2 className="text-3xl font-black text-primary uppercase tracking-tighter mb-12">Đánh giá từ <span className="text-accent italic font-serif">Khách hàng</span></h2>
          
          <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-50">
            <div className="grid lg:grid-cols-12 gap-16 mb-16">
               {/* Review Stats - 4 cols */}
               <div className="lg:col-span-4 space-y-6 border-r border-gray-100 pr-12">
                  <div className="flex items-center gap-4">
                    <span className="text-6xl font-black text-primary">{Number(reviewsData?.stats?.averageRating || product?.rating || 0).toFixed(1)}</span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-accent">
                        {[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= Math.round(Number(reviewsData?.stats?.averageRating || product?.rating || 0)) ? 'fill-accent' : 'text-gray-200'}`} />)}
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary/30">{reviewsData?.stats?.total ?? product?.reviewsCount ?? 0} Nhận xét</p>
                    </div>
                  </div>
                  
                  {/* Progress Bars */}
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((stars) => {
                       const count: number = reviewsData?.stats?.ratingCounts?.[stars] ?? 0;
                       const total: number = reviewsData?.stats?.total ?? 1;
                       const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                       return (
                        <div key={stars} className="flex items-center gap-3">
                           <span className="w-8 text-[10px] font-black text-primary/40 leading-none">{stars}★</span>
                           <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <motion.div 
                               initial={{ width: 0 }}
                               whileInView={{ width: `${pct}%` }}
                               transition={{ duration: 1, ease: "easeOut" }}
                               className="h-full bg-accent"
                              />
                           </div>
                           <span className="w-8 text-[10px] font-bold text-primary/30 text-right">{pct}%</span>
                        </div>
                       );
                    })}
                  </div>
                  
                  <div className="pt-6">
                     <p className="text-[10px] font-bold text-primary/50 italic mb-4">Bạn có cảm nghĩ gì về sản phẩm này?</p>
                     <button 
                       onClick={() => setShowReviewForm(!showReviewForm)}
                       className="w-full bg-primary text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all"
                     >
                        {showReviewForm ? "Đóng form" : "Viết đánh giá ngay"}
                     </button>
                  </div>

                  {showReviewForm && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="pt-10 overflow-hidden"
                    >
                      <form onSubmit={handleSubmitReview} className="space-y-6 bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100">
                         <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-2">Đánh giá của bạn</p>
                            <div className="flex gap-2">
                               {[1,2,3,4,5].map(star => (
                                 <button key={star} type="button" onClick={() => setRating(star)}>
                                   <Star className={`w-6 h-6 ${star <= rating ? 'fill-accent text-accent' : 'text-gray-300'}`} />
                                 </button>
                               ))}
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-2">Nội dung nhận xét</label>
                            <textarea
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              rows={4}
                              className="w-full bg-white border-none rounded-2xl py-5 px-6 font-medium text-sm outline-none focus:ring-2 focus:ring-accent"
                              placeholder="Hãy chia sẻ trải nghiệm của bạn về sản phẩm..."
                              required
                            />
                         </div>
                         <button 
                           type="submit"
                           disabled={createReviewMutation.isPending}
                           className="btn-primary w-full py-5 text-[10px]"
                         >
                           {createReviewMutation.isPending ? "ĐANG GỬI..." : "GỬI ĐÁNH GIÁ CỦA BẠN"}
                         </button>
                      </form>
                    </motion.div>
                  )}
               </div>

               {/* Review Filters & List - 8 cols */}
               <div className="lg:col-span-8 space-y-10">
                  <div className="flex flex-wrap gap-2">
                     {["Tất cả", "Có hình ảnh", "5 sao", "4 sao", "Khác"].map(filter => (
                         <button
                           key={filter}
                           onClick={() => setReviewFilter(filter)}
                           className={`px-5 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${reviewFilter === filter ? 'border-primary bg-primary text-white' : 'border-gray-100 hover:border-gray-200 text-primary/50'}`}
                         >
                           {filter}
                         </button>
                     ))}
                  </div>

                  <div className="space-y-12">
                     {(reviewsData?.data?.length > 0) ? (
                       reviewsData.data.map((review: any) => (
                         <div key={review.id} className="group space-y-4 pb-8 border-b border-gray-50 last:border-0">
                            <div className="flex gap-4">
                               <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-black text-primary text-xs uppercase shadow-sm shrink-0">
                                 {(review.user?.fullName || review.authorDisplay || "K")[0]}
                               </div>
                               <div className="flex-1 space-y-2">
                                  <div className="flex items-center justify-between flex-wrap gap-2">
                                     <div className="space-y-0.5">
                                        <p className="text-xs font-black uppercase text-primary">{review.user?.fullName || review.authorDisplay || "Khách hàng"}</p>
                                        <div className="flex gap-0.5">
                                          {[1,2,3,4,5].map(i => <Star key={i} className={`w-2.5 h-2.5 ${i <= review.rating ? 'fill-accent text-accent' : 'text-gray-200'}`} />)}
                                        </div>
                                        {review.title && <p className="text-xs font-bold text-primary/70 italic mt-0.5">{review.title}</p>}
                                     </div>
                                     <span className="text-[10px] font-bold text-primary/20 italic">
                                       {review.reviewDate ? new Date(review.reviewDate).toLocaleDateString('vi-VN') : ""}
                                     </span>
                                  </div>
                                  {review.content && <p className="text-sm text-primary/70 font-medium leading-relaxed italic pr-4">&ldquo;{review.content}&rdquo;</p>}
                                  {review.images?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                      {review.images.map((img: any) => (
                                        <div key={img.id} className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden cursor-zoom-in">
                                          <img src={getImageUrl(img.imageUrl)} className="w-full h-full object-cover" alt="" />
                                        </div>
                                      ))}
                                    </div>
                                  )}
                               </div>
                            </div>
                         </div>
                       ))
                     ) : (
                       <div className="h-64 flex flex-col items-center justify-center text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                         <MessageSquare className="w-12 h-12 text-gray-200 mb-4" />
                         <p className="text-[10px] font-black uppercase tracking-widest text-primary/30">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                       </div>
                     )}
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Cross-selling Section */}
        <section className="space-y-12">
           <div className="flex items-end justify-between">
              <h2 className="text-3xl font-black text-primary uppercase tracking-tighter">Sản phẩm <span className="text-accent italic font-serif">Tương tự</span></h2>
              <div className="flex items-center gap-4">
                 <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-primary/40 hover:border-primary hover:text-primary transition-all"><ChevronLeft className="w-5 h-5" /></button>
                 <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-primary/40 hover:border-primary hover:text-primary transition-all"><ChevronRight className="w-5 h-5" /></button>
              </div>
           </div>
           
           {/* Horizontal Scroll Snap */}
           <div className="flex gap-8 overflow-x-auto pb-8 snap-x no-scrollbar">
              {relatedProducts?.map((p: any, idx: number) => (
                <div key={p.id} className="min-w-[280px] md:min-w-[320px] snap-start">
                  <ProductCard product={p} index={idx} />
                </div>
              ))}
              {/* If no related, show skeletons or empty */}
              {(!relatedProducts || relatedProducts.length === 0) && (
                <div className="w-full h-80 bg-gray-50 rounded-[3rem] flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-primary/20">Đang tìm sản phẩm tương tự...</div>
              )}
           </div>
        </section>
      </div>

      <Footer />

      {/* ── IMAGE LIGHTBOX (Next/Prev) ── */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 overflow-hidden"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close button */}
            <button 
              className="absolute top-8 right-8 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all z-10"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Buttons */}
            {galleryImages.length > 1 && (
              <>
                <button 
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all z-10 active:scale-95"
                  onClick={(e) => { e.stopPropagation(); prevImg(); }}
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button 
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all z-10 active:scale-95"
                  onClick={(e) => { e.stopPropagation(); nextImg(); }}
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Main Image View */}
            <div 
              className="relative w-full max-w-5xl h-full flex flex-col items-center justify-center gap-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative flex-1 w-full flex items-center justify-center p-4">
                 <AnimatePresence mode="wait">
                    <motion.img
                      key={lightboxIdx}
                      initial={{ opacity: 0, scale: 0.9, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9, x: -20 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      src={galleryImages[lightboxIdx]}
                      alt=""
                      className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                    />
                 </AnimatePresence>
              </div>

              {/* Lightbox Thumbnails */}
              <div className="flex gap-4 pb-4 overflow-x-auto max-w-full">
                {galleryImages.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setLightboxIdx(i)}
                    className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${i === lightboxIdx ? 'border-accent ring-4 ring-accent/20 scale-110' : 'border-white/10 opacity-40 hover:opacity-100 hover:border-white/30'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>

              {/* Counter */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">
                 {lightboxIdx + 1} / {galleryImages.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
}
