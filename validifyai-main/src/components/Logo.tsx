import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/**
 * Validify wordmark. Minimal, monogram + name — no glow, no gradient text.
 */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link to="/" className={cn("group flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="grid h-6 w-6 place-items-center rounded-md border border-border bg-card">
        <svg viewBox="0 0 20 20" className="h-3 w-3" aria-hidden="true">
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
      {!compact && <span className="text-sm text-foreground">Validify</span>}
    </Link>
  );
}
