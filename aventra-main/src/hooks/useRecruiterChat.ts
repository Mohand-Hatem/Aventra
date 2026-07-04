// Folder: src/hooks
// File: useRecruiterChat.ts
// Purpose: Sends every message to the backend LLM+RAG endpoint and returns AI response.

"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useTranslations } from "next-intl";
import axiosInstance from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import {
  normalizeCandidateResults,
  type CandidateResult,
  type SearchCandidatesResponse,
} from "@/types/company";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface UseRecruiterChatProps {
  onSearch: (results: CandidateResult[]) => void;
}

interface CompanySearchErrorResponse {
  message?: string;
}

const COMPANY_SEARCH_TIMEOUT_MS = 60_000;

function getCurrentTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getCompanySearchErrorMessage(
  error: unknown,
  t: (key: "requestTimedOut" | "somethingWentWrong") => string
) {
  const axiosError = error as AxiosError<CompanySearchErrorResponse>;

  if (axiosError.code === "ECONNABORTED") {
    return t("requestTimedOut");
  }

  return axiosError.response?.data?.message ?? t("somethingWentWrong");
}

export function useRecruiterChat({ onSearch }: UseRecruiterChatProps) {
  const t = useTranslations("candidateSearch.assistant");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const { data } = await axiosInstance.post<SearchCandidatesResponse>(
        "/company/search",
        { message },
        { timeout: COMPANY_SEARCH_TIMEOUT_MS }
      );
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
          content: t("loginRequired"),
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
        assistantContent = response.message || t("replies.greeting");
      } else {
        const normalizedResults = normalizeCandidateResults(response.results);
        const resultsCount = response.resultsCount ?? normalizedResults.length;
        assistantContent =
          resultsCount > 0
            ? t("resultsFound", { count: resultsCount })
            : t("noMatches");

        onSearch(normalizedResults);
      }

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
          content: getCompanySearchErrorMessage(error, t),
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
