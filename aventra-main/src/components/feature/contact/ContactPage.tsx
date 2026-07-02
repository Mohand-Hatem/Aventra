"use client";

import { useTranslations } from "next-intl";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiLinkedin,
  FiGithub,
  FiFacebook,
  FiInstagram,
  FiYoutube,
  FiMessageCircle,
  FiChevronDown,
} from "react-icons/fi";
import { ContactForm } from "./ContactForm";

export function ContactPage() {
  const t = useTranslations("contact");

  const contactCards = [
    {
      icon: FiMail,
      title: t("cards.email.title"),
      lines: [t("cards.email.line1"), t("cards.email.line2")],
    },
    {
      icon: FiPhone,
      title: t("cards.phone.title"),
      lines: [t("cards.phone.line1"), t("cards.phone.line2")],
    },
    {
      icon: FiMapPin,
      title: t("cards.address.title"),
      lines: [t("cards.address.line1"), t("cards.address.line2")],
    },
  ];

  const socials = [
    {
      icon: FiLinkedin,
      label: t("socials.linkedin"),
      href: "https://linkedin.com/company/aventra",
    },
    {
      icon: FiGithub,
      label: t("socials.github"),
      href: "https://github.com",
    },
    {
      icon: FiFacebook,
      label: t("socials.facebook"),
      href: "https://facebook.com",
    },
    {
      icon: FiInstagram,
      label: t("socials.instagram"),
      href: "https://instagram.com",
    },
    {
      icon: FiYoutube,
      label: t("socials.youtube"),
      href: "https://youtube.com",
    },
  ];

  const faqs = [
    t("faq.items.whatIsAventra"),
    t("faq.items.atsScore"),
    t("faq.items.dataSecure"),
    t("faq.items.contactDirectly"),
    t("faq.items.enterprisePlans"),
    t("faq.items.deleteAccount"),
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8fbff] text-slate-950 dark:bg-[#050b12] dark:text-white">
      <section className="relative mx-auto max-w-7xl px-6 pb-16 pt-28 lg:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl dark:bg-cyan-500/10" />
          <div className="absolute right-0 top-10 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl dark:bg-blue-500/10" />
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-blue-700 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300">
              <FiMessageCircle />
              {t("header.help")}
            </div>

            <h1 className="max-w-2xl text-5xl font-black tracking-tight md:text-6xl">
              {t("header.titlePrefix")} <span className="text-blue-700 dark:text-cyan-400">{t("header.brand")}</span>
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              {t("header.description")}
            </p>
          </div>

          <div className="relative hidden h-64 lg:block">
            <div className="absolute right-24 top-8 h-28 w-44 rotate-[-8deg] rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-400 shadow-2xl shadow-blue-600/30 dark:from-blue-700 dark:to-cyan-400" />

            <div className="absolute right-32 top-14 h-16 w-32 rotate-[-8deg] rounded-b-3xl border-t border-white/40 bg-white/20" />

            <div className="absolute right-8 top-28 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-white/10">
              <FiPhone className="text-2xl text-blue-600 dark:text-cyan-300" />
            </div>

            <div className="absolute right-80 top-20 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-white/10">
              <FiMessageCircle className="text-xl text-blue-600 dark:text-cyan-300" />
            </div>

            <div className="absolute right-20 top-0 h-px w-72 border-t border-dashed border-blue-400/60" />
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.75fr_1.55fr]">
          <aside className="space-y-4">
            {contactCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="rounded-[1.4rem] border border-slate-200/80 bg-white/90 p-6 shadow-lg shadow-blue-500/5 backdrop-blur-xl dark:border-white/10 dark:bg-[#121821]/90"
                >
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-700 dark:bg-cyan-400/10 dark:text-cyan-300">
                      <Icon className="text-xl" />
                    </div>

                    <div>
                      <h3 className="font-bold">{card.title}</h3>

                      <div className="mt-2 space-y-1">
                        {card.lines.map((line) => (
                          <p key={line} className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="rounded-[1.4rem] border border-slate-200/80 bg-white/90 p-6 shadow-lg shadow-blue-500/5 backdrop-blur-xl dark:border-white/10 dark:bg-[#121821]/90">
              <h3 className="font-bold">{t("connect.title")}</h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {t("connect.description")}
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                {socials.map((social) => {
                  const Icon = social.icon;

                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={social.label}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-blue-500 hover:text-blue-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-cyan-400 dark:hover:text-cyan-300"
                    >
                      <Icon className="text-lg" />
                    </a>
                  );
                })}
              </div>
            </div>
          </aside>

          <ContactForm />
        </div>

        <div className="mt-8 rounded-[1.6rem] border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-blue-500/5 backdrop-blur-xl dark:border-white/10 dark:bg-[#121821]/90">
          <h2 className="text-center text-2xl font-bold">{t("faq.heading")}</h2>

          <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            {t("faq.description")}
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <button
                key={faq}
                type="button"
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-blue-500 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-cyan-400"
              >
                <span>{faq}</span>
                <FiChevronDown className="text-lg" />
              </button>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-blue-300/50 bg-gradient-to-r from-blue-50 to-cyan-50 p-8 text-center dark:border-cyan-400/20 dark:from-cyan-500/5 dark:to-blue-500/5">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-700 dark:bg-cyan-400/10 dark:text-cyan-300">
              <FiMessageCircle className="text-3xl" />
            </div>

            <h3 className="text-2xl font-bold">{t("support.heading")}</h3>

            <p className="mt-3 max-w-lg text-sm leading-7 text-slate-600 dark:text-slate-300">
              {t("support.description")}
            </p>

            <a
              href="#"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-800 hover:shadow-xl dark:bg-cyan-500 dark:text-[#061018] dark:hover:bg-cyan-400"
            >
              <FiMessageCircle />
              {t("support.cta")}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
