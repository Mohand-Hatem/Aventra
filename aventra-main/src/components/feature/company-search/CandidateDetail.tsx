/**
 * CandidateDetail.tsx
 * Pulls full CV data from /cv/:id and displays:
 * - AI Analysis: name, Download CV, Reach candidate
 * - Strengths / Growth Areas (from /cv/:id aiAnalysis, fallback to search result)
 * - Experience list + PDF preview in a 2-column grid
 */

"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  IconDownload,
  IconFileText,
  IconBrandLinkedin,
  IconBrandGithub,
  IconPhone,
  IconMail,
  IconMapPin
} from "@tabler/icons-react";
import { getLocalizedCandidateName, type CandidateResult } from "@/types/company";
import { useCvDetails } from "@/hooks/useCv";

interface SummaryPanelProps {
  candidate: CandidateResult;
  onClose?: () => void;
}

export function CandidateSummaryPanel({ candidate }: SummaryPanelProps) {
  const t = useTranslations("candidateSearch");
  const locale = useLocale();
  const name = getLocalizedCandidateName(
    candidate.name,
    locale,
    t("candidateDetail.unknown"),
  );

  // Fetch full CV details from /cv/:id
  const { data: cvResponse, isLoading, isError } = useCvDetails(candidate.cvId);
  const cvData = cvResponse?.data;
  const parsedData = cvData?.parsedData;

  // Resume URL — prefer the one fetched from /cv/:id (more reliable)
  const resumeUrl = cvData?.originalFile?.url || candidate.resumeUrl || "";

  // AI Analysis — prefer /cv/:id result (richer), fallback to search result
  const strengths = (cvData?.aiAnalysis?.strengths?.length
    ? cvData.aiAnalysis.strengths
    : candidate.strengths) ?? [];
  const weaknesses = (cvData?.aiAnalysis?.weaknesses?.length
    ? cvData.aiAnalysis.weaknesses
    : candidate.weaknesses) ?? [];

  // Experience — from parsedData
  const experience = parsedData?.experience ?? [];

  // Contact details & Skills from parsedData
  const contact = parsedData?.contact || {};
  const skills = parsedData?.skills || {};
  const technicalSkills = skills.technical || [];
  const softSkills = skills.soft || [];

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-6 animate-pulse">
        <div className="flex justify-between items-start">
          <div className="h-7 bg-muted rounded w-1/3" />
          <div className="flex gap-3">
            <div className="h-9 w-32 bg-muted rounded" />
            <div className="h-9 w-36 bg-muted rounded" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-16 bg-muted rounded" />
            <div className="h-16 bg-muted rounded" />
          </div>
          <div>
            <div className="h-4 bg-muted rounded w-1/4 mb-4" />
            <div className="h-[400px] bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full flex flex-col gap-4 p-4 rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/20">
        <p className="text-sm font-medium text-rose-600">Failed to load CV details. The CV may not be accessible.</p>
        {candidate.resumeUrl && (
          <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-bold underline">
            Open PDF directly →
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h3 className="text-lg font-bold text-foreground">AI Analysis: {name}</h3>
        <div className="flex gap-3">
          <a
            href={resumeUrl || "#"}
            target={resumeUrl ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-xs font-bold hover:bg-muted/50 transition-colors shadow-sm"
          >
            <IconDownload size={14} />
            Download CV
          </a>
          <a
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${cvData?.parsedData?.contact?.email || candidate.email || ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary/95 text-white dark:bg-sky dark:text-zinc-950 dark:hover:bg-sky/95 rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            Reach candidate
          </a>
        </div>
      </div>

      {/* ── AI Strengths & Growth Areas ── */}
      <div className="flex flex-col gap-2">
        <p className="text-sm text-foreground leading-relaxed">
          <span className="text-primary dark:text-sky font-semibold mr-1">Strengths:</span>
          <span className="text-muted-foreground">
            {strengths.length > 0
              ? strengths.map((s) => s.detail).join("; ")
              : "Not analyzed yet."}
          </span>
        </p>
        <p className="text-sm text-foreground leading-relaxed">
          <span className="text-sky dark:text-sky/80 font-semibold mr-1">Growth areas:</span>
          <span className="text-muted-foreground">
            {weaknesses.length > 0
              ? weaknesses.map((w) => w.detail).join("; ")
              : "None highlighted."}
          </span>
        </p>
      </div>

      {/* ── 2-column grid: Experience | CV Preview ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Left: Experience */}
        <div>
          <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-5">EXPERIENCE</h4>
          {experience.length > 0 ? (
            <div className="space-y-5">
              {experience.map((exp, i) => (
                <div key={i} className="flex flex-col">
                  <span className="font-bold text-sm text-foreground">{exp.role}</span>
                  <span className="text-xs text-muted-foreground font-medium mt-0.5">
                    {exp.company}{exp.duration ? ` • ${exp.duration}` : ""}
                  </span>
                  {exp.description && (
                    <span className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{exp.description}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Fallback to search result experience */}
              {(candidate.experience ?? []).length > 0 ? (
                (candidate.experience ?? []).map((exp, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="font-bold text-sm text-foreground">{exp.role}</span>
                    <span className="text-xs text-muted-foreground font-medium mt-0.5">
                      {exp.company}{exp.duration ? ` • ${exp.duration}` : ""}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">No experience data available.</p>
              )}
            </div>
          )}

          {/* ── Skills & Contact Information ── */}
          {(technicalSkills.length > 0 || softSkills.length > 0 || Object.keys(contact).length > 0) && (
            <div className="mt-8 pt-6 border-t border-border/40 space-y-6">
              {/* Technical & Soft Skills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {technicalSkills.length > 0 && (
                  <div>
                    <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">TECHNICAL SKILLS</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {technicalSkills.slice(0, 10).map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="rounded bg-secondary/80 border border-border/40 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
                        >
                          {skill}
                        </span>
                      ))}
                      {technicalSkills.length > 10 && (
                        <span className="rounded bg-secondary/80 border border-border/40 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                          +{technicalSkills.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {softSkills.length > 0 && (
                  <div>
                    <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">SOFT SKILLS</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {softSkills.slice(0, 8).map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="rounded bg-secondary/40 border border-border/40 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
                        >
                          {skill}
                        </span>
                      ))}
                      {softSkills.length > 8 && (
                        <span className="rounded bg-secondary/40 border border-border/40 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                          +{softSkills.length - 8} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Details */}
              {Object.keys(contact).length > 0 && (
                <div>
                  <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">CONTACT INFO</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {contact.email && (
                      <a
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${contact.email}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors py-0.5 truncate"
                      >
                        <IconMail size={14} className="text-muted-foreground/60 shrink-0" />
                        <span className="truncate">{contact.email}</span>
                      </a>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground py-0.5 truncate">
                        <IconPhone size={14} className="text-muted-foreground/60 shrink-0" />
                        <span className="truncate">{contact.phone}</span>
                      </div>
                    )}
                    {contact.location && (
                      <div className="flex items-center gap-2 text-muted-foreground py-0.5 truncate sm:col-span-2">
                        <IconMapPin size={14} className="text-muted-foreground/60 shrink-0" />
                        <span className="truncate">{contact.location}</span>
                      </div>
                    )}
                    {contact.linkedin && (
                      <a
                        href={contact.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors py-0.5 truncate"
                      >
                        <IconBrandLinkedin size={14} className="text-primary dark:text-sky shrink-0" />
                        <span className="truncate font-medium text-primary dark:text-sky hover:underline">LinkedIn Profile</span>
                      </a>
                    )}
                    {contact.github && (
                      <a
                        href={contact.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors py-0.5 truncate"
                      >
                        <IconBrandGithub size={14} className="text-primary dark:text-sky shrink-0" />
                        <span className="truncate font-medium text-primary dark:text-sky hover:underline">GitHub Profile</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: CV Preview */}
        <div>
          <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-5">CV PREVIEW</h4>
          <div className="h-[420px] w-full bg-muted/10 border border-border/60 rounded-xl overflow-hidden relative flex items-center justify-center">
            {resumeUrl ? (
              <>
                <iframe
                  src={`${resumeUrl}#toolbar=0`}
                  className="w-full h-full border-0 absolute inset-0"
                  title="CV Preview"
                />
                {/* Link icon top-right */}
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded bg-white/80 hover:bg-white shadow text-muted-foreground hover:text-foreground transition-colors"
                  title="Open in new tab"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
                <IconFileText size={24} />
                <span className="text-xs font-semibold uppercase tracking-wider">PDF PREVIEW</span>
                <span className="text-[10px]">No URL available</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Default export ── */
export default function CandidateDetail(props: SummaryPanelProps) {
  return <CandidateSummaryPanel {...props} />;
}

