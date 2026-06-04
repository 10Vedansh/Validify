import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FileText, BarChart3, Presentation, TrendingUp, Check } from "lucide-react";

function ScoreCard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30, y: -20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="absolute -top-6 right-4 z-30 w-56 rounded-xl border border-border/30 bg-card shadow-xl"
    >
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wide">Validation Score</span>
          <Check className="h-3 w-3 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-semibold tracking-tight text-emerald-400">78</span>
          <span className="text-sm text-muted-foreground/40">/100</span>
        </div>
        <div className="space-y-1.5">
          {[
            { label: "Market Potential", value: "A-", pct: 72, color: "bg-primary/60" },
            { label: "Investor Readiness", value: "65", pct: 65, color: "bg-amber-400/50" },
          ].map((bar) => (
            <div key={bar.label}>
              <div className="flex justify-between text-[10px] text-muted-foreground/40 mb-0.5">
                <span>{bar.label}</span>
                <span className="font-medium">{bar.value}</span>
              </div>
              <div className="h-1 rounded-full bg-muted/30 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${bar.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${bar.pct}%` }}
                  transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function SWOTCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-64 rounded-xl border border-border/30 bg-card shadow-lg"
    >
      <div className="p-4 space-y-3">
        <div className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wide mb-3">SWOT Analysis</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Strengths", items: "Strong team, clear PMF", color: "text-emerald-400" },
            { label: "Weaknesses", items: "Early traction, high burn", color: "text-rose-400" },
            { label: "Opportunities", items: "Expanding TAM, low sat.", color: "text-primary" },
            { label: "Threats", items: "Well-funded competitors", color: "text-amber-400" },
          ].map((q) => (
            <div key={q.label} className="rounded-lg bg-muted/10 border border-border/10 p-2.5">
              <div className={`text-[10px] font-semibold ${q.color} mb-0.5`}>{q.label}</div>
              <div className="text-[10px] text-muted-foreground/50 leading-tight">{q.items}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function DeckCard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="absolute -bottom-6 left-4 z-30 w-52 rounded-xl border border-border/30 bg-card shadow-xl"
    >
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wide">Pitch Deck</span>
          <Presentation className="h-3 w-3 text-amber-400" />
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="flex-1 h-10 rounded-lg bg-muted/20 border border-border/15 flex items-center justify-center"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.06 }}
            >
              <span className="text-[9px] text-muted-foreground/30">0{i}</span>
            </motion.div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/40">
          <TrendingUp className="h-3 w-3" />
          <span>10 slides · investor-ready</span>
        </div>
      </div>
    </motion.div>
  );
}

const showcaseVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const glowVariants = {
  animate: {
    opacity: [0.3, 0.5, 0.3],
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
  },
};

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.2fr]">
      {/* Left Panel — Form */}
      <div className="relative flex flex-col px-8 py-10 sm:px-14 lg:px-16 overflow-y-auto">
        {/* Gradient glow top-left */}
        <div className="absolute -top-32 -left-32 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

        <div className="relative z-10">
          {/* Logo area */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2.5"
          >
            <div className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-card shadow-sm">
              <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M3 4l5 12 4-9 5 9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">Validify</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-1.5 text-xs text-muted-foreground/40 tracking-wide"
          >
            From napkin sketch to boardroom deck.
          </motion.p>

          <div className="mt-16 sm:mt-20 mb-8">
            {/* Title + subtitle */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="text-2xl font-semibold tracking-tight"
            >
              {title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mt-1.5 text-sm text-muted-foreground/60 leading-relaxed"
            >
              {subtitle}
            </motion.p>

            <motion.div
              className="mt-8"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05, delayChildren: 0.25 },
                },
              }}
            >
              {children}
            </motion.div>
          </div>

          {footer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="text-center text-sm text-muted-foreground/50"
            >
              {footer}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.55 }}
            className="mt-10 text-xs text-muted-foreground/30"
          >
            <Link to="/" className="transition-colors hover:text-foreground/60">
              ← Back to validify.app
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Right Panel — Product Showcase */}
      <div className="relative hidden overflow-hidden border-l border-border/30 bg-sidebar lg:flex items-center justify-center">
        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-40 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]" />

        {/* Gradient orbs */}
        <motion.div className="absolute inset-0" variants={glowVariants} animate="animate">
          <div className="absolute top-1/4 -left-20 h-[500px] w-[500px] rounded-full bg-primary/8 blur-[150px]" />
          <div className="absolute bottom-1/3 -right-20 h-[400px] w-[400px] rounded-full bg-indigo-500/6 blur-[120px]" />
        </motion.div>

        {/* Stacked product cards */}
        <motion.div
          className="relative w-full h-full flex items-center justify-center"
          variants={showcaseVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="relative w-80 h-96">
            <ScoreCard />
            <SWOTCard />
            <DeckCard />
          </div>
        </motion.div>

        {/* Bottom label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="absolute bottom-10 left-0 right-0 text-center"
        >
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/30">
            <FileText className="h-3 w-3" />
            <span>Your data is encrypted at rest</span>
            <BarChart3 className="h-3 w-3 ml-1" />
            <span>Never used to train external models</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
