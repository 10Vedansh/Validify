export function LoadingScreen({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-muted-foreground">
      <div className="relative">
        <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
      {label && <span className="text-sm text-muted-foreground/60 animate-pulse">{label}</span>}
    </div>
  );
}
