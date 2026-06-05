import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Plus,
  Presentation,
  Inbox,
  Loader2,
  RefreshCw,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckCircle2,
  FileText,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  pitchDeckService,
  type PitchDeck,
  type PitchDeckSlide,
} from "@/services/pitch-deck.service";
import { reportsService } from "@/services/reports.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { staggerContainer, fadeUp } from "@/lib/motion";
import { Sparkline, TrendBadge, BenchmarkChip } from "@/components/charts/Sparkline";

export const Route = createFileRoute("/dashboard/pitch")({ component: Pitch });

const SLIDE_TYPE_LABELS: Record<string, string> = {
  title: "Title Slide",
  problem: "Problem",
  solution: "Solution",
  market: "Market Opportunity",
  business_model: "Business Model",
  competition: "Competition",
  traction: "Traction",
  team: "Team",
  financials: "Financials",
  ask: "The Ask",
};

const PROGRESS_STEPS = [
  "Analyzing report",
  "Building slide structure",
  "Generating content",
  "Polishing design",
];

const STEP_DURATION = 2000;

function getSlidePreview(slide: PitchDeckSlide): string {
  if (slide.bullets && slide.bullets.length > 0) return slide.bullets[0];
  if (slide.content.length > 80) return slide.content.slice(0, 80) + "...";
  return slide.content;
}

