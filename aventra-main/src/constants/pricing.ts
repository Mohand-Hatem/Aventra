

import type { AuthUser } from "@/types/auth";
import type { PlanName } from "@/types/pricing";
import { ROLES } from "@/constants/roles";

export function hasUnlimitedAccess(userInfo: AuthUser | null | undefined): boolean {
  if (!userInfo) return false;
  return userInfo.plan === "Unlimited" || userInfo.role === ROLES.admin;
}

export const PRICING_PLANS_CONFIG: {
  name: Exclude<PlanName, "Unlimited">;
  price: string;
  featured: boolean;
}[] = [
  { name: "Free", price: "0", featured: false },
  { name: "Pro", price: "500", featured: true },
  { name: "Enterprise", price: "1000", featured: false },
];

export const UNLIMITED_PLAN_CONFIG = {
  name: "Unlimited" as const,
  price: "∞",
  featured: true,
};
