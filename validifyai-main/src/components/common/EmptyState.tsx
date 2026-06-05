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
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-card/30 px-6 py-16 text-center",
        className,
      )}
    >
      {Icon && (
        <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 text-muted-foreground shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="text-base font-medium text-foreground">{title}</div>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-7">{action}</div>}
    </div>
  );
}
