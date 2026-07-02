/**
 * Folder: src/types
 * File: company.ts
 * Purpose: TypeScript types for company search domain.
 */

export interface CandidateResult {
  cvId: string;
  userId: string;
  matchScore: number;  // 0-100 — نسبة التطابق مع الـ query
  atsScore: number;    // 0-100 — نتيجة الـ ATS
  processingStatus: "uploaded" | "processing" | "analyzed";
  user: {
    name: string | { en: string; ar: string };
    email: string;
    avatar?: string;
    plan?: string;
  };
  skills: string[];
  summary: string;
  originalFile: {
    url: string;
    fileName: string;
  };
  createdAt: string;
}

export interface SearchCandidatesResponse {
  success: boolean;
  data: {
    candidates: CandidateResult[];
    total: number;
  };
}

export interface SearchCandidatesPayload {
  query: string;
  topK?: number;
}
