import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ArrowRight, Check, ChevronRight,
  User, Briefcase, Target, Zap,
  Atom, Cpu, Globe, Shield, Rocket, Building2,
  Users, DollarSign, BarChart3, Lightbulb,
  Loader2, ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ease, fadeUp } from "@/lib/motion";
import { usePreferencesStore } from "@/store/preferences.store";

export const Route = createFileRoute("/onboarding")({ component: OnboardingPage });

const founderStages = [
  { value: "idea", label: "Just an idea", emoji: "💡" },
  { value: "prototype", label: "Building prototype", emoji: "🔧" },
  { value: "launched", label: "Already launched", emoji: "🚀" },
  { value: "growth", label: "Scaling", emoji: "📈" },
];

const teamSizes = [
  { value: "solo", label: "Solo founder", emoji: "👤" },
  { value: "small", label: "2-3 people", emoji: "👥" },
  { value: "medium", label: "4-10 people", emoji: "🤝" },
  { value: "large", label: "10+ people", emoji: "🏢" },
];

const industries = [
  { value: "AI/ML", label: "AI / ML", icon: Atom },
  { value: "Fintech", label: "Fintech", icon: DollarSign },
  { value: "Healthtech", label: "Healthtech", icon: Shield },
  { value: "Climate", label: "Climate", icon: Globe },
  { value: "DevTools", label: "DevTools", icon: Cpu },
  { value: "Consumer", label: "Consumer", icon: Users },
  { value: "SaaS", label: "SaaS", icon: Building2 },
  { value: "Other", label: "Other", icon: Rocket },
];

const experienceLevels = [
  { value: "first", label: "First-time founder", emoji: "🌱" },
  { value: "previous", label: "Previous founder", emoji: "⭐" },
  { value: "operator", label: "Startup operator", emoji: "💼" },
  { value: "investor", label: "Angel / VC", emoji: "🔮" },
];

const categories = [
  { value: "b2b-saas", label: "B2B SaaS", icon: Building2 },
  { value: "b2c", label: "B2C / Consumer", icon: Users },
  { value: "marketplace", label: "Marketplace", icon: Globe },
  { value: "developer-tools", label: "Developer Tools", icon: Cpu },
  { value: "fintech", label: "Fintech", icon: DollarSign },
  { value: "health", label: "Health / Bio", icon: Shield },
  { value: "climate", label: "Climate / Green", icon: Atom },
  { value: "other", label: "Other", icon: Rocket },
];

const startupStages = [
  { value: "pre-seed", label: "Pre-seed", description: "Idea stage, no funding" },
  { value: "seed", label: "Seed", description: "Early product, initial funding" },
  { value: "series-a", label: "Series A", description: "Product-market fit, scaling" },
  { value: "series-b-plus", label: "Series B+", description: "Hyper-growth" },
];

const goals = [
  { value: "validate", label: "Validate my idea", description: "Check if the idea is worth pursuing", icon: Lightbulb },
  { value: "fundraising", label: "Raise funding", description: "Prepare for investor conversations", icon: DollarSign },
  { value: "pitch-deck", label: "Build pitch deck", description: "Generate investor-ready decks", icon: Rocket },
  { value: "market-analysis", label: "Analyze market", description: "Deep-dive competitive intelligence", icon: BarChart3 },
  { value: "improve-score", label: "Improve scores", description: "Strengthen weak validation areas", icon: Target },
  { value: "team", label: "Build team", description: "Find co-founders and hires", icon: Users },
];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all duration-500",
            i <= current ? "bg-primary" : "bg-border",
            i === current ? "w-8" : "w-6",
          )}
        />
      ))}
    </div>
  );
}

function SelectCard({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-xl border p-4 transition-all duration-200",
        selected
          ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
          : "border-border/60 hover:border-border hover:bg-accent/30",
        className,
      )}
    >
      {children}
      {selected && (
        <div className="absolute top-2.5 right-2.5 grid h-5 w-5 place-items-center rounded-full bg-primary">
          <Check className="h-3 w-3 text-primary-foreground" />
        </div>
      )}
    </button>
  );
}

