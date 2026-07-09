// Folder: src/components/feature/company-search
// File: CandidateCards.tsx
// Purpose: Responsive list of candidate profiles styled as cards with SVG fit circles, social icons, selection action, and a contact dialog.

"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaChevronDown,
  FaCheck,
  FaPhone,
  FaMapPin,
  FaFilePdf,
  FaXmark,
} from "react-icons/fa6";
import { cn } from "@/lib/utils";
import { ensureAbsoluteUrl } from "@/lib/utils";
import {
  getLocalizedCandidateName,
  type CandidateResult,
} from "@/types/company";

import { CandidateSummaryPanel } from "./CandidateDetail";

interface CandidateCardsProps {
  candidates: CandidateResult[];
  selectedCandidate: CandidateResult | null;
  onSelectCandidate: (c: CandidateResult) => void;
  isPending: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  remainingCount?: number;
  minAtsScore?: number;
  setMinAtsScore?: (v: number) => void;
}

function getJobTitle(candidate: CandidateResult): string {
  if (candidate.experience && candidate.experience.length > 0) {
    const exp = candidate.experience[0];
    if (exp.role && exp.company) return `${exp.role} at ${exp.company}`;
    if (exp.role) return exp.role;
  }
  return "Candidate";
}

// Premium gradient avatar with initials
function CandidateAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const gradients = [
    "from-indigo-500 to-purple-600",
    "from-sky-500 to-blue-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600",
  ];
  const grad = gradients[initials.charCodeAt(0) % gradients.length];

  return (
    <div className="relative">
      <div
        className={cn(
          "flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-2xl bg-linear-to-br font-bold text-white shadow-md text-xl",
          grad,
        )}
      >
        {initials}
      </div>
      {/* Verification Checkmark Badge overlay */}
      <div className="absolute -bottom-1 -right-1 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-card bg-emerald-500 text-white shadow-sm">
        <FaCheck size={10} strokeWidth={3} />
      </div>
    </div>
  );
}

// Fit Score Radial Indicator
function FitScoreCircle({ score }: { score: number }) {
  // SVG configuration
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const colorClass =
    score >= 80
      ? {
          stroke: "stroke-primary",
          text: "text-primary dark:text-sky",
          bg: "bg-primary/10 dark:bg-sky/10",
        }
      : score >= 60
        ? {
            stroke: "stroke-sky",
            text: "text-sky",
            bg: "bg-sky/10",
          }
        : {
            stroke: "stroke-muted-foreground",
            text: "text-muted-foreground",
            bg: "bg-muted/10",
          };

  return (
    <div className="relative flex items-center justify-center h-18 w-18">
      <svg className="w-full h-full transform -rotate-90">
        {/* Track */}
        <circle
          cx="36"
          cy="36"
          r={radius}
          className="stroke-muted dark:stroke-muted/30"
          strokeWidth="3.5"
          fill="transparent"
        />
        {/* Progress */}
        <circle
          cx="36"
          cy="36"
          r={radius}
          className={cn(
            "transition-all duration-500 ease-out",
            colorClass.stroke,
          )}
          strokeWidth="3.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      {/* Label inside */}
      <div className="absolute flex flex-col items-center justify-center">
        <span
          className={cn(
            "text-base font-extrabold leading-none tracking-tighter tabular-nums",
            colorClass.text,
          )}
        >
          {score}%
        </span>
        <span className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground/80 mt-0.5">
          FIT
        </span>
      </div>
    </div>
  );
}

