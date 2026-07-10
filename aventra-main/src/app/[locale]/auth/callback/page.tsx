
"use client";
import PageLoading from "@/components/shared/PageLoading";
import { useGoogleCallback } from "@/hooks/useGoogleCallback";
import { useTranslations } from "next-intl";

export default function GoogleCallback() {
  const { isPending } = useGoogleCallback();
  const t = useTranslations("callback");

  if (isPending) return <PageLoading title={t("loading")} />;

  return null;
}