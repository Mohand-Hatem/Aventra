/**
 * Folder: src/components/feature/pricing
 * File: PricingCard.tsx
 * Purpose:
 * - Single pricing plan card component.
 * - Uses primary (light) / sky (dark) CSS vars from globals.css.
 */

import Link from "next/link";
import { IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { PricingPlan } from "@/types/pricing";

interface PricingCardProps {
  plan: PricingPlan;
}

export default function PricingCard({ plan }: PricingCardProps) {
  const { name, price, description, tokens, featured, features, cta, href } = plan;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border p-8 transition-all duration-300",
        featured
          ? "border-primary dark:border-sky bg-primary dark:bg-sky text-white shadow-2xl scale-105"
          : "border-border bg-card text-card-foreground shadow-sm hover:shadow-md hover:-translate-y-1"
      )}
    >
      {/* Featured badge */}
      {featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-white px-4 py-1 text-xs font-bold text-primary shadow">
            MOST POPULAR
          </span>
        </div>
      )}

      {/* Plan name */}
      <p
        className={cn(
          "text-sm font-bold uppercase tracking-widest",
          featured ? "text-white/80" : "text-primary dark:text-sky"
        )}
      >
        {name}
      </p>

      {/* Price */}
      <div className="mt-4 flex items-end gap-1">
        <span
          className={cn(
            "text-2xl font-semibold",
            featured ? "text-white/90" : "text-muted-foreground"
          )}
        >
          $
        </span>
        <span className="text-5xl font-bold tracking-tight">{price}</span>
      </div>
      <p
        className={cn(
          "mt-1 text-sm",
          featured ? "text-white/70" : "text-muted-foreground"
        )}
      >
        per month
      </p>

      {/* Description */}
      <p
        className={cn(
          "mt-3 text-sm",
          featured ? "text-white/80" : "text-muted-foreground"
        )}
      >
        {description}
      </p>

      {/* Tokens */}
      <div
        className={cn(
          "mt-4 rounded-xl px-4 py-2 text-center text-sm font-medium",
          featured
            ? "bg-white/20 text-white"
            : "bg-primary/10 dark:bg-sky/10 text-primary dark:text-sky"
        )}
      >
        {tokens}
      </div>

      {/* Divider */}
      <div className={cn("my-6 h-px", featured ? "bg-white/20" : "bg-border")} />

      {/* Features */}
      <ul className="flex-1 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <div
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                featured
                  ? "bg-white/20 text-white"
                  : "bg-primary/10 dark:bg-sky/10 text-primary dark:text-sky"
              )}
            >
              <IconCheck size={12} stroke={3} />
            </div>
            <span className={cn(featured ? "text-white/90" : "text-muted-foreground")}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={href}
        className={cn(
          "mt-8 block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all duration-200",
          featured
            ? "bg-white text-primary hover:bg-white/90 shadow"
            : "border-2 border-primary dark:border-sky text-primary dark:text-sky hover:bg-primary dark:hover:bg-sky  dark:hover:text-white  hover:text-white"
        )}
      >
        {cta}
      </Link>
    </div>
  );
}
