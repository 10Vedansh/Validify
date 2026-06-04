import { Logo } from "@/components/Logo";
import { Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-12 mt-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            AI-powered startup validation for the next generation of builders.
          </p>
          <div className="mt-5 flex gap-3 text-muted-foreground">
            <a href="#" aria-label="GitHub" className="hover:text-foreground">
              <Github className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-foreground">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="#" aria-label="LinkedIn" className="hover:text-foreground">
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>
        {[
          { t: "Product", l: ["Features", "Pricing", "Dashboard", "Changelog"] },
          { t: "Company", l: ["About", "Customers", "Careers", "Press"] },
          { t: "Legal", l: ["Terms", "Privacy", "Security", "DPA"] },
        ].map((c) => (
          <div key={c.t}>
            <div className="text-sm font-medium mb-3">{c.t}</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {c.l.map((i) => (
                <li key={i}>
                  <a href="#" className="hover:text-foreground">
                    {i}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-border/50 text-xs text-muted-foreground flex flex-col sm:flex-row justify-between gap-2">
        <div>&copy; 2026 Validify AI &middot; All rights reserved</div>
        <div>Built for founders</div>
      </div>
    </footer>
  );
}
