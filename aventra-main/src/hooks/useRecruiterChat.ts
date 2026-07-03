// Folder: src/hooks
// File: useRecruiterChat.ts
// Purpose: Sends every message to the backend LLM+RAG endpoint and returns AI response.

"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface CandidateResult {
  cvId: string;
  name: { en: string; ar: string };
  email: string;
  track: string;
  atsScore: number;
  matchScore: number;
  matchedSnippet: string;
}

interface ChatResponse {
  success: boolean;
  query: string;
  isGreeting: boolean;
  isOffTopic: boolean;
  message?: string;  // Only present for greeting/off-topic
  results?: CandidateResult[];  // Only present for search
  resultsCount?: number;
}

interface UseRecruiterChatProps {
  onSearch: (results: CandidateResult[]) => void;
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
      const { data } = await axiosInstance.post<ChatResponse>("/company/search", {
        message,
      });
      return data;
    },
  });

  async function sendMessage(text: string) {
    if (!text.trim() || isThinking) return;

    // Check if user is authenticated
    const userInfo = useAuthStore.getState().userInfo;
    if (!userInfo) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "user",
          content: text,
          createdAt: getCurrentTime(),
        },
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Please login to use the chat assistant.",
          createdAt: getCurrentTime(),
        },
      ]);
      return;
    }

    
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: getCurrentTime(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);

    try {
     
      const response = await chatMutation.mutateAsync(text);

      
      let assistantContent: string;

      if (response.isGreeting || response.isOffTopic) {
        
        assistantContent = response.message || "I'm here to help. How can I assist you?";
      } else {
        
        const resultsCount = response.results?.length || 0;
        assistantContent = resultsCount > 0
          ? `Found ${resultsCount} matching candidate(s).`
          : "No matching candidates found.";

    
        if (response.results) {
          onSearch(response.results);
        }
      }

      // 4. Add assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: assistantContent,
          createdAt: getCurrentTime(),
        },
      ]);
    } catch (error) {
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
