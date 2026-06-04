import { createFileRoute, Link } from "@tanstack/react-router";
import {
  TrendingUp,
  BarChart3,
  DollarSign,
  Target,
  Lightbulb,
  Activity,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart } from "@/components/charts/AreaChart";
import { BarChart } from "@/components/charts/BarChart";
import { chartColors } from "@/components/charts/theme";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/trends")({ component: Trends });

/* ───── Static demo data ───── */

const sectorData = [
  {
    name: "AI / ML",
    change: 28,
    funding: 12.4,
    deals: 342,
    color: chartColors.primary,
    icon: Sparkles,
  },
  {
    name: "Fintech",
    change: 22,
    funding: 8.1,
    deals: 218,
    color: chartColors.accent,
    icon: DollarSign,
  },
  {
    name: "Healthtech",
    change: 18,
    funding: 6.3,
    deals: 176,
    color: chartColors.positive,
    icon: Activity,
  },
  { name: "Climate", change: 15, funding: 4.2, deals: 134, color: chartColors.warning, icon: Zap },
];

const fundingByIndustry = [
  { industry: "AI / ML", amount: 12400 },
  { industry: "Fintech", amount: 8100 },
  { industry: "Healthtech", amount: 6300 },
  { industry: "Climate", amount: 4200 },
  { industry: "DevTools", amount: 3500 },
  { industry: "Consumer", amount: 2800 },
  { industry: "Productivity", amount: 1900 },
];

const monthlyDeals = [
  { month: "Jan", deals: 84, funding: 3200 },
  { month: "Feb", deals: 92, funding: 3800 },
  { month: "Mar", deals: 78, funding: 2900 },
  { month: "Apr", deals: 105, funding: 4500 },
  { month: "May", deals: 98, funding: 4100 },
  { month: "Jun", deals: 120, funding: 5200 },
  { month: "Jul", deals: 112, funding: 4800 },
  { month: "Aug", deals: 138, funding: 6100 },
  { month: "Sep", deals: 145, funding: 5800 },
  { month: "Oct", deals: 128, funding: 5400 },
  { month: "Nov", deals: 152, funding: 6700 },
  { month: "Dec", deals: 164, funding: 7200 },
];

const opportunities = [
  {
    title: "AI-Powered Developer Tools",
    industry: "AI / ML",
    score: 92,
    marketSize: "$14.2B",
    growth: "32% YoY",
    description:
      "The rise of AI-assisted coding creates massive demand for dev tools that integrate LLMs into CI/CD, testing, and deployment workflows.",
    color: chartColors.primary,
  },
  {
    title: "Embedded Finance APIs",
    industry: "Fintech",
    score: 88,
    marketSize: "$11.8B",
    growth: "28% YoY",
    description:
      "Non-financial platforms are embedding banking, lending, and insurance products via APIs — a fast-growing distribution channel.",
    color: chartColors.accent,
  },
  {
    title: "Decentralized Clinical Trials",
    industry: "Healthtech",
    score: 85,
    marketSize: "$9.6B",
    growth: "24% YoY",
    description:
      "Remote patient monitoring and virtual trial platforms reduce costs by 40% while improving patient diversity and retention.",
    color: chartColors.positive,
  },
  {
    title: "Carbon Accounting Software",
    industry: "Climate",
    score: 81,
    marketSize: "$6.4B",
    growth: "35% YoY",
    description:
      "Regulatory pressure (SEC, EU CSRD) is driving every public company to measure and report emissions — a compliance necessity.",
    color: chartColors.warning,
  },
  {
    title: "Vertical AI Agents for Legal",
    industry: "AI / ML",
    score: 79,
    marketSize: "$5.1B",
    growth: "40% YoY",
    description:
      "Specialized AI agents handling contract review, e-discovery, and compliance are replacing billable hours at top law firms.",
    color: chartColors.magenta,
  },
];

