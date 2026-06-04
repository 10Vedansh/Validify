import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-12 sm:p-16 text-center">
          <div className="absolute inset-0 bg-primary/10 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">
              Stop guessing. <span className="text-muted-foreground">Start validating.</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Get investor-grade analysis on your startup idea in minutes.
            </p>
            <Link to="/register" className="inline-block mt-8">
              <Button size="lg" className="h-12 px-6 shadow-md">
                Create free account <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
