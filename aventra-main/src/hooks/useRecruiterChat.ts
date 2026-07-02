// Folder: src/hooks
// File: useRecruiterChat.ts
// Purpose: Sends every message to the backend LLM+RAG endpoint and returns AI response.

"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface ChatResponse {
  success: boolean;
  data: {
    reply: string;           // الرد الطبيعي من الـ LLM
    candidates?: unknown[];  // لو الـ LLM قرر يعمل search
    hasResults?: boolean;
  };
}

interface UseRecruiterChatProps {
  onSearch: (query: string) => Promise<void> | void;
}

function getCurrentTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function useRecruiterChat({ onSearch }: UseRecruiterChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const { data } = await axiosInstance.post<ChatResponse>("/company/chat", {
        message,
        // بنبعت الـ history عشان الـ LLM يفهم السياق
        history: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });
      return data;
    },
  });

  async function sendMessage(text: string) {
    if (!text.trim() || isThinking) return;

    // 1. ضيفي رسالة الـ user فوراً
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: getCurrentTime(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);

    try {
      // 2. ابعتي للباك (LLM + RAG)
      const response = await chatMutation.mutateAsync(text);

      // 3. ضيفي رد الـ AI
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: response.data.reply,
          createdAt: getCurrentTime(),
        },
      ]);

      // 4. لو الـ LLM قرر يعمل search — حدثي الـ ResultsTable
      if (response.data.hasResults) {
        await onSearch(text);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          createdAt: getCurrentTime(),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  }

  return {
    messages,
    sendMessage,
    isThinking,
  };
}
