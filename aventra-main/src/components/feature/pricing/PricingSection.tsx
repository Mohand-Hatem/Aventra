"use client";

import { IconSparkles } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import PricingCard from "@/components/feature/pricing/PricingCard";
import { hasUnlimitedAccess } from "@/constants/pricing";
import { usePricingPlans } from "@/hooks/usePricingPlans";
import { useAuthStore } from "@/stores/auth-store";

export default function PricingSection() {
  const t = useTranslations("pricing");
  const userInfo = useAuthStore((state) => state.userInfo);
  const showUnlimitedOnly = hasUnlimitedAccess(userInfo);
  const { plans, unlimitedPlan } = usePricingPlans();

  return (
    <section className="min-h-screen w-full bg-background dark:bg-canvas">
      <div className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6">

      {/* Header */}
      <div className="mb-16 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 dark:border-sky/30 dark:bg-sky/10 px-4 py-1.5 text-sm font-medium text-primary dark:text-sky">
          <IconSparkles size={14} />
          {showUnlimitedOnly ? t("badgeUnlimited") : t("badge")}
        </div>
        <h1 className="font-heading mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {showUnlimitedOnly ? t("titleUnlimited") : t("title")}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {showUnlimitedOnly ? (
            t("subtitleUnlimited")
          ) : (
            <>
              {t("subtitle")}
              <br />
              {t("subtitleLine2")}
            </>
          )}
        </p>
      </div>

      {/* Cards */}
      {showUnlimitedOnly ? (
        <div className="mx-auto max-w-md">
          <PricingCard plan={unlimitedPlan} isActivePlan />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:items-start">
          {plans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>
      )}

      {!showUnlimitedOnly && (
        <p className="mt-12 text-center text-sm text-muted-foreground">
          {t.rich("trialNote", {
            trial: (chunks) => (
              <span className="font-semibold text-primary dark:text-sky">
                {chunks}
              </span>
            ),
          })}
        </p>
      )}
      </div>
    </section>
  );
}
