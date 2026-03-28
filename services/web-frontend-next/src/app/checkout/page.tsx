"use client";

import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, CreditCard, ArrowLeft, ArrowRight, MapPin, Truck, Tag, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";
import { orderService } from "@/services/orderService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addressService } from "@/services/addressService";
import { shippingService } from "@/services/shippingService";
import { promotionService } from "@/services/promotionService";

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const totalPrice = getTotalPrice();
  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<number | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // Fetch Data
  const { data: addresses = [] } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressService.getUserAddresses(),
    enabled: !!user,
  });

  const { data: shippingMethods = [] } = useQuery({
    queryKey: ["shipping-methods"],
    queryFn: () => shippingService.getShippingMethods(),
  });

  const checkPromoMutation = useMutation({
    mutationFn: (code: string) => promotionService.checkPromotion(code),
    onSuccess: (data) => {
      setAppliedPromo(data);
      if (data.discountType === "fixed") {
        setDiscount(data.discountValue);
      } else {
        setDiscount((totalPrice * data.discountValue) / 100);
      }
      toast.success("Áp dụng mã giảm giá thành công!");
    },
    onError: () => {
      toast.error("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
    }
  });

  const shippingFee = useMemo(() => {
    const method = shippingMethods.find((m: any) => m.id === selectedShippingMethodId);
    return method ? parseFloat(method.baseFee) : 0;
  }, [selectedShippingMethodId, shippingMethods]);

  const finalTotal = Math.max(0, totalPrice + shippingFee - discount);

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items, router]);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a: any) => a.isDefault);
      setSelectedAddressId(defaultAddr?.id || addresses[0].id);
    }
  }, [addresses]);

  useEffect(() => {
    if (shippingMethods.length > 0 && !selectedShippingMethodId) {
      setSelectedShippingMethodId(shippingMethods[0].id);
    }
  }, [shippingMethods]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Vui lòng đăng nhập để tiến hành đặt hàng.");
      router.push("/login?redirect=/checkout");
      return;
    }

    if (!selectedAddressId) {
      toast.error("Vui lòng chọn địa chỉ giao hàng.");
      return;
    }

    const orderData = {
      items: items.map(item => ({
        productId: item.id,
        variantId: item.variantId || null,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity
      })),
      totalAmount: finalTotal,
      paymentMethod: paymentMethod,
      shippingMethodId: selectedShippingMethodId,
      shippingFee: shippingFee,
      addressId: selectedAddressId,
      promotionId: appliedPromo?.id || null,
      discountAmount: discount
    };

    toast.promise(
      orderService.createOrder(orderData),
      {
        loading: "Đang xử lý đơn hàng...",
        success: "Đặt hàng thành công! Cảm ơn bạn.",
        error: "Có lỗi xảy ra khi đặt hàng."
      }
    ).then(() => {
      clearCart();
      router.push("/checkout/success");
    }).catch(console.error);
  };

  return (
    <main className="min-h-screen bg-gray-50/50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-40 pb-20">
        <h1 className="text-6xl font-black text-primary tracking-tighter uppercase mb-20 animate-slideUp">
          Thanh toán <br /> <span className="opacity-20 italic">Hoàn tất đơn hàng</span>
        </h1>

        <div className="grid lg:grid-cols-3 gap-16 items-start">
          <div className="lg:col-span-2 space-y-12 animate-slideUp">
            {/* Address Selection */}
            <div className="premium-card p-12 bg-white space-y-8">
               <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary"><MapPin className="w-6 h-6" /></div>
                     <h3 className="text-xl font-black uppercase tracking-tight">Địa chỉ giao hàng</h3>
                  </div>
                  <Link href="/profile/addresses" className="text-[10px] font-black uppercase tracking-widest text-accent hover:underline">Quản lý địa chỉ</Link>
               </div>

               <div className="grid md:grid-cols-2 gap-6">
                  {addresses.length > 0 ? (
                    addresses.map((addr: any) => (
                      <div 
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all relative ${selectedAddressId === addr.id ? 'border-accent bg-accent/5' : 'border-gray-50 hover:border-accent/20'}`}
                      >
                         <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">{addr.addressLine}</p>
                         <p className="text-xs font-medium text-muted-foreground italic">{addr.city}, {addr.country}</p>
                         {selectedAddressId === addr.id && <CheckCircle2 className="absolute top-6 right-6 w-5 h-5 text-accent" />}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 p-10 bg-secondary/30 rounded-[2rem] border border-dashed border-gray-200">
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6 text-center">Bạn chưa có địa chỉ giao hàng</p>
                       <div className="space-y-4 max-w-md mx-auto">
                          <input 
                             type="text" 
                             placeholder="ĐỊA CHỈ CHI TIẾT (SỐ NHÀ, ĐƯỜNG...)" 
                             id="quick-address"
                             className="w-full bg-white border-none rounded-xl py-4 px-6 text-[10px] font-black outline-none focus:ring-1 focus:ring-accent shadow-sm"
                          />
                          <input 
                             type="text" 
                             placeholder="THÀNH PHỐ" 
                             id="quick-city"
                             className="w-full bg-white border-none rounded-xl py-4 px-6 text-[10px] font-black outline-none focus:ring-1 focus:ring-accent shadow-sm"
                          />
                          <input 
                             type="text" 
                             placeholder="SỐ ĐIỆN THOẠI" 
                             id="quick-phone"
                             className="w-full bg-white border-none rounded-xl py-4 px-6 text-[10px] font-black outline-none focus:ring-1 focus:ring-accent shadow-sm"
                          />
                          <button 
                            onClick={async () => {
                              const addressLine = (document.getElementById('quick-address') as HTMLInputElement).value;
                              const city = (document.getElementById('quick-city') as HTMLInputElement).value;
                              const phone = (document.getElementById('quick-phone') as HTMLInputElement).value;
                              if(!addressLine || !city || !phone) return toast.error("Vui lòng nhập đầy đủ thông tin");
                              try {
                                const newAddr = await addressService.createAddress({ addressLine, city, phone, country: "Việt Nam", isDefault: true });
                                toast.success("Thêm địa chỉ thành công!");
                                queryClient.invalidateQueries({ queryKey: ["addresses"] });
                                setSelectedAddressId((newAddr as any).id);
                              } catch (err) {
                                toast.error("Có lỗi khi lưu địa chỉ");
                              }
                            }}
                            className="w-full btn-primary py-4 text-[10px]"
                          >
                            LƯU & SỬ DỤNG ĐỊA CHỈ NÀY
                          </button>
                       </div>
                    </div>
                  )}
               </div>
            </div>

            {/* Shipping Method */}
            <div className="premium-card p-12 bg-white space-y-8">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary"><Truck className="w-6 h-6" /></div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Đơn vị vận chuyển</h3>
               </div>

               <div className="grid md:grid-cols-2 gap-6">
                  {shippingMethods.map((method: any) => (
                    <div 
                      key={method.id}
                      onClick={() => setSelectedShippingMethodId(method.id)}
                      className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center justify-between ${selectedShippingMethodId === method.id ? 'border-accent bg-accent/5' : 'border-gray-50 hover:border-accent/20'}`}
                    >
                      <div className="space-y-1">
                         <p className="text-[10px] font-black uppercase tracking-widest">{method.name}</p>
                         <p className="text-xs font-medium italic text-muted-foreground">{method.estimatedDays}</p>
                      </div>
                      <p className="font-black text-primary">{formatCurrency(method.baseFee)}</p>
                    </div>
                  ))}
               </div>
            </div>

            {/* Payment Method */}
            <div className="premium-card p-12 bg-white space-y-8">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary"><CreditCard className="w-6 h-6" /></div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Phương thức thanh toán</h3>
               </div>

               <div className="grid md:grid-cols-2 gap-6">
                  <button 
                    onClick={() => setPaymentMethod("cod")}
                    className={`p-8 rounded-[2rem] border-2 cursor-pointer transition-all text-left ${paymentMethod === "cod" ? "border-accent bg-accent/5" : "border-gray-50 hover:border-accent/20"}`}
                  >
                     <span className="text-sm font-black uppercase tracking-widest">Thanh toán (COD)</span>
                  </button>
                  <button 
                    disabled
                    className="p-8 rounded-[2rem] border-2 border-gray-50 opacity-50 grayscale text-left"
                  >
                     <span className="text-sm font-black uppercase tracking-widest">Online (Sắp ra mắt)</span>
                  </button>
               </div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="space-y-12 animate-slideUp delay-200">
            <div className="premium-card p-10 bg-white border border-gray-100 space-y-8">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Tóm tắt đơn hàng</h3>
               
               <div className="max-h-60 overflow-y-auto space-y-4 pr-2">
                  {items.map(item => (
                     <div key={item.id} className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-secondary rounded-2xl overflow-hidden shrink-0">
                           <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-[10px] font-black uppercase truncate">{item.name}</p>
                           <p className="text-xs font-medium italic text-muted-foreground">{item.quantity} x {formatCurrency(item.price)}</p>
                        </div>
                     </div>
                  ))}
               </div>

               {/* Promo Code */}
               <div className="pt-6 border-t border-gray-100">
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30" />
                    <input 
                      type="text" 
                      placeholder="MÃ GIẢM GIÁ..."
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="w-full bg-secondary/30 border-none rounded-xl py-4 pl-12 pr-24 focus:ring-1 focus:ring-accent font-black text-[10px] outline-none"
                    />
                    <button 
                      onClick={() => checkPromoMutation.mutate(promoCode)}
                      disabled={!promoCode || checkPromoMutation.isPending}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary text-white text-[10px] font-black rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
                    >
                      XÁC NHẬN
                    </button>
                  </div>
               </div>

               <div className="space-y-4 pt-6">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground italic">
                     <span>Tạm tính</span>
                     <span>{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground italic">
                     <span>Phí vận chuyển</span>
                     <span>{formatCurrency(shippingFee)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-accent italic">
                       <span>Giảm giá</span>
                       <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                     <span className="text-lg font-black uppercase tracking-tight text-primary">Tổng tiền</span>
                     <span className="text-3xl font-black text-primary tracking-tighter">{formatCurrency(finalTotal)}</span>
                  </div>
               </div>

               <button 
                  onClick={handlePlaceOrder}
                  className="w-full btn-primary py-6 flex items-center justify-center gap-4 text-sm group"
               >
                  Hoàn tất đặt hàng <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
               </button>
            </div>

            <div className="bg-emerald-50/50 p-8 rounded-[2rem] border border-emerald-100 flex items-center gap-6">
               <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg"><Lock className="w-6 h-6" /></div>
               <p className="text-[10px] font-black uppercase tracking-[0.1em] text-emerald-800 leading-relaxed italic">
                  Giao dịch an toàn 256-bit SSL. <br /> Bảo mật thông tin tuyệt đối.
               </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
