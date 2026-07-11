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
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  email?: string;
}

export type CvParsedCertification = {
  name?: string;
  issuer?: string;
  date?: string;
};

export type CvParsedExperience = {
  role?: string;
  company?: string;
  duration?: string;
  description?: string;
};

export type CvParsedEducation = {
  degree?: string;
  institution?: string;
  year?: string;
};

export type CvParsedProject = {
  name?: string;
  description?: string;
  technologies: string[];
};

export type CvParsedSections = {
  certifications: CvParsedCertification[];
  experience: CvParsedExperience[];
  education: CvParsedEducation[];
  projects: CvParsedProject[];
};

export interface UserCv {
  _id?: string;
  id?: string;
  status?: CvProcessingStatus;
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
  fileType?: "pdf" | "doc" | "docx" | string;
  fileName?: string;
  fileSize?: number;
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
  uploadedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  email?: string;
  contact?: unknown;
  parsedData?: unknown;
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

  // Contact info may be at root or nested in contact/personalInfo/personal_info
  const contactNested =
    (isRecord(value.contact) ? value.contact : null) ??
    (isRecord(value.personalInfo) ? value.personalInfo : null) ??
    (isRecord(value.personal_info) ? value.personal_info : null);

  const pickStr = (a: unknown, b: unknown) =>
    typeof a === "string" && a.trim() ? a.trim() : typeof b === "string" && b.trim() ? b.trim() : undefined;

  return {
    summary: typeof value.summary === "string" ? value.summary : undefined,
    description:
      typeof value.description === "string" ? value.description : undefined,
    strengths: parseInsightItems(value.strengths),
    weaknesses: parseInsightItems(value.weaknesses),
    suggestions: parseInsightItems(value.suggestions),
    atsScore: coerceAtsScore(value.atsScore ?? value.ats_score),
    phone: pickStr(value.phone, contactNested?.phone),
    location: pickStr(value.location, contactNested?.location ?? contactNested?.address),
    linkedin: pickStr(value.linkedin, contactNested?.linkedin ?? contactNested?.linkedIn),
    github: pickStr(value.github, contactNested?.github),
    email: pickStr(value.email, contactNested?.email),
  };
}

function pickText(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
  }

  return undefined;
}

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

