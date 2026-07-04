/**
 * Folder: src/hooks
 * File: useCompanySearch.ts
 * Purpose:
 * - TanStack Query hook for company candidate search.
 * - useSearchCandidates → POST /ai/search/candidates
 */

"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { queryKeys } from "@/constants/query-keys";
import { getTokenLimitError } from "@/lib/ai-token-limit";
import { normalizeCandidateResults } from "@/types/company";
import type {
  CandidateResult,
  SearchCandidatesResponse,
  SearchCandidatesPayload,
} from "@/types/company";
import type { TokenLimitErrorResponse } from "@/types/ai";

const COMPANY_SEARCH_TIMEOUT_MS = 60_000;

export function useSearchCandidates() {
  const queryClient = useQueryClient();
  const [candidates, setCandidates] = useState<CandidateResult[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateResult | null>(null);
  const [isChatSearching, setIsChatSearching] = useState(false);
  const [tokenLimitError, setTokenLimitError] = useState<TokenLimitErrorResponse | null>(null);

  const mutation = useMutation({
    mutationFn: async (payload: SearchCandidatesPayload) => {
      const { data } = await axiosInstance.post<SearchCandidatesResponse>(
        "/company/search",
        payload,
        { timeout: COMPANY_SEARCH_TIMEOUT_MS }
      );
      return normalizeCandidateResults(data.results);
    },
    onSuccess: async (data) => {
      setTokenLimitError(null);
      setCandidates(data);
      setSelectedCandidate(data[0] ?? null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.user }),
        queryClient.invalidateQueries({ queryKey: queryKeys.ai.usage }),
        queryClient.invalidateQueries({ queryKey: queryKeys.company.searchHistory }),
      ]);
    },
    onError: async (error) => {
      const tokenLimit = getTokenLimitError(error);
      setTokenLimitError(tokenLimit);

      if (tokenLimit) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.auth.user }),
          queryClient.invalidateQueries({ queryKey: queryKeys.ai.usage }),
        ]);
      }
    },
  });

  function setSearchResults(results: CandidateResult[]) {
    setCandidates(results);
    setSelectedCandidate(results[0] ?? null);
  }

  return {
    search: async (query: string) => {
      await mutation.mutateAsync({ message: query });
    },
    setSearchResults,
    setChatSearching: setIsChatSearching,
    isPending: mutation.isPending || isChatSearching,
    isError: mutation.isError,

    candidates,
    total: candidates.length,
    hasResults: candidates.length > 0,

    selectedCandidate,
    setSelectedCandidate,
    isTokenLimitReached: !!tokenLimitError,
    tokenLimitError,
  };
}
