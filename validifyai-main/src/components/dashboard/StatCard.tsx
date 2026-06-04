import { type LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  accent,
}: {
  icon?: LucideIcon;
  label: string;
  value: ReactNode;
  delta?: string;
  accent?: string;
}) {
  const trending = delta?.trim().startsWith("-") ? "down" : "up";
  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-all duration-150 hover:bg-card/80 hover:shadow-sm">
      <div className="flex items-center justify-between text-muted-foreground">
        <div className="flex items-center gap-2 text-xs">
          {Icon && <Icon className="h-3.5 w-3.5" />}
          <span className="text-[11px] font-medium uppercase tracking-wider">{label}</span>
        </div>
        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]",
              trending === "up" ? "text-emerald-400" : "text-muted-foreground",
            )}
          >
            {trending === "up" ? (
              <ArrowUpRight className="h-2.5 w-2.5" />
            ) : (
              <ArrowDownRight className="h-2.5 w-2.5" />
            )}
            {delta.replace(/^[+-]/, "")}
          </span>
        )}
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{value}</div>
      {accent && <div className="mt-1 text-xs text-muted-foreground">{accent}</div>}
    </div>
  );
}
