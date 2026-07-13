"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import {
  IconAlertTriangle,
  IconBulb,
  IconCheck,
  IconFileText,
  IconSparkles,
  IconUpload,
  IconMail,
  IconPhone,
  IconBrandLinkedin,
  IconBrandGithub,
  IconMapPin,
} from "@tabler/icons-react";
import RequireRole from "@/components/auth/RequireRole";
import { AtsScoreChart } from "@/components/feature/profile/AtsScoreChart";
import { CvInsightDialog } from "@/components/feature/profile/CvInsightDialog";
import { ScaleLoader } from "@/components/shared/scale-loader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useAnalyzeCv,
  useUploadCv,
  useUserCvs,
  type AnalyzeCvResponse,
  type UploadCvResponse,
} from "@/hooks/useCv";
import { cn, ensureAbsoluteUrl } from "@/lib/utils";
import {
  coerceAtsScore,
  formatInsightLabel,
  getCvAnalysis,
  getCvAtsScore,
  getCvId,
  getCvTitle,
  getCvUrl,
  type CvInsightItem,
  type CvProcessingStatus,
  type CvScoreBreakdown,
  type UserCv,
} from "@/types/cv";
import { ROLES } from "@/constants/roles";
import Image from "next/image";

const ACCEPTED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const BREAKDOWN_COLORS = [
  "#8b5cf6",
  "#38bdf8",
  "#22c55e",
  "#f59e0b",
  "#fb7185",
];

function getTimestamp(value?: string) {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function sortCvsByNewest(cvs: UserCv[]) {
  return [...cvs].sort((a, b) => {
    const bTime = getTimestamp(b.updatedAt ?? b.createdAt);
    const aTime = getTimestamp(a.updatedAt ?? a.createdAt);
    return bTime - aTime;
  });
}

function isAcceptedCvFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return (
    (extension !== undefined && ["pdf", "doc", "docx"].includes(extension)) ||
    ACCEPTED_MIME_TYPES.has(file.type)
  );
}

function formatFileSize(bytes?: number) {
  if (!bytes || bytes <= 0) return null;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function getCvRecordId(cv?: UserCv | null) {
  return cv?._id ?? cv?.id ?? null;
}

function isAnalyzingStatus(status?: CvProcessingStatus) {
  return status === "processing";
}

function isFinalAnalysisStatus(status?: CvProcessingStatus) {
  return status === "analyzed" || status === "failed";
}

function extractUploadedCv(payload?: UploadCvResponse | null) {
  return payload?.data?.id ? payload.data : null;
}

function mergeCvWithAnalyzeReport(
  cv: UserCv,
  report?: AnalyzeCvResponse["report"],
): UserCv {
  if (!report) return cv;

  const nextAtsScore = coerceAtsScore(report.atsScore);

  return {
    ...cv,
    atsScore: nextAtsScore ?? cv.atsScore,
    scoreBreakdown: report.scoreBreakdown ?? cv.scoreBreakdown,
    analysis: report.aiAnalysis ?? cv.analysis,
    aiAnalysis: report.aiAnalysis ?? cv.aiAnalysis,
    parsedData: report.parsedData ?? cv.parsedData,
    processingStatus: "analyzed",
    status: "analyzed",
  };
}

function hasBreakdownScores(breakdown?: CvScoreBreakdown) {
  return [
    breakdown?.keywordMatch,
    breakdown?.formattingClarity,
    breakdown?.skillsRelevance,
    breakdown?.experienceDepth,
    breakdown?.educationCertifications,
  ].some((value) => typeof value === "number");
}

function getStatusTone(status?: CvProcessingStatus, isUploading = false) {
  if (isUploading) {
    return "bg-primary/12 text-primary dark:bg-sky/15 dark:text-sky";
  }

  if (status === "analyzed") {
    return "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400";
  }

  if (status === "failed") {
    return "bg-destructive/12 text-destructive";
  }

  if (isAnalyzingStatus(status)) {
    return "bg-primary/12 text-primary dark:bg-sky/15 dark:text-sky";
  }

  return "bg-muted text-muted-foreground";
}

function ReportSectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
      {children}
    </p>
  );
}

function EmptyReportState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="min-h-72 border border-border/60 bg-canvas/60 shadow-md backdrop-blur dark:border-border/40">
      <CardContent className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/8 text-primary dark:border-sky/20 dark:bg-sky/10 dark:text-sky">
          <IconSparkles className="size-6" />
        </div>
        <h3 className="mt-5 text-sm lg:text-3xl  font-semibold tracking-tight">
          {title}
        </h3>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

