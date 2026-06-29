"use client";

import type { ComponentType } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  IconBuilding,
  IconChevronDown,
  IconLoader2,
  IconLogout,
  IconStar,
  IconUser,
} from "@tabler/icons-react";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { getUserDisplayName, type AuthUser } from "@/types/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PLANS } from "@/constants/plans";



const roleIcons = {
  user: IconUser,
  company: IconBuilding,
  admin: IconUser,
} as const;

function getProfilePath(role: AuthUser["role"]) {
  return role === "company" ? "/company/profile" : "/user/profile";
}

function getInitials(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "?";

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }

  return trimmed.charAt(0).toUpperCase();
}

function UserMetaBadge({
  icon: Icon,
  label,
  variant = "muted",
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  variant?: "muted" | "accent";
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium leading-none",
        variant === "accent"
          ? "bg-primary/10 text-primary dark:bg-sky/10 dark:text-sky"
          : "bg-muted text-muted-foreground",
      )}
    >
      <Icon className="size-3 shrink-0" />
      <span className="truncate capitalize">{label}</span>
    </span>
  );
}

type UserAvatarMenuProps = {
  user: AuthUser;
  onLogout: () => void;
  isLoggingOut?: boolean;
  size?: "default" | "sm" | "lg";
  className?: string;
};

export function UserAvatarMenu({
  user,
  onLogout,
  isLoggingOut = false,
  size = "lg",
  className,
}: UserAvatarMenuProps) {
  const t = useTranslations("navbar");
  const locale = useLocale();
  const displayName = getUserDisplayName(user.name, locale);
  const initials = getInitials(displayName);
  const profilePath = getProfilePath(user.role);
  const RoleIcon = roleIcons[user.role] ?? IconUser;

  const planKey = user.plan?.toLowerCase();
  const planLabel =
    planKey && Object.keys(PLANS).includes(planKey as keyof typeof PLANS)
      ? t(`plans.${planKey as keyof typeof PLANS}`)
      : user.plan
        ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1)
        : null;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        className={cn(
          "group/trigger flex min-w-0 items-center gap-2.5 rounded-xl px-2 py-1 outline-none ring-offset-background transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className,
        )}
        aria-label={t("userMenu")}
      >
        <Avatar size={size} className="shrink-0">
          {user.avatar ? (
            <AvatarImage src={user.avatar} alt={displayName} />
          ) : null}
          <AvatarFallback className="bg-primary text-sm font-medium text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-col items-start gap-1 text-start">
          <span className="max-w-36 truncate text-sm font-medium leading-none md:max-w-44">
            {displayName}
          </span>
          <div className="flex max-w-44 flex-wrap items-center gap-1">
            <UserMetaBadge icon={RoleIcon} label={t(`roles.${user.role}`)} />
            {planLabel ? (
              <UserMetaBadge icon={IconStar} label={planLabel} variant="accent" />
            ) : null}
          </div>
        </div>

        <IconChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/trigger:rotate-180" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="space-y-2 font-normal">
          <div className="flex items-center gap-2.5">
            <Avatar size="default" className="shrink-0">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt={displayName} />
              ) : null}
              <AvatarFallback className="bg-primary text-xs font-medium text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium leading-none">{displayName}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            <UserMetaBadge icon={RoleIcon} label={t(`roles.${user.role}`)} />
            {planLabel ? (
              <UserMetaBadge icon={IconStar} label={planLabel} variant="accent" />
            ) : null}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={profilePath}>
            <IconUser />
            {t("profile")}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          disabled={isLoggingOut}
          onSelect={(event) => {
            event.preventDefault();
            onLogout();
          }}
        >
          {isLoggingOut ? (
            <IconLoader2 className="animate-spin" />
          ) : (
            <IconLogout />
          )}
          {isLoggingOut ? t("signingOut") : t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
