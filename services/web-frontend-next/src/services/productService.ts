import axiosClient from "@/lib/api/axiosClient";

export const productService = {
  // Returns { products, pagination } from search-service via ES
  getAllProducts: async (params?: string) => {
    try {
      // Ensure params string is clean and doesn't have leading/trailing slashes
      const cleanParams = params ? params.replace(/^\/+|\/+$/g, "") : "";
      const queryString = cleanParams ? `?${cleanParams}` : "";
      
      const res: any = await axiosClient.get(`/search${queryString}`);
      const root = res.data || res;
      
      if (root.products && Array.isArray(root.products)) {
        return { 
          products: root.products, 
          pagination: root.pagination, 
          aggregations: root.aggregations || {} 
        };
      }
      return { products: [], pagination: null, aggregations: {} };
    } catch (error: any) {
      console.error('[SEARCH-SERVICE] API Error:', error?.response?.status, error.message);
      return { products: [], pagination: null, aggregations: {} };
    }
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
