"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useLocaleFormat } from "@/hooks/useLocaleFormat";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import {
  IconAlertTriangle,
  IconBriefcase,
  IconCheck,
  IconChartBar,
  IconSearch,
  IconSparkles,
  IconTrendingUp,
  IconArrowRight,
  IconBulb,
} from "@tabler/icons-react";
import { useLogin, useUser } from "@/hooks/useAuth";

/*
  --chart-accent is set on the root section:
    light → var(--color-primary)
    dark  → var(--color-sky)
  Recharts SVG elements inherit it, so chart fills switch with the theme.
*/

const gaugeConfig = {
  score: { color: "var(--chart-accent)" },
} satisfies ChartConfig;

const candidateScores = [94, 87, 79];

/* ── ATS score gauge ─────────────────────────────── */

function ScoreGauge({ score }: { score: number }) {
  const { n, digits } = useLocaleFormat();
  const data = [{ value: score }];
  return (
    <div className="relative size-24 shrink-0">
      <ChartContainer
        config={gaugeConfig}
        className="h-full w-full"
        style={{ aspectRatio: "1 / 1" } as React.CSSProperties}
      >
        <RadialBarChart
          data={data}
          startAngle={90}
          endAngle={90 - (score / 100) * 360}
          innerRadius="65%"
          outerRadius="82%"
          style={{ scale: 1.4 }}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background
            dataKey="value"
            fill="var(--chart-accent)"
            cornerRadius={4}
          />
        </RadialBarChart>
      </ChartContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span dir="ltr" className="text-lg font-bold leading-none text-foreground">
          {n(score)}
        </span>
        <span dir="ltr" className="mt-0.5 text-[10px] leading-none text-muted-foreground">
          {digits("/100")}
        </span>
      </div>
    </div>
  );
}

/* ── candidate progress bars ─────────────────────── */