const trendCards = [
  {
    title: "Generative AI in Enterprise",
    category: "Technology",
    momentum: 96,
    description: "75% of enterprises plan to adopt generative AI by 2026, up from 35% in 2024.",
    related: "AI / ML",
  },
  {
    title: "Buy Now, Pay Later 2.0",
    category: "Fintech",
    momentum: 88,
    description:
      "BNPL is expanding into B2B, travel, and healthcare — projected to reach $1.2T by 2028.",
    related: "Fintech",
  },
  {
    title: "AI-Driven Drug Discovery",
    category: "Biotech",
    momentum: 91,
    description:
      "AI-discovered drugs are entering Phase II trials 60% faster than traditional methods.",
    related: "Healthtech",
  },
  {
    title: "Embedded Insurance",
    category: "Insurtech",
    momentum: 84,
    description:
      "Insurance embedded at point-of-sale across auto, travel, and e-commerce is growing 4x faster than traditional channels.",
    related: "Fintech",
  },
  {
    title: "Carbon Capture Tech",
    category: "Climate",
    momentum: 87,
    description:
      "Direct air capture investment grew 5x in 2025, driven by government tax credits and corporate net-zero commitments.",
    related: "Climate",
  },
  {
    title: "No-Code + AI Platforms",
    category: "Developer Tools",
    momentum: 93,
    description:
      "No-code platforms augmented with AI enable non-developers to build full-stack applications 10x faster.",
    related: "DevTools",
  },
];

const metrics = [
  { label: "Avg Deal Size", value: "$4.2M", change: "+18%", icon: DollarSign, positive: true },
  { label: "Total Market Cap", value: "$342B", change: "+12%", icon: BarChart3, positive: true },
  { label: "Active Investors", value: "1,847", change: "+8%", icon: Search, positive: true },
  { label: "Top Sector Return", value: "AI / ML", change: "+34%", icon: Target, positive: true },
];

/* ───── Components ───── */

