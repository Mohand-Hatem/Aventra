export type CvProcessingStatus = "uploaded" | "processing" | "analyzed" | "failed";

export type CvInsightItem = {
  title: string;
  detail: string;
};

export type CvScoreBreakdown = {
  keywordMatch?: number;
  formattingClarity?: number;
  skillsRelevance?: number;
  experienceDepth?: number;
  educationCertifications?: number;
};

export interface CvAnalysis {
  summary?: string;
  description?: string;
  strengths?: CvInsightItem[];
  weaknesses?: CvInsightItem[];
  suggestions?: CvInsightItem[];
  atsScore?: number;
}

export interface UserCv {
  _id?: string;
  id?: string;
  originalFile?: {
    url?: string;
    fileName?: string;
    fileType?: "pdf" | "doc" | "docx" | string;
    fileSize?: number;
    publicId?: string;
  };
  processingStatus?: CvProcessingStatus;
  atsScore?: number;
  scoreBreakdown?: CvScoreBreakdown;
  filename?: string;
  name?: string;
  originalName?: string;
  url?: string;
  fileUrl?: string;
  file?: string;
  summary?: string;
  description?: string;
  analysis?: CvAnalysis;
  aiAnalysis?: CvAnalysis;
  createdAt?: string;
  updatedAt?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function coerceAtsScore(value: unknown): number | undefined {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

export function parseInsightItems(value: unknown): CvInsightItem[] {
  if (!Array.isArray(value)) return [];

  const items: CvInsightItem[] = [];

  for (const item of value) {
    if (typeof item === "string" && item.trim()) {
      items.push({ title: "", detail: item.trim() });
      continue;
    }

    if (!isRecord(item)) continue;

    const title = String(item.title ?? item.name ?? "").trim();
    const detail = String(
      item.detail ?? item.description ?? item.text ?? "",
    ).trim();

    if (!title && !detail) continue;

    items.push({
      title,
      detail: detail || title,
    });
  }

  return items;
}

export function formatInsightLabel(item: CvInsightItem): string {
  if (item.title && item.detail && item.title !== item.detail) {
    return `${item.title}: ${item.detail}`;
  }
  return item.title || item.detail;
}

function normalizeScoreBreakdown(value: unknown): CvScoreBreakdown | undefined {
  if (!isRecord(value)) return undefined;

  return {
    keywordMatch: coerceAtsScore(value.keywordMatch),
    formattingClarity: coerceAtsScore(value.formattingClarity),
    skillsRelevance: coerceAtsScore(value.skillsRelevance),
    experienceDepth: coerceAtsScore(value.experienceDepth),
    educationCertifications: coerceAtsScore(value.educationCertifications),
  };
}

function normalizeCvAnalysis(value: unknown): CvAnalysis | undefined {
  if (!isRecord(value)) return undefined;

  return {
    summary: typeof value.summary === "string" ? value.summary : undefined,
    description:
      typeof value.description === "string" ? value.description : undefined,
    strengths: parseInsightItems(value.strengths),
    weaknesses: parseInsightItems(value.weaknesses),
    suggestions: parseInsightItems(value.suggestions),
    atsScore: coerceAtsScore(value.atsScore ?? value.ats_score),
  };
}

export function normalizeUserCv(cv: unknown): UserCv {
  if (!isRecord(cv)) return {};

  const analysis = normalizeCvAnalysis(
    cv.analysis ?? cv.aiAnalysis ?? cv.ai_analysis,
  );

  const atsScore = coerceAtsScore(
    cv.atsScore ?? cv.ats_score ?? analysis?.atsScore,
  );

  return {
    ...(cv as UserCv),
    atsScore,
    scoreBreakdown: normalizeScoreBreakdown(cv.scoreBreakdown),
    analysis,
    aiAnalysis: analysis,
    processingStatus: cv.processingStatus as CvProcessingStatus | undefined,
  };
}

export function normalizeUserCvs(value: unknown): UserCv[] {
  if (!Array.isArray(value)) return [];
  return value.map(normalizeUserCv);
}

export function getCvTitle(cv: UserCv): string {
  return (
    cv.originalFile?.fileName ??
    cv.filename ??
    cv.name ??
    cv.originalName ??
    "CV"
  );
}

export function getCvUrl(cv: UserCv): string | undefined {
  return cv.originalFile?.url ?? cv.url ?? cv.fileUrl ?? cv.file;
}

export function getCvId(cv: UserCv, index: number): string {
  return cv._id ?? cv.id ?? `cv-${index}`;
}

export function getCvFileType(cv: UserCv): string | undefined {
  return cv.originalFile?.fileType;
}

export function getCvAtsScore(cv: UserCv): number | undefined {
  const score = coerceAtsScore(cv.atsScore);
  if (score !== undefined && score > 0) return score;

  const nested = cv.analysis ?? cv.aiAnalysis;
  const nestedScore = coerceAtsScore(nested?.atsScore);
  return nestedScore !== undefined && nestedScore > 0 ? nestedScore : undefined;
}

export function getCvAnalysis(
  cv: UserCv,
): Required<Pick<CvAnalysis, "strengths" | "weaknesses" | "suggestions">> &
  CvAnalysis & { scoreBreakdown?: CvScoreBreakdown } {
  const nested =
    cv.analysis ??
    cv.aiAnalysis ??
    normalizeCvAnalysis(
      (cv as Record<string, unknown>).ai_analysis ??
        (cv as Record<string, unknown>).insights,
    ) ??
    {};

  return {
    summary:
      nested.summary ??
      nested.description ??
      cv.summary ??
      cv.description,
    strengths: nested.strengths ?? [],
    weaknesses: nested.weaknesses ?? [],
    suggestions: nested.suggestions ?? [],
    atsScore: getCvAtsScore(cv),
    scoreBreakdown: cv.scoreBreakdown,
  };
}