/* ───────────────────────────────── helpers ── */
const BREAKDOWN_TW_COLORS = [
  {
    bar: "bg-violet-500",
    text: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/40",
  },
  {
    bar: "bg-sky-500",
    text: "text-sky-600    dark:text-sky-400",
    bg: "bg-sky-50    dark:bg-sky-950/40",
  },
  {
    bar: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    bar: "bg-amber-500",
    text: "text-amber-600  dark:text-amber-400",
    bg: "bg-amber-50  dark:bg-amber-950/40",
  },
  {
    bar: "bg-rose-500",
    text: "text-rose-600   dark:text-rose-400",
    bg: "bg-rose-50   dark:bg-rose-950/40",
  },
];

function getScoreLabel(score?: number) {
  if (score === undefined) return null;
  if (score >= 85)
    return {
      label: "Excellent",
      cls: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800",
    };
  if (score >= 70)
    return {
      label: "Good",
      cls: "text-sky-600    dark:text-sky-400    bg-sky-50    dark:bg-sky-950/50    border-sky-200    dark:border-sky-800",
    };
  if (score >= 55)
    return {
      label: "Fair",
      cls: "text-amber-600  dark:text-amber-400  bg-amber-50  dark:bg-amber-950/50  border-amber-200  dark:border-amber-800",
    };
  return {
    label: "Needs Work",
    cls: "text-rose-600   dark:text-rose-400   bg-rose-50   dark:bg-rose-950/50   border-rose-200   dark:border-rose-800",
  };
}

