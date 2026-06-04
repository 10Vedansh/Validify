import { motion } from "framer-motion";
import { ArrowRight, Command } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 grid-pattern opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            New · Co-founder chat with streaming responses
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Validate startup ideas
            <br />
            <span className="text-muted-foreground">before you build them.</span>
          </h1>

          <p className="mt-5 max-w-xl text-base text-muted-foreground leading-relaxed">
            Validify scores your idea against thousands of seed and Series A benchmarks, generates a
            structured SWOT, and pressure-tests your GTM — in minutes, not months.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/dashboard/validate">
              <Button size="lg" className="h-10 px-5">
                Start a validation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="ghost" className="h-10 px-4 text-muted-foreground">
                Sign in
              </Button>
            </Link>
            <div className="ml-1 hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
              <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px]">
                <Command className="inline h-2.5 w-2.5" />K
              </kbd>
              to jump anywhere
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="relative mt-16"
        >
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
            <div className="flex items-center gap-2 border-b border-border bg-background/40 px-4 py-2.5">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-muted" />
                <div className="h-2.5 w-2.5 rounded-full bg-muted" />
                <div className="h-2.5 w-2.5 rounded-full bg-muted" />
              </div>
              <div className="ml-3 font-mono text-[11px] text-muted-foreground">
                Your validated idea · investor report
              </div>
            </div>
            <ProductMock />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ProductMock() {
  return (
    <div className="grid gap-px bg-border sm:grid-cols-3">
      {[
        { label: "Validation score", value: "—", sub: "Real score after validation" },
        { label: "Market potential", value: "—", sub: "Estimated after analysis" },
        { label: "Investor readiness", value: "—", sub: "Calculated from signals" },
      ].map((c) => (
        <div key={c.label} className="bg-card p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{c.label}</div>
          <div className="mt-2 text-2xl font-semibold">{c.value}</div>
          <div className="mt-1 text-xs text-muted-foreground">{c.sub}</div>
        </div>
      ))}
      <div className="col-span-full bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Signal trend · 30d
          </div>
          <div className="text-[11px] text-muted-foreground">Select industry</div>
        </div>
      </div>
    </div>
  );
}
