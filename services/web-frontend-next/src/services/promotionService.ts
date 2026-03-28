import axiosClient from "@/lib/api/axiosClient";

export const promotionService = {
  getAllPromotions: async () => {
    const res: any = await axiosClient.get("/promotions");
    return res.data || res;
  },

  checkPromotion: async (code: string) => {
    const res: any = await axiosClient.post("/promotions/check", { code });
    return res.data || res;
  },
};
