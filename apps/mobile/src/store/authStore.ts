import { create } from "zustand/index.js";
import { authService } from "../services/auth.service";
import { User } from "../types/user";

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (phoneNumber: string, otp: string) => Promise<void>;
  register: (phoneNumber: string, firstName: string, lastName: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token, isAuthenticated: !!token }),

  login: async (phoneNumber, otp) => {
    set({ isLoading: true });
    try {
      const response = await authService.login({ phoneNumber, otp });
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (phoneNumber, firstName, lastName, otp) => {
    set({ isLoading: true });
    try {
      const response = await authService.register({
        phoneNumber,
        firstName,
        lastName,
        otp,
      });
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // ignore logout errors
    }
    set({ user: null, token: null, isAuthenticated: false });
  },

  initialize: async () => {
    set({ isLoading: true });
    try {
      const token = await authService.getCurrentUser();
      set({
        user: token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },
}));
