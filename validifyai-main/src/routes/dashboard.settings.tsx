import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import {
  Copy, KeyRound, Trash2, Sun, Moon, Monitor,
  Layout, Grid3X3, Maximize2, Minimize2,
  Eye, EyeOff, GripVertical, Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useThemeStore } from "@/store/theme.store";
import { usePreferencesStore, type WorkspaceMode } from "@/store/preferences.store";
import { cn } from "@/lib/utils";
import { staggerContainer, fadeUp } from "@/lib/motion";

export const Route = createFileRoute("/dashboard/settings")({ component: Settings });

const widgets = [
  { id: "stats" as const, label: "Statistics Overview", description: "Score cards and key metrics" },
  { id: "trends" as const, label: "Trends Chart", description: "Validation activity over time" },
  { id: "feed" as const, label: "Founder Intelligence Feed", description: "Market trends and funding activity" },
  { id: "recent" as const, label: "Recent Activity", description: "Latest reports and validations" },
  { id: "investor" as const, label: "Investor Readiness", description: "Fundability score summary" },
  { id: "team" as const, label: "Team Activity", description: "Recent team actions" },
];

function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useThemeStore();
  const { workspaceMode, setWorkspaceMode, widgets: widgetConfigs, toggleWidget } = usePreferencesStore();

  const modes: { value: WorkspaceMode; icon: typeof Layout; label: string; desc: string }[] = [
    { value: "compact", icon: Minimize2, label: "Compact", desc: "Denser layout, more content" },
    { value: "comfortable", icon: Layout, label: "Comfortable", desc: "Balanced spacing" },
    { value: "expanded", icon: Maximize2, label: "Expanded", desc: "Maximum breathing room" },
  ];

  const themeOptions = [
    { value: "dark" as const, icon: Moon, label: "Dark" },
    { value: "light" as const, icon: Sun, label: "Light" },
    { value: "system" as const, icon: Monitor, label: "System" },
  ];

  return (
    <motion.div className="space-y-6 max-w-5xl" initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp}>
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground/60">Settings</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-[28px]">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your profile, workspace, and preferences.</p>
      </motion.div>

      <Tabs defaultValue="profile">
        <TabsList className="glass">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="theme">Appearance</TabsTrigger>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6 glass rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-primary grid place-items-center text-xl font-semibold text-primary-foreground">
              {user?.name
                ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                : "U"}
            </div>
            <div>
              <Button variant="outline" size="sm" className="glass">Upload photo</Button>
              <p className="text-xs text-muted-foreground mt-2">PNG or JPG &middot; max 2MB</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input defaultValue={user?.name ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input defaultValue={user?.email ?? ""} disabled />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Plan</Label>
              <Input defaultValue={user?.plan ?? "free"} disabled />
            </div>
          </div>
          <Button className="bg-gradient-primary text-primary-foreground">Save changes</Button>
          <div className="border-t border-border/60 pt-4">
            <Button
              variant="outline"
              className="text-destructive border-destructive/30"
              onClick={() => { logout(); navigate({ to: "/login" }); }}
            >
              Sign out
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="theme" className="mt-6 glass rounded-2xl p-6 space-y-6">
          <div>
            <div className="font-semibold mb-3">Theme</div>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const active = theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={cn(
                      "rounded-xl border p-4 text-left transition-all",
                      active ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border/50 hover:border-border bg-card/50",
                    )}
                  >
                    <div className={cn(
                      "h-16 rounded-lg mb-3 flex items-center justify-center transition-colors",
                      active ? "bg-gradient-primary" : "bg-muted",
                    )}>
                      <Icon className={cn("h-6 w-6", active ? "text-primary-foreground" : "text-muted-foreground")} />
                    </div>
                    <div className="text-sm font-medium">{opt.label}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="workspace" className="mt-6 space-y-6">
          <motion.div variants={fadeUp} className="glass rounded-2xl p-6 space-y-6">
            <div>
              <div className="font-semibold mb-3">Layout Density</div>
              <div className="grid grid-cols-3 gap-3">
                {modes.map((mode) => {
                  const Icon = mode.icon;
                  const active = workspaceMode === mode.value;
                  return (
                    <button
                      key={mode.value}
                      onClick={() => setWorkspaceMode(mode.value)}
                      className={cn(
                        "rounded-xl border p-4 text-left transition-all",
                        active ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border/50 hover:border-border bg-card/50",
                      )}
                    >
                      <div className={cn(
                        "h-12 rounded-lg mb-3 flex items-center justify-center",
                        active ? "bg-primary/10" : "bg-muted",
                      )}>
                        <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
                      </div>
                      <div className="text-sm font-medium">{mode.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{mode.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-border/60 pt-6">
              <div className="font-semibold mb-3">Dashboard Widgets</div>
              <p className="text-xs text-muted-foreground mb-4">Show or hide sections on the dashboard overview.</p>
              <div className="space-y-2">
                {widgets.map((w) => {
                  const config = widgetConfigs.find((c) => c.id === w.id);
                  const visible = config?.visible ?? true;
                  return (
                    <div key={w.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30" />
                        <div className="min-w-0">
                          <div className="text-sm text-foreground">{w.label}</div>
                          <div className="text-xs text-muted-foreground">{w.description}</div>
                        </div>
                      </div>
                      <Switch checked={visible} onCheckedChange={() => toggleWidget(w.id)} />
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="security" className="mt-6 glass rounded-2xl p-6 space-y-5">
          <div className="space-y-1.5">
            <Label>Current password</Label>
            <Input type="password" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>New password</Label>
              <Input type="password" />
            </div>
            <div className="space-y-1.5">
              <Label>Confirm</Label>
              <Input type="password" />
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-border/60 pt-4">
            <div>
              <div className="text-sm font-medium">Two-factor authentication</div>
              <p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
            </div>
            <Switch />
          </div>
          <Button className="bg-gradient-primary text-primary-foreground">Update security</Button>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
