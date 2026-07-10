"use client";

import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  IconArrowRight,
  IconBrandLinkedin,
  IconBriefcase,
  IconBrain,
  IconBuildingSkyscraper,
  IconBulb,
  IconCircleCheck,
  IconCircleX,
  IconCpu,
  IconDatabase,
  IconEye,
  IconFileText,
  IconGauge,
  IconHierarchy3,
  IconListCheck,
  IconRobot,
  IconScale,
  IconSearch,
  IconSettings,
  IconShieldCheck,
  IconStack2,
  IconTarget,
} from "@tabler/icons-react";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }
  return name.trim().charAt(0).toUpperCase();
}

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center w-fit gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary dark:border-sky/25 dark:bg-sky/10 dark:text-sky">
      <span className="size-1.5 shrink-0 rounded-full bg-primary dark:bg-sky" />
      {children}
    </span>
  );
}

export default function AboutSection() {
  const t = useTranslations("about");

  const featureItems = [
    { icon: IconFileText, key: "aiResume" },
    { icon: IconGauge, key: "atsScore" },
    { icon: IconSearch, key: "semanticSearch" },
    { icon: IconListCheck, key: "ranking" },
    { icon: IconBriefcase, key: "jobMatching" },
    { icon: IconRobot, key: "careerAssistant" },
  ] as const;

  const stackItems = [
    { icon: IconCpu, key: "gpt4" },
    { icon: IconStack2, key: "rag" },
    { icon: IconHierarchy3, key: "agents" },
    { icon: IconDatabase, key: "vectorDb" },
  ] as const;

  const valueItems = [
    { icon: IconBulb, key: "innovation" },
    { icon: IconScale, key: "fairHiring" },
    { icon: IconShieldCheck, key: "transparency" },
    { icon: IconBrain, key: "intelligence" },
  ] as const;

  const oldPoints = t.raw("story.oldPoints") as string[];
  const newPoints = t.raw("story.newPoints") as string[];
  const jobSeekerItems = t.raw("bothSides.jobSeekers.items") as string[];
  const companyItems = t.raw("bothSides.companies.items") as string[];
  const teamMembers = t.raw("team.members") as {
    name: string;
    role: string;
    linkedin: string;
  }[];

  return (
    <div className="flex flex-col bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-28 pb-16 sm:px-6 sm:pt-36 sm:pb-20 lg:px-8">
        <div className="mx-auto grid max-w-360 items-center gap-12 lg:grid-cols-2 lg:gap-10">
          <div className="flex flex-col items-start gap-6">
            <SectionBadge>{t("hero.badge")}</SectionBadge>

            <h1 className="text-4xl leading-[1.05] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              {t("hero.titlePart1")}
              <br />
              {t("hero.titlePart2")}
              <br />
              {t("hero.titlePre")}{" "}
              <span className="dark:text-sky bg-clip-text text-transparent">
                {t("hero.titleAccent")}
              </span>
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="rounded-xl px-5 text-sm">
                <Link href="/">
                  {t("hero.ctaPrimary")}
                  <IconArrowRight className="size-4 rtl:rotate-180" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-xl px-5 text-sm"
              >
                <a href="#our-story">{t("hero.ctaSecondary")}</a>
              </Button>
            </div>
          </div>

          {/* Illustration */}
          <div className="relative mx-auto h-[280px] w-full overflow-hidden rounded-3xl border border-border/50 shadow-card sm:h-[360px] lg:h-[440px]">
            <Image
              src="/about.png"
              alt={t("hero.illustration.alt")}
              fill
              priority
              sizes="(min-width: 1024px) 46vw, 90vw"
              className="object-cover dark:hidden"
            />
            <Image
              src="/about-dark.png"
              alt={t("hero.illustration.alt")}
              fill
              priority
              sizes="(min-width: 1024px) 46vw, 90vw"
              className="hidden object-cover dark:block"
            />
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section id="our-story" className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-360 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-5">
            <SectionBadge>{t("story.badge")}</SectionBadge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("story.title")}
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              {t("story.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="ring-destructive/15">
              <CardContent className="flex flex-col gap-4">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-semibold text-destructive">
                  <IconCircleX className="size-3.5" />
                  {t("story.oldBadge")}
                </span>
                <p className="font-heading text-lg font-bold">
                  {t("story.oldTitle")}
                </p>
                <ul className="flex flex-col gap-2.5">
                  {oldPoints.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-destructive/60" />
                      {point}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 bg-linear-to-br from-primary to-sky text-primary-foreground ring-0">
              <CardContent className="flex flex-col gap-4">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">
                  <IconCircleCheck className="size-3.5" />
                  {t("story.newBadge")}
                </span>
                <p className="font-heading text-lg font-bold">
                  {t("story.newTitle")}
                </p>
                <ul className="flex flex-col gap-2.5">
                  {newPoints.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-sm text-primary-foreground/90"
                    >
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-white/70" />
                      {point}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/30 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-360">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-4">
              <SectionBadge>{t("features.badge")}</SectionBadge>
              <h2 className="max-w-xl text-3xl font-extrabold tracking-tight sm:text-4xl">
                {t("features.title")}
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t("features.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featureItems.map(({ icon: Icon, key }) => (
              <Card key={key}>
                <CardContent className="flex flex-col gap-4">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-sky/10 dark:text-sky">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="mb-1.5 font-heading text-base font-bold">
                      {t(`features.items.${key}.title`)}
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {t(`features.items.${key}.desc`)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-360">
          <div className="mb-10 flex flex-col gap-4">
            <SectionBadge>{t("missionVision.badge")}</SectionBadge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("missionVision.title")}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(["mission", "vision"] as const).map((key) => {
              const Icon = key === "mission" ? IconTarget : IconEye;
              return (
                <Card key={key}>
                  <CardContent className="flex flex-col gap-4">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-sky text-primary-foreground">
                      <Icon className="size-5" />
                    </span>
                    <p className="text-xs font-bold tracking-widest text-primary uppercase dark:text-sky">
                      {t(`missionVision.${key}.label`)}
                    </p>
                    <p className="font-heading text-xl font-bold">
                      {t(`missionVision.${key}.title`)}
                    </p>
                    <p className="leading-relaxed text-muted-foreground">
                      {t(`missionVision.${key}.desc`)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Technology stack */}
      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-360">
          <div className="rounded-3xl border border-border/50 bg-card
border
shadow-card p-6 sm:p-10">
            <div className="mb-8 flex flex-col gap-4">
              <SectionBadge>{t("aiStack.badge")}</SectionBadge>
              <h2 className="max-w-xl text-3xl font-extrabold tracking-tight sm:text-4xl">
                {t("aiStack.title")}
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                {t("aiStack.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {stackItems.map(({ icon: Icon, key }) => (
                <div
                  key={key}
                  className="flex items-start gap-4 rounded-2xl border border-border/50 bg-card/80 p-4"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary to-sky text-primary-foreground">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-heading text-sm font-bold">
                        {t(`aiStack.items.${key}.title`)}
                      </p>
                      <IconSettings className="size-4 shrink-0 text-muted-foreground/40" />
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {t(`aiStack.items.${key}.desc`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Built for both sides */}
      <section className="bg-muted/30 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-360">
          <div className="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-3 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("bothSides.title")}
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              {t("bothSides.subtitle")}
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-sky text-primary-foreground">
                    <IconBriefcase className="size-5" />
                  </span>
                  <p className="font-heading text-lg font-bold">
                    {t("bothSides.jobSeekers.title")}
                  </p>
                </div>
                <ul className="flex flex-col gap-3">
                  {jobSeekerItems.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2.5 text-sm text-muted-foreground"
                    >
                      <IconCircleCheck className="size-4 shrink-0 text-primary dark:text-sky" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-sky text-primary-foreground">
                    <IconBuildingSkyscraper className="size-5" />
                  </span>
                  <p className="font-heading text-lg font-bold">
                    {t("bothSides.companies.title")}
                  </p>
                </div>
                <ul className="flex flex-col gap-3">
                  {companyItems.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2.5 text-sm text-muted-foreground"
                    >
                      <IconCircleCheck className="size-4 shrink-0 text-primary dark:text-sky" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-360">
          <div className="mb-10 flex flex-col gap-4">
            <SectionBadge>{t("values.badge")}</SectionBadge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("values.title")}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {valueItems.map(({ icon: Icon, key }) => (
              <Card key={key}>
                <CardContent className="flex flex-col gap-4">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-sky/10 dark:text-sky">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="mb-1.5 font-heading text-base font-bold">
                      {t(`values.items.${key}.title`)}
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {t(`values.items.${key}.desc`)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-360">
          <div className="mb-10 flex flex-col gap-4">
            <SectionBadge>{t("team.badge")}</SectionBadge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("team.title")}
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {teamMembers.map((member) => (
              <Card
                key={member.name}
                className="w-[calc(50%-0.5rem)] sm:w-56 lg:w-64"
              >
                <CardContent className="flex flex-col items-center gap-3 text-center">
                  <span className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-sky text-lg font-bold text-primary-foreground">
                    {getInitials(member.name)}
                  </span>
                  <div>
                    <p className="font-heading text-base font-bold">
                      {member.name}
                    </p>
      
                  </div>
                  {member.linkedin ? (
                    <Link
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={member.name}
                      className="flex size-8 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary dark:hover:border-sky/40 dark:hover:text-sky"
                    >
                      <IconBrandLinkedin className="size-4" />
                    </Link>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Impact Stats */}
      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-360">
          <div className="mb-10 flex flex-col gap-4">
            <SectionBadge>{t("team.badge")}</SectionBadge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Platform Impact
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Real results from Aventra users improving their job applications
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { value: "50K+", label: "CVs Analyzed", color: "text-primary dark:text-sky bg-primary/10 dark:bg-sky/10" },
              { value: "87%", label: "Score Improvement", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" },
              { value: "12K+", label: "Companies Hiring", color: "text-violet-600 dark:text-violet-400 bg-violet-500/10" },
              { value: "<30s", label: "Analysis Speed", color: "text-amber-600 dark:text-amber-400 bg-amber-500/10" },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                  <span className={`flex size-14 items-center justify-center rounded-2xl text-xl font-bold ${stat.color}`}>
                    {stat.value}
                  </span>
                  <p className="text-sm font-semibold text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-sky text-primary-foreground">
                    <IconBriefcase className="size-5" />
                  </span>
                  <div>
                    <p className="font-heading text-lg font-bold">For Job Seekers</p>
                    <p className="text-sm text-muted-foreground">B2C Platform</p>
                  </div>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {["AI-powered ATS score analysis", "Personalized improvement suggestions", "Skills gap identification", "Industry benchmarking"].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <IconCircleCheck className="mt-0.5 size-4 shrink-0 text-primary dark:text-sky" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-sky text-primary-foreground">
                    <IconBuildingSkyscraper className="size-5" />
                  </span>
                  <div>
                    <p className="font-heading text-lg font-bold">For Companies</p>
                    <p className="text-sm text-muted-foreground">B2B Platform</p>
                  </div>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {["AI-ranked candidate matching", "Semantic CV search", "Score-based filtering", "Hiring pipeline optimization"].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <IconCircleCheck className="mt-0.5 size-4 shrink-0 text-primary dark:text-sky" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}