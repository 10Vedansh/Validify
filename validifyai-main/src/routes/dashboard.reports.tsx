import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { reportsService } from "@/services/reports.service";
import {
  FileText, Download, Share2, AlertTriangle, ShieldCheck, Lightbulb, TrendingUp,
  ArrowLeft, Inbox, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import type { ComponentType, ReactNode } from "react";

export const Route = createFileRoute("/dashboard/reports")({ component: Reports });

type SectionTone = "primary" | "chart-3" | "chart-4" | "chart-2" | "chart-5";

const toneStyles: Record<SectionTone, { bg: string; border: string; text: string }> = {
  primary: { bg: "bg-primary/20", border: "border-primary/30", text: "text-primary" },
  "chart-3": { bg: "bg-chart-3/20", border: "border-chart-3/30", text: "text-chart-3" },
  "chart-4": { bg: "bg-chart-4/20", border: "border-chart-4/30", text: "text-chart-4" },
  "chart-2": { bg: "bg-chart-2/20", border: "border-chart-2/30", text: "text-chart-2" },
  "chart-5": { bg: "bg-chart-5/20", border: "border-chart-5/30", text: "text-chart-5" },
};

function SectionCard({ icon: Icon, title, children, tone = "primary" }: { icon: ComponentType<{ className?: string }>; title: string; children: ReactNode; tone?: SectionTone }) {
  const s = toneStyles[tone] ?? toneStyles.primary;
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${s.bg} border ${s.border}`}><Icon className={`h-4 w-4 ${s.text}`}/></span>
        <div className="font-semibold">{title}</div>
      </div>
      {children}
    </div>
  );
}

function Reports() {
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: () => reportsService.list(),
  });

  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">AI-generated validation reports for your ideas.</p>
        </div>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-primary/20 border border-primary/30 grid place-items-center mb-4">
            <Inbox className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No reports yet</h2>
          <p className="text-sm text-muted-foreground max-w-md mb-6">Validate an idea to generate an investor-grade report.</p>
          <Link to="/dashboard/validate">
            <span className="inline-flex items-center gap-2 bg-gradient-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium shadow-glow">
              <Lightbulb className="h-4 w-4" />
              Validate an idea
            </span>
          </Link>
        </div>
      </div>
    );
  }

  const report = reports[0];

  const radarData = [
    { axis: "Market", v: report.score.market },
    { axis: "Team", v: report.score.team },
    { axis: "Moat", v: report.score.moat },
    { axis: "Monetization", v: report.score.monetization },
    { axis: "Traction", v: report.score.traction },
    { axis: "Risk", v: report.score.risk },
  ];

  const swotSections = report.swot ? [
    { icon: ShieldCheck, title: "Strengths", tone: "chart-3" as const, items: report.swot.strengths },
    { icon: AlertTriangle, title: "Weaknesses", tone: "chart-4" as const, items: report.swot.weaknesses },
    { icon: Lightbulb, title: "Opportunities", tone: "chart-2" as const, items: report.swot.opportunities },
    { icon: TrendingUp, title: "Threats", tone: "chart-5" as const, items: report.swot.threats },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button onClick={() => navigate({ to: "/dashboard" })} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-1">
            <ArrowLeft className="h-3 w-3" /> Back to dashboard
          </button>
          <div className="text-xs text-muted-foreground">Report · #{report.id.slice(0, 8).toUpperCase()}</div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">{report.title}</h1>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="border-primary/40 text-primary">{report.industry}</Badge>
            <Badge variant="outline" className="border-chart-3/40 text-chart-3">Score {report.score.overall}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="glass" onClick={() => reportsService.exportPdf(report.id)}><Download className="mr-2 h-4 w-4"/>PDF</Button>
          <Button variant="outline" className="glass"><FileText className="mr-2 h-4 w-4"/>PPT</Button>
          <Button className="bg-gradient-primary text-primary-foreground"><Share2 className="mr-2 h-4 w-4"/>Share</Button>
        </div>
      </div>

      {report.summary && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 glass-strong rounded-2xl p-6">
            <div className="text-xs text-muted-foreground">Executive Summary</div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{report.summary}</p>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="text-xs text-muted-foreground">Readiness radar</div>
            <div className="h-56">
              <ResponsiveContainer>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="oklch(1 0 0 / 0.1)"/>
                  <PolarAngleAxis dataKey="axis" tick={{ fill: "oklch(0.7 0.02 260)", fontSize: 11 }}/>
                  <Radar dataKey="v" stroke="oklch(0.75 0.18 280)" fill="oklch(0.75 0.18 280)" fillOpacity={0.3}/>
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {report.swot && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {swotSections.map((s) => (
            <SectionCard key={s.title} icon={s.icon} title={s.title} tone={s.tone}>
              <ul className="text-sm space-y-1.5 text-muted-foreground list-disc pl-4">
                {s.items.map((item: string) => <li key={item}>{item}</li>)}
              </ul>
            </SectionCard>
          ))}
        </div>
      )}

      {report.competitors && report.competitors.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <div className="font-semibold mb-3">Competitor benchmark</div>
          <div className="divide-y divide-border/60">
            {report.competitors.map((c) => (
              <div key={c.name} className="flex items-center justify-between py-2 text-sm">
                <span>{c.name}</span>
                <Badge variant="outline" className="border-primary/30 text-primary">{c.score}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {report.roadmap && report.roadmap.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <div className="font-semibold mb-3">Roadmap</div>
          <ol className="relative border-l border-border ml-3 space-y-5">
            {report.roadmap.map((m, i) => (
              <li key={i} className="ml-4">
                <span className="absolute -left-1.5 h-3 w-3 rounded-full bg-gradient-primary shadow-glow"/>
                <div className="text-xs text-muted-foreground">{m.quarter}</div>
                <div className="text-sm">{m.label}</div>
              </li>
            ))}
          </ol>
        </div>
      )}

      <Accordion type="multiple" className="glass rounded-2xl px-6">
        <AccordionItem value="report-details" className="border-border/60">
          <AccordionTrigger className="text-left">Report details</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <div className="text-sm space-y-1">
              <p><strong>ID:</strong> {report.id}</p>
              <p><strong>Created:</strong> {new Date(report.createdAt).toLocaleDateString()}</p>
              <p><strong>Overall Score:</strong> {report.score.overall}/100</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
