"use client";
import { IconCheck } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { ScaleLoader } from "@/components/shared/scale-loader";
import { cn } from "@/lib/utils";
import type { PricingCardProps } from "@/types/pricing";
import { usePlanSelection } from "@/hooks/usePlanSelection";
import { useAuthStore } from "@/stores/auth-store";
import { hasUnlimitedAccess } from "@/constants/pricing";


export default function PricingCard({ plan, isActivePlan = false }: PricingCardProps) {
  const t = useTranslations("pricing");
  const { name, displayName, price, description, tokens, featured, features, cta } = plan;
  const { handlePlanSelection, isPending } = usePlanSelection();
  const { userInfo } = useAuthStore();
  const { plan: userPlan } = userInfo || {};
  const isCurrentPlan = isActivePlan || userPlan === name;
  const isUnlimitedPlan = name === "Unlimited";
  const isGoldCard =
    isUnlimitedPlan && isCurrentPlan && hasUnlimitedAccess(userInfo);
  const isAdmin = userInfo?.role === "admin";
  const isAdminUnlimited = isUnlimitedPlan && isAdmin;
  const isHighlighted = (isGoldCard || featured) && !isAdminUnlimited;

  const loaderColorClass = isAdminUnlimited
    ? "text-primary-foreground dark:text-zinc-950"
    : isGoldCard
      ? "text-amber-600 dark:text-amber-600"
      : featured
        ? "text-white dark:text-white"
        : "text-foreground dark:text-foreground";

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-3xl border p-8 transition-all duration-300",
        isCurrentPlan && !isUnlimitedPlan && "opacity-50 cursor-not-allowed",
        isAdminUnlimited &&
          "border-primary dark:border-sky bg-gradient-to-br from-primary/5 via-canvas to-sky/10 dark:from-primary/10 dark:via-canvas dark:to-sky/15 text-foreground border-2 shadow-2xl scale-105",
        isGoldCard && !isAdminUnlimited &&
          "border-amber-500 bg-indigo-800 text-white",
        !isGoldCard && !isAdminUnlimited &&
          featured &&
          "border-transparent bg-[#0B1536] text-white shadow-2xl scale-105",
        !isGoldCard && !isAdminUnlimited &&
          !featured &&
          "border-border bg-card text-card-foreground shadow-sm hover:shadow-md hover:-translate-y-1",
      )}
    >
      {/* Featured badge */}
      {(featured || isGoldCard || isAdminUnlimited) && (
        <div className="absolute -top-4 right-8">
          <span
            className={cn(
              "rounded bg-blue-600 px-3 py-1.5 text-[10px] font-bold text-white shadow tracking-widest uppercase",
              isGoldCard && "bg-amber-500 text-white",
              isAdminUnlimited && "bg-primary dark:bg-sky text-primary-foreground dark:text-zinc-950"
            )}
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)" }}
          >
            {isAdminUnlimited ? t("adminAccess") : isGoldCard ? t("fullAccess") : t("mostPopular")}
          </span>
        </div>
      )}

      {isCurrentPlan ? (
        <p
          className={cn(
            "text-sm font-bold uppercase tracking-widest",
            isHighlighted ? "text-white/80" : "text-primary dark:text-sky",
          )}
        >
          {t("currentPlan", { plan: displayName })}
        </p>
      ) : (
        <p
          className={cn(
            "text-sm font-bold uppercase tracking-widest",
            isHighlighted ? "text-white/80" : "text-primary dark:text-sky",
          )}
        >
          {displayName}
        </p>
      )}

      {/* Price */}
      <div className="mt-4 flex items-end gap-1">
        {!isUnlimitedPlan && price !== "Custom" && (
          <span
            className={cn(
              "text-2xl font-semibold mb-1",
              isHighlighted ? "text-white/90" : "text-muted-foreground",
            )}
          >
            $
          </span>
        )}
        <span className={cn("font-bold tracking-tight", price === "Custom" ? "text-4xl" : "text-5xl")}>{price}</span>
        {!isUnlimitedPlan && price !== "Custom" && !featured && (
          <span
            className={cn(
              "text-base mb-1",
              isHighlighted ? "text-white/70" : "text-muted-foreground",
            )}
          >
            {t("perMonth")}
          </span>
        )}
      </div>
      {!isUnlimitedPlan && price !== "Custom" && featured && (
        <p
          className={cn(
            "mt-1 text-sm font-medium",
            isHighlighted ? "text-white/70" : "text-muted-foreground",
          )}
        >
          {t("billedAnnually")}
        </p>
      )}

      {/* Description */}
      <p
        className={cn(
          "mt-3 text-sm",
          isHighlighted ? "text-white/80" : "text-muted-foreground",
        )}
      >
        {description}
      </p>

      {/* Tokens */}
      {tokens && (
        <div
          className={cn(
            "mt-4 rounded-xl px-4 py-2 text-center text-sm font-medium",
            isAdminUnlimited
              ? "bg-primary/20 dark:bg-sky/20 text-primary dark:text-sky border border-primary/25 dark:border-sky/25"
              : isHighlighted
                ? "bg-white/20 text-white"
                : "bg-primary/10 dark:bg-sky/10 text-primary dark:text-sky",
          )}
        >
          {tokens}
        </div>
      )}

      {/* Divider */}
      <div
        className={cn("my-6 h-px", isHighlighted ? "bg-white/20" : "bg-border")}
      />

      {/* Features */}
      <ul className="flex-1 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <div
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                isAdminUnlimited
                  ? "bg-primary/10 text-primary dark:bg-sky/15 dark:text-sky"
                  : isHighlighted
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-emerald-500/10 text-emerald-500",
              )}
            >
              <IconCheck size={12} stroke={3} />
            </div>
            <span
              className={cn(
                isHighlighted ? "text-white/90" : "text-muted-foreground",
              )}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      {isCurrentPlan ? (
        <div
          className={cn(
            "mt-8 block w-full rounded-xl py-3 text-center text-sm font-semibold",
            isAdminUnlimited
              ? "bg-primary text-primary-foreground dark:bg-sky dark:text-zinc-950 shadow-md font-bold"
              : isHighlighted
                ? "bg-white/20 text-white"
                : "border-2 border-primary/30 dark:border-sky/30 text-primary dark:text-sky",
          )}
        >
          {cta}
        </div>
      ) : (
        <button
          disabled={isPending}
          onClick={() => handlePlanSelection(name)}
          className={cn(
            "mt-8 block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all duration-200 border-2",
            isAdminUnlimited
              ? "bg-primary text-primary-foreground hover:bg-primary/95 dark:bg-sky dark:text-zinc-950 dark:hover:bg-sky/95 shadow-md border-transparent"
              : isGoldCard
                ? "bg-white text-amber-600 hover:bg-white/90 shadow border-transparent"
                : featured
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow border-transparent"
                  : "bg-white border-foreground/20 text-foreground hover:bg-muted dark:bg-card dark:hover:bg-muted/50",
          )}
        >
          {isPending ? (
            <span className="inline-flex items-center justify-center gap-2">
              <ScaleLoader size="sm" className={loaderColorClass} />
              {t("redirecting")}
            </span>
          ) : (
            cta
          )}
        </button>
      )}
    </div>
  );
}
