// Folder: src/hooks
// File: useCompanyFilterCandidates.ts
// Purpose: Deterministic candidate filter — POST /company/filter, always scoped to
// the company's most recent AI search (scope: "lastSearch"). Stateless per request.

"use client";

import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import axiosInstance from "@/lib/axios";
import type {
  CompanyFilterPayload,
  CompanyFilterResponse,
} from "@/types/companyFilter";

export function useCompanyFilterCandidates() {
  return useMutation({
    mutationFn: async (payload: CompanyFilterPayload) => {
      const { data } = await axiosInstance.post<CompanyFilterResponse>(
        "/company/filter",
        {
          skills: payload.skills ?? [],
          requireEducation: payload.requireEducation ?? false,
          requireCertificate: payload.requireCertificate ?? false,
          requireProject: payload.requireProject ?? false,
          sortBySkillMatch: payload.sortBySkillMatch ?? false,
          scope: "lastSearch",
          ...(payload.limit ? { limit: payload.limit } : {}),
        },
      );
      return data;
    },
  });
}

export function isAccessRestrictedError(error: unknown): boolean {
  const axiosError = error as AxiosError | null;
  return axiosError?.response?.status === 403;
}
