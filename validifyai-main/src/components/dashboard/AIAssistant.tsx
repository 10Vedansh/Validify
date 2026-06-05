import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import {
  X, Sparkles, Lightbulb, TrendingUp, Shield, ChevronRight, ArrowRight,
  Send, Bot, User, Loader2, Quote, BarChart3, Target, Search, Plus,
  Bookmark, Copy, ThumbsUp, ThumbsDown,
} from "lucide-react";
import { useDashboardStore } from "@/store/dashboard.store";
import { cn } from "@/lib/utils";
import { ease } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: { label: string; url?: string }[];
  timestamp: Date;
};

const suggestions = [
  {
    icon: Lightbulb,
    title: "Validate a new idea",
    description: "Run AI analysis on your latest concept",
    route: "/dashboard/validate",
  },
  {
    icon: TrendingUp,
    title: "Improve your scores",
    description: "Benchmark against top-rated startups in your industry",
    route: "/dashboard/reports",
  },
  {
    icon: Shield,
    title: "Strengthen your moat",
    description: "Competitive analysis shows 3 untapped differentiators",
    route: "/dashboard/reports",
  },
];

const suggestedQuestions = [
  "What should I improve before fundraising?",
  "Who are my biggest competitors?",
  "Explain my SWOT analysis",
  "How investor-ready am I?",
  "What's my strongest validation score?",
  "Compare my idea to similar startups",
];

const exampleResponses: Record<string, string> = {
  "What should I improve before fundraising?":
    "Based on your latest report, here are the top 3 areas to address before approaching investors:\n\n**1. Team Score (62/100)** — Investors want to see a balanced founding team. Consider adding a technical co-founder or advisor with domain expertise.\n\n**2. Traction (58/100)** — Even early revenue or pilot customers significantly de-risk your story. Aim for 3-5 letters of intent from potential customers.\n\n**3. Moat (65/100)** — Your competitive differentiation needs sharper articulation. Focus on the defensible technology or data advantage you're building.\n\nYour overall score of 74/100 is solid for seed stage. Addressing these 3 areas could push you to 85+.",
  "Who are my biggest competitors?":
    "Based on your competitive analysis, here are your top competitors ranked by overlap:\n\n**1. Competitor A** (Score: 78) — Strong product-market fit in enterprise. Their weakness is pricing, which you can undercut.\n\n**2. Competitor B** (Score: 72) — Early traction but weak moat. Their customer support is a differentiator you should match.\n\n**3. Competitor C** (Score: 65) — Closest to your approach but underfunded. Opportunity to out-execute on go-to-market.\n\n**Suggested action:** Focus on the 3 untapped differentiators identified in your moat analysis to create separation.",
  "Explain my SWOT analysis":
    "Here's a breakdown of your SWOT analysis:\n\n**Strengths** — Your team's domain expertise and early technology advantage are strong. The market timing is favorable.\n\n**Weaknesses** — Limited traction data and a relatively small addressable market in year 1 are the main concerns.\n\n**Opportunities** — The adjacent enterprise segment and potential partnership with Platform X are high-value moves.\n\n**Threats** — Competitor A's upcoming feature launch and potential regulatory changes in your target market.",
  "How investor-ready am I?":
    "Your Investor Readiness assessment:\n\n**Validation Score: 74/100** — Solid\n**Fundability Score: 68/100** — Needs work\n**Pitch Readiness: 71/100** — Good foundation\n**Market Confidence: 76/100** — Strong\n**Execution Risk: 65/100** — Moderate\n\n**Top recommendation:** Improve your traction metrics before fundraising. Even 3 customer letters of intent would significantly boost your fundability score.",
};

function simulateResponse(question: string): string {
  const normalized = question.toLowerCase().trim();
  for (const [key, response] of Object.entries(exampleResponses)) {
    if (normalized.includes(key.toLowerCase().slice(0, 20))) {
      return response;
    }
  }
  return `Great question about "${question}". Based on your startup profile and latest validation data, I recommend focusing on your **team composition** and **traction metrics** as the highest-leverage improvements before your next fundraising round. Would you like me to dive deeper into any specific area?`;
}

