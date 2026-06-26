"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";

import { resetPasswordSchema, type ResetPasswordSchema } from "@/schemas/auth";
import { useResetPasswordMutation } from "@/queries/auth";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useIsDark } from "@/hooks/isDark";

function ResetPasswordForm() {
  const { isDark, mounted } = useIsDark();

  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";
  const otpParam = searchParams.get("otp") ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { mutate, isPending } = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: emailParam, otp: otpParam },
  });

  const onSubmit = (data: ResetPasswordSchema) => {
    setServerError(null);
    mutate(data, {
      onSuccess: () => router.push(APP_ROUTES.login),
      onError: (err) => {
        const axiosErr = err as AxiosError<{ message?: string }>;
        setServerError(
          axiosErr.response?.data?.message ?? "Failed to reset password."
        );
      },
    });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="absolute right-8 top-8">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">

       
        <Link href={APP_ROUTES.home} className="mb-14 block">
          <Image
            src={!mounted ? "/Aventra-logo.png" : isDark ? "/Aventra-logo-white1.png" : "/Aventra-logo.png"}
            alt="Aventra"
            width={160}
            height={45}
            priority
          />
        </Link>

        <h1
          className="mb-2 text-3xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Set new password.
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Choose a strong password for your Aventra account.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>

          {serverError && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <input type="hidden" {...register("email")} />
          <input type="hidden" {...register("otp")} />

          
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-muted-foreground"
              >
                New Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-primary hover:opacity-80 dark:text-sky"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              {...register("newPassword")}
              className={cn(
                "h-12 w-full rounded-xl border bg-card px-4 text-sm text-foreground outline-none transition-all",
                "placeholder:text-muted-foreground/50",
                "focus:ring-2 focus:ring-primary/25 focus:border-primary",
                "dark:focus:ring-sky/25 dark:focus:border-sky",
                errors.newPassword ? "border-destructive" : "border-border"
              )}
            />
            {errors.newPassword && (
              <p className="text-xs text-destructive">{errors.newPassword.message}</p>
            )}
          </div>

          
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="confirmPassword"
                className="text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-muted-foreground"
              >
                Confirm Password
              </label>
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-primary hover:opacity-80 dark:text-sky"
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              {...register("confirmPassword")}
              className={cn(
                "h-12 w-full rounded-xl border bg-card px-4 text-sm text-foreground outline-none transition-all",
                "placeholder:text-muted-foreground/50",
                "focus:ring-2 focus:ring-primary/25 focus:border-primary",
                "dark:focus:ring-sky/25 dark:focus:border-sky",
                errors.confirmPassword ? "border-destructive" : "border-border"
              )}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          
          <Button
            type="submit"
            disabled={isPending}
            className={cn(
              "h-12 w-full rounded-xl text-[0.8rem] font-bold uppercase tracking-[0.15em] disabled:opacity-60",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "dark:bg-sky dark:text-background dark:hover:bg-sky/90"
            )}
          >
            {isPending ? "Resetting..." : "Reset Password"}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          <Link
            href={APP_ROUTES.login}
            className="text-primary hover:underline dark:text-sky"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}