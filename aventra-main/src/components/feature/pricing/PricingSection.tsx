"use client";

import { IconSparkles } from "@tabler/icons-react";
import PricingCard from "@/components/feature/pricing/PricingCard";
import {
  hasUnlimitedAccess,
  PRICING_PLANS,
  UNLIMITED_PLAN,
} from "@/constants/pricing";
import { useAuthStore } from "@/stores/auth-store";

export default function PricingSection() {
  const userInfo = useAuthStore((state) => state.userInfo);
  const showUnlimitedOnly = hasUnlimitedAccess(userInfo);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6">

      {/* Header */}
      <div className="mb-16 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 dark:border-sky/30 dark:bg-sky/10 px-4 py-1.5 text-sm font-medium text-primary dark:text-sky">
          <IconSparkles size={14} />
          {showUnlimitedOnly ? "Your access" : "Simple, transparent pricing"}
        </div>
        <h1 className="font-heading mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {showUnlimitedOnly ? "Unlimited plan" : "Choose your plan"}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {showUnlimitedOnly ? (
            <>You have full access to every feature with no limits.</>
          ) : (
            <>
              Simple plans for job seekers and companies.
              <br />
              Start free, upgrade when you need more.
            </>
          )}
        </p>
      </div>

      {/* Cards */}
      {showUnlimitedOnly ? (
        <div className="mx-auto max-w-md">
          <PricingCard plan={UNLIMITED_PLAN} isActivePlan />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:items-start">
          {PRICING_PLANS.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>
      )}

      {!showUnlimitedOnly && (
        <p className="mt-12 text-center text-sm text-muted-foreground">
          All plans include a{" "}
          <span className="font-semibold text-primary dark:text-sky">
            7-day free trial
          </span>
          . No credit card required.
        </p>
      )}
    </section>
  );
}