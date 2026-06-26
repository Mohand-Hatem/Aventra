"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";

import { forgotPasswordSchema, type ForgotPasswordSchema } from "@/schemas/auth";
import { useForgotPasswordMutation } from "@/queries/auth";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useIsDark } from "@/hooks/isDark";

export default function ForgotPasswordPage() {
  const { isDark, mounted } = useIsDark();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { mutate, isPending } = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordSchema) => {
    setServerError(null);
    setSuccessMsg(null);
    mutate(data, {
      onSuccess: (res) => {
        setSuccessMsg(res.message ?? "OTP sent to your email.");
        setTimeout(() => {
          router.push(
            `${APP_ROUTES.verifyOtp}?email=${encodeURIComponent(data.email)}`
          );
        }, 1200);
      },
      onError: (err) => {
        const axiosErr = err as AxiosError<{ message?: string }>;
        setServerError(
          axiosErr.response?.data?.message ?? "Something went wrong. Please try again."
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
          Recover access.
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Enter the email linked to your account and we&apos;ll send you a one-time code.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>

          
          {serverError && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {serverError}
            </div>
          )}

          
          {successMsg && (
            <div className="rounded-md border border-emerald-600/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
              {successMsg}
            </div>
          )}

          
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-muted-foreground"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@firm.com"
              {...register("email")}
              className={cn(
                "h-12 w-full rounded-xl border bg-card px-4 text-sm text-foreground outline-none transition-all",
                "placeholder:text-muted-foreground/40",
                "focus:ring-2 focus:ring-primary/25 focus:border-primary",
                "dark:focus:ring-sky/25 dark:focus:border-sky",
                errors.email ? "border-destructive" : "border-border"
              )}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
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
            {isPending ? "Sending…" : "Send OTP"}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Remembered your credentials?{" "}
          <Link
            href={APP_ROUTES.login}
            className="text-primary hover:underline dark:text-sky"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}