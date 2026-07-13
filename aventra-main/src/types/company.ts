/**
 * Folder: src/types
 * File: company.ts
 * Purpose: TypeScript types + normalizers for company search.
 */

export type LocalizedCandidateName = string | { en?: string; ar?: string };

export interface CandidateEducation {
  degree?: string;
  institution?: string;
  year?: string;
}

export interface CandidateExperience {
  role?: string;
  company?: string;
  duration?: string;
  description?: string;
}

export interface CandidateProject {
  name?: string;
  description?: string;
  technologies?: string[];
}

export interface CandidateCertification {
  name?: string;
  issuer?: string;
  date?: string;
}

export interface CandidateStrengthWeakness {
  title: string;
  detail: string;
}

export interface CandidateScoreBreakdown {
  keywordMatch?: number;
  formattingClarity?: number;
  skillsRelevance?: number;
  experienceDepth?: number;
  educationCertifications?: number;
}

export interface CandidateResult {
  cvId: string;
  userId?: string;
  // Present for AI-search-originated results; absent for deterministic
  // /company/filter results (which have no semantic relevance score).
  matchScore?: number;
  // Present only for /company/filter results.
  matchedSkills?: string[];
  matchCount?: number;
  atsScore: number;
  processingStatus?: "uploaded" | "processing" | "analyzed";
  name: LocalizedCandidateName;
  email: string;
  skills: string[];
  technicalSkills?: string[];
  softSkills?: string[];
  summary: string;
  resumeUrl: string;
  resumeFileName: string;
  resumeFileType?: string;
  createdAt?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  education?: CandidateEducation[];
  experience?: CandidateExperience[];
  projects?: CandidateProject[];
  certifications?: CandidateCertification[];
  strengths?: CandidateStrengthWeakness[];
  weaknesses?: CandidateStrengthWeakness[];
  suggestions?: CandidateStrengthWeakness[];
  scoreBreakdown?: CandidateScoreBreakdown;
}

