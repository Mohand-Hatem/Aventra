"use client";

import { useTranslations, useLocale } from "next-intl";
import { IconLogout, IconUser } from "@tabler/icons-react";
import { Link } from "@/i18n/routing";
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

function getProfilePath(role: AuthUser["role"]) {
  return role === "company" ? "/company/profile" : "/user/profile";
}

type UserAvatarMenuProps = {
  user: AuthUser;
  onLogout: () => void;
  isLoggingOut?: boolean;
  size?: "default" | "sm" | "lg";
};

export function UserAvatarMenu({
  user,
  onLogout,
  isLoggingOut = false,
  size = "lg",
}: UserAvatarMenuProps) {
  const t = useTranslations("navbar");
  const locale = useLocale();
  const displayName = getUserDisplayName(user.name, locale);
  const userInitial = displayName.charAt(0).toUpperCase();
  const profilePath = getProfilePath(user.role);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        className="flex items-center gap-3 rounded-xl px-2 py-1 outline-none ring-offset-background transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={t("userMenu")}
      >
        <Avatar size={size} className="size-12">
          {user.avatar ? (
            <AvatarImage src={user.avatar} alt={displayName} />
          ) : null}
          <AvatarFallback className="bg-primary font-medium text-primary-foreground">
            {userInitial}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start text-start">
          <span className="text-sm font-medium leading-none">{displayName}</span>
          <span className="mt-1 text-xs capitalize text-muted-foreground">
            {user.role}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
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
          <IconLogout />
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
