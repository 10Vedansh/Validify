import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Plus, Bot, User, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { chatService } from "@/services/chat.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ChatThread } from "@/types/report";

export const Route = createFileRoute("/dashboard/cofounder")({ component: CoFounder });

function CoFounder() {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  const { data: threads = [] } = useQuery({
    queryKey: ["chat-threads"],
    queryFn: () => chatService.threads(),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["chat-messages", selectedThreadId],
    queryFn: () => chatService.messages(selectedThreadId!),
    enabled: !!selectedThreadId,
  });

  const createMutation = useMutation({
    mutationFn: () => chatService.createThread("New Chat"),
    onSuccess: (thread) => {
      setSelectedThreadId(thread.id);
      queryClient.invalidateQueries({ queryKey: ["chat-threads"] });
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      let threadId = selectedThreadId;

      if (!threadId) {
        const thread = await chatService.createThread("New Chat");
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

  const handleSend = () => {
    if (!input.trim() || sendMutation.isPending) return;
    setStreaming("");
    sendMutation.mutate(input);
    setInput("");
  };

  const handleNewChat = () => {
    createMutation.mutate();
  };

  return (
    <div className="grid lg:grid-cols-[260px_1fr] gap-4 h-[calc(100vh-7rem)]">
      <aside className="hidden lg:flex flex-col glass rounded-2xl p-3">
        <Button
          className="bg-gradient-primary text-primary-foreground"
          onClick={handleNewChat}
          disabled={createMutation.isPending}
        >
          <Plus className="mr-2 h-4 w-4"/>New chat
        </Button>
        <div className="mt-4 text-xs text-muted-foreground px-2">Recent</div>
        <div className="mt-2 space-y-1 overflow-y-auto">
          {threads.length === 0 ? (
            <div className="text-xs text-muted-foreground px-3 py-4 text-center">No conversations yet</div>
          ) : (
            threads.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedThreadId(c.id)}
                className={`w-full text-left px-3 py-2 rounded-lg hover:bg-sidebar-accent/60 text-sm ${
                  selectedThreadId === c.id ? "bg-sidebar-accent/60" : ""
                }`}
              >
                <div className="truncate">{c.title}</div>
                <div className="text-xs text-muted-foreground">{new Date(c.updatedAt).toLocaleDateString()}</div>
              </button>
            ))
          )}
        </div>
      </aside>

      <div className="flex flex-col glass-strong rounded-2xl overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {!selectedThreadId && !streaming ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-primary/20 border border-primary/30 grid place-items-center mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">AI Co-Founder</h2>
              <p className="text-sm text-muted-foreground max-w-md">
                {threads.length === 0
                  ? "Click \"New Chat\" to start a conversation."
                  : "Select a conversation or click \"New Chat\" to start."}
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="flex gap-3">
                <div className={`h-8 w-8 rounded-lg grid place-items-center shrink-0 ${
                  msg.role === "user" ? "bg-primary/10" : "bg-gradient-primary"
                }`}>
                  {msg.role === "user"
                    ? <User className="h-4 w-4 text-primary" />
                    : <Bot className="h-4 w-4 text-primary-foreground" />
                  }
                </div>
                <div className={`max-w-2xl rounded-2xl px-4 py-3 text-sm ${
                  msg.role === "user" ? "bg-primary/10" : "glass"
                } whitespace-pre-wrap`}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {streaming && (
            <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center shrink-0"><Bot className="h-4 w-4 text-primary-foreground"/></div>
              <div className="max-w-2xl rounded-2xl px-4 py-3 text-sm glass whitespace-pre-wrap">{streaming}</div>
            </motion.div>
          )}
          {sendMutation.isPending && !streaming && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center"><Bot className="h-4 w-4 text-primary-foreground"/></div>
              <div className="glass rounded-2xl px-4 py-3 flex gap-1">
                <span className="h-2 w-2 bg-primary rounded-full animate-bounce"/>
                <span className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:120ms]"/>
                <span className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:240ms]"/>
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-border/60 p-4">
          <form onSubmit={(e)=>{e.preventDefault();handleSend();}} className="flex items-center gap-2 glass rounded-xl pl-3 pr-1.5 py-1.5">
            <Input value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Ask your AI co-founder anything…" className="border-0 bg-transparent focus-visible:ring-0 shadow-none"/>
            <Button type="submit" size="icon" className="bg-gradient-primary text-primary-foreground h-9 w-9" disabled={sendMutation.isPending}><Send className="h-4 w-4"/></Button>
          </form>
        </div>
      </div>
    </div>
  );
}
