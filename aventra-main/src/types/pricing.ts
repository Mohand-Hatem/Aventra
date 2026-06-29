

export type PlanName = "Free" | "Pro" | "Enterprise" | "Unlimited";

export interface PricingPlan {
  name: PlanName;
  price: string;
  description: string;
  tokens: string;
  featured: boolean;
  features: string[];
  cta: string;
  // href: string;
}

export interface PricingCardProps {
  plan: PricingPlan;
  isActivePlan?: boolean;
}