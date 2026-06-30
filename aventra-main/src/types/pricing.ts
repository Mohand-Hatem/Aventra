

export type PlanName = "Free" | "Pro" | "Enterprise" | "Unlimited";

export interface PricingPlan {
  name: PlanName;
  displayName: string;
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

export interface PayRequest {
  plan: PlanName;
}

export interface PayResponse {
  success: boolean;
  message?: string;
  url?: string;
  orderId?: string;
}