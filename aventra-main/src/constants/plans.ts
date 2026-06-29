export const PLANS = {
  free: "free",
  basic: "basic",
  pro: "pro",
  enterprise: "enterprise",
  unlimited: "unlimited",
} as const;

export type PlanKey = keyof typeof PLANS;
