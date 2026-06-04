import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Send,
  Plus,
  Bot,
  User,
  MessageSquare,
  Sparkles,
  Lightbulb,
  TrendingUp,
  DollarSign,
  Target,
  Rocket,
  Clock,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { chatService } from "@/services/chat.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ChatThread } from "@/types/report";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/cofounder")({ component: CoFounder });

const SUGGESTED_PROMPTS = [
  { icon: DollarSign, label: "Validate my pricing" },
  { icon: TrendingUp, label: "Revenue model ideas" },
  { icon: Rocket, label: "Fundraising advice" },
  { icon: Target, label: "Find competitors" },
  { icon: Lightbulb, label: "Go-to-market strategy" },
];

function CoFounder() {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: threads = [] } = useQuery({
    queryKey: ["chat-threads"],
    queryFn: () => chatService.threads(),
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["chat-messages", selectedThreadId],
    queryFn: () => chatService.messages(selectedThreadId!),
    enabled: !!selectedThreadId,
  });

  const selectedThread = threads.find((t) => t.id === selectedThreadId) ?? null;

  const createMutation = useMutation({
    mutationFn: () => chatService.createThread("New chat"),
    onSuccess: (thread) => {
      setSelectedThreadId(thread.id);
      queryClient.invalidateQueries({ queryKey: ["chat-threads"] });
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      let threadId = selectedThreadId;

      if (!threadId) {
        const thread = await chatService.createThread("New chat");
        threadId = thread.id;
        setSelectedThreadId(threadId);
        queryClient.setQueryData<ChatThread[]>(["chat-threads"], (old = []) => [thread, ...old]);
      }

      const reader = chatService.send(threadId, content);
      for await (const chunk of reader) {
        setStreaming((prev) => prev + chunk);
      }
      return threadId;
    },
    onSuccess: (threadId) => {
      if (threadId) {
        queryClient.invalidateQueries({ queryKey: ["chat-messages", threadId] });
      }
      queryClient.invalidateQueries({ queryKey: ["chat-threads"] });
    },
  });

  const handleSend = (value?: string) => {
    const text = value ?? input;
    if (!text.trim() || sendMutation.isPending) return;
    setStreaming("");
    sendMutation.mutate(text);
    setInput("");
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, streaming]);

  return (
    <div className="grid lg:grid-cols-[280px_1fr_260px] gap-4 h-[calc(100vh-7rem)]">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-3 border-b border-border">
          <Button
            className="w-full"
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
          >
            <Plus className="mr-2 h-4 w-4" />
            New chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-xs text-muted-foreground">No conversations yet</p>
            </div>
          ) : (
            threads.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedThreadId(t.id)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors",
                  "hover:bg-accent/50",
                  selectedThreadId === t.id
                    ? "bg-accent border-l-2 border-primary"
                    : "border-l-2 border-transparent",
                )}
              >
                <div className="truncate font-medium text-sm">{t.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3 text-muted-foreground/60" />
                  <span className="text-xs text-muted-foreground/60">
                    {formatDate(t.updatedAt)}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Main Chat */}
      <div className="flex flex-col rounded-xl border border-border bg-card overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {!selectedThreadId ? (
            /* Empty / Welcome state */
            <div className="flex flex-col items-center justify-center h-full px-6 py-12">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-lg"
              >
                <div className="mx-auto mb-6 h-14 w-14 rounded-xl bg-primary/10 border border-primary/20 grid place-items-center">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <h1 className="text-2xl font-semibold mb-2">AI Co-Founder</h1>
                <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                  Your intelligent startup partner. Ask anything about your business — from pricing
                  strategy to fundraising.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-md mx-auto">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt.label}
                      onClick={() => handleSend(prompt.label)}
                      className="flex items-center gap-2.5 px-4 py-3 rounded-lg border border-border bg-card/50 hover:bg-accent/50 transition-colors text-left text-sm"
                    >
                      <prompt.icon className="h-4 w-4 text-primary shrink-0" />
                      <span>{prompt.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : messagesLoading ? (
            /* Loading messages */
            <div className="flex items-center justify-center h-full">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 bg-primary rounded-full animate-bounce" />
                <span className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:120ms]" />
                <span className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:240ms]" />
              </div>
            </div>
          ) : messages.length === 0 ? (
            /* New thread with no messages yet */
            <div className="flex flex-col items-center justify-center h-full px-6 py-12">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-lg"
              >
                <div className="mx-auto mb-6 h-14 w-14 rounded-xl bg-primary/10 border border-primary/20 grid place-items-center">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Start the conversation</h2>
                <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                  Ask me anything about your startup journey.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-md mx-auto">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt.label}
                      onClick={() => handleSend(prompt.label)}
                      className="flex items-center gap-2.5 px-4 py-3 rounded-lg border border-border bg-card/50 hover:bg-accent/50 transition-colors text-left text-sm"
                    >
                      <prompt.icon className="h-4 w-4 text-primary shrink-0" />
                      <span>{prompt.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            /* Message list */
            <div className="px-4 py-6 space-y-6 max-w-3xl mx-auto">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="h-8 w-8 rounded-lg bg-primary grid place-items-center shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className={cn("flex flex-col max-w-[75%]", msg.role === "user" && "items-end")}
                  >
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted/50 border border-border rounded-bl-md",
                      )}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[11px] text-muted-foreground/50 mt-1 px-1">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                  {msg.role === "user" && (
                    <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 grid place-items-center shrink-0 mt-1">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </motion.div>
              ))}
              {streaming && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="h-8 w-8 rounded-lg bg-primary grid place-items-center shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="rounded-2xl rounded-bl-md px-4 py-3 text-sm bg-muted/50 border border-border whitespace-pre-wrap leading-relaxed max-w-[75%]">
                    {streaming}
                  </div>
                </motion.div>
              )}
              {sendMutation.isPending && !streaming && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary grid place-items-center shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="rounded-2xl rounded-bl-md px-4 py-4 bg-muted/50 border border-border">
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" />
                      <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce [animation-delay:120ms]" />
                      <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce [animation-delay:240ms]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="border-t border-border p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 rounded-xl border border-border bg-background/50 pl-4 pr-2 py-2 focus-within:ring-1 focus-within:ring-ring transition-shadow"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your AI co-founder anything…"
              className="border-0 bg-transparent focus-visible:ring-0 shadow-none p-0 text-sm"
            />
            <Button
              type="submit"
              size="icon"
              disabled={sendMutation.isPending || !input.trim()}
              className="h-8 w-8 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Context Panel */}
      <aside className="hidden lg:flex flex-col rounded-xl border border-border bg-card overflow-hidden">
        {selectedThreadId && selectedThread ? (
          <div className="p-4 space-y-5">
            {/* Thread info */}
            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Thread
              </h3>
              <div className="space-y-2.5">
                <div>
                  <p className="text-sm font-medium truncate">{selectedThread.title}</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">
                    {formatDate(selectedThread.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                  <Hash className="h-3 w-3" />
                  <span>{messages.length} messages</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Quick prompts */}
            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Quick ask
              </h3>
              <div className="space-y-1.5">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.label}
                    onClick={() => handleSend(prompt.label)}
                    className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors text-left text-xs"
                  >
                    <prompt.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{prompt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Tips */}
            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Tips
              </h3>
              <ul className="space-y-2 text-xs text-muted-foreground/70">
                <li className="flex gap-2 leading-relaxed">
                  <span className="text-primary shrink-0 mt-0.5">•</span>
                  Be specific about your industry and stage for better advice
                </li>
                <li className="flex gap-2 leading-relaxed">
                  <span className="text-primary shrink-0 mt-0.5">•</span>
                  Share your current metrics when asking about pricing or revenue
                </li>
                <li className="flex gap-2 leading-relaxed">
                  <span className="text-primary shrink-0 mt-0.5">•</span>
                  Use the Validate page to get a full business score
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Sparkles className="h-6 w-6 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground/50">Select a conversation to see context</p>
          </div>
        )}
      </aside>
    </div>
  );
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
