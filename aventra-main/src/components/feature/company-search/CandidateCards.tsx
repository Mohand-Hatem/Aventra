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
import {
  IconBriefcase,
  IconCertificate,
  IconSchool,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { ensureAbsoluteUrl } from "@/lib/utils";
import {
  getLocalizedCandidateName,
  type CandidateResult,
} from "@/types/company";

import { CandidateSummaryPanel } from "./CandidateDetail";
import { SkillsDialogContent } from "./SkillsDialogContent";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CandidateCardsProps {
  candidates: CandidateResult[];
  selectedCandidate: CandidateResult | null;
  onSelectCandidate: (c: CandidateResult) => void;
  isPending: boolean;
  minAtsScore?: number;
  setMinAtsScore?: (v: number) => void;
  hasRawCandidates?: boolean;
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

const getAtsColorClasses = (score: number) => {
  if (score < 60) {
    return {
      bgText:
        "bg-rose-500/10 text-rose-500 dark:bg-rose-500/20 dark:text-rose-400",
      dot: "bg-rose-500 dark:bg-rose-400",
    };
  }
  if (score < 75) {
    return {
      bgText:
        "bg-orange-500/10 text-orange-500 dark:bg-orange-500/20 dark:text-orange-400",
      dot: "bg-orange-500 dark:bg-orange-400",
    };
  }
  return {
    bgText: "bg-emerald-500/10 text-emerald-600 dark:bg-sky/20 dark:text-sky",
    dot: "bg-emerald-500 dark:bg-sky",
  };
};

// Shown only once a candidate has education/certifications/projects data —
// populated by /company/filter results (AI search results don't carry these).
function SectionBadges({ candidate }: { candidate: CandidateResult }) {
  const hasEducation = (candidate.education?.length ?? 0) > 0;
  const hasCertifications = (candidate.certifications?.length ?? 0) > 0;
  const hasProjects = (candidate.projects?.length ?? 0) > 0;

  if (!hasEducation && !hasCertifications && !hasProjects) return null;

  return (
    <div className="mt-0.5 flex items-center gap-1">
      {hasEducation && (
        <IconSchool className="size-3 text-muted-foreground/70" />
      )}
      {hasCertifications && (
        <IconCertificate className="size-3 text-muted-foreground/70" />
      )}
      {hasProjects && (
        <IconBriefcase className="size-3 text-muted-foreground/70" />
      )}
    </div>
  );
}

function isMatchedSkill(skill: string, candidate: CandidateResult) {
  return !!candidate.matchedSkills?.some(
    (m) => m.toLowerCase() === skill.toLowerCase(),
  );
}

export default function CandidateCards({
  candidates,
  selectedCandidate,
  onSelectCandidate,
  isPending,
  minAtsScore = 0,
  setMinAtsScore,
  hasRawCandidates = false,
}: CandidateCardsProps) {
  const t = useTranslations("candidateSearch");
  const locale = useLocale();

  const [openSkillsDialogFor, setOpenSkillsDialogFor] = useState<string | null>(null);

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

  if (!candidates.length && !hasRawCandidates) {
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
            {t("resultsTable.describeSearch")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col col-span-3 gap-0 border border-border/60 bg-canvas/10 rounded-2xl shadow-sm overflow-hidden">
      {/* Top Filter Bar */}
      <div className="flex items-center justify-between border-b border-border/40 py-2.5 px-4 bg-muted/10">
        <div className="flex items-center gap-6">
          <div className="flex flex-col justify-center gap-1 w-full sm:w-48 h-14">
            <h1 className="text-md dark:text-sky text-primary font-bold">
              Filter By ATS Score
            </h1>
            <div className="flex justify-between items-end text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
              <span>MIN. ATS SCORE</span>
              <span className="text-foreground font-extrabold">
                {minAtsScore || 0}+
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={minAtsScore}
              onChange={(e) => setMinAtsScore?.(Number(e.target.value))}
              className="h-3 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-primary dark:accent-sky "
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-primary/10 text-primary dark:bg-sky/20 dark:text-sky px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
            AI Filter Active
          </span>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_60px] md:grid-cols-[1fr_60px_120px] lg:grid-cols-[3.5fr_2fr_1fr_1.5fr] px-6 py-3 border-b border-border/40 bg-muted/5 text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
        <div>Candidate</div>
        <div className="hidden md:block">Top Skills</div>
        <div>ATS</div>
        <div className="hidden sm:block text-right">Contact</div>
      </div>

      {/* Candidate List — max 5 rows visible, then scroll */}
      <div
        className="flex flex-col overflow-y-auto min-h-[120px] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:w-0.5 [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full"
        style={{ maxHeight: "calc(5 * 72px)" }}
      >
        {candidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center gap-1.5 bg-canvas/5 my-auto">
            <p className="text-sm font-semibold text-foreground">
              No candidates match this ATS threshold
            </p>
            <p className="text-xs text-muted-foreground">
              Drag the MIN. ATS SCORE slider to the left to show more matches.
            </p>
          </div>
        ) : (
          candidates.map((c) => {
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
                  "grid grid-cols-[1fr_60px] sm:grid-cols-[1fr_60px_120px] md:grid-cols-[3.5fr_2fr_1fr_1.5fr] items-center px-6 py-4 cursor-pointer transition-colors border-b border-border/40 last:border-b-0 h-[72px]",
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
                        "from-violet-500 to-indigo-600",
                        "from-teal-400 to-emerald-600",
                        "from-amber-400 to-orange-500",
                        "from-fuchsia-500 to-pink-600",
                        "from-sky-400 to-blue-600",
                        "from-indigo-500 to-purple-600",
                      ][name.charCodeAt(0) % 6],
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
                    <SectionBadges candidate={c} />
                  </div>
                </div>

                {/* Skills */}
                <div className="hidden md:flex flex-wrap gap-1.5 pr-6 items-center">
                  {c.skills.slice(0, 2).map((skill) => {
                    const matched = isMatchedSkill(skill, c);
                    return (
                      <span
                        key={skill}
                        className={cn(
                          "rounded border px-1.5 py-0.5 text-[10px] font-semibold",
                          matched
                            ? "border-primary/30 bg-primary text-primary-foreground dark:bg-sky dark:text-zinc-900"
                            : "border-border/40 bg-sky/20 text-muted-foreground",
                        )}
                      >
                        {skill}
                      </span>
                    );
                  })}
                  {c.skills.length > 2 && (
                    <Dialog
                      open={openSkillsDialogFor === c.cvId}
                      onOpenChange={(open) => {
                        if (!open) setOpenSkillsDialogFor(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenSkillsDialogFor(c.cvId);
                          }}
                          className="rounded border border-primary/20 bg-primary/10 hover:bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary dark:text-sky dark:bg-sky/10 dark:border-sky/20 dark:hover:bg-sky/20 transition-colors cursor-pointer"
                        >
                          View All
                        </button>
                      </DialogTrigger>
                      <DialogContent onClick={(e) => e.stopPropagation()}>
                        <DialogHeader>
                          <DialogTitle>{name}&apos;s Skills</DialogTitle>
                        </DialogHeader>
                        <SkillsDialogContent candidate={c} />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                {/* ATS */}
                <div>
                  {(() => {
                    const scoreColors = getAtsColorClasses(c.atsScore);
                    return (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold",
                          scoreColors.bgText,
                        )}
                      >
                        <div
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            scoreColors.dot,
                          )}
                        />
                        {c.atsScore}
                      </span>
                    );
                  })()}
                </div>

                {/* Contact */}
                <div className="hidden sm:block text-right">
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${c.email}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] text-muted-foreground hover:text-primary transition-colors truncate block"
                  >
                    {c.email || "No email"}
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selected Candidate Detail — below the list */}
      {selectedCandidate && (
        <div className="border-t-2 border-primary/20 p-6 bg-canvas/10">
          <CandidateSummaryPanel candidate={selectedCandidate} />
        </div>
      )}
    </div>
  );
}
