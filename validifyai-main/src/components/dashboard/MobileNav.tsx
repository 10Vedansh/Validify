import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Sparkles, FileText, Bot, Presentation, Gauge,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const navItems = [
  { to: ROUTES.dashboard, label: "Home", icon: LayoutDashboard, exact: true },
  { to: ROUTES.validate, label: "Validate", icon: Sparkles },
  { to: ROUTES.reports, label: "Reports", icon: FileText },
  { to: ROUTES.readiness, label: "Investor", icon: Gauge },
  { to: ROUTES.cofounder, label: "AI Chat", icon: Bot },
];

export function MobileNav() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/80 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors",
                active ? "text-primary" : "text-muted-foreground/60 hover:text-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
