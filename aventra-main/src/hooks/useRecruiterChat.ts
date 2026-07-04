// Folder: src/hooks
// File: useRecruiterChat.ts
// Purpose: Sends every message to the backend LLM+RAG endpoint and returns AI response.

"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useTranslations } from "next-intl";
import { queryKeys } from "@/constants/query-keys";
import axiosInstance from "@/lib/axios";
import { useAuthStore } from "@/stores/auth-store";
import { getApiErrorMessage, getTokenLimitError } from "@/lib/ai-token-limit";
import {
  normalizeCandidateResults,
  type CandidateResult,
  type SearchCandidatesResponse,
} from "@/types/company";
import type { TokenLimitErrorResponse } from "@/types/ai";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface UseRecruiterChatProps {
  onSearch: (results: CandidateResult[]) => void;
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
  const axiosError = error as AxiosError;

  if (axiosError.code === "ECONNABORTED") {
    return t("requestTimedOut");
  }

  return getApiErrorMessage(error, t("somethingWentWrong"));
}

export function useRecruiterChat({ onSearch }: UseRecruiterChatProps) {
  const queryClient = useQueryClient();
  const t = useTranslations("candidateSearch.assistant");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [tokenLimitError, setTokenLimitError] = useState<TokenLimitErrorResponse | null>(null);

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
    if (!text.trim() || isThinking || !!tokenLimitError) return;

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
      setTokenLimitError(null);
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

      void Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.user }),
        queryClient.invalidateQueries({ queryKey: queryKeys.ai.usage }),
        queryClient.invalidateQueries({ queryKey: queryKeys.company.searchHistory }),
      ]);

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
      const tokenLimit = getTokenLimitError(error);
      setTokenLimitError(tokenLimit);

      if (tokenLimit) {
        void Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.auth.user }),
          queryClient.invalidateQueries({ queryKey: queryKeys.ai.usage }),
        ]);
      }

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
    isTokenLimitReached: !!tokenLimitError,
    tokenLimitError,
  };
}
