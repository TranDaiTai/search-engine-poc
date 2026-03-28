import axiosClient from "@/lib/api/axiosClient";

export const wishlistService = {
  getWishlist: async () => {
    const res: any = await axiosClient.get("/wishlist");
    return res.data || res;
  },

  addToWishlist: async (productId: number) => {
    const res: any = await axiosClient.post("/wishlist/add", { productId });
    return res.data || res;
  },

  removeFromWishlist: async (productId: number) => {
    const res: any = await axiosClient.post("/wishlist/remove", { productId });
    return res.data || res;
  },

  clearWishlist: async () => {
    const res: any = await axiosClient.post("/wishlist/clear");
    return res.data || res;
  },
};
