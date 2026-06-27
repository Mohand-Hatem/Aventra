"use client";

import { useRouter } from "next/navigation";

import { useCurrentUser } from "@/queries/auth";
import { usePayWithPaymob } from "@/queries/payment";

import type { PlanName } from "@/types/pricing";

export function usePlanSelection() {
  const router = useRouter();

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
        onSuccess: (data) => {
          // Free Plan
          if (!data.url) {
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