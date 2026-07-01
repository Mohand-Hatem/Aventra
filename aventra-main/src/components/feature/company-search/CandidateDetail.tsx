/**
 * Folder: src/components/feature/company-search
 * File: CandidateDetail.tsx
 * Purpose:
 * - Bottom panel showing selected candidate details + Resume PDF preview.
 */

"use client";

import { IconDownload, IconSparkles } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { CandidateResult } from "@/types/company";

interface CandidateDetailProps {
  candidate: CandidateResult;
}

function ScoreBox({ value, label }: { value: number; label: string }) {
  const color =
    value >= 80
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : value >= 60
        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn("flex h-14 w-20 items-center justify-center rounded-xl text-xl font-bold", color)}>
        {value}%
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export default function CandidateDetail({ candidate }: CandidateDetailProps) {
  const name =
    typeof candidate.user.name === "string"
      ? candidate.user.name
      : (candidate.user.name as { en: string })?.en ?? "Unknown";

  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="grid h-full grid-cols-2 gap-4">

      {/* Left — Candidate Info */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 dark:bg-sky/10 text-lg font-bold text-primary dark:text-sky">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">{name}</p>
            <p className="text-sm text-muted-foreground">{candidate.user.email}</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <ScoreBox value={candidate.matchScore} label="Match Score" />
            <ScoreBox value={candidate.atsScore} label="ATS Score" />
          </div>
        </div>

        {/* Top Skills */}
        {candidate.skills.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold text-foreground">Top Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-primary/10 dark:bg-sky/10 px-2.5 py-1 text-xs font-medium text-primary dark:text-sky"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI Summary */}
        {candidate.summary && (
          <div>
            <div className="mb-2 flex items-center gap-1.5">
              <IconSparkles size={13} className="text-primary dark:text-sky" />
              <p className="text-xs font-semibold text-foreground">AI Summary</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {candidate.summary}
            </p>
          </div>
        )}
      </div>

      {/* Right — Resume Preview */}
      <div className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Resume Preview</p>
          <a
            href={candidate.originalFile.url}
            download={candidate.originalFile.fileName}
            className="flex items-center gap-1.5 rounded-lg bg-primary dark:bg-sky px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity"
          >
            <IconDownload size={12} /> Download
          </a>
        </div>
        <div className="flex-1 overflow-hidden">
          {candidate.originalFile.url ? (
            <iframe
              src={`${candidate.originalFile.url}#toolbar=0`}
              className="h-full w-full border-0"
              title="Resume Preview"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">No preview available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
