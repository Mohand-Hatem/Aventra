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
    <section className="min-h-screen w-full bg-background">
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

      {/* Success Stories */}
      <div className="mt-20">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary dark:border-sky/25 dark:bg-sky/10 dark:text-sky">
            <IconSparkles size={14} />
            Success Stories
          </div>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Trusted by Professionals
          </h2>
          <p className="mt-3 text-muted-foreground">
            See how Aventra helps job seekers and companies
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              name: "Sarah M.",
              role: "Frontend Developer",
              avatar: "SM",
              score: 92,
              quote: "Improved my ATS score from 64 to 92 in just two applications. Landed my dream job at a top tech company.",
              type: "Job Seeker",
            },
            {
              name: "TechCorp Inc.",
              role: "Hiring Manager",
              avatar: "TC",
              score: null,
              quote: "Reduced our screening time by 70%. Found qualified candidates 3x faster with AI-powered matching.",
              type: "Company",
            },
            {
              name: "Ahmed K.",
              role: "UX Designer",
              avatar: "AK",
              score: 88,
              quote: "The detailed breakdown showed exactly what to fix. My resume now passes every ATS system.",
              type: "Job Seeker",
            },
          ].map((story) => (
            <div
              key={story.name}
              className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-card p-6 shadow-card"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-sky text-sm font-bold text-primary-foreground">
                  {story.avatar}
                </span>
                <div>
                  <p className="font-heading font-bold">{story.name}</p>
                  <p className="text-xs text-muted-foreground">{story.role}</p>
                </div>
              </div>
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                "{story.quote}"
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary dark:text-sky">
                  {story.type}
                </span>
                {story.score && (
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary dark:bg-sky/10 dark:text-sky">
                    Score: {story.score}/100
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}
