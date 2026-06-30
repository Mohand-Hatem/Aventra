"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "@/i18n/routing";
import { useAuthStore } from "@/stores/auth-store";
import { APP_ROUTES } from "@/constants/routes";

export function AuthPageShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const userInfo = useAuthStore((s) => s.userInfo);

  useEffect(() => {
    if (userInfo) {
      router.replace(APP_ROUTES.home);
    }
  }, [userInfo, router]);

  if (userInfo) return null;

  return (
    <div className="flex min-h-screen w-full bg-background">{children}</div>
  );
}
