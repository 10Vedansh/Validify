import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Lightbulb, TrendingUp, Shield, ChevronRight, ArrowRight } from "lucide-react";
import { useDashboardStore } from "@/store/dashboard.store";
import { cn } from "@/lib/utils";
import { ease } from "@/lib/motion";
import { Button } from "@/components/ui/button";

const suggestions = [
  {
    icon: Lightbulb,
    title: "Validate a new idea",
    description: "Run AI analysis on your latest concept",
    action: "Try now",
  },
  {
    icon: TrendingUp,
    title: "Improve your scores",
    description: "Benchmark against top-rated startups in your industry",
    action: "View benchmarks",
  },
  {
    icon: Shield,
    title: "Strengthen your moat",
    description: "Competitive analysis shows 3 untapped differentiators",
    action: "Explore",
  },
];

const followUps = [
  "What's my strongest validation score?",
  "How do I improve investor readiness?",
  "Compare my idea to top startups",
  "Generate a pitch deck from my best report",
];

export function AIAssistant() {
  const { aiPanelOpen, setAiPanelOpen } = useDashboardStore();

  return (
    <AnimatePresence>
      {aiPanelOpen && (
        <motion.aside
          initial={{ opacity: 0, x: 320 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 320 }}
          transition={{ duration: 0.3, ease }}
          className="hidden lg:flex w-80 shrink-0 flex-col border-l border-border bg-background/60 backdrop-blur-xl overflow-hidden"
          role="complementary"
          aria-label="AI Assistant"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <div className="flex items-center gap-2">
              <div className="grid h-6 w-6 place-items-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                <Sparkles className="h-3 w-3 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">AI Assistant</span>
            </div>
            <button
              onClick={() => setAiPanelOpen(false)}
              className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              aria-label="Close AI Assistant"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
            {/* Welcome */}
            <div>
              <h2 className="text-sm font-medium text-foreground mb-1">Good morning!</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                I'm your startup copilot. I can help you validate ideas, improve scores, and prepare for investors.
              </p>
            </div>

            {/* Suggestions */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/50">
                <Sparkles className="h-3 w-3" />
                Suggested actions
              </div>
              {suggestions.map((s) => (
                <button
                  key={s.title}
                  className="w-full text-left rounded-xl border border-border/50 bg-card/50 p-3.5 transition-all hover:border-border hover:bg-card hover:shadow-sm group"
                >
                  <div className="flex items-start gap-3">
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 border border-primary/20">
                      <s.icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">{s.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{s.description}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors mt-0.5" />
                  </div>
                </button>
              ))}
            </div>

            {/* Follow-up questions */}
            <div className="space-y-3">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/50">
                Ask me anything
              </div>
              <div className="space-y-1.5">
                {followUps.map((q) => (
                  <button
                    key={q}
                    className="w-full text-left rounded-lg border border-border/30 bg-background/30 px-3.5 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:border-border/60 hover:bg-accent/30 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="border-t border-border px-5 py-4">
            <Button size="sm" className="w-full justify-between text-xs h-9">
              <span>Open co-founder chat</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
