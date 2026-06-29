// app/[locale]/auth/callback/page.tsx
"use client";
import { useGoogleCallback } from "@/hooks/useGoogleCallback";
import { useTranslations } from "next-intl";

export default function GoogleCallback() {
  const { isPending } = useGoogleCallback();
  const t = useTranslations("callback");

  if (isPending) return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-muted-foreground text-sm">{t("loading")}</p>
    </div>
  );

  return null;
}