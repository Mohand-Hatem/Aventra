/**
 * Folder: src/components/feature/company-search
 * File: CVViewer.tsx
 * Purpose:
 * - Shows the selected candidate's CV details.
 * - Displays match score, ATS score, skills, summary, and CV download.
 */

"use client";

import { IconBriefcase, IconDownload, IconExternalLink, IconSparkles, IconStar } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { getUserDisplayName } from "@/types/auth";
import type { CandidateResult } from "@/types/company";

interface CVViewerProps {
  candidate: CandidateResult;
}

function ScoreBadge({ score, label }: { score: number; label: string }) {
  const color =
    score >= 80
      ? "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30"
      : score >= 60
        ? "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30"
        : "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30";

  return (
    <div className="flex flex-col items-center gap-1">
      <span className={cn("rounded-xl px-3 py-1 text-xl font-bold", color)}>
        {score}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export default function CVViewer({ candidate }: CVViewerProps) {
  const name =
    typeof candidate.user.name === "string"
      ? candidate.user.name
      : getUserDisplayName(candidate.user.name, "en");

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto">

      {/* Header */}
      <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 dark:bg-sky/10 text-lg font-bold text-primary dark:text-sky">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{name}</p>
          <p className="text-sm text-muted-foreground truncate">
            {candidate.user.email}
          </p>
          <span className="mt-1 inline-block rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground capitalize">
            {candidate.user.plan ?? "Free"}
          </span>
        </div>
        <div className="flex gap-4 shrink-0">
          <ScoreBadge score={candidate.matchScore} label="Match" />
          <ScoreBadge score={candidate.atsScore} label="ATS" />
        </div>
      </div>

      {/* AI Summary */}
      {candidate.summary && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <IconSparkles size={15} className="text-primary dark:text-sky" />
            <p className="text-sm font-semibold text-foreground">AI Summary</p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {candidate.summary}
          </p>
        </div>
      )}

      {/* Skills */}
      {candidate.skills.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <IconBriefcase size={15} className="text-primary dark:text-sky" />
            <p className="text-sm font-semibold text-foreground">Skills</p>
          </div>
          <div className="flex flex-wrap gap-2">
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

      {/* CV Actions */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center gap-2">
          <IconStar size={15} className="text-primary dark:text-sky" />
          <p className="text-sm font-semibold text-foreground">CV Document</p>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3">
          <p className="text-sm text-muted-foreground truncate max-w-[180px]">
            {candidate.originalFile.fileName}
          </p>
          <div className="flex gap-2">
            <a
              href={candidate.originalFile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              <IconExternalLink size={13} />
              View
            </a>
            <a
              href={candidate.originalFile.url}
              download={candidate.originalFile.fileName}
              className="flex items-center gap-1.5 rounded-lg bg-primary dark:bg-sky px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity"
            >
              <IconDownload size={13} />
              Download
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
