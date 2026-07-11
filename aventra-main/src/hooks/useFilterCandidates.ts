"use client";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { queryKeys } from "@/constants/query-keys";
import { normalizeFilteredCvItems } from "@/types/company";
import type { CvFilterParams, FilterCvsResponse } from "@/types/company";

async function fetchFilteredCandidates(params: CvFilterParams) {
  const { data } = await axiosInstance.get<FilterCvsResponse>("/cv/filter", {
    params: {
      minAts: params.minAts,
      maxAts: params.maxAts,
      skills: params.skills?.length ? params.skills.join(",") : undefined,
      certifications: params.certifications?.length
        ? params.certifications.join(",")
        : undefined,
      experiences: params.experiences?.length
        ? params.experiences.join(",")
        : undefined,
      projects: params.projects?.length ? params.projects.join(",") : undefined,
      page: params.page,
      limit: params.limit,
    },
  });

  return {
    candidates: normalizeFilteredCvItems(data.data),
    total: data.total,
    page: data.page,
    totalPages: data.totalPages,
  };
}

export function useFilterCandidates(
  params: CvFilterParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.company.filteredCvs(params),
    queryFn: () => fetchFilteredCandidates(params),
    enabled: options?.enabled ?? true,
    staleTime: 30_000,
  });
}
