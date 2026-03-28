"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { User, Package, Settings, LogOut, ShieldCheck, Mail, MapPin, Phone, Hash } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState } from "react";
import { orderService } from "@/services/orderService";
import { userService } from "@/services/userService";
import { addressService } from "@/services/addressService";
import { formatCurrency } from "@/lib/utils";

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "addresses">("profile");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressFormData, setAddressFormData] = useState({
    addressLine: "",
    city: "",
    phone: "",
    country: "Việt Nam",
    isDefault: false
  });

  const [formData, setFormData] = useState({
    fullName: user?.full_name || user?.fullName || "",
    phone: user?.phone || "",
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["userOrders"],
    queryFn: () => orderService.getUserOrders(),
    enabled: !!user,
  });

  const { data: addresses = [], isLoading: addressesLoading } = useQuery({
    queryKey: ["userAddresses"],
    queryFn: () => addressService.getUserAddresses(),
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: typeof formData) => userService.updateUser(user.id, data),
    onSuccess: () => {
      toast.success("Cập nhật thông tin thành công!");
      queryClient.invalidateQueries({ queryKey: ["user"] });
      window.location.reload();
    },
    onError: () => toast.error("Có lỗi xảy ra khi cập nhật."),
  });

  const addAddressMutation = useMutation({
    mutationFn: (data: typeof addressFormData) => addressService.createAddress(data),
    onSuccess: () => {
      toast.success("Thêm địa chỉ thành công!");
      queryClient.invalidateQueries({ queryKey: ["userAddresses"] });
      setShowAddressForm(false);
      setAddressFormData({ addressLine: "", city: "", phone: "", country: "Việt Nam", isDefault: false });
    },
    onError: () => toast.error("Không thể thêm địa chỉ."),
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id: number) => addressService.deleteAddress(id),
    onSuccess: () => {
      toast.success("Đã xóa địa chỉ.");
      queryClient.invalidateQueries({ queryKey: ["userAddresses"] });
    },
  });

  if (isLoading) return <div className="min-h-screen bg-white" />;
  if (!user) {
    if (typeof window !== "undefined") router.push("/login");
    return null;
  }

  const handleLogout = () => {
    logout();
    toast.success("Hẹn gặp lại bạn sớm nhé!");
    router.push("/");
  };

  const handleUpdate = () => {
    updateProfileMutation.mutate(formData);
  };

  return (
    <main className="min-h-screen bg-gray-50/50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-40 pb-20">
        <div className="grid lg:grid-cols-4 gap-12 items-start">
           
           {/* Sidebar */}
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="lg:col-span-1 space-y-6"
           >
              <div className="premium-card p-10 bg-white text-center space-y-6">
                 <div className="w-24 h-24 rounded-full bg-secondary mx-auto overflow-hidden border-4 border-white shadow-xl flex items-center justify-center">
                     {user.avatarUrl || user.avatar 
                       ? <img src={user.avatarUrl || user.avatar} alt="Avatar" className="w-full h-full object-cover" /> 
                       : <User className="w-12 h-12 text-primary/20" />}
                 </div>
                  <div>
                     <h3 className="text-xl font-black uppercase text-primary tracking-tight">{user.fullName || user.full_name || user.username}</h3>
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-full text-[8px] font-black uppercase tracking-widest text-accent mt-2">
                        <ShieldCheck className="w-3 h-3" /> {user.role?.name === "admin" || user.role === "admin" ? "Sáng lập / Admin" : "Hội viên Eco"}
                     </div>
                     {user.points > 0 && (
                       <div className="mt-3 flex items-center justify-center gap-2">
                         <span className="text-2xl font-black text-accent">{user.points?.toLocaleString()}</span>
                         <span className="text-[9px] font-black uppercase tracking-widest text-primary/40">Eco Points</span>
                       </div>
                     )}
                  </div>
                 
                 <div className="pt-8 border-t border-gray-100 flex flex-col gap-4">
                    <button 
                      onClick={() => setActiveTab("profile")}
                      className={`flex items-center gap-4 text-[10px] font-black uppercase tracking-widest p-4 rounded-2xl transition-all ${activeTab === "profile" ? "bg-accent/10 text-accent" : "text-primary/40 hover:text-primary"}`}>
                       <User className="w-4 h-4" /> Hồ sơ cá nhân
                    </button>
                    <button 
                      onClick={() => setActiveTab("addresses")}
                      className={`flex items-center gap-4 text-[10px] font-black uppercase tracking-widest p-4 rounded-2xl transition-all ${activeTab === "addresses" ? "bg-accent/10 text-accent" : "text-primary/40 hover:text-primary"}`}>
                       <MapPin className="w-4 h-4" /> Sổ địa chỉ
                    </button>
                    <button 
                      onClick={() => setActiveTab("orders")}
                      className={`flex items-center gap-4 text-[10px] font-black uppercase tracking-widest p-4 rounded-2xl transition-all ${activeTab === "orders" ? "bg-accent/10 text-accent" : "text-primary/40 hover:text-primary"}`}>
                       <Package className="w-4 h-4" /> Đơn hàng của tôi
                    </button>
                    <button className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary/40 hover:text-primary p-4 rounded-2xl transition-all opacity-50 cursor-not-allowed">
                       <Settings className="w-4 h-4" /> Cài đặt bảo mật
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 p-4 rounded-2xl transition-all"
                    >
                       <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                 </div>
              </div>
           </motion.div>

           {/* Main Content */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="lg:col-span-3 space-y-12"
           >
              {activeTab === "profile" && (
                <div className="premium-card p-12 bg-white space-y-12 animate-slideUp">
                   <h2 className="text-3xl font-black uppercase text-primary tracking-tighter italic">Cài đặt tài khoản</h2>
                   
                   <div className="grid md:grid-cols-2 gap-12">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-2">Tên hiển thị</label>
                         <div className="relative group">
                            <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/20 group-hover:text-accent transition-colors" />
                            <input 
                              type="text"
                              value={formData.fullName}
                              onChange={e => setFormData({...formData, fullName: e.target.value})}
                              className="w-full bg-secondary/30 border-none rounded-2xl py-5 pl-16 pr-6 font-bold text-primary outline-none focus:ring-2 focus:ring-accent"
                              placeholder="Nhập tên của bạn"
                            />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-2">Số điện thoại</label>
                         <div className="relative group">
                            <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/20 group-hover:text-accent transition-colors" />
                            <input 
                              type="text"
                              value={formData.phone}
                              onChange={e => setFormData({...formData, phone: e.target.value})}
                              className="w-full bg-secondary/30 border-none rounded-2xl py-5 pl-16 pr-6 font-bold text-primary outline-none focus:ring-2 focus:ring-accent"
                              placeholder="Nhập số điện thoại"
                            />
                         </div>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-2">Địa chỉ Email (Đọc tĩnh)</label>
                         <div className="relative group">
                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/20" />
                            <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 pl-16 pr-6 font-bold text-primary/50 italic select-none">
                               {user.email || "CHƯA CẬP NHẬT"}
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="space-y-1">
                         <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-800">Cập nhật hồ sơ</h4>
                         <p className="text-[10px] font-bold text-emerald-600/60 uppercase italic">Lưu ý: Tên hiển thị và số điện thoại sẽ được dùng hiển thị cơ bản.</p>
                      </div>
                      <button 
                        onClick={handleUpdate}
                        disabled={updateProfileMutation.isPending}
                        className="btn-primary w-full md:w-auto px-10 py-4 text-xs shrink-0"
                      >
                        {updateProfileMutation.isPending ? "ĐANG LƯU..." : "CẬP NHẬT NGAY"}
                      </button>
                   </div>
                </div>
              )}

              {activeTab === "addresses" && (
                <div className="premium-card p-12 bg-white space-y-12 animate-slideUp">
                   <div className="flex items-center justify-between">
                      <h2 className="text-3xl font-black uppercase text-primary tracking-tighter italic">Sổ địa chỉ</h2>
                      <button 
                        onClick={() => setShowAddressForm(!showAddressForm)}
                        className="btn-primary px-6 py-3 text-[10px]"
                      >
                        {showAddressForm ? "HỦY BỎ" : "THÊM ĐỊA CHỈ"}
                      </button>
                   </div>

                   {showAddressForm && (
                      <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-6 animate-slideDown">
                         <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-2">Địa chỉ chi tiết</label>
                               <input 
                                 type="text"
                                 value={addressFormData.addressLine}
                                 onChange={e => setAddressFormData({...addressFormData, addressLine: e.target.value})}
                                 className="w-full bg-white border-2 border-transparent rounded-2xl py-4 px-6 font-bold text-primary outline-none focus:border-accent shadow-sm"
                                 placeholder="Số nhà, tên đường..."
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-2">Thành phố</label>
                               <input 
                                 type="text"
                                 value={addressFormData.city}
                                 onChange={e => setAddressFormData({...addressFormData, city: e.target.value})}
                                 className="w-full bg-white border-2 border-transparent rounded-2xl py-4 px-6 font-bold text-primary outline-none focus:border-accent shadow-sm"
                                 placeholder="Ví dụ: TP. Hồ Chí Minh"
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-2">Số điện thoại nhận hàng</label>
                               <input 
                                 type="text"
                                 value={addressFormData.phone}
                                 onChange={e => setAddressFormData({...addressFormData, phone: e.target.value})}
                                 className="w-full bg-white border-2 border-transparent rounded-2xl py-4 px-6 font-bold text-primary outline-none focus:border-accent shadow-sm"
                                 placeholder="Nhập số điện thoại..."
                               />
                            </div>
                         </div>
                         <div className="flex justify-end">
                            <button 
                              onClick={() => addAddressMutation.mutate(addressFormData)}
                              disabled={addAddressMutation.isPending}
                              className="bg-accent text-white px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-accent/20"
                            >
                               {addAddressMutation.isPending ? "ĐANG LƯU..." : "LƯU ĐỊA CHỈ"}
                            </button>
                         </div>
                      </div>
                   )}

                   <div className="grid md:grid-cols-2 gap-6">
                      {addressesLoading ? (
                        [1,2].map(i => <div key={i} className="h-40 bg-secondary/20 rounded-[2rem] animate-pulse" />)
                      ) : addresses.length > 0 ? (
                        addresses.map((addr: any) => (
                          <div key={addr.id} className="p-8 border-2 border-gray-50 rounded-[2rem] hover:border-accent/20 transition-all relative group">
                             <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center"><MapPin className="w-4 h-4" /></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">{addr.addressLine}</span>
                             </div>
                              <p className="text-sm font-medium text-primary/60 italic mb-2">{addr.city}, {addr.country}</p>
                             {addr.phone && <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest mb-6">SĐT: {addr.phone}</p>}
                             <button 
                               onClick={() => deleteAddressMutation.mutate(addr.id)}
                               className="text-[10px] font-black text-red-400 hover:text-red-500 uppercase tracking-widest"
                             >
                               Xóa địa chỉ
                             </button>
                             {addr.isDefault && <span className="absolute top-8 right-8 text-[8px] font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase">Mặc định</span>}
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 py-16 text-center text-primary/30 uppercase font-black text-xs tracking-widest border-2 border-dashed border-gray-100 rounded-[2rem]">
                           Bạn chưa lưu địa chỉ nào
                        </div>
                      )}
                   </div>
                </div>
              )}

              {activeTab === "orders" && (
                <div className="premium-card p-12 bg-white space-y-8 animate-slideUp">
                  <h2 className="text-3xl font-black uppercase text-primary tracking-tighter italic">Đơn hàng của tôi</h2>
                  
                  {ordersLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 w-full bg-secondary/30 rounded-2xl animate-pulse"></div>
                      ))}
                    </div>
                  ) : orders.data?.length > 0 || orders.length > 0 ? (
                    <div className="space-y-6">
                      {(orders.data || orders).map((order: any) => (
                        <div key={order.id} className="p-6 border border-gray-100 rounded-[2rem] hover:shadow-lg transition-shadow flex flex-col gap-4">
                           <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-gray-50">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-secondary rounded-xl text-primary/60"><Hash className="w-5 h-5" /></div>
                                <div>
                                  <span className="text-xs font-black uppercase tracking-widest text-primary/40">Mã đơn hàng</span>
                                  <p className="font-bold">ORD-{order.id.toString().padStart(4, '0')}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-full ${order.status === 'pending' ? 'bg-amber-100 text-amber-700' : order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {order.status === 'pending' ? 'Chờ xử lý' : order.status === 'processing' ? 'Đang giao' : order.status}
                                </span>
                              </div>
                           </div>
                           <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                               <p className="text-sm font-medium text-muted-foreground">{new Date(order.orderDate || order.createdAt).toLocaleDateString('vi-VN')} &bull; {order.items?.length || 0} sản phẩm</p>
                              <p className="text-2xl font-black text-primary tracking-tighter">{formatCurrency(order.totalAmount)}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 border-dashed border-2 border-gray-200 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-6">
                       <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center text-primary/10">
                          <Package className="w-8 h-8" />
                       </div>
                       <div className="space-y-2">
                          <h3 className="text-xl font-black uppercase text-primary/40">Bạn chưa có đơn hàng nào</h3>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Các giao dịch sẽ xuất hiện tại đây sau khi thanh toán.</p>
                       </div>
                    </div>
                  )}
                </div>
              )}
           </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
