import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { reportsService } from "@/services/reports.service";
import {
  FileText,
  Download,
  Share2,
  AlertTriangle,
  ShieldCheck,
  Lightbulb,
  TrendingUp,
  ArrowLeft,
  Inbox,
  Loader2,
  Target,
  BarChart3,
  DollarSign,
  Radar as RadarIcon,
  MapPin,
  CheckCircle2,
  Users,
  Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { chartColors, chartTooltip } from "@/components/charts/theme";
import type { ComponentType, ReactNode } from "react";

export const Route = createFileRoute("/dashboard/reports")({ component: Reports });

function ScoreGauge({ value, size = 120 }: { value: number; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - 16) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - value / 100);
  const strokeWidth = 8;

  const color =
    value >= 80 ? chartColors.positive : value >= 60 ? chartColors.primary : chartColors.warning;

  return (
    <svg width={size} height={size} className="shrink-0">
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="oklch(1 0 0 / 0.06)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cy})`}
        className="transition-all duration-700"
      />
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fill="oklch(0.97 0.003 250)"
        fontSize={28}
        fontWeight={700}
      >
        {value}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="oklch(0.60 0.012 260)" fontSize={11}>
        / 100
      </text>
    </svg>
  );
}

function KPICard({
  label,
  value,
  sub,
  icon: Icon,
  className,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
      </div>
      <div className="text-2xl font-semibold tracking-tight text-foreground">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function ScoreBar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const pct = Math.round((value / max) * 100);
  const color =
    pct >= 80
      ? "bg-emerald-500"
      : pct >= 60
        ? "bg-primary"
        : pct >= 40
          ? "bg-amber-500"
          : "bg-destructive";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground">{label}</span>
        <span className="text-muted-foreground tabular-nums">
          {value}/{max}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        </div>
      </div>
      {children}
    </div>
  );
}

