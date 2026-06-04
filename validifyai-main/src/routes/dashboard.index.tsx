import { createFileRoute, Link } from "@tanstack/react-router";
import { Lightbulb, Gauge, Sparkles, TrendingUp, ArrowRight, Inbox } from "lucide-react";
import { motion } from "framer-motion";
import { StatCard } from "@/components/dashboard/StatCard";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { ideasService } from "@/services/ideas.service";
import { reportsService } from "@/services/reports.service";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/")({ component: Dashboard });

function Dashboard() {
  const { user } = useAuth();

  const { data: ideas = [] } = useQuery({
    queryKey: ["ideas"],
    queryFn: () => ideasService.list(),
  });

  const { data: reports = [] } = useQuery({
    queryKey: ["reports"],
    queryFn: () => reportsService.list(),
  });

  const totalIdeas = ideas.length;
  const validationsDone = reports.length;
  const avgScore = reports.length > 0
    ? Math.round(reports.reduce((sum, r) => sum + r.score.overall, 0) / reports.length)
    : null;
  const hasData = ideas.length > 0 || reports.length > 0;

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}</h1>
            <p className="text-sm text-muted-foreground">Start validating your first idea to see insights here.</p>
          </div>
          <Link to="/dashboard/validate" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">New validation <ArrowRight className="h-3.5 w-3.5"/></Link>
        </div>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-primary/20 border border-primary/30 grid place-items-center mb-4">
            <Inbox className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No ideas yet</h2>
          <p className="text-sm text-muted-foreground max-w-md mb-6">Submit your first idea for AI validation and your dashboard will populate with scores, reports, and recommendations.</p>
          <Link to="/dashboard/validate">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <span className="inline-flex items-center gap-2 bg-gradient-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium shadow-glow">
                <Sparkles className="h-4 w-4" />
                Validate your first idea
              </span>
            </motion.div>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}</h1>
          <p className="text-sm text-muted-foreground">Here's what's happening across your portfolio of ideas.</p>
        </div>
        <Link to="/dashboard/validate" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">New validation <ArrowRight className="h-3.5 w-3.5"/></Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Lightbulb, label: "Total Ideas", value: String(totalIdeas) },
          { icon: Gauge, label: "Avg Validation Score", value: avgScore !== null ? String(avgScore) : "—" },
          { icon: TrendingUp, label: "Reports Generated", value: String(validationsDone) },
          { icon: Sparkles, label: "Ideas Validated", value: String(validationsDone) },
        ].map((s, i) => (
          <motion.div key={i} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs text-muted-foreground">Latest ideas</div>
              <div className="text-lg font-semibold">Your ideas</div>
            </div>
            <Badge variant="outline" className="border-primary/40 text-primary">{ideas.length} total</Badge>
          </div>
          {ideas.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">No ideas yet. Create one to get started.</div>
          ) : (
            <div className="divide-y divide-border/60">
              {ideas.map((idea) => (
                <div key={idea.id} className="flex items-center gap-4 py-3 rounded-lg px-2">
                  <div className="h-10 w-10 rounded-lg bg-gradient-primary/20 border border-primary/30 grid place-items-center text-sm font-semibold">{idea.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{idea.name}</div>
                    <div className="text-xs text-muted-foreground">{idea.industry}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="text-lg font-semibold mb-3">Recent validations</div>
          {reports.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">No validation reports yet.</div>
          ) : (
            <div className="space-y-3">
              {reports.slice(0, 5).map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{r.title}</span>
                  <Badge variant="outline" className="border-primary/30 text-primary shrink-0 ml-2">{r.score.overall}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
