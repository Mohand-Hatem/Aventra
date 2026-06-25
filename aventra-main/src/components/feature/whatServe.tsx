"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  IconSparkles,
  IconUpload,
  IconChartBar,
  IconAlertTriangle,
  IconBulb,
  IconCheck,
  IconSearch,
  IconFilter,
  IconRobot,
  IconUsers,
  IconBuilding,
  IconBriefcase,
  IconArrowRight,
  IconFileText,
  IconStarFilled,
  IconAdjustments,
} from "@tabler/icons-react";

/* ─────────────────────────────────────────────────────
   Shared primitives
───────────────────────────────────────────────────── */

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-widest",
        className,
      )}
    >
      {children}
    </span>
  );
}

function FeatureItem({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-sky/10 dark:text-sky">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   B2C — CV Analysis Mockup Card
───────────────────────────────────────────────────── */

function CVAnalysisCard() {
  const issues = [
    "Weak action verbs (×4 instances)",
    "Missing keywords: AWS, Docker",
    "Inconsistent date formatting",
  ];
  const strengths = [
    "Quantified impact metrics",
    "Clear tech stack listed",
    "Strong project outcomes",
  ];
  const suggestions = [
    { from: '"worked on"', to: '"Engineered & shipped"' },
    { from: '"helped team"', to: '"Led cross-functional team"' },
  ];

  return (
    <div className="w-full max-w-xs overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card dark:border-border/40">
      {/* header */}
      <div className="flex items-center justify-between border-b border-border/40 bg-muted/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <IconFileText className="size-4 text-primary dark:text-sky" />
          <span className="text-xs font-semibold text-foreground">
            CV Analysis
          </span>
        </div>
        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
          Complete
        </span>
      </div>

      <div className="space-y-4 p-4">
        {/* score row */}
        <div className="flex items-center gap-3">
          <div className="relative flex size-14 shrink-0 items-center justify-center">
            <svg viewBox="0 0 40 40" className="absolute size-full -rotate-90">
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                className="text-muted"
              />
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={`${(68 / 100) * 100.5} 100.5`}
                className="dark:[stroke:var(--color-sky)]"
              />
            </svg>
            <div className="flex flex-col items-center leading-none">
              <span className="text-sm font-extrabold text-foreground">68</span>
              <span className="text-[8px] text-muted-foreground">/100</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-foreground">
              Senior_Dev_2024.pdf
            </p>
            <p className="text-[10px] text-muted-foreground">
              ATS Readiness Score
            </p>
            <p className="mt-1 text-[10px] font-semibold text-amber-500">
              Needs improvement
            </p>
          </div>
        </div>

        {/* issues */}
        <div>
          <p className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-destructive">
            <IconAlertTriangle className="size-3" /> Issues Found
          </p>
          <ul className="space-y-1">
            {issues.map((i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-destructive" />
                <span className="text-[10px] leading-tight text-muted-foreground">
                  {i}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* strengths */}
        <div>
          <p className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-500">
            <IconCheck className="size-3" /> Strengths
          </p>
          <ul className="space-y-1">
            {strengths.map((s) => (
              <li key={s} className="flex items-start gap-1.5">
                <IconCheck className="mt-0.5 size-3 shrink-0 text-emerald-500" />
                <span className="text-[10px] leading-tight text-muted-foreground">
                  {s}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* AI suggestions */}
        <div>
          <p className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary dark:text-sky">
            <IconSparkles className="size-3" /> AI Rewrites
          </p>
          <div className="space-y-1.5">
            {suggestions.map((s) => (
              <div
                key={s.from}
                className="rounded-lg bg-muted/60 px-3 py-2 text-[10px]"
              >
                <span className="text-destructive line-through">{s.from}</span>
                <span className="mx-1 text-muted-foreground">→</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {s.to}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button className="w-full rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 dark:bg-sky dark:text-foreground">
          Improve Now →
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   B2B — Candidate Search Mockup Card
───────────────────────────────────────────────────── */

const mockCandidates = [
  {
    initials: "AM",
    name: "Ahmed M.",
    role: "Senior Frontend",
    exp: "6 yrs",
    score: 96,
  },
  {
    initials: "SK",
    name: "Sara K.",
    role: "ML Engineer",
    exp: "4 yrs",
    score: 91,
  },
  {
    initials: "OH",
    name: "Omar H.",
    role: "Full Stack",
    exp: "5 yrs",
    score: 87,
  },
];

function CandidateSearchCard() {
  return (
    <div className="w-full max-w-xs overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card dark:border-border/40">
      {/* header */}
      <div className="border-b border-border/40 bg-muted/40 px-4 py-3">
        <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2">
          <IconSearch className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground">
            React Developer, 5+ years…
          </span>
          <IconSparkles className="ml-auto size-3.5 text-primary dark:text-sky" />
        </div>
      </div>

      <div className="space-y-4 p-4">
        {/* filter chips */}
        <div>
          <p className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <IconAdjustments className="size-3" /> Smart Filters
          </p>
          <div className="flex flex-wrap gap-1.5">
            {["Computer Science", "React", "5+ yrs", "Remote", "B.Sc+"].map(
              (f) => (
                <span
                  key={f}
                  className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary dark:bg-sky/10 dark:text-sky"
                >
                  {f}
                </span>
              ),
            )}
          </div>
        </div>

        {/* results */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              AI-Ranked Results
            </p>
            <span className="text-[10px] font-semibold text-primary dark:text-sky">
              3 matches
            </span>
          </div>
          <div className="space-y-2.5">
            {mockCandidates.map((c, i) => (
              <div
                key={c.name}
                className="flex items-center gap-2.5 rounded-xl border border-border/40 bg-muted/30 px-3 py-2"
              >
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-primary-foreground"
                  style={{
                    backgroundColor: `color-mix(in oklch, var(--color-primary) ${90 - i * 15}%, var(--color-sky))`,
                  }}
                >
                  {c.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-foreground">
                      {c.name}
                    </p>
                    <span className="text-[10px] font-bold text-primary dark:text-sky">
                      {c.score}%
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {c.role} · {c.exp}
                  </p>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all dark:bg-sky"
                      style={{ width: `${c.score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="w-full rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 dark:bg-sky dark:text-foreground">
          View All Candidates →
        </button>
      </div>
    </div>
  );
}



/* ─────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────── */

export default function WhatServe() {
  return (
    <section className="relative w-full overflow-hidden bg-background px-4 py-24 sm:px-6 [--chart-accent:var(--color-primary)] dark:[--chart-accent:var(--color-sky)]">
      {/* ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl dark:bg-sky/8"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-sky/5 blur-3xl dark:bg-primary/5"
      />

      <div className="relative z-10 mx-auto max-w-6xl space-y-28">
        {/* ── Section header ── */}
        <div className="text-center">
          <Badge className="border-primary/30 bg-primary/10 text-primary dark:border-sky/30 dark:bg-sky/10 dark:text-sky">
            <IconSparkles className="size-3" /> What We Serve
          </Badge>
          <h2 className="font-heading mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            One platform.{" "}
            <span className="text-primary dark:text-sky">
              Two powerful sides.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Whether you&apos;re a job seeker looking to beat the ATS or a
            company searching for top talent — Aventra&apos;s AI engine works
            for both sides of the hiring equation.
          </p>
        </div>

        {/* ── B2C — For Job Seekers ── */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left: copy */}
          <div className="flex flex-col">
            <Badge className="w-fit border-primary/30 bg-primary/10 text-primary dark:border-sky/30 dark:bg-sky/10 dark:text-sky">
              <IconUsers className="size-3" /> B2C · For Job Seekers
            </Badge>

            <h3 className="font-heading mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Know exactly what your CV is missing — and fix it with AI
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Upload your resume and get an instant AI-powered breakdown. See
              your ATS score, every weakness flagged with precision, what to
              add, what to replace, and get AI-rewritten bullets that actually
              land interviews.
            </p>

            <div className="mt-8 space-y-5">
              <FeatureItem
                icon={IconUpload}
                title="Upload Any CV Format"
                description="PDF, DOCX or plain text — our parser handles all formats and extracts every detail instantly."
              />
              <FeatureItem
                icon={IconChartBar}
                title="Instant ATS Score"
                description="Get a 0–100 readiness score based on 2026 ATS criteria used by top hiring systems."
              />
              <FeatureItem
                icon={IconAlertTriangle}
                title="Issues & Gaps Detected"
                description="Weak verbs, missing keywords, inconsistent formatting — every red flag surfaces with a fix."
              />
              <FeatureItem
                icon={IconBulb}
                title="AI-Powered Rewrites"
                description="One click to replace weak lines with impactful, role-specific bullet points written by AI."
              />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-xl px-6">
                <Link href="/register">
                  Analyze My CV <IconArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-xl px-6"
              >
                <Link href="/pricing">See Pricing</Link>
              </Button>
            </div>

            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
              {[
                "Free first analysis",
                "No credit card",
                "Results in seconds",
              ].map((t) => (
                <span key={t} className="flex items-center gap-1">
                  <IconCheck className="size-3 text-primary dark:text-sky" />{" "}
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right: visual */}
          <div className="relative flex items-center justify-center">
            <div className="relative h-[520px] w-full overflow-hidden rounded-3xl">
              <Image
                src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80"
                alt="Job seeker analyzing their CV"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-linear-to-br from-background/60 via-background/20 to-transparent" />
              <div className="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent" />
            </div>

            <div className="absolute -bottom-4 -left-4 z-10 sm:-bottom-6 sm:-left-6">
              <CVAnalysisCard />
            </div>

            <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-border/60 bg-card/90 px-3 py-2 shadow-card backdrop-blur-sm">
              <IconStarFilled className="size-4 text-amber-400" />
              <span className="text-xs font-semibold text-foreground">
                47,300+ CVs Scored
              </span>
            </div>
          </div>
        </div>

        {/* ── B2B — For Companies ── */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left: visual */}
          <div className="relative flex items-center justify-center order-last lg:order-first">
            <div className="relative h-[520px] w-full overflow-hidden rounded-3xl">
              <Image
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80"
                alt="HR team searching for candidates"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-linear-to-bl from-background/60 via-background/20 to-transparent" />
              <div className="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent" />
            </div>

            <div className="absolute -bottom-4 -right-4 z-10 sm:-bottom-6 sm:-right-6">
              <CandidateSearchCard />
            </div>

            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-border/60 bg-card/90 px-3 py-2 shadow-card backdrop-blur-sm">
              <IconRobot className="size-4 text-primary dark:text-sky" />
              <span className="text-xs font-semibold text-foreground">
                AI-Ranked in Real-time
              </span>
            </div>
          </div>

          {/* Right: copy */}
          <div className="flex flex-col">
            <Badge className="w-fit border-primary/30 bg-primary/10 text-primary dark:border-sky/30 dark:bg-sky/10 dark:text-sky">
              <IconBuilding className="size-3" /> B2B · For Companies
            </Badge>

            <h3 className="font-heading mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Find your next hire with AI-ranked candidate search
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Search across thousands of qualified candidates by major, skills,
              experience level, and more. Our AI engine ranks and filters every
              CV against your job requirements — so you spend time interviewing,
              not screening.
            </p>

            <div className="mt-8 space-y-5">
              <FeatureItem
                icon={IconSearch}
                title="Search by Major & Skills"
                description="Query candidates by degree, field of study, tech stack, certifications, and soft skills simultaneously."
              />
              <FeatureItem
                icon={IconFilter}
                title="Smart CV Filters"
                description="Filter by experience, location, availability, ATS score threshold, and custom role criteria."
              />
              <FeatureItem
                icon={IconRobot}
                title="AI Match Scoring"
                description="Every candidate gets a role-specific match percentage so you instantly know who fits best."
              />
              <FeatureItem
                icon={IconBriefcase}
                title="Bulk Screening at Scale"
                description="Screen hundreds of CVs at once, export shortlists, and share candidate profiles with your team."
              />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-xl px-6">
                <Link href="/company">
                  Start Hiring <IconArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-xl px-6"
              >
                <Link href="/pricing">View Plans</Link>
              </Button>
            </div>

            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
              {["14-day free trial", "No setup fee", "Cancel anytime"].map(
                (t) => (
                  <span key={t} className="flex items-center gap-1">
                    <IconCheck className="size-3 text-primary dark:text-sky" />{" "}
                    {t}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>


      </div>
    </section>
  );
}
