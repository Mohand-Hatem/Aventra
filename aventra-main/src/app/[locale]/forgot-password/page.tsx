"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FiArrowRight, FiMail } from "react-icons/fi";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const t = useTranslations("forgotPassword");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      toast.error(t("validation.emailRequired"));
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: trimmedEmail }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || t("messages.failedToSendOtp"));
      }

      toast.success(data.message || t("messages.otpSentSuccess"));

      router.push(
        `/reset-password?email=${encodeURIComponent(trimmedEmail)}`,
      );
    } catch (error: unknown) {
  if (error instanceof Error) {
    toast.error(error.message);
  } else {
    toast.error(t("messages.failedToSendOtp"));
  }
} finally {
  setLoading(false);
}
  }

  return (
    <main className="min-h-screen bg-background text-foreground pt-24 lg:pt-28">
      <div className="grid min-h-[calc(100vh-6rem)] grid-cols-1 lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-[#eaf3ff] dark:bg-[#090f1a] lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_30%,rgba(37,99,235,0.20),transparent_35%)] dark:bg-[radial-gradient(circle_at_40%_30%,rgba(0,191,255,0.14),transparent_35%)]" />

          <div className="relative z-10 px-16 pt-14 pb-8">
            <h2 className="max-w-xl text-3xl font-extrabold leading-snug">
              {t("heroTitle")}
            </h2>

            <p className="mt-4 max-w-md text-base leading-7 text-slate-700 dark:text-slate-300">
              {t("heroDescription")}
            </p>
          </div>

          <div className="relative z-10 flex flex-1 items-center justify-center px-16 pb-14">
            <div className="relative w-full max-w-xl rounded-[2rem] border border-white/60 bg-white/60 p-10 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <div className="absolute -right-8 -top-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xl dark:bg-[#111827]">
                <FiMail className="text-4xl text-blue-600 dark:text-cyan-400" />
              </div>

              <div className="rounded-3xl border border-blue-100 bg-white p-8 shadow-xl dark:border-white/10 dark:bg-[#111827]">
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-blue-600 dark:text-cyan-400">
                  {t("cardEyebrow")}
                </p>

                <h3 className="text-3xl font-black">{t("cardTitle")}</h3>

                <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
                  {t("cardDescription")}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-8 py-12 lg:px-16">
          <div className="w-full max-w-[500px]">
            <div className="mb-16 flex justify-end">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm text-slate-500 transition hover:text-blue-600 dark:text-slate-300 dark:hover:text-cyan-400"
              >
                {t("backToWebsite")} <FiArrowRight />
              </Link>
            </div>

            <div className="mb-10">
              <h1 className="text-4xl font-black tracking-tight">
                {t("title")}
              </h1>

              <p className="mt-4 max-w-md text-slate-500 dark:text-slate-400">
                {t("description")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">
              <div>
                <label className="mb-3 block text-xs font-bold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                  {t("emailLabel")}
                </label>

                <input
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="h-16 w-full rounded-3xl border border-slate-200 bg-white px-6 text-base outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-[#1b1c20] dark:text-white dark:focus:border-cyan-400 dark:focus:ring-cyan-400/10"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="h-16 w-full rounded-3xl bg-blue-700 text-sm font-black uppercase tracking-[0.35em] text-white shadow-lg shadow-blue-700/25 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[#2448c7] dark:hover:bg-[#2f5bff]"
              >
                {loading ? t("submitting") : t("submit")}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
              {t("rememberPassword")} {" "}
              <Link
                href="/login"
                className="font-bold text-blue-700 underline underline-offset-2 dark:text-cyan-400"
              >
                {t("signIn")}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}