import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Sparkles,
  Loader2,
  ArrowRight,
  Lightbulb,
  Users,
  DollarSign,
  Globe,
  Building2,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Target,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Gauge,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ideasService } from "@/services/ideas.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { staggerContainer, fadeUp } from "@/lib/motion";

export const Route = createFileRoute("/dashboard/validate")({ component: Validate });

const industries = ["AI / ML", "Fintech", "Healthtech", "Climate", "DevTools", "Consumer"];
const businessModels = ["SaaS", "Marketplace", "Transactional", "Usage-based", "Freemium"];

const steps = [
  { label: "Creating idea", key: "create" },
  { label: "Running AI analysis", key: "analyze" },
  { label: "Generating report", key: "report" },
  { label: "Done", key: "done" },
];

function FieldHint({ children }: { children: string }) {
  return <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{children}</p>;
}

function FileUpload({ files, onFiles }: { files: File[]; onFiles: (f: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const dropped = Array.from(e.dataTransfer.files);
      onFiles([...files, ...dropped]);
    },
    [files, onFiles],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        onFiles([...files, ...Array.from(e.target.files)]);
        e.target.value = "";
      }
    },
    [files, onFiles],
  );

  const removeFile = useCallback(
    (i: number) => onFiles(files.filter((_, idx) => idx !== i)),
    [files, onFiles],
  );

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-150",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border/60 hover:border-primary/50 hover:bg-accent/10",
        )}
      >
        <input ref={inputRef} type="file" multiple className="hidden" onChange={handleChange} />
        <div className="flex flex-col items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-card">
            <Upload className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              <span className="text-primary">Click to upload</span> or drag and drop
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Pitch deck, research, customer interviews &mdash; max 25MB
            </p>
          </div>
        </div>
      </div>
      {files.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm">
              <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate text-foreground">{f.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {(f.size / 1024 / 1024).toFixed(1)}MB
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                className="ml-1 rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ValidationProgress({ visible }: { visible: boolean }) {
  const [currentStep, setCurrentStep] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!visible) return;
    intervalRef.current = setInterval(() => {
      setCurrentStep((p) => {
        if (p >= steps.length - 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return p;
        }
        return p + 1;
      });
    }, 1800);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setCurrentStep(0);
    };
  }, [visible]);

  if (!visible) return null;

  const completionPct = Math.round(((currentStep) / (steps.length - 1)) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-6"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="relative grid h-9 w-9 place-items-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-foreground">Validating your idea</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Analyzing market viability</span>
            <span className="tabular-nums">&middot; {completionPct}%</span>
          </div>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-muted mb-5 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${completionPct}%` }}
        />
      </div>
      <div className="space-y-2">
        {steps.map((s, i) => {
          const isActive = i === currentStep;
          const isDone = i < currentStep;
          return (
            <div key={s.key} className="flex items-center gap-2.5">
              {isDone ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              ) : isActive ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
              ) : (
                <div className="h-4 w-4 shrink-0 rounded-full border border-border" />
              )}
              <span
                className={cn(
                  "text-sm transition-colors duration-300",
                  isDone ? "text-muted-foreground" : isActive ? "text-foreground font-medium" : "text-muted-foreground/50",
                )}
              >
                {s.label}
              </span>
              {isActive && <span className="text-[10px] text-primary animate-pulse ml-auto">In progress&hellip;</span>}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function SidebarCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 sticky top-20">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">How it works</span>
      </div>
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>
          <span className="text-foreground font-medium">1. Fill the brief</span>
          <br />The more detail you provide, the sharper the AI analysis will be.
        </p>
        <p>
          <span className="text-foreground font-medium">2. AI analysis runs</span>
          <br />Validify scores your idea against thousands of seed and Series&nbsp;A benchmarks.
        </p>
        <p>
          <span className="text-foreground font-medium">3. Get your report</span>
          <br />An investor-grade SWOT, market sizing, competitive landscape, and readiness score.
        </p>
      </div>
      <div className="border-t border-border/50 my-4" />
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
          <span>Real-time streaming analysis</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
          <span>Export to PDF and PPT</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
          <span>Co-founder chat follow-up</span>
        </div>
      </div>
    </div>
  );
}

function TipsCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="default" className="text-[10px] px-1.5 py-0">
          TIP
        </Badge>
        <span className="text-sm font-semibold text-foreground">Better results</span>
      </div>
      <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed">
        <li className="flex gap-2">
          <span className="text-primary mt-0.5">&bull;</span>
          Add competitor URLs for a comparative moat analysis
        </li>
        <li className="flex gap-2">
          <span className="text-primary mt-0.5">&bull;</span>
          Upload a pitch deck to extract key claims automatically
        </li>
        <li className="flex gap-2">
          <span className="text-primary mt-0.5">&bull;</span>
          Be specific about your audience for realistic TAM estimates
        </li>
      </ul>
    </div>
  );
}

function ScoredBadge({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? "text-emerald-400" : value >= 40 ? "text-amber-400" : "text-rose-400";
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-medium tabular-nums", color)}>{value}%</span>
    </div>
  );
}

function Validate() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [problem, setProblem] = useState("");
  const [audience, setAudience] = useState("");
  const [businessModel, setBusinessModel] = useState("");
  const [budget, setBudget] = useState("");
  const [country, setCountry] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !problem.trim()) {
      toast.error("Startup name and problem statement are required.");
      return;
    }
    setSubmitting(true);
    setShowProgress(true);
    try {
      const idea = await ideasService.create({
        name: name.trim(),
        industry: (industry as any) || "AI / ML",
        problem: problem.trim(),
        audience: audience.trim() || "Unknown",
        businessModel: (businessModel as any) || "SaaS",
        budget: budget || undefined,
        country: country || undefined,
        competitors: competitors
          ? competitors.split(",").map((c) => c.trim()).filter(Boolean)
          : undefined,
        notes: notes || undefined,
      });
      toast.success("Idea submitted. Running validation...");
      await ideasService.validate(idea.id);
      toast.success("Validation complete!");
      navigate({ to: "/dashboard/reports" });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create idea. Please try again.");
      setShowProgress(false);
    } finally {
      setSubmitting(false);
    }
  };

  const fieldCount = [
    name.trim(), industry, problem.trim(), audience.trim(), businessModel,
    budget.trim(), country.trim(), competitors.trim(), notes.trim(),
  ].filter(Boolean).length;

  return (
    <motion.div className="space-y-8" initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp}>
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground/60">
          Validation
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-[28px]">Validate a new idea</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground leading-relaxed">
          Fill in the brief &mdash; Validify will run a full investor-grade analysis with SWOT,
          market sizing, and readiness scoring.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        <form onSubmit={onSubmit} className="lg:col-span-2 space-y-6">
          <motion.div variants={fadeUp} className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-primary">
                <Lightbulb className="h-3.5 w-3.5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Basic Information</h2>
                <p className="text-xs text-muted-foreground">Tell us about your startup</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Startup Name <span className="text-destructive">*</span>
                </Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My Startup" />
                <FieldHint>A clear, memorable name for your venture.</FieldHint>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Industry</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((i) => (
                      <SelectItem key={i} value={i}>{i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldHint>Choose the closest category for benchmarking.</FieldHint>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="grid h-7 w-7 place-items-center rounded-md bg-emerald-500/10 text-emerald-400">
                <Users className="h-3.5 w-3.5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Problem &amp; Audience</h2>
                <p className="text-xs text-muted-foreground">Define the problem you&apos;re solving</p>
              </div>
            </div>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Problem Statement <span className="text-destructive">*</span>
                </Label>
                <Textarea value={problem} onChange={(e) => setProblem(e.target.value)} rows={3} placeholder="What painful, frequent problem are you solving — and for whom?" />
                <div className="flex items-center justify-between">
                  <FieldHint>Describe the pain point, who experiences it, and why existing solutions fall short.</FieldHint>
                  <span className={cn("text-xs tabular-nums", problem.length > 0 && problem.length < 20 ? "text-amber-400" : "text-muted-foreground")}>
                    {problem.length}/1000
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Target Audience</Label>
                <Input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. PMs at Series A SaaS companies" />
                <FieldHint>Who are your early adopters? Be specific about roles, company size, and industry.</FieldHint>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="grid h-7 w-7 place-items-center rounded-md bg-amber-500/10 text-amber-400">
                <Building2 className="h-3.5 w-3.5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Business Details</h2>
                <p className="text-xs text-muted-foreground">Revenue model and market context</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Business Model</Label>
                <Select value={businessModel} onValueChange={setBusinessModel}>
                  <SelectTrigger><SelectValue placeholder="Choose model" /></SelectTrigger>
                  <SelectContent>
                    {businessModels.map((i) => (
                      <SelectItem key={i} value={i}>{i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldHint>How will you generate revenue?</FieldHint>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Budget</Label>
                <div className="relative">
                  <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Available runway" className="pl-8" />
                </div>
                <FieldHint>Current funding, savings, or monthly burn.</FieldHint>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-sm font-medium">Country</Label>
                <div className="relative">
                  <Globe className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. United States" className="pl-8" />
                </div>
                <FieldHint>Primary market for your initial launch.</FieldHint>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="grid h-7 w-7 place-items-center rounded-md bg-indigo-500/10 text-indigo-400">
                <AlertCircle className="h-3.5 w-3.5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Competition</h2>
                <p className="text-xs text-muted-foreground">Who else is in the space?</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Competitor Links</Label>
              <Input value={competitors} onChange={(e) => setCompetitors(e.target.value)} placeholder="https://competitor1.com, https://competitor2.com" />
              <FieldHint>Comma-separated URLs. The AI will analyze each competitor&apos;s positioning.</FieldHint>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="grid h-7 w-7 place-items-center rounded-md bg-sky-500/10 text-sky-400">
                <FileText className="h-3.5 w-3.5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Additional Materials</h2>
                <p className="text-xs text-muted-foreground">Notes, files, and supporting docs</p>
              </div>
            </div>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Additional Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Anything else the AI should know? Team background, traction, patents, etc." />
                <FieldHint>Context that might not fit in the fields above.</FieldHint>
              </div>
              <FileUpload files={files} onFiles={setFiles} />
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span><span className="font-medium text-foreground">{fieldCount}</span> of 9 fields filled</span>
            </div>
            <Button type="submit" disabled={submitting} className="shadow-sm">
              {submitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing&hellip;</>
              ) : (
                <>Run AI validation <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </motion.div>
        </form>

        <aside className="space-y-5">
          <SidebarCard />
          <AnimatePresence>
            {showProgress && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <ValidationProgress visible={showProgress} />
              </motion.div>
            )}
          </AnimatePresence>
          <TipsCard />
        </aside>
      </div>
    </motion.div>
  );
}
