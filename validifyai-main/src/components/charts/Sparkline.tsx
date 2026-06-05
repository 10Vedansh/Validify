import { cn } from "@/lib/utils";

type SparklineProps = {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  gradient?: boolean;
  className?: string;
};

export function Sparkline({
  data,
  width = 80,
  height = 28,
  color = "oklch(0.65 0.22 280 / 0.6)",
  strokeWidth = 1.5,
  gradient = true,
  className,
}: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const padding = 2;
  const w = width - padding * 2;
  const h = height - padding * 2;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * w;
    const y = padding + h - ((v - min) / range) * h;
    return `${x},${y}`;
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p}`).join(" ");

  return (
    <svg width={width} height={height} className={cn("shrink-0", className)} aria-hidden="true">
      {gradient && (
        <defs>
          <linearGradient id={`s-${data[0]}-${data[data.length-1]}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      {gradient && (
        <path
          d={`${pathD}L${padding + w},${padding + h}L${padding},${padding + h}Z`}
          fill={`url(#s-${data[0]}-${data[data.length-1]})`}
        />
      )}
      <path d={pathD} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TrendBadge({ value, className }: { value: number; className?: string }) {
  const isUp = value >= 0;
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 font-mono text-[11px]",
      isUp ? "text-emerald-400" : "text-rose-400",
      className,
    )}>
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
        <path d={isUp ? "M1 6L4 2L7 6" : "M1 2L4 6L7 2"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {Math.abs(value)}%
    </span>
  );
}

export function BenchmarkChip({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border/50 bg-background/50 px-2 py-0.5 text-[11px] text-muted-foreground">
      <span className="text-foreground/70 font-medium">{label}</span>
      <span>{value}</span>
    </span>
  );
}
