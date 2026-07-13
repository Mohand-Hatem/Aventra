/**
 * Folder: src/components/feature/company-search
 * File: ResultsTable.tsx
 * Purpose: Table showing ranked candidates with match score, ATS score, skills.
 */

"use client";

import { useState } from "react";
import {
  IconCertificate,
  IconBriefcase,
  IconDownload,
  IconEye,
  IconSchool,
  IconUsers,
} from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  getLocalizedCandidateName,
  type CandidateResult,
} from "@/types/company";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SkillsDialogContent } from "./SkillsDialogContent";

const PAGE_SIZE = 5;

interface ResultsTableProps {
  candidates: CandidateResult[];
  selectedCandidate: CandidateResult | null;
  onSelectCandidate: (c: CandidateResult) => void;
  isPending: boolean;
  hideExport?: boolean;
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-xs font-bold",
        score >= 80
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : score >= 60
            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      )}
    >
      {score}%
    </span>
  );
}

// Deterministic /company/filter results have no semantic matchScore — show
// the matched-skill count instead when that's all we have.
function MatchCell({ candidate }: { candidate: CandidateResult }) {
  if (candidate.matchScore !== undefined) {
    return <ScoreBadge score={candidate.matchScore} />;
  }
  if (candidate.matchCount !== undefined) {
    return (
      <span className="inline-flex items-center justify-center rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary dark:bg-sky/15 dark:text-sky">
        {candidate.matchCount}
      </span>
    );
  }
  return <span className="text-xs text-muted-foreground">—</span>;
}

function SectionBadges({ candidate }: { candidate: CandidateResult }) {
  const hasEducation = (candidate.education?.length ?? 0) > 0;
  const hasCertifications = (candidate.certifications?.length ?? 0) > 0;
  const hasProjects = (candidate.projects?.length ?? 0) > 0;

  if (!hasEducation && !hasCertifications && !hasProjects) return null;

  return (
    <div className="mt-1 flex items-center gap-1">
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

function SkillChip({
  skill,
  matched,
}: {
  skill: string;
  matched: boolean;
}) {
  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5 text-[11px]",
        matched
          ? "bg-primary font-bold text-primary-foreground dark:bg-sky dark:text-zinc-900"
          : "bg-muted text-muted-foreground",
      )}
    >
      {skill}
    </span>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const medals: Record<number, string> = {
    1: "🥇",
    2: "🥈",
    3: "🥉",
  };

  if (medals[rank]) return <span className="text-lg">{medals[rank]}</span>;

  return (
    <span className="text-sm font-medium text-muted-foreground">{rank}</span>
  );
}

