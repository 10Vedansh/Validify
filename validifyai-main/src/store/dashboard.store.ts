import { create } from "zustand";
import type { Industry } from "@/types/startup";

export type DateRange = "7d" | "30d" | "90d" | "12m";

type DashboardState = {
  search: string;
  industry: Industry | "all";
  range: DateRange;
  setSearch: (s: string) => void;
  setIndustry: (i: Industry | "all") => void;
  setRange: (r: DateRange) => void;
  reset: () => void;
};

const initial = { search: "", industry: "all" as const, range: "30d" as const };

export const useDashboardStore = create<DashboardState>((set) => ({
  ...initial,
  setSearch: (search) => set({ search }),
  setIndustry: (industry) => set({ industry }),
  setRange: (range) => set({ range }),
  reset: () => set(initial),
}));
