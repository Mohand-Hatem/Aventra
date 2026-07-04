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
} from "@tabler/icons-react";
import { Cell, Pie, PieChart } from "recharts";
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
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import {
  useAnalyzeCv,
  useUploadCv,
  useUserCvs,
  type AnalyzeCvResponse,
  type UploadCvResponse,
} from "@/hooks/useCv";
import { cn } from "@/lib/utils";
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

function InsightListCard({
  title,
  icon: Icon,
  items,
  emptyText,
  viewAllLabel,
  accentClassName,
  badgeClassName,
  columns = 1,
}: {
  title: string;
  icon: typeof IconCheck;
  items: CvInsightItem[];
  emptyText: string;
  viewAllLabel: string;
  accentClassName: string;
  badgeClassName: string;
  columns?: 1 | 2;
}) {
  const previewItems = items.slice(0, columns === 2 ? 4 : 3);

  return (
    <Card className="border border-border/60 bg-card/80 shadow-card backdrop-blur">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
              badgeClassName,
            )}
          >
            <Icon className={cn("size-3.5", accentClassName)} />
            {title}
          </span>
          <span className="text-xs text-muted-foreground">{items.length}</span>
        </div>
      </CardHeader>
      <CardContent>
        {previewItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          <ul
            className={cn(
              "grid gap-0 divide-y divide-border/60",
              columns === 2 && "md:grid-cols-2 md:divide-x md:divide-y-0",
            )}
          >
            {previewItems.map((item, index) => (
              <li key={`${title}-${index}`} className="py-4">
                <div className="flex items-start gap-3">
                  <span className="min-w-7 text-[11px] font-medium tracking-[0.16em] text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm leading-6 text-foreground/92">
                    {formatInsightLabel(item)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {items.length > 0 ? (
          <CvInsightDialog
            title={title}
            triggerLabel={viewAllLabel}
            items={items}
            variant="footer"
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

function BreakdownCard({
  title,
  subtitle,
  emptyText,
  entries,
  averageLabel,
}: {
  title: string;
  subtitle: string;
  emptyText: string;
  entries: Array<{ key: string; label: string; value: number; color: string }>;
  averageLabel: string;
}) {
  const chartConfig = useMemo(
    () =>
      entries.reduce<ChartConfig>((config, entry) => {
        config[entry.key] = {
          label: entry.label,
          color: entry.color,
        };
        return config;
      }, {}),
    [entries],
  );
  const averageScore =
    entries.length > 0
      ? Math.round(
          entries.reduce((total, entry) => total + entry.value, 0) / entries.length,
        )
      : 0;

  return (
    <Card className="h-full border border-border/60 bg-card/80 shadow-card backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {entries.length === 0 ? (
          <div className="flex min-h-64 flex-1 items-center justify-center text-center text-sm text-muted-foreground">
            <p className="max-w-sm">{emptyText}</p>
          </div>
        ) : (
          <div className="grid flex-1 gap-6 lg:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.1fr)] xl:gap-8">
            <div className="flex min-h-88 flex-col justify-between rounded-[1.75rem] border border-border/60 bg-background/55 p-6 sm:p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {title}
                </p>
                <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                  {subtitle}
                </p>
              </div>

              <div className="flex flex-1 items-center justify-center py-6">
                <div className="relative mx-auto aspect-square w-full max-w-72">
                  <ChartContainer
                    config={chartConfig}
                    className="h-full w-full"
                  >
                    <PieChart>
                      <Pie
                        data={entries}
                        dataKey="value"
                        nameKey="key"
                        innerRadius={66}
                        outerRadius={108}
                        paddingAngle={4}
                        startAngle={90}
                        endAngle={-270}
                        strokeWidth={0}
                      >
                        {entries.map((entry) => (
                          <Cell key={entry.key} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>

                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span dir="ltr" className="text-4xl font-semibold tracking-tight text-foreground">
                      {averageScore}
                    </span>
                    <span className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      {averageLabel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {entries.map((entry) => (
                  <span
                    key={`${entry.key}-chip`}
                    className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/75 px-3 py-1.5 text-xs text-foreground/85"
                  >
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    {entry.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-center gap-4 self-stretch">
              {entries.map((entry) => (
                <div
                  key={entry.key}
                  className="rounded-2xl border border-border/60 bg-background/45 p-4 sm:p-5"
                >
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="font-medium text-foreground/90">{entry.label}</span>
                    </div>
                    <span
                      dir="ltr"
                      className="rounded-full border border-border/60 bg-background/75 px-2.5 py-1 text-xs font-semibold text-foreground/85"
                    >
                      {entry.value}
                    </span>
                  </div>
                  <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted/70">
                    <div
                      className="h-full rounded-full transition-[width]"
                      style={{
                        width: `${Math.max(0, Math.min(100, entry.value))}%`,
                        backgroundColor: entry.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
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
    if (!readyToAnalyzeCvId || analyzeCv.isPending) return;

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
                    disabled={!readyToAnalyzeCvId || uploadCv.isPending || analyzeCv.isPending}
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
                <>
                  <div className="grid items-stretch gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
                    <Card className="h-full border border-border/60 bg-card/80 shadow-card backdrop-blur">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between gap-3">
                          <CardDescription className="text-[11px] font-semibold uppercase tracking-[0.2em]">
                            {t("overallScore")}
                          </CardDescription>
                          {activeAtsScore !== undefined ? (
                            <span
                              className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                              style={{
                                color:
                                  activeAtsScore >= 80
                                    ? "#22c55e"
                                    : activeAtsScore >= 60
                                      ? "#38bdf8"
                                      : "#f59e0b",
                                backgroundColor:
                                  activeAtsScore >= 80
                                    ? "rgba(34, 197, 94, 0.12)"
                                    : activeAtsScore >= 60
                                      ? "rgba(56, 189, 248, 0.12)"
                                      : "rgba(245, 158, 11, 0.12)",
                              }}
                            >
                              {activeAtsScore}/100
                            </span>
                          ) : null}
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-1 flex-col justify-center pb-8">
                        <AtsScoreChart score={activeAtsScore ?? 0} size="lg" className="mx-auto w-full max-w-sm" />
                        <p className="mx-auto mt-6 max-w-sm text-center text-sm leading-6 text-muted-foreground">
                          {activeAnalysis?.summary || t("readyDescription")}
                        </p>
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
                      </CardContent>
                    </Card>

                    <BreakdownCard
                      title={t("scoreBreakdown")}
                      subtitle={t("categoriesCount", {
                        count: breakdownEntries.length,
                      })}
                      emptyText={t("breakdownUnavailable")}
                      entries={breakdownEntries}
                      averageLabel={t("averageScore")}
                    />
                  </div>

                  <div className="grid items-stretch gap-6 xl:grid-cols-2">
                    <InsightListCard
                      title={t("strengths")}
                      icon={IconCheck}
                      items={activeAnalysis?.strengths ?? []}
                      emptyText={profileT("noStrengths")}
                      viewAllLabel={profileT("viewAll")}
                      accentClassName="text-emerald-500"
                      badgeClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    />

                    <InsightListCard
                      title={t("weaknesses")}
                      icon={IconAlertTriangle}
                      items={activeAnalysis?.weaknesses ?? []}
                      emptyText={profileT("noWeaknesses")}
                      viewAllLabel={profileT("viewAll")}
                      accentClassName="text-amber-500"
                      badgeClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    />

                    <div className="xl:col-span-2">
                      <InsightListCard
                        title={t("suggestionsTitle")}
                        icon={IconBulb}
                        items={activeAnalysis?.suggestions ?? []}
                        emptyText={profileT("noSuggestions")}
                        viewAllLabel={profileT("viewAll")}
                        accentClassName="text-primary dark:text-sky"
                        badgeClassName="bg-primary/10 text-primary dark:bg-sky/10 dark:text-sky"
                        columns={2}
                      />
                    </div>
                  </div>
                </>
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










