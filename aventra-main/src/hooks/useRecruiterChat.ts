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
  uncertainCount?: number;
}

interface UseRecruiterChatProps {
  onSearch: (results: CandidateResult[]) => void;
  // Fired for every completed (non-error) response, including greetings and
  // off-topic/zero-result ones — used to drive "filter section" visibility,
  // which must hide again the moment the latest message isn't a real search
  // with results, independent of whatever candidates are still on screen.
  onSearchOutcome?: (hasResults: boolean) => void;
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

export function useRecruiterChat({
  onSearch,
  onSearchOutcome,
}: UseRecruiterChatProps) {
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
      let uncertainCount: number | undefined;

      if (response.isGreeting || response.isOffTopic) {
        assistantContent = response.message || t("replies.greeting");
        onSearchOutcome?.(false);
      } else {
        const normalizedResults = normalizeCandidateResults(response.results);
        const resultsCount = response.resultsCount ?? normalizedResults.length;

        if (resultsCount === 0) {
          // Covers both empty-result shapes: plain no-match and
          // uncertain-heavy no-match — the backend already folds the
          // uncertain-candidate wording into `message` for the latter.
          assistantContent = response.message || t("noMatches");
        } else {
          assistantContent = t("resultsFound", { count: resultsCount });
          if (
            "uncertainCount" in response &&
            response.uncertainCount !== undefined &&
            response.uncertainCount > 0
          ) {
            uncertainCount = response.uncertainCount;
          }
        }

        onSearch(normalizedResults);
        onSearchOutcome?.(resultsCount > 0);
      }

      void Promise.all([
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
          uncertainCount,
        },
      ]);
    } catch (error) {
      const tokenLimit = getTokenLimitError(error);
      setTokenLimitError(tokenLimit);

      if (tokenLimit) {
        void Promise.all([
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
