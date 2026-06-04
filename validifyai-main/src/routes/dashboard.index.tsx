import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Lightbulb,
  Gauge,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Inbox,
  BarChart3,
  Layers,
  Brain,
  Activity,
  ChevronRight,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState, useMemo } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { ideasService } from "@/services/ideas.service";
import { reportsService } from "@/services/reports.service";
import { Badge } from "@/components/ui/badge";
import { AreaChart } from "@/components/charts/AreaChart";
import { WidgetSkeleton, RowSkeleton } from "@/components/common/Skeletons";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/dashboard/")({ component: Dashboard });

function AnimatedCounter({
  value,
  duration = 800,
  suffix = "",
}: {
  value: number;
  duration?: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const start = prev.current;
    const end = value;
    const startTime = performance.now();

    if (start === end) {
      setDisplay(end);
      return;
    }

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplay(current);
      if (progress < 1) requestAnimationFrame(animate);
      else prev.current = end;
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

function groupByMonth(dates: string[]) {
  const map = new Map<string, number>();
  for (const d of dates) {
    const key = d.slice(0, 7);
    map.set(key, (map.get(key) || 0) + 1);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, validations: count }));
}

function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const map: Record<string, T[]> = {};
  for (const item of items) {
    const key = keyFn(item);
    (map[key] ??= []).push(item);
  }
  return map;
}

function getDelta(current: number, previous: number): string | undefined {
  if (previous === 0) return undefined;
  const diff = current - previous;
  const sign = diff >= 0 ? "+" : "";
  return `${sign}${diff}`;
}

