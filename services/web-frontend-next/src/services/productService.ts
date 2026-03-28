import axiosClient from "@/lib/api/axiosClient";

export const productService = {
  // Returns { products, pagination } or just products[]
  getAllProducts: async (params?: string) => {
    const res: any = await axiosClient.get(`/products?${params || ""}`);
    const root = res.data || res;
    // New structure: root.products + root.pagination
    if (root.products && Array.isArray(root.products)) {
      return { products: root.products, pagination: root.pagination };
    }
    // Legacy fallback (product singular or direct array)
    if (root.product && Array.isArray(root.product)) return { products: root.product, pagination: null };
    if (Array.isArray(root)) return { products: root, pagination: null };
    return { products: [], pagination: null };
  },

  getProductDetails: async (slug: string) => {
    const res: any = await axiosClient.get(`/products/slug/${slug}`);
    const root = res.data || res;
    return root.product || (root.id ? root : null);
  },

  getCategories: async () => {
    const res: any = await axiosClient.get("/categories");
    const root = res.data || res;
    // May return { data: [...] } or directly an array
    if (Array.isArray(root)) return root;
    if (root.data && Array.isArray(root.data)) return root.data;
    return [];
  },

  getPromotions: async () => {
    const res: any = await axiosClient.get("/promotions");
    return res.data || res;
  },

  // Admin Methods
  createProduct: async (productData: any) => {
    const res: any = await axiosClient.post("/products", productData);
    return res.data || null;
  },

  updateProduct: async (id: number | string, productData: any) => {
    const res: any = await axiosClient.put(`/products/${id}`, productData);
    return res.data || null;
  },

  deleteProduct: async (id: number | string) => {
    const res: any = await axiosClient.delete(`/products/${id}`);
    return res.data || null;
  },
};
