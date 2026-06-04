import { motion } from "framer-motion";
import { TrendingUp, Users, FileText, ArrowRight, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { chartColors } from "@/components/charts/theme";

const previewItems = [
  {
    icon: TrendingUp,
    label: "Validation Score",
    value: "78",
    sub: "Market: A- · Team: 72 · Moat: 65",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
  },
  {
    icon: Users,
    label: "Active Ideas",
    value: "4",
    sub: "2 validated · 2 in progress",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
  },
  {
    icon: FileText,
    label: "Reports",
    value: "3",
    sub: "Last updated 2 days ago",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
  },
];

const swotCategories = [
  {
    label: "Strengths",
    items: ["Strong unit economics", "Experienced founding team"],
    iconBg: "bg-emerald-500/10",
    iconDot: "bg-emerald-400",
  },
  {
    label: "Weaknesses",
    items: ["No existing traction", "Narrow moat initially"],
    iconBg: "bg-rose-500/10",
    iconDot: "bg-rose-400",
  },
  {
    label: "Opportunities",
    items: ["Growing market 28% YoY", "Underserved segment"],
    iconBg: "bg-blue-500/10",
    iconDot: "bg-blue-400",
  },
  {
    label: "Threats",
    items: ["Well-funded competitors", "Platform dependency"],
    iconBg: "bg-amber-500/10",
    iconDot: "bg-amber-400",
  },
];

export function DashboardPreview() {
  return (
    <section className="border-b border-border py-24 sm:py-28 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center mb-14"
        >
          <div className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground/60">
            Dashboard
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            A workspace that thinks like a VC.
          </h2>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed">
            Every signal you need — validation scores, competitive intel, market trends — in one
            place. No more jumping between spreadsheets.
          </p>
        </motion.div>

        {/* Main dashboard mockup */}
        <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm shadow-xl overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center gap-2 border-b border-border px-5 py-3">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-rose-500/50" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500/50" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
            </div>
            <div className="ml-3 font-mono text-[11px] text-muted-foreground/60">
              dashboard · overview
            </div>
          </div>

          {/* Dashboard content */}
          <div className="p-6 space-y-6">
            {/* KPI row */}
            <div className="grid sm:grid-cols-3 gap-4">
              {previewItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      {item.label}
                    </span>
                    <div
                      className={cn(
                        "h-8 w-8 rounded-lg grid place-items-center border",
                        item.bgColor,
                        item.borderColor,
                      )}
                    >
                      <item.icon className={cn("h-4 w-4", item.color)} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold tabular-nums tracking-tight">{item.value}</div>
                  <div className="text-xs text-muted-foreground/60 mt-1">{item.sub}</div>
                </motion.div>
              ))}
            </div>

            {/* Bottom section: SWOT + Chart */}
            <div className="grid lg:grid-cols-2 gap-4">
              {/* SWOT cards */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium">SWOT Analysis</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {swotCategories.map((s) => (
                    <div key={s.label} className="rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={cn("h-2 w-2 rounded-full", s.iconDot)} />
                        <span className="text-[11px] font-semibold uppercase tracking-wider">
                          {s.label}
                        </span>
                      </div>
                      <ul className="space-y-1">
                        {s.items.map((item) => (
                          <li
                            key={item}
                            className="text-xs text-muted-foreground flex items-start gap-1.5 leading-relaxed"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart mockup */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium">Validation Trends</h3>
                </div>
                <div className="h-32 flex items-end justify-between gap-2">
                  {[35, 55, 45, 70, 60, 78, 82].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-md transition-all"
                        style={{
                          height: `${h}%`,
                          background: `linear-gradient(180deg, ${chartColors.primary}80, ${chartColors.primary}20)`,
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-muted-foreground/60">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <Link to="/register">
            <Button variant="outline" size="lg" className="h-11 px-6">
              See the full dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
