"use client";

import PageLoading from "@/components/shared/PageLoading";
import { usePaymentCallback } from "@/hooks/usePaymentCallback";
import { useTranslations } from "next-intl";

export default function PaymentResultContent() {
  const { isPending } = usePaymentCallback();
  const t = useTranslations("payment");

  if (isPending) {
    return <PageLoading title={t("confirming")} />;
  }

  return null;
}
