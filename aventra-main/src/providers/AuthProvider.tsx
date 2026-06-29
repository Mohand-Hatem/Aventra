"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/routing";
import { fetchAuthUser } from "@/hooks/useAuth";
import { logAuth, logAuthError, logAuthWarn } from "@/lib/auth-debug";
import { useAuthStore } from "@/stores/auth-store";

const AUTH_CALLBACK_PATH = "/auth/callback";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const setUserInfo = useAuthStore((s) => s.setUserInfo);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    if (pathname.endsWith(AUTH_CALLBACK_PATH)) {
      logAuth("AuthProvider", "skipping hydrate on callback route", { pathname });
      return;
    }

    logAuth("AuthProvider", "hydrating session", { pathname });

    fetchAuthUser()
      .then((user) => {
        if (!user) {
          logAuthWarn("AuthProvider", "no user from /auth/me — clearing auth", {
            pathname,
          });
          clearAuth();
          return;
        }
        logAuth("AuthProvider", "session restored", {
          pathname,
          user: { id: user.id, email: user.email },
        });
        setUserInfo(user);
      })
      .catch((error) => {
        logAuthError("AuthProvider", "fetchAuthUser threw — clearing auth", {
          pathname,
          error,
        });
        clearAuth();
      });
  }, [pathname, clearAuth, setUserInfo]);

  return <>{children}</>;
};
