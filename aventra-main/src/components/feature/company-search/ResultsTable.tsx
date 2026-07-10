/**
 * Folder: src/components/feature/company-search
 * File: ResultsTable.tsx
 * Purpose: Table showing ranked candidates with match score, ATS score, skills.
 */

"use client";

import { useState, useMemo } from "react";
import {
  IconDownload,
  IconFilter,
  IconEye,
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
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const PAGE_SIZE = 5;

interface ResultsTableProps {
  candidates: CandidateResult[];
  selectedCandidate: CandidateResult | null;
  onSelectCandidate: (c: CandidateResult) => void;
  isPending: boolean;
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
}: ResultsTableProps) {
  const t = useTranslations("candidateSearch");
  const locale = useLocale();

  const [page, setPage] = useState(1);
  const [minAtsScore, setMinAtsScore] = useState(0);
  const [minMatchScore, setMinMatchScore] = useState(0);
  const [selectedEducations, setSelectedEducations] = useState<string[]>([]);
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>([]);
  const [selectedWeaknesses, setSelectedWeaknesses] = useState<string[]>([]);

  const allEducation = useMemo(
    () =>
      Array.from(
        new Set(
          candidates
            .flatMap(
              (c) => c.education?.map((e) => e.degree || e.institution) || [],
            )
            .filter(Boolean),
        ),
      ),
    [candidates],
  );
  const allStrengths = useMemo(
    () =>
      Array.from(
        new Set(
          candidates
            .flatMap((c) => c.strengths?.map((s) => s.title) || [])
            .filter(Boolean),
        ),
      ),
    [candidates],
  );
  const allWeaknesses = useMemo(
    () =>
      Array.from(
        new Set(
          candidates
            .flatMap((c) => c.weaknesses?.map((w) => w.title) || [])
            .filter(Boolean),
        ),
      ),
    [candidates],
  );

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      if (c.atsScore < minAtsScore) return false;
      if (c.matchScore < minMatchScore) return false;

      if (selectedEducations.length > 0) {
        const hasEdu = c.education?.some(
          (e) =>
            selectedEducations.includes(e.degree || "") ||
            selectedEducations.includes(e.institution || ""),
        );
        if (!hasEdu) return false;
      }
      if (selectedStrengths.length > 0) {
        const hasStrength = c.strengths?.some((s) =>
          selectedStrengths.includes(s.title),
        );
        if (!hasStrength) return false;
      }
      if (selectedWeaknesses.length > 0) {
        const hasWeakness = c.weaknesses?.some((w) =>
          selectedWeaknesses.includes(w.title),
        );
        if (!hasWeakness) return false;
      }

      return true;
    });
  }, [
    candidates,
    minAtsScore,
    minMatchScore,
    selectedEducations,
    selectedStrengths,
    selectedWeaknesses,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCandidates.length / PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages);

  const paginated = filteredCandidates.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function toggleFilter(
    list: string[],
    setList: (l: string[]) => void,
    val: string,
  ) {
    if (list.includes(val)) {
      setList(list.filter((v) => v !== val));
    } else {
      setList([...list, val]);
    }
  }

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
            ({filteredCandidates.length} {t("resultsTable.candidates")})
          </span>
        </p>

        <div className="flex items-center gap-2">
          {isPending ? (
            <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary dark:bg-sky/10 dark:text-sky">
              {t("resultsTable.searching")}
            </span>
          ) : null}

          <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted">
            <IconDownload size={13} />
            {t("resultsTable.export")}
          </button>

          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted relative">
                <IconFilter size={13} />
                {t("resultsTable.filter")}
                {(selectedEducations.length > 0 ||
                  selectedStrengths.length > 0 ||
                  selectedWeaknesses.length > 0 ||
                  minAtsScore > 0 ||
                  minMatchScore > 0) && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary text-[8px] text-primary-foreground">
                    !
                  </span>
                )}
              </button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Advanced Filters</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-6 py-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-semibold text-foreground">
                    <span>Minimum ATS Score</span>
                    <span className="text-primary tabular-nums">
                      {minAtsScore}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={minAtsScore}
                    onChange={(e) => setMinAtsScore(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-primary"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-semibold text-foreground">
                    <span>Minimum Match Score</span>
                    <span className="text-primary tabular-nums">
                      {minMatchScore}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={minMatchScore}
                    onChange={(e) => setMinMatchScore(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-primary"
                  />
                </div>

                {allEducation.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-sm font-semibold text-foreground">
                      Education
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {allEducation.map((edu) => {
                        const active = selectedEducations.includes(
                          edu as string,
                        );
                        return (
                          <button
                            key={edu as string}
                            onClick={() =>
                              toggleFilter(
                                selectedEducations,
                                setSelectedEducations,
                                edu as string,
                              )
                            }
                            className={cn(
                              "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors border",
                              active
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted text-muted-foreground border-transparent hover:border-border",
                            )}
                          >
                            {edu as string}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {allStrengths.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-sm font-semibold text-foreground">
                      Strengths
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {allStrengths.map((strength) => {
                        const active = selectedStrengths.includes(
                          strength as string,
                        );
                        return (
                          <button
                            key={strength as string}
                            onClick={() =>
                              toggleFilter(
                                selectedStrengths,
                                setSelectedStrengths,
                                strength as string,
                              )
                            }
                            className={cn(
                              "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors border",
                              active
                                ? "bg-emerald-500 text-white border-emerald-500"
                                : "bg-muted text-muted-foreground border-transparent hover:border-border",
                            )}
                          >
                            {strength as string}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {allWeaknesses.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-sm font-semibold text-foreground">
                      Weaknesses
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {allWeaknesses.map((weakness) => {
                        const active = selectedWeaknesses.includes(
                          weakness as string,
                        );
                        return (
                          <button
                            key={weakness as string}
                            onClick={() =>
                              toggleFilter(
                                selectedWeaknesses,
                                setSelectedWeaknesses,
                                weakness as string,
                              )
                            }
                            className={cn(
                              "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors border",
                              active
                                ? "bg-rose-500 text-white border-rose-500"
                                : "bg-muted text-muted-foreground border-transparent hover:border-border",
                            )}
                          >
                            {weakness as string}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setMinAtsScore(0);
                      setMinMatchScore(0);
                      setSelectedEducations([]);
                      setSelectedStrengths([]);
                      setSelectedWeaknesses([]);
                    }}
                    className="text-xs text-muted-foreground underline hover:text-foreground"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full min-h-full text-sm">
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
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {c.skills.slice(0, 5).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {skill}
                        </span>
                      ))}

                      {c.skills.length > 5 && (
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                          +{c.skills.length - 5}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <ScoreBadge score={c.matchScore} />
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
