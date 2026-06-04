import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

const pricing = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    desc: "Validate your first idea",
    features: ["3 validations / month", "Basic SWOT", "Community support"],
    cta: "Start free",
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    desc: "For serious founders",
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
    period: "",
    desc: "For funds & accelerators",
    features: ["Team workspaces", "API access", "Custom benchmarks", "SAML SSO", "Dedicated CSM"],
    cta: "Contact sales",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-sm text-primary font-medium">Pricing</p>
          <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight">
            Simple plans. <span className="text-gradient">Serious results.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {pricing.map((p) => (
            <div
              key={p.name}
              className={cn(
                "relative rounded-2xl p-7 surface-card flex flex-col",
                p.featured && "border-primary/50 shadow-md ring-1 ring-primary/30",
              )}
            >
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Most popular
                </span>
              )}
              <div className="text-sm text-muted-foreground">{p.name}</div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{p.price}</span>
                <span className="text-muted-foreground">{p.period}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
              <ul className="mt-6 space-y-3 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="mt-7">
                <Button
                  className={cn("w-full", p.featured ? "shadow-md" : "")}
                  variant={p.featured ? "default" : "outline"}
                >
                  {p.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