/* ─── Score Metric Strip ── */
function ScoreMetricStrip({
  entries,
}: {
  entries: Array<{ key: string; label: string; value: number }>;
}) {
  if (entries.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 2xl:gap-4">
      {entries.map((entry, i) => {
        const color = BREAKDOWN_TW_COLORS[i % BREAKDOWN_TW_COLORS.length];
        return (
          <div
            key={entry.key}
            className={cn(
              "flex flex-col gap-1.5 rounded-xl border p-3 xl:p-4",
              color.bg,
              "border-border/40",
            )}
          >
            <span className={cn("text-2xl font-bold tabular-nums", color.text)}>
              {entry.value}
              <span className="text-sm font-normal opacity-60">/100</span>
            </span>
            <span className="text-xs font-medium leading-tight text-foreground/70">
              {entry.label}
            </span>
            <div className="mt-1 h-1 rounded-full bg-black/10 dark:bg-white/10">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  color.bar,
                )}
                style={{ width: `${Math.max(0, Math.min(100, entry.value))}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Insight Panel ── */
function InsightListCard({
  title,
  icon: Icon,
  items,
  emptyText,
  viewAllLabel,
  variant,
}: {
  title: string;
  icon: typeof IconCheck;
  items: CvInsightItem[];
  emptyText: string;
  viewAllLabel: string;
  variant: "emerald" | "amber" | "primary";
}) {
  const previewItems = items.slice(0, 5);
  const variantMap = {
    emerald: {
      icon: "text-emerald-600 dark:text-emerald-400",
      dot: "bg-emerald-500",
      badge:
        "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50",
      border: "border-l-emerald-500",
    },
    amber: {
      icon: "text-amber-600 dark:text-amber-400",
      dot: "bg-amber-500",
      badge:
        "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50",
      border: "border-l-amber-500",
    },
    primary: {
      icon: "text-primary dark:text-sky",
      dot: "bg-primary dark:bg-sky",
      badge: "text-primary dark:text-sky bg-primary/8 dark:bg-sky/10",
      border: "border-l-primary dark:border-l-sky",
    },
  };
  const v = variantMap[variant];

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border border-border/60 bg-canvas/50 shadow-md backdrop-blur dark:border-border/40",
        "border-l-4",
        v.border,
      )}
    >
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <Icon className={cn("size-4 shrink-0", v.icon)} />
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        {items.length > 0 ? (
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-xs font-semibold",
              v.badge,
            )}
          >
            {items.length}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col flex-1 px-5 pb-5">
        {previewItems.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">{emptyText}</p>
        ) : (
          <ul className="divide-y divide-border/40">
            {previewItems.map((item, index) => (
              <li
                key={`${title}-${index}`}
                className="flex items-start gap-3 py-2.5"
              >
                <span
                  className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", v.dot)}
                />
                <p className="text-sm leading-6 text-foreground/85">
                  {formatInsightLabel(item)}
                </p>
              </li>
            ))}
          </ul>
        )}

        {items.length > 5 ? (
          <div className="mt-3 pt-3 border-t border-border/40">
            <CvInsightDialog
              title={title}
              triggerLabel={viewAllLabel}
              items={items}
              variant="footer"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ─── Contact Strip ── */
function ContactInfoCard({
  profileT,
  email,
  phone,
  linkedin,
  github,
  location,
}: {
  profileT: ReturnType<typeof useTranslations<"profile">>;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  location?: string;
}) {
  const hasContact = !!(email || phone || linkedin || github || location);

  const items = [
    email
      ? {
          icon: IconMail,
          label: profileT("emailLabel"),
          value: email,
          href: `mailto:${email}`,
          external: false,
        }
      : null,
    phone
      ? {
          icon: IconPhone,
          label: profileT("phoneLabel"),
          value: phone,
          href: `tel:${phone}`,
          external: false,
        }
      : null,
    linkedin
      ? {
          icon: IconBrandLinkedin,
          label: profileT("linkedinLabel"),
          value: "LinkedIn",
          href: ensureAbsoluteUrl(linkedin),
          external: true,
        }
      : null,
    github
      ? {
          icon: IconBrandGithub,
          label: profileT("githubLabel"),
          value: "GitHub",
          href: ensureAbsoluteUrl(github),
          external: true,
        }
      : null,
    location
      ? {
          icon: IconMapPin,
          label: profileT("locationLabel"),
          value: location,
          href: undefined,
          external: false,
        }
      : null,
  ].filter(Boolean) as {
    icon: typeof IconMail;
    label: string;
    value: string;
    href: string | undefined;
    external: boolean;
  }[];

  if (!hasContact) return null;

  return (
    <div className="rounded-2xl border border-border/60 bg-canvas/50 shadow-md backdrop-blur dark:border-border/40">
      <div className="flex items-center gap-2 border-b border-border/40 px-5 py-3">
        <IconMail className="size-4 text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {profileT("contactInfo")}
        </span>
      </div>
      <div className="flex flex-wrap gap-0 divide-x divide-border/40">
        {items.map(({ icon: ItemIcon, label, value, href, external }) => (
          <div
            key={label}
            className="flex flex-col gap-0.5 px-5 py-3 min-w-[120px] sm:min-w-[140px]"
          >
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {label}
            </span>
            {href ? (
              <a
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary dark:hover:text-sky hover:underline transition-colors truncate"
              >
                <ItemIcon size={13} className="shrink-0 opacity-60" />
                <span className="truncate">{value}</span>
              </a>
            ) : (
              <span className="flex items-center gap-1 text-sm font-medium text-foreground truncate">
                <ItemIcon size={13} className="shrink-0 opacity-60" />
                <span className="truncate">{value}</span>
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Breakdown Card ── */
function BreakdownCard({
  title,
  emptyText,
  entries,
}: {
  title: string;
  subtitle: string;
  emptyText: string;
  entries: Array<{ key: string; label: string; value: number; color: string }>;
  averageLabel: string;
}) {
  return (
    <Card className="h-full border border-border/60 bg-card/80 shadow-card backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="flex min-h-48 items-center justify-center text-center text-sm text-muted-foreground">
            <p className="max-w-sm">{emptyText}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, i) => {
              const color = BREAKDOWN_TW_COLORS[i % BREAKDOWN_TW_COLORS.length];
              return (
                <div key={entry.key}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-foreground/85">
                      {entry.label}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-bold tabular-nums",
                        color.text,
                      )}
                    >
                      {entry.value}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted/50">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700 ease-out",
                        color.bar,
                      )}
                      style={{
                        width: `${Math.max(0, Math.min(100, entry.value))}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CvAnalysisContent() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedCv, setUploadedCv] = useState<NonNullable<
    UploadCvResponse["data"]
  > | null>(null);
  const [analysisCvId, setAnalysisCvId] = useState<string | null>(null);
  const [instantReport, setInstantReport] = useState<{
    cvId: string;
    report: NonNullable<AnalyzeCvResponse["report"]>;
  } | null>(null);
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null);
  const t = useTranslations("cvAnalysis");
  const profileT = useTranslations("profile");
  const { data: cvs, isLoading, refetch } = useUserCvs();
  const uploadCv = useUploadCv();
  const analyzeCv = useAnalyzeCv();

  const sortedCvs = useMemo(() => sortCvsByNewest(cvs), [cvs]);
  const selectedCv = useMemo(() => {
    if (selectedCvId) {
      const matched = sortedCvs.find(
        (cv, index) => getCvId(cv, index) === selectedCvId,
      );
      if (matched) return matched;
    }

    return sortedCvs[0] ?? null;
  }, [selectedCvId, sortedCvs]);
  const selectedBackendCvId = getCvRecordId(selectedCv);
  const trackedAnalysisCv = useMemo(
    () => cvs.find((cv) => getCvRecordId(cv) === analysisCvId) ?? null,
    [analysisCvId, cvs],
  );
  const currentUploadedCv =
    trackedAnalysisCv?.processingStatus &&
    isFinalAnalysisStatus(trackedAnalysisCv.processingStatus)
      ? null
      : uploadedCv;
  const readyToAnalyzeCvId =
    currentUploadedCv?.id ??
    (selectedCv?.processingStatus === "uploaded" ? selectedBackendCvId : null);
  const displayCv = useMemo(() => {
    if (
      selectedCv &&
      instantReport?.report &&
      instantReport.cvId === selectedBackendCvId
    ) {
      return mergeCvWithAnalyzeReport(selectedCv, instantReport.report);
    }

    return selectedCv;
  }, [instantReport, selectedBackendCvId, selectedCv]);
  const isAwaitingAnalysis =
    !!analysisCvId &&
    (!trackedAnalysisCv ||
      !isFinalAnalysisStatus(trackedAnalysisCv.processingStatus));

  useEffect(() => {
    if (!isAwaitingAnalysis && !(selectedCv?.processingStatus === "processing"))
      return;

    // Keep the page fresh while the backend finishes processing the newest CV.
    const intervalId = window.setInterval(() => {
      void refetch();
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [isAwaitingAnalysis, refetch, selectedCv?.processingStatus]);

  const activeAnalysis = useMemo(
    () => (displayCv ? getCvAnalysis(displayCv) : null),
    [displayCv],
  );
  const activeAtsScore = displayCv ? getCvAtsScore(displayCv) : undefined;
  const activeCvUrl = displayCv ? getCvUrl(displayCv) : undefined;
  const hasInstantAnalysis =
    !!displayCv &&
    !!instantReport?.report &&
    instantReport.cvId === getCvRecordId(displayCv);

  const breakdownEntries = useMemo(
    () =>
      [
        {
          key: "keywordMatch",
          label: t("breakdown.keywordMatch"),
          value: activeAnalysis?.scoreBreakdown?.keywordMatch,
          color: BREAKDOWN_COLORS[0],
        },
        {
          key: "formattingClarity",
          label: t("breakdown.formattingClarity"),
          value: activeAnalysis?.scoreBreakdown?.formattingClarity,
          color: BREAKDOWN_COLORS[1],
        },
        {
          key: "skillsRelevance",
          label: t("breakdown.skillsRelevance"),
          value: activeAnalysis?.scoreBreakdown?.skillsRelevance,
          color: BREAKDOWN_COLORS[2],
        },
        {
          key: "experienceDepth",
          label: t("breakdown.experienceDepth"),
          value: activeAnalysis?.scoreBreakdown?.experienceDepth,
          color: BREAKDOWN_COLORS[3],
        },
        {
          key: "educationCertifications",
          label: t("breakdown.educationCertifications"),
          value: activeAnalysis?.scoreBreakdown?.educationCertifications,
          color: BREAKDOWN_COLORS[4],
        },
      ]
        .filter((entry) => typeof entry.value === "number")
        .map((entry) => ({
          ...entry,
          value: Math.max(0, Math.min(100, Math.round(entry.value ?? 0))),
        })),
    [activeAnalysis?.scoreBreakdown, t],
  );

  const strengthCount = activeAnalysis?.strengths.length ?? 0;
  const weaknessCount = activeAnalysis?.weaknesses.length ?? 0;
  const suggestionCount = activeAnalysis?.suggestions.length ?? 0;
  const hasDraftPendingAnalysis = !!file;

  const hasAnalysis =
    !!displayCv &&
    !isAnalyzingStatus(displayCv.processingStatus) &&
    displayCv.processingStatus !== "uploaded" &&
    displayCv.processingStatus !== "failed" &&
    (activeAtsScore !== undefined ||
      strengthCount > 0 ||
      weaknessCount > 0 ||
      suggestionCount > 0 ||
      hasBreakdownScores(activeAnalysis?.scoreBreakdown) ||
      Boolean(activeAnalysis?.summary));

  const previewName =
    file?.name ??
    currentUploadedCv?.fileName ??
    (displayCv ? getCvTitle(displayCv) : null);
  const previewSize =
    formatFileSize(file?.size) ??
    formatFileSize(currentUploadedCv?.fileSize) ??
    formatFileSize(displayCv?.originalFile?.fileSize);

  const previewStatus = uploadCv.isPending
    ? t("uploading")
    : hasInstantAnalysis
      ? t("statusAnalyzed")
      : analyzeCv.isPending || isAwaitingAnalysis
        ? t("analyzing")
        : file
          ? t("fileReady")
          : currentUploadedCv?.status === "uploaded" ||
              displayCv?.processingStatus === "uploaded"
            ? t("statusUploaded")
            : displayCv?.processingStatus === "analyzed"
              ? t("statusAnalyzed")
              : displayCv?.processingStatus === "failed"
                ? t("failedTitle")
                : displayCv?.processingStatus &&
                    isAnalyzingStatus(displayCv.processingStatus)
                  ? t("processingTitle")
                  : t("fileHint");

  const reportState = hasDraftPendingAnalysis
    ? "empty"
    : isAwaitingAnalysis && !hasInstantAnalysis
      ? "processing"
      : !displayCv
        ? "empty"
        : displayCv.processingStatus === "failed"
          ? "failed"
          : displayCv.processingStatus === "uploaded"
            ? "empty"
            : hasAnalysis
              ? "ready"
              : displayCv.processingStatus === "processing"
                ? "processing"
                : "empty";

  const handleFileChange = (nextFile: File | null) => {
    if (!nextFile) {
      setFile(null);
      return;
    }

    if (!isAcceptedCvFile(nextFile)) {
      setFile(null);
      toast.error(t("invalidFile"));
      return;
    }

    setUploadedCv(null);
    setAnalysisCvId(null);
    setInstantReport(null);
    setFile(nextFile);
  };

  const handleUpload = () => {
    if (!file || uploadCv.isPending) return;

    uploadCv.mutate(file, {
      onSuccess: async (payload) => {
        const nextUploadedCv = extractUploadedCv(payload);
        if (!nextUploadedCv?.id) {
          toast.error(t("uploadFailedInline"));
          return;
        }

        setUploadedCv(nextUploadedCv);
        setAnalysisCvId(null);
        setInstantReport(null);
        setSelectedCvId(nextUploadedCv.id);
        await refetch();
        setFile(null);
      },
    });
  };

  const handleAnalyze = () => {
    if (
      !readyToAnalyzeCvId ||
      analyzeCv.isPending ||
      analyzeCv.isTokenLimitReached
    )
      return;

    analyzeCv.mutate(readyToAnalyzeCvId, {
      onSuccess: async (payload) => {
        setAnalysisCvId(readyToAnalyzeCvId);
        if (payload?.report) {
          setInstantReport({
            cvId: readyToAnalyzeCvId,
            report: payload.report,
          });
        }
        await refetch();
      },
    });
  };

  return (
    <RequireRole allowedRoles={[ROLES.user, ROLES.admin]}>
      <div className="relative isolate min-h-screen bg-canvas pb-20">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-1155/678 w-xl -translate-x-1/2 rotate-30 bg-linear-to-tr from-primary/10 to-sky/20 opacity-30 sm:left-[calc(50%-30rem)] sm:w-6xl"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
        <div className="relative w-full hidden h-[220px] dark:flex overflow-hidden border-b border-border/30">
          <div className="absolute inset-0 z-10 bg-linear-to-t from-canvas via-canvas/40 to-transparent" />
          <Image
            src="/cv.png"
            alt="banner"
            width={1600}
            height={900}
            className="w-full object-cover opacity-65"
          />
        </div>
        <div className="w-full h-[220px] flex dark:hidden overflow-hidden border-b border-border/30">
          <Image
            src="/cv-light.png"
            alt="banner"
            width={1600}
            height={900}
            className="w-full object-cover opacity-60"
          />
        </div>

        <div className="mx-auto flex w-full max-w-[1550px] flex-col px-4 sm:px-6 lg:px-8 mt-6">
          {/* Header Description & Integrated Stats Card */}
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-canvas/50 p-6 shadow-md backdrop-blur-md dark:border-border/40 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary dark:border-sky/15 dark:bg-sky/8 dark:text-sky">
                  <IconSparkles className="size-3.5" />
                  {t("uploadEyebrow")}
                </span>
                <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {t("title")}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {t("subtitle")}
                </p>
              </div>

              {/* Stats Strip */}
              <div className="grid grid-cols-2 gap-3 shrink-0 sm:grid-cols-3 md:grid-cols-4 lg:w-auto w-full">
                <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-canvas/60 p-4 text-center shadow-sm dark:border-border/40">
                  <span className="text-2xl font-bold text-primary dark:text-sky">
                    98%
                  </span>
                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Accuracy
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-canvas/60 p-4 text-center shadow-sm dark:border-border/40">
                  <span className="text-2xl font-bold text-foreground">
                    {"<"} 30s
                  </span>
                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Speed
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-canvas/60 p-4 text-center shadow-sm dark:border-border/40">
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    5
                  </span>
                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Metrics
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-canvas/60 p-4 text-center shadow-sm dark:border-border/40">
                  <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    AI
                  </span>
                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Powered
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] items-start">
            {/* Left Area: Workspace/Results */}
            <div className="min-w-0 space-y-6">
              {isLoading && !selectedCv ? (
                <div className="flex h-[450px] items-center justify-center rounded-3xl border border-border/60 bg-canvas/50 shadow-md backdrop-blur dark:border-border/40">
                  <ScaleLoader size="lg" />
                </div>
              ) : reportState === "ready" ? (
                <div className="space-y-6">
                  {/* Row 1: Score & Breakdown */}
                  <div className="grid gap-6 md:grid-cols-[280px_1fr]">
                    {/* Score Card */}
                    <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-border/60 bg-canvas/50 p-6 shadow-md backdrop-blur dark:border-border/40">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {t("overallScore")}
                      </p>

                      <AtsScoreChart
                        score={activeAtsScore ?? 0}
                        size="lg"
                        className="w-full min-w-fit"
                      />

                      {activeAtsScore !== undefined
                        ? (() => {
                            const grade = getScoreLabel(activeAtsScore);
                            return grade ? (
                              <span
                                className={cn(
                                  "rounded-full border px-4 py-1.5 text-xs font-bold shadow-sm",
                                  grade.cls,
                                )}
                              >
                                {grade.label}
                              </span>
                            ) : null;
                          })()
                        : null}

                      {activeAnalysis?.summary ? (
                        <p className="text-center text-xs leading-5 text-muted-foreground">
                          {activeAnalysis.summary.length > 140
                            ? `${activeAnalysis.summary.slice(0, 140).trim()}…`
                            : activeAnalysis.summary}
                        </p>
                      ) : null}

                      {activeAtsScore !== undefined ||
                      activeAnalysis?.summary ? (
                        <CvInsightDialog
                          title={t("overallScore")}
                          description={t("reportTitle")}
                          triggerLabel={profileT("viewAll")}
                          bodyText={
                            activeAnalysis?.summary
                              ? `${t("atsScore")}: ${activeAtsScore ?? "--"}/100\n\n${activeAnalysis.summary}`
                              : `${t("atsScore")}: ${activeAtsScore ?? "--"}/100`
                          }
                          variant="footer"
                        />
                      ) : null}
                    </div>

                    {/* Breakdown Progress Bars */}
                    <div className="flex flex-col gap-6">
                      <ScoreMetricStrip entries={breakdownEntries} />

                      {breakdownEntries.length > 0 ? (
                        <div className="flex-1 rounded-2xl border border-border/60 bg-canvas/50 p-6 shadow-md backdrop-blur dark:border-border/40">
                          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            {t("scoreBreakdown")}
                          </p>
                          <div className="space-y-4">
                            {breakdownEntries.map((entry, i) => {
                              const color =
                                BREAKDOWN_TW_COLORS[
                                  i % BREAKDOWN_TW_COLORS.length
                                ];
                              return (
                                <div key={entry.key}>
                                  <div className="mb-1.5 flex items-center justify-between gap-3">
                                    <span className="text-sm font-medium text-foreground/80">
                                      {entry.label}
                                    </span>
                                    <span
                                      className={cn(
                                        "text-sm font-bold tabular-nums",
                                        color.text,
                                      )}
                                    >
                                      {entry.value}
                                    </span>
                                  </div>
                                  <div className="h-1.5 overflow-hidden rounded-full bg-muted/30">
                                    <div
                                      className={cn(
                                        "h-full rounded-full transition-all duration-700",
                                        color.bar,
                                      )}
                                      style={{
                                        width: `${Math.max(0, Math.min(100, entry.value))}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Row 2: Insight panels */}
                  <div className="grid gap-6 md:grid-cols-3">
                    <InsightListCard
                      title={t("strengths")}
                      icon={IconCheck}
                      items={activeAnalysis?.strengths ?? []}
                      emptyText={profileT("noStrengths")}
                      viewAllLabel={profileT("viewAll")}
                      variant="emerald"
                    />
                    <InsightListCard
                      title={t("weaknesses")}
                      icon={IconAlertTriangle}
                      items={activeAnalysis?.weaknesses ?? []}
                      emptyText={profileT("noWeaknesses")}
                      viewAllLabel={profileT("viewAll")}
                      variant="amber"
                    />
                    <InsightListCard
                      title={t("suggestionsTitle")}
                      icon={IconBulb}
                      items={activeAnalysis?.suggestions ?? []}
                      emptyText={profileT("noSuggestions")}
                      viewAllLabel={profileT("viewAll")}
                      variant="primary"
                    />
                  </div>

                  {/* Row 3: Contact strip */}
                  <ContactInfoCard
                    profileT={profileT}
                    email={activeAnalysis?.email}
                    phone={activeAnalysis?.phone}
                    linkedin={activeAnalysis?.linkedin}
                    github={activeAnalysis?.github}
                    location={activeAnalysis?.location}
                  />
                </div>
              ) : reportState === "failed" ? (
                <EmptyReportState
                  title={t("failedTitle")}
                  description={t("failedDescription")}
                />
              ) : reportState === "processing" ? (
                <EmptyReportState
                  title={t("processingTitle")}
                  description={t("processingDescription")}
                />
              ) : (
                <EmptyReportState
                  title={t("noAnalysisTitle")}
                  description={t("noAnalysisDescription")}
                />
              )}
            </div>

            {/* Right Area: Sticky Action Sidebar */}
            <aside className="col-span-1 lg:sticky sm:top-16 md:top-20 lg:top-25 lg:self-start space-y-6">
              <Card className="border border-border/60 bg-canvas/50 shadow-md backdrop-blur rounded-3xl p-5 dark:border-border/40">
                <CardHeader className="p-0 pb-4">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-lg font-bold text-foreground">
                      {t("uploadTitle")}
                    </CardTitle>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
                        getStatusTone(
                          selectedCv?.processingStatus,
                          uploadCv.isPending,
                        ),
                      )}
                    >
                      {previewStatus}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-0 space-y-4">
                  <label
                    htmlFor="cv-upload"
                    className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all border-border/60 hover:border-primary/45 dark:hover:border-sky/45 bg-canvas/30 hover:bg-canvas/60"
                  >
                    {previewName ? (
                      <div className="flex min-h-[140px] flex-col items-center justify-center text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/8 text-primary dark:border-sky/15 dark:bg-sky/10 dark:text-sky">
                          <IconFileText className="size-6" />
                        </div>
                        <p className="mt-4 break-all text-sm font-semibold text-foreground">
                          {previewName}
                        </p>
                        {previewSize ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {previewSize}
                          </p>
                        ) : null}
                        <p className="mt-3 text-xs font-semibold text-primary dark:text-sky hover:underline">
                          {t("chooseFile")}
                        </p>
                      </div>
                    ) : (
                      <div className="flex min-h-[140px] flex-col items-center justify-center text-center">
                        <div className="flex size-14 items-center justify-center rounded-2xl border border-border/60 bg-canvas/60 text-muted-foreground">
                          <IconUpload className="size-6" />
                        </div>
                        <p className="mt-4 text-sm font-semibold text-foreground">
                          {t("uploadTitle")}
                        </p>
                        <p className="mt-1 max-w-[200px] text-xs leading-relaxed text-muted-foreground">
                          {t("uploadToStart")}
                        </p>
                        <p className="mt-3 text-xs font-semibold text-primary dark:text-sky hover:underline">
                          {t("chooseFile")}
                        </p>
                      </div>
                    )}
                  </label>

                  <input
                    id="cv-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onClick={(event) => {
                      event.currentTarget.value = "";
                    }}
                    onChange={(event) =>
                      handleFileChange(event.target.files?.[0] ?? null)
                    }
                  />

                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="h-11 rounded-xl border-border/60 bg-background/50 hover:bg-muted/40"
                      onClick={handleUpload}
                      disabled={
                        !file || uploadCv.isPending || analyzeCv.isPending
                      }
                    >
                      {uploadCv.isPending ? (
                        <>
                          <ScaleLoader size="sm" />
                          <span className="ml-1.5">{t("uploading")}</span>
                        </>
                      ) : (
                        <>
                          <IconUpload className="size-4 mr-1.5" />
                          {t("uploadTitle")}
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      size="lg"
                      className="h-11 rounded-xl bg-primary text-white hover:bg-primary/95 dark:bg-sky/40 dark:text-zinc-200 dark:hover:bg-sky/60"
                      onClick={handleAnalyze}
                      disabled={
                        !readyToAnalyzeCvId ||
                        uploadCv.isPending ||
                        analyzeCv.isPending ||
                        analyzeCv.isTokenLimitReached
                      }
                    >
                      {analyzeCv.isPending || isAwaitingAnalysis ? (
                        <>
                          <ScaleLoader
                            size="sm"
                            className="text-white dark:text-sky"
                          />
                          <span className="ml-1.5 text-sm">
                            {t("analyzing")}
                          </span>
                        </>
                      ) : (
                        <>
                          <IconSparkles className="size-4 mr-1.5" />
                          {t("analyze")}
                        </>
                      )}
                    </Button>
                  </div>

                  {analyzeCv.tokenLimitError?.message ? (
                    <p className="text-xs font-medium text-destructive mt-1">
                      {analyzeCv.tokenLimitError.message}
                    </p>
                  ) : null}

                  {sortedCvs.length > 0 ? (
                    <div className="relative space-y-3 rounded-2xl border border-border/60 bg-canvas/30 p-4">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                          {profileT("myCvs")}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {profileT("selectCvHint")}
                        </p>
                      </div>

                      <div className="grid gap-2 max-h-40 sm:max-h-56 md:max-h-72 overflow-y-auto pr-1">
                        {sortedCvs.map((cv, index) => {
                          const cvId = getCvId(cv, index);
                          const isSelected = selectedCvId
                            ? selectedCvId === cvId
                            : index === 0;

                          return (
                            <button
                              key={cvId}
                              type="button"
                              onClick={() => setSelectedCvId(cvId)}
                              className={cn(
                                "flex flex-1 items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition-all duration-300",
                                isSelected
                                  ? "border-primary bg-primary/5 dark:border-sky dark:bg-sky/10 shadow-sm"
                                  : "border-border/60 bg-canvas/40 hover:border-primary/30 dark:hover:border-sky/30 hover:bg-canvas/60",
                              )}
                            >
                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-foreground">
                                  {getCvTitle(cv)}
                                </p>
                                <p className="mt-0.5 text-[10px] text-muted-foreground">
                                  {formatFileSize(cv.originalFile?.fileSize)}
                                </p>
                              </div>
                              <span
                                className={cn(
                                  "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                                  getStatusTone(cv.processingStatus),
                                )}
                              >
                                {profileT(
                                  `status.${cv.processingStatus ?? "uploaded"}`,
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-1">
                    <IconFileText className="size-3.5 shrink-0" />
                    <span>{t("fileHint")}</span>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>

          {/* How it Works / Process */}
          <section className="mt-20">
            <div className="mb-10 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary dark:text-sky">
                {t("process")}
              </p>
              <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {t("howItWorks")}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-muted-foreground">
                {t("howItWorksSubtitle")}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {/* Step 01 */}
              <div className="relative flex items-start gap-4 rounded-2xl border border-border/60 bg-canvas/40 p-5 shadow-sm dark:border-border/40">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/8 text-primary dark:border-sky/20 dark:bg-sky/10 dark:text-sky">
                  <IconUpload className="size-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {t("steps.step1")}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {t("steps.step1Title")}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {t("steps.step1Desc")}
                  </p>
                </div>
                <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 text-muted-foreground/30 text-xl select-none">
                  ›
                </div>
              </div>

              {/* Step 02 */}
              <div className="relative flex items-start gap-4 rounded-2xl border border-border/60 bg-canvas/40 p-5 shadow-sm dark:border-border/40">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/8 text-primary dark:border-sky/20 dark:bg-sky/10 dark:text-sky">
                  <IconSparkles className="size-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {t("steps.step2")}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {t("steps.step2Title")}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {t("steps.step2Desc")}
                  </p>
                </div>
                <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 text-muted-foreground/30 text-xl select-none">
                  ›
                </div>
              </div>

              {/* Step 03 */}
              <div className="flex items-start gap-4 rounded-2xl border border-border/60 bg-canvas/40 p-5 shadow-sm dark:border-border/40">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/8 text-primary dark:border-sky/20 dark:bg-sky/10 dark:text-sky">
                  <IconCheck className="size-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {t("steps.step3")}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {t("steps.step3Title")}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {t("steps.step3Desc")}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </RequireRole>
  );
}
