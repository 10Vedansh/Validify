import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-card/30 px-6 py-14 text-center",
        className,
      )}
    >
      {Icon && (
        <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg border border-border bg-card text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className="text-sm font-medium text-foreground">{title}</div>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
