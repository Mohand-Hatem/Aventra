"use client";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { queryKeys } from "@/constants/query-keys";
import type { AiUsageData, AiUsageResponse } from "@/types/ai";

type UseAiUsageOptions = {
  enabled?: boolean;
};

async function fetchAiUsage(): Promise<AiUsageData | null> {
  try {
    const { data } = await axiosInstance.get<AiUsageResponse>("/users/me/ai-usage");
    return data.data;
  } catch {
    return null;
  }
}

export function useAiUsage(options?: UseAiUsageOptions) {
  return useQuery({
    queryKey: queryKeys.ai.usage,
    queryFn: fetchAiUsage,
    enabled: options?.enabled ?? true,
    staleTime: 60_000,
  });
}
