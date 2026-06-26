"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";

import { verifyOtpSchema, type VerifyOtpSchema } from "@/schemas/auth";
import { useVerifyOtpMutation } from "@/queries/auth";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useIsDark } from "@/hooks/isDark";

function VerifyOtpForm() {
  const { isDark, mounted } = useIsDark();

  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";

  const [serverError, setServerError] = useState<string | null>(null);

  const { mutate, isPending } = useVerifyOtpMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOtpSchema>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { email: emailParam },
  });

  const onSubmit = (data: VerifyOtpSchema) => {
    setServerError(null);
    mutate(data, {
      onSuccess: () => {
        router.push(
          `${APP_ROUTES.resetPassword}?email=${encodeURIComponent(data.email)}&otp=${data.otp}`
        );
      },
      onError: (err) => {
        const axiosErr = err as AxiosError<{ message?: string }>;
        setServerError(
          axiosErr.response?.data?.message ?? "Invalid or expired OTP."
        );
      },
    });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="absolute right-8 top-8">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">

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
          Verify your identity.
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          {emailParam
            ? `We sent a 6-digit code to ${emailParam}.`
            : "Enter the 6-digit verification code sent to your email."}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>

          {serverError && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <input type="hidden" {...register("email")} />

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="otp"
              className="text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-muted-foreground"
            >
              One-Time Code
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              {...register("otp")}
              className={cn(
                "h-14 w-full rounded-xl border bg-card px-4 text-center text-xl font-bold tracking-[0.5em] text-foreground outline-none transition-all",
                "placeholder:tracking-normal placeholder:text-muted-foreground/40",
                "focus:ring-2 focus:ring-primary/25 focus:border-primary",
                "dark:focus:ring-sky/25 dark:focus:border-sky",
                errors.otp ? "border-destructive" : "border-border"
              )}
            />
            {errors.otp && (
              <p className="text-xs text-destructive">{errors.otp.message}</p>
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
            {isPending ? "Verifying..." : "Verify Code"}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Didn&apos;t receive a code?{" "}
          <Link
            href={APP_ROUTES.forgotPassword}
            className="text-primary hover:underline dark:text-sky"
          >
            Resend
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpForm />
    </Suspense>
  );
}