function Dashboard() {
  const { user } = useAuth();

  const { data: ideas = [], isLoading: ideasLoading } = useQuery({
    queryKey: ["ideas"],
    queryFn: () => ideasService.list(),
  });

  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: () => reportsService.list(),
  });

  const isLoading = ideasLoading || reportsLoading;

  const totalIdeas = ideas.length;
  const validationsDone = reports.length;
  const avgScore =
    reports.length > 0
      ? Math.round(reports.reduce((sum, r) => sum + r.score.overall, 0) / reports.length)
      : 0;
  const topScore = reports.length > 0 ? Math.max(...reports.map((r) => r.score.overall)) : 0;
  const hasData = ideas.length > 0 || reports.length > 0;

  const trendsData = useMemo(() => groupByMonth(reports.map((r) => r.createdAt)), [reports]);

  const portfolioByIndustry = useMemo(() => groupBy(ideas, (i) => i.industry), [ideas]);

  const recentActivity = useMemo(() => {
    const items: {
      type: "idea" | "report";
      label: string;
      date: string;
      id: string;
      score?: number;
    }[] = [];
    for (const idea of ideas) {
      items.push({ type: "idea", label: idea.name, date: idea.createdAt, id: idea.id });
    }
    for (const report of reports) {
      items.push({
        type: "report",
        label: report.title,
        date: report.createdAt,
        id: report.id,
        score: report.score.overall,
      });
    }
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return items.slice(0, 8);
  }, [ideas, reports]);

  const insights = useMemo(() => {
    if (reports.length === 0) return [];
    return reports
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
      .flatMap((r) =>
        r.swot.strengths
          .slice(0, 2)
          .map((s) => ({ insight: s, reportId: r.id, reportTitle: r.title })),
      )
      .slice(0, 5);
  }, [reports]);

  const trendDelta = useMemo(() => {
    if (trendsData.length < 2) return undefined;
    const current = trendsData[trendsData.length - 1].validations;
    const prev = trendsData[trendsData.length - 2].validations;
    return getDelta(current, prev);
  }, [trendsData]);

  const ideasDelta = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recent = ideas.filter((i) => new Date(i.createdAt) >= weekAgo).length;
    return recent > 0 ? `+${recent}` : undefined;
  }, [ideas]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-64 shimmer rounded-lg" />
          <div className="mt-2 h-5 w-96 shimmer rounded-lg" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <WidgetSkeleton key={i} height="h-24" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <WidgetSkeleton height="h-64" />
          </div>
          <WidgetSkeleton height="h-64" />
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <RowSkeleton rows={5} />
          </div>
          <RowSkeleton rows={4} />
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight">
              Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              Start validating your first idea to see insights here.
            </p>
          </div>
          <Link
            to="/dashboard/validate"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            New validation <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-border bg-card">
            <Inbox className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">No ideas yet</h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground leading-relaxed">
            Submit your first idea for AI validation and your dashboard will populate with scores,
            reports, and recommendations.
          </p>
          <Link to="/dashboard/validate" className="mt-6">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <span className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium shadow-sm">
                <Sparkles className="h-4 w-4" />
                Validate your first idea
              </span>
            </motion.div>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Overview
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-[28px]">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground leading-relaxed">
            Here's what's happening across your portfolio of ideas.
          </p>
        </div>
        <Link to="/dashboard/validate">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <span className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              New validation
            </span>
          </motion.div>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          {
            icon: Lightbulb,
            label: "Total Ideas",
            value: String(totalIdeas),
            accent: ideasDelta ? `${ideasDelta} this week` : undefined,
          },
          {
            icon: Gauge,
            label: "Avg Validation Score",
            value: avgScore ? String(avgScore) : "—",
            accent: avgScore ? `out of 100` : undefined,
            delta: trendDelta,
          },
          {
            icon: TrendingUp,
            label: "Reports Generated",
            value: String(validationsDone),
            delta: trendDelta,
          },
          {
            icon: Target,
            label: "Top Score",
            value: topScore ? String(topScore) : "—",
            accent: topScore ? "best performance" : undefined,
          },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
          >
            <StatCard
              icon={s.icon}
              label={s.label}
              value={s.value !== "—" ? <AnimatedCounter value={Number(s.value)} /> : "—"}
              delta={s.delta}
              accent={s.accent}
            />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.35 }}
        className="grid lg:grid-cols-3 gap-4"
      >
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Validation Trends
            </div>
            {trendsData.length > 0 && (
              <Badge variant="outline" className="text-muted-foreground">
                {reports.length} total
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-4">Validations completed over time</p>
          {trendsData.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              No data yet
            </div>
          ) : (
            <AreaChart
              data={trendsData}
              xKey="month"
              series={[{ key: "validations", label: "Validations" }]}
              height={200}
            />
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-1">
            <Layers className="h-4 w-4 text-muted-foreground" />
            Portfolio Summary
          </div>
          <p className="text-xs text-muted-foreground mb-4">Ideas by industry</p>
          {ideas.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              No ideas yet
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(portfolioByIndustry)
                .sort(([, a], [, b]) => b.length - a.length)
                .map(([industry, items]) => {
                  const pct = Math.round((items.length / ideas.length) * 100);
                  return (
                    <div key={industry}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-foreground">{industry}</span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {items.length}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/60 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              <div className="pt-2 text-xs text-muted-foreground">
                {ideas.length} idea{ideas.length !== 1 ? "s" : ""} across{" "}
                {Object.keys(portfolioByIndustry).length} industr
                {Object.keys(portfolioByIndustry).length !== 1 ? "ies" : "y"}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.35 }}
        className="grid lg:grid-cols-3 gap-4"
      >
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Recent Activity
            </div>
            {recentActivity.length > 0 && (
              <Badge variant="outline" className="text-muted-foreground">
                {recentActivity.length} events
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-4">Latest actions across your workspace</p>
          {recentActivity.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              No activity yet
            </div>
          ) : (
            <div className="space-y-1">
              {recentActivity.map((item, i) => (
                <div
                  key={`${item.type}-${item.id}-${i}`}
                  className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-accent/30"
                >
                  <div
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-lg border",
                      item.type === "idea"
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
                    )}
                  >
                    {item.type === "idea" ? (
                      <Lightbulb className="h-3.5 w-3.5" />
                    ) : (
                      <BarChart3 className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate text-foreground">
                      {item.type === "idea" ? "New idea: " : "Report: "}
                      {item.label}
                    </div>
                    <div className="text-xs text-muted-foreground">{formatDate(item.date)}</div>
                  </div>
                  {item.score !== undefined && (
                    <Badge variant={item.score >= 70 ? "success" : "outline"} className="shrink-0">
                      {item.score}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-1">
            <Brain className="h-4 w-4 text-muted-foreground" />
            AI Insights
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Key strengths from your latest reports
          </p>
          {insights.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              No insights yet
            </div>
          ) : (
            <div className="space-y-3">
              {insights.map((item, i) => (
                <Link
                  key={`${item.reportId}-${i}`}
                  to="/dashboard/reports"
                  className="group block rounded-lg border border-border/50 bg-background/50 p-3 transition-all hover:border-border hover:bg-accent/20"
                >
                  <p className="text-sm text-foreground leading-relaxed line-clamp-2">
                    {item.insight}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    <span className="truncate">{item.reportTitle}</span>
                    <ChevronRight className="h-3 w-3 shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
