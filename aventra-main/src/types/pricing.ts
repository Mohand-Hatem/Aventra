/**
 * Folder: src/types
 * File: pricing.ts
 * Purpose:
 * - TypeScript types for pricing domain.
 */

export type PlanName = "Free" | "Pro" | "Enterprise";

export interface PricingPlan {
  name: PlanName;
  price: string;
  description: string;
  tokens: string;
  featured: boolean;
  features: string[];
  cta: string;
  href: string;
}
