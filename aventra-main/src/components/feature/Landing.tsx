"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
import { useLogin, useUser } from "@/hooks/clientAuth";

/*
  --chart-accent is set on the root section:
    light → var(--color-primary)
    dark  → var(--color-sky)
  Recharts SVG elements inherit it, so chart fills switch with the theme.
*/

const gaugeConfig = {
  score: { color: "var(--chart-accent)" },
} satisfies ChartConfig;

/* ── ATS score gauge ─────────────────────────────── */

function ScoreGauge({ score }: { score: number }) {
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
        <span className="text-lg font-bold leading-none text-foreground">
          {score}
        </span>
        <span className="mt-0.5 text-[10px] leading-none text-muted-foreground">
          /100
        </span>
      </div>
    </div>
  );
}

/* ── candidate progress bars ─────────────────────── */

const candidates = [
  { name: "Ahmed M.", role: "Senior FE", score: 94 },
  { name: "Sara K.", role: "React Dev", score: 87 },
  { name: "Omar H.", role: "Full Stack", score: 79 },
];

function CandidateChart() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    // Small delay so the element is painted before the transition fires
    const t = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex w-full flex-col justify-between gap-3">
      {candidates.map((c, i) => (
        <div key={c.name} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">
              {c.name}
            </span>
            <span
              className="text-xs font-semibold"
              style={{ color: "var(--chart-accent)", opacity: 1 - i * 0.1 }}
            >
              {c.score}
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
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
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
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border/60" />
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Who We Serve
        </span>
        <div className="h-px flex-1 bg-border/60" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative flex h-40 overflow-hidden border border-border/60 rounded-lg bg-card shadow-card dark:border-border/40">
          <div className="flex flex-1 flex-col justify-evenly py-5 pl-6 pr-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
                Job Seekers
              </p>
              <p className="mt-2 text-2xl font-bold dark:text-sky text-primary ">
                {" "}
                B2C
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Resume scoring, ATS fixes & rewritten bullets to land more
              interviews.
            </p>
          </div>
          <div className="relative w-70 -right-5 shrink-0">
            <Image
              src="/ats.png"
              alt="ATS resume scoring dashboard"
              fill
              className="object-cover object-right"
              sizes="200px"
            />
          </div>
        </div>

        {/* B2B card */}
        <div className="relative flex h-40 overflow-hidden border border-border/60 rounded-lg bg-card shadow-card dark:border-border/40">
          <div className="flex flex-1 flex-col justify-evenly py-5 pl-6 pr-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
                Companies
              </p>
              <p className="mt-2 text-2xl font-bold dark:text-sky text-primary ">
                B2B
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-ranked candidate search, smart filters & bulk screening at
              scale.
            </p>
          </div>
          <div className="relative w-60 -right-5 shrink-0">
            <Image
              src="/comapny.png"
              alt="Company building"
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

/* ── user cards ──────────────────────────────────── */

function UserCards() {
  const issues = [
    "Weak action verbs",
    "Missing: React, AWS",
    "Inconsistent dates",
  ];
  const strengths = ["Strong metrics", "Clear outcomes", "Relevant stack"];
  const suggestions = [
    "Add CI/CD experience",
    "Include open source",
    "Add certifications",
  ];

  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>For Job Seekers</SectionLabel>

      <HeroCard>
        <div className="mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <IconChartBar className="size-3.5" /> ATS Readiness
          </span>
          <Chip className="bg-primary/15 text-primary dark:bg-sky/15 dark:text-sky">
            Strong
          </Chip>
        </div>
        <div className="flex items-center gap-4">
          <ScoreGauge score={86} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              Senior_Frontend.pdf
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["React", "TypeScript", "AWS"].map((t) => (
                <Chip key={t} className="bg-muted text-muted-foreground">
                  +{t}
                </Chip>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              <span className="font-semibold text-primary dark:text-sky">
                +18 pts
              </span>{" "}
              vs V1
            </p>
          </div>
        </div>
      </HeroCard>

      <div className="grid grid-cols-3 gap-3">
        <HeroCard>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <IconAlertTriangle className="size-3.5 text-destructive" /> Issues
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
            Strengths
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
            <IconBulb className="size-3.5 text-amber-500" /> Suggestions
          </div>
          <ul className="space-y-1.5">
            {suggestions.map((s) => (
              <li key={s} className="flex items-start gap-2">
                <IconArrowRight className="mt-0.5 size-3 shrink-0 text-amber-500" />
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
  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>For Companies</SectionLabel>

      <HeroCard>
        <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <IconBriefcase className="size-3.5" /> Candidate Search
        </div>
        <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/50 px-3 py-2">
          <IconSearch className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Search by major, skills, experience…
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["Senior FE", "React", "AWS", "5+ yrs"].map((t) => (
            <Chip
              key={t}
              className="bg-primary/10 text-primary dark:bg-sky/10 dark:text-sky"
            >
              {t}
            </Chip>
          ))}
        </div>
      </HeroCard>

      <HeroCard className="flex min-h-40 flex-col">
        <div className="mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <IconSparkles className="size-3.5 text-primary dark:text-sky" /> AI
            Ranked Results
          </span>
          <span className="text-xs text-muted-foreground">3 matches</span>
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
        className="pointer-events-none absolute right-0 top-0 z-0 h-[50vh] w-[45vw] rounded-full bg-primary/10 blur-3xl dark:bg-sky/15"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 z-0 h-[30vh] w-[30vw] rounded-full bg-primary/10 blur-3xl dark:bg-sky/10"
      />

      <div className="relative z-10 mx-auto grid h-auto lg:h-full w-full max-w-360 grid-cols-1 items-center gap-8 px-4 pt-24 pb-12 sm:px-6 lg:grid-cols-2 lg:gap-14">
        {/* ── LEFT: hero copy + B2B/B2C cards ── */}
        <div className="flex flex-col">
          <span className="mb-4 flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary dark:border-sky/30 dark:bg-sky/10 dark:text-sky">
            <IconSparkles className="size-3" />
            NOW SCORING WITH AVENTRA&apos;S ATS 2026 CRITERIA
          </span>

          {/* Heading + Mobile Pie Chart row */}
          <div className="flex flex-row items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="font-heading text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem]">
                Beat the ATS.
                <br />
                <span className="text-primary dark:text-sky">
                  Land more
                </span>{" "}
                interviews.
              </h1>
            </div>
          </div>

          <p className="mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
            Upload your resume. Get an instant ATS score, fixable issues, and
            AI-rewritten bullets — built for engineers, by engineers.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-xl px-6">
              <Link href="/register">Upload your resume →</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-xl px-6"
            >
              <Link href="/pricing">▶ See how it works</Link>
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {[
              "No credit card required",
              "Free ATS analysis",
              "47,300+ resumes analyzed",
            ].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <IconCheck className="size-3 text-primary dark:text-sky" /> {t}
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
