import { Link, useRouterState } from "@tanstack/react-router";
import { Plus, ChevronLeft, ChevronsUpDown } from "lucide-react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { dashboardNav } from "@/constants/nav";
import { useDashboardStore } from "@/store/dashboard.store";

export function DashboardSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { sidebarOpen, toggleSidebar } = useDashboardStore();

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-sidebar transition-all duration-300 ease-out",
        sidebarOpen ? "w-60" : "w-[52px]",
      )}
    >
      {/* Logo row */}
      <div className={cn(
        "flex h-14 items-center border-b border-border",
        sidebarOpen ? "justify-between px-4" : "justify-center px-2",
      )}>
        {sidebarOpen ? (
          <>
            <Logo compact />
            <button
              onClick={toggleSidebar}
              className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronsUpDown className="h-4 w-4 rotate-90" />
          </button>
        )}
      </div>

      {/* Workspace switcher */}
      {sidebarOpen && (
        <div className="px-3 pt-3 pb-1">
          <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all">
            <div className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-primary/10 text-[9px] font-bold text-primary">
              V
            </div>
            <span className="flex-1 text-left font-medium">Validify</span>
            <ChevronsUpDown className="h-3 w-3 shrink-0 text-muted-foreground/50" />
          </button>
        </div>
      )}

      {/* New validation button */}
      <div className={cn("p-3", !sidebarOpen && "px-1")}>
        <Link to="/dashboard/validate" onClick={onNavigate}>
          <Button
            size={sidebarOpen ? "sm" : "icon-sm"}
            className={cn(
              sidebarOpen ? "h-9 w-full justify-start gap-2 rounded-lg" : "h-9 w-full rounded-lg",
            )}
            title="New validation"
          >
            <Plus className="h-3.5 w-3.5 shrink-0" />
            {sidebarOpen && <span>New validation</span>}
          </Button>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-2">
        {sidebarOpen && (
          <div className="px-3 pb-1.5 pt-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground/50">
            Workspace
          </div>
        )}
        {dashboardNav.map((it) => {
          const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
          return (
            <Link
              key={it.to}
              to={it.to}
              onClick={onNavigate}
              title={it.label}
              className={cn(
                "group flex items-center gap-2.5 rounded-lg text-sm transition-all duration-150",
                sidebarOpen ? "px-3 py-2" : "justify-center px-0 py-2",
                active
                  ? "bg-sidebar-accent text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
              )}
            >
              <it.icon
                className={cn("h-4 w-4 shrink-0", active ? "text-foreground" : "text-muted-foreground")}
              />
              {sidebarOpen && (
                <>
                  <span className="flex-1">{it.label}</span>
                  {it.shortcut && (
                    <kbd className="font-mono text-[10px] text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100">
                      {it.shortcut}
                    </kbd>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade card */}
      {sidebarOpen && (
        <div className="border-t border-border p-3">
          <div className="rounded-xl border border-border bg-gradient-to-br from-card to-card/50 p-3.5">
            <div className="text-xs font-medium text-foreground">Upgrade to Pro</div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground/70">
              Unlimited validations, decks, and more.
            </p>
            <Button size="sm" variant="outline" className="mt-3 h-8 w-full text-xs rounded-lg">
              Upgrade
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}
