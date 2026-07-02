"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/routing";
import { useUser } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/auth-store";
import { AxiosError } from "axios";

const AUTH_CALLBACK_PATH = "/auth/callback";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const skipAuth = pathname.endsWith(AUTH_CALLBACK_PATH);

  const { isError, error } = useUser({ enabled: !skipAuth });

  useEffect(() => {
    if (skipAuth || !isError) return;
    if ((error as AxiosError)?.response?.status === 401) {
      clearAuth();
    }
  }, [skipAuth, isError, error, clearAuth]);

  return <>{children}</>;
};