function downloadDeck(deck: PitchDeck) {
  const lines: string[] = [
    `# ${deck.title}`,
    `Generated: ${new Date(deck.createdAt).toLocaleDateString()}`,
    "",
  ];
  deck.content.forEach((slide, i) => {
    lines.push(`## Slide ${i + 1}: ${SLIDE_TYPE_LABELS[slide.type] ?? slide.type}`);
    lines.push(`### ${slide.title}`);
    lines.push(slide.content);
    if (slide.bullets?.length) {
      slide.bullets.forEach((b) => lines.push(`- ${b}`));
    }
    lines.push("---", "");
  });
  const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${deck.title.replace(/\s+/g, "-").toLowerCase()}.md`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Deck downloaded");
}

const slideColors: Record<string, string> = {
  title: "bg-violet-500/20 border-violet-500/30",
  problem: "bg-rose-500/20 border-rose-500/30",
  solution: "bg-emerald-500/20 border-emerald-500/30",
  market: "bg-blue-500/20 border-blue-500/30",
  business_model: "bg-amber-500/20 border-amber-500/30",
  competition: "bg-orange-500/20 border-orange-500/30",
  traction: "bg-cyan-500/20 border-cyan-500/30",
  team: "bg-pink-500/20 border-pink-500/30",
  financials: "bg-green-500/20 border-green-500/30",
  ask: "bg-primary/10 border-primary/30",
};

const slideAccents: Record<string, string> = {
  title: "bg-violet-500",
  problem: "bg-rose-500",
  solution: "bg-emerald-500",
  market: "bg-blue-500",
  business_model: "bg-amber-500",
  competition: "bg-orange-500",
  traction: "bg-cyan-500",
  team: "bg-pink-500",
  financials: "bg-green-500",
  ask: "bg-primary",
};

function SlideThumbnail({
  slide,
  index,
  active,
  onClick,
}: {
  slide: PitchDeckSlide;
  index: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-lg border p-2.5 transition-all duration-200 relative overflow-hidden",
        active
          ? "border-primary bg-accent/80 shadow-sm"
          : "border-border hover:border-border/60 hover:bg-accent/30",
      )}
    >
      {active && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary" />}
      <div className="flex items-start gap-2">
        <div
          className={cn(
            "h-7 w-7 rounded-md grid place-items-center shrink-0 text-[10px] font-bold",
            slideColors[slide.type] ?? "bg-muted border border-border",
          )}
        >
          {index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-medium truncate">
            {SLIDE_TYPE_LABELS[slide.type] ?? slide.type}
          </div>
          <div className="text-[10px] text-muted-foreground/60 truncate mt-0.5">{slide.title}</div>
        </div>
      </div>
    </button>
  );
}

function SlideView({
  slide,
  index,
  total,
}: {
  slide: PitchDeckSlide;
  index: number;
  total: number;
}) {
  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border border-border bg-card p-8 min-h-[420px] flex flex-col relative overflow-hidden"
    >
      <div className={cn("absolute top-0 left-0 right-0 h-1", slideAccents[slide.type] ?? "bg-primary")} />
      <div className="flex items-center justify-between mb-4">
        <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 text-muted-foreground uppercase tracking-wider">
          {SLIDE_TYPE_LABELS[slide.type] ?? slide.type}
        </Badge>
        <span className="text-[11px] text-muted-foreground/50 tabular-nums">{index + 1}/{total}</span>
      </div>
      <h2 className="text-xl font-bold mb-4 tracking-tight">{slide.title}</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{slide.content}</p>
      {slide.bullets && slide.bullets.length > 0 && (
        <ul className="space-y-2">
          {slide.bullets.map((b, i) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2.5 leading-relaxed">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              {b}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

function DeckCard({
  deck,
  onView,
  onRegenerate,
  onDelete,
}: {
  deck: PitchDeck;
  onView: () => void;
  onRegenerate: () => void;
  onDelete: () => void;
}) {
  const firstSlide = deck.content[0];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="h-2 flex">
        {deck.content.slice(0, 6).map((s, i) => (
          <div key={i} className={cn("flex-1", slideColors[s.type]?.split(" ")[0] ?? "bg-muted")} />
        ))}
      </div>
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 grid place-items-center shrink-0">
              <Presentation className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-sm">{deck.title}</div>
              <div className="text-xs text-muted-foreground">
                {deck.content.length} slides &middot; {new Date(deck.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
        {firstSlide && (
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="text-[11px] text-muted-foreground/60 font-medium uppercase tracking-wider mb-1">
              {SLIDE_TYPE_LABELS[firstSlide.type] ?? firstSlide.type}
            </div>
            <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {getSlidePreview(firstSlide)}
            </div>
          </div>
        )}
        <div className="flex gap-2 pt-1">
          <Button variant="outline" size="sm" className="flex-1" onClick={onView}>
            <Eye className="mr-1 h-3 w-3" /> View
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={() => downloadDeck(deck)}>
            <Download className="mr-1 h-3 w-3" /> Download
          </Button>
          <Button variant="outline" size="sm" onClick={onRegenerate}>
            <RefreshCw className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="sm" className="text-destructive" onClick={onDelete}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function GenerationProgress({ step, isComplete }: { step: number; isComplete: boolean }) {
  return (
    <div className="space-y-3">
      {PROGRESS_STEPS.map((label, i) => {
        const done = i < step || isComplete;
        const active = i === step && !isComplete;
        return (
          <div key={label} className="flex items-center gap-3">
            <div
              className={cn(
                "h-7 w-7 rounded-full grid place-items-center shrink-0 transition-colors",
                done
                  ? "bg-primary text-primary-foreground"
                  : active
                    ? "bg-primary/20 border border-primary/40"
                    : "bg-muted border border-border",
              )}
            >
              {done ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : active ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
              )}
            </div>
            <span
              className={cn(
                "text-sm transition-colors",
                done ? "text-foreground" : active ? "text-foreground" : "text-muted-foreground/50",
              )}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DeckViewer({
  deck,
  onClose,
  onRegenerate,
}: {
  deck: PitchDeck;
  onClose: () => void;
  onRegenerate: () => void;
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = deck.content;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-10rem)]"
    >
      {/* Thumbnail sidebar */}
      <aside className="lg:w-56 shrink-0 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto p-1">
        <div className="hidden lg:flex items-center gap-2 px-2 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <Presentation className="h-3.5 w-3.5" />
          {slides.length} slides
        </div>
        {slides.map((slide, i) => (
          <SlideThumbnail
            key={i}
            slide={slide}
            index={i}
            active={i === currentSlide}
            onClick={() => setCurrentSlide(i)}
          />
        ))}
      </aside>

      {/* Main slide area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">{deck.title}</h2>
            <p className="text-xs text-muted-foreground">
              Generated {new Date(deck.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => downloadDeck(deck)}>
              <Download className="mr-1 h-3 w-3" /> Download
            </Button>
            <Button variant="outline" size="sm" onClick={onRegenerate}>
              <RefreshCw className="mr-1 h-3 w-3" /> Regenerate
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {slides.length > 0 && (
          <>
            <div className="flex-1 overflow-y-auto">
              <SlideView slide={slides[currentSlide]} index={currentSlide} total={slides.length} />
            </div>

            <div className="flex items-center justify-center gap-3 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentSlide((p) => Math.max(0, p - 1))}
                disabled={currentSlide === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      i === currentSlide ? "w-6 bg-primary" : "w-2 bg-border hover:bg-border/80",
                    )}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentSlide((p) => Math.min(slides.length - 1, p + 1))}
                disabled={currentSlide === slides.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

function Pitch() {
  const queryClient = useQueryClient();
  const [viewingDeck, setViewingDeck] = useState<PitchDeck | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string>("");
  const [showGenerate, setShowGenerate] = useState(false);
  const [progressStep, setProgressStep] = useState(0);

  const { data: decks = [], isLoading } = useQuery({
    queryKey: ["pitch-decks"],
    queryFn: () => pitchDeckService.list(),
  });

  const { data: reports = [] } = useQuery({
    queryKey: ["reports"],
    queryFn: () => reportsService.list(),
  });

  const generateMutation = useMutation({
    mutationFn: (reportId: string) => pitchDeckService.generate(reportId),
    onSuccess: (deck) => {
      queryClient.invalidateQueries({ queryKey: ["pitch-decks"] });
      setViewingDeck(deck);
      setShowGenerate(false);
      setProgressStep(0);
      toast.success("Pitch deck generated!");
    },
    onError: (err: Error) => {
      setProgressStep(0);
      toast.error(err?.message ?? "Failed to generate pitch deck");
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: (reportId: string) => pitchDeckService.regenerate(reportId),
    onSuccess: (deck) => {
      queryClient.invalidateQueries({ queryKey: ["pitch-decks"] });
      setViewingDeck(deck);
      toast.success("Pitch deck regenerated!");
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? "Failed to regenerate pitch deck");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pitchDeckService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pitch-decks"] });
      setViewingDeck(null);
      toast.success("Pitch deck deleted");
    },
  });

  useEffect(() => {
    if (generateMutation.isPending) {
      const timer = setInterval(() => {
        setProgressStep((s) => {
          if (s < PROGRESS_STEPS.length - 1) return s + 1;
          return s;
        });
      }, STEP_DURATION);
      return () => clearInterval(timer);
    }
  }, [generateMutation.isPending]);

  const handleGenerate = () => {
    if (!selectedReportId) return;
    setProgressStep(0);
    generateMutation.mutate(selectedReportId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasReports = reports.length > 0;
  const hasDecks = decks.length > 0;

  if (viewingDeck) {
    return (
      <DeckViewer
        deck={viewingDeck}
        onClose={() => setViewingDeck(null)}
        onRegenerate={() => regenerateMutation.mutate(viewingDeck.reportId)}
      />
    );
  }

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp} className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground/60">
            Pitch Decks
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-[28px]">Pitch Decks</h1>
          <p className="mt-1 text-sm text-muted-foreground">Investor-ready decks from your validation reports.</p>
        </div>
        {hasReports && !showGenerate && (
          <Button onClick={() => setShowGenerate(true)}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate deck
          </Button>
        )}
      </motion.div>

      {/* Generate panel */}
      {showGenerate && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-5 space-y-4"
        >
          {generateMutation.isPending ? (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Generating pitch deck&hellip;</h3>
              <GenerationProgress step={progressStep} isComplete={false} />
              <p className="text-xs text-muted-foreground">
                This usually takes a few seconds. Please don&apos;t close this page.
              </p>
            </div>
          ) : (
            <>
              <div>
                <div className="text-sm font-medium mb-2">Select a validated report</div>
                <Select value={selectedReportId} onValueChange={setSelectedReportId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a report..." />
                  </SelectTrigger>
                  <SelectContent>
                    {reports.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleGenerate} disabled={!selectedReportId}>
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating&hellip;
                    </>
                  ) : (
                    "Generate pitch deck"
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowGenerate(false)}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Empty state */}
      {!hasDecks ? (
        <motion.div variants={fadeUp} className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 shadow-sm">
            <Presentation className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <h2 className="text-lg font-semibold">No pitch decks yet</h2>
          <p className="mt-1.5 max-w-md text-sm text-muted-foreground leading-relaxed">
            {hasReports
              ? "Select a validated report and we'll turn it into a sleek, investor-ready pitch deck."
              : "Validate an idea first, then generate an investor-ready pitch deck from the report."}
          </p>
          {hasReports ? (
            <Button className="mt-8" onClick={() => setShowGenerate(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Generate your first deck
            </Button>
          ) : (
            <Link to="/dashboard/validate" className="mt-8">
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                Validate an idea
              </Button>
            </Link>
          )}
        </motion.div>
      ) : (
        <>
          {!showGenerate && (
            <motion.div variants={fadeUp} className="rounded-xl border border-border bg-gradient-to-r from-card/80 to-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 grid place-items-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Have a new report?</p>
                  <p className="text-xs text-muted-foreground">
                    Generate another pitch deck from a validated report.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setShowGenerate(true); setSelectedReportId(""); }}
              >
                <Plus className="mr-1 h-3 w-3" /> New deck
              </Button>
            </motion.div>
          )}

          <motion.div variants={fadeUp} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                onView={() => setViewingDeck(deck)}
                onRegenerate={() => regenerateMutation.mutate(deck.reportId)}
                onDelete={() => deleteMutation.mutate(deck.id)}
              />
            ))}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
