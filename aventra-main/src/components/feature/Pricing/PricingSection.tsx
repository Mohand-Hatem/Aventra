/**
 * Folder: src/components/feature/pricing
 * File: PricingSection.tsx
 * Purpose:
 * - Pricing section layout — header + cards grid + footer note.
 * - Consumes PRICING_PLANS constant and PricingCard component.
 */

import { IconSparkles } from "@tabler/icons-react";
import { PRICING_PLANS } from "@/constants/pricing";
import PricingCard from "./PricingCard";

export default function PricingSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6">

      {/* Header */}
      <div className="mb-16 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 dark:border-sky/30 dark:bg-sky/10 px-4 py-1.5 text-sm font-medium text-primary dark:text-sky">
          <IconSparkles size={14} />
          Simple, transparent pricing
        </div>
        <h1 className="font-heading mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Choose your plan
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Simple plans for job seekers and companies.
          <br />
          Start free, upgrade when you need more.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:items-start">
        {PRICING_PLANS.map((plan) => (
          <PricingCard key={plan.name} plan={plan} />
        ))}
      </div>

      {/* Footer note */}
      <p className="mt-12 text-center text-sm text-muted-foreground">
        All plans include a{" "}
        <span className="font-semibold text-primary dark:text-sky">
          7-day free trial
        </span>
        . No credit card required.
      </p>
    </section>
  );
}
