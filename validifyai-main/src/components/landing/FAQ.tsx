import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "How does Validify generate insights?", a: "We combine proprietary benchmark datasets with frontier LLMs to produce investor-grade analysis tailored to your idea." },
  { q: "Is my idea kept private?", a: "Always. Your data is encrypted at rest and never used to train external models." },
  { q: "Can I export my reports?", a: "Yes — every report exports to PDF, PPT, and shareable links on Pro and above." },
  { q: "Do you support teams?", a: "Enterprise includes workspaces, SSO, and role-based permissions." },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm text-primary font-medium">FAQ</p>
          <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight">Questions, answered</h2>
        </div>
        <Accordion type="single" collapsible className="glass rounded-2xl px-6">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`i${i}`} className="border-border/60">
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
