import { useState } from "react";
import { Bell, Menu, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DashboardSidebar } from "./Sidebar";
import { Link } from "@tanstack/react-router";
import { SearchBar } from "@/components/common/SearchBar";
import { useDashboardStore } from "@/store/dashboard.store";
import { useAuth } from "@/hooks/useAuth";
import { initials } from "@/lib/format";

export function Topbar() {
  const [open, setOpen] = useState(false);
  const { search, setSearch } = useDashboardStore();
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur sm:px-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-60 p-0">
          <DashboardSidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search ideas, reports, threads…"
        className="max-w-sm flex-1"
        shortcut="⌘K"
      />

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" className="hidden h-8 w-8 sm:inline-flex">
          <Command className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 flex h-8 items-center gap-2 rounded-md px-1.5 transition-colors hover:bg-accent">
              <div className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {user ? initials(user.name) : "?"}
              </div>
              <span className="hidden text-sm font-medium sm:inline">{user?.name?.split(" ")[0] ?? "User"}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              {user?.email ?? ""}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/dashboard/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