export default function CandidateCards({
  candidates,
  selectedCandidate,
  onSelectCandidate,
  isPending,
  onLoadMore,
  hasMore = false,
  remainingCount = 0,
}: CandidateCardsProps) {
  const t = useTranslations("candidateSearch");
  const locale = useLocale();
  const [minAtsScore, setMinAtsScore] = useState<number>(0);

  if (isPending && !candidates.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-border/80 bg-canvas/10 shadow-card">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative flex h-14 w-14 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20 dark:bg-sky/20" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 dark:bg-sky/10">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent dark:border-sky" />
            </div>
          </div>
          <div>
            <p className="font-medium text-foreground">
              {t("resultsTable.searching")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("resultsTable.searchingHint")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!candidates.length) {
    return (
      <div className="flex bg-canvas/10 h-full flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/80  px-8 py-12 text-center shadow-card min-h-[300px] max-h-[500px] overflow-y-auto">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 dark:bg-sky/10">
          <svg
            className="h-8 w-8 text-primary dark:text-sky"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <div className="max-w-sm">
          <p className="font-medium text-foreground">
            {t("resultsTable.emptyTitle")}
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Describe your search using the floating recruiter chat assistant.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0 border border-border/60 bg-canvas/10 rounded-2xl shadow-sm overflow-hidden">
      {/* Top Filter Bar */}
      <div className="flex items-center justify-between border-b border-border/40 p-4 bg-muted/10">
        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-1.5 w-48">
            <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground tracking-wider">
              <span>MIN. ATS SCORE</span>
              <span className="text-foreground">{minAtsScore || 0}+</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={minAtsScore || 0}
              onChange={(e) => setMinAtsScore(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-primary"
            />
          </div>
          <div className="w-px h-6 bg-border/60" />
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Skills
            </span>
            <div className="flex items-center gap-2">
              <span className="bg-muted px-2 py-1 rounded text-xs font-semibold text-foreground flex items-center gap-1.5">
                Node.js <FaXmark className="text-muted-foreground" size={10} />
              </span>
              <span className="bg-muted px-2 py-1 rounded text-xs font-semibold text-foreground flex items-center gap-1.5">
                React <FaXmark className="text-muted-foreground" size={10} />
              </span>
              <button className="text-xs text-primary font-medium hover:underline">
                + Add Filter
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            AI Filter Active
          </span>
          <button className="text-[11px] text-muted-foreground hover:text-foreground hover:underline font-medium">
            Clear search
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[3.5fr_2fr_1fr_1.5fr] px-6 py-3 border-b border-border/40 bg-muted/5 text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
        <div>Candidate</div>
        <div>Top Skills</div>
        <div>ATS</div>
        <div className="text-right">Contact</div>
      </div>

      {/* Candidate List — max 4 rows visible, then scroll */}
      <div
        className="flex flex-col overflow-y-auto"
        style={{ maxHeight: "calc(4 * 72px)" }}
      >
        {candidates.map((c) => {
          const name = getLocalizedCandidateName(
            c.name,
            locale,
            t("candidateDetail.unknown"),
          );
          const jobTitle = getJobTitle(c);
          const isSelected = selectedCandidate?.cvId === c.cvId;

          return (
            <div
              key={c.cvId}
              onClick={() => onSelectCandidate(isSelected ? c : c)}
              className={cn(
                "grid grid-cols-[3.5fr_2fr_1fr_1.5fr] items-center px-6 py-4 cursor-pointer transition-colors border-b border-border/40 last:border-b-0 h-[72px]",
                isSelected
                  ? "bg-primary/5 border-l-[3px] border-l-primary"
                  : "hover:bg-muted/30 border-l-[3px] border-l-transparent",
              )}
            >
              {/* Candidate */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-white text-xs bg-linear-to-br",
                    [
                      "from-indigo-500 to-purple-600",
                      "from-sky-500 to-blue-600",
                      "from-emerald-500 to-teal-600",
                      "from-amber-500 to-orange-600",
                      "from-rose-500 to-pink-600",
                    ][name.charCodeAt(0) % 5],
                  )}
                >
                  {name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-[13px] text-foreground truncate">
                    {name}
                  </span>
                  <span className="text-[11px] text-muted-foreground truncate">
                    {jobTitle}
                  </span>
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5 pr-2">
                {c.skills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="rounded bg-secondary border border-border/40 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground"
                  >
                    {skill}
                  </span>
                ))}
                {c.skills.length > 3 && (
                  <span className="rounded bg-secondary border border-border/40 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    +{c.skills.length - 3}
                  </span>
                )}
              </div>

              {/* ATS */}
              <div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold",
                    c.atsScore >= 80
                      ? "bg-primary/10 text-primary dark:bg-sky/20 dark:text-sky"
                      : c.atsScore >= 60
                        ? "bg-sky/10 text-sky"
                        : "bg-muted/10 text-muted-foreground",
                  )}
                >
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      c.atsScore >= 80
                        ? "bg-primary dark:bg-sky"
                        : c.atsScore >= 60
                          ? "bg-sky"
                          : "bg-muted-foreground",
                    )}
                  />
                  {c.atsScore}
                </span>
              </div>

              {/* Contact */}
              <div className="text-right">
                <a
                  href={`mailto:${c.email}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[11px] text-muted-foreground hover:text-primary transition-colors truncate block"
                >
                  {c.email || "No email"}
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center border-t border-border/40 py-3 bg-muted/5">
          <button
            onClick={onLoadMore}
            className="flex items-center gap-2 text-xs font-bold text-primary hover:underline"
          >
            Load {remainingCount > 0 ? `${remainingCount} ` : ""}more matches
            <FaChevronDown size={10} />
          </button>
        </div>
      )}

      {/* Selected Candidate Detail — below the list */}
      {selectedCandidate && (
        <div className="border-t-2 border-primary/20 p-6 bg-canvas/10">
          <CandidateSummaryPanel candidate={selectedCandidate} />
        </div>
      )}
    </div>
  );
}
