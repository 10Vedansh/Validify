import { create } from "zustand";
import { persist } from "zustand/middleware";
import { THEME_STORAGE_KEY } from "@/constants/config";

export type Theme = "dark" | "light" | "system";

type ThemeState = {
  theme: Theme;
  setTheme: (t: Theme) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "dark",
      setTheme: (theme) => set({ theme }),
    }),
    { name: THEME_STORAGE_KEY },
  ),
);
