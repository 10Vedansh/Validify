import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WorkspaceMode = "comfortable" | "compact" | "expanded";
export type DashboardWidget = "stats" | "trends" | "feed" | "recent" | "investor" | "team";

type WidgetConfig = {
  id: DashboardWidget;
  visible: boolean;
  order: number;
};

type PreferencesState = {
  workspaceMode: WorkspaceMode;
  onboardingComplete: boolean;
  tourSeen: Record<string, boolean>;
  favoriteReports: string[];
  widgets: WidgetConfig[];
  recentSearches: string[];
  setWorkspaceMode: (mode: WorkspaceMode) => void;
  completeOnboarding: () => void;
  markTourSeen: (tourId: string) => void;
  toggleWidget: (id: DashboardWidget) => void;
  addRecentSearch: (q: string) => void;
  clearRecentSearches: () => void;
  addFavoriteReport: (id: string) => void;
  removeFavoriteReport: (id: string) => void;
};

const defaultWidgets: WidgetConfig[] = [
  { id: "stats", visible: true, order: 0 },
  { id: "trends", visible: true, order: 1 },
  { id: "feed", visible: false, order: 2 },
  { id: "recent", visible: true, order: 3 },
  { id: "investor", visible: false, order: 4 },
  { id: "team", visible: false, order: 5 },
];

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      workspaceMode: "comfortable",
      onboardingComplete: false,
      tourSeen: {},
      favoriteReports: [],
      widgets: defaultWidgets,
      recentSearches: [],
      setWorkspaceMode: (workspaceMode) => set({ workspaceMode }),
      completeOnboarding: () => set({ onboardingComplete: true }),
      markTourSeen: (tourId) => set((s) => ({ tourSeen: { ...s.tourSeen, [tourId]: true } })),
      toggleWidget: (id) =>
        set((s) => ({
          widgets: s.widgets.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w)),
        })),
      addRecentSearch: (q) =>
        set((s) => ({
          recentSearches: [q, ...s.recentSearches.filter((r) => r !== q)].slice(0, 8),
        })),
      clearRecentSearches: () => set({ recentSearches: [] }),
      addFavoriteReport: (id) => set((s) => ({ favoriteReports: [...new Set([...s.favoriteReports, id])] })),
      removeFavoriteReport: (id) => set((s) => ({ favoriteReports: s.favoriteReports.filter((r) => r !== id) })),
    }),
    { name: "validify.preferences" },
  ),
);
