"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/routing";
import { fetchAuthUser } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/auth-store";

const AUTH_CALLBACK_PATH = "/auth/callback";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const setUserInfo = useAuthStore((s) => s.setUserInfo);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    if (pathname.endsWith(AUTH_CALLBACK_PATH)) return;

    fetchAuthUser()
      .then((user) => {
        if (!user) {
          clearAuth();
          return;
        }
        setUserInfo(user);
      })
      .catch((error) => {
        clearAuth();
        console.error(error);
      });
  }, [pathname, clearAuth, setUserInfo]);

  return <>{children}</>;
};
