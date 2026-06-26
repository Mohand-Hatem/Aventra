import { z } from "zod";

export const registerSchema = z.object({
  name: z.object({
    en: z.string().min(1, "English name is required"),
    ar: z.string().min(1, "Arabic name is required"),
  }),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain one uppercase letter")
    .regex(/[0-9]/, "Password must contain one number"),
  terms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms" }),
  }),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;