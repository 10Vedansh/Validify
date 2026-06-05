import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, FileText, Presentation, Loader2, CheckCircle2,
  X, Sparkles, ChevronRight, Eye, Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ease } from "@/lib/motion";

type ExportType = "pdf" | "investor-summary" | "pitch-deck";
type ExportStatus = "idle" | "preparing" | "generating" | "ready" | "error";

type ExportOption = {
  id: ExportType;
  label: string;
  description: string;
  icon: typeof FileText;
  format: string;
};

const exportOptions: ExportOption[] = [
  { id: "pdf", label: "Full Report (PDF)", description: "Complete validation report with all sections", icon: FileText, format: "PDF" },
  { id: "investor-summary", label: "Investor Summary", description: "One-page executive summary for investors", icon: FileText, format: "PDF" },
  { id: "pitch-deck", label: "Pitch Deck", description: "Full investor-ready slide deck", icon: Presentation, format: "PPTX" },
];

export function ExportCenter({ onClose }: { onClose?: () => void }) {
  const [selectedType, setSelectedType] = useState<ExportType>("pdf");
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [progressStep, setProgressStep] = useState(0);

  const progressMessages = [
    "Preparing your documents...",
    "Formatting content...",
    "Applying investor-grade styling...",
    "Adding appendices and references...",
  ];

  const handleExport = () => {
    setStatus("preparing");
    setProgressStep(0);

    const stepInterval = setInterval(() => {
      setProgressStep((p) => {
        if (p < progressMessages.length - 1) return p + 1;
        clearInterval(stepInterval);
        return p;
      });
    }, 800);

    setTimeout(() => {
      setStatus("generating");
    }, 500);

    setTimeout(() => {
      clearInterval(stepInterval);
      setStatus("ready");
    }, 3500);
  };

  const handleDownload = () => {
    setStatus("idle");
    onClose?.();
  };

  const currentOption = exportOptions.find((o) => o.id === selectedType);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
            <Download className="h-3.5 w-3.5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Export Center</h2>
            <p className="text-xs text-muted-foreground">Export your work in investor-grade formats</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {status === "idle" && (
        <div className="space-y-4">
          <div className="space-y-2">
            {exportOptions.map((opt) => {
              const Icon = opt.icon;
              const selected = selectedType === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => { setSelectedType(opt.id); setStatus("idle"); }}
                  className={cn(
                    "w-full text-left rounded-xl border p-4 transition-all",
                    selected ? "border-primary bg-primary/5" : "border-border/60 hover:border-border hover:bg-accent/30",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "grid h-9 w-9 place-items-center rounded-lg border transition-colors",
                      selected ? "bg-primary/10 border-primary/20 text-primary" : "bg-card border-border text-muted-foreground",
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">{opt.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{opt.description}</div>
                    </div>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{opt.format}</Badge>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleExport} className="flex-1 shadow-sm">
              Export <Download className="ml-1.5 h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Progress states */}
      <AnimatePresence mode="wait">
        {status === "preparing" && (
          <motion.div key="preparing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Preparing export</p>
                <p className="text-xs text-muted-foreground">{progressMessages[progressStep]}</p>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: `${(progressStep / (progressMessages.length - 1)) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        )}

        {status === "generating" && (
          <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative grid h-10 w-10 place-items-center">
                <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Generating {currentOption?.label}</p>
                <p className="text-xs text-muted-foreground">Applying investor-grade formatting...</p>
              </div>
            </div>
          </motion.div>
        )}

        {status === "ready" && (
          <motion.div key="ready" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex flex-col items-center py-4 text-center">
              <div className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Ready to download</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Your {currentOption?.label} has been generated and is ready for download.
              </p>
            </div>
            <Button onClick={handleDownload} className="w-full shadow-sm">
              <Download className="mr-1.5 h-4 w-4" /> Download {currentOption?.format}
            </Button>
            <Button variant="outline" className="w-full">
              <Share2 className="mr-1.5 h-4 w-4" /> Share with team
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
