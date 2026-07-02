"use client";

import { useState } from "react";
import { FiSend } from "react-icons/fi";
import toast from "react-hot-toast";
import { ScaleLoader } from "react-spinners";
import { useTranslations } from "next-intl";

const subjectKeys = [
  "form.subjects.candidateSupport",
  "form.subjects.companySupport",
  "form.subjects.pricing",
  "form.subjects.technicalIssue",
  "form.subjects.partnership",
  "form.subjects.other",
];

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const t = useTranslations("contact");
  const subjects = subjectKeys.map((key) => t(key));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
      website: formData.get("website"),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message ?? t("notifications.errorGeneric"));
        return;
      }

      toast.success(t("notifications.successSent"));
      form.reset();
    } catch {
      toast.error(t("notifications.errorFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[1.6rem] border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-blue-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-[#121821]/90 dark:shadow-cyan-500/10"
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">
          {t("form.title")}
        </h2>
      </div>

      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
      />

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
            {t("form.nameLabel")}
          </label>
          <input
            name="name"
            required
            placeholder={t("form.namePlaceholder")}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
            {t("form.emailLabel")}
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder={t("form.emailPlaceholder")}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
          {t("form.subjectLabel")}
        </label>
        <select
          name="subject"
          required
          defaultValue=""
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
          <option value="" disabled>
            {t("form.subjectPlaceholder")}
          </option>
          {subjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
          {t("form.messageLabel")}
        </label>
        <textarea
          name="message"
          required
          rows={7}
          placeholder={t("form.messagePlaceholder")}
          className="w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm outline-none transition focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
        />
      </div>

      <div className="mt-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t("form.privacyAgreement")} <span className="font-semibold text-blue-600 dark:text-cyan-400">{t("form.privacyPolicy")}</span>.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-700 px-7 text-sm font-bold text-white shadow-lg shadow-blue-700/25 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-cyan-500 dark:text-[#041018] dark:hover:bg-cyan-400"
        >
          {loading ? (
            <>
              <ScaleLoader
                color="currentColor"
                height={14}
                width={2}
                radius={2}
                margin={1.5}
                speedMultiplier={0.9}
              />
              <span>{t("form.sending")}</span>
            </>
          ) : (
            <>
              <span>{t("form.sendMessage")}</span>
              <FiSend className="text-base" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}