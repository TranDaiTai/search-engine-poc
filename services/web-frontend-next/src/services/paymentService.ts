import axiosClient from "@/lib/api/axiosClient";

export const paymentService = {
  getPaymentByOrderId: async (orderId: number | string) => {
    const res: any = await axiosClient.get(`/payments/order/${orderId}`);
    return res.data || null;
  },

  // Admin / Webhook simulation
  updatePaymentStatus: async (orderId: number | string, status: string) => {
    const res: any = await axiosClient.put(`/payments/order/${orderId}/status`, { status });
    return res.data || null;
  },
};
