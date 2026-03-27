"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Banner from "@/components/Banner";
import ProductCard, { Product } from "@/components/ProductCard";
import OrderModal from "@/components/OrderModal";
import ToastNotification from "@/components/ToastNotification";
import StatusBar from "@/components/StatusBar";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const [results, setResults] = useState<Product[]>([]);
  const [resultCount, setResultCount] = useState(0);
  
  const [toast, setToast] = useState({ message: "", type: "success" as "success" | "error", visible: false });
  
  // Checkout tracking
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const performSearch = useCallback(async (query: string, category: string | null) => {
    try {
      const qParam = query.trim() ? encodeURIComponent(query.trim()) : "";
      
      let url = `/api/search`;
      if (qParam) url += `?q=${qParam}`;
      if (!qParam) url += `?q=*`; 
      
      const response = await fetch(url);
      const data = await response.json();
      
      let finalResults = data.results || [];
      if (category) {
        finalResults = finalResults.filter((p: Product) => p.category === category);
      }

      setResults(finalResults);
      setResultCount(finalResults.length);
    } catch (error) {
      console.error('Search failed:', error);
    }
  }, []);

  useEffect(() => {
    performSearch("", null);
  }, [performSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery, activeCategory);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, activeCategory, performSearch]);



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
        showToast('Checkout Success! Your premium tech is on the way.', 'success');
        setSelectedProduct(null); 
        setTimeout(() => performSearch(searchQuery, activeCategory), 1000); 
      } else {
        const err = await response.json();
        showToast('Order Error: ' + (err.error || 'Failed to process checkout'), 'error');
      }
    } catch (error) {
      showToast('Network error during checkout', 'error');
    } finally {
      setIsProcessingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-inter flex flex-col relative selection:bg-brand-primary/20">
      
      <ToastNotification {...toast} />
      <StatusBar />
      
      {/* Global Navbar */}
      <Navbar onSearch={setSearchQuery} />

      {/* Main E-commerce Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 relative">
        
        <Banner />

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Sidebar Layout */}
          <Sidebar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

          {/* Right Content Area */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-outfit font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                {activeCategory ? `${activeCategory} Products` : "Trending Products"}
                <span className="bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                  {resultCount} Results
                </span>
              </h2>
              
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 font-medium">
                Sort by: <span className="text-slate-900 font-bold cursor-pointer hover:text-brand-primary transition-colors">Featured</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {results.length === 0 ? (
                <div className="col-span-full h-64 flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
                  <p className="text-xl font-bold text-slate-900">No products match your criteria.</p>
                  <p className="text-sm mt-2 text-slate-500 font-medium">Try adjusting your filters or search for another term.</p>
                </div>
              ) : (
                results.map((p) => (
                  <ProductCard 
                    key={p.id} 
                    product={p} 
                    onBuy={setSelectedProduct} 
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Checkout Modal */}
      {selectedProduct && (
        <OrderModal 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onConfirm={handleConfirmOrder}
          isProcessing={isProcessingOrder}
        />
      )}
    </div>
  );
}
