
import { z } from "zod";

export type RegisterFormValues = {
  name: { en: string; ar: string };
  email: string;
  password: string;
};

export type LoginSchema = {
  email: string;
  password: string;
};

export function createRegisterSchema(messages: {
  englishNameRequired: string;
  arabicNameRequired: string;
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
  passwordMinLength: string;
  passwordUppercase: string;
  passwordNumber: string;
}) {
  return z.object({
    name: z.object({
      en: z.string().min(1, messages.englishNameRequired),
      ar: z.string().min(1, messages.arabicNameRequired),
    }),
    email: z.string().min(1, messages.emailRequired).email(messages.emailInvalid),
    password: z
      .string()
      .min(1, messages.passwordRequired)
      .min(8, messages.passwordMinLength)
      .regex(/[A-Z]/, messages.passwordUppercase)
      .regex(/[0-9]/, messages.passwordNumber),
  });
}

export function createLoginSchema(messages: {
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
}) {
  return z.object({
    email: z.string().min(1, messages.emailRequired).email(messages.emailInvalid),
    password: z.string().min(1, messages.passwordRequired),
  });
}

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
});

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only digits"),
});

export type VerifyOtpSchema = z.infer<typeof verifyOtpSchema>;

export const resetPasswordSchema = z
  .object({
    email: z.string().email(),
    otp: z.string().min(6).max(6),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
