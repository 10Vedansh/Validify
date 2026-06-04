import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this just now. Try again in a moment.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card/30 px-6 py-14 text-center">
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg border border-border bg-card text-destructive">
        <AlertTriangle className="h-4 w-4" />
      </div>
      <div className="text-sm font-medium text-foreground">{title}</div>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground leading-relaxed">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-6" onClick={onRetry}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" /> Retry
        </Button>
      )}
    </div>
  );
}
