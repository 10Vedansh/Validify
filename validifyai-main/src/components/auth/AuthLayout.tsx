import { type ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { Link } from "@tanstack/react-router";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      {/* Form pane */}
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-8">{children}</div>
            {footer && (
              <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
            )}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">
            ← Back to validify.app
          </Link>
        </div>
      </div>

      {/* Visual pane */}
      <div className="relative hidden overflow-hidden border-l border-border bg-sidebar lg:flex">
        <div className="absolute inset-0 grid-pattern opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="relative flex w-full flex-col justify-between p-12">
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            AI-powered startup validation
          </div>
          <div className="max-w-md">
            <blockquote className="text-lg leading-snug tracking-tight text-foreground">
              Validate your startup idea against thousands of benchmarks. Get an investor-grade SWOT, market analysis, and readiness score in minutes.
            </blockquote>
          </div>
          <div className="text-xs text-muted-foreground">
            Your data is encrypted at rest and never used to train external models.
          </div>
        </div>
      </div>
    </div>
  );
}
