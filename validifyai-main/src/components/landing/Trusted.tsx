import { motion } from "framer-motion";

const companies = [
  "Foundry Labs",
  "Neural Capital",
  "Pioneer Fund",
  "First Round",
  "Ace Ventures",
  "Signal Studio",
];

export function Trusted() {
  return (
    <section className="border-b border-border py-16">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground/60 mb-8">
          Used by founders backed by
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {companies.map((name, i) => (
            <motion.span
              key={name}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="text-sm font-medium text-muted-foreground/40 tracking-wide"
            >
              {name}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
