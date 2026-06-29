"use client";
import { IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { PricingCardProps } from "@/types/pricing";
import { usePlanSelection } from "@/hooks/usePlanSelection";
import { useAuthStore } from "@/stores/auth-store";
import { hasUnlimitedAccess } from "@/constants/pricing";


export default function PricingCard({ plan, isActivePlan = false }: PricingCardProps) {
  const { name, price, description, tokens, featured, features, cta } = plan;
  const { handlePlanSelection, isPending } = usePlanSelection();
  const { userInfo } = useAuthStore();
  const { plan: userPlan } = userInfo || {};
  const isCurrentPlan = isActivePlan || userPlan === name;
  const isUnlimitedPlan = name === "Unlimited";
  const isGoldCard =
    isUnlimitedPlan && isCurrentPlan && hasUnlimitedAccess(userInfo);
  const isHighlighted = isGoldCard || featured;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border p-8 transition-all duration-300",
        isCurrentPlan && !isUnlimitedPlan && "opacity-50 cursor-not-allowed",
        isGoldCard &&
          "border-amber-500 bg-indigo-800 text-white",
        !isGoldCard &&
          featured &&
          "border-primary dark:border-sky bg-primary dark:bg-sky text-white shadow-2xl scale-105",
        !isGoldCard &&
          !featured &&
          "border-border bg-card text-card-foreground shadow-sm hover:shadow-md hover:-translate-y-1",
      )}
    >
      {/* Featured badge */}
      {(featured || isGoldCard) && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span
            className={cn(
              "rounded-full bg-white px-4 py-1 text-xs font-bold shadow",
              isGoldCard ? "text-amber-600" : "text-primary",
            )}
          >
            {isGoldCard ? "FULL ACCESS" : "MOST POPULAR"}
          </span>
        </div>
      )}

      {isCurrentPlan ? (<>
        <p
        className={cn(
          "text-sm font-bold uppercase tracking-widest",
          isHighlighted ? "text-white/80" : "text-primary dark:text-sky",
        )}
      >
       Your Current Plan is {name}
      </p>
      
      </>) : (
        <>
        <p
        className={cn(
          "text-sm font-bold uppercase tracking-widest",
          isHighlighted ? "text-white/80" : "text-primary dark:text-sky",
        )}
      >
        {name}
      </p>
        </>
      )}
    

      {/* Price */}
      <div className="mt-4 flex items-end gap-1">
        {!isUnlimitedPlan && (
          <span
            className={cn(
              "text-2xl font-semibold",
              isHighlighted ? "text-white/90" : "text-muted-foreground",
            )}
          >
            $
          </span>
        )}
        <span className="text-5xl font-bold tracking-tight">{price}</span>
      </div>
      {!isUnlimitedPlan && (
        <p
          className={cn(
            "mt-1 text-sm",
            isHighlighted ? "text-white/70" : "text-muted-foreground",
          )}
        >
          per month
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
      <div
        className={cn(
          "mt-4 rounded-xl px-4 py-2 text-center text-sm font-medium",
          isHighlighted
            ? "bg-white/20 text-white"
            : "bg-primary/10 dark:bg-sky/10 text-primary dark:text-sky",
        )}
      >
        {tokens}
      </div>

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
                isHighlighted
                  ? "bg-white/20 text-white"
                  : "bg-primary/10 dark:bg-sky/10 text-primary dark:text-sky",
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
            isHighlighted
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
            "mt-8 block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all duration-200",
            isGoldCard
              ? "bg-white text-amber-600 hover:bg-white/90 shadow"
              : featured
                ? "bg-white text-primary hover:bg-white/90 shadow"
                : "border-2 border-primary dark:border-sky text-primary dark:text-sky hover:bg-primary dark:hover:bg-sky hover:text-white dark:hover:text-white",
          )}
        >
          {isPending ? "Redirecting..." : cta}
        </button>
      )}
    </div>
  );
}