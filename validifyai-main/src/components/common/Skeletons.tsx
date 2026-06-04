import { Skeleton } from "@/components/ui/skeleton";

export function WidgetSkeleton({ height = "h-72" }: { height?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-2 h-5 w-48" />
      <Skeleton className={`mt-5 w-full ${height}`} />
    </div>
  );
}

export function RowSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-3">
          <Skeleton className="h-9 w-9 rounded-md" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/5" />
          </div>
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  );
}
