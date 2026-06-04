import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Upload, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ideasService } from "@/services/ideas.service";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/validate")({ component: Validate });

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
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !problem.trim()) {
      toast.error("Startup name and problem statement are required.");
      return;
    }
    setSubmitting(true);
    try {
      const idea = await ideasService.create({
        name: name.trim(),
        industry: industry as any || "AI / ML",
        problem: problem.trim(),
        audience: audience.trim() || "Unknown",
        businessModel: (businessModel as any) || "SaaS",
        budget: budget || undefined,
        country: country || undefined,
        competitors: competitors ? competitors.split(",").map((c) => c.trim()).filter(Boolean) : undefined,
        notes: notes || undefined,
      });
      toast.success("Idea submitted. Running validation...");
      await ideasService.validate(idea.id);
      toast.success("Validation complete!");
      navigate({ to: "/dashboard/reports" });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create idea. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Validate a new idea</h1>
        <p className="text-sm text-muted-foreground">Fill in the brief — Validify will run a full investor-grade analysis.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <form onSubmit={onSubmit} className="lg:col-span-2 glass rounded-2xl p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Startup Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My Startup" /></div>
            <div className="space-y-1.5"><Label>Industry</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                <SelectContent>{["AI / ML", "Fintech", "Healthtech", "Climate", "DevTools", "Consumer"].map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5"><Label>Problem Statement *</Label>
            <Textarea value={problem} onChange={(e) => setProblem(e.target.value)} rows={3} placeholder="What painful, frequent problem are you solving — and for whom?" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Target Audience</Label><Input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. PMs at Series A SaaS" /></div>
            <div className="space-y-1.5"><Label>Business Model</Label>
              <Select value={businessModel} onValueChange={setBusinessModel}>
                <SelectTrigger><SelectValue placeholder="Choose model" /></SelectTrigger>
                <SelectContent>{["SaaS", "Marketplace", "Transactional", "Usage-based", "Freemium"].map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Budget</Label><Input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="$ available runway" /></div>
            <div className="space-y-1.5"><Label>Country</Label><Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. United States" /></div>
          </div>
          <div className="space-y-1.5"><Label>Competitor Links</Label><Input value={competitors} onChange={(e) => setCompetitors(e.target.value)} placeholder="https://... (comma separated)" /></div>
          <div className="space-y-1.5"><Label>Additional Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Anything else AI should know?" /></div>

          <label className="block border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <Upload className="h-5 w-5 mx-auto text-muted-foreground" />
            <div className="mt-2 text-sm">Drop files or <span className="text-primary">browse</span></div>
            <div className="text-xs text-muted-foreground">Pitch deck, research, customer interviews · max 25MB</div>
            <input type="file" className="hidden" />
          </label>

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">All fields help sharpen the AI analysis</div>
            <Button type="submit" disabled={submitting} className="bg-gradient-primary text-primary-foreground shadow-glow">
              {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing…</> : <>Run AI validation <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          </div>
        </form>

        <aside className="space-y-4">
          <div className="glass rounded-2xl p-5 sticky top-20">
            <div className="text-xs text-muted-foreground">How it works</div>
            <div className="mt-3 text-sm space-y-3 text-muted-foreground">
              <p>Fill in the form describing your startup idea. The more detail you provide, the more accurate the AI analysis will be.</p>
              <p>Once submitted, Validify will generate an investor-grade report including SWOT analysis, market sizing, competitive landscape, and readiness score.</p>
              <p>Results are available on the Reports page after validation completes.</p>
            </div>
            <div className="mt-5 pt-4 border-t border-border/60">
              <div className="flex items-center gap-2 text-xs">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="text-muted-foreground">Powered by AI · Results in seconds</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
