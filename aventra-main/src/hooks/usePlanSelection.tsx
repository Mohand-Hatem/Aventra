// hooks/usePlanSelection.ts
"use client";



import type { PlanName } from "@/types/pricing";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { useUser } from "./useAuth";
import { useRouter } from "@/i18n/routing";
import { APP_ROUTES } from "@/constants/routes";
import { toast } from "react-hot-toast";
import { usePayWithPaymob } from "./usePay";

export function usePlanSelection() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading: isCheckingUser } = useUser();
  const paymentMutation = usePayWithPaymob();
  const handlePlanSelection = (plan: PlanName) => {
    if (isCheckingUser) toast.loading("Checking user...");
    if (!user) {
      toast.error("Please login to continue");
      router.push(APP_ROUTES.login);
      return;
    }
    paymentMutation.mutate(
      {
        plan,
      },
      {
        
        onSuccess: async (data) => {
          if (!data.url) {
             await queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
             toast.success("Payment successful");
            router.push("/user/profile");
            return;
          }
          localStorage.setItem("paymobOrderId", data.orderId!);
          window.location.href = data.url;
        },

        onError: (error) => {
          console.error(error);
          toast.error("Unable to start payment.");
        },
      }
    );
  };

  return {
    handlePlanSelection,
    isPending: paymentMutation.isPending,
  };
}