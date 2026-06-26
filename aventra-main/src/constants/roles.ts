

export const ROLES = {
  user: "user",
  company: "company",
  admin: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];