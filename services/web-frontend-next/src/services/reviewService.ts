import axiosClient from "@/lib/api/axiosClient";

export const reviewService = {
  getReviewsByProductId: async (productId: number, params?: any) => {
    const res: any = await axiosClient.get(`/reviews/product/${productId}`, { params });
    return res.data || res;
  },

  createReview: async (reviewData: {
    productId: number;
    rating: number;
    title?: string;
    content?: string;
    images?: string[];
  }) => {
    const res: any = await axiosClient.post("/reviews", reviewData);
    return res.data || res;
  },
};