function OnboardingPage() {
  const navigate = useNavigate();
  const { completeOnboarding } = usePreferencesStore();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    founderStage: "",
    teamSize: "",
    industry: "",
    experience: "",
    startupName: "",
    category: "",
    startupStage: "",
    geography: "",
    goals: [] as string[],
  });
  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  const update = (key: string, value: string | string[]) => setData((prev) => ({ ...prev, [key]: value }));
  const toggleGoal = (g: string) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.includes(g) ? prev.goals.filter((x) => x !== g) : [...prev.goals, g],
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 0: return data.founderStage && data.teamSize && data.industry && data.experience;
      case 1: return data.startupName && data.category && data.startupStage && data.geography;
      case 2: return data.goals.length > 0;
      default: return true;
    }
  };

  const handleNext = () => {
    if (step < 3) setStep((p) => p + 1);
    else handleComplete();
  };

  const handleComplete = () => {
    setGenerating(true);
    const interval = setInterval(() => {
      setGenerationStep((p) => {
        if (p >= 4) {
          clearInterval(interval);
          return p;
        }
        return p + 1;
      });
    }, 800);
    setTimeout(() => {
      clearInterval(interval);
      completeOnboarding();
      navigate({ to: "/dashboard" });
    }, 4000);
  };

  const generationMessages = [
    "Analyzing your founder profile...",
    "Building personalized workspace...",
    "Connecting industry benchmarks...",
    "Setting up AI copilot...",
    "Your workspace is ready!",
  ];

  const totalSteps = 4;

  if (generating) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="max-w-md w-full mx-auto px-6 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease }}
          >
            <div className="relative mx-auto mb-8 grid h-24 w-24 place-items-center">
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse-slow" />
              <div className="absolute inset-2 rounded-full bg-primary/20 animate-pulse-slower" />
              <Sparkles className="h-10 w-10 text-primary animate-float" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Building your startup workspace</h2>
            <p className="text-sm text-muted-foreground mb-8">Personalizing Validify for your journey</p>
            <div className="space-y-4">
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: `${(generationStep / 4) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={generationStep}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-xs text-muted-foreground"
                >
                  {generationMessages[Math.min(generationStep, 4)]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Welcome to Validify</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-[32px]">Let's set up your workspace</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto">
            We'll personalize Validify for your startup journey. This takes 2 minutes.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <StepIndicator current={step} total={totalSteps} />
          <span className="text-xs text-muted-foreground tabular-nums">Step {step + 1} of {totalSteps}</span>
        </div>

        {/* Step content */}
        <div className="min-h-[320px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease }}
            >
              {step === 0 && <FounderProfileStep data={data} update={update} />}
              {step === 1 && <StartupProfileStep data={data} update={update} />}
              {step === 2 && <GoalsStep data={data} toggleGoal={toggleGoal} />}
              {step === 3 && <PersonalizationStep />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => step > 0 ? setStep((p) => p - 1) : navigate({ to: "/dashboard" })}
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            {step === 0 ? "Skip" : "Back"}
          </Button>
          <Button size="sm" onClick={handleNext} disabled={!canProceed()}>
            {step === totalSteps - 1 ? (
              <>Build workspace <Sparkles className="ml-1.5 h-3.5 w-3.5" /></>
            ) : (
              <>Continue <ChevronRight className="ml-1 h-3.5 w-3.5" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function FounderProfileStep({ data, update }: { data: any; update: (k: string, v: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-3">
        {founderStages.map((s) => (
          <SelectCard key={s.value} selected={data.founderStage === s.value} onClick={() => update("founderStage", s.value)}>
            <div className="flex items-center gap-3">
              <span className="text-xl">{s.emoji}</span>
              <span className="text-sm font-medium text-foreground">{s.label}</span>
            </div>
          </SelectCard>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {teamSizes.map((s) => (
          <SelectCard key={s.value} selected={data.teamSize === s.value} onClick={() => update("teamSize", s.value)}>
            <div className="flex items-center gap-3">
              <span className="text-xl">{s.emoji}</span>
              <span className="text-sm font-medium text-foreground">{s.label}</span>
            </div>
          </SelectCard>
        ))}
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Industry</p>
        <div className="flex flex-wrap gap-2">
          {industries.map((ind) => {
            const Icon = ind.icon;
            return (
              <button
                key={ind.value}
                type="button"
                onClick={() => update("industry", ind.value)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                  data.industry === ind.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                <Icon className="h-3 w-3" />
                {ind.label}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Experience</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {experienceLevels.map((s) => (
            <SelectCard key={s.value} selected={data.experience === s.value} onClick={() => update("experience", s.value)}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{s.emoji}</span>
                <span className="text-sm font-medium text-foreground">{s.label}</span>
              </div>
            </SelectCard>
          ))}
        </div>
      </div>
    </div>
  );
}

function StartupProfileStep({ data, update }: { data: any; update: (k: string, v: string) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Startup Name</p>
        <input
          value={data.startupName}
          onChange={(e) => update("startupName", e.target.value)}
          placeholder="e.g. Acme AI"
          className="w-full rounded-xl border border-border/60 bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
        />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Category</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => update("category", c.value)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                  data.category === c.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                <Icon className="h-3 w-3" />
                {c.label}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Stage</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {startupStages.map((s) => (
            <SelectCard key={s.value} selected={data.startupStage === s.value} onClick={() => update("startupStage", s.value)}>
              <div className="space-y-1">
                <div className="text-sm font-medium text-foreground">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.description}</div>
              </div>
            </SelectCard>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Primary Geography</p>
        <input
          value={data.geography}
          onChange={(e) => update("geography", e.target.value)}
          placeholder="e.g. United States, Europe, Global"
          className="w-full rounded-xl border border-border/60 bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
        />
      </div>
    </div>
  );
}

function GoalsStep({ data, toggleGoal }: { data: any; toggleGoal: (g: string) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground mb-4">Select all that apply — we'll prioritize your workspace accordingly.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {goals.map((g) => {
          const Icon = g.icon;
          const selected = data.goals.includes(g.value);
          return (
            <SelectCard key={g.value} selected={selected} onClick={() => toggleGoal(g.value)}>
              <div className="flex items-start gap-3">
                <div className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition-colors",
                  selected ? "bg-primary/10 border-primary/20 text-primary" : "bg-card border-border text-muted-foreground",
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{g.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{g.description}</div>
                </div>
              </div>
            </SelectCard>
          );
        })}
      </div>
    </div>
  );
}

function PersonalizationStep() {
  return (
    <div className="text-center py-8">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease }}
      >
        <div className="relative mx-auto mb-6 grid h-20 w-20 place-items-center">
          <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-pulse-slow" />
          <Sparkles className="h-9 w-9 text-primary" />
        </div>
        <h2 className="text-lg font-semibold mb-2">Almost there</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          We'll now build a personalized workspace based on your profile, goals, and industry.
          Your AI copilot will be pre-configured with relevant benchmarks and insights.
        </p>
        <div className="mt-8 flex items-center justify-center gap-6">
          {[
            { icon: Zap, label: "AI Copilot" },
            { icon: BarChart3, label: "Benchmarks" },
            { icon: Target, label: "Goals" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 border border-primary/20">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-[11px] text-muted-foreground">{item.label}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
