import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link
      to="/"
      className={cn("group flex items-center gap-2.5 font-semibold tracking-tight", className)}
    >
      <span className="grid h-8 w-8 place-items-center rounded-xl border border-border bg-gradient-to-br from-primary/20 to-primary/5 shadow-sm transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-md group-hover:shadow-primary/10">
        <svg viewBox="0 0 20 20" className="h-4 w-4 text-primary" aria-hidden="true">
          <path
            d="M3 4l5 12 4-9 5 9"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {!compact && (
        <span className="text-base text-foreground transition-colors duration-300 group-hover:text-primary">
          Validify
        </span>
      )}
    </Link>
  );
}
