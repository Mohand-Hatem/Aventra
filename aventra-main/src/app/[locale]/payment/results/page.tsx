"use client";

import { ScaleLoader } from "@/components/shared/scale-loader";
import { usePaymentCallback } from "@/hooks/usePaymentCallback";
import { useTranslations } from "next-intl";

export default function PaymentResult() {
  const { isPending } = usePaymentCallback();
  const t = useTranslations("payment");

  if (isPending) {
    return (
      <section className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center gap-4 px-4">
        <ScaleLoader size="lg" className="text-primary dark:text-sky" />
        <p className="text-sm text-muted-foreground">{t("confirming")}</p>
      </section>
    );
  }

  return null;
}
