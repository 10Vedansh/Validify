import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  FileText,
  BarChart3,
  Target,
  Check,
  AlertTriangle,
  TrendingUp,
  Zap,
  Shield,
  Lock,
  Server,
} from "lucide-react";
import { ease, fadeUp, fadeIn, staggerContainer, itemVariants } from "@/lib/motion";

function ScoreCard() {
  const bars = [
    { label: "Market Potential", pct: 80, color: "bg-primary/60" },
    { label: "Investor Readiness", pct: 70, color: "bg-amber-400/50" },
    { label: "Execution Strength", pct: 80, color: "bg-emerald-400/50" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
      transition={{
        opacity: { duration: 0.6, delay: 0.15, ease },
        x: { duration: 0.6, delay: 0.15, ease },
        y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0 },
      }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="absolute top-16 right-10 z-30 w-64"
    >
      <div className="rounded-2xl border border-white/[0.06] bg-black/50 backdrop-blur-2xl p-5 shadow-2xl shadow-primary/5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.12em]">
            Startup Validation Score
          </span>
          <Target className="h-3.5 w-3.5 text-primary/60" />
        </div>
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-4xl font-bold tracking-tight text-white">82</span>
          <span className="text-sm text-white/30">/100</span>
        </div>
        <div className="space-y-2.5">
          {bars.map((bar) => (
            <div key={bar.label}>
              <div className="flex justify-between text-[10px] text-white/40 mb-1">
                <span>{bar.label}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${bar.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${bar.pct}%` }}
                  transition={{ duration: 1, delay: 0.6, ease }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-white/[0.06]">
          <div className="flex items-start gap-2">
            <Check className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-white/50 leading-relaxed">
              Strong potential with clear GTM strategy.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SWOTCard() {
  const quadrants = [
    {
      label: "Strengths",
      items: ["Strong PMF", "Founder expertise"],
      color: "text-emerald-400",
      icon: Check,
    },
    {
      label: "Weaknesses",
      items: ["High CAC", "Competitive market"],
      color: "text-rose-400",
      icon: AlertTriangle,
    },
    {
      label: "Opportunities",
      items: ["Growing sector"],
      color: "text-primary",
      icon: Check,
    },
    {
      label: "Threats",
      items: ["Established players"],
      color: "text-amber-400",
      icon: AlertTriangle,
    },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: [0, -10, 0] }}
      transition={{
        opacity: { duration: 0.6, delay: 0.3, ease },
        y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 },
      }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-72"
    >
      <div className="rounded-2xl border border-white/[0.06] bg-black/50 backdrop-blur-2xl p-5 shadow-2xl shadow-primary/5">
        <div className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.12em] mb-3">
          SWOT Analysis
        </div>
        <div className="grid grid-cols-2 gap-2">
          {quadrants.map((q) => {
            const Icon = q.icon;
            return (
              <div
                key={q.label}
                className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-2.5"
              >
                <div className={`text-[10px] font-semibold ${q.color} mb-1 flex items-center gap-1`}>
                  <Icon className="h-2.5 w-2.5" />
                  {q.label}
                </div>
                {q.items.map((item) => (
                  <div key={item} className="text-[10px] text-white/40 leading-relaxed">
                    {item}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function DeckCard() {
  const slides = ["Executive Summary", "Market Analysis", "Financial Model", "Go-To-Market"];
  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
      transition={{
        opacity: { duration: 0.6, delay: 0.45, ease },
        x: { duration: 0.6, delay: 0.45, ease },
        y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 },
      }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="absolute bottom-16 left-10 z-30 w-64"
    >
      <div className="rounded-2xl border border-white/[0.06] bg-black/50 backdrop-blur-2xl p-5 shadow-2xl shadow-primary/5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.12em]">
            Pitch Deck Generation
          </span>
          <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[9px] font-medium text-emerald-400">Investor Ready</span>
          </div>
        </div>
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-2xl font-bold tracking-tight text-white">10</span>
          <span className="text-[11px] text-white/40">Slides Generated</span>
        </div>
        <div className="space-y-1.5">
          {slides.map((slide) => (
            <div key={slide} className="flex items-center gap-2 text-[11px] text-white/50">
              <div className="h-1 w-1 rounded-full bg-primary/60 shrink-0" />
              {slide}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function LoginShowcase() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <motion.div
        animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.12, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 -left-20 h-[700px] w-[700px] rounded-full bg-gradient-to-br from-primary/12 to-violet-500/8 blur-[160px] pointer-events-none"
      />
      <motion.div
        animate={{ opacity: [0.12, 0.25, 0.12], scale: [1, 1.18, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 -right-20 h-[600px] w-[600px] rounded-full bg-gradient-to-tl from-indigo-500/6 to-primary/8 blur-[140px] pointer-events-none"
      />
      <ScoreCard />
      <SWOTCard />
      <DeckCard />
    </div>
  );
}

function RegisterShowcase() {
  const metrics = [
    { value: "10,000+", label: "Startup Analyses", icon: BarChart3 },
    { value: "<60 sec", label: "Average Validation Time", icon: Zap },
    { value: "95%", label: "Founder Satisfaction", icon: TrendingUp },
  ];
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <motion.div
        animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.12, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 -left-20 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary/12 to-violet-500/8 blur-[160px] pointer-events-none"
      />
      <motion.div
        animate={{ opacity: [0.12, 0.25, 0.12], scale: [1, 1.18, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/3 -right-20 h-[500px] w-[500px] rounded-full bg-gradient-to-tl from-indigo-500/6 to-primary/8 blur-[140px] pointer-events-none"
      />
      <div className="flex flex-col items-center gap-6 w-full max-w-xs">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.15, ease }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="w-full"
            >
              <div className="rounded-2xl border border-white/[0.06] bg-black/50 backdrop-blur-2xl p-5 shadow-2xl shadow-primary/5">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold tracking-tight text-white">
                      {metric.value}
                    </div>
                    <div className="text-[11px] text-white/40">{metric.label}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex items-center gap-2 text-[11px] text-white/30"
        >
          <Shield className="h-3.5 w-3.5" />
          <span>Your data is encrypted at rest</span>
        </motion.div>
      </div>
    </div>
  );
}

function TrustBadges() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.65 }}
      className="flex items-center justify-center gap-4 sm:gap-6 text-[11px] text-muted-foreground/40"
    >
      <span className="flex items-center gap-1.5">
        <Lock className="h-3 w-3" />
        SOC2
      </span>
      <span className="flex items-center gap-1.5">
        <Shield className="h-3 w-3" />
        Secure Auth
      </span>
      <span className="flex items-center gap-1.5">
        <Server className="h-3 w-3" />
        Encrypted Data
      </span>
    </motion.div>
  );
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  variant = "login",
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  variant?: "login" | "register";
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left Panel - Form */}
      <div className="relative flex flex-col px-6 py-8 sm:px-12 lg:px-16 overflow-y-auto">
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-primary/4 blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-violet-500/3 blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col min-h-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
            className="flex items-center gap-2.5"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-gradient-to-br from-primary/15 to-primary/5 shadow-sm">
              <svg viewBox="0 0 20 20" className="h-5 w-5 text-primary" aria-hidden="true">
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
            transition={{ duration: 0.4, delay: 0.1, ease }}
            className="mt-1.5 text-xs text-muted-foreground/50 tracking-wide"
          >
            From napkin sketch to boardroom deck.
          </motion.p>

          <div className="mt-16 sm:mt-20 mb-8 flex-1">
            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15, ease }}
              className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground"
            >
              {title === "Welcome back" ? "Pick up where you left off" : title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.2, ease }}
              className="mt-1.5 text-sm text-muted-foreground/60 leading-relaxed"
            >
              {variant === "login"
                ? "Continue building your startup with AI-powered validation."
                : subtitle}
            </motion.p>

            {/* Form */}
            <motion.div
              className="mt-10"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {children}
            </motion.div>

            {/* Trust badges */}
            <div className="mt-8">
              <TrustBadges />
            </div>
          </div>

          {/* Footer */}
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

          {/* Data notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.55 }}
            className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/30"
          >
            <Shield className="h-3 w-3" />
            <span>Your data is encrypted. Never used to train external models.</span>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Showcase */}
      <div className="relative hidden lg:flex overflow-hidden bg-[oklch(0.10_0.004_275)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(1_0_0/0.018)_1px,transparent_1px),linear-gradient(to_bottom,oklch(1_0_0/0.018)_1px,transparent_1px)] bg-[length:56px_56px] [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]" />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 512 512\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
            backgroundSize: "256px 256px",
            opacity: 0.015,
          }}
        />

        <motion.div
          className="relative flex-1 flex items-center justify-center"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease }}
        >
          {variant === "login" ? <LoginShowcase /> : <RegisterShowcase />}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="absolute bottom-10 left-0 right-0 text-center"
        >
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-white/20">
            <FileText className="h-3 w-3" />
            <span>Your data is encrypted at rest</span>
            <BarChart3 className="h-3 w-3 ml-2" />
            <span>Never used to train external models</span>
          </div>
        </motion.div>
      </div>

      {/* Mobile: Dashboard preview below form */}
      <div className="relative lg:hidden overflow-hidden bg-[oklch(0.10_0.004_275)] border-t border-border/60">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(1_0_0/0.02)_1px,transparent_1px),linear-gradient(to_bottom,oklch(1_0_0/0.02)_1px,transparent_1px)] bg-[length:56px_56px]" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 512 512\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
            backgroundSize: "256px 256px",
            opacity: 0.015,
          }}
        />
        <div className="relative min-h-[400px]">
          {variant === "login" ? <LoginShowcase /> : <RegisterShowcase />}
        </div>
      </div>
    </div>
  );
}
