"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  PRICING_PLANS_CONFIG,
  UNLIMITED_PLAN_CONFIG,
} from "@/constants/pricing";
import { useLocaleFormat } from "@/hooks/useLocaleFormat";
import type { PlanName, PricingPlan } from "@/types/pricing";

type PlanTranslationKey = "free" | "pro" | "enterprise" | "unlimited";

function toPlanKey(name: PlanName): PlanTranslationKey {
  return name.toLowerCase() as PlanTranslationKey;
}

export function usePricingPlans() {
  const t = useTranslations("pricing");
  const tNavbar = useTranslations("navbar");
  const { digits } = useLocaleFormat();

  const plans = useMemo(() => {
    return PRICING_PLANS_CONFIG.map(({ name, price, featured }) => {
      const planKey = toPlanKey(name);

      return {
        name,
        displayName: tNavbar(`plans.${planKey}`),
        price: digits(price),
        featured,
        description: t(`plans.${planKey}.description`),
        tokens: t(`plans.${planKey}.tokens`),
        features: t.raw(`plans.${planKey}.features`) as string[],
        cta: t(`plans.${planKey}.cta`),
      } satisfies PricingPlan;
    });
  }, [t, tNavbar, digits]);

  const unlimitedPlan = useMemo(() => {
    const planKey = toPlanKey(UNLIMITED_PLAN_CONFIG.name);

    return {
      name: UNLIMITED_PLAN_CONFIG.name,
      displayName: tNavbar(`plans.${planKey}`),
      price: UNLIMITED_PLAN_CONFIG.price,
      featured: UNLIMITED_PLAN_CONFIG.featured,
      description: t(`plans.${planKey}.description`),
      tokens: t(`plans.${planKey}.tokens`),
      features: t.raw(`plans.${planKey}.features`) as string[],
      cta: t(`plans.${planKey}.cta`),
    } satisfies PricingPlan;
  }, [t, tNavbar]);

  return { plans, unlimitedPlan };
}