export default function ResultsTable({
  candidates,
  selectedCandidate,
  onSelectCandidate,
  isPending,
  hideExport = false,
}: ResultsTableProps) {
  const t = useTranslations("candidateSearch");
  const locale = useLocale();

  const [page, setPage] = useState(1);
  const [openSkillsDialogFor, setOpenSkillsDialogFor] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(candidates.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginated = candidates.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function getName(c: CandidateResult) {
    return getLocalizedCandidateName(
      c.name,
      locale,
      t("candidateDetail.unknown"),
    );
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  if (isPending && !candidates.length) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-border/80 bg-canvas shadow-card">
        <div className="flex flex-col items-center gap-4 px-6 text-center">
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
      <div className="flex h-full flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/80 bg-canvas/60 px-8 py-12 text-center shadow-card">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 dark:bg-sky/10">
          <IconUsers size={32} className="text-primary dark:text-sky" />
        </div>
        <div className="max-w-sm">
          <p className="font-medium text-foreground">
            {t("resultsTable.emptyTitle")}
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {t("resultsTable.empty")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-canvas shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <p className="text-sm font-semibold text-foreground">
          {t("resultsTable.searchResults")}{" "}
          <span className="font-normal text-muted-foreground">
            ({candidates.length} {t("resultsTable.candidates")})
          </span>
        </p>

        <div className="flex items-center gap-2">
          {isPending ? (
            <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary dark:bg-sky/10 dark:text-sky">
              {t("resultsTable.searching")}
            </span>
          ) : null}

          {hideExport ? null : (
            <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted">
              <IconDownload size={13} />
              {t("resultsTable.export")}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Card View */}
      <div
        className="flex md:hidden flex-col flex-1 overflow-y-auto"
        style={{ maxHeight: "calc(5 * 160px + 48px)" }}
      >
        {paginated.map((c, idx) => {
          const rank = (currentPage - 1) * PAGE_SIZE + idx + 1;
          const name = getName(c);
          const initials = getInitials(name);
          const isSelected = selectedCandidate?.cvId === c.cvId;

          return (
            <div
              key={c.cvId}
              onClick={() => onSelectCandidate(c)}
              className={cn(
                "cursor-pointer border-b border-border/50 p-4 transition-colors",
                isSelected ? "bg-primary/5 dark:bg-sky/5" : "hover:bg-muted/50",
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <RankBadge rank={rank} />
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary dark:bg-sky/10 dark:text-sky">
                    {initials}
                  </div>
                </div>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <IconEye size={15} />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <div>
                  <p className="font-medium text-foreground text-sm">{name}</p>
                  {c.email ? (
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                  ) : null}
                  <SectionBadges candidate={c} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    {t("resultsTable.skills")}
                  </p>
                  <div className="flex flex-wrap gap-1 items-center">
                    {c.skills.slice(0, 2).map((skill) => (
                      <SkillChip
                        key={skill}
                        skill={skill}
                        matched={!!c.matchedSkills?.some(
                          (m) => m.toLowerCase() === skill.toLowerCase(),
                        )}
                      />
                    ))}
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
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      {t("resultsTable.match")}
                    </p>
                    <MatchCell candidate={c} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      {t("resultsTable.atsScore")}
                    </p>
                    <ScoreBadge score={c.atsScore} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div
        className="hidden md:flex md:flex-col flex-1 overflow-x-hidden overflow-y-auto"
        style={{ maxHeight: "calc(5 * 80px + 48px)" }}
      >
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted/60 backdrop-blur-sm">
            <tr>
              <th className="w-[60px] px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                {t("resultsTable.rank")}
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                {t("resultsTable.candidate")}
              </th>

              <th className="w-[240px] px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                {t("resultsTable.skills")}
              </th>

              <th className="w-[100px] px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                {t("resultsTable.match")}
              </th>

              <th className="w-[100px] px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                {t("resultsTable.atsScore")}
              </th>

              <th className="w-[50px]" />
            </tr>
          </thead>

          <tbody>
            {paginated.map((c, idx) => {
              const rank = (currentPage - 1) * PAGE_SIZE + idx + 1;
              const name = getName(c);
              const initials = getInitials(name);
              const isSelected = selectedCandidate?.cvId === c.cvId;

              return (
                <tr
                  key={c.cvId}
                  onClick={() => onSelectCandidate(c)}
                  className={cn(
                    "cursor-pointer border-b border-border/50 transition-colors",
                    isSelected
                      ? "bg-primary/5 dark:bg-sky/5"
                      : "hover:bg-muted/50",
                  )}
                >
                  <td className="px-4 py-3 text-center">
                    <RankBadge rank={rank} />
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary dark:bg-sky/10 dark:text-sky">
                        {initials}
                      </div>

                      <div>
                        <p className="font-medium text-foreground">{name}</p>
                        {c.email ? (
                          <p className="text-xs text-muted-foreground">
                            {c.email}
                          </p>
                        ) : null}
                        <SectionBadges candidate={c} />
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-wrap gap-1 items-center">
                      {c.skills.slice(0, 2).map((skill) => (
                        <SkillChip
                          key={skill}
                          skill={skill}
                          matched={!!c.matchedSkills?.some(
                            (m) => m.toLowerCase() === skill.toLowerCase(),
                          )}
                        />
                      ))}

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
                  </td>

                  <td className="px-4 py-3">
                    <MatchCell candidate={c} />
                  </td>

                  <td className="px-4 py-3">
                    <ScoreBadge score={c.atsScore} />
                  </td>

                  <td className="px-3 py-3">
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                      <IconEye size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <p className="text-xs text-muted-foreground">
            {t("resultsTable.showing")} {(currentPage - 1) * PAGE_SIZE + 1}{" "}
            {t("resultsTable.to")}{" "}
            {Math.min(currentPage * PAGE_SIZE, candidates.length)}{" "}
            {t("resultsTable.of")} {candidates.length}{" "}
            {t("resultsTable.results")}
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  "h-7 w-7 rounded-lg text-xs font-medium transition-colors",
                  currentPage === p
                    ? "bg-primary dark:bg-sky text-white"
                    : "border border-border text-muted-foreground hover:bg-muted",
                )}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
