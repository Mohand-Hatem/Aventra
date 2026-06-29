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
    // Don't interfere with the Google OAuth callback page
    if (pathname.endsWith(AUTH_CALLBACK_PATH)) return;

    // If we already have a user in the store (e.g. just logged in),
    // skip the fetch to avoid a race condition that clears auth.
    if (userInfo) return;

    // Only fetch once on initial mount; subsequent navigations rely on the store.
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
        // Only clear auth on a real 401 (session truly invalid/expired).
        // Do NOT clear on network errors or 5xx — that would flash-logout
        // a valid user due to a transient backend issue.
        if (error?.response?.status === 401) {
          clearAuth();
        }
        console.error("AuthProvider /auth/me error:", error);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
};
