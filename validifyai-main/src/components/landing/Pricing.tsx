import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Validate your first idea, see what's possible.",
    features: [
      "3 validations per month",
      "Full SWOT analysis",
      "Market size estimates",
      "Community support",
    ],
    cta: "Start free",
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    description: "For founders who are serious about raising.",
    features: [
      "Unlimited validations",
      "Investor readiness score",
      "Pitch deck generator",
      "AI co-founder chat",
      "Priority support",
    ],
    cta: "Go Pro",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For funds, accelerators, and teams.",
    features: ["Team workspaces", "API access", "Custom benchmarks", "SAML SSO", "Dedicated CSM"],
    cta: "Contact sales",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function Pricing() {
  return (
    <section id="pricing" className="relative border-b border-border/40 py-20 sm:py-24 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-60px" }}
          className="max-w-2xl mb-12"
        >
          <p className="text-xs text-muted-foreground/40 font-medium tracking-[0.2em] uppercase mb-4">
            Pricing
          </p>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight leading-[1.15]">
            Straightforward. Start free, upgrade when you're ready.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
               viewport={{ margin: "-20px" }}
              whileHover={{ y: -2 }}
              className={cn(
                "rounded-2xl border p-7 flex flex-col transition-all duration-300",
                plan.featured
                  ? "border-primary/30 bg-card shadow-lg hover:shadow-xl hover:border-primary/40"
                  : "border-border/30 bg-card/50 hover:bg-card/70 hover:border-border/40",
              )}
            >
              {plan.featured && (
                <span className="text-xs font-medium text-primary tracking-wide mb-3">
                  Most popular
                </span>
              )}
              <div className="text-sm text-foreground/60 font-medium">{plan.name}</div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-medium tracking-tight">{plan.price}</span>
                {plan.period && (
                  <span className="text-sm text-muted-foreground/40">{plan.period}</span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground/50">{plan.description}</p>
              <ul className="mt-6 space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 text-primary/60 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground/60">{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register" className="mt-6 block">
                <Button
                  className="w-full rounded-xl transition-all duration-200 active:scale-[0.97]"
                  variant={plan.featured ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
