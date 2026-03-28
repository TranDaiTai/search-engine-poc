import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import { cartService } from "@/services/cartService";
import { getImageUrl } from "@/lib/utils";
import { useAuthStore } from "./useAuthStore";

export interface CartItem {
  id: number;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  cartItemId?: number;
  variantId?: number;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  addToCart: (product: any, quantity?: number) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  updateQuantity: (id: number, quantity: number, variantId?: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      fetchCart: async () => {
        const user = useAuthStore.getState().user;
        if (!user) {
           // Local storage handles it via persist middleware automatically
           return;
        }

        set({ isLoading: true });
        try {
          const res = await cartService.getCart();
          const cartData = res.data || res;
          if (cartData && cartData.items) {
            const mappedItems = cartData.items.map((item: any) => ({
              id: item.product?.id || item.productId || item.id,
              slug: item.product?.slug || "",
              name: item.product?.name || `Product ${item.product?.id || item.productId}`,
              price: item.price || item.product?.price || 0,
              image: getImageUrl(item.product?.images?.[0]?.imageUrl || item.product?.image || ""),
              quantity: item.quantity,
              cartItemId: item.id,
              variantId: item.variantId
            }));
            set({ items: mappedItems });
          }
        } catch (err) {
          console.error("Error fetching cart", err);
        } finally {
          set({ isLoading: false });
        }
      },

      addToCart: async (product: any, quantity: number = 1) => {
        const items = get().items;
        const user = useAuthStore.getState().user;
        const existing = items.find((item) => 
          item.id === product.id && item.variantId === product.variantId
        );

        if (user) {
          try {
            await cartService.addToCart(product.id, product.variantId, quantity);
            if (existing) {
              toast.success(`Đã tăng số lượng ${product.name}`);
              set({
                items: items.map((item) =>
                  item.id === product.id && item.variantId === product.variantId
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
                ),
              });
            } else {
              toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
              set({ items: [...items, { ...product, quantity }] });
            }
            // Re-fetch to get correct cartItemId from backend if needed, 
            // but for now we optimistic update
          } catch (err) {
            toast.error("Lỗi khi thêm vào giỏ hàng!");
          }
        } else {
          if (existing) {
            toast.success(`Đã tăng số lượng ${product.name}`);
            set({
              items: items.map((item) =>
                item.id === product.id && item.variantId === product.variantId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            });
          } else {
            toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
            set({ items: [...items, { ...product, quantity }] });
          }
        }
      },

      removeFromCart: async (id: number) => {
        const items = get().items;
        const user = useAuthStore.getState().user;
        const itemToRemove = items.find((i) => i.id === id);
        if (!itemToRemove) return;

        if (user) {
          try {
            await cartService.removeFromCart(itemToRemove.cartItemId, id, itemToRemove.variantId);
            set({ items: items.filter((item) => item.id !== id) });
            toast.error("Đã xóa sản phẩm khỏi giỏ hàng");
          } catch (err) {
            toast.error("Lỗi khi xóa khỏi giỏ hàng");
          }
        } else {
          set({ items: items.filter((item) => item.id !== id) });
          toast.error("Đã xóa sản phẩm khỏi giỏ hàng");
        }
      },

      updateQuantity: async (id: number, quantity: number, variantId?: number) => {
        if (quantity < 1) return;
        const items = get().items;
        const user = useAuthStore.getState().user;
        const itemToUpdate = items.find((i) => i.id === id && i.variantId === variantId);
        if (!itemToUpdate) return;

        if (user) {
          try {
            await cartService.updateCartItem(itemToUpdate.cartItemId, id, itemToUpdate.variantId, quantity);
            set({
              items: items.map((item) =>
                item.id === id && item.variantId === variantId ? { ...item, quantity } : item
              ),
            });
          } catch (err) {
            toast.error("Lỗi cập nhật số lượng");
          }
        } else {
          set({
            items: items.map((item) =>
              item.id === id && item.variantId === variantId ? { ...item, quantity } : item
            ),
          });
        }
      },

      clearCart: async () => {
        const user = useAuthStore.getState().user;
        if (user) {
          try {
            await cartService.clearCart();
          } catch (err) {}
        }
        set({ items: [] });
      },

      getTotalPrice: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
      getItemCount: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
    }),
    {
      name: "cart-storage",
      // Only persist if NOT logged in? Actually persist is fine, 
      // but initCart will overwrite it if logged in.
    }
  )
);
