import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import {
  Search,
  LayoutDashboard,
  Sparkles,
  FileText,
  Bot,
  Presentation,
  TrendingUp,
  Settings,
  ArrowRight,
  Command,
  Gauge,
  Users,
  Download,
  Clock,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/store/dashboard.store";
import { usePreferencesStore } from "@/store/preferences.store";
import { ROUTES } from "@/constants/routes";
import { ease } from "@/lib/motion";

type Action = {
  id: string;
  label: string;
  description?: string;
  icon: typeof Search;
  to?: string;
  action?: () => void;
  shortcut?: string;
};

const defaultActions: Action[] = [
  { id: "overview", label: "Go to Overview", icon: LayoutDashboard, to: ROUTES.dashboard, shortcut: "G O" },
  { id: "validate", label: "New validation", description: "Run AI validation on a new idea", icon: Sparkles, to: ROUTES.validate, shortcut: "G V" },
  { id: "reports", label: "View Reports", description: "Browse validation reports", icon: FileText, to: ROUTES.reports, shortcut: "G R" },
  { id: "readiness", label: "Investor Readiness", description: "Check your investor readiness score", icon: Gauge, to: ROUTES.readiness },
  { id: "pitch", label: "Pitch Decks", icon: Presentation, to: ROUTES.pitch },
  { id: "cofounder", label: "Co-founder Chat", icon: Bot, to: ROUTES.cofounder, shortcut: "G C" },
  { id: "team", label: "Team & Collaboration", icon: Users, to: ROUTES.team },
  { id: "trends", label: "View Trends", icon: TrendingUp, to: ROUTES.trends },
  { id: "settings", label: "Open Settings", icon: Settings, to: ROUTES.settings },
];

function fuzzyMatch(text: string, query: string): boolean {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

export function CommandPalette() {
  const navigate = useNavigate();
  const { commandPaletteOpen, setCommandPaletteOpen } = useDashboardStore();
  const { recentSearches, addRecentSearch } = usePreferencesStore();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const allActions: Action[] = [
    ...defaultActions,
    ...(recentSearches.length > 0
      ? recentSearches.map((s, i) => ({
          id: `recent-${i}`,
          label: s,
          icon: Clock as typeof Search,
          action: () => {},
        }))
      : []),
  ];

  const filtered = query.trim()
    ? defaultActions.filter((a) => fuzzyMatch(a.label + " " + (a.description ?? ""), query))
    : defaultActions;

  const execute = useCallback(
    (action: Action) => {
      setCommandPaletteOpen(false);
      if (query.trim()) addRecentSearch(query.trim());
      setQuery("");
      if (action.action) action.action();
      else if (action.to) navigate({ to: action.to });
    },
    [navigate, setCommandPaletteOpen, addRecentSearch, query],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
        setQuery("");
      }
      if (e.key === "Escape" && commandPaletteOpen) {
        setCommandPaletteOpen(false);
        setQuery("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [commandPaletteOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      execute(filtered[selectedIndex]);
    }
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const el = listRef.current.children[selectedIndex] as HTMLElement | undefined;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={() => { setCommandPaletteOpen(false); setQuery(""); }}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.2, ease }}
            className="fixed inset-0 z-[101] flex items-start justify-center pt-[15vh] pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-lg rounded-2xl border border-white/[0.08] bg-background/80 backdrop-blur-2xl shadow-2xl shadow-black/40 overflow-hidden"
              role="dialog"
              aria-label="Command palette"
              aria-modal="true"
            >
              <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search actions, pages, reports…"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
                  aria-label="Search commands"
                />
                <kbd className="shrink-0 rounded-md border border-white/[0.06] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/40">
                  ESC
                </kbd>
              </div>
              <div ref={listRef} className="max-h-72 overflow-y-auto p-2 space-y-0.5" role="listbox">
                {filtered.length === 0 ? (
                  <div className="px-3 py-8 text-center text-sm text-muted-foreground/50">
                    No results found
                  </div>
                ) : (
                  filtered.map((action, i) => (
                    <button
                      key={action.id}
                      role="option"
                      aria-selected={i === selectedIndex}
                      onClick={() => execute(action)}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-100",
                        i === selectedIndex
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                      )}
                    >
                      <div className={cn(
                        "grid h-7 w-7 shrink-0 place-items-center rounded-lg border",
                        i === selectedIndex ? "border-primary/30 bg-primary/10" : "border-border bg-card",
                      )}>
                        <action.icon className={cn(
                          "h-3.5 w-3.5",
                          i === selectedIndex ? "text-primary" : "text-muted-foreground",
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{action.label}</div>
                        {action.description && (
                          <div className="text-xs text-muted-foreground/50 truncate">{action.description}</div>
                        )}
                      </div>
                      {action.shortcut && (
                        <kbd className="shrink-0 font-mono text-[10px] text-muted-foreground/40">
                          {action.shortcut}
                        </kbd>
                      )}
                      {i === selectedIndex && (
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                      )}
                    </button>
                  ))
                )}
              </div>
              <div className="border-t border-white/[0.06] px-4 py-2 flex items-center gap-4 text-[11px] text-muted-foreground/30">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-white/[0.06] bg-white/[0.04] px-1 font-mono">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-white/[0.06] bg-white/[0.04] px-1 font-mono">↵</kbd>
                  Open
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-white/[0.06] bg-white/[0.04] px-1 font-mono">ESC</kbd>
                  Close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
