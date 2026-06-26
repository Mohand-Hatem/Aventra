"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineGoogle,
} from "react-icons/ai";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormValues } from "@/schemas/auth";
import { useRegister } from "@/queries/auth";
import type { RegisterRole } from "@/types/auth";
import { appToast } from "@/lib/toast";

const inputClasses =
  "w-full rounded-2xl border border-primary/15 bg-background/80 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60 dark:border-sky/20 dark:bg-white/5 dark:focus:border-sky dark:focus:ring-sky/15";

export function RegisterForm() {
  const [role, setRole] = useState<RegisterRole>("user");
  const [showPassword, setShowPassword] = useState(false);

  const registerMutation = useRegister();

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
      terms: false,
    },
  });

  const password = watch("password") || "";

  const passwordChecks = useMemo(
    () => [
      {
        label: "At least 8 characters",
        valid: password.length >= 8,
      },
      {
        label: "One uppercase letter",
        valid: /[A-Z]/.test(password),
      },
      {
        label: "One number",
        valid: /[0-9]/.test(password),
      },
    ],
    [password]
  );

  const isSubmitting = registerMutation.isPending;

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await registerMutation.mutateAsync({
        name: {
          en: values.name.en,
          ar: values.name.ar,
        },
        email: values.email,
        password: values.password,
        role,
      });

      appToast.success("Account created successfully 🎉");
    } catch (error) {
      if (error instanceof Error) {
        appToast.error(error.message);
        return;
      }

      appToast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="rounded-[2rem] border border-primary/15 bg-background/85 p-6 shadow-2xl shadow-primary/10 backdrop-blur-xl dark:border-sky/20 dark:bg-[#07111f]/90 dark:shadow-sky/10 sm:p-8 lg:p-10">
      <div className="mb-8 flex justify-end">
        <Link
          href="/"
          className="rounded-full border border-primary/15 px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5 dark:border-sky/20 dark:text-sky dark:hover:bg-sky/10"
        >
          Back to website →
        </Link>
      </div>

      <h1 className="text-4xl font-bold tracking-tight text-foreground">
        Create an account
      </h1>

      <p className="mt-2 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary underline transition hover:text-primary/80 dark:text-sky dark:hover:text-sky/80"
        >
          Log in
        </Link>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div className="relative rounded-full border border-primary/15 bg-muted/40 p-1 shadow-inner dark:border-sky/20 dark:bg-white/5">
          <div
            className={`absolute bottom-1 top-1 w-[calc(50%-0.25rem)] rounded-full bg-gradient-to-r from-primary via-primary to-primary/80 shadow-lg shadow-primary/30 transition-all duration-300 ease-out dark:from-sky dark:via-sky dark:to-sky/80 dark:shadow-sky/30 ${
              role === "user" ? "left-1" : "left-[calc(50%+0.125rem)]"
            }`}
          />

          <div className="relative grid grid-cols-2">
            {[
              ["user", "Candidate"],
              ["company", "Company"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                disabled={isSubmitting}
                onClick={() => setRole(value as RegisterRole)}
                className={`relative z-10 flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${
                  role === value
                    ? "text-primary-foreground dark:text-background"
                    : "text-muted-foreground hover:text-primary dark:hover:text-sky"
                }`}
                aria-pressed={role === value}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FieldError label="English Name" error={errors.name?.en?.message}>
            <input
              {...register("name.en")}
              disabled={isSubmitting}
              placeholder="Enter your English name"
              className={inputClasses}
            />
          </FieldError>

          <FieldError label="Arabic Name" error={errors.name?.ar?.message}>
            <input
              {...register("name.ar")}
              disabled={isSubmitting}
              placeholder="ادخل اسمك بالعربية"
              className={inputClasses}
            />
          </FieldError>
        </div>

        <FieldError label="Email" error={errors.email?.message}>
          <input
            {...register("email")}
            disabled={isSubmitting}
            type="email"
            placeholder="Enter your email"
            className={inputClasses}
          />
        </FieldError>

        <FieldError label="Password" error={errors.password?.message}>
          <div className="relative">
            <input
              {...register("password")}
              disabled={isSubmitting}
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className={`${inputClasses} pr-12`}
            />

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-primary dark:hover:text-sky"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </button>
          </div>
        </FieldError>

        <div className="grid gap-3 sm:grid-cols-3">
          {passwordChecks.map((item) => (
            <div
              key={item.label}
              className={`text-xs font-medium ${
                item.valid
                  ? "text-primary dark:text-sky"
                  : "text-muted-foreground"
              }`}
            >
              ✓ {item.label}
            </div>
          ))}
        </div>

        <label className="flex items-start gap-3 text-sm text-muted-foreground">
          <input
            {...register("terms")}
            disabled={isSubmitting}
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-primary/20 text-primary accent-primary focus:ring-primary dark:border-sky/20 dark:text-sky dark:accent-sky dark:focus:ring-sky"
          />

          <span>
            I agree to the{" "}
            <Link
              href="/terms"
              className="font-semibold text-primary underline transition hover:text-primary/80 dark:text-sky dark:hover:text-sky/80"
            >
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="font-semibold text-primary underline transition hover:text-primary/80 dark:text-sky dark:hover:text-sky/80"
            >
              Privacy Policy
            </Link>
          </span>
        </label>

        {errors.terms?.message && (
          <p className="text-sm font-medium text-red-500">
            {errors.terms.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-gradient-to-r from-primary via-primary to-primary/80 px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 transition hover:scale-[1.01] hover:shadow-primary/45 disabled:cursor-not-allowed disabled:opacity-60 dark:from-sky dark:via-sky dark:to-sky/80 dark:text-background dark:shadow-sky/30 dark:hover:shadow-sky/45"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>

        <div className="flex items-center gap-4">
          <span className="h-px flex-1 bg-border" />
          <span className="text-sm text-muted-foreground">or</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <a
          href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-primary/15 bg-background px-5 py-3.5 text-sm font-bold text-foreground transition hover:border-primary hover:bg-primary/5 dark:border-sky/20 dark:bg-white/5 dark:hover:bg-sky/10"
        >
          <AiOutlineGoogle className="text-xl text-primary dark:text-sky" />
          Continue with Google
        </a>
      </form>
    </section>
  );
}

function FieldError({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-foreground">
        {label}
      </span>

      {children}

      {error && (
        <span className="mt-2 block text-sm font-medium text-red-500">
          {error}
        </span>
      )}
    </label>
  );
}