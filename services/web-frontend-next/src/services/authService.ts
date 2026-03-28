import axiosClient from "@/lib/api/axiosClient";

export const authService = {
  login: async (credentials: any) => {
    const res: any = await axiosClient.post("/auth/login", credentials);
    return res.data || null;
  },

  register: async (userData: any) => {
    const res: any = await axiosClient.post("/users", userData);
    return res.data || null;
  },

  verify: async () => {
    const res: any = await axiosClient.get("/auth/verify");
    return res.data || null;
  },

  logout: async () => {
    return await axiosClient.post("/auth/logout");
  },
};