function Reports() {
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: () => reportsService.list(),
  });

  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading report&hellip;</span>
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Reports
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-[28px]">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            AI-generated validation reports for your ideas.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-border bg-card">
            <Inbox className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">No reports yet</h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground leading-relaxed">
            Validate an idea to generate an investor-grade report.
          </p>
          <Link to="/dashboard/validate" className="mt-6">
            <span className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium shadow-sm">
              <Lightbulb className="h-4 w-4" />
              Validate an idea
            </span>
          </Link>
        </div>
      </div>
    );
  }

  const report = reports[0];

  const radarData = [
    { axis: "Market", v: report.score.market },
    { axis: "Team", v: report.score.team },
    { axis: "Moat", v: report.score.moat },
    { axis: "Monetization", v: report.score.monetization },
    { axis: "Traction", v: report.score.traction },
    { axis: "Risk", v: report.score.risk },
  ];

  const competitorChartData = report.competitors?.length
    ? report.competitors
        .sort((a, b) => b.score - a.score)
        .map((c) => ({ name: c.name, score: c.score }))
    : [];

  const scoreDims = [
    { key: "Market", value: report.score.market, icon: BarChart3 },
    { key: "Team", value: report.score.team, icon: Users },
    { key: "Moat", value: report.score.moat, icon: ShieldCheck },
    { key: "Monetization", value: report.score.monetization, icon: DollarSign },
    { key: "Traction", value: report.score.traction, icon: TrendingUp },
    { key: "Risk", value: report.score.risk, icon: RadarIcon },
  ];

  const swotSections = report.swot
    ? [
        { icon: ShieldCheck, title: "Strengths", tone: "chart-3", items: report.swot.strengths },
        {
          icon: AlertTriangle,
          title: "Weaknesses",
          tone: "chart-4",
          items: report.swot.weaknesses,
        },
        {
          icon: Lightbulb,
          title: "Opportunities",
          tone: "chart-2",
          items: report.swot.opportunities,
        },
        { icon: TrendingUp, title: "Threats", tone: "chart-5", items: report.swot.threats },
      ]
    : [];

  const toneColors: Record<string, string> = {
    "chart-3": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    "chart-4": "text-amber-400 bg-amber-500/10 border-amber-500/20",
    "chart-2": "text-sky-400 bg-sky-500/10 border-sky-500/20",
    "chart-5": "text-purple-400 bg-purple-500/10 border-purple-500/20",
  };

  const barColors = [
    "oklch(0.68 0.18 268)",
    "oklch(0.64 0.14 230)",
    "oklch(0.70 0.14 175)",
    "oklch(0.76 0.12 90)",
    "oklch(0.60 0.16 310)",
  ];

  return (
    <div className="space-y-8">
      <div>
        <button
          onClick={() => navigate({ to: "/dashboard" })}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="h-3 w-3" /> Back to dashboard
        </button>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Report &middot; #{report.id.slice(0, 8).toUpperCase()}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-[28px]">
              {report.title}
            </h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="text-muted-foreground">
                {report.industry}
              </Badge>
              <Badge variant={report.score.overall >= 60 ? "success" : "outline"}>
                Score {report.score.overall}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => reportsService.exportPdf(report.id)}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" /> PDF
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              <FileText className="mr-1.5 h-3.5 w-3.5" /> PPT
            </Button>
            <Button size="sm" className="h-8 shadow-sm">
              <Share2 className="mr-1.5 h-3.5 w-3.5" /> Share
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[auto_1fr] gap-6">
        <div className="flex flex-col items-center rounded-xl border border-border bg-card p-6 min-w-[140px]">
          <ScoreGauge value={report.score.overall} size={130} />
          <div className="mt-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-center">
            Overall Score
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {scoreDims.map((d) => (
            <KPICard key={d.key} label={d.key} value={d.value} icon={d.icon} />
          ))}
        </div>
      </div>

      {report.summary && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SectionCard icon={FileText} title="Executive Summary">
            <p className="text-sm text-muted-foreground leading-relaxed">{report.summary}</p>
          </SectionCard>
        </motion.div>
      )}

      {report.swot && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">SWOT Analysis</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {swotSections.map((s) => {
              const tc = toneColors[s.tone] ?? toneColors["chart-3"];
              return (
                <div key={s.title} className="rounded-xl border border-border bg-card p-5">
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium mb-3 ${tc}`}
                  >
                    <s.icon className="h-3 w-3" />
                    {s.title}
                  </div>
                  <ul className="space-y-2">
                    {(s.items as string[]).map((item) => (
                      <li
                        key={item}
                        className="flex gap-2 text-sm text-muted-foreground leading-relaxed"
                      >
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <SectionCard icon={BarChart3} title="Market Opportunity">
            <div className="flex items-center gap-6">
              <ScoreGauge value={report.score.market} size={96} />
              <div className="flex-1 space-y-3">
                <ScoreBar label="Market Size Potential" value={report.score.market} />
                <ScoreBar
                  label="Growth Trajectory"
                  value={Math.min(100, report.score.market + 5)}
                />
                <ScoreBar label="Entry Timing" value={Math.min(100, report.score.market + 10)} />
              </div>
            </div>
          </SectionCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          <SectionCard icon={DollarSign} title="Monetization Potential">
            <div className="flex items-center gap-6">
              <ScoreGauge value={report.score.monetization} size={96} />
              <div className="flex-1 space-y-3">
                <ScoreBar label="Revenue Model Viability" value={report.score.monetization} />
                <ScoreBar
                  label="Pricing Strategy"
                  value={Math.min(100, report.score.monetization - 5)}
                />
                <ScoreBar
                  label="Unit Economics"
                  value={Math.min(100, report.score.monetization + 8)}
                />
              </div>
            </div>
          </SectionCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <SectionCard icon={RadarIcon} title="Risk Assessment">
            <div className="flex items-center gap-6">
              <ScoreGauge value={report.score.risk} size={96} />
              <div className="flex-1 space-y-3">
                <ScoreBar label="Risk Level" value={report.score.risk} />
                <ScoreBar label="Competitive Moat" value={report.score.moat} />
                <ScoreBar
                  label="Execution Risk"
                  value={Math.max(0, Math.min(100, report.score.risk - 15))}
                />
              </div>
            </div>
          </SectionCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
        >
          <SectionCard icon={Users} title="Team &amp; Traction">
            <div className="flex items-center gap-6">
              <ScoreGauge value={report.score.traction} size={96} />
              <div className="flex-1 space-y-3">
                <ScoreBar label="Team Score" value={report.score.team} />
                <ScoreBar label="Traction Score" value={report.score.traction} />
                <ScoreBar label="Moat Score" value={report.score.moat} />
              </div>
            </div>
          </SectionCard>
        </motion.div>
      </div>

      {report.competitors && report.competitors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <SectionCard icon={Target} title="Competitor Analysis">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                {report.competitors
                  .sort((a, b) => b.score - a.score)
                  .map((c, i) => (
                    <div
                      key={c.name}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-[11px] font-semibold text-primary">
                          {i + 1}
                        </div>
                        <div>
                          <div className="text-sm text-foreground">{c.name}</div>
                          {c.url && (
                            <div className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                              {c.url}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={c.score >= 70 ? "success" : c.score >= 50 ? "warning" : "outline"}
                        className="tabular-nums"
                      >
                        {c.score}
                      </Badge>
                    </div>
                  ))}
              </div>
              <div className="h-56">
                <ResponsiveContainer>
                  <BarChart
                    data={competitorChartData}
                    margin={{ top: 6, right: 6, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={chartColors.grid}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      stroke={chartColors.axis}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      stroke={chartColors.axis}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      width={32}
                      domain={[0, 100]}
                    />
                    <Tooltip contentStyle={chartTooltip} cursor={{ fill: chartColors.grid }} />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={32}>
                      {competitorChartData.map((_, i) => (
                        <Cell key={i} fill={barColors[i % barColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </SectionCard>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.3 }}
      >
        <SectionCard icon={Gauge} title="Investor Verdict">
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 flex flex-col items-center justify-center">
              <ScoreGauge value={report.score.overall} size={140} />
              <div className="mt-3 text-center">
                <div className="text-sm font-semibold text-foreground">
                  {report.score.overall >= 80
                    ? "Strong Invest"
                    : report.score.overall >= 60
                      ? "Proceed with Caution"
                      : report.score.overall >= 40
                        ? "Needs Improvement"
                        : "High Risk"}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {report.score.overall >= 80
                    ? "Meets seed-stage benchmarks"
                    : report.score.overall >= 60
                      ? "Shows promise, address gaps"
                      : report.score.overall >= 40
                        ? "Significant work required"
                        : "Major pivots recommended"}
                </div>
              </div>
            </div>
            <div className="lg:col-span-3 space-y-4">
              <div className="rounded-lg border border-border/50 bg-background/50 p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  Dimension Breakdown
                </div>
                <div className="space-y-2.5">
                  {scoreDims.map((d) => (
                    <ScoreBar key={d.key} label={d.key} value={d.value} />
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-border/50 bg-background/50 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Report generated &middot;{" "}
                  {new Date(report.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </motion.div>

      {report.roadmap && report.roadmap.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <SectionCard icon={MapPin} title="Roadmap">
            <div className="relative">
              <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />
              <div className="space-y-6">
                {report.roadmap.map((m, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card">
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    </div>
                    <div className="pt-1.5">
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 text-muted-foreground mb-1"
                      >
                        {m.quarter}
                      </Badge>
                      <div className="text-sm text-foreground">{m.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </motion.div>
      )}

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Report ID: {report.id} &middot; Created{" "}
            {new Date(report.createdAt).toLocaleDateString()}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => reportsService.exportPdf(report.id)}
          >
            <Download className="mr-1 h-3 w-3" /> Export PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
