"use client";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { queryKeys } from "@/constants/query-keys";
import type { SearchHistoryEntry, SearchHistoryResponse } from "@/types/company";

async function fetchCompanySearchHistory(): Promise<{
  searches: SearchHistoryEntry[];
  totalSearches: number;
}> {
  try {
    const { data } = await axiosInstance.get<SearchHistoryResponse>(
      "/company/search-history",
    );

    const searches = data.data?.searches ?? [];
    const totalSearches =
      data.data?.totalSearches ?? searches.length;

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
