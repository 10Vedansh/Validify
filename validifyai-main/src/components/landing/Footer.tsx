import { Logo } from "@/components/Logo";
import { motion } from "framer-motion";
import { ease } from "@/lib/motion";

const columns = [
  { t: "Product", l: ["Features", "Pricing", "Changelog", "Dashboard"] },
  { t: "Company", l: ["About", "Blog", "Careers", "Press"] },
  { t: "Legal", l: ["Terms", "Privacy", "Security", "DPA"] },
];

const colVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease } },
};

export function Footer() {
  return (
    <motion.footer
      className="py-14 sm:py-16 border-t border-border/20"
      initial="hidden"
      whileInView="visible"
      viewport={{ margin: "-20px" }}
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          <motion.div className="sm:col-span-1" variants={colVariants}>
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground/40 leading-relaxed max-w-xs">
              From napkin sketch to boardroom deck. Built for founders who move fast.
            </p>
          </motion.div>
          {columns.map((c) => (
            <motion.div key={c.t} variants={colVariants}>
              <div className="text-sm font-medium mb-4 text-foreground/60">{c.t}</div>
              <ul className="space-y-3">
                {c.l.map((i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground/40 hover:text-foreground/60 transition-all duration-200 hover:translate-x-0.5 inline-block"
                    >
                      {i}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        <motion.div
          className="mt-12 pt-6 border-t border-border/20 flex flex-col sm:flex-row justify-between gap-2 text-xs text-muted-foreground/30"
          variants={colVariants}
        >
          <div>&copy; 2026 Validify AI</div>
          <div>Designed for founders who build things that matter.</div>
        </motion.div>
      </div>
    </motion.footer>
  );
}
