"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { useRouter } from "@/i18n/routing";
import { useUser } from "@/hooks/useAuth";
import { ROLES, type Role } from "@/constants/roles";
import { ScaleLoader } from "@/components/shared/scale-loader";

type RequireRoleProps = {
  allowedRoles: Role[];
  children: React.ReactNode;
};

function getUnauthorizedMessageKey(allowedRoles: Role[]) {
  const allowsUser = allowedRoles.includes(ROLES.user);
  const allowsCompany = allowedRoles.includes(ROLES.company);

  if (allowsCompany && !allowsUser) return "companyOnly";
  if (allowsUser && !allowsCompany) return "userOnly";
  return "loginRequired";
}

export default function RequireRole({
  allowedRoles,
  children,
}: RequireRoleProps) {
  const t = useTranslations("notifications.auth");
  const router = useRouter();
  const { data: user, isLoading, isFetching } = useUser();
  const hasHandledUnauthorized = useRef(false);

  useEffect(() => {
    if (isLoading || isFetching) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      if (!hasHandledUnauthorized.current) {
        hasHandledUnauthorized.current = true;
        toast.error(t(getUnauthorizedMessageKey(allowedRoles)));
      }
      router.replace("/");
    }
  }, [allowedRoles, isFetching, isLoading, router, t, user]);

  if (isLoading || isFetching) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <ScaleLoader size="lg" className="text-primary" />
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
