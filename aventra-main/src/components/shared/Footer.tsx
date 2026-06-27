"use client";

import Image from "next/image";
import React from "react";
import { useTranslations } from "next-intl";
import { useLocaleFormat } from "@/hooks/useLocaleFormat";
import { Link } from "@/i18n/routing";
import Marqee from "@/components/shared/marqee";
import {
  IconBrandX,
  IconBrandLinkedin,
  IconBrandGithub,
  IconMail,
  IconShieldCheck,
  IconLock,
  IconRobot,
  IconStar,
  IconChartBar,
  IconUsers,
  IconSearch,
  IconSparkles,
} from "@tabler/icons-react";
import ScrollTop from "../feature/scrollTop";

function MarqueeItem({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary dark:border-sky/30 dark:bg-sky/10 dark:text-sky">
      <span className="size-1.5 shrink-0 rounded-full bg-primary dark:bg-sky" />
      {icon}
      {label}
    </span>
  );
}

function MarqueeSeparator() {
  return <span className="mx-5 h-4 w-px bg-border opacity-30" aria-hidden />;
}

const socials = [
  { href: "https://x.com", icon: IconBrandX, label: "X / Twitter" },
  { href: "https://linkedin.com", icon: IconBrandLinkedin, label: "LinkedIn" },
  { href: "https://github.com", icon: IconBrandGithub, label: "GitHub" },
];

export default function Footer() {
  const t = useTranslations("footer");
  const { n } = useLocaleFormat();

  const marqueeItems = [
    { icon: <IconRobot className="size-3.5" />, label: t("marquee.aiHiring") },
    { icon: <IconChartBar className="size-3.5" />, label: t("marquee.atsAnalysis") },
    { icon: <IconSearch className="size-3.5" />, label: t("marquee.candidateSearch") },
    { icon: <IconShieldCheck className="size-3.5" />, label: t("marquee.securePrivate") },
    { icon: <IconUsers className="size-3.5" />, label: t("marquee.users") },
    { icon: <IconSparkles className="size-3.5" />, label: t("marquee.aiRewriter") },
    { icon: <IconStar className="size-3.5" />, label: t("marquee.reviews") },
    { icon: <IconLock className="size-3.5" />, label: t("marquee.dataProtected") },
  ];

  const trustBadges = [
    {
      icon: <IconShieldCheck className="size-6 text-primary dark:text-sky" />,
      title: t("trust.secureTitle"),
      sub: t("trust.secureSub"),
    },
    {
      icon: <IconLock className="size-6 text-primary dark:text-sky" />,
      title: t("trust.privacyTitle"),
      sub: t("trust.privacySub"),
    },
    {
      icon: <IconRobot className="size-6 text-primary dark:text-sky" />,
      title: t("trust.aiTitle"),
      sub: t("trust.aiSub"),
    },
    {
      icon: <IconStar className="size-6 text-amber-400" />,
      title: t("trust.ratedTitle"),
      sub: t("trust.ratedSub"),
    },
  ];

  const columns = [
    {
      heading: t("columns.product"),
      links: [
        { href: "/features", label: t("links.features") },
        { href: "/pricing", label: t("links.pricing") },
        { href: "/demo", label: t("links.demo") },
        { href: "/integrations", label: t("links.integrations") },
        { href: "/changelog", label: t("links.changelog") },
      ],
    },
    {
      heading: t("columns.resources"),
      links: [
        { href: "/docs", label: t("links.documentation") },
        { href: "/docs/api", label: t("links.apiReference") },
        { href: "/blog", label: t("links.blog") },
        { href: "/case-studies", label: t("links.caseStudies") },
        { href: "/webinars", label: t("links.webinars") },
      ],
    },
    {
      heading: t("columns.company"),
      links: [
        { href: "/about", label: t("links.aboutUs") },
        { href: "/careers", label: t("links.careers") },
        { href: "/press", label: t("links.pressKit") },
        { href: "/contact", label: t("links.contact") },
        { href: "/partners", label: t("links.partners") },
      ],
    },
    {
      heading: t("columns.legal"),
      links: [
        { href: "/terms", label: t("links.terms") },
        { href: "/privacy", label: t("links.privacy") },
        { href: "/cookies", label: t("links.cookies") },
      ],
    },
  ];

  return (
    <footer className="w-full border-t border-border/60">
      <div className="border-b border-border/50 bg-background/80 py-3 backdrop-blur-sm">
        <Marqee>
          <div className="flex items-center">
            {marqueeItems.map((item, i) => (
              <div key={i} className="flex items-center">
                <MarqueeItem {...item} />
                <MarqueeSeparator />
              </div>
            ))}
          </div>
        </Marqee>
      </div>

      <div className="mx-auto max-w-360 px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr_200px]">
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/Aventra-logo.png"
                alt="Aventra logo"
                width={140}
                height={40}
                className="dark:hidden"
              />
              <Image
                src="/Aventra-logo-white1.png"
                alt="Aventra logo"
                width={140}
                height={40}
                className="hidden dark:block"
              />
            </Link>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("description")}
            </p>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("stayUpdated")}
              </p>
              <form className="flex gap-2">
                <div className="relative flex-1">
                  <IconMail className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    className="h-9 w-full rounded-lg border border-border bg-muted/40 ps-9 pe-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-sky/50"
                  />
                </div>
                <button
                  type="submit"
                  className="h-9 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 dark:bg-sky dark:text-foreground dark:hover:bg-sky/90"
                >
                  {t("join")}
                </button>
              </form>
            </div>

            <div className="flex items-center gap-2">
              {socials.map(({ href, icon: Icon, label }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-8 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary dark:hover:border-sky/40 dark:hover:text-sky"
                >
                  <Icon className="size-4" />
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {columns.map((col) => (
              <div key={col.heading}>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-foreground">
                  {col.heading}
                </p>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-foreground">
              {t("compliance")}
            </p>
            {trustBadges.map((b) => (
              <div
                key={b.title}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 px-3 py-2.5"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/40 bg-background">
                  {b.icon}
                </span>
                <div>
                  <p className="text-xs font-semibold text-foreground">{b.title}</p>
                  <p className="text-[10px] text-muted-foreground">{b.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border/40">
        <div className="mx-auto flex max-w-360 items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-xs text-muted-foreground">
            {`© ${n(new Date().getFullYear())} Aventra | ${t("copyright")}`}
          </p>
          <ScrollTop />
        </div>
      </div>
    </footer>
  );
}
