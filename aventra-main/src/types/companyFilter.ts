/**
 * Folder: src/types
 * File: companyFilter.ts
 * Purpose: Types for the deterministic POST /company/filter endpoint.
 * Independent of the AI chat search contract in `company.ts`, but this flow
 * always filters the results of the most recent AI search (scope: "lastSearch").
 */

import {
  normalizePercent,
  type CandidateResult,
  type LocalizedCandidateName,
} from "@/types/company";

export interface CompanyFilterEducationEntry {
  degree?: string;
  institution?: string;
  year?: string;
}

export interface CompanyFilterCertificationEntry {
  name?: string;
  issuer?: string;
  date?: string;
}

export interface CompanyFilterProjectEntry {
  name?: string;
  description?: string;
  technologies?: string[];
}

export interface CompanyFilterCandidate {
  cvId: string;
  name: LocalizedCandidateName;
  email: string;
  topSkills: string[];
  matchedSkills: string[];
  matchCount: number;
  atsScore: number;
  education: CompanyFilterEducationEntry[];
  certifications: CompanyFilterCertificationEntry[];
  projects: CompanyFilterProjectEntry[];
  cvFileUrl: string | null;
  cvFileName?: string;
  cvFileType?: string;
}

export interface CompanyFilterPayload {
  skills?: string[];
  requireEducation?: boolean;
  requireCertificate?: boolean;
  requireProject?: boolean;
  sortBySkillMatch?: boolean;
  limit?: number;
}

export interface CompanyFilterResponse {
  success: boolean;
  resultsCount: number;
  results: CompanyFilterCandidate[];
  // Only present in the defensive "no previous AI search to filter" case.
  message?: string;
}

export function normalizeCompanyFilterCandidate(
  candidate: CompanyFilterCandidate,
): CandidateResult {
  return {
    cvId: candidate.cvId,
    matchedSkills: candidate.matchedSkills ?? [],
    matchCount: candidate.matchCount,
    atsScore: normalizePercent(candidate.atsScore),
    name: candidate.name ?? "",
    email: candidate.email ?? "",
    skills: candidate.topSkills ?? [],
    summary: "",
    resumeUrl: candidate.cvFileUrl ?? "",
    resumeFileName: candidate.cvFileName ?? "",
    resumeFileType: candidate.cvFileType,
    education: candidate.education ?? [],
    certifications: candidate.certifications ?? [],
    projects: candidate.projects ?? [],
  };
}

export function normalizeCompanyFilterCandidates(
  candidates: CompanyFilterCandidate[] | undefined,
): CandidateResult[] {
  return (candidates ?? []).map(normalizeCompanyFilterCandidate);
}
