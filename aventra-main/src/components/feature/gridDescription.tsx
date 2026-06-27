"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useLocaleFormat } from "@/hooks/useLocaleFormat";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  IconSparkles,
  IconBriefcase,
  IconUsers,
  IconTrendingUp,
  IconCheck,
  IconChartBar,
  IconBuilding,
  IconRobot,
  IconTarget,
  IconArrowUpRight,
  IconSearch,
  IconStar,
} from "@tabler/icons-react";

/* ── shared card wrapper ────────────────────────── */

function BentoCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card",
        "dark:border-border/40",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ── live badge ─────────────────────────────────── */

function LiveBadge({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
      </span>
      {label}
    </span>
  );
}

/* ── sparkline bars (decorative) ────────────────── */

const sparkData = [40, 55, 45, 70, 60, 85, 72, 90, 78, 95];

function SparkBars({ accent = "var(--color-primary)" }: { accent?: string }) {
  return (
    <div className="flex h-10 items-end gap-[3px]">
      {sparkData.map((h, i) => (
        <div
          key={i}
          className="w-2 rounded-sm opacity-80 transition-all"
          style={{ height: `${h}%`, backgroundColor: accent }}
        />
      ))}
    </div>
  );
}

/* ── mini line svg ──────────────────────────────── */

function MiniLine() {
  return (
    <svg viewBox="0 0 120 40" className="h-10 w-full" preserveAspectRatio="none">
      <polyline
        points="0,35 15,28 30,32 45,18 60,22 75,10 90,14 105,6 120,8"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="dark:[stroke:var(--color-sky)]"
      />
      <polyline
        points="0,35 15,28 30,32 45,18 60,22 75,10 90,14 105,6 120,8"
        fill="url(#lineGrad)"
        stroke="none"
        opacity="0.15"
      />
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const stageMeta = [
  { key: "applied" as const, count: 1247, color: "bg-blue-500" },
  { key: "scored" as const, count: 408, color: "bg-violet-500" },
  { key: "searched" as const, count: 192, color: "bg-amber-500" },
  { key: "recommended" as const, count: 47, color: "bg-emerald-500" },
];

const weekSearches = [62, 78, 55, 91, 84, 48];
const weekApplications = [40, 55, 38, 70, 60, 30];

const topCandidateScores = [96, 93, 89, 85];
const topCandidateColors = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
];

/* ── main grid ───────────────────────────────────── */

export default function GridDescription() {
  const t = useTranslations("grid");
  const { n, digits } = useLocaleFormat();

  const gridTags = ["b2c", "b2b", "ats"] as const;

  const stages = stageMeta.map((s) => ({
    ...s,
    label: t(`stages.${s.key}`),
  }));

  const weekDays = t.raw("weekDays") as string[];
  const weekData = weekDays.map((day, i) => ({
    day,
    searches: weekSearches[i],
    applications: weekApplications[i],
  }));

  const weeklyChartConfig = {
    searches: {
      label: t("activeSearches"),
      color: "var(--color-primary)",
    },
    applications: {
      label: t("applications"),
      color: "var(--color-sky)",
    },
  } satisfies ChartConfig;

  const topCandidatesRaw = t.raw("topCandidates") as Array<{
    initials: string;
    name: string;
    role: string;
  }>;
  const topATS = topCandidatesRaw.map((c, i) => ({
    ...c,
    score: topCandidateScores[i],
    color: topCandidateColors[i],
  }));

  const topMatch = t.raw("topMatchCandidate") as {
    name: string;
    role: string;
    tags: string[];
  };

  const matchStats = [
    { label: t("avgAtsScore"), value: `${n(87)}/${digits("100")}` },
    { label: t("timeToHire"), value: digits("4.2 days") },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-background py-20 px-4 sm:px-6 [--chart-accent:var(--color-primary)] dark:[--chart-accent:var(--color-sky)]">
      {/* subtle background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[60vh] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl dark:bg-sky/10"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* section heading */}
        <div className="mb-10 text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary dark:border-sky/30 dark:bg-sky/10 dark:text-sky">
            <IconSparkles className="size-3" /> {t("badge")}
          </span>
          <h2 className="font-heading mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            {t("subtitle")}
          </p>
        </div>

        {/* ── bento grid ── */}
        <div className="grid grid-cols-4 gap-4 grid-rows-[repeat(3,minmax(180px,1fr))]">

          {/* ── Cell 1 — AI Powered badge card (col 1, row 1) ── */}
          <BentoCard className="col-span-1 row-span-1">
            <div className="relative h-full w-full">
              <Image
                src="/ats.png"
                alt={t("altAts")}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute top-3 left-3">
                <LiveBadge label={t("aiActive")} />
              </div>
              <div className="absolute bottom-3 left-3">
                <IconRobot className="mb-1 size-5 text-white/80" />
                <p className="text-xs font-bold text-white">{t("aiPowered")}</p>
                <p className="text-[10px] text-white/70">{t("resumeEngine")}</p>
              </div>
            </div>
          </BentoCard>

          {/* ── Cell 2 — ATS Performance (col 2-4, row 1) ── */}
          <BentoCard className="col-span-3 row-span-1">
            <div className="relative h-full w-full">
              <Image
                src="/comapny.png"
                alt={t("altCompany")}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 75vw"
              />
              <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-black/20" />
              <div className="absolute top-3 right-3">
                <LiveBadge label={t("liveStats")} />
              </div>
              <div className="absolute inset-0 flex flex-col justify-center pl-7 pr-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                  {t("platformPerformance")}
                </p>
                <p className="mt-1 text-4xl font-extrabold text-white">
                  {n(94)}<span className="text-2xl">%</span>
                </p>
                <p className="mt-1 text-sm text-emerald-400 font-medium">
                  {t("improvement")}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  {gridTags.map((key) => (
                    <span
                      key={key}
                      className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm"
                    >
                      {t(`tags.${key}`)}
                    </span>
                  ))}
                  <span className="ml-2 text-xs text-white/60">{t("topClients")}</span>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* ── Cell 3 — Resumes Today (col 1, row 2) ── */}
          <BentoCard className="col-span-1 row-span-1 flex flex-col justify-between p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">{t("resumesToday")}</p>
                <p className="mt-1 text-3xl font-extrabold text-foreground">{n(1247)}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-2 dark:bg-sky/10">
                <IconChartBar className="size-4 text-primary dark:text-sky" />
              </div>
            </div>
            <div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500">
                <IconTrendingUp className="size-3" /> {t("fromYesterday")}
              </span>
              <MiniLine />
            </div>
          </BentoCard>

          {/* ── Cell 4 — Matches Found (col 2-3, row 2) ── */}
          <BentoCard className="col-span-2 row-span-1 flex flex-col p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <IconTarget className="size-3.5 text-primary dark:text-sky" /> {t("aiMatches")}
              </span>
              <LiveBadge label={t("realtime")} />
            </div>
            <div className="flex items-end gap-4">
              <div>
                <p className="text-4xl font-extrabold text-primary dark:text-sky">{n(3842)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("candidatesMatched")}</p>
              </div>
              <div className="flex-1">
                <Image
                  src="/ats.png"
                  alt={t("altMatching")}
                  width={120}
                  height={80}
                  className="ml-auto h-16 w-auto rounded-lg object-cover opacity-60"
                />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {matchStats.map((s) => (
                <div key={s.label} className="rounded-lg bg-muted/60 px-3 py-2">
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  <p className="text-sm font-bold text-foreground">{s.value}</p>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* ── Cell 5 — Hiring Pipeline (col 4, row 2) ── */}
          <BentoCard className="col-span-1 row-span-1 flex flex-col p-5">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {t("hiringPipeline")}
            </p>
            <div className="flex flex-col gap-2.5">
              {stages.map((s) => (
                <div key={s.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn("size-2 rounded-full", s.color)} />
                    <span className="text-xs text-foreground">{s.label}</span>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {n(s.count)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-auto pt-3 border-t border-border/40">
              <div className="flex overflow-hidden rounded-full h-1.5">
                {stages.map((s, i) => (
                  <div
                    key={i}
                    className={cn(s.color)}
                    style={{ width: `${(s.count / 1247) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          </BentoCard>

          {/* ── Cell 6 — Weekly Activity line chart (col 1-2, row 3) ── */}
          <BentoCard className="col-span-2 row-span-1 p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">{t("weeklyActivity")}</p>
                <p className="text-xs text-muted-foreground">{t("weeklySubtitle")}</p>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500">
                <IconArrowUpRight className="size-3.5" /> {digits("+12%")}
              </span>
            </div>

            <ChartContainer config={weeklyChartConfig} className="h-24 w-full">
              <AreaChart data={weekData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradSearches" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradApplications" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-sky)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-sky)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="searches"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#gradSearches)"
                  dot={false}
                  className="dark:[stroke:var(--color-sky)]"
                />
                <Area
                  type="monotone"
                  dataKey="applications"
                  stroke="var(--color-sky)"
                  strokeWidth={1.5}
                  fill="url(#gradApplications)"
                  dot={false}
                  strokeDasharray="4 2"
                />
              </AreaChart>
            </ChartContainer>

            <div className="mt-2 flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="size-2 rounded-full bg-primary dark:bg-sky" />
                {t("activeSearches")}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="size-2 rounded-full bg-sky" />
                {t("applications")}
              </span>
              <span className="ml-auto text-[10px] font-medium text-emerald-500">● {t("live")}</span>
            </div>
          </BentoCard>

          {/* ── Cell 7 — Top ATS Score (col 3, row 3) ── */}
          <BentoCard className="col-span-1 row-span-1 p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {t("topAtsScore")}
              </p>
              <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[9px] font-bold text-amber-500">
                {t("thisWeek")}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {topATS.map((c, i) => (
                <div key={c.name} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white",
                      c.color,
                    )}
                  >
                    {c.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-[11px] font-semibold text-foreground">{c.name}</p>
                      <span className="text-[10px] font-bold text-primary dark:text-sky">{n(c.score)}</span>
                    </div>
                    <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary dark:bg-sky"
                        style={{ width: `${c.score}%` }}
                      />
                    </div>
                  </div>
                  {i === 0 && (
                    <IconStar className="size-3 shrink-0 text-amber-400" />
                  )}
                </div>
              ))}
            </div>
          </BentoCard>

          {/* ── Cell 8 — Top Match for Company Search (col 4, row 3) ── */}
          <BentoCard className="col-span-1 row-span-1 p-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {t("topMatch")}
              </p>
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary dark:bg-sky/10 dark:text-sky">
                <IconSearch className="size-2.5" /> {t("companySearch")}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-violet-500 text-sm font-bold text-white">
                SK
                <span className="absolute -right-0.5 -top-0.5 flex size-3.5 items-center justify-center rounded-full bg-amber-400">
                  <IconSparkles className="size-2 text-white" />
                </span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{topMatch.name}</p>
                <p className="text-xs text-muted-foreground">{topMatch.role}</p>
              </div>
            </div>

            <div className="mt-2">
              <div className="mb-1 flex justify-between text-[10px]">
                <span className="text-muted-foreground">{t("matchScore")}</span>
                <span className="font-bold text-primary dark:text-sky">{n(91)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary dark:bg-sky"
                  style={{ width: "91%" }}
                />
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
              {topMatch.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-medium text-primary dark:bg-sky/10 dark:text-sky"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Active company search indicator */}
            <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-1.5 border-t border-border/40">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
              </span>
              <IconBuilding className="size-3 text-primary dark:text-sky" />
              <span className="text-[9px] font-semibold text-muted-foreground">{t("activelySearching")}</span>
              <span className="ml-auto text-[9px] font-bold text-emerald-500">{digits("+24")}</span>
            </div>
          </BentoCard>

        </div>
      </div>
    </section>
  );
}