function TypewriterText({ text, speed = 20, onComplete }: { text: string; speed?: number; onComplete?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return <span>{displayed}</span>;
}

export function AIAssistant() {
  const navigate = useNavigate();
  const { aiPanelOpen, setAiPanelOpen } = useDashboardStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (question: string) => {
    if (!question.trim() || streaming) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: question, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setStreaming(true);

    const response = simulateResponse(question);
    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
      citations: [
        { label: "Validation Report", url: "/dashboard/reports" },
        { label: "Competitor Analysis" },
      ],
      timestamp: new Date(),
    };

    setTimeout(() => {
      setMessages((prev) => [...prev, assistantMsg]);
      setStreaming(false);
      setShowChat(true);
    }, 600);
  };

  const handleSuggestedAction = (route: string) => {
    navigate({ to: route as any });
    setAiPanelOpen(false);
  };

  const handleQuestionClick = (q: string) => {
    handleSend(q);
  };

  return (
    <AnimatePresence>
      {aiPanelOpen && (
        <motion.aside
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          transition={{ duration: 0.3, ease }}
          className="hidden lg:flex w-80 shrink-0 flex-col border-l border-border bg-background/60 backdrop-blur-xl overflow-hidden"
          role="complementary"
          aria-label="AI Copilot"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <div className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </div>
              <div>
                <span className="text-sm font-semibold text-foreground">AI Copilot</span>
                <span className="block text-[10px] text-emerald-400/80 leading-none mt-0.5">Online</span>
              </div>
            </div>
            <button
              onClick={() => setAiPanelOpen(false)}
              className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              aria-label="Close AI Copilot"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Messages */}
          {showChat && messages.length > 0 && (
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-2.5", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
                >
                  <div className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-lg mt-0.5",
                    msg.role === "assistant" ? "bg-primary/10 border border-primary/20" : "bg-accent border border-border",
                  )}>
                    {msg.role === "assistant" ? (
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <div className={cn("max-w-[85%]", msg.role === "user" ? "text-right" : "")}>
                    <div className={cn(
                      "rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
                      msg.role === "assistant"
                        ? "bg-card border border-border text-foreground"
                        : "bg-primary text-primary-foreground",
                    )}>
                      {msg.role === "assistant" && msg.id === messages[messages.length - 1]?.id && !streaming ? (
                        <TypewriterText text={msg.content} speed={15} />
                      ) : (
                        msg.content
                      )}
                    </div>
                    {msg.role === "assistant" && msg.citations && msg.citations.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5 justify-start">
                        {msg.citations.map((c) => (
                          <button
                            key={c.label}
                            onClick={() => c.url && navigate({ to: c.url as any })}
                            className="inline-flex items-center gap-1 rounded-md border border-border/40 bg-background/50 px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:border-border/60 transition-colors"
                          >
                            <Quote className="h-2.5 w-2.5" />
                            {c.label}
                          </button>
                        ))}
                      </div>
                    )}
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-1 mt-1 px-1">
                        <button className="rounded p-0.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                          <Copy className="h-3 w-3" />
                        </button>
                        <button className="rounded p-0.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                          <ThumbsUp className="h-3 w-3" />
                        </button>
                        <button className="rounded p-0.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                          <ThumbsDown className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {streaming && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground pl-10">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Thinking...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Content (welcome + suggestions) */}
          {!showChat && (
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
              <div>
                <h2 className="text-sm font-medium text-foreground mb-1">Hey there!</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  I'm your AI copilot. Ask me anything about your startup, reports, competitors, or fundraising.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/50">
                  <Sparkles className="h-3 w-3" />
                  Suggested actions
                </div>
                {suggestions.map((s) => (
                  <button
                    key={s.title}
                    onClick={() => handleSuggestedAction(s.route)}
                    className="w-full text-left rounded-xl border border-border/50 bg-card/50 p-3.5 transition-all hover:border-border hover:bg-card hover:shadow-sm group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 border border-primary/20">
                        <s.icon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground">{s.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{s.description}</div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors mt-0.5" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/50">
                  Ask me anything
                </div>
                <div className="space-y-1.5">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleQuestionClick(q)}
                      className="w-full text-left rounded-lg border border-border/30 bg-background/30 px-3.5 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:border-border/60 hover:bg-accent/30 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border px-4 py-3">
            <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/50 px-3 py-1.5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                placeholder="Ask your copilot..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || streaming}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground disabled:opacity-30 transition-opacity"
              >
                {streaming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
