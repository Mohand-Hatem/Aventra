"use client";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { queryKeys } from "@/constants/query-keys";
import { normalizeCandidateResults } from "@/types/company";
import type {
  CompanySearchHistoryApiEntry,
  SearchHistoryEntry,
  SearchHistoryResponse,
} from "@/types/company";

function normalizeHistoryEntry(entry: CompanySearchHistoryApiEntry): SearchHistoryEntry {
  const candidates = normalizeCandidateResults(entry.results).map((candidate) => ({
    ...candidate,
    createdAt: candidate.createdAt ?? entry.createdAt,
  }));

  return {
    id: entry._id,
    query: entry.query,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    candidates,
    total: entry.resultsCount ?? candidates.length,
  };
}

async function fetchCompanySearchHistory(): Promise<{
  searches: SearchHistoryEntry[];
  totalSearches: number;
}> {
  try {
    const { data } = await axiosInstance.get<SearchHistoryResponse>(
      "/company/search/history",
    );

    const searches = (data.history ?? []).map(normalizeHistoryEntry);
    const totalSearches = searches.length;

    return { searches, totalSearches };
  } catch {
    return { searches: [], totalSearches: 0 };
  }
}

export function useCompanySearchHistory() {
  return useQuery({
    queryKey: queryKeys.company.searchHistory,
    queryFn: fetchCompanySearchHistory,
    staleTime: 60_000,
  });
}