function StatCard({
  icon: Icon,
  label,
  value,
  change,
  positive,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {label}
        </span>
        <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 grid place-items-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div className="text-2xl font-bold tabular-nums tracking-tight">{value}</div>
      {change && (
        <div
          className={cn(
            "flex items-center gap-1 mt-1 text-xs",
            positive ? "text-emerald-400" : "text-rose-400",
          )}
        >
          {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {change} vs last quarter
        </div>
      )}
    </div>
  );
}

function SectorCard({
  name,
  change,
  funding,
  deals,
  color,
  icon: Icon,
  index,
}: {
  name: string;
  change: number;
  funding: number;
  deals: number;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="h-9 w-9 rounded-lg grid place-items-center"
            style={{ backgroundColor: `${color}15`, borderColor: `${color}30`, borderWidth: 1 }}
          >
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
          <div>
            <div className="text-sm font-semibold">{name}</div>
            <div className="text-xs text-muted-foreground">{deals} deals this quarter</div>
          </div>
        </div>
        <div
          className={cn(
            "flex items-center gap-1 text-sm font-semibold",
            change >= 20 ? "text-emerald-400" : "text-emerald-400/70",
          )}
        >
          <TrendingUp className="h-3.5 w-3.5" />+{change}%
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs text-muted-foreground">Total Funding</div>
          <div className="text-lg font-bold tabular-nums">${funding}B</div>
        </div>
        <div className="h-8 w-24 rounded-md bg-muted/50 overflow-hidden">
          <div
            className="h-full rounded-md transition-all"
            style={{ width: `${(funding / 15) * 100}%`, backgroundColor: color, opacity: 0.6 }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function OpportunityCard({
  title,
  industry,
  score,
  marketSize,
  growth,
  description,
  color,
  index,
}: {
  title: string;
  industry: string;
  score: number;
  marketSize: string;
  growth: string;
  description: string;
  color: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <Badge variant="outline" className="text-[11px]">
          {industry}
        </Badge>
        <div className="flex items-center gap-1 tabular-nums" style={{ color }}>
          <Zap className="h-3.5 w-3.5 fill-current" />
          <span className="text-sm font-bold">{score}</span>
        </div>
      </div>
      <h3 className="font-semibold text-sm mb-2">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">
        {description}
      </p>
      <div className="flex items-center gap-4 text-xs">
        <div>
          <span className="text-muted-foreground">Market: </span>
          <span className="font-medium tabular-nums">{marketSize}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Growth: </span>
          <span className="font-medium text-emerald-400 tabular-nums">{growth}</span>
        </div>
      </div>
      <div className="mt-3 h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </motion.div>
  );
}

function TrendCard({
  title,
  category,
  momentum,
  description,
  related,
  index,
}: {
  title: string;
  category: string;
  momentum: number;
  description: string;
  related: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="min-w-[280px] rounded-xl border border-border bg-card p-5 shrink-0 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <Badge variant="outline" className="text-[11px]">
          {category}
        </Badge>
        <div className="flex items-center gap-1">
          <Activity className="h-3 w-3 text-primary" />
          <span
            className="text-xs font-semibold tabular-nums"
            style={{ color: momentum >= 90 ? chartColors.primary : chartColors.positive }}
          >
            {momentum}%
          </span>
        </div>
      </div>
      <h3 className="font-semibold text-sm mb-2">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{description}</p>
      <div className="mt-3 text-[11px] text-muted-foreground/60">Related: {related}</div>
    </motion.div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  );
}

/* ───── Main Page ───── */

function Trends() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Market Trends</h1>
          <p className="text-sm text-muted-foreground">
            Where capital, talent, and attention are flowing right now.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Data updated Dec 2025</span>
          <div className="h-2 w-2 rounded-full bg-emerald-400/70" />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <StatCard {...m} />
          </motion.div>
        ))}
      </div>

      {/* Trending Sectors */}
      <section>
        <SectionHeader
          title="Trending Sectors"
          subtitle="Highest growth sectors this quarter by deal activity and funding volume"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sectorData.map((s, i) => (
            <SectorCard key={s.name} {...s} index={i} />
          ))}
        </div>
      </section>

      {/* Charts Row */}
      <section>
        <SectionHeader
          title="Funding & Deal Activity"
          subtitle="Investment trends across sectors and time"
        />
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Funding by Industry</h3>
              <DollarSign className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <BarChart
              data={fundingByIndustry}
              xKey="industry"
              yKey="amount"
              height={240}
              color={chartColors.primary}
            />
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Monthly Deal Count</h3>
              <Activity className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <AreaChart
              data={monthlyDeals as unknown as Record<string, unknown>[]}
              xKey="month"
              series={[{ key: "deals", label: "Deals", color: chartColors.accent }]}
              height={240}
            />
          </div>
        </div>
      </section>

      {/* Startup Opportunities */}
      <section>
        <SectionHeader
          title="Startup Opportunities"
          subtitle="High-potential areas identified by market signals"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities.slice(0, 3).map((o, i) => (
            <OpportunityCard key={o.title} {...o} index={i} />
          ))}
        </div>
        {opportunities.length > 3 && (
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            {opportunities.slice(3).map((o, i) => (
              <OpportunityCard key={o.title} {...o} index={i + 3} />
            ))}
          </div>
        )}
      </section>

      {/* Trend Cards */}
      <section>
        <SectionHeader
          title="Emerging Trends"
          subtitle="What's gaining momentum across industries right now"
        />
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
          {trendCards.map((t, i) => (
            <TrendCard key={t.title} {...t} index={i} />
          ))}
        </div>
      </section>

      {/* Bottom CTA for validated users */}
      <div className="rounded-xl border border-border bg-card/50 p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 grid place-items-center shrink-0">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Get personalized trend insights</p>
            <p className="text-xs text-muted-foreground">
              Your validated ideas unlock tailored market analysis and competitor benchmarks.
            </p>
          </div>
        </div>
        <Link to="/dashboard/validate">
          <Button variant="outline" size="sm">
            Validate an idea
          </Button>
        </Link>
      </div>
    </div>
  );
}