function CandidateChart() {
  const t = useTranslations("landing");
  const { n } = useLocaleFormat();
  const [animated, setAnimated] = useState(false);
  const candidates = (
    t.raw("candidates") as Array<{ name: string; role: string }>
  ).map((c, i) => ({ ...c, score: candidateScores[i] }));

  useEffect(() => {
    // Small delay so the element is painted before the transition fires
    const timer = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex w-full flex-col justify-between gap-3">
      {candidates.map((c, i) => (
        <div key={c.name} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">{c.name}</span>
            <span
              dir="ltr"
              className="text-xs font-semibold tabular-nums"
              style={{ color: "var(--chart-accent)", opacity: 1 - i * 0.1 }}
            >
              {n(c.score)}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{
                width: animated ? `${c.score}%` : "0%",
                backgroundColor: "var(--chart-accent)",
                opacity: 1 - i * 0.1,
                transition: `width 700ms cubic-bezier(0.4,0,0.2,1) ${i * 150}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── shared primitives ───────────────────────────── */

function Chip({
  children,
  className,
  dir,
}: {
  children: React.ReactNode;
  className?: string;
  dir?: "ltr" | "rtl" | "auto";
}) {
  return (
    <span
      dir={dir}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium leading-none",
        className,
      )}
    >
      {children}
    </span>
  );
}

function HeroCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-5",
        "border-border/60 bg-card shadow-card",
        "dark:border-border/40",
        className,
      )}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest text-primary dark:text-sky">
      {children}
    </p>
  );
}

/* ── B2B / B2C overview cards ────────────────────── */

function B2BCards() {
  const t = useTranslations("landing");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border/60" />
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {t("whoWeServe")}
        </span>
        <div className="h-px flex-1 bg-border/60" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative flex h-40 overflow-hidden border border-border/60 rounded-lg bg-card shadow-card dark:border-border/40">
          <div className="flex flex-1 flex-col justify-evenly py-5 ps-6 pe-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
                {t("jobSeekers")}
              </p>
              <p className="mt-2 text-2xl font-bold text-primary dark:text-sky">
                {t("b2cLabel")}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">{t("b2cDesc")}</p>
          </div>
          <div className="relative w-70 -inset-e-5 shrink-0">
            <Image
              src="/ats.png"
              alt={t("altAts")}
              fill
              className="object-cover object-end"
              sizes="200px"
            />
          </div>
        </div>

        {/* B2B card */}
        <div className="relative flex h-40 overflow-hidden border border-border/60 rounded-lg bg-card shadow-card dark:border-border/40">
          <div className="flex flex-1 flex-col justify-evenly py-5 ps-6 pe-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
                {t("companies")}
              </p>
              <p className="mt-2 text-2xl font-bold text-primary dark:text-sky">
                {t("b2bLabel")}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">{t("b2bDesc")}</p>
          </div>
          <div className="relative w-60 -inset-e-5 shrink-0">
            <Image
              src="/comapny.png"
              alt={t("altCompany")}
              fill
              className="object-cover object-center"
              sizes="200px"
            />
          </div>
        </div>
      </div>
    </div>
  );
}



function UserCards() {
  const t = useTranslations("landing");
  const issues = t.raw("issuesList") as string[];
  const strengths = t.raw("strengthsList") as string[];
  const suggestions = t.raw("suggestionsList") as string[];
  const tags = t.raw("tags") as string[];

  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>{t("forJobSeekers")}</SectionLabel>

      <HeroCard>
        <div className="mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <IconChartBar className="size-3.5" /> {t("atsReadiness")}
          </span>
          <Chip className="bg-primary/15 text-primary dark:bg-sky/15 dark:text-sky">
            {t("strong")}
          </Chip>
        </div>
        <div className="flex items-center gap-4">
          <ScoreGauge score={86} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              Senior_Frontend.pdf
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Chip key={tag} dir="ltr" className="bg-muted text-muted-foreground">
                  +{tag}
                </Chip>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              <span
                dir="ltr"
                className="font-semibold text-primary dark:text-sky"
              >
                {t("pointsGain")}
              </span>{" "}
              {t("vsV1")}
            </p>
          </div>
        </div>
      </HeroCard>

      <div className="grid grid-cols-3 gap-3">
        <HeroCard>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <IconAlertTriangle className="size-3.5 text-destructive" />{" "}
            {t("issues")}
          </div>
          <ul className="space-y-1.5">
            {issues.map((issue) => (
              <li key={issue} className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-destructive" />
                <span className="text-xs leading-tight text-muted-foreground">
                  {issue}
                </span>
              </li>
            ))}
          </ul>
        </HeroCard>

        <HeroCard>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <IconTrendingUp className="size-3.5 text-primary dark:text-sky" />{" "}
            {t("strengths")}
          </div>
          <ul className="space-y-1.5">
            {strengths.map((s) => (
              <li key={s} className="flex items-start gap-2">
                <IconCheck className="mt-0.5 size-3 shrink-0 text-primary dark:text-sky" />
                <span className="text-xs leading-tight text-muted-foreground">
                  {s}
                </span>
              </li>
            ))}
          </ul>
        </HeroCard>

        <HeroCard>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <IconBulb className="size-3.5 text-amber-500" /> {t("suggestions")}
          </div>
          <ul className="space-y-1.5">
            {suggestions.map((s) => (
              <li key={s} className="flex items-start gap-2">
                <IconArrowRight className="mt-0.5 size-3 shrink-0 text-amber-500 rtl:rotate-180" />
                <span className="text-xs leading-tight text-muted-foreground">
                  {s}
                </span>
              </li>
            ))}
          </ul>
        </HeroCard>
      </div>
    </div>
  );
}

/* ── company cards ───────────────────────────────── */

function CompanyCards() {
  const t = useTranslations("landing");
  const searchTags = t.raw("searchTags") as string[];

  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>{t("forCompanies")}</SectionLabel>

      <HeroCard>
        <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <IconBriefcase className="size-3.5" /> {t("candidateSearch")}
        </div>
        <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/50 px-3 py-2">
          <IconSearch className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {t("searchPlaceholder")}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {searchTags.map((tag) => (
            <Chip
              key={tag}
              className="bg-primary/10 text-primary dark:bg-sky/10 dark:text-sky"
            >
              {tag}
            </Chip>
          ))}
        </div>
      </HeroCard>

      <HeroCard className="flex min-h-40 flex-col">
        <div className="mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <IconSparkles className="size-3.5 text-primary dark:text-sky" />{" "}
            {t("aiRankedResults")}
          </span>
          <span className="text-xs text-muted-foreground">{t("matches")}</span>
        </div>
        <div className="flex flex-1 flex-col justify-between">
          <CandidateChart />
        </div>
      </HeroCard>
    </div>
  );
}

/* ── main landing ────────────────────────────────── */

export default function Landing() {
  const t = useTranslations("landing");
  const trustItems = [
    t("trust.noCard"),
    t("trust.freeAnalysis"),
    t("trust.resumesAnalyzed"),
  ];

  return (
    <section
      className={cn(
        "relative min-h-screen lg:h-screen w-full overflow-y-auto lg:overflow-hidden bg-background",

        "[--chart-accent:var(--color-primary)] dark:[--chart-accent:var(--color-sky)]",
      )}
    >
      {/* gradient tint */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-linear-to-br from-primary/5 via-background to-background dark:from-sky/10 dark:via-background dark:to-background"
      />
      {/* glow blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-e-0 top-0 z-0 h-[50vh] w-[45vw] rounded-full bg-primary/10 blur-3xl dark:bg-sky/15"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 inset-s-0 z-0 h-[30vh] w-[30vw] rounded-full bg-primary/10 blur-3xl dark:bg-sky/10"
      />

      <div className="relative z-10 mx-auto grid h-auto lg:h-full w-full max-w-360 grid-cols-1 items-center gap-8 px-4 pt-24 pb-12 sm:px-6 lg:grid-cols-2 lg:gap-14">
        {/* ── LEFT: hero copy + B2B/B2C cards ── */}
        <div className="flex flex-col">
          <span className="mb-4 flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary dark:border-sky/30 dark:bg-sky/10 dark:text-sky">
            <IconSparkles className="size-3" />
            {t("badge")}
          </span>

          {/* Heading + Mobile Pie Chart row */}
          <div className="flex flex-row items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="font-heading text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem]">
                {t("titleLine1")}
                <br />
                <span className="text-primary dark:text-sky">
                  {t("titleAccent")}
                </span>{" "}
                {t("titleLine2")}
              </h1>
            </div>
          </div>

          <p className="mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
            {t("subtitle")}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-xl px-6">
              <Link href="/register">{t("uploadResume")}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-xl px-6"
            >
              <Link href="/pricing">{t("seeHowItWorks")}</Link>
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {trustItems.map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <IconCheck className="size-3 text-primary dark:text-sky" />{" "}
                {item}
              </span>
            ))}
          </div>

          <div className="mt-8">
            <B2BCards />
          </div>
        </div>

        {/* ── RIGHT: cards ── */}
        <div className="flex h-auto lg:h-full flex-col justify-center overflow-visible lg:overflow-y-auto rounded-2xl bg-muted/30 p-4 dark:bg-transparent">
          <div className="flex flex-col gap-6">
            <UserCards />
            <div className="h-px shrink-0 bg-border/60" />
            <CompanyCards />
          </div>
        </div>
      </div>
    </section>
  );
}
