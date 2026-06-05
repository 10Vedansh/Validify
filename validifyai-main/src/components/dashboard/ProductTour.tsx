import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePreferencesStore } from "@/store/preferences.store";

export type TourStep = {
  target: string;
  title: string;
  content: string;
  position?: "bottom" | "top" | "left" | "right";
};

type ProductTourProps = {
  tourId: string;
  steps: TourStep[];
  onComplete?: () => void;
  forceShow?: boolean;
};

export function ProductTour({ tourId, steps, onComplete, forceShow }: ProductTourProps) {
  const [current, setCurrent] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const { tourSeen, markTourSeen } = usePreferencesStore();
  const seen = tourSeen[tourId];
  const isOpen = forceShow || (!seen && steps.length > 0);

  const updatePosition = useCallback(() => {
    const step = steps[current];
    if (!step) return;
    const el = document.querySelector(step.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setPosition({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    }
  }, [current, steps]);

  useEffect(() => {
    updatePosition();
    const handleResize = () => updatePosition();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updatePosition]);

  const handleNext = () => {
    if (current < steps.length - 1) {
      setCurrent((p) => p + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (current > 0) setCurrent((p) => p - 1);
  };

  const handleComplete = () => {
    markTourSeen(tourId);
    onComplete?.();
  };

  const getTooltipPosition = () => {
    const step = steps[current];
    const pos = step?.position ?? "bottom";
    const gap = 12;
    switch (pos) {
      case "bottom":
        return { top: position.top + position.height + gap, left: position.left + position.width / 2 - 180 };
      case "top":
        return { top: position.top - gap - 180, left: position.left + position.width / 2 - 180 };
      case "left":
        return { top: position.top + position.height / 2 - 90, left: position.left - gap - 360 };
      case "right":
        return { top: position.top + position.height / 2 - 90, left: position.left + position.width + gap };
      default:
        return { top: position.top + position.height + gap, left: position.left + position.width / 2 - 180 };
    }
  };

  if (!isOpen || current >= steps.length) return null;

  const tooltipPos = getTooltipPosition();

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" onClick={handleComplete} />
      <motion.div
        key={current}
        initial={{ opacity: 0, scale: 0.92, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.2 }}
        style={{ top: tooltipPos.top, left: tooltipPos.left }}
        className="fixed z-50 w-[360px] rounded-xl border border-border bg-card p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
            {current + 1} of {steps.length}
          </span>
          <button onClick={handleComplete} className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <h3 className="text-sm font-semibold text-foreground mb-1.5">{steps[current].title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{steps[current].content}</p>
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div key={i} className={cn("h-1.5 w-4 rounded-full transition-colors", i === current ? "bg-primary" : "bg-border")} />
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            {current > 0 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handlePrev}>
                <ChevronLeft className="h-3 w-3 mr-0.5" /> Back
              </Button>
            )}
            {current < steps.length - 1 ? (
              <Button size="sm" className="h-7 text-xs" onClick={handleNext}>
                Next <ChevronRight className="h-3 w-3 ml-0.5" />
              </Button>
            ) : (
              <Button size="sm" className="h-7 text-xs" onClick={handleComplete}>
                Done
              </Button>
            )}
            <button onClick={handleComplete} className="ml-1 text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">
              <SkipForward className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
