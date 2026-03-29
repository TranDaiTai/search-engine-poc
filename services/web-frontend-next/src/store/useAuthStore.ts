import { create } from "zustand";
import { authService } from "@/services/authService";

interface AuthState {
  user: any;
  isLoading: boolean;
  login: (credentials: any) => Promise<boolean>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  fetchMe: async () => {
    set({ isLoading: true });
    try {
      const data: any = await authService.verify();
      if (data?.user) {
        set({ user: data.user });
      } else {
        set({ user: null });
      }
    } catch (err) {
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (credentials: any) => {
    try {
      const data: any = await authService.login(credentials);
      if (data?.success) {
        set({ user: data.user });
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      set({ user: null });
    }
  },
}));