export interface CompanySearchApiCandidate {
  cvId: string;
  name: LocalizedCandidateName;
  email?: string;
  topSkills?: string[];
  atsScore?: number;
  matchScore?: number;
  matchedSnippet?: string;
  experience?: CandidateExperience[];
  education?: CandidateEducation[];
  cvFileUrl?: string;
  cvFileName?: string;
  cvFileType?: string;
  _id?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  parsedData?: {
    contact?: {
      linkedin?: string;
      github?: string;
      email?: string;
      phone?: string;
      location?: string;
    };
    skills?: {
      technical?: string[];
      soft?: string[];
      missingRecommended?: string[];
    };
    certifications?: CandidateCertification[];
    experience?: CandidateExperience[];
    education?: CandidateEducation[];
    projects?: CandidateProject[];
  };
  aiAnalysis?: {
    summary?: string;
    strengths?: CandidateStrengthWeakness[];
    weaknesses?: CandidateStrengthWeakness[];
    suggestions?: CandidateStrengthWeakness[];
  };
  scoreBreakdown?: CandidateScoreBreakdown;
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
  parsedData?: {
    skills?: {
      technical?: string[];
      soft?: string[];
    };
    education?: CandidateEducation[];
    experience?: CandidateExperience[];
    projects?: CandidateProject[];
    certifications?: CandidateCertification[];
  };
  aiAnalysis?: {
    strengths?: CandidateStrengthWeakness[];
    weaknesses?: CandidateStrengthWeakness[];
    suggestions?: CandidateStrengthWeakness[];
  };
  scoreBreakdown?: CandidateScoreBreakdown;
}
export interface SearchCandidatesResponse {
  success: boolean;
  query: string;
  isGreeting: boolean;
  isOffTopic: boolean;
  message?: string;
  resultsCount: number;
  results?: CompanySearchApiCandidate[];
  uncertainCount?: number;
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

export function normalizePercent(value?: number) {
  if (!Number.isFinite(value)) return 0;
  const safeValue = Number(value);
  return safeValue <= 1 ? Math.round(safeValue * 100) : Math.round(safeValue);
}

function getCandidateNameText(
  name: LocalizedCandidateName | undefined,
  fallback: string,
) {
  if (typeof name === "string") return name || fallback;
  if (!name) return fallback;
  return name.en ?? name.ar ?? fallback;
}

export function getLocalizedCandidateName(
  name: LocalizedCandidateName | undefined,
  locale: string,
  fallback = "",
) {
  if (typeof name === "string") return name;
  if (!name) return fallback;
  return locale === "ar"
    ? (name.ar ?? name.en ?? fallback)
    : (name.en ?? name.ar ?? fallback);
}

export function normalizeCandidateResult(
  candidate:
    CandidateResult | CompanySearchApiCandidate | LegacyCandidateResult,
): CandidateResult {
  if ("user" in candidate || "originalFile" in candidate) {
    return {
      cvId: candidate.cvId || ((candidate as unknown as Record<string, unknown>)._id as string) || ((candidate as unknown as Record<string, unknown>).id as string),
      userId: candidate.userId,
      matchScore: normalizePercent(candidate.matchScore),
      atsScore: normalizePercent(candidate.atsScore),
      processingStatus: candidate.processingStatus,
      name: candidate.user?.name ?? "",
      email: candidate.user?.email ?? "",
      skills: candidate.skills ?? [],
      technicalSkills: candidate.parsedData?.skills?.technical ?? [],
      softSkills: candidate.parsedData?.skills?.soft ?? [],
      summary: candidate.summary ?? "",
      resumeUrl: candidate.originalFile?.url ?? "",
      resumeFileName: candidate.originalFile?.fileName ?? "",
      resumeFileType: candidate.originalFile?.fileType,
      createdAt: candidate.createdAt,
      phone: candidate.phone ?? candidate.user?.phone,
      location: candidate.location ?? candidate.user?.location,
      linkedin: candidate.linkedin ?? candidate.user?.linkedin,
      github: candidate.github ?? candidate.user?.github,
      education: candidate.parsedData?.education ?? [],
      experience: candidate.parsedData?.experience ?? [],
      projects: candidate.parsedData?.projects ?? [],
      certifications: candidate.parsedData?.certifications ?? [],
      strengths: candidate.aiAnalysis?.strengths ?? [],
      weaknesses: candidate.aiAnalysis?.weaknesses ?? [],
      suggestions: candidate.aiAnalysis?.suggestions ?? [],
      scoreBreakdown: candidate.scoreBreakdown,
    };
  }

  if (
    "topSkills" in candidate ||
    "cvFileUrl" in candidate ||
    "matchedSnippet" in candidate
  ) {
    const actualCvId =
      candidate.cvId || ((candidate as unknown as Record<string, unknown>)._id as string) || ((candidate as unknown as Record<string, unknown>).id as string);
    const fallbackName = getCandidateNameText(candidate.name, actualCvId);
    return {
      cvId: actualCvId,
      matchScore: normalizePercent(candidate.matchScore),
      atsScore: normalizePercent(candidate.atsScore),
      name: candidate.name ?? "",
      email: candidate.email ?? "",
      skills: candidate.topSkills ?? [],
      technicalSkills: candidate.parsedData?.skills?.technical ?? [],
      softSkills: candidate.parsedData?.skills?.soft ?? [],
      summary: candidate.matchedSnippet ?? "",
      resumeUrl: candidate.cvFileUrl ?? "",
      resumeFileName: candidate.cvFileName ?? `${fallbackName} CV.pdf`,
      resumeFileType: candidate.cvFileType,
      phone: "phone" in candidate ? candidate.phone : undefined,
      location: "location" in candidate ? candidate.location : undefined,
      linkedin: "linkedin" in candidate ? candidate.linkedin : undefined,
      github: "github" in candidate ? candidate.github : undefined,
      education: candidate.education ?? candidate.parsedData?.education ?? [],
      experience: candidate.experience ?? candidate.parsedData?.experience ?? [],
      projects: candidate.parsedData?.projects ?? [],
      certifications: candidate.parsedData?.certifications ?? [],
      strengths: candidate.aiAnalysis?.strengths ?? [],
      weaknesses: candidate.aiAnalysis?.weaknesses ?? [],
      suggestions: candidate.aiAnalysis?.suggestions ?? [],
      scoreBreakdown: candidate.scoreBreakdown,
    };
  }

  return {
    cvId: candidate.cvId || ((candidate as unknown as Record<string, unknown>)._id as string) || ((candidate as unknown as Record<string, unknown>).id as string),
    userId: "userId" in candidate ? candidate.userId : undefined,
    matchScore: normalizePercent(candidate.matchScore),
    atsScore: normalizePercent(candidate.atsScore),
    processingStatus:
      "processingStatus" in candidate ? candidate.processingStatus : undefined,
    name: "name" in candidate ? (candidate.name ?? "") : "",
    email: "email" in candidate ? (candidate.email ?? "") : "",
    skills: "skills" in candidate ? (candidate.skills ?? []) : [],
    technicalSkills: "technicalSkills" in candidate ? candidate.technicalSkills : [],
    softSkills: "softSkills" in candidate ? candidate.softSkills : [],
    summary: "summary" in candidate ? (candidate.summary ?? "") : "",
    resumeUrl: "resumeUrl" in candidate ? (candidate.resumeUrl ?? "") : "",
    resumeFileName:
      "resumeFileName" in candidate ? (candidate.resumeFileName ?? "") : "",
    resumeFileType:
      "resumeFileType" in candidate ? candidate.resumeFileType : undefined,
    createdAt: "createdAt" in candidate ? candidate.createdAt : undefined,
    phone: "phone" in candidate ? candidate.phone : undefined,
    location: "location" in candidate ? candidate.location : undefined,
    linkedin: "linkedin" in candidate ? candidate.linkedin : undefined,
    github: "github" in candidate ? candidate.github : undefined,
    education: "education" in candidate ? candidate.education : [],
    experience: "experience" in candidate ? candidate.experience : [],
    projects: "projects" in candidate ? candidate.projects : [],
    certifications:
      "certifications" in candidate ? candidate.certifications : [],
    strengths: "strengths" in candidate ? candidate.strengths : [],
    weaknesses: "weaknesses" in candidate ? candidate.weaknesses : [],
    suggestions: "suggestions" in candidate ? candidate.suggestions : [],
    scoreBreakdown:
      "scoreBreakdown" in candidate ? candidate.scoreBreakdown : undefined,
  };
}

export function normalizeCandidateResults(
  candidates:
    | Array<CandidateResult | CompanySearchApiCandidate | LegacyCandidateResult>
    | undefined,
) {
  return (candidates ?? []).map(normalizeCandidateResult);
}

