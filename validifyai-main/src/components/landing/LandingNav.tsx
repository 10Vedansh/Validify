import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 40);
  });

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/80 backdrop-blur-2xl border-b border-border/30 shadow-sm"
          : "bg-background/40 backdrop-blur-lg border-b border-border/10"
      }`}
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto flex h-16 items-center justify-between px-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Logo />
        </motion.div>
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link to="/login">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground transition-all duration-200 h-9"
            >
              Sign in
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm" className="h-10 px-6 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.97] shadow-sm">
              Get started
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.header>
  );
}
