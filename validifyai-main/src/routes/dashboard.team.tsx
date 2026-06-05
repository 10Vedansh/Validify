import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Plus, Mail, Crown, Shield, User, X, Check,
  Activity, Sparkles, Clock, FileText, Loader2,
  ChevronRight, MoreHorizontal, Copy, Trash2, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { staggerContainer, fadeUp } from "@/lib/motion";

export const Route = createFileRoute("/dashboard/team")({ component: TeamPage });

type Role = "owner" | "admin" | "member" | "viewer";
type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: Role;
  joined: string;
  avatar?: string;
};

type ActivityItem = {
  id: string;
  type: "report" | "deck" | "validation" | "member" | "settings";
  user: string;
  action: string;
  target: string;
  timestamp: string;
};

const mockMembers: TeamMember[] = [
  { id: "1", name: "Alex Chen", email: "alex@startup.com", role: "owner", joined: "Jan 2025" },
  { id: "2", name: "Sarah Kim", email: "sarah@startup.com", role: "admin", joined: "Feb 2025" },
  { id: "3", name: "Marcus Johnson", email: "marcus@startup.com", role: "member", joined: "Mar 2025" },
  { id: "4", name: "Priya Patel", email: "priya@startup.com", role: "viewer", joined: "Apr 2025" },
];

const mockActivity: ActivityItem[] = [
  { id: "1", type: "report", user: "Alex Chen", action: "generated a report for", target: "AI SaaS Platform", timestamp: "2 hours ago" },
  { id: "2", type: "validation", user: "Sarah Kim", action: "completed validation for", target: "Fintech App", timestamp: "4 hours ago" },
  { id: "3", type: "deck", user: "Marcus Johnson", action: "updated pitch deck", target: "Q2 Investor Deck", timestamp: "Yesterday" },
  { id: "4", type: "member", user: "Priya Patel", action: "joined the workspace", target: "", timestamp: "2 days ago" },
  { id: "5", type: "report", user: "Alex Chen", action: "exported report", target: "Market Analysis 2025", timestamp: "3 days ago" },
];

const roleLabels: Record<Role, string> = { owner: "Owner", admin: "Admin", member: "Member", viewer: "Viewer" };
const roleColors: Record<Role, string> = { owner: "text-amber-400 bg-amber-500/10 border-amber-500/20", admin: "text-primary bg-primary/10 border-primary/20", member: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", viewer: "text-muted-foreground bg-muted border-border" };

function getInitials(name: string) { return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(); }

function TeamPage() {
  const [members] = useState<TeamMember[]>(mockMembers);
  const [activity] = useState<ActivityItem[]>(mockActivity);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("member");
  const [inviting, setInviting] = useState(false);

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setTimeout(() => {
      setInviting(false);
      setInviteEmail("");
      setShowInvite(false);
    }, 1500);
  };

  return (
    <motion.div className="space-y-8" initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp} className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground/60">Team</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-[28px]">Team &amp; Collaboration</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage members, roles, and workspace activity.</p>
        </div>
        <Button onClick={() => setShowInvite(true)}><Plus className="mr-1.5 h-4 w-4" /> Invite member</Button>
      </motion.div>

      {showInvite && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="text-sm font-semibold">Invite team member</h3>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@company.com" />
            </div>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as Role)}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>
            <Button onClick={handleInvite} disabled={!inviteEmail.trim() || inviting}>
              {inviting ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Sending...</> : "Send invite"}
            </Button>
            <Button variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
          </div>
          <p className="text-xs text-muted-foreground">They'll receive an email with instructions to join your workspace.</p>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div variants={fadeUp} className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Members ({members.length})
            </h2>
            <div className="space-y-2">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-background/30 p-3 hover:bg-accent/20 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">{getInitials(m.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{m.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{m.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[11px] font-medium rounded-md border px-2 py-0.5", roleColors[m.role])}>
                      {m.role === "owner" && <Crown className="h-3 w-3 inline mr-0.5" />}
                      {roleLabels[m.role]}
                    </span>
                    <span className="text-xs text-muted-foreground hidden sm:block">{m.joined}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-6">
          {/* Activity feed */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Activity</h2>
            </div>
            <div className="space-y-3">
              {activity.map((a) => {
                const icons = { report: FileText, deck: FileText, validation: Sparkles, member: Users, settings: RefreshCw };
                const Icon = icons[a.type];
                return (
                  <div key={a.id} className="flex gap-3">
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 border border-primary/20 mt-0.5">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-foreground leading-relaxed">
                        <span className="font-medium">{a.user}</span> {a.action} {a.target && <span className="text-muted-foreground">{a.target}</span>}
                      </p>
                      <span className="text-[10px] text-muted-foreground/60">{a.timestamp}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Role info */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold mb-3">Roles &amp; Permissions</h2>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Crown className="h-3 w-3 text-amber-400" /> Owner — Full access, billing</div>
              <div className="flex items-center gap-2"><Shield className="h-3 w-3 text-primary" /> Admin — Manage members, settings</div>
              <div className="flex items-center gap-2"><User className="h-3 w-3 text-emerald-400" /> Member — Create and edit</div>
              <div className="flex items-center gap-2"><Mail className="h-3 w-3 text-muted-foreground" /> Viewer — Read-only access</div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