export function getCvParsedSections(cv: UserCv | null | undefined): CvParsedSections {
  const parsedData = cv?.parsedData;
  if (!isRecord(parsedData)) {
    return {
      certifications: [],
      experience: [],
      education: [],
      projects: [],
    };
  }

  const certifications = Array.isArray(parsedData.certifications)
    ? parsedData.certifications
        .map((item) => {
          if (!isRecord(item)) return null;

          const normalized: CvParsedCertification = {
            name: pickText(item.name, item.title),
            issuer: pickText(item.issuer, item.organization),
            date: pickText(item.date, item.year, item.issuedAt),
          };

          return normalized.name || normalized.issuer || normalized.date
            ? normalized
            : null;
        })
        .filter((item): item is CvParsedCertification => item !== null)
    : [];

  const experience = Array.isArray(parsedData.experience)
    ? parsedData.experience
        .map((item) => {
          if (!isRecord(item)) return null;

          const normalized: CvParsedExperience = {
            role: pickText(item.role, item.title, item.position),
            company: pickText(item.company, item.organization),
            duration: pickText(item.duration, item.date, item.period),
            description: pickText(item.description, item.summary),
          };

          return normalized.role || normalized.company || normalized.duration || normalized.description
            ? normalized
            : null;
        })
        .filter((item): item is CvParsedExperience => item !== null)
    : [];

  const education = Array.isArray(parsedData.education)
    ? parsedData.education
        .map((item) => {
          if (!isRecord(item)) return null;

          const normalized: CvParsedEducation = {
            degree: pickText(item.degree, item.title),
            institution: pickText(item.institution, item.school, item.university),
            year: pickText(item.year, item.graduationDate, item.date),
          };

          return normalized.degree || normalized.institution || normalized.year
            ? normalized
            : null;
        })
        .filter((item): item is CvParsedEducation => item !== null)
    : [];

  const projects = Array.isArray(parsedData.projects)
    ? parsedData.projects
        .map((item) => {
          if (!isRecord(item)) return null;

          const normalized: CvParsedProject = {
            name: pickText(item.name, item.title),
            description: pickText(item.description, item.summary),
            technologies: normalizeStringList(item.technologies),
          };

          return normalized.name || normalized.description || normalized.technologies.length > 0
            ? normalized
            : null;
        })
        .filter((item): item is CvParsedProject => item !== null)
    : [];

  return {
    certifications,
    experience,
    education,
    projects,
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

  const fileUrl =
    typeof cv.url === "string"
      ? cv.url
      : typeof cv.fileUrl === "string"
        ? cv.fileUrl
        : typeof cv.file === "string"
          ? cv.file
          : undefined;

  const fileName =
    typeof cv.fileName === "string"
      ? cv.fileName
      : typeof cv.filename === "string"
        ? cv.filename
        : typeof cv.name === "string"
          ? cv.name
          : typeof cv.originalName === "string"
            ? cv.originalName
            : undefined;

  const fileType =
    typeof cv.fileType === "string" ? cv.fileType : undefined;

  const fileSize =
    typeof cv.fileSize === "number" ? cv.fileSize : undefined;

  const uploadedAt =
    typeof cv.uploadedAt === "string" ? cv.uploadedAt : undefined;

  const processingStatus = (cv.processingStatus ?? cv.status) as
    | CvProcessingStatus
    | undefined;

  const phone = typeof cv.phone === "string" ? cv.phone :
    (isRecord(cv.contact) && typeof cv.contact.phone === "string" ? cv.contact.phone :
    (isRecord(cv.parsedData) ? normalizeCvAnalysis(cv.parsedData)?.phone : undefined) ??
    analysis?.phone);
  const location = typeof cv.location === "string" ? cv.location :
    (isRecord(cv.contact) && typeof cv.contact.location === "string" ? cv.contact.location :
    (isRecord(cv.parsedData) ? normalizeCvAnalysis(cv.parsedData)?.location : undefined) ??
    analysis?.location);
  const linkedin = typeof cv.linkedin === "string" ? cv.linkedin :
    (isRecord(cv.contact) && typeof cv.contact.linkedin === "string" ? cv.contact.linkedin :
    (isRecord(cv.parsedData) ? normalizeCvAnalysis(cv.parsedData)?.linkedin : undefined) ??
    analysis?.linkedin);
  const github = typeof cv.github === "string" ? cv.github :
    (isRecord(cv.contact) && typeof cv.contact.github === "string" ? cv.contact.github :
    (isRecord(cv.parsedData) ? normalizeCvAnalysis(cv.parsedData)?.github : undefined) ??
    analysis?.github);
  const email = typeof cv.email === "string" ? cv.email :
    (isRecord(cv.contact) && typeof cv.contact.email === "string" ? cv.contact.email :
    (isRecord(cv.parsedData) ? normalizeCvAnalysis(cv.parsedData)?.email : undefined) ??
    analysis?.email);

  return {
    ...(cv as UserCv),
    phone,
    location,
    linkedin,
    github,
    email,
    atsScore,
    scoreBreakdown: normalizeScoreBreakdown(cv.scoreBreakdown),
    analysis,
    aiAnalysis: analysis,
    processingStatus,
    status: processingStatus,
    uploadedAt,
    originalFile: {
      url:
        (isRecord(cv.originalFile) && typeof cv.originalFile.url === "string"
          ? cv.originalFile.url
          : undefined) ?? fileUrl,
      fileName:
        (isRecord(cv.originalFile) &&
        typeof cv.originalFile.fileName === "string"
          ? cv.originalFile.fileName
          : undefined) ?? fileName,
      fileType:
        (isRecord(cv.originalFile) &&
        typeof cv.originalFile.fileType === "string"
          ? cv.originalFile.fileType
          : undefined) ?? fileType,
      fileSize:
        (isRecord(cv.originalFile) &&
        typeof cv.originalFile.fileSize === "number"
          ? cv.originalFile.fileSize
          : undefined) ?? fileSize,
      publicId:
        isRecord(cv.originalFile) &&
        typeof cv.originalFile.publicId === "string"
          ? cv.originalFile.publicId
          : undefined,
    },
    createdAt:
      typeof cv.createdAt === "string"
        ? cv.createdAt
        : uploadedAt ?? undefined,
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
    phone: cv.phone ?? nested.phone,
    location: cv.location ?? nested.location,
    linkedin: cv.linkedin ?? nested.linkedin,
    github: cv.github ?? nested.github,
    email: cv.email ?? nested.email,
  };
}
