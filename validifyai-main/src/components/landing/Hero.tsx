import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ArrowRight, FileText, Presentation, TrendingUp } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

function SlideRow({
  num, label, active, index,
}: {
  num: string; label: string; active: boolean; index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 + index * 0.06, duration: 0.4, ease }}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-300",
        active
          ? "bg-primary/10 border border-primary/25 shadow-sm"
          : "text-muted-foreground/40 hover:text-muted-foreground/60 hover:bg-muted/20",
      )}
    >
      <span className="font-mono text-[11px] w-4 text-muted-foreground/30">{num}</span>
      <span className={active ? "text-foreground/80 font-medium" : ""}>{label}</span>
      {active && (
        <motion.span
          layoutId="active-slide-dot"
          className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
        />
      )}
    </motion.div>
  );
}

function ScoreBar({
  label, value, display, color,
}: {
  label: string; value: string; display: number; color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease }}
    >
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-muted-foreground/50">{label}</span>
        <span className={cn("font-semibold", color)}>{value}</span>
      </div>
      <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", color.replace("text-", "bg-").replace("400", "500/70"))}
          initial={{ width: 0 }}
          animate={{ width: `${display}%` }}
          transition={{ duration: 0.8, delay: 0.4, ease }}
        />
      </div>
    </motion.div>
  );
}

function AnimatedScore() {
  const [score, setScore] = useState(0);
  const targetScore = 82;

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();
    const frame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setScore(Math.round(start + (targetScore - start) * eased));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, []);

  return (
    <motion.div
      className="flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.5, ease }}
    >
      <svg className="w-16 h-16" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" fill="none" stroke="oklch(1 0 0 / 0.06)" strokeWidth="6" />
        <motion.circle
          cx="50" cy="50" r="42" fill="none"
          stroke="oklch(0.65 0.22 280 / 0.6)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 42}`}
          initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
          animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - targetScore / 100) }}
          transition={{ duration: 1.2, delay: 0.6, ease }}
          transform="rotate(-90 50 50)"
        />
        <text
          x="50" y="52" textAnchor="middle" dominantBaseline="middle"
          fill="white" fontSize="22" fontWeight="700" fontFamily="Inter, sans-serif"
        >
          {score}
        </text>
      </svg>
    </motion.div>
  );
}

const headlineWords = [
  { text: "Turn your", className: "" },
  { text: "napkin sketch", className: "text-muted-foreground/40 font-light" },
  { text: "into a", className: "" },
  { text: "boardroom deck.", className: "text-gradient" },
];

export function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden bg-background"
    >
      <motion.div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ y: bgY }}>
        <div className="absolute -top-48 -left-48 h-[900px] w-[900px] rounded-full bg-primary/6 blur-[180px] animate-pulse-slow" />
        <div className="absolute -bottom-48 -right-48 h-[700px] w-[700px] rounded-full bg-violet-500/5 blur-[150px] animate-pulse-slower" />
        <div className="absolute top-1/4 left-1/2 h-[500px] w-[500px] rounded-full bg-indigo-500/4 blur-[130px] animate-pulse-slowest" />
      </motion.div>

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8 pt-28 pb-16 lg:pt-36 lg:pb-20">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Editorial Copy */}
          <div className="lg:col-span-5 max-w-xl">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease }}
              className="text-xs text-muted-foreground/40 font-medium tracking-[0.2em] uppercase mb-8"
            >
              From idea to investor-ready
            </motion.p>

            <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-medium tracking-tight leading-[1.05] text-foreground">
              {headlineWords.map((word, i) => (
                <motion.span
                  key={word.text}
                  className={cn("block", word.className)}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.08, ease }}
                >
                  {word.text}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.45, ease }}
              className="mt-6 text-base sm:text-lg text-muted-foreground/50 leading-relaxed max-w-md"
            >
              Every great company starts as a fragile idea. We give you the research, the data, and the narrative to turn yours into something investors believe in.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.55, ease }}
              className="mt-8 flex items-center gap-4"
            >
              <Link to="/register">
                <Button
                  size="lg"
                  className="h-12 px-8 text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Start validating
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-base rounded-xl"
                >
                  Sign in
                </Button>
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.65, ease }}
              className="mt-6 text-sm text-muted-foreground/30 tracking-wide"
            >
              No credit card required · 3 free validations
            </motion.p>
          </div>

          {/* Right: Product Showcase */}
          <div className="lg:col-span-7 relative">
            <motion.div
              className="relative group"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease }}
              whileHover={{ y: -4 }}
            >
              <motion.div
                className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-primary/12 via-primary/5 to-transparent blur-2xl"
                animate={{ opacity: [0.35, 0.55, 0.35] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />

              <div className="relative rounded-2xl border border-border/30 bg-card shadow-2xl overflow-hidden transition-all duration-500 group-hover:shadow-3xl group-hover:border-border/40">
                <div className="absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] pointer-events-none" />

                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/20 bg-background/30 backdrop-blur-sm">
                  <motion.div
                    className="flex gap-1.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-500/30" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500/30" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/30" />
                  </motion.div>
                  <motion.div
                    className="ml-3 font-mono text-[11px] text-muted-foreground/30 tracking-wide"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                  >
                    workspace · overview
                  </motion.div>
                  <motion.div
                    className="ml-auto flex items-center gap-1.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="h-5 w-5 rounded-md bg-muted/20 border border-border/20" />
                    <div className="h-5 w-5 rounded-md bg-muted/20 border border-border/20" />
                  </motion.div>
                </div>

                <div className="grid sm:grid-cols-2 divide-x divide-border/20">
                  <motion.div
                    className="p-6 sm:p-7 space-y-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.45, ease }}
                  >
                    <div className="flex items-center gap-4">
                      <AnimatedScore />
                      <div>
                        <div className="text-sm font-medium">Validation Score</div>
                        <div className="text-xs text-muted-foreground/40">Overall assessment</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <ScoreBar label="Market Potential" value="80/100" display={80} color="text-primary" />
                      <ScoreBar label="Investor Readiness" value="70/100" display={70} color="text-amber-400" />
                      <ScoreBar label="Execution Strength" value="78/100" display={78} color="text-emerald-400" />
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {["SWOT", "Market", "Competitors", "Risk", "Roadmap"].map((tag) => (
                        <span key={tag} className="text-[11px] px-2 py-0.5 rounded-md bg-muted/30 border border-border/15 text-muted-foreground/50">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div
                    className="p-6 sm:p-7 space-y-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5, ease }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-500/5 border border-amber-500/20 grid place-items-center shadow-sm">
                        <Presentation className="h-4 w-4 text-amber-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Pitch Deck</div>
                        <div className="text-xs text-muted-foreground/40">10 slides</div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {[
                        { num: "01", label: "Problem", active: false },
                        { num: "02", label: "Solution", active: true },
                        { num: "03", label: "Market Size", active: false },
                        { num: "04", label: "Business Model", active: false },
                        { num: "05", label: "Competition", active: false },
                      ].map((slide, i) => (
                        <SlideRow key={slide.num} {...slide} index={i} />
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground/40">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>Generated from your validation report</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
