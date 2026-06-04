import { motion } from "framer-motion";
import { Brain, LineChart, Crosshair, Gauge, Presentation, Bot, type LucideIcon } from "lucide-react";

const icons: Record<string, LucideIcon> = { Brain, LineChart, Crosshair, Gauge, Presentation, Bot };

const features = [
  { icon: "Brain", title: "AI SWOT Analysis", desc: "Instant strengths, weaknesses, opportunities & threats for any idea." },
  { icon: "LineChart", title: "Market Research", desc: "Live TAM/SAM/SOM estimates with trend signals across industries." },
  { icon: "Crosshair", title: "Competitor Detection", desc: "Find direct and lateral competitors before investors do." },
  { icon: "Gauge", title: "Investor Readiness", desc: "A 0–100 score modeled on real seed & Series A benchmarks." },
  { icon: "Presentation", title: "Pitch Deck Generator", desc: "From idea to a 10-slide investor-ready deck in seconds." },
  { icon: "Bot", title: "AI Co-Founder Chat", desc: "Strategize, stress-test, and unblock with a 24/7 thought partner." },
];

export function Features() {
  return (
    <section id="features" className="border-b border-border py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Capabilities
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            One workspace, every signal a founder needs.
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Six focused workflows — scored, sourced, and exportable. Replace your spreadsheet stack
            with something that learns alongside you.
          </p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = icons[f.icon];
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
                className="group relative bg-card p-6 transition-colors hover:bg-card/60"
              >
                <Icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                <h3 className="mt-4 text-sm font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
