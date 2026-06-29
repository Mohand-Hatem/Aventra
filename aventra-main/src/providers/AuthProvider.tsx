"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "@/i18n/routing";
import { fetchAuthUser } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/auth-store";
import { AxiosError } from "axios";

const AUTH_CALLBACK_PATH = "/auth/callback";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const setUserInfo = useAuthStore((s) => s.setUserInfo);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const userInfo = useAuthStore((s) => s.userInfo);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (pathname.endsWith(AUTH_CALLBACK_PATH)) return;

    if (userInfo) return;
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchAuthUser()
      .then((user) => {
        if (!user) {
          clearAuth();
          return;
        }
        setUserInfo(user);
      })
      .catch((error: AxiosError) => {
        if (error?.response?.status === 401) {
          clearAuth();
        }
        console.error("AuthProvider /auth/me error:", error);
      });
  }, []);

  return <>{children}</>;
};
