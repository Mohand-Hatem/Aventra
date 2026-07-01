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
import type {
  CandidateResult,
  SearchCandidatesResponse,
  SearchCandidatesPayload,
} from "@/types/company";

export function useSearchCandidates() {
  const [candidates, setCandidates] = useState<CandidateResult[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateResult | null>(null);

  const mutation = useMutation({
    mutationFn: async (payload: SearchCandidatesPayload) => {
      const { data } = await axiosInstance.post<SearchCandidatesResponse>(
        "/ai/search/candidates",
        payload
      );
      return data.data.candidates;
    },
    onSuccess: (data) => {
      setCandidates(data);
      // لو في نتايج، اختار الأول تلقائياً
      setSelectedCandidate(data[0] ?? null);
    },
  });

  return {
    // Search action
    search: (query: string) => mutation.mutate({ query, topK: 10 }),
    isPending: mutation.isPending,
    isError: mutation.isError,

    // Results
    candidates,
    total: candidates.length,
    hasResults: candidates.length > 0,

    // Selected candidate for CVViewer
    selectedCandidate,
    setSelectedCandidate,
  };
}
