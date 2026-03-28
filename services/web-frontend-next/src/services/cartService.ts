import axiosClient from "@/lib/api/axiosClient";

export const cartService = {
  getCart: async () => {
    const res: any = await axiosClient.get("/carts");
    return res.data || null;
  },

  addToCart: async (productId: number, variantId?: number, quantity: number = 1) => {
    const res: any = await axiosClient.post("/carts/add", {
      productId,
      variantId,
      quantity,
    });
    return res.data || null;
  },

  removeFromCart: async (cartItemId?: number, productId?: number, variantId?: number) => {
    const res: any = await axiosClient.post("/carts/remove", {
      cartItemId,
      productId,
      variantId,
    });
    return res.data || null;
  },

  updateCartItem: async (cartItemId?: number, productId?: number, variantId?: number, quantity: number = 1) => {
    const res: any = await axiosClient.post("/carts/update", {
      cartItemId,
      productId,
      variantId,
      quantity,
    });
    return res.data || null;
  },

  clearCart: async () => {
    const res: any = await axiosClient.post("/carts/clearcart");
    return res.data || null;
  },
};
