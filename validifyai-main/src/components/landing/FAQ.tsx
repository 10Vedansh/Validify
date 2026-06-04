import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  {
    q: "How does Validify actually work?",
    a: "You describe your idea — problem, audience, business model. Our engine benchmarks it against thousands of funded startups, analyzes market size, competition, and unit economics, then produces a structured report with scores, SWOT, and an investor verdict.",
  },
  {
    q: "Is my idea safe?",
    a: "Your data is encrypted at rest and in transit. We never train on your ideas, never share them, and never use them to improve models for other users. What you build here stays here.",
  },
  {
    q: "How accurate is the scoring?",
    a: "Our model is calibrated against real funding outcomes from seed to Series A. While no tool can guarantee investment, the signal is strong: founders scoring 70+ raise at roughly 3x the rate of those below 50.",
  },
  {
    q: "Can I export my report and deck?",
    a: "Yes. Every report exports to PDF with a shareable link. Pro plans add PPT export for pitch decks, custom branding, and slide-by-slide editing.",
  },
  {
    q: "What if I need more than 3 validations?",
    a: "Pro removes all limits — unlimited validations, pitch deck generation, AI co-founder chat, and priority support. Most founders upgrade within their first week.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

export function FAQ() {
  return (
    <section id="faq" className="relative border-b border-border/40 py-20 sm:py-24 overflow-hidden">
      <div className="absolute bottom-0 right-0 h-[250px] w-[250px] rounded-full bg-primary/4 blur-[100px] pointer-events-none" />

      <div className="relative mx-auto max-w-3xl px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-60px" }}
          className="mb-10"
        >
          <p className="text-xs text-muted-foreground/40 font-medium tracking-[0.2em] uppercase mb-4">
            FAQ
          </p>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight leading-[1.15]">
            Questions? We've heard them before.
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
           viewport={{ margin: "-20px" }}
        >
          <Accordion
            type="single"
            collapsible
            className="border border-border/30 rounded-2xl bg-card/30 divide-y divide-border/20"
          >
            {faqs.map((f, i) => (
              <motion.div key={i} variants={itemVariants}>
                <AccordionItem value={`i${i}`} className="px-6 border-0">
                  <AccordionTrigger className="text-sm font-medium py-4 hover:no-underline text-left transition-all duration-200">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground/50 pb-5 leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
