import { create } from "zustand";
import type { Industry } from "@/types/startup";

export type DateRange = "7d" | "30d" | "90d" | "12m";

type DashboardState = {
  search: string;
  industry: Industry | "all";
  range: DateRange;
  sidebarOpen: boolean;
  aiPanelOpen: boolean;
  commandPaletteOpen: boolean;
  setSearch: (s: string) => void;
  setIndustry: (i: Industry | "all") => void;
  setRange: (r: DateRange) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setAiPanelOpen: (open: boolean) => void;
  toggleAiPanel: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  reset: () => void;
};

const initial = {
  search: "",
  industry: "all" as const,
  range: "30d" as const,
  sidebarOpen: true,
  aiPanelOpen: false,
  commandPaletteOpen: false,
};

export const useDashboardStore = create<DashboardState>((set) => ({
  ...initial,
  setSearch: (search) => set({ search }),
  setIndustry: (industry) => set({ industry }),
  setRange: (range) => set({ range }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setAiPanelOpen: (aiPanelOpen) => set({ aiPanelOpen }),
  toggleAiPanel: () => set((s) => ({ aiPanelOpen: !s.aiPanelOpen })),
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
  reset: () => set(initial),
}));
