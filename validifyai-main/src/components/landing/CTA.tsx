import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl glass-strong p-12 sm:p-16 text-center">
          <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Stop guessing. <span className="text-gradient">Start validating.</span></h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Get investor-grade analysis on your startup idea in minutes.</p>
            <Link to="/register" className="inline-block mt-8">
              <Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow h-12 px-6">
                Create free account <ArrowRight className="ml-2 h-4 w-4"/>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
