import { motion } from "framer-motion";
import {
  FileText,
  BarChart3,
  Crosshair,
  Gauge,
  Presentation,
  MessageSquareText,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Validation Report",
    desc: "Every idea gets a full diagnostic — market sizing, competitive analysis, revenue model, risk assessment, and an investor verdict. One page. No spin.",
    preview: (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground/40">
          <span>Overall Score</span>
          <span className="font-semibold text-emerald-400">78/100</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-emerald-500/60"
            initial={{ width: 0 }}
            whileInView={{ width: "78%" }}
            viewport={{ margin: "-40px" }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {["SWOT", "Competitors", "Risk", "Roadmap"].map((t) => (
            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/20 text-muted-foreground/40">{t}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: BarChart3,
    title: "Market Intelligence",
    desc: "Sizing you can take to a board meeting. TAM, SAM, SOM from live industry benchmarks — before you commit a dollar.",
    preview: (
      <div className="flex items-end gap-1.5 h-14">
        {[45, 72, 38, 88, 55, 92, 64].map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-t-sm bg-gradient-to-t from-primary/40 to-primary/20"
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            viewport={{ margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </div>
    ),
  },
  {
    icon: Crosshair,
    title: "Competitor Radar",
    desc: "We find competitors you haven't heard of yet. Direct, indirect, and emerging — mapped by funding, position, and market share.",
    preview: (
      <div className="space-y-2">
        {["Pulley AI", "Neutron Health", "Carbon Trace", "Spirovant"].map((name, i) => (
          <motion.div
            key={name}
            className="flex items-center gap-2 text-xs"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ margin: "-40px" }}
            transition={{ delay: i * 0.08 }}
          >
            <div className={`h-1.5 w-1.5 rounded-full ${i < 2 ? "bg-rose-400/60" : "bg-amber-400/40"}`} />
            <span className={i < 2 ? "text-muted-foreground/60" : "text-muted-foreground/40"}>{name}</span>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    icon: Gauge,
    title: "Investor Scoring",
    desc: "A 0–100 score built on real funding outcomes. Founders at 70+ raise 3x faster than those below 50. Know your number before you pitch.",
    preview: (
      <div className="relative h-16 flex items-end justify-center">
        <div className="flex items-end gap-1 w-full">
          {[30, 45, 55, 62, 78, 72, 65].map((v, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-t-sm"
              style={{ backgroundColor: v > 60 ? "rgb(var(--primary) / 0.5)" : "oklch(1 0 0 / 0.08)" }}
              initial={{ height: 0 }}
              whileInView={{ height: `${v / 1.5}%` }}
              viewport={{ margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            />
          ))}
        </div>
        <motion.div
          className="absolute -top-1 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-primary"
          initial={{ opacity: 0, y: 5 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-40px" }}
          transition={{ delay: 0.4 }}
        >
          78
        </motion.div>
      </div>
    ),
  },
  {
    icon: Presentation,
    title: "Pitch Deck Studio",
    desc: "Your data becomes a 10-slide investor deck with narrative flow, designed for attention. Export to PDF. Share a link. Done.",
    preview: (
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="flex-1 h-12 rounded-lg bg-muted/20 border border-border/20 flex items-center justify-center"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-40px" }}
            transition={{ delay: i * 0.08 }}
          >
            <span className="text-[10px] text-muted-foreground/30">{String(i).padStart(2, "0")}</span>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    icon: MessageSquareText,
    title: "Co-Founder Chat",
    desc: "A thinking partner that knows your business. Stress-test assumptions, explore scenarios, and unblock decisions — available at 2 AM.",
    preview: (
      <div className="space-y-2">
        <motion.div
          className="ml-auto max-w-[80%] rounded-xl rounded-br-sm bg-primary/10 px-3 py-2"
          initial={{ opacity: 0, x: 10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ margin: "-40px" }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-[11px] text-foreground/70">What about pricing?</p>
        </motion.div>
        <motion.div
          className="max-w-[85%] rounded-xl rounded-bl-sm bg-muted/20 px-3 py-2"
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ margin: "-40px" }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-[11px] text-muted-foreground/60">
            SaaS with a freemium model. Most competitors charge $49–$99/mo.
          </p>
        </motion.div>
      </div>
    ),
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function Features() {
  return (
    <section id="features" className="relative border-b border-border/40 py-20 sm:py-24 overflow-hidden">
      <div className="absolute top-1/3 right-0 h-[400px] w-[400px] rounded-full bg-indigo-500/4 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-0 h-[350px] w-[350px] rounded-full bg-primary/4 blur-[110px] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-60px" }}
          className="max-w-2xl mb-12"
        >
          <p className="text-xs text-muted-foreground/40 font-medium tracking-[0.2em] uppercase mb-4">
            What you get
          </p>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight leading-[1.15]">
            Everything a founder needs to move from idea to close.
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/30 rounded-2xl overflow-hidden border border-border/30">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ margin: "-20px" }}
              whileHover={{ y: -2 }}
              className="bg-card p-6 group transition-all duration-300"
            >
              <div className="h-20 mb-5 rounded-xl bg-muted/10 border border-border/10 p-4 flex items-center justify-center overflow-hidden">
                {f.preview}
              </div>

              <div className="flex items-center gap-2.5 mb-2">
                <div className="h-7 w-7 rounded-lg bg-muted/30 border border-border/20 grid place-items-center shrink-0 group-hover:border-primary/30 group-hover:bg-primary/5 transition-all duration-300">
                  <f.icon className="h-3.5 w-3.5 text-foreground/40 group-hover:text-primary transition-colors duration-300" />
                </div>
                <h3 className="text-sm font-medium group-hover:text-foreground transition-colors duration-200">{f.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground/50 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
