// hooks/usePlanSelection.ts
"use client";

import { useRouter } from "next/navigation";

import { useCurrentUser } from "@/queries/auth";
import { usePayWithPaymob } from "@/queries/payment";

import type { PlanName } from "@/types/pricing";
import { useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/queries/auth";

export function usePlanSelection() {
  const router = useRouter();
const queryClient = useQueryClient();

  const { data: user, isLoading: isCheckingUser } = useCurrentUser();

  const paymentMutation = usePayWithPaymob();

  const handlePlanSelection = (plan: PlanName) => {
    if (isCheckingUser) return;

    if (!user) {
      router.push(`/login?plan=${plan}`);
      return;
    }

    paymentMutation.mutate(
      {
        plan,
      },
      {
        onSuccess: async (data) => {
          // Free Plan
          if (!data.url) {
             await queryClient.invalidateQueries({ queryKey: authKeys.me });
            router.push("/user/profile");
            return;
          }

          // Paid Plan
          window.location.href = data.url;
        },

        onError: () => {
          alert("Unable to start payment.");
        },
      }
    );
  };

  return {
    handlePlanSelection,
    isPending: paymentMutation.isPending,
  };
}