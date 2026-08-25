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
  login: (email: string, password: string) => Promise<void>;
  register: (phoneNumber: string, email: string, firstName: string, lastName: string, password: string) => Promise<void>;
  updateProfile: (data: { name?: string; email?: string | null }) => Promise<void>;
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

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await authService.login({ email, password });
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

  register: async (phoneNumber, email, firstName, lastName, password) => {
    set({ isLoading: true });
    try {
      const response = await authService.register({
        phoneNumber,
        email,
        firstName,
        lastName,
        password,
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

  updateProfile: async (data) => {
    const user = await authService.updateProfile(data);
    set({ user });
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
