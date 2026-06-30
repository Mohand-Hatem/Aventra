export const PLANS = {
  free: "free",
  pro: "pro",
  enterprise: "enterprise",
  unlimited: "unlimited",
} as const;

export type PlanKey = keyof typeof PLANS;
