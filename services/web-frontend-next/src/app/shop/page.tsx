"use client";

import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShoppingBag, Search, X, ChevronLeft, ChevronRight, SlidersHorizontal, ChevronDown, Check, Loader2 } from "lucide-react";
import { useState, useMemo, useEffect, useCallback, useTransition, useRef } from "react";
import ProductCard, { Product } from "@/components/ProductCard";
import ProductSkeleton from "@/components/ProductSkeleton";
import FilterSidebar from "@/components/FilterSidebar";
import { useRouter, useSearchParams } from "next/navigation";
import ToastNotification from "@/components/ToastNotification";
import OrderModal from "@/components/OrderModal";

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // --- Filter States (Local) ---
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get("category"));
  const [minPrice, setMinPrice] = useState<number>(Number(searchParams.get("minPrice")) || 0);
  const [maxPrice, setMaxPrice] = useState<number>(Number(searchParams.get("maxPrice")) || 10000000);
  const [status, setStatus] = useState<string | null>(searchParams.get("status"));
  const [sortBy, setSortBy] = useState<string>(searchParams.get("sort") || "newest");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  
  // Order & Toast State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" as "success" | "error", visible: false });

  const sortRef = useRef<HTMLDivElement>(null);
  const limit = 12;

  const SORT_OPTIONS = [
    { value: "newest", label: "Mới nhất" },
    { value: "price-low", label: "Giá: Thấp → Cao" },
    { value: "price-high", label: "Giá: Cao → Thấp" },
  ];
  const currentSort = SORT_OPTIONS.find(o => o.value === sortBy) || SORT_OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedCategory) params.set("category", selectedCategory);
    if (minPrice > 0) params.set("minPrice", minPrice.toString());
    if (maxPrice < 10000000) params.set("maxPrice", maxPrice.toString());
    if (status) params.set("status", status);
    if (sortBy !== "newest") params.set("sort", sortBy);
    if (page > 1) params.set("page", page.toString());

    const queryString = params.toString();
    router.replace(`/shop${queryString ? `?${queryString}` : ""}`, { scroll: false });
  }, [searchTerm, selectedCategory, minPrice, maxPrice, status, sortBy, page, router]);

  useEffect(() => {
    updateUrlParams();
  }, [updateUrlParams]);

  // --- Data Fetching ---
  const { data: categoriesData = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
       const res = await fetch('/api/categories'); // Assuming this exists or returns []
       if (!res.ok) return [];
       return res.json();
    },
  });

  const categories = categoriesData;

  const { data: productsData, isLoading, isError } = useQuery({
    queryKey: ["products", searchTerm, selectedCategory, minPrice, maxPrice, sortBy, page],
    queryFn: async () => {
      const q = searchTerm || "*";
      const cat = selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : "";
      const minP = `&minPrice=${minPrice}`;
      const maxP = `&maxPrice=${maxPrice}`;
      const sort = `&sort=${sortBy}`;
      const p = `&page=${page}&limit=${limit}`;
      
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}${cat}${minP}${maxP}${sort}${p}`);
      if (!res.ok) throw new Error('Search failed');
      return res.json();
    },
    placeholderData: (previousData) => previousData,
  });

  const products = productsData?.results || [];
  const totalItems = productsData?.total || 0;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

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

  const handleClearAll = () => {
    startTransition(() => {
      setSearchTerm("");
      setSelectedCategory(null);
      setMinPrice(0);
      setMaxPrice(10000000);
      setStatus(null);
      setSortBy("newest");
      setPage(1);
      setIsMobileFilterOpen(false);
    });
  };

  return (
    <main className="min-h-screen bg-gray-50/50">
      <ToastNotification {...toast} />
      <Navbar onSearch={setSearchTerm} results={products} isLoading={isLoading} />

      <div className="max-w-7xl mx-auto px-6 pt-40 pb-20">
        <div className="flex flex-col lg:flex-row gap-16">

          <aside className="hidden lg:block w-72 shrink-0 sticky top-32 h-fit max-h-[calc(100vh-160px)] overflow-y-auto pr-4 custom-scrollbar">
            <FilterSidebar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              status={status}
              setStatus={setStatus}
              categories={categories}
              productCount={totalItems}
              handleClearAll={handleClearAll}
              setPage={setPage}
            />
          </aside>

          <div className="flex-1 space-y-12">
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent italic font-serif">
                  <ShoppingBag className="w-4 h-4" /> EcoMarket Premium
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-primary tracking-tighter uppercase leading-[1.1]">
                  <span className="block">Bộ sưu tập</span>
                  <span className="text-accent/70 italic block ml-10 md:ml-15 lowercase font-serif font-medium">
                    Bền vững
                  </span>
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <div ref={sortRef} className="relative z-[200]">
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className={`flex items-center gap-3 pl-5 pr-4 py-3.5 bg-white border rounded-2xl shadow-sm transition-all text-sm font-bold ${isSortOpen ? 'border-accent text-accent shadow-accent/10' : 'border-gray-200 text-primary hover:border-accent/40'}`}
                  >
                    <span className="hidden sm:inline">{currentSort.label}</span>
                    <span className="sm:hidden">Sắp xếp</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSortOpen ? 'rotate-180 text-accent' : 'text-primary/40'}`} />
                  </button>
                  <AnimatePresence>
                    {isSortOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[200] py-1"
                      >
                        {SORT_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => { setSortBy(option.value); setIsSortOpen(false); setPage(1); }}
                            className={`w-full flex items-center justify-between px-5 py-3.5 text-sm font-bold transition-colors ${sortBy === option.value ? 'bg-accent/5 text-accent' : 'text-primary hover:bg-gray-50'}`}
                          >
                            <span>{option.label}</span>
                            {sortBy === option.value && <Check className="w-4 h-4" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-3.5 bg-primary text-white rounded-2xl shadow-lg transition-all text-sm font-bold"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="sm:hidden">Lọc</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <AnimatePresence>
                {isPending && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 rounded-3xl flex items-start justify-center pt-20"
                  >
                    <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-xl border border-gray-100">
                      <Loader2 className="w-4 h-4 text-accent animate-spin" />
                      <span className="text-sm font-bold text-primary/70">Đang lọc...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[600px]">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)
                ) : products.length === 0 ? (
                  <div className="col-span-full border border-gray-100 p-24 flex flex-col items-center justify-center text-center space-y-8 bg-white rounded-[3rem]">
                    <Search className="w-16 h-16 text-primary/10" />
                    <h3 className="text-3xl font-black uppercase text-primary">Không tìm thấy sản phẩm</h3>
                    <button onClick={handleClearAll} className="btn-primary px-10 py-5">Xóa bộ lọc</button>
                  </div>
                ) : (
                  products.map((product: Product, idx: number) => (
                    <ProductCard key={product.id} product={product} onBuy={setSelectedProduct} index={idx} />
                  ))
                )}
              </div>

              {!isLoading && products.length > 0 && (
                <div className="mt-20 pt-10 border-t border-gray-100 flex items-center justify-between">
                  <p className="hidden md:block text-xs font-bold uppercase tracking-widest text-primary/60">
                    Trang {page} / {totalPages} &bull; {totalItems} sản phẩm
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      disabled={!hasPrev}
                      onClick={() => setPage(prev => prev - 1)}
                      className="w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 disabled:opacity-20 transition-all shadow-sm"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-[10px] font-black uppercase bg-primary text-white w-12 h-12 flex items-center justify-center rounded-2xl shadow-xl">{page}</span>
                    <button
                      disabled={!hasNext}
                      onClick={() => setPage(prev => prev + 1)}
                      className="w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 disabled:opacity-20 transition-all shadow-sm"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[100] bg-primary/40 backdrop-blur-md flex justify-end">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            className="w-full max-w-sm bg-white h-full p-10 overflow-y-auto"
          >
             <div className="flex items-center justify-between mb-12">
                <h2 className="text-2xl font-black uppercase tracking-tighter text-primary italic font-serif">Bộ lọc</h2>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-4 hover:bg-gray-50 rounded-2xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <FilterSidebar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                status={status}
                setStatus={setStatus}
                categories={categories}
                productCount={totalItems}
                handleClearAll={handleClearAll}
                setPage={setPage}
              />
          </motion.div>
        </div>
      )}

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
    </main>
  );
}
