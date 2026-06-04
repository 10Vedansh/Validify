import { Link, useRouterState } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { dashboardNav } from "@/constants/nav";

export function DashboardSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="flex h-14 items-center border-b border-border px-5">
        <Logo />
      </div>
      <div className="p-3">
        <Link to="/dashboard/validate" onClick={onNavigate}>
          <Button size="sm" className="h-8 w-full justify-start gap-2 font-medium">
            <Plus className="h-3.5 w-3.5" /> New validation
          </Button>
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 px-2">
        <div className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Workspace
        </div>
        {dashboardNav.map((it) => {
          const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
          return (
            <Link
              key={it.to}
              to={it.to}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
              )}
            >
              <it.icon className={cn("h-4 w-4", active ? "text-foreground" : "text-muted-foreground")} />
              <span className="flex-1">{it.label}</span>
              {it.shortcut && (
                <kbd className="hidden font-mono text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 sm:inline">
                  {it.shortcut}
                </kbd>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <div className="rounded-md border border-border bg-card p-3">
          <div className="text-xs font-medium">Upgrade to Pro</div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Unlimited validations, decks, and a higher rate-limit on co-founder chat.
          </p>
          <Button size="sm" variant="outline" className="mt-3 h-7 w-full text-xs">
            Upgrade
          </Button>
        </div>
      </div>
    </aside>
  );
}
