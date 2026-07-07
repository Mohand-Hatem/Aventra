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
    <Card className="min-h-72 border border-border/60 bg-card/70 shadow-card backdrop-blur">
      <CardContent className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/8 text-primary dark:border-sky/20 dark:bg-sky/10 dark:text-sky">
          <IconSparkles className="size-6" />
        </div>
        <h3 className="mt-5 text-3xl font-semibold tracking-tight">{title}</h3>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

/* ───────────────────────────────── helpers ── */
const BREAKDOWN_TW_COLORS = [
  { bar: "bg-violet-500", text: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/40" },
  { bar: "bg-sky-500",    text: "text-sky-600    dark:text-sky-400",    bg: "bg-sky-50    dark:bg-sky-950/40" },
  { bar: "bg-emerald-500",text: "text-emerald-600 dark:text-emerald-400",bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  { bar: "bg-amber-500",  text: "text-amber-600  dark:text-amber-400",  bg: "bg-amber-50  dark:bg-amber-950/40" },
  { bar: "bg-rose-500",   text: "text-rose-600   dark:text-rose-400",   bg: "bg-rose-50   dark:bg-rose-950/40" },
];

function getScoreLabel(score?: number) {
  if (score === undefined) return null;
  if (score >= 85) return { label: "Excellent", cls: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800" };
  if (score >= 70) return { label: "Good",      cls: "text-sky-600    dark:text-sky-400    bg-sky-50    dark:bg-sky-950/50    border-sky-200    dark:border-sky-800" };
  if (score >= 55) return { label: "Fair",       cls: "text-amber-600  dark:text-amber-400  bg-amber-50  dark:bg-amber-950/50  border-amber-200  dark:border-amber-800" };
  return                { label: "Needs Work",   cls: "text-rose-600   dark:text-rose-400   bg-rose-50   dark:bg-rose-950/50   border-rose-200   dark:border-rose-800" };
}

/* ─── Score Metric Strip ── */
function ScoreMetricStrip({
  entries,
}: {
  entries: Array<{ key: string; label: string; value: number }>;
}) {
  if (entries.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {entries.map((entry, i) => {
        const color = BREAKDOWN_TW_COLORS[i % BREAKDOWN_TW_COLORS.length];
        return (
          <div
            key={entry.key}
            className={cn(
              "flex flex-col gap-1.5 rounded-xl border p-4",
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
                className={cn("h-full rounded-full transition-all duration-700", color.bar)}
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
      dot:  "bg-emerald-500",
      badge:"text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50",
      border:"border-l-emerald-500",
    },
    amber: {
      icon: "text-amber-600 dark:text-amber-400",
      dot:  "bg-amber-500",
      badge:"text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50",
      border:"border-l-amber-500",
    },
    primary: {
      icon: "text-primary dark:text-sky",
      dot:  "bg-primary dark:bg-sky",
      badge:"text-primary dark:text-sky bg-primary/8 dark:bg-sky/10",
      border:"border-l-primary dark:border-l-sky",
    },
  };
  const v = variantMap[variant];

  return (
    <div className={cn(
      "flex flex-col rounded-xl border border-border/50 bg-card/80 backdrop-blur",
      "border-l-4", v.border,
    )}>
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <Icon className={cn("size-4 shrink-0", v.icon)} />
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        {items.length > 0 ? (
          <span className={cn("rounded-md px-2 py-0.5 text-xs font-semibold", v.badge)}>
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
              <li key={`${title}-${index}`} className="flex items-start gap-3 py-2.5">
                <span className={cn(
                  "mt-1.5 size-1.5 shrink-0 rounded-full",
                  v.dot,
                )} />
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
    email    ? { icon: IconMail,          label: profileT("emailLabel"),    value: email,     href: `mailto:${email}`,             external: false } : null,
    phone    ? { icon: IconPhone,         label: profileT("phoneLabel"),    value: phone,     href: `tel:${phone}`,                external: false } : null,
    linkedin ? { icon: IconBrandLinkedin, label: profileT("linkedinLabel"), value: "LinkedIn", href: ensureAbsoluteUrl(linkedin), external: true  } : null,
    github   ? { icon: IconBrandGithub,   label: profileT("githubLabel"),   value: "GitHub",  href: ensureAbsoluteUrl(github),   external: true  } : null,
    location ? { icon: IconMapPin,        label: profileT("locationLabel"), value: location,  href: undefined,                    external: false } : null,
  ].filter(Boolean) as { icon: typeof IconMail; label: string; value: string; href: string | undefined; external: boolean }[];

  if (!hasContact) return null;

  return (
    <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur">
      <div className="flex items-center gap-2 border-b border-border/40 px-5 py-3">
        <IconMail className="size-4 text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {profileT("contactInfo")}
        </span>
      </div>
      <div className="flex flex-wrap gap-0 divide-x divide-border/40">
        {items.map(({ icon: ItemIcon, label, value, href, external }) => (
          <div key={label} className="flex flex-col gap-0.5 px-5 py-3 min-w-[140px]">
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
                    <span className="text-sm font-medium text-foreground/85">{entry.label}</span>
                    <span className={cn("text-sm font-bold tabular-nums", color.text)}>
                      {entry.value}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted/50">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700 ease-out", color.bar)}
                      style={{ width: `${Math.max(0, Math.min(100, entry.value))}%` }}
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

export default function CVAnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedCv, setUploadedCv] = useState<NonNullable<UploadCvResponse["data"]> | null>(null);
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
      const matched = sortedCvs.find((cv, index) => getCvId(cv, index) === selectedCvId);
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
    (!trackedAnalysisCv || !isFinalAnalysisStatus(trackedAnalysisCv.processingStatus));

  useEffect(() => {
    if (!isAwaitingAnalysis && !(selectedCv?.processingStatus === "processing")) return;

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

  const previewStatus =
    uploadCv.isPending
      ? t("uploading")
      : hasInstantAnalysis
        ? t("statusAnalyzed")
      : analyzeCv.isPending || isAwaitingAnalysis
        ? t("analyzing")
      : file
        ? t("fileReady")
        : currentUploadedCv?.status === "uploaded" || displayCv?.processingStatus === "uploaded"
          ? t("statusUploaded")
        : displayCv?.processingStatus === "analyzed"
          ? t("statusAnalyzed")
          : displayCv?.processingStatus === "failed"
            ? t("failedTitle")
            : displayCv?.processingStatus && isAnalyzingStatus(displayCv.processingStatus)
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
    if (!readyToAnalyzeCvId || analyzeCv.isPending || analyzeCv.isTokenLimitReached) return;

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
      <div className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-radial from-primary/8 via-primary/4 to-transparent dark:from-sky/8 dark:via-primary/6" />
        <div className="pointer-events-none absolute right-0 bottom-0 -z-10 h-96 w-96 rounded-full bg-primary/6 blur-3xl dark:bg-sky/10" />

        <div className="mx-auto flex w-full max-w-7xl flex-col px-6 pb-24 pt-28 sm:px-8 lg:px-10">
          <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)] lg:items-start xl:grid-cols-[minmax(0,1.08fr)_minmax(380px,440px)]">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/7 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary dark:border-sky/15 dark:bg-sky/8 dark:text-sky">
                <IconSparkles className="size-3.5" />
                {t("uploadEyebrow")}
              </span>

              <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                {t("title")}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
                {t("subtitle")}
              </p>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1.5">
                  {t("fileHint")}
                </span>
                <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1.5">
                  {t("atsScore")}
                </span>
                <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1.5">
                  {t("suggestionsTitle")}
                </span>
              </div>
            </div>

            <Card className="border border-border/60 bg-card/80 shadow-card backdrop-blur lg:sticky lg:top-24">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardDescription className="text-[11px] font-semibold uppercase tracking-[0.2em]">
                      {t("uploadEyebrow")}
                    </CardDescription>
                    <CardTitle className="mt-2 text-xl">{t("uploadTitle")}</CardTitle>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-medium",
                      getStatusTone(selectedCv?.processingStatus, uploadCv.isPending),
                    )}
                  >
                    {previewStatus}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                <label
                  htmlFor="cv-upload"
                  className="block cursor-pointer rounded-[28px] border border-dashed border-border/70 bg-background/45 p-6 transition-colors hover:border-primary/35 dark:hover:border-sky/35"
                >
                  {previewName ? (
                    <div className="flex min-h-44 flex-col items-center justify-center text-center">
                      <div className="flex size-16 items-center justify-center rounded-2xl border border-primary/15 bg-primary/8 text-primary dark:border-sky/15 dark:bg-sky/10 dark:text-sky">
                        <IconFileText className="size-7" />
                      </div>
                      <p className="mt-5 text-lg font-medium text-foreground">
                        {previewName}
                      </p>
                      {previewSize ? (
                        <p className="mt-2 text-sm text-muted-foreground">{previewSize}</p>
                      ) : null}
                      <p className="mt-1 text-sm text-muted-foreground">{previewStatus}</p>
                      <p className="mt-3 text-xs font-medium text-primary dark:text-sky">
                        {t("chooseFile")}
                      </p>
                    </div>
                  ) : (
                    <div className="flex min-h-44 flex-col items-center justify-center text-center">
                      <div className="flex size-16 items-center justify-center rounded-2xl border border-border/70 bg-muted/35 text-muted-foreground">
                        <IconUpload className="size-7" />
                      </div>
                      <p className="mt-5 text-lg font-medium">{t("uploadTitle")}</p>
                      <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                        {t("uploadToStart")}
                      </p>
                      <p className="mt-3 text-xs font-medium text-primary dark:text-sky">
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
                  onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-12 rounded-2xl border-border/70 bg-background/70"
                    onClick={handleUpload}
                    disabled={!file || uploadCv.isPending || analyzeCv.isPending}
                  >
                    {uploadCv.isPending ? (
                      <>
                        <ScaleLoader size="sm" />
                        {t("uploading")}
                      </>
                    ) : (
                      <>
                        <IconUpload className="size-4" />
                        {t("uploadTitle")}
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    size="lg"
                    className="h-12 rounded-2xl"
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
                        <ScaleLoader size="sm" />
                        {t("analyzing")}
                      </>
                    ) : (
                      <>
                        <IconSparkles className="size-4" />
                        {t("analyze")}
                      </>
                    )}
                  </Button>
                </div>

                {analyzeCv.tokenLimitError?.message ? (
                  <p className="text-sm text-destructive">
                    {analyzeCv.tokenLimitError.message}
                  </p>
                ) : null}

                {sortedCvs.length > 0 ? (
                  <div className="space-y-3 rounded-2xl border border-border/60 bg-background/55 p-4">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {profileT("myCvs")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {profileT("selectCvHint")}
                      </p>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                      {sortedCvs.map((cv, index) => {
                        const cvId = getCvId(cv, index);
                        const isSelected = selectedCvId ? selectedCvId === cvId : index === 0;

                        return (
                          <button
                            key={cvId}
                            type="button"
                            onClick={() => setSelectedCvId(cvId)}
                            className={cn(
                              "flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-colors",
                              isSelected
                                ? "border-primary bg-primary/6 dark:border-sky dark:bg-sky/10"
                                : "border-border/60 bg-background/70 hover:border-primary/30 hover:bg-primary/4 dark:hover:border-sky/30 dark:hover:bg-sky/6",
                            )}
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-foreground">
                                {getCvTitle(cv)}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {formatFileSize(cv.originalFile?.fileSize)}
                              </p>
                            </div>

                            <span
                              className={cn(
                                "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium",
                                getStatusTone(cv.processingStatus),
                              )}
                            >
                              {profileT(`status.${cv.processingStatus ?? "uploaded"}`)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <p className="text-xs text-muted-foreground">{t("fileHint")}</p>
              </CardContent>
            </Card>
          </section>

          <section className="mt-16">
            <ReportSectionLabel>{t("reportEyebrow")}</ReportSectionLabel>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  {t("reportTitle")}
                </h2>
                {selectedCv ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t("latestAnalysis")}: {getCvTitle(selectedCv)}
                  </p>
                ) : null}
              </div>

              {hasAnalysis && activeCvUrl ? (
                <Button asChild variant="outline" className="rounded-full px-4">
                  <a href={activeCvUrl} target="_blank" rel="noreferrer">
                    {profileT("viewFile")}
                  </a>
                </Button>
              ) : null}
            </div>

            <div className="mt-8 space-y-6">
              {isLoading && !selectedCv ? (
                <Card className="min-h-72 border border-border/60 bg-card/70 shadow-card backdrop-blur">
                  <CardContent className="flex min-h-72 items-center justify-center">
                    <ScaleLoader size="md" className="text-muted-foreground" />
                  </CardContent>
                </Card>
              ) : reportState === "ready" ? (
                <div className="space-y-6">

                  {/* ══ Row 1: Score hero ══ */}
                  <div className="grid gap-5 lg:grid-cols-[280px_1fr]">

                    {/* ATS Score card — compact left column */}
                    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border/50 bg-card/80 p-6 backdrop-blur">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {t("overallScore")}
                      </p>

                      <AtsScoreChart score={activeAtsScore ?? 0} size="lg" className="w-full max-w-[180px]" />

                      {activeAtsScore !== undefined ? (() => {
                        const grade = getScoreLabel(activeAtsScore);
                        return grade ? (
                          <span className={cn(
                            "rounded-lg border px-4 py-1.5 text-sm font-semibold",
                            grade.cls,
                          )}>
                            {grade.label}
                          </span>
                        ) : null;
                      })() : null}

                      {activeAnalysis?.summary ? (
                        <p className="text-center text-xs leading-5 text-muted-foreground">
                          {activeAnalysis.summary.length > 140
                            ? `${activeAnalysis.summary.slice(0, 140).trim()}…`
                            : activeAnalysis.summary}
                        </p>
                      ) : null}

                      {activeAtsScore !== undefined || activeAnalysis?.summary ? (
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

                    {/* Right: metric strip + breakdown bars */}
                    <div className="flex flex-col gap-5">
                      {/* Metric scorecard chips */}
                      <ScoreMetricStrip entries={breakdownEntries} />

                      {/* Breakdown bars */}
                      {breakdownEntries.length > 0 ? (
                        <div className="flex-1 rounded-xl border border-border/50 bg-card/80 px-5 py-4 backdrop-blur">
                          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            {t("scoreBreakdown")}
                          </p>
                          <div className="space-y-3.5">
                            {breakdownEntries.map((entry, i) => {
                              const color = BREAKDOWN_TW_COLORS[i % BREAKDOWN_TW_COLORS.length];
                              return (
                                <div key={entry.key}>
                                  <div className="mb-1.5 flex items-center justify-between gap-3">
                                    <span className="text-sm font-medium text-foreground/80">{entry.label}</span>
                                    <span className={cn("text-sm font-bold tabular-nums", color.text)}>
                                      {entry.value}
                                    </span>
                                  </div>
                                  <div className="h-1.5 overflow-hidden rounded-full bg-muted/50">
                                    <div
                                      className={cn("h-full rounded-full transition-all duration-700", color.bar)}
                                      style={{ width: `${Math.max(0, Math.min(100, entry.value))}%` }}
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

                  {/* ══ Row 2: Insight panels ══ */}
                  <div className="grid gap-5 md:grid-cols-3">
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

                  {/* ══ Row 3: Contact strip ══ */}
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
          </section>
        </div>
      </div>
    </RequireRole>
  );
}










