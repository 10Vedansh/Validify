import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { ease } from "@/lib/motion";

export function CTA() {
  return (
    <section className="relative border-b border-border/40 py-20 sm:py-24 overflow-hidden">
      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-primary/8 to-violet-500/6 blur-[140px]" />
      </motion.div>

      <div className="relative mx-auto max-w-6xl px-6 sm:px-8">
        <motion.div
          className="rounded-3xl border border-border/30 bg-gradient-to-br from-card via-card to-card/80 p-10 sm:p-16 text-center shadow-xl overflow-hidden relative group"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-60px" }}
          transition={{ duration: 0.5, ease }}
          whileHover={{ y: -1 }}
        >
          <motion.div
            className="absolute -top-24 -right-24 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-primary/8 to-violet-500/5 blur-[100px]"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative">
            <motion.h2
              className="text-2xl sm:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.1] max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ margin: "-60px" }}
              transition={{ duration: 0.4, delay: 0.1, ease }}
            >
              You have the idea.
              <br />
              <span className="text-muted-foreground/40">We'll help you prove it works.</span>
            </motion.h2>
            <motion.p
              className="mt-4 text-sm text-muted-foreground/50 max-w-md mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ margin: "-60px" }}
              transition={{ duration: 0.35, delay: 0.15 }}
            >
              Three free validations. No credit card. No time limit.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ margin: "-60px" }}
              transition={{ duration: 0.35, delay: 0.25 }}
            >
              <Link to="/register" className="inline-block mt-8">
                <Button
                  size="lg"
                  className="h-12 px-8 text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Create free account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
