/**
 * Folder: src/components/feature/company-search
 * File: ResultsTable.tsx
 * Purpose: Table showing ranked candidates with match score, ATS score, skills.
 */

"use client";

import { useState } from "react";
import { IconDownload, IconFilter, IconEye } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { CandidateResult } from "@/types/company";

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
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      )}
    >
      {score}%
    </span>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const medals: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
  if (medals[rank]) return <span className="text-lg">{medals[rank]}</span>;
  return <span className="text-sm font-medium text-muted-foreground">{rank}</span>;
}

export default function ResultsTable({
  candidates,
  selectedCandidate,
  onSelectCandidate,
  isPending,
}: ResultsTableProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(candidates.length / PAGE_SIZE);
  const paginated = candidates.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function getName(c: CandidateResult) {
    if (typeof c.user.name === "string") return c.user.name;
    return c.user.name?.en ?? "Unknown";
  }

  function getInitials(name: string) {
    return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  }

  if (isPending) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-border bg-card">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary dark:border-sky border-t-transparent" />
          <p className="text-sm text-muted-foreground">Searching candidates...</p>
        </div>
      </div>
    );
  }

  if (!candidates.length) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border bg-card">
        <p className="text-sm text-muted-foreground">
          No results yet. Use the search assistant to find candidates.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card overflow-hidden">
      
      {/* Table Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <p className="text-sm font-semibold text-foreground">
          Search Results{" "}
          <span className="text-muted-foreground font-normal">
            ({candidates.length} candidates)
          </span>
        </p>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors">
            <IconDownload size={13} /> Export
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors">
            <IconFilter size={13} /> Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted/60 backdrop-blur-sm">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground w-[60px]">Rank</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Candidate</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Skills</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground w-[100px]">Match</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground w-[100px]">ATS Score</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground w-[120px]">Last Updated</th>
              <th className="w-[50px]"></th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((c, idx) => {
              const rank = (page - 1) * PAGE_SIZE + idx + 1;
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
                      : "hover:bg-muted/50"
                  )}
                >
                  {/* Rank */}
                  <td className="px-4 py-3 text-center">
                    <RankBadge rank={rank} />
                  </td>

                  {/* Candidate */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 dark:bg-sky/10 text-xs font-bold text-primary dark:text-sky">
                        {initials}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{name}</p>
                        <p className="text-xs text-muted-foreground">{c.user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Skills */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {c.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {skill}
                        </span>
                      ))}
                      {c.skills.length > 3 && (
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                          +{c.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Match Score */}
                  <td className="px-4 py-3">
                    <ScoreBadge score={c.matchScore} />
                  </td>

                  {/* ATS Score */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-xs font-bold",
                        c.atsScore >= 80
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : c.atsScore >= 60
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      )}
                    >
                      {c.atsScore}
                    </span>
                  </td>

                  {/* Last Updated */}
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>

                  {/* View */}
                  <td className="px-3 py-3">
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
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
            Showing {(page - 1) * PAGE_SIZE + 1} to{" "}
            {Math.min(page * PAGE_SIZE, candidates.length)} of {candidates.length} results
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted disabled:opacity-40 transition-colors"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  "h-7 w-7 rounded-lg text-xs font-medium transition-colors",
                  page === p
                    ? "bg-primary dark:bg-sky text-white"
                    : "border border-border text-muted-foreground hover:bg-muted"
                )}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted disabled:opacity-40 transition-colors"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
