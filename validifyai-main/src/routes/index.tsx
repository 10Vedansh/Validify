import { createFileRoute } from "@tanstack/react-router";
import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { Story } from "@/components/landing/Story";
import { Features } from "@/components/landing/Features";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  return (
    <div className="min-h-screen">
      <LandingNav />
      <Hero />
      <Story />
      <Features />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
