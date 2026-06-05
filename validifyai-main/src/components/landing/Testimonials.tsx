import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Founder & CEO",
    company: "Pulley AI",
    quote:
      "I spent three weeks building a market research deck for my board. Validify did it in three minutes — and caught things my team missed.",
    initials: "SC",
  },
  {
    name: "Marcus Johnson",
    role: "Co-Founder",
    company: "Neutron Health",
    quote:
      "Our investor readiness score went from 54 to 82. Fixed our positioning, closed the round. The data doesn't lie.",
    initials: "MJ",
  },
  {
    name: "Priya Kapoor",
    role: "CTO",
    company: "Carbon Trace",
    quote:
      "The competitor radar found three direct competitors we hadn't heard of. Changed our entire GTM strategy before spending a dollar.",
    initials: "PK",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export function Testimonials() {
  return (
    <section className="border-b border-border/40 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-60px" }}
          className="max-w-2xl mb-12"
        >
          <p className="text-xs text-muted-foreground/40 font-medium tracking-[0.2em] uppercase mb-4">
            Founders, not features
          </p>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight leading-[1.15]">
            What founders say when the data works.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
               viewport={{ margin: "-20px" }}
              className="rounded-2xl border border-border/30 bg-card p-7 flex flex-col transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-border/40 group"
            >
              <div className="flex items-center gap-1.5 mb-5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.div
                    key={star}
                    className="h-1.5 w-1.5 rounded-full bg-primary/40 group-hover:bg-primary/60 transition-colors duration-300"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: star * 0.08 + i * 0.12,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground/60 leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-card border border-border/30 grid place-items-center text-xs font-medium text-foreground/60 group-hover:border-primary/30 group-hover:text-primary/80 transition-all duration-300">
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-xs text-muted-foreground/40">
                    {t.role}, {t.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
