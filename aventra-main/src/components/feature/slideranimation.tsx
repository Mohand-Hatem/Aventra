"use client";

import React from "react";
import Marqee from "../shared/marqee";
import {
  IconSparkles,
  IconCheck,
  IconBriefcase,
  IconChartBar,
  IconSearch,
  IconTrendingUp,
  IconUsers,
  IconFileText,
  IconRobot,
  IconStar,
  IconBuildingSkyscraper,
  IconTargetArrow,
} from "@tabler/icons-react";

type BadgeVariant = "b2c" | "b2b" | "stat" | "ats";

interface MarqeeItem {
  icon: React.ReactNode;
  label: string;
  variant: BadgeVariant;
}

const items: MarqeeItem[] = [
  // ── ATS
  { icon: <IconChartBar className="size-3.5" />, label: "ATS Score Analysis", variant: "ats" },
  { icon: <IconCheck className="size-3.5" />, label: "47,300+ Resumes Analyzed", variant: "stat" },
  // ── B2C
  { icon: <IconFileText className="size-3.5" />, label: "B2C · Resume ATS Scoring", variant: "b2c" },
  { icon: <IconSparkles className="size-3.5" />, label: "AI Bullet Rewriter", variant: "b2c" },
  { icon: <IconTargetArrow className="size-3.5" />, label: "Keyword Gap Analysis", variant: "b2c" },
  // ── stat
  { icon: <IconTrendingUp className="size-3.5" />, label: "+18 pts Average Score Lift", variant: "stat" },
  // ── B2B
  { icon: <IconBuildingSkyscraper className="size-3.5" />, label: "B2B · Company Hiring Suite", variant: "b2b" },
  { icon: <IconSearch className="size-3.5" />, label: "Smart Candidate Search", variant: "b2b" },
  { icon: <IconRobot className="size-3.5" />, label: "AI-Ranked Talent Pipeline", variant: "b2b" },
  { icon: <IconUsers className="size-3.5" />, label: "Bulk Resume Screening", variant: "b2b" },
  // ── stat
  { icon: <IconStar className="size-3.5" />, label: "4.9 / 5 — 2,400+ Reviews", variant: "stat" },
  // ── ATS
  { icon: <IconBriefcase className="size-3.5" />, label: "ATS 2026 Criteria", variant: "ats" },
  // ── B2C
  { icon: <IconCheck className="size-3.5" />, label: "Free ATS Scan — No Card Needed", variant: "b2c" },
  // ── B2B
  { icon: <IconBuildingSkyscraper className="size-3.5" />, label: "500+ Companies Trust Aventra", variant: "b2b" },
];

const variantStyles: Record<BadgeVariant, string> = {
  ats:  "border-primary/30 bg-primary/10 text-primary dark:border-sky/30 dark:bg-sky/10 dark:text-sky",
  b2c:  "border-chart-1/40 bg-chart-1/10 text-chart-3 dark:border-chart-1/50 dark:bg-chart-1/15 dark:text-chart-1",
  b2b:  "border-chart-3/40 bg-chart-3/10 text-chart-5 dark:border-chart-2/40 dark:bg-chart-2/10 dark:text-chart-2",
  stat: "border-border bg-muted text-muted-foreground",
};

function Dot({ variant }: { variant: BadgeVariant }) {
  const dotColors: Record<BadgeVariant, string> = {
    ats:  "bg-primary dark:bg-sky",
    b2c:  "bg-chart-1",
    b2b:  "bg-chart-3 dark:bg-chart-2",
    stat: "bg-muted-foreground",
  };
  return <span className={`size-1.5 shrink-0 rounded-full ${dotColors[variant]}`} />;
}

function Separator() {
  return (
    <span className="mx-4 flex items-center opacity-30">
      <span className="h-4 w-px bg-border" />
    </span>
  );
}

function Badge({ icon, label, variant }: MarqeeItem) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium leading-none ${variantStyles[variant]}`}
    >
      <Dot variant={variant} />
      {icon}
      {label}
    </span>
  );
}

function SliderAnimation() {
  return (
    <div className="w-full border-y border-border/50 bg-background/80 py-3 backdrop-blur-sm">
      <Marqee>
        <div className="flex items-center gap-0">
          {items.map((item, i) => (
            <React.Fragment key={i}>
              <Badge {...item} />
              <Separator />
            </React.Fragment>
          ))}
        </div>
      </Marqee>
    </div>
  );
}

export default SliderAnimation;
