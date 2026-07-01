"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GoArrowRight } from "react-icons/go";
import { FcGoogle } from "react-icons/fc";
import { createLoginSchema, type LoginSchema } from "@/schemas/auth";
import { ScaleLoader } from "@/components/shared/scale-loader";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useLogin, useGoogleLogin } from "@/hooks/useAuth";

function inputClassName(hasError?: boolean) {
  return cn(
    "h-12 w-full rounded-xl border bg-card px-4 text-sm text-foreground outline-none transition-all",
    "placeholder:text-muted-foreground/40",
    "focus:ring-2 focus:ring-primary/25 focus:border-primary",
    "dark:focus:ring-sky/25 dark:focus:border-sky",
    hasError ? "border-destructive" : "border-border"
  );
}

export function LoginForm() {
  const t = useTranslations("login");
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { mutate: loginMutate, isPending } = useLogin();
    const { login } = useGoogleLogin();

  const loginSchema = useMemo(
    () =>
      createLoginSchema({
        emailRequired: t("validation.emailRequired"),
        emailInvalid: t("validation.emailInvalid"),
        passwordRequired: t("validation.passwordRequired"),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginSchema) => {
    setServerError(null);
    loginMutate({ email: data.email, password: data.password });
  };

  return (
    <div className="relative flex w-full flex-col items-center justify-center bg-background px-6 py-10 lg:w-[54%]">
      <div className="w-full max-w-125  ">
        <div className="mb-10 flex justify-end">
          <Link
            href={APP_ROUTES.home}
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("backToWebsite")}
            <GoArrowRight className="h-4 w-4 rtl:rotate-180 dark:text-sky text-primary" aria-hidden="true" />
          </Link>
        </div>

        <div className="mb-8 lg:hidden">
          <Link href={APP_ROUTES.home}>
            <Image
              src="/Aventra-logo.png"
              alt="Aventra"
              width={130}
              height={36}
              priority
              className="dark:hidden"
            />
            <Image
              src="/Aventra-logo-white1.png"
              alt="Aventra"
              width={130}
              height={36}
              priority
              className="hidden dark:block"
            />
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-foreground">
            {t("title")}
          </h1>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
          noValidate
        >
          {serverError && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
            >
              {t("email")}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t("emailPlaceholder")}
              {...register("email")}
              className={inputClassName(!!errors.email)}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
              >
                {t("password")}
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="text-[0.68rem] font-semibold uppercase tracking-widest text-primary transition-opacity hover:opacity-75 dark:text-sky"
              >
                {showPassword ? t("hide") : t("show")}
              </button>
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register("password")}
              className={inputClassName(!!errors.password)}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="-mt-1 flex justify-end">
            <Link
              href={APP_ROUTES.forgotPassword}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("forgotPassword")}
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="h-12 w-full rounded-xl bg-primary text-[0.78rem] font-bold uppercase tracking-[0.16em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {isPending ? (
              <span className="inline-flex items-center gap-2">
                <ScaleLoader size="sm" />
                {t("signingIn")}
              </span>
            ) : (
              t("signIn")
            )}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {t("orContinueWith")}
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          onClick={() => login()}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-card text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <FcGoogle className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
          {t("signInWithGoogle")}
        </button>

        <p className="mt-3 mx-auto w-full text-center text-sm text-muted-foreground">
          {t("noAccount")}{" "}
          <Link
            href={APP_ROUTES.register}
            className="font-semibold ml-1 underline text-primary transition-opacity hover:opacity-75 dark:text-sky"
          >
            {t("signUp")}
          </Link>
        </p>
      </div>
    </div>
  );
}
