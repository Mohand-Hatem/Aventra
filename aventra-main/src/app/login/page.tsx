"use client";

import { useState } from "react";
import Image from "next/image";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useIsDark } from "@/hooks/isDark";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { FcGoogle } from "react-icons/fc";

import { loginSchema, type LoginSchema } from "@/schemas/auth";
import { useLoginMutation } from "@/queries/auth";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/constants/routes";
import { ROLES } from "@/constants/roles";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const { isDark, mounted } = useIsDark();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { mutate: loginMutate, isPending } = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginSchema) => {
    setServerError(null);
    loginMutate(data, {
      onSuccess: (res) => {
        const role = res.data.user.role;
        if (role === ROLES.company) {
          router.push(APP_ROUTES.companyDashboard);
        } else {
          router.push(APP_ROUTES.userDashboard);
        }
      },
      onError: (err) => {
        const axiosErr = err as AxiosError<{ message?: string }>;
        setServerError(
          axiosErr.response?.data?.message ?? "Invalid credentials. Please try again."
        );
      },
    });
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <div className="flex min-h-screen w-full bg-background">

      {/* ===== LEFT SIDEBAR ===== */}
      <div className="relative hidden lg:flex lg:w-[46%] flex-col overflow-hidden bg-primary dark:bg-[oklch(0.19_0.04_265)]">

        {/* Blobs */}
        <div aria-hidden className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-primary-foreground/8 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-primary-foreground/10 blur-3xl" />

        <div className="relative z-10 flex flex-col flex-1 px-10 pt-10">

          {/* Logo */}
          <Link href={APP_ROUTES.home} className="inline-flex w-fit">
            <Image
              src="/Aventra-logo-white1.png"
              alt="Aventra"
              width={130}
              height={36}
              priority
            />
          </Link>

          {/* Tagline */}
          <p className="mt-4 text-[0.62rem] font-bold uppercase tracking-[0.22em] text-primary-foreground/50">
            AI CV Intelligence Platform
          </p>

          {/* Headlines */}
          <div className="mt-3 flex flex-col">
            <span className="text-2xl font-bold leading-snug text-primary-foreground">
              AI-Powered CV Analysis
            </span>
            <span className="text-2xl font-bold leading-snug text-primary-foreground">
              Smart Matching
            </span>
          </div>

          {/* Illustration + Overlay Text */}
          <div className="mt-6 flex-1 flex flex-col justify-end">
            <div className="relative overflow-hidden rounded-t-3xl border border-primary-foreground/15 border-b-0 bg-white/10 shadow-2xl backdrop-blur-sm">

              {/* Full illustration */}
              <Image
                src="/illustration.png"
                alt="Aventra AI CV Intelligence"
                width={560}
                height={480}
                priority
                className="w-full h-auto object-contain"
                style={{ display: "block" }}
              />

              {/* Text overlay at bottom of image */}
              <div
                className="absolute bottom-0 left-0 right-0 px-6 pt-16 pb-6"
                style={{
                  background:
                    "linear-gradient(to top, rgba(15,35,120,0.93) 55%, transparent 100%)",
                }}
              >
                <p className="text-sky-400 text-base font-bold mb-2">
                  Better Connections
                </p>
                <p className="text-primary-foreground/70 text-[0.78rem] leading-relaxed max-w-[280px]">
                  Leverage artificial intelligence to analyze CVs, match candidates
                  with the right opportunities, and help companies hire smarter.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ===== RIGHT PANEL ===== */}
      <div className="relative flex w-full flex-col items-center justify-center bg-background px-6 py-10 lg:w-[54%]">

        <div className="absolute right-6 top-6 lg:right-10 lg:top-8">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-[420px]">

          {/* Back to website */}
          <div className="mb-10 flex justify-end">
            <Link
              href={APP_ROUTES.home}
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Back to website
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <Link href={APP_ROUTES.home}>
              <Image
                src={
                  !mounted
                    ? "/Aventra-logo.png"
                    : isDark
                    ? "/Aventra-logo-white1.png"
                    : "/Aventra-logo.png"
                }
                alt="Aventra"
                width={130}
                height={36}
                priority
              />
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-foreground">
              Welcome back
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
            {serverError && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {serverError}
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
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

            {/* Password */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-primary transition-opacity hover:opacity-75 dark:text-sky"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password")}
                className={cn(
                  "h-12 w-full rounded-xl border bg-card px-4 text-sm text-foreground outline-none transition-all",
                  "placeholder:text-muted-foreground/40",
                  "focus:ring-2 focus:ring-primary/25 focus:border-primary",
                  "dark:focus:ring-sky/25 dark:focus:border-sky",
                  errors.password ? "border-destructive" : "border-border"
                )}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Forgot password */}
            <div className="-mt-1 flex justify-end">
              <Link
                href={APP_ROUTES.forgotPassword}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isPending}
              className="h-12 w-full rounded-xl bg-primary text-[0.78rem] font-bold uppercase tracking-[0.16em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {isPending ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Or continue with
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className={cn(
              "flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border",
              "bg-card text-sm font-medium text-foreground",
              "transition-colors hover:bg-muted"
            )}
          >
            <FcGoogle className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            Sign in with Google
          </button>

          <p className="mt-2 text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href={APP_ROUTES.register}
              className="font-semibold text-primary transition-opacity hover:opacity-75 dark:text-sky"
            >
              Sign up
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}