"use client";

import { useMemo } from "react";
import { FiSend } from "react-icons/fi";
import { ScaleLoader } from "react-spinners";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContact } from "@/hooks/useContact";
import { createContactSchema, type ContactSchema } from "@/schemas/contact";
import { cn } from "@/lib/utils";

const subjectKeys = [
  "form.subjects.candidateSupport",
  "form.subjects.companySupport",
  "form.subjects.pricing",
  "form.subjects.technicalIssue",
  "form.subjects.partnership",
  "form.subjects.other",
] as const;

function fieldClassName(hasError?: boolean) {
  return cn(
    "w-full rounded-2xl border bg-white px-4 text-sm outline-none transition focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white",
    hasError
      ? "border-red-500 dark:border-red-400"
      : "border-slate-200"
  );
}

export function ContactForm() {
  const t = useTranslations("contact");
  const { mutate, isPending } = useContact();
  const subjects = subjectKeys.map((key) => t(key));

  const contactFormSchema = useMemo(
    () =>
      createContactSchema({
        nameMin: t("validation.nameMin"),
        emailInvalid: t("validation.emailInvalid"),
        subjectRequired: t("validation.subjectRequired"),
        messageMin: t("validation.messageMin"),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactSchema>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      website: "",
    },
  });

  const onSubmit = (data: ContactSchema) => {
    mutate(data, {
      onSuccess: () => reset(),
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-[1.6rem] border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-blue-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-[#121821]/90 dark:shadow-cyan-500/10"
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">
          {t("form.title")}
        </h2>
      </div>

      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        {...register("website")}
      />

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
            {t("form.nameLabel")}
          </label>
          <input
            placeholder={t("form.namePlaceholder")}
            {...register("name")}
            className={cn(fieldClassName(!!errors.name), "h-12")}
          />
          {errors.name && (
            <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
            {t("form.emailLabel")}
          </label>
          <input
            type="email"
            autoComplete="email"
            placeholder={t("form.emailPlaceholder")}
            {...register("email")}
            className={cn(fieldClassName(!!errors.email), "h-12")}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
          {t("form.subjectLabel")}
        </label>
        <select
          {...register("subject")}
          className={cn(fieldClassName(!!errors.subject), "h-12")}
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
        {errors.subject && (
          <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
            {errors.subject.message}
          </p>
        )}
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
          {t("form.messageLabel")}
        </label>
        <textarea
          rows={7}
          placeholder={t("form.messagePlaceholder")}
          {...register("message")}
          className={cn(fieldClassName(!!errors.message), "resize-none p-4")}
        />
        {errors.message && (
          <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
            {errors.message.message}
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t("form.privacyAgreement")}{" "}
          <span className="font-semibold text-blue-600 dark:text-cyan-400">
            {t("form.privacyPolicy")}
          </span>
          .
        </p>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-700 px-7 text-sm font-bold text-white shadow-lg shadow-blue-700/25 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-cyan-500 dark:text-[#041018] dark:hover:bg-cyan-400"
        >
          {isPending ? (
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
