/**
 * Folder: src/hooks
 * File: useCompanySearch.ts
 * Purpose:
 * - TanStack Query hook for company candidate search.
 * - useSearchCandidates → POST /ai/search/candidates
 */

"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { normalizeCandidateResults } from "@/types/company";
import type {
  CandidateResult,
  SearchCandidatesResponse,
  SearchCandidatesPayload,
} from "@/types/company";

const COMPANY_SEARCH_TIMEOUT_MS = 60_000;

export function useSearchCandidates() {
  const [candidates, setCandidates] = useState<CandidateResult[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateResult | null>(null);
  const [isChatSearching, setIsChatSearching] = useState(false);

  const mutation = useMutation({
    mutationFn: async (payload: SearchCandidatesPayload) => {
      const { data } = await axiosInstance.post<SearchCandidatesResponse>(
        "/company/search",
        payload,
        { timeout: COMPANY_SEARCH_TIMEOUT_MS }
      );
      return normalizeCandidateResults(data.results);
    },
    onSuccess: (data) => {
      setCandidates(data);
      setSelectedCandidate(data[0] ?? null);
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
  };
}
