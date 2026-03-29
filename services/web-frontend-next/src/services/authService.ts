import axiosClient from "@/lib/api/axiosClient";

export const authService = {
  login: async (credentials: any) => {
    return await axiosClient.post("/auth/login", credentials);
  },

  register: async (userData: any) => {
    return await axiosClient.post("/auth/register", userData);
  },

  verify: async () => {
    return await axiosClient.get("/auth/verify");
  },

  logout: async () => {
    return await axiosClient.post("/auth/logout");
  },
};
