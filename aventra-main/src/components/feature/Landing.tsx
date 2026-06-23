"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  LabelList,
} from "recharts";
import {
  IconAlertTriangle,
  IconBriefcase,
  IconCheck,
  IconChartBar,
  IconSearch,
  IconSparkles,
  IconTrendingUp,
} from "@tabler/icons-react";

/*
  --chart-accent is set on the root section:
    light → var(--color-primary)
    dark  → var(--color-sky)
  Recharts SVG elements inherit it, so chart fills switch with the theme.
*/

const gaugeConfig = {
  score: { color: "var(--chart-accent)" },
} satisfies ChartConfig;

const candidateConfig = {
  score: { label: "AI Score", color: "var(--chart-accent)" },
} satisfies ChartConfig;

/* ── ATS score gauge ─────────────────────────────── */

function ScoreGauge({ score }: { score: number }) {
  const data = [{ value: score }];
  return (
    <div className="relative size-16 shrink-0">
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
        <span className="text-sm font-bold leading-none text-foreground">
          {score}
        </span>
        <span className="mt-0.5 text-[8px] leading-none text-muted-foreground">
          /100
        </span>
      </div>
    </div>
  );
}

/* ── candidate bar chart ─────────────────────────── */

const candidates = [
  { name: "Ahmed M.", role: "Senior FE", score: 94 },
  { name: "Sara K.", role: "React Dev", score: 87 },
  { name: "Omar H.", role: "Full Stack", score: 79 },
];

function CandidateChart() {
  return (
    <ChartContainer
      config={candidateConfig}
      className="h-[96px] w-full"
      style={{ aspectRatio: "unset" } as React.CSSProperties}
    >
      <BarChart
        data={candidates}
        layout="vertical"
        margin={{ top: 2, right: 32, bottom: 2, left: 0 }}
        barSize={10}
        barCategoryGap="28%"
      >
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis
          type="category"
          dataKey="name"
          width={54}
          tick={{ fontSize: 10, fontWeight: 500, fill: "var(--color-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <Bar dataKey="score" radius={[0, 4, 4, 0]}>
          {candidates.map((_, i) => (
            <Cell
              key={i}
              fill="var(--chart-accent)"
              fillOpacity={1 - i * 0.1}
            />
          ))}
          <LabelList
            dataKey="score"
            position="right"
            style={{
              fontSize: 10,
              fontWeight: 600,
              fill: "var(--color-muted-foreground)",
            }}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

/* ── shared primitives ───────────────────────────── */

function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium leading-none", className)}>
      {children}
    </span>
  );
}

function HeroCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      "rounded-xl border p-2.5",
      "border-border bg-card shadow-sm ring-1 ring-border/40",
      "dark:shadow-none dark:ring-0 dark:border-border/60",
      className,
    )}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-primary dark:text-sky">
      {children}
    </p>
  );
}

/* ── user cards ──────────────────────────────────── */

function UserCards() {
  const issues = ["Weak action verbs", "Missing: React, AWS", "Inconsistent dates"];
  const strengths = ["Strong metrics", "Clear outcomes", "Relevant stack"];

  return (
    <div className="flex flex-col gap-2">
      <SectionLabel>For Job Seekers</SectionLabel>

      <HeroCard>
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <IconChartBar className="size-3" /> ATS Readiness
          </span>
          <Chip className="bg-primary/15 text-primary dark:bg-sky/15 dark:text-sky">Strong</Chip>
        </div>
        <div className="flex items-center gap-3">
          <ScoreGauge score={86} />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-foreground">
              Senior_Frontend.pdf
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {["React", "TypeScript", "AWS"].map((t) => (
                <Chip key={t} className="bg-muted text-muted-foreground">
                  +{t}
                </Chip>
              ))}
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground">
              <span className="font-medium text-primary dark:text-sky">+18</span> vs V1
            </p>
          </div>
        </div>
      </HeroCard>

      <div className="grid grid-cols-2 gap-2">
        <HeroCard>
          <div className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <IconAlertTriangle className="size-3 text-destructive" /> Issues
          </div>
          <ul className="space-y-1">
            {issues.map((issue) => (
              <li key={issue} className="flex items-start gap-1.5">
                <span className="mt-1 size-1 shrink-0 rounded-full bg-destructive" />
                <span className="text-[10px] leading-tight text-muted-foreground">
                  {issue}
                </span>
              </li>
            ))}
          </ul>
        </HeroCard>

        <HeroCard>
          <div className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <IconTrendingUp className="size-3 text-primary dark:text-sky" /> Strengths
          </div>
          <ul className="space-y-1">
            {strengths.map((s) => (
              <li key={s} className="flex items-start gap-1.5">
                <IconCheck className="mt-0.5 size-2.5 shrink-0 text-primary dark:text-sky" />
                <span className="text-[10px] leading-tight text-muted-foreground">
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
    <div className="flex flex-col gap-2">
      <SectionLabel>For Companies</SectionLabel>

      <HeroCard>
        <div className="mb-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <IconBriefcase className="size-3" /> Candidate Search
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/50 px-2.5 py-1.5">
          <IconSearch className="size-3 shrink-0 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">
            Search by major, skills, experience…
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {["Senior FE", "React", "AWS", "5+ yrs"].map((t) => (
            <Chip key={t} className="bg-primary/10 text-primary dark:bg-sky/10 dark:text-sky">
              {t}
            </Chip>
          ))}
        </div>
      </HeroCard>

      <HeroCard>
        <div className="mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <IconSparkles className="size-3 text-primary dark:text-sky" /> AI Ranked Results
          </span>
          <span className="text-[10px] text-muted-foreground">3 matches</span>
        </div>
        <CandidateChart />
      </HeroCard>
    </div>
  );
}

/* ── main landing ────────────────────────────────── */

export default function Landing() {
  return (
    <section
      className={cn(
        "relative h-screen w-full overflow-hidden bg-background",
        /* set --chart-accent to switch between primary (light) and sky (dark) */
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

      <div className="relative z-10 mx-auto grid h-full w-full max-w-7xl grid-cols-1 items-center gap-8 px-4 pt-20 pb-6 sm:px-6 lg:grid-cols-2 lg:gap-14">

        {/* ── LEFT: hero copy ── */}
        <div className="flex flex-col">
          <span className="mb-4 flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary dark:border-sky/30 dark:bg-sky/10 dark:text-sky">
            <IconSparkles className="size-3" />
            NOW SCORING WITH AVENTRA&apos;S ATS 2026 CRITERIA
          </span>

          <h1 className="font-heading text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem]">
            Beat the ATS.
            <br />
            <span className="text-primary dark:text-sky">Land more</span> interviews.
          </h1>

          <p className="mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
            Upload your resume. Get an instant ATS score, fixable issues, and
            AI-rewritten bullets — built for engineers, by engineers.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-xl px-6">
              <Link href="/register">Upload your resume →</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl px-6">
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
        </div>

        {/* ── RIGHT: cards ── */}
        <div className="flex h-full flex-col justify-center overflow-y-auto rounded-2xl bg-muted/30 p-3 dark:bg-transparent">
          <div className="flex flex-col gap-3">
            <UserCards />
            <div className="h-px shrink-0 bg-border/60" />
            <CompanyCards />
          </div>
        </div>

      </div>
    </section>
  );
}
