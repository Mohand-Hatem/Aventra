// queries/payment.ts
"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { PlanName } from "@/types/pricing";

interface PayRequest {
  plan: PlanName;
}

interface PayResponse {
  success: boolean;
  message?: string;
  url?: string;
}

export function usePayWithPaymob() {
  return useMutation({
    mutationFn: async (body: PayRequest) => {
      const { data } = await apiClient.post<PayResponse>(
        "/users/pay",
        body
      );

      return data;
    },
  });
}