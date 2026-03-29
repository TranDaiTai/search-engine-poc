"use client";

import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import GlobalSearch from "@/components/layout/GlobalSearch";
import Footer from "@/components/layout/Footer";
import { ShoppingBag, Search, X, ChevronLeft, ChevronRight, SlidersHorizontal, ChevronDown, Check, Loader2 } from "lucide-react";
import { Suspense, useState, useMemo, useEffect, useCallback, useTransition, useRef } from "react";
import ProductCard from "@/components/product/ProductCard";
import ProductSkeleton from "@/components/product/ProductSkeleton";
import FilterSidebar from "@/components/product/FilterSidebar";
import { useRouter, useSearchParams } from "next/navigation";

function ShopContent() {
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
  const sortRef = useRef<HTMLDivElement>(null);

  const limit = 12;

  const SORT_OPTIONS = [
    { value: "newest", label: "Mới nhất" },
    { value: "best-selling", label: "Bán chạy nhất" },
    { value: "price-low", label: "Giá: Thấp → Cao" },
    { value: "price-high", label: "Giá: Cao → Thấp" },
  ];
  const currentSort = SORT_OPTIONS.find(o => o.value === sortBy) || SORT_OPTIONS[0];

  // Close sort dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- URL Synchronization ---
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
    queryFn: () => productService.getCategories(),
  });

  const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData as any).data || [];

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (searchTerm) params.append("search", searchTerm);
    if (selectedCategory) params.append("category", selectedCategory);
    if (minPrice > 0) params.append("minPrice", minPrice.toString());
    if (maxPrice < 10000000) params.append("maxPrice", maxPrice.toString());
    if (sortBy) params.append("sort", sortBy);
    if (status === "on-sale") params.append("hasDiscount", "true");

    return params.toString();
  }, [page, searchTerm, selectedCategory, minPrice, maxPrice, sortBy, status]);

  const { data: productsData = [], isLoading, isError } = useQuery({
    queryKey: ["products", queryParams],
    queryFn: () => productService.getAllProducts(queryParams),
    staleTime: 5000,
  });

  const rawData: any = productsData;
  const products: any[] = rawData?.products ?? (Array.isArray(rawData) ? rawData : []);
  const pagination = rawData?.pagination || null;
  // API returns: { total, page, limit, pages }
  const totalPages = pagination?.pages ?? 1;
  const totalItems = pagination?.total ?? products.length;
  const hasNext = pagination ? page < totalPages : products.length >= limit;
  const hasPrev = page > 1;

  // --- Wrappers for state updates using useTransition ---
  const handleSetSearch = (val: string) => {
    startTransition(() => {
      setSearchTerm(val);
      setPage(1);
    });
  };

  const handleSetCategory = (val: string | null) => {
    startTransition(() => {
      setSelectedCategory(val);
      setPage(1);
    });
  };

  const handleSetMaxPrice = (val: number) => {
    startTransition(() => {
      setMaxPrice(val);
      setPage(1);
    });
  };

  const handleSetMinPrice = (val: number) => {
    startTransition(() => {
      setMinPrice(val);
      setPage(1);
    });
  };

  const handleSetStatus = (val: string | null) => {
    startTransition(() => {
      setStatus(val);
      setPage(1);
    });
  };

  const handleSetSort = (val: string) => {
    startTransition(() => {
      setSortBy(val);
      setPage(1);
    });
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
      <Navbar />
      <GlobalSearch />

      <div className="max-w-7xl mx-auto px-6 pt-40 pb-20">
        <div className="flex flex-col lg:flex-row gap-16">

          {/* Side Filter - Desktop (Sticky) */}
          <aside className="hidden lg:block w-72 shrink-0 sticky top-32 h-fit max-h-[calc(100vh-160px)] overflow-y-auto pr-4 custom-scrollbar">
            <FilterSidebar
              searchTerm={searchTerm}
              setSearchTerm={handleSetSearch}
              selectedCategory={selectedCategory}
              setSelectedCategory={handleSetCategory}
              minPrice={minPrice}
              setMinPrice={handleSetMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={handleSetMaxPrice}
              status={status}
              setStatus={handleSetStatus}
              categories={categories}
              productCount={products.length}
              handleClearAll={handleClearAll}
              setPage={setPage}
            />
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-12 min-h-[1200px]">

            {/* Header / Top Toolbar — relative z-10 so dropdown floats above product grid */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8 animate-slideUp">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#4F6F52] italic font-serif">
                  <ShoppingBag className="w-4 h-4" /> EcoMarket Premium
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-primary tracking-tighter uppercase leading-[1.1]">
                  <span className="block">Bộ sưu tập</span>
                  <span className="text-accent/70 italic block ml-10 md:ml-15">
                    Bền vững
                  </span>
                </h1>
              </div>

              <div className="flex items-center gap-3">
                {/* Custom Sort Dropdown */}
                <div ref={sortRef} className="relative z-[200]">
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className={`flex items-center gap-3 pl-5 pr-4 py-3.5 bg-white border rounded-2xl shadow-sm transition-all text-sm font-bold ${isSortOpen ? 'border-accent text-accent shadow-accent/10' : 'border-gray-200 text-primary hover:border-accent/40'
                      }`}
                  >
                    <span className="text-accent">&#9650;&#9660;</span>
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
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-primary/10 z-[200] py-1"
                      >
                        {SORT_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => { handleSetSort(option.value); setIsSortOpen(false); }}
                            className={`w-full flex items-center justify-between px-5 py-3.5 text-sm font-bold transition-colors first:rounded-t-2xl last:rounded-b-2xl ${sortBy === option.value
                                ? 'bg-accent/5 text-accent'
                                : 'text-primary hover:bg-gray-50'
                              }`}
                          >
                            <span>{option.label}</span>
                            {sortBy === option.value && <Check className="w-4 h-4 flex-shrink-0" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-3.5 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:bg-accent hover:shadow-accent/20 active:scale-95 transition-all text-sm font-bold"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="sm:hidden">Lọc</span>
                </button>
              </div>
            </div>

            {/* Product Grid */}
            <div className="relative">
              {/* Smooth loading overlay—no layout jump */}
              <AnimatePresence>
                {isPending && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 rounded-3xl flex items-start justify-center pt-20"
                  >
                    <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-xl shadow-primary/10 border border-gray-100">
                      <Loader2 className="w-4 h-4 text-accent animate-spin" />
                      <span className="text-sm font-bold text-primary/70">Đang lọc...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[600px]">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)
                ) : isError ? (
                  <div className="col-span-full premium-card p-20 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                      <X className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black uppercase text-primary">Không có dữ liệu </h3>
                    <button onClick={() => window.location.reload()} className="btn-primary px-8 py-4">Thử lại</button>
                  </div>
                ) : products.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="col-span-full premium-card p-24 flex flex-col items-center justify-center text-center space-y-8 bg-white border border-gray-100"
                  >
                    <div className="w-32 h-32 bg-secondary rounded-full flex items-center justify-center text-primary/10">
                      <Search className="w-16 h-16" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-3xl font-black uppercase text-primary tracking-tighter">Không tìm thấy sản phẩm</h3>
                      <p className="text-sm text-muted-foreground italic font-medium">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
                    </div>
                    <button onClick={handleClearAll} className="btn-primary px-10 py-5">Xóa bộ lọc</button>
                  </motion.div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {products.map((product: any, idx: number) => (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                      >
                        <ProductCard product={product} index={idx} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Pagination */}
              {!isLoading && products.length > 0 && (
                <div className="mt-20 pt-10 border-t border-gray-100 flex items-center justify-between">
                  <p className="hidden md:block text-xs font-bold uppercase tracking-widest text-primary/60">
                    Trang {page} / {totalPages} &bull; {totalItems} sản phẩm
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      disabled={!hasPrev}
                      onClick={() => setPage(page - 1)}
                      className="w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-100 bg-white hover:bg-secondary disabled:opacity-20 transition-all shadow-sm"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-[10px] font-black uppercase bg-primary text-white w-12 h-12 flex items-center justify-center rounded-2xl shadow-xl shadow-primary/20">{page}</span>
                    <button
                      disabled={!hasNext}
                      onClick={() => setPage(page + 1)}
                      className="w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-100 bg-white hover:bg-secondary disabled:opacity-20 transition-all shadow-sm"
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

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-primary/40 backdrop-blur-md z-[60]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-sm bg-white z-[70] shadow-2xl p-10 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-2xl font-black uppercase tracking-tighter text-primary italic">Bộ lọc</h2>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-4 hover:bg-secondary rounded-2xl transition-colors">
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
                productCount={products.length}
                handleClearAll={handleClearAll}
                setPage={setPage}
              />
              <div className="mt-12">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full btn-primary py-6"
                >
                  XEM KẾT QUẢ
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50/50 flex items-center justify-center"><Loader2 className="w-8 h-8 text-accent animate-spin" /></div>}>
      <ShopContent />
    </Suspense>
  );
}
