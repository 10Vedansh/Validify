import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function WidgetSkeleton({ height = "h-72" }: { height?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <Skeleton className="h-4 w-32 rounded-md" />
      <Skeleton className="mt-3 h-5 w-48 rounded-md" />
      <Skeleton className={cn("mt-6 w-full rounded-lg", height)} />
    </div>
  );
}

export function RowSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5"
        >
          <Skeleton className="h-9 w-9 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3 rounded-md" />
            <Skeleton className="h-3 w-1/5 rounded-md" />
          </div>
          <Skeleton className="h-3 w-12 rounded-md" />
        </div>
      ))}
    </div>
  );
}
