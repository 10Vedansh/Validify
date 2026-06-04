import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Presentation, Inbox, Loader2, RefreshCw, Eye, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pitchDeckService, type PitchDeck, type PitchDeckSlide } from "@/services/pitch-deck.service";
import { reportsService } from "@/services/reports.service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/pitch")({ component: Pitch });

function SlideView({ slide, index, total }: { slide: PitchDeckSlide; index: number; total: number }) {
  const typeLabels: Record<string, string> = {
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

  return (
    <div className="glass-strong rounded-2xl p-8 min-h-[400px] flex flex-col">
      <div className="text-xs text-muted-foreground mb-1">{typeLabels[slide.type] ?? slide.type}</div>
      <h2 className="text-xl font-bold mb-4">{slide.title}</h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{slide.content}</p>
      {slide.bullets && slide.bullets.length > 0 && (
        <ul className="space-y-2">
          {slide.bullets.map((b, i) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              {b}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto pt-4 text-xs text-muted-foreground text-center">
        {index + 1} / {total}
      </div>
    </div>
  );
}

function DeckViewer({ deck, onClose, onRegenerate }: { deck: PitchDeck; onClose: () => void; onRegenerate: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = deck.content;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{deck.title}</h2>
          <p className="text-xs text-muted-foreground">Generated {new Date(deck.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRegenerate}><RefreshCw className="mr-1 h-3 w-3" /> Regenerate</Button>
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {slides.length > 0 && (
          <SlideView slide={slides[currentSlide]} index={currentSlide} total={slides.length} />
        )}

        <div className="flex items-center justify-center gap-3 mt-4">
          <Button variant="outline" size="sm" onClick={() => setCurrentSlide((p) => Math.max(0, p - 1))} disabled={currentSlide === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex gap-1">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)} className={`h-2 w-2 rounded-full ${i === currentSlide ? "bg-primary" : "bg-border"}`} />
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => setCurrentSlide((p) => Math.min(slides.length - 1, p + 1))} disabled={currentSlide === slides.length - 1}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Pitch() {
  const queryClient = useQueryClient();
  const [viewingDeck, setViewingDeck] = useState<PitchDeck | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string>("");
  const [showGenerate, setShowGenerate] = useState(false);

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
      toast.success("Pitch deck generated!");
    },
    onError: (err: any) => {
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
    onError: (err: any) => {
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

  const handleGenerate = () => {
    if (!selectedReportId) return;
    generateMutation.mutate(selectedReportId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Pitch Decks</h1>
          <p className="text-sm text-muted-foreground">AI-generated, investor-ready in minutes.</p>
        </div>
        {reports.length > 0 && (
          <Button className="bg-gradient-primary text-primary-foreground shadow-glow" onClick={() => setShowGenerate(!showGenerate)}>
            <Plus className="mr-2 h-4 w-4" />Generate deck
          </Button>
        )}
      </div>

      {showGenerate && (
        <div className="glass rounded-2xl p-5 space-y-4">
          <div>
            <div className="text-sm font-medium mb-2">Select a validated report</div>
            <Select value={selectedReportId} onValueChange={setSelectedReportId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a report..." />
              </SelectTrigger>
              <SelectContent>
                {reports.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGenerate} disabled={!selectedReportId || generateMutation.isPending} className="bg-gradient-primary text-primary-foreground">
            {generateMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating…</> : "Generate pitch deck"}
          </Button>
        </div>
      )}

      {decks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-primary/20 border border-primary/30 grid place-items-center mb-4">
            <Presentation className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No pitch decks yet</h2>
          <p className="text-sm text-muted-foreground max-w-md mb-6">Validate an idea first, then generate an investor-ready pitch deck from the report.</p>
          <Link to="/dashboard/validate">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <span className="inline-flex items-center gap-2 bg-gradient-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium shadow-glow">
                Validate an idea
              </span>
            </motion.div>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => (
            <motion.div key={deck.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 space-y-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-primary/20 border border-primary/30 grid place-items-center">
                <Presentation className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="font-semibold">{deck.title}</div>
                <div className="text-xs text-muted-foreground">{deck.content.length} slides · {new Date(deck.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setViewingDeck(deck)}>
                  <Eye className="mr-1 h-3 w-3" /> View
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => regenerateMutation.mutate(deck.reportId)}>
                  <RefreshCw className="mr-1 h-3 w-3" /> Regenerate
                </Button>
                <Button variant="outline" size="sm" className="text-destructive" onClick={() => deleteMutation.mutate(deck.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
