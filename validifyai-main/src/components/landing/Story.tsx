import { motion } from "framer-motion";
import { Lightbulb, Search, FileText, Presentation, Rocket } from "lucide-react";

const steps = [
  {
    icon: Lightbulb,
    title: "You have an idea",
    description:
      "A problem you've noticed. A gap in the market. A solution you can't stop thinking about.",
    color: "text-amber-400",
    borderColor: "border-amber-500/20",
    bgColor: "bg-amber-500/10",
    dotColor: "bg-amber-400",
    dotRing: "border-amber-500/30",
  },
  {
    icon: Search,
    title: "We validate it",
    description:
      "Our engine benchmarks your idea against thousands of seed and Series A data points — market size, competition, unit economics, team fit.",
    color: "text-primary",
    borderColor: "border-primary/20",
    bgColor: "bg-primary/10",
    dotColor: "bg-primary",
    dotRing: "border-primary/30",
  },
  {
    icon: FileText,
    title: "You get a report",
    description:
      "A structured analysis with SWOT, competitor landscape, revenue model evaluation, risk assessment, and a clear investor verdict.",
    color: "text-emerald-400",
    borderColor: "border-emerald-500/20",
    bgColor: "bg-emerald-500/10",
    dotColor: "bg-emerald-400",
    dotRing: "border-emerald-500/30",
  },
  {
    icon: Presentation,
    title: "We build your deck",
    description:
      "From the same data, we generate a 10-slide investor-ready pitch deck. Problem, solution, market, traction — narrative, not noise.",
    color: "text-amber-400",
    borderColor: "border-amber-500/20",
    bgColor: "bg-amber-500/10",
    dotColor: "bg-amber-400",
    dotRing: "border-amber-500/30",
  },
  {
    icon: Rocket,
    title: "You raise your round",
    description:
      "Armed with data, narrative, and a deck that competes with the best. You walk into every meeting knowing your numbers cold.",
    color: "text-primary",
    borderColor: "border-primary/20",
    bgColor: "bg-primary/10",
    dotColor: "bg-primary",
    dotRing: "border-primary/30",
  },
];

const stepVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

export function Story() {
  return (
    <section className="relative border-b border-border/40 py-28 sm:py-36 overflow-hidden">
      <div className="absolute top-1/3 left-0 h-[400px] w-[400px] rounded-full bg-primary/3 blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-60px" }}
          className="max-w-2xl mb-20"
        >
          <p className="text-xs text-muted-foreground/40 font-medium tracking-[0.2em] uppercase mb-5">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.1]">
            From a thought
            <br />
            <span className="text-muted-foreground/40">to a fundraise.</span>
          </h2>
        </motion.div>

        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-border/50 to-transparent hidden sm:block" />

          <div className="space-y-20 sm:space-y-28">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                custom={i}
                variants={stepVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ margin: "-60px" }}
                className="relative pl-16 sm:pl-20 group cursor-default"
              >
                <div
                  className={`absolute left-4 sm:left-4 top-1 h-5 w-5 rounded-full border-2 ${step.dotRing} ${step.bgColor} grid place-items-center -translate-x-1/2`}
                >
                  <motion.div
                    className={`h-2 w-2 rounded-full ${step.dotColor}`}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeInOut",
                    }}
                  />
                </div>

                <div className="grid sm:grid-cols-5 gap-6 sm:gap-12 items-start">
                  <div className="sm:col-span-2">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`h-8 w-8 rounded-lg ${step.bgColor} border ${step.borderColor} grid place-items-center shrink-0 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <step.icon className={`h-4 w-4 ${step.color}`} />
                      </div>
                      <h3 className="text-lg font-medium">{step.title}</h3>
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <p className="text-sm text-muted-foreground/60 leading-relaxed max-w-lg group-hover:text-muted-foreground/70 transition-colors duration-300">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
