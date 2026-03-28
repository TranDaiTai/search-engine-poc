import axiosClient from "@/lib/api/axiosClient";

export const shippingService = {
  getShippingMethods: async () => {
    const res: any = await axiosClient.get("/shipping-methods");
    return res.data || res;
  },
};
