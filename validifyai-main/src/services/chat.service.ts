import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import type { ChatMessage, ChatThread } from "@/types/report";

export const chatService = {
  async threads(): Promise<ChatThread[]> {
    const { data } = await api.get<ChatThread[]>("/chat/threads");
    return data;
  },

  async createThread(title: string, ideaId?: string): Promise<ChatThread> {
    const { data } = await api.post<ChatThread>("/chat/threads", { title, ideaId });
    return data;
  },

  async messages(threadId: string): Promise<ChatMessage[]> {
    const { data } = await api.get<ChatMessage[]>(`/chat/threads/${threadId}/messages`);
    return data;
  },

  async *send(
    threadId: string,
    content: string,
    signal?: AbortSignal,
  ): AsyncGenerator<string, void, unknown> {
    const token = useAuthStore.getState().token;
    const res = await fetch(`${api.defaults.baseURL}/chat/threads/${threadId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ content }),
      signal,
    });
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Chat request failed: ${res.status} ${errBody}`);
    }

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await res.json();
      yield body.content || "";
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) return;
    const decoder = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      yield decoder.decode(value, { stream: true });
    }
  },
};
