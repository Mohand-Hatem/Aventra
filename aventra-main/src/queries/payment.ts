// queries/payment.ts
"use client";

import axiosInstance from "@/lib/axios";
import { PlanName } from "@/types/pricing";
import { useMutation } from "@tanstack/react-query";


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
      const { data } = await axiosInstance.post<PayResponse>(
        "/users/pay",
        body
      );

      return data;
    },
  });
}