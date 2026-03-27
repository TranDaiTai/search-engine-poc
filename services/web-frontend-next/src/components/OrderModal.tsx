import { X } from "lucide-react";
import { Product } from "./ProductCard";

export default function OrderModal({
  product,
  onClose,
  onConfirm,
  isProcessing
}: {
  product: Product;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl overflow-hidden shadow-brand-primary/10">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h3 className="text-xl font-extrabold text-slate-900 tracking-wide">Checkout Confirmation</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors bg-slate-100 p-2 rounded-full hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex gap-4 items-center mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="w-16 h-16 bg-white border border-slate-100 flex items-center justify-center rounded-xl text-3xl shrink-0 shadow-sm">
               📦
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-lg line-clamp-1">{product.name}</h4>
              <p className="text-sm font-medium text-slate-500">Qty: 1</p>
            </div>
            <div className="ml-auto text-2xl font-black text-brand-primary">
              ${product.price}
            </div>
          </div>

          <div className="space-y-4 text-sm border-t border-slate-100 pt-6">
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Subtotal</span>
              <span className="text-slate-700">${product.price}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Shipping</span>
              <span className="text-emerald-600 font-bold">Free</span>
            </div>
            <div className="flex justify-between text-slate-900 font-black text-xl pt-4 border-t border-slate-100 mt-4">
              <span>Total</span>
              <span>${product.price}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 transition-colors shadow-sm cursor-pointer"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-brand-primary hover:bg-blue-700 hover:shadow-[0_10px_20px_rgba(37,99,235,0.3)] transition-all disabled:opacity-50 flex justify-center items-center cursor-pointer"
          >
            {isProcessing ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : "Place Order"}
          </button>
        </div>

      </div>
    </div>
  );
}
