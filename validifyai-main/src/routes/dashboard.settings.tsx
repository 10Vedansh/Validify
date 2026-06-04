import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Copy, KeyRound, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/dashboard/settings")({ component: Settings });

function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile, subscription, and security.</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="glass">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6 glass rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-primary grid place-items-center text-xl font-semibold text-primary-foreground">
              {user?.name ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U"}
            </div>
            <div>
              <Button variant="outline" size="sm" className="glass">Upload photo</Button>
              <p className="text-xs text-muted-foreground mt-2">PNG or JPG · max 2MB</p>
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
            <Button variant="outline" className="text-destructive border-destructive/30" onClick={() => { logout(); navigate({ to: "/login" }); }}>
              Sign out
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="theme" className="mt-6 glass rounded-2xl p-6">
          <div className="font-semibold mb-3">Appearance</div>
          <div className="grid grid-cols-3 gap-3">
            {["Dark", "Light", "System"].map((t, i) => (
              <button key={t} className={`glass rounded-xl p-4 text-left ${i === 0 ? "ring-1 ring-primary" : ""}`}>
                <div className="h-16 rounded-lg bg-gradient-primary opacity-80 mb-3" />
                <div className="text-sm font-medium">{t}</div>
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-6 glass rounded-2xl p-6 space-y-5">
          <div className="space-y-1.5"><Label>Current password</Label><Input type="password" /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>New password</Label><Input type="password" /></div>
            <div className="space-y-1.5"><Label>Confirm</Label><Input type="password" /></div>
          </div>
          <div className="flex items-center justify-between border-t border-border/60 pt-4">
            <div><div className="text-sm font-medium">Two-factor authentication</div><p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p></div>
            <Switch />
          </div>
          <Button className="bg-gradient-primary text-primary-foreground">Update security</Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
