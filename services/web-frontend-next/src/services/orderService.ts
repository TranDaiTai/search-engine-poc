import axiosClient from "@/lib/api/axiosClient";

export const orderService = {
  createOrder: async (orderData: any) => {
    const res: any = await axiosClient.post("/orders", orderData);
    return res.data || res;
  },

  getUserOrders: async () => {
    const res: any = await axiosClient.get("/orders");
    return res.data || [];
  },

  getOrderById: async (id: number | string) => {
    const res: any = await axiosClient.get(`/orders/${id}`);
    return res.data || null;
  },

  // Admin Methods
  updateOrderStatus: async (id: number | string, status: string) => {
    const res: any = await axiosClient.put(`/orders/${id}/status`, { status });
    return res.data || null;
  },
};
