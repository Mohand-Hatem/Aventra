"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { FcGoogle } from "react-icons/fc";
import { FiCheck } from "react-icons/fi";
import { GoArrowRight } from "react-icons/go";
import { createRegisterSchema, type RegisterFormValues } from "@/schemas/auth";
import { Link } from "@/i18n/routing";
import { APP_ROUTES } from "@/constants/routes";
import { ScaleLoader } from "@/components/shared/scale-loader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RegisterRole } from "@/types/auth";
import { useGoogleLogin, useRegister } from "@/hooks/useAuth";

function inputClassName(hasError?: boolean) {
  return cn(
    "h-12 w-full rounded-xl border bg-card px-4 text-sm text-foreground outline-none transition-all",
    "placeholder:text-muted-foreground/40",
    "focus:ring-2 focus:ring-primary/25 focus:border-primary",
    "dark:focus:ring-sky/25 dark:focus:border-sky",
    "disabled:cursor-not-allowed disabled:opacity-60",
    hasError ? "border-destructive" : "border-border"
  );
}

export function RegisterForm() {
  const t = useTranslations("register");
  const [role, setRole] = useState<RegisterRole>("user");
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const registerMutation = useRegister();
  const { login } = useGoogleLogin();
  

  const registerSchema = useMemo(
    () =>
      createRegisterSchema({
        englishNameRequired: t("validation.englishNameRequired"),
        arabicNameRequired: t("validation.arabicNameRequired"),
        emailRequired: t("validation.emailRequired"),
        emailInvalid: t("validation.emailInvalid"),
        passwordRequired: t("validation.passwordRequired"),
        passwordMinLength: t("validation.passwordMinLength"),
        passwordUppercase: t("validation.passwordUppercase"),
        passwordNumber: t("validation.passwordNumber"),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: {
        en: "",
        ar: "",
      },
      email: "",
      password: "",
    },
  });

  const password = watch("password") || "";

  const passwordChecks = useMemo(
    () => [
      {
        label: t("passwordChecks.minLength"),
        valid: password.length >= 8,
      },
      {
        label: t("passwordChecks.uppercase"),
        valid: /[A-Z]/.test(password),
      },
      {
        label: t("passwordChecks.number"),
        valid: /[0-9]/.test(password),
      },
    ],
    [password, t]
  );

  const isSubmitting = registerMutation.isPending;

  const onSubmit = (values: RegisterFormValues) => {
    setServerError(null);

    registerMutation.mutate(
      {
        name: {
          en: values.name.en,
          ar: values.name.ar,
        },
        email: values.email,
        password: values.password,
        role,
      },
      {
        onError: (error) => {
          const axiosErr = error as AxiosError<{ message?: string }>;
          setServerError(
            axiosErr.response?.data?.message ?? t("genericError")
          );
        },
      }
    );
  };

  return (
    <div className="relative flex w-full flex-col items-center justify-center bg-background px-6 py-10 lg:w-[54%]">
      <div className="w-full max-w-125 ">
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
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {t("accountType")}
            </span>
            <div className="relative rounded-xl border border-border bg-card p-1">
              <div
                className={cn(
                  "absolute bottom-1 top-1 w-[calc(50%-0.25rem)] rounded-lg bg-primary transition-all duration-300 ease-out dark:bg-primary",
                  role === "user" ? "inset-s-1" : "inset-s-[calc(50%+0.125rem)]"
                )}
              />

              <div className="relative grid grid-cols-2">
                {(
                  [
                    ["user", t("candidate")],
                    ["company", t("company")],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setRole(value)}
                    className={cn(
                      "relative z-10  rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60",
                      role === value
                        ? "text-primary-foreground bg-primary dark:text-white"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="name-en"
                className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
              >
                {t("englishName")}
              </label>
              <input
                id="name-en"
                {...register("name.en")}
                disabled={isSubmitting}
                placeholder={t("englishNamePlaceholder")}
                className={inputClassName(!!errors.name?.en)}
              />
              {errors.name?.en && (
                <p className="text-xs text-destructive">
                  {errors.name.en.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="name-ar"
                className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
              >
                {t("arabicName")}
              </label>
              <input
                id="name-ar"
                {...register("name.ar")}
                disabled={isSubmitting}
                placeholder={t("arabicNamePlaceholder")}
                className={inputClassName(!!errors.name?.ar)}
              />
              {errors.name?.ar && (
                <p className="text-xs text-destructive">
                  {errors.name.ar.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
            >
              {t("email")}
            </label>
            <input
              id="email"
              {...register("email")}
              disabled={isSubmitting}
              type="email"
              autoComplete="email"
              placeholder={t("emailPlaceholder")}
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
                disabled={isSubmitting}
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-[0.68rem] font-semibold uppercase tracking-widest text-primary transition-opacity hover:opacity-75 dark:text-sky"
              >
                {showPassword ? t("hide") : t("show")}
              </button>
            </div>
            <input
              id="password"
              {...register("password")}
              disabled={isSubmitting}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              className={inputClassName(!!errors.password)}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex justify-around flex-1">
            {passwordChecks.map((item) => (
              <p
                key={item.label}
                className={cn(
                  "text-xs font-medium flex items-center",
                  item.valid
                    ? "text-primary dark:text-sky"
                    : "text-muted-foreground"
                )}
              >
                <FiCheck className="h-4 w-4 inline-block me-2 dark:text-sky text-primary" />{" "}
                {item.label}
              </p>
            ))}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-xl bg-primary text-[0.78rem] font-bold uppercase tracking-[0.16em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <ScaleLoader size="sm" />
                {t("creatingAccount")}
              </span>
            ) : (
              t("createAccount")
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
          onClick={() => login(role)}
          className={cn(
            "flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border",
            "bg-card text-sm font-medium text-foreground",
            "transition-colors hover:bg-muted"
          )}
        >
          <FcGoogle className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
          {t("continueWithGoogle")}
        </button>

        <p className="mt-3 mx-auto w-full text-center text-sm text-muted-foreground">
          {t("alreadyHaveAccount")}{" "}
          <Link
            href={APP_ROUTES.login}
            className="font-semibold ms-1 underline text-primary transition-opacity hover:opacity-75 dark:text-sky"
          >
            {t("logIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
