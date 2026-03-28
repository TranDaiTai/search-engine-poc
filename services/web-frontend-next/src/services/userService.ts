import axiosClient from "@/lib/api/axiosClient";

export const userService = {
  updateUser: async (id: number | string, userData: any) => {
    const res: any = await axiosClient.put(`/users/${id}`, userData);
    return res.data || null;
  },

  getUserById: async (id: number | string) => {
    const res: any = await axiosClient.get(`/users/${id}`);
    return res.data || null;
  },

  // Admin Methods
  getAllUsers: async () => {
    const res: any = await axiosClient.get("/users");
    return res.data || [];
  },

  deleteUser: async (id: number | string) => {
    const res: any = await axiosClient.delete(`/users/${id}`);
    return res.data || null;
  },
};
