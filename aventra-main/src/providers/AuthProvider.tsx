"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/routing";
import { useUser } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/auth-store";
import { AxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";

const AUTH_CALLBACK_PATH = "/auth/callback";
const PAYMENT_RESULTS_PATH = "/payment/results";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const setUserInfo = useAuthStore((s) => s.setUserInfo);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const skipAuth =
    pathname.endsWith(AUTH_CALLBACK_PATH) ||
    pathname.endsWith(PAYMENT_RESULTS_PATH);

  const { isError, error, data, isSuccess } = useUser({ enabled: !skipAuth });

  useEffect(() => {
    if (skipAuth) return;

    if (isSuccess && data) {
      setUserInfo(data);
    }

    if (isError && (error as AxiosError)?.response?.status === 401) {
      clearAuth();
      queryClient.setQueryData(queryKeys.auth.user, null);
    }
  }, [skipAuth, isError, error, isSuccess, data, clearAuth, setUserInfo, queryClient]);

  return <>{children}</>;
};
