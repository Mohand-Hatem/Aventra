export type CvProcessingStatus = "uploaded" | "processing" | "analyzed" | "failed";

export interface CvAnalysis {
  summary?: string;
  description?: string;
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
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
  filename?: string;
  name?: string;
  originalName?: string;
  url?: string;
  fileUrl?: string;
  file?: string;
  summary?: string;
  description?: string;
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
  analysis?: CvAnalysis;
  aiAnalysis?: CvAnalysis;
  createdAt?: string;
  updatedAt?: string;
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

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

export function getCvAnalysis(cv: UserCv): Required<Pick<CvAnalysis, "strengths" | "weaknesses" | "suggestions">> & CvAnalysis {
  const nested = cv.analysis ?? cv.aiAnalysis ?? {};

  return {
    summary:
      nested.summary ??
      nested.description ??
      cv.summary ??
      cv.description,
    strengths: normalizeStringList(nested.strengths ?? cv.strengths),
    weaknesses: normalizeStringList(nested.weaknesses ?? cv.weaknesses),
    suggestions: normalizeStringList(nested.suggestions ?? cv.suggestions),
  };
}
