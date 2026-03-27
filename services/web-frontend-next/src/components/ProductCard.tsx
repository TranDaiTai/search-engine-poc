import { ShoppingCart } from "lucide-react";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
};

export default function ProductCard({ 
  product, 
  onBuy
}: { 
  product: Product; 
  onBuy: (product: Product) => void;
}) {
  const isOutOfStock = product.stock <= 0;
  
  const getProductEmoji = (cat: string) => {
    const map: Record<string, string> = { 'Electronics': '💻', 'Accessories': '🎧', 'Gaming': '🎮', 'Toys': '🚗' };
    return map[cat] || '📦';
  };

  return (
    <div className="group bg-white border border-slate-200 relative rounded-[2rem] p-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:border-brand-primary/30 flex flex-col gap-4 overflow-hidden">
      
      {/* Product Image Area */}
      <div className="w-full aspect-square bg-slate-50 border border-slate-100 rounded-[1.5rem] flex items-center justify-center text-8xl relative overflow-hidden group-hover:bg-slate-100 transition-colors duration-500">
        <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <span className="group-hover:-rotate-3 group-hover:scale-110 transition-transform duration-500 ease-out z-10 drop-shadow-sm">
          {getProductEmoji(product.category)}
        </span>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
           <span className="bg-white/90 backdrop-blur-md text-slate-700 text-xs font-extrabold px-3 py-1.5 rounded-full border border-slate-200 uppercase tracking-widest shadow-sm">
             {product.category}
           </span>
        </div>
      </div>
      
      <div className="px-2 mt-2 space-y-1">
        <h3 className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-brand-primary transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="text-slate-500 text-sm line-clamp-2 h-10 leading-relaxed font-normal">
          {product.description || 'No description available for this premium tech item.'}
        </p>
      </div>
      
      <div className="px-2 flex items-end justify-between mt-auto pt-2">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Price</span>
          <div className="text-3xl font-black text-slate-900 leading-none">${product.price || '??'}</div>
        </div>
        
        <button 
          onClick={() => onBuy(product)}
          disabled={isOutOfStock}
          className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all shadow-md group ${
            isOutOfStock 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200' 
            : 'bg-brand-primary text-white hover:bg-blue-700 hover:scale-110 hover:shadow-brand-primary/40'
          }`}
          title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
        >
          <ShoppingCart className={`w-5 h-5 ${isOutOfStock ? '' : 'fill-current group-hover:animate-pulse'}`} />
        </button>
      </div>

      <div className={`px-2 text-[11px] font-extrabold tracking-widest uppercase mt-1 ${isOutOfStock ? 'text-rose-500' : 'text-emerald-500'}`}>
        {isOutOfStock ? 'OUT OF STOCK' : `IN STOCK (${product.stock})`}
      </div>
      
    </div>
  );
}
