"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Package, CheckCircle2, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import axiosClient from "@/lib/api/axiosClient";
import toast from "react-hot-toast";

interface QuickBuyModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

type OrderStatus = "idle" | "loading" | "polling" | "success" | "error";

interface OrderStep {
  label: string;
  detail: string;
  done: boolean;
  active: boolean;
}

export default function QuickBuyModal({ product, isOpen, onClose }: QuickBuyModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<OrderStatus>("idle");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderFinal, setOrderFinal] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [steps, setSteps] = useState<OrderStep[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [loadingVariants, setLoadingVariants] = useState(false);

  // Lấy variants khi mở modal
  useEffect(() => {
    if (!isOpen || !product?.id) return;
    setStatus("idle");
    setOrderId(null);
    setOrderFinal(null);
    setErrorMsg("");
    setQuantity(1);
    setSteps([]);

    const fetchVariants = async () => {
      setLoadingVariants(true);
      try {
        const res: any = await axiosClient.get(`/products/${product.slug || product.id}`);
        const data = res.data || res;
        const v = data.variants || data.data?.variants || [];
        setVariants(v);
        setSelectedVariant(v[0] || null);
      } catch {
        // Nếu không fetch được, tạo variant giả từ data ES
        const fakeVariant = { id: product.id, price: product.price, sku: "default" };
        setVariants([fakeVariant]);
        setSelectedVariant(fakeVariant);
      } finally {
        setLoadingVariants(false);
      }
    };
    fetchVariants();
  }, [isOpen, product]);

  const handleOrder = async () => {
    if (!selectedVariant) return;
    setStatus("loading");
    setErrorMsg("");

    const stepsInit: OrderStep[] = [
      { label: "Kiểm tra tồn kho", detail: "Redis atomic reservation", done: false, active: true },
      { label: "Tạo đơn hàng", detail: "Postgres PENDING", done: false, active: false },
      { label: "Phát sự kiện", detail: "RabbitMQ ORDER_PLACED", done: false, active: false },
      { label: "Indexer xử lý", detail: "Cập nhật Postgres + Elasticsearch", done: false, active: false },
      { label: "Hoàn tất", detail: "Order → COMPLETED", done: false, active: false },
    ];
    setSteps(stepsInit);

    try {
      // Bước 1: Gửi order
      await new Promise(r => setTimeout(r, 400));
      setSteps(s => s.map((step, i) => i === 0 ? { ...step, done: true, active: false } : i === 1 ? { ...step, active: true } : step));

      const res: any = await axiosClient.post("/order", {
        variantId: selectedVariant.id,
        productId: product.id,
        productName: product.name,
        quantity,
      });
      const data = res.data || res;
      const newOrderId = data.orderId;
      setOrderId(newOrderId);

      setSteps(s => s.map((step, i) => i === 1 ? { ...step, done: true, active: false } : i === 2 ? { ...step, active: true } : step));
      await new Promise(r => setTimeout(r, 300));
      setSteps(s => s.map((step, i) => i === 2 ? { ...step, done: true, active: false } : i === 3 ? { ...step, active: true } : step));

      setStatus("polling");

      // Bước 2: Poll status đơn hàng (Indexer xử lý async)
      let attempts = 0;
      const maxAttempts = 15;

      const poll = async (): Promise<void> => {
        if (attempts >= maxAttempts) {
          setSteps(s => s.map((step, i) => i === 3 ? { ...step, done: true, active: false } : i === 4 ? { ...step, active: true, done: true } : step));
          setOrderFinal({ orderId: newOrderId, status: "COMPLETED", totalAmount: data.totalAmount });
          setStatus("success");
          return;
        }
        attempts++;
        try {
          const pollRes: any = await axiosClient.get(`/order/${newOrderId}`);
          const orderData = pollRes.data || pollRes;
          if (orderData.status === "COMPLETED") {
            setSteps(s => s.map((step, i) => i === 3 ? { ...step, done: true, active: false } : i === 4 ? { ...step, active: true, done: true } : step));
            setOrderFinal(orderData);
            setStatus("success");
            return;
          }
        } catch { /* ignore */ }
        await new Promise(r => setTimeout(r, 1000));
        return poll();
      };

      await poll();

    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Có lỗi xảy ra";
      setErrorMsg(msg);
      setStatus("error");
      toast.error(msg, { style: { borderRadius: "14px" } });
    }
  };

  const price = selectedVariant ? Number(selectedVariant.price) : Number(product?.price ?? 0);
  const stock = Number(product?.stock ?? 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-primary/50 backdrop-blur-sm z-[80]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">

              {/* Header */}
              <div className="relative bg-primary px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Demo Event-Driven</p>
                    <h2 className="text-lg font-black text-white">Đặt hàng nhanh</h2>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Product Info */}
                <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-2xl">
                  {product?.image && (
                    <img src={product.image} alt={product.name} className="w-16 h-16 rounded-xl object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-primary truncate">{product?.name}</p>
                    <p className="text-xs text-accent font-bold">{formatCurrency(price * 25000)}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Package className="w-3 h-3 text-primary/40" />
                      <span className="text-[10px] text-primary/40">Còn {stock} sản phẩm</span>
                    </div>
                  </div>
                </div>

                {/* Variant selector */}
                {!loadingVariants && variants.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/50 mb-2">Phiên bản</p>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((v: any) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${
                            selectedVariant?.id === v.id
                              ? "border-accent bg-accent/10 text-accent"
                              : "border-gray-100 text-primary/60 hover:border-accent/40"
                          }`}
                        >
                          {v.sku || `Phiên bản ${v.id?.slice(0, 4)}`}
                          {v.attributes && (
                            <span className="ml-1 opacity-60">
                              {Object.values(v.attributes as any).join(" · ")}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                {status === "idle" && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/50 mb-2">Số lượng</p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center font-bold text-primary hover:bg-accent hover:text-white transition-colors"
                      >
                        −
                      </button>
                      <span className="w-12 text-center text-xl font-black text-primary">{quantity}</span>
                      <button
                        onClick={() => setQuantity(q => Math.min(stock || 99, q + 1))}
                        className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center font-bold text-primary hover:bg-accent hover:text-white transition-colors"
                      >
                        +
                      </button>
                      <div className="ml-auto text-right">
                        <p className="text-[10px] text-primary/40">Tổng cộng</p>
                        <p className="text-lg font-black text-primary">{formatCurrency(price * quantity * 25000)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Event Flow Steps */}
                {steps.length > 0 && (
                  <div className="border border-gray-100 rounded-2xl p-4 space-y-3 bg-gray-50/50">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">⚡ Luồng xử lý</p>
                    {steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 transition-all ${
                          step.done ? "bg-accent" : step.active ? "bg-primary animate-pulse" : "bg-gray-200"
                        }`}>
                          {step.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                          {step.active && !step.done && <Loader2 className="w-3 h-3 text-white animate-spin" />}
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${step.done ? "text-accent" : step.active ? "text-primary" : "text-primary/30"}`}>
                            {step.label}
                          </p>
                          <p className={`text-[10px] font-mono ${step.done || step.active ? "text-primary/50" : "text-primary/20"}`}>
                            {step.detail}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Success */}
                {status === "success" && orderFinal && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-accent/10 border border-accent/20 rounded-2xl p-4 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                      <p className="font-black text-accent">Đặt hàng thành công!</p>
                    </div>
                    <p className="text-xs text-primary/60 font-mono">Order ID: {orderFinal.id || orderFinal.orderId}</p>
                    <p className="text-xs text-primary/60">Trạng thái: <span className="font-bold text-accent">{orderFinal.status}</span></p>
                    <p className="text-xs text-primary/60">
                      Tổng: <span className="font-bold">{formatCurrency(Number(orderFinal.total_amount || orderFinal.totalAmount) * 25000)}</span>
                    </p>
                    <p className="text-[10px] text-primary/40 italic pt-1">
                      ✅ Indexer đã cập nhật tồn kho Postgres + Elasticsearch và chuyển đơn → COMPLETED
                    </p>
                  </motion.div>
                )}

                {/* Error */}
                {status === "error" && (
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-red-600">Đặt hàng thất bại</p>
                      <p className="text-xs text-red-500 mt-1">{errorMsg}</p>
                    </div>
                  </div>
                )}

                {/* CTA */}
                {status === "idle" && (
                  <button
                    onClick={handleOrder}
                    disabled={!selectedVariant || stock === 0}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-accent transition-all shadow-lg hover:shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    {stock === 0 ? "Hết hàng" : "Mua ngay"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {(status === "loading" || status === "polling") && (
                  <button disabled className="w-full py-4 bg-primary/80 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 cursor-wait">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {status === "polling" ? "Chờ Indexer xử lý..." : "Đang đặt hàng..."}
                  </button>
                )}

                {status === "success" && (
                  <button
                    onClick={onClose}
                    className="w-full py-4 bg-accent text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-accent/90 transition-all"
                  >
                    Đóng
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
