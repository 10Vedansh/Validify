import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Gauge, TrendingUp, ShieldCheck, BarChart3, AlertTriangle, Sparkles,
  ArrowUpRight, ChevronRight, DollarSign, Users, Target, Lightbulb,
  Download, Share2, FileText, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { staggerContainer, fadeUp, ease } from "@/lib/motion";
import { Sparkline, TrendBadge, BenchmarkChip } from "@/components/charts/Sparkline";

export const Route = createFileRoute("/dashboard/readiness")({ component: InvestorReadiness });

const metrics = [
  { key: "validation", label: "Validation Score", value: 74, max: 100, change: 8, icon: Gauge },
  { key: "fundability", label: "Fundability Score", value: 68, max: 100, change: 3, icon: DollarSign },
  { key: "pitch", label: "Pitch Readiness", value: 71, max: 100, change: 12, icon: FileText },
  { key: "confidence", label: "Market Confidence", value: 76, max: 100, change: 5, icon: TrendingUp },
  { key: "risk", label: "Execution Risk", value: 65, max: 100, change: -4, icon: ShieldCheck },
];

const weaknesses = [
  { area: "Traction", score: 58, impact: "high", insight: "No customer validation data. Investors expect at least letters of intent." },
  { area: "Team", score: 62, impact: "high", insight: "Missing technical co-founder or domain advisor." },
  { area: "Moat", score: 65, impact: "medium", insight: "Differentiation needs sharper articulation for competitive positioning." },
];

const investorTypes = [
  { type: "Angel / Seed VC", match: "92%", reason: "Your stage and traction align well with seed investors who focus on team & vision." },
  { type: "Venture Capital", match: "67%", reason: "Series A funds typically want more revenue traction than you currently show." },
  { type: "Grant / Non-dilutive", match: "85%", reason: "Your industry has strong grant funding available. Strong recommendation." },
];

const milestones = [
  { title: "3 paid pilots", impact: "+15 fundability", timeframe: "2-3 months", priority: "high" },
  { title: "Technical co-founder onboarded", impact: "+10 fundability", timeframe: "1-2 months", priority: "high" },
  { title: "Competitive moat whitepaper", impact: "+8 fundability", timeframe: "1 month", priority: "medium" },
];

function GaugeMeter({ value, max, size = 100 }: { value: number; max: number; size?: number }) {
  const pct = (value / max) * 100;
  const r = (size - 16) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct / 100);
  return (
    <svg width={size} height={size / 2 + 8} viewBox={`0 0 ${size} ${size / 2 + 8}`}>
      <path
        d={`M 8 ${size / 2 + 4} A ${r} ${r} 0 0 1 ${size - 8} ${size / 2 + 4}`}
        fill="none" stroke="oklch(1 0 0 / 0.06)" strokeWidth={8} strokeLinecap="round"
      />
      <motion.path
        d={`M 8 ${size / 2 + 4} A ${r} ${r} 0 0 1 ${size - 8} ${size / 2 + 4}`}
        fill="none"
        stroke={pct >= 80 ? "#34d399" : pct >= 60 ? "oklch(0.65 0.22 280 / 0.8)" : "#fbbf24"}
        strokeWidth={8} strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease }}
        strokeDashoffset={circumference - (circumference * pct) / 200}
        style={{ strokeDashoffset: circumference - (circumference * pct) / 200 }}
      />
      <text x={size / 2} y={size / 2 - 4} textAnchor="middle" fill="oklch(0.97 0.003 250)" fontSize={22} fontWeight={700}>
        {value}
      </text>
      <text x={size / 2} y={size / 2 + 16} textAnchor="middle" fill="oklch(0.60 0.012 260)" fontSize={9}>
        / {max}
      </text>
    </svg>
  );
}

function InvestorReadiness() {
  return (
    <motion.div className="space-y-8" initial="hidden" animate="visible" variants={staggerContainer}>
      {/* Header */}
      <motion.div variants={fadeUp}>
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground/60">
          Investor Readiness
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-[28px]">Investor Readiness Center</h1>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          Real-time assessment of how investor-ready your startup is, with actionable recommendations.
        </p>
      </motion.div>

      {/* Score cards */}
      <motion.div variants={fadeUp} className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.key} className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{m.label}</span>
                <Icon className="h-3.5 w-3.5 text-muted-foreground/60" />
              </div>
              <div className="text-2xl font-semibold tracking-tight">{m.value}<span className="text-sm text-muted-foreground font-normal">/{m.max}</span></div>
              <TrendBadge value={m.change} />
              <Sparkline data={[Math.max(30, m.value - 15), Math.max(35, m.value - 10), Math.max(40, m.value - 8), Math.max(50, m.value - 5), m.value]} className="mt-2" />
            </div>
          );
        })}
      </motion.div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weaknesses */}
        <motion.div variants={fadeUp} className="lg:col-span-1 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-semibold">Top Weaknesses Before Pitching</h2>
          </div>
          <div className="space-y-3">
            {weaknesses.map((w) => (
              <div key={w.area} className="rounded-lg border border-border/50 bg-background/50 p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-foreground">{w.area}</span>
                  <Badge variant={w.impact === "high" ? "destructive" : "warning"} className="text-[10px] px-1.5 py-0">
                    {w.impact} impact
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{w.insight}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Investor types + Milestones */}
        <motion.div variants={fadeUp} className="lg:col-span-2 space-y-6">
          {/* Investor fit */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Most Attractive Investor Types</h2>
            </div>
            <div className="space-y-3">
              {investorTypes.map((inv) => (
                <div key={inv.type} className="flex items-start gap-4 rounded-lg border border-border/50 bg-background/50 p-3.5">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-lg font-semibold text-foreground tabular-nums">{inv.match}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Match</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{inv.type}</div>
                    <p className="text-xs text-muted-foreground mt-0.5">{inv.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-semibold">Recommended Next Milestones</h2>
              </div>
              <Badge variant="outline" className="text-[10px]">Prioritized by impact</Badge>
            </div>
            <div className="space-y-3">
              {milestones.map((m) => (
                <div key={m.title} className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-foreground">{m.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{m.timeframe}</span>
                      <span className="text-[10px] text-muted-foreground/40">&middot;</span>
                      <span className="text-xs text-emerald-400">{m.impact}</span>
                    </div>
                  </div>
                  <Badge variant={m.priority === "high" ? "default" : "outline"} className="text-[10px] px-1.5 py-0 ml-3">
                    {m.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action area */}
      <motion.div variants={fadeUp} className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-transparent p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 border border-primary/20">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Want a complete investor package?</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Generate a pitch deck, investor summary, and financial model based on your readiness data.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Download className="mr-1.5 h-3.5 w-3.5" /> Download Report</Button>
            <Button size="sm"><FileText className="mr-1.5 h-3.5 w-3.5" /> Build Pitch Deck</Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
