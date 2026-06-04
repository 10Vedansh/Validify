import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

const links = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Changelog", href: "#faq" },
  { label: "Docs", href: "#faq" },
];

export function LandingNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            {links.map((l) => (
              <a key={l.label} href={l.href} className="transition-colors hover:text-foreground">
                {l.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="hidden items-center gap-1 md:flex">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Sign in
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm" className="h-8">
              Get started
            </Button>
          </Link>
        </div>
        <button className="p-2 md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="space-y-3 border-t border-border bg-background px-6 py-4 md:hidden">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="block text-sm text-muted-foreground"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <div className="flex gap-2 pt-2">
            <Link to="/login" className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                Sign in
              </Button>
            </Link>
            <Link to="/register" className="flex-1">
              <Button size="sm" className="w-full">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
