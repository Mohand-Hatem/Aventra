// app/[locale]/auth/callback/page.tsx
"use client";
import { ScaleLoader } from "@/components/shared/scale-loader";
import { useGoogleCallback } from "@/hooks/useGoogleCallback";
import { useTranslations } from "next-intl";

export default function GoogleCallback() {
  const { isPending } = useGoogleCallback();
  const t = useTranslations("callback");

  if (isPending) return (
    <div className="flex h-screen flex-col items-center justify-center gap-3">
      <ScaleLoader size="lg" className="text-primary dark:text-sky" />
      <p className="text-sm text-muted-foreground">{t("loading")}</p>
    </div>
  );

  return null;
}