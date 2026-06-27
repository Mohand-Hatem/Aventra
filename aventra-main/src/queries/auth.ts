"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";

export interface CurrentUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  maxToken: number;
  tokenUsage: number;
}

interface MeResponse {
  success: boolean;
  data: {
    user: CurrentUser;
  };
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],

    queryFn: async () => {
      const { data } = await apiClient.get<MeResponse>("/auth/me");

      return data.data.user;
    },

    retry: false,

    staleTime: 1000 * 60 * 5,
  });
}