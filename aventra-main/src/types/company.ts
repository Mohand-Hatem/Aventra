/**
 * Folder: src/types
 * File: company.ts
 * Purpose: TypeScript types + normalizers for company search.
 */

export type LocalizedCandidateName = string | { en?: string; ar?: string };

export interface CandidateResult {
  cvId: string;
  userId?: string;
  matchScore: number;
  atsScore: number;
  processingStatus?: "uploaded" | "processing" | "analyzed";
  name: LocalizedCandidateName;
  email: string;
  skills: string[];
  summary: string;
  resumeUrl: string;
  resumeFileName: string;
  resumeFileType?: string;
  createdAt?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
}

export interface CompanySearchApiCandidate {
  cvId: string;
  name: LocalizedCandidateName;
  email?: string;
  topSkills?: string[];
  atsScore?: number;
  matchScore?: number;
  matchedSnippet?: string;
  cvFileUrl?: string;
  cvFileName?: string;
  cvFileType?: string;
  _id?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
}

interface LegacyCandidateResult {
  cvId: string;
  userId?: string;
  matchScore?: number;
  atsScore?: number;
  processingStatus?: "uploaded" | "processing" | "analyzed";
  user?: {
    name?: LocalizedCandidateName;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
  };
  skills?: string[];
  summary?: string;
  originalFile?: {
    url?: string;
    fileName?: string;
    fileType?: string;
  };
  createdAt?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
}

export interface SearchCandidatesResponse {
  success: boolean;
  query: string;
  isGreeting: boolean;
  isOffTopic: boolean;
  message?: string;
  resultsCount: number;
  results?: CompanySearchApiCandidate[];
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface SearchCandidatesPayload {
  message: string;
  topK?: number;
}

export interface SearchHistoryEntry {
  id: string;
  query: string;
  createdAt: string;
  updatedAt?: string;
  candidates: CandidateResult[];
  total: number;
}

export interface CompanySearchHistoryApiEntry {
  _id: string;
  company: string;
  query: string;
  results?: CompanySearchApiCandidate[];
  resultsCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SearchHistoryResponse {
  success: boolean;
  history?: CompanySearchHistoryApiEntry[];
}

function normalizePercent(value?: number) {
  if (!Number.isFinite(value)) return 0;
  const safeValue = Number(value);
  return safeValue <= 1 ? Math.round(safeValue * 100) : Math.round(safeValue);
}

function getCandidateNameText(name: LocalizedCandidateName | undefined, fallback: string) {
  if (typeof name === "string") return name || fallback;
  if (!name) return fallback;
  return name.en ?? name.ar ?? fallback;
}

export function getLocalizedCandidateName(
  name: LocalizedCandidateName | undefined,
  locale: string,
  fallback = ""
) {
  if (typeof name === "string") return name;
  if (!name) return fallback;
  return locale === "ar"
    ? name.ar ?? name.en ?? fallback
    : name.en ?? name.ar ?? fallback;
}

export function normalizeCandidateResult(
  candidate: CandidateResult | CompanySearchApiCandidate | LegacyCandidateResult
): CandidateResult {
  if ("user" in candidate || "originalFile" in candidate) {
    return {
      cvId: candidate.cvId,
      userId: candidate.userId,
      matchScore: normalizePercent(candidate.matchScore),
      atsScore: normalizePercent(candidate.atsScore),
      processingStatus: candidate.processingStatus,
      name: candidate.user?.name ?? "",
      email: candidate.user?.email ?? "",
      skills: candidate.skills ?? [],
      summary: candidate.summary ?? "",
      resumeUrl: candidate.originalFile?.url ?? "",
      resumeFileName: candidate.originalFile?.fileName ?? "",
      resumeFileType: candidate.originalFile?.fileType,
      createdAt: candidate.createdAt,
      phone: candidate.phone ?? candidate.user?.phone,
      location: candidate.location ?? candidate.user?.location,
      linkedin: candidate.linkedin ?? candidate.user?.linkedin,
      github: candidate.github ?? candidate.user?.github,
    };
  }

  if ("topSkills" in candidate || "cvFileUrl" in candidate || "matchedSnippet" in candidate) {
    const fallbackName = getCandidateNameText(candidate.name, candidate.cvId);
    return {
      cvId: candidate.cvId,
      matchScore: normalizePercent(candidate.matchScore),
      atsScore: normalizePercent(candidate.atsScore),
      name: candidate.name ?? "",
      email: candidate.email ?? "",
      skills: candidate.topSkills ?? [],
      summary: candidate.matchedSnippet ?? "",
      resumeUrl: candidate.cvFileUrl ?? "",
      resumeFileName: candidate.cvFileName ?? `${fallbackName} CV.pdf`,
      resumeFileType: candidate.cvFileType,
      phone: "phone" in candidate ? candidate.phone : undefined,
      location: "location" in candidate ? candidate.location : undefined,
      linkedin: "linkedin" in candidate ? candidate.linkedin : undefined,
      github: "github" in candidate ? candidate.github : undefined,
    };
  }

  return {
    cvId: candidate.cvId,
    userId: "userId" in candidate ? candidate.userId : undefined,
    matchScore: normalizePercent(candidate.matchScore),
    atsScore: normalizePercent(candidate.atsScore),
    processingStatus: "processingStatus" in candidate ? candidate.processingStatus : undefined,
    name: "name" in candidate ? candidate.name ?? "" : "",
    email: "email" in candidate ? candidate.email ?? "" : "",
    skills: "skills" in candidate ? candidate.skills ?? [] : [],
    summary: "summary" in candidate ? candidate.summary ?? "" : "",
    resumeUrl: "resumeUrl" in candidate ? candidate.resumeUrl ?? "" : "",
    resumeFileName: "resumeFileName" in candidate ? candidate.resumeFileName ?? "" : "",
    resumeFileType: "resumeFileType" in candidate ? candidate.resumeFileType : undefined,
    createdAt: "createdAt" in candidate ? candidate.createdAt : undefined,
    phone: "phone" in candidate ? candidate.phone : undefined,
    location: "location" in candidate ? candidate.location : undefined,
    linkedin: "linkedin" in candidate ? candidate.linkedin : undefined,
    github: "github" in candidate ? candidate.github : undefined,
  };
}

export function normalizeCandidateResults(
  candidates: Array<CandidateResult | CompanySearchApiCandidate | LegacyCandidateResult> | undefined
) {
  return (candidates ?? []).map(normalizeCandidateResult);
}
