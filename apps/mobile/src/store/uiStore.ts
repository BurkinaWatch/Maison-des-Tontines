import { create } from "zustand";

type ThemeMode = "dark" | "light";

interface UIStore {
  themeMode: ThemeMode;
  isOnboardingComplete: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  completeOnboarding: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  themeMode: "dark",
  isOnboardingComplete: false,

  setThemeMode: (mode) => set({ themeMode: mode }),
  completeOnboarding: () => set({ isOnboardingComplete: true }),
}));